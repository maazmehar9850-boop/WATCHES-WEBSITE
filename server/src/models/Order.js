const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema(
  {
    stage: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    completed: { type: Boolean, default: true },
    at: { type: Date, default: Date.now },
  },
  { _id: true }
);

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  price: Number,
  quantity: { type: Number, required: true, min: 1 },
});

const ORDER_STAGES = [
  'Order Placed',
  'Payment Received',
  'Order Confirmed',
  'Preparing Package',
  'Packed',
  'Picked Up by Courier',
  'In Transit',
  'Arrived at Local Hub',
  'Out for Delivery',
  'Delivered',
];

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    guestEmail: { type: String, default: '' },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'Pakistan' },
    },
    paymentMethod: {
      type: String,
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    paymentId: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    // High-level status for filters
    status: {
      type: String,
      enum: [
        'Pending',
        'Confirmed',
        'Packed',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled',
        'Refunded',
        'Processing', // legacy
      ],
      default: 'Pending',
    },
    currentStage: { type: String, default: 'Order Placed' },
    timeline: [timelineEventSchema],
    estimatedDelivery: Date,
    courier: { type: mongoose.Schema.Types.ObjectId, ref: 'Courier' },
    courierName: { type: String, default: '' },
    trackingNumber: { type: String, default: '', index: true },
    currentLocation: { type: String, default: 'Warehouse' },
    vehicleDetails: { type: String, default: '' },
    courierEmployee: { type: String, default: '' },
    shipmentNotes: { type: String, default: '' },
    deliveredAt: Date,
    cancelledAt: Date,
    cancelReason: { type: String, default: '' },
    refundedAt: Date,
    invoiceNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.statics.ORDER_STAGES = ORDER_STAGES;

const Order = mongoose.model('Order', orderSchema);
Order.ORDER_STAGES = ORDER_STAGES;

module.exports = Order;
