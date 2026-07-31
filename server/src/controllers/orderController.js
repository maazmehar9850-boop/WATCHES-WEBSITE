const Order = require('../models/Order');
const Product = require('../models/Product');
const Courier = require('../models/Courier');
const AppError = require('../utils/AppError');
const { sendOrderEmail } = require('../utils/sendEmail');
const {
  generateOrderNumber,
  generateTrackingNumber,
  generateInvoiceNumber,
  getEstimatedDelivery,
  addTimelineEvent,
} = require('../utils/orderHelpers');

const calcPrices = (items) => {
  const itemsPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice > 50000 ? 0 : 500;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

const STAGE_MAP = {
  confirm: {
    status: 'Confirmed',
    stage: 'Order Confirmed',
    email: 'order_confirmed',
    description: 'Your order has been confirmed by our team.',
  },
  prepare: {
    status: 'Confirmed',
    stage: 'Preparing Package',
    email: 'status_update',
    description: 'We are preparing your package.',
  },
  pack: {
    status: 'Packed',
    stage: 'Packed',
    email: 'packed',
    description: 'Your package is packed and sealed.',
  },
  pickup: {
    status: 'Shipped',
    stage: 'Picked Up by Courier',
    email: 'shipped',
    description: 'Courier has picked up your package.',
  },
  transit: {
    status: 'Shipped',
    stage: 'In Transit',
    email: 'status_update',
    description: 'Your package is in transit.',
  },
  hub: {
    status: 'Shipped',
    stage: 'Arrived at Local Hub',
    email: 'status_update',
    description: 'Package arrived at the local delivery hub.',
  },
  out: {
    status: 'Out for Delivery',
    stage: 'Out for Delivery',
    email: 'out_for_delivery',
    description: 'Your package is out for delivery.',
  },
  deliver: {
    status: 'Delivered',
    stage: 'Delivered',
    email: 'delivered',
    description: 'Package delivered successfully.',
  },
  cancel: {
    status: 'Cancelled',
    stage: 'Cancelled',
    email: 'cancelled',
    description: 'Order has been cancelled.',
  },
  refund: {
    status: 'Refunded',
    stage: 'Refunded',
    email: 'refunded',
    description: 'Refund has been processed.',
  },
};

// @desc    Create order (guest or logged-in)
exports.createOrder = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, guestEmail } = req.body;
    if (!orderItems?.length) return next(new AppError('No order items', 400));
    if (!shippingAddress?.fullName || !shippingAddress?.phone || !shippingAddress?.street) {
      return next(new AppError('Please complete shipping details', 400));
    }

    const items = [];
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return next(new AppError(`Product not found: ${item.name || item.product}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new AppError(`Insufficient stock for ${product.name}`, 400));
      }
      items.push({
        product: product._id,
        name: product.name,
        image: product.images[0] || '',
        price: product.price,
        quantity: item.quantity,
      });
    }

    const prices = calcPrices(items);
    const orderNumber = await generateOrderNumber();

    const orderData = {
      orderNumber,
      invoiceNumber: generateInvoiceNumber(orderNumber),
      orderItems: items,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'Pending',
      guestEmail: guestEmail || shippingAddress.email || '',
      estimatedDelivery: getEstimatedDelivery(5),
      currentLocation: 'Warehouse',
      currentStage: 'Order Placed',
      status: 'Pending',
      ...prices,
      isPaid: false,
      timeline: [],
    };

    if (req.user?._id) orderData.user = req.user._id;

    const order = await Order.create(orderData);

    addTimelineEvent(order, {
      stage: 'Order Placed',
      title: 'Order Placed',
      description: `Order ${orderNumber} received · Cash on Delivery.`,
      location: 'Online Store',
    });

    await order.save();

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, sold: item.quantity },
      });
    }

    sendOrderEmail('order_placed', order).catch(() => {});

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('courier', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('courier', 'name code phone hubs');
    if (!order) return next(new AppError('Order not found', 404));
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/** Public track by order number or tracking number */
exports.trackOrder = async (req, res, next) => {
  try {
    const q = (req.query.id || req.params.id || '').trim();
    if (!q) return next(new AppError('Provide order ID or tracking number', 400));

    const filter = {
      $or: [{ orderNumber: q.toUpperCase() }, { orderNumber: q }, { trackingNumber: q }],
    };
    if (/^[a-f\d]{24}$/i.test(q)) filter.$or.push({ _id: q });

    const order = await Order.findOne(filter).populate('courier', 'name code phone hubs');
    if (!order) return next(new AppError('Order not found. Check your Order ID.', 404));

    const { ORDER_STAGES } = require('../models/Order');
    const stages = ORDER_STAGES;
    const done = new Set(order.timeline.map((t) => t.stage));
    const progressIdx = stages.reduce((acc, s, i) => (done.has(s) ? i + 1 : acc), 0);
    const progress = Math.round((progressIdx / stages.length) * 100);

    res.json({
      success: true,
      order,
      tracking: {
        orderNumber: order.orderNumber,
        status: order.status,
        currentStage: order.currentStage,
        currentLocation: order.currentLocation,
        courierName: order.courierName || order.courier?.name || '',
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        timeline: order.timeline,
        stages,
        progress,
        lastUpdated: order.updatedAt,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems,
        totalPrice: order.totalPrice,
        vehicleDetails: order.vehicleDetails,
        courierEmployee: order.courierEmployee,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, search, paymentStatus, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { trackingNumber: new RegExp(search, 'i') },
        { guestEmail: new RegExp(search, 'i') },
        { 'shippingAddress.fullName': new RegExp(search, 'i') },
        { 'shippingAddress.phone': new RegExp(search, 'i') },
      ];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .populate('courier', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, orders, total, page: Number(page) });
  } catch (error) {
    next(error);
  }
};

/** Admin quick action: confirm | pack | ship | out | deliver | cancel | refund | prepare | pickup | transit | hub */
exports.orderAction = async (req, res, next) => {
  try {
    const { action, location, note, cancelReason, trackingNumber, courierId, employee, vehicle } =
      req.body;
    const key = (action || '').toLowerCase();
    const map = STAGE_MAP[key];
    if (!map) return next(new AppError('Invalid action', 400));

    const order = await Order.findById(req.params.id).populate('courier');
    if (!order) return next(new AppError('Order not found', 404));

    if (location) order.currentLocation = location;
    if (note) order.shipmentNotes = note;
    if (employee) order.courierEmployee = employee;
    if (vehicle) order.vehicleDetails = vehicle;

    if (courierId) {
      const courier = await Courier.findById(courierId);
      if (courier) {
        order.courier = courier._id;
        order.courierName = courier.name;
        if (!order.trackingNumber) {
          order.trackingNumber = trackingNumber || generateTrackingNumber(courier.code);
        }
      }
    } else if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    if (key === 'ship' || key === 'pickup') {
      if (!order.trackingNumber) {
        order.trackingNumber = generateTrackingNumber(
          order.courierName?.slice(0, 2).toUpperCase() || 'LX'
        );
      }
      if (!order.courierName) order.courierName = order.courierName || 'LuxeWatch Express';
      if (!location) order.currentLocation = order.currentLocation || 'Warehouse — Dispatch';
    }

    order.status = map.status;
    addTimelineEvent(order, {
      stage: map.stage,
      title: map.stage,
      description: note || map.description,
      location: order.currentLocation,
    });

    if (key === 'deliver') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod') {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentStatus = 'Paid';
        addTimelineEvent(order, {
          stage: 'Payment Received',
          title: 'Payment Received',
          description: 'Cash collected on delivery.',
          location: order.currentLocation,
        });
      }
    }

    if (key === 'cancel') {
      order.cancelledAt = new Date();
      order.cancelReason = cancelReason || note || '';
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity, sold: -item.quantity },
        });
      }
    }

    if (key === 'refund') {
      order.refundedAt = new Date();
      order.paymentStatus = 'Refunded';
    }

    await order.save();
    sendOrderEmail(map.email, order, { stage: map.stage, description: map.description }).catch(
      () => {}
    );

    const populated = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('courier', 'name code');

    res.json({ success: true, order: populated, message: `Order ${map.stage}` });
  } catch (error) {
    next(error);
  }
};

/** Admin: update tracking / location without changing stage */
exports.updateTracking = async (req, res, next) => {
  try {
    const {
      trackingNumber,
      currentLocation,
      courierId,
      courierName,
      courierEmployee,
      vehicleDetails,
      estimatedDelivery,
      stage,
      description,
      notify,
    } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));

    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (currentLocation) order.currentLocation = currentLocation;
    if (courierName) order.courierName = courierName;
    if (courierEmployee !== undefined) order.courierEmployee = courierEmployee;
    if (vehicleDetails !== undefined) order.vehicleDetails = vehicleDetails;
    if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

    if (courierId) {
      const courier = await Courier.findById(courierId);
      if (courier) {
        order.courier = courier._id;
        order.courierName = courier.name;
      }
    }

    if (stage) {
      addTimelineEvent(order, {
        stage,
        title: stage,
        description: description || `Location update: ${currentLocation || order.currentLocation}`,
        location: currentLocation || order.currentLocation,
      });
    }

    await order.save();

    if (notify !== false && (stage || currentLocation)) {
      sendOrderEmail('status_update', order, {
        stage: stage || order.currentStage,
        description: description || `Now at ${order.currentLocation}`,
      }).catch(() => {});
    }

    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return next(new AppError('Order not found', 404));
    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      order.currentStage = 'Delivered';
    }
    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

/** Invoice JSON for PDF generation on client */
exports.getInvoice = async (req, res, next) => {
  try {
    const q = req.params.id;
    const filter = { $or: [{ orderNumber: q }, { orderNumber: q?.toUpperCase?.() }] };
    if (/^[a-f\d]{24}$/i.test(q)) filter.$or.push({ _id: q });

    const order = await Order.findOne(filter);
    if (!order) return next(new AppError('Order not found', 404));

    res.json({
      success: true,
      invoice: {
        invoiceNumber: order.invoiceNumber || generateInvoiceNumber(order.orderNumber),
        orderNumber: order.orderNumber,
        date: order.createdAt,
        customer: order.shippingAddress,
        email: order.guestEmail,
        items: order.orderItems,
        itemsPrice: order.itemsPrice,
        shippingPrice: order.shippingPrice,
        taxPrice: order.taxPrice,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        status: order.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
