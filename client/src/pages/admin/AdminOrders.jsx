import { Fragment, useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  Truck,
  MapPin,
  Package,
  RefreshCw,
  X,
} from 'lucide-react';
import api, { formatPrice } from '../../api/axios';
import { downloadInvoicePdf } from '../../utils/invoice.js';

const ORDER_STATUSES = [
  '',
  'Pending',
  'Confirmed',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Refunded',
];

const PAYMENT_STATUSES = ['', 'Pending', 'Paid', 'Failed', 'Refunded'];

const LOCATION_PICKS = [
  'Warehouse',
  'Lahore Hub',
  'Islamabad Hub',
  'Rawalpindi',
  'Out for Delivery',
];

const PRIMARY_ACTIONS = [
  { key: 'confirm', label: 'Confirm Order', variant: 'primary' },
  { key: 'pack', label: 'Pack Order', variant: 'primary' },
  { key: 'ship', label: 'Ship Order', variant: 'primary' },
  { key: 'out', label: 'Out for Delivery', variant: 'primary' },
  { key: 'deliver', label: 'Delivered', variant: 'primary' },
  { key: 'cancel', label: 'Cancel Order', variant: 'danger' },
  { key: 'refund', label: 'Refund', variant: 'danger' },
];

const SECONDARY_ACTIONS = [
  { key: 'prepare', label: 'Prepare' },
  { key: 'pickup', label: 'Pickup' },
  { key: 'transit', label: 'In Transit' },
  { key: 'hub', label: 'At Hub' },
];

const statusBadgeClass = (status) => {
  const map = {
    Pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    Confirmed: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    Packed: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    Shipped: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
    'Out for Delivery': 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
    Delivered: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    Cancelled: 'bg-red-500/15 text-red-600 dark:text-red-400',
    Refunded: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  };
  return map[status] || 'bg-gold/15 text-gold';
};

const paymentBadgeClass = (status) => {
  const map = {
    Pending: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    Paid: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    Failed: 'bg-red-500/15 text-red-600 dark:text-red-400',
    Refunded: 'bg-slate-500/15 text-slate-600 dark:text-slate-400',
  };
  return map[status] || 'bg-gold/15 text-gold';
};

const emptyShipForm = {
  courierId: '',
  location: 'Warehouse',
  employee: '',
  vehicle: '',
  trackingNumber: '',
};

const emptyTrackingForm = {
  currentLocation: '',
  stage: '',
  description: '',
  courierId: '',
  trackingNumber: '',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [shipForm, setShipForm] = useState(emptyShipForm);
  const [trackingForm, setTrackingForm] = useState(emptyTrackingForm);
  const [cancelReason, setCancelReason] = useState('');
  const [showShipForm, setShowShipForm] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter) params.set('status', statusFilter);
    if (paymentFilter) params.set('paymentStatus', paymentFilter);

    api
      .get(`/orders?${params.toString()}`)
      .then((r) => setOrders(r.data.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [search, statusFilter, paymentFilter]);

  const fetchCouriers = useCallback(() => {
    api
      .get('/couriers')
      .then((r) => setCouriers((r.data.couriers || []).filter((c) => c.isActive !== false)))
      .catch(() => toast.error('Failed to load couriers'));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  const updateOrderInList = (updated) => {
    setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
  };

  const toggleExpand = (order) => {
    if (expandedId === order._id) {
      setExpandedId(null);
      setShowShipForm(false);
      setShipForm(emptyShipForm);
      setTrackingForm(emptyTrackingForm);
      setCancelReason('');
      return;
    }
    setExpandedId(order._id);
    setShowShipForm(false);
    setShipForm({
      ...emptyShipForm,
      courierId: order.courier?._id || order.courier || '',
      location: order.currentLocation || 'Warehouse',
      employee: order.courierEmployee || '',
      vehicle: order.vehicleDetails || '',
      trackingNumber: order.trackingNumber || '',
    });
    setTrackingForm({
      currentLocation: order.currentLocation || '',
      stage: order.currentStage || '',
      description: '',
      courierId: order.courier?._id || order.courier || '',
      trackingNumber: order.trackingNumber || '',
    });
    setCancelReason('');
  };

  const runAction = async (orderId, action, extra = {}) => {
    setActionLoading(`${orderId}-${action}`);
    try {
      const res = await api.post(`/orders/${orderId}/action`, { action, ...extra });
      updateOrderInList(res.data.order);
      toast.success(res.data.message || 'Order updated');
      if (action === 'ship') setShowShipForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrimaryAction = (order, actionKey) => {
    if (actionKey === 'ship') {
      setShowShipForm(true);
      return;
    }
    if (actionKey === 'cancel') {
      const reason = cancelReason.trim();
      if (!reason) {
        toast.error('Please enter a cancel reason');
        return;
      }
      runAction(order._id, 'cancel', { cancelReason: reason });
      return;
    }
    runAction(order._id, actionKey);
  };

  const handleShipSubmit = (orderId) => {
    if (!shipForm.courierId) {
      toast.error('Select a courier');
      return;
    }
    runAction(orderId, 'ship', {
      courierId: shipForm.courierId,
      location: shipForm.location,
      employee: shipForm.employee,
      vehicle: shipForm.vehicle,
      trackingNumber: shipForm.trackingNumber || undefined,
    });
  };

  const handleUpdateTracking = async (orderId) => {
    if (!trackingForm.currentLocation && !trackingForm.stage) {
      toast.error('Enter location or stage');
      return;
    }
    setActionLoading(`${orderId}-tracking`);
    try {
      const res = await api.put(`/orders/${orderId}/tracking`, {
        currentLocation: trackingForm.currentLocation || undefined,
        stage: trackingForm.stage || undefined,
        description: trackingForm.description || undefined,
        courierId: trackingForm.courierId || undefined,
        trackingNumber: trackingForm.trackingNumber || undefined,
        notify: true,
      });
      updateOrderInList(res.data.order);
      toast.success('Tracking updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadInvoice = async (orderNumber) => {
    setInvoiceLoading(orderNumber);
    try {
      const res = await api.get(`/orders/invoice/${orderNumber}`);
      downloadInvoicePdf(res.data.invoice);
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download invoice');
    } finally {
      setInvoiceLoading(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const customerName = (order) =>
    order.user?.name || order.shippingAddress?.fullName || 'Guest';

  const customerEmail = (order) =>
    order.user?.email || order.guestEmail || order.shippingAddress?.email || '—';

  const customerPhone = (order) => order.shippingAddress?.phone || '—';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl md:text-4xl mb-1">Orders</h1>
        <p className="text-slate-mute text-sm">
          Manage orders, shipping, tracking, and invoices
        </p>
      </div>

      <form onSubmit={handleSearchSubmit} className="glass p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs tracking-wider uppercase text-slate-mute block mb-1">
            Search
          </label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-mute" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order #, tracking, name, phone, email..."
              className="input-field pl-9 w-full"
            />
          </div>
        </div>
        <div className="min-w-[140px]">
          <label className="text-xs tracking-wider uppercase text-slate-mute block mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-full"
          >
            <option value="">All statuses</option>
            {ORDER_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px]">
          <label className="text-xs tracking-wider uppercase text-slate-mute block mb-1">
            Payment
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input-field w-full"
          >
            <option value="">All payments</option>
            {PAYMENT_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">
          <Search size={16} /> Filter
        </button>
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setStatusFilter('');
            setPaymentFilter('');
          }}
          className="btn-outline"
        >
          <RefreshCw size={16} /> Reset
        </button>
      </form>

      <div className="glass overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-mute">Loading orders...</p>
        ) : orders.length === 0 ? (
          <p className="p-6 text-slate-mute">No orders found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs tracking-wider uppercase text-slate-mute border-b border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
                  <th className="p-4 w-8" />
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Tracking</th>
                  <th className="p-4">Courier</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isExpanded = expandedId === order._id;
                  return (
                    <Fragment key={order._id}>
                      <tr
                        className={`border-b border-black/5 dark:border-white/5 cursor-pointer hover:bg-gold/[0.03] ${
                          isExpanded ? 'bg-gold/[0.05]' : ''
                        }`}
                        onClick={() => toggleExpand(order)}
                      >
                        <td className="p-4 text-slate-mute">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </td>
                        <td className="p-4 font-mono text-xs text-gold">
                          {order.orderNumber || order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{customerName(order)}</p>
                          <p className="text-xs text-slate-mute">{customerPhone(order)}</p>
                          <p className="text-xs text-slate-mute truncate max-w-[180px]">
                            {customerEmail(order)}
                          </p>
                        </td>
                        <td className="p-4 text-gold font-medium">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs tracking-wider uppercase px-2 py-1 ${statusBadgeClass(order.status)}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`text-xs tracking-wider uppercase px-2 py-1 ${paymentBadgeClass(order.paymentStatus)}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-slate-mute">
                          {order.trackingNumber || '—'}
                        </td>
                        <td className="p-4 text-slate-mute">
                          {order.courierName || order.courier?.name || '—'}
                        </td>
                        <td className="p-4 text-slate-mute whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-PK')}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="border-b border-black/10 dark:border-white/10">
                          <td colSpan={9} className="p-0">
                            <div className="glass-strong p-6 m-4 space-y-6" onClick={(e) => e.stopPropagation()}>
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                  <h3 className="font-display text-xl text-gold">
                                    {order.orderNumber}
                                  </h3>
                                  <p className="text-sm text-slate-mute mt-1">
                                    {order.paymentMethod?.toUpperCase()} ·{' '}
                                    {order.currentLocation || 'Warehouse'} ·{' '}
                                    {order.currentStage || order.status}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadInvoice(order.orderNumber)}
                                  disabled={invoiceLoading === order.orderNumber}
                                  className="btn-outline text-sm"
                                >
                                  <Download size={16} />
                                  {invoiceLoading === order.orderNumber ? 'Downloading...' : 'Invoice'}
                                </button>
                              </div>

                              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div className="glass p-3">
                                  <p className="text-xs uppercase tracking-wider text-slate-mute">Customer</p>
                                  <p className="mt-1 font-medium">{customerName(order)}</p>
                                  <p className="text-slate-mute">{customerPhone(order)}</p>
                                  <p className="text-slate-mute truncate">{customerEmail(order)}</p>
                                </div>
                                <div className="glass p-3">
                                  <p className="text-xs uppercase tracking-wider text-slate-mute">Shipping</p>
                                  <p className="mt-1">{order.shippingAddress?.street}</p>
                                  <p className="text-slate-mute">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                                    {order.shippingAddress?.zipCode}
                                  </p>
                                </div>
                                <div className="glass p-3">
                                  <p className="text-xs uppercase tracking-wider text-slate-mute">Courier</p>
                                  <p className="mt-1 flex items-center gap-2">
                                    <Truck size={14} className="text-gold" />
                                    {order.courierName || order.courier?.name || 'Not assigned'}
                                  </p>
                                  {order.courierEmployee && (
                                    <p className="text-slate-mute text-xs mt-1">
                                      Rider: {order.courierEmployee}
                                    </p>
                                  )}
                                  {order.vehicleDetails && (
                                    <p className="text-slate-mute text-xs">{order.vehicleDetails}</p>
                                  )}
                                </div>
                                <div className="glass p-3">
                                  <p className="text-xs uppercase tracking-wider text-slate-mute">Totals</p>
                                  <p className="mt-1 text-gold font-medium">
                                    {formatPrice(order.totalPrice)}
                                  </p>
                                  <p className="text-xs text-slate-mute">
                                    Items {formatPrice(order.itemsPrice)} · Ship{' '}
                                    {formatPrice(order.shippingPrice)} · Tax{' '}
                                    {formatPrice(order.taxPrice)}
                                  </p>
                                </div>
                              </div>

                              {order.orderItems?.length > 0 && (
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-slate-mute mb-2 flex items-center gap-2">
                                    <Package size={14} /> Items
                                  </p>
                                  <ul className="space-y-1 text-sm">
                                    {order.orderItems.map((item, idx) => (
                                      <li
                                        key={idx}
                                        className="flex justify-between gap-4 py-1 border-b border-black/5 dark:border-white/5 last:border-0"
                                      >
                                        <span>
                                          {item.name} × {item.quantity}
                                        </span>
                                        <span className="text-gold shrink-0">
                                          {formatPrice(item.price * item.quantity)}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div>
                                <p className="text-xs uppercase tracking-wider text-slate-mute mb-3">
                                  Primary Actions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {PRIMARY_ACTIONS.map(({ key, label, variant }) => (
                                    <button
                                      key={key}
                                      type="button"
                                      disabled={actionLoading === `${order._id}-${key}`}
                                      onClick={() => handlePrimaryAction(order, key)}
                                      className={
                                        variant === 'danger'
                                          ? 'btn-outline text-sm border-red-500/40 text-red-500 hover:bg-red-500/10'
                                          : 'btn-primary text-sm'
                                      }
                                    >
                                      {actionLoading === `${order._id}-${key}` ? '...' : label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {showShipForm && (
                                <div className="glass p-4 space-y-4 border border-gold/20">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium flex items-center gap-2">
                                      <Truck size={16} className="text-gold" /> Ship Order
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => setShowShipForm(false)}
                                      className="text-slate-mute hover:text-gold"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    <div>
                                      <label className="text-xs text-slate-mute block mb-1">
                                        Courier *
                                      </label>
                                      <select
                                        value={shipForm.courierId}
                                        onChange={(e) =>
                                          setShipForm((f) => ({ ...f, courierId: e.target.value }))
                                        }
                                        className="input-field w-full"
                                      >
                                        <option value="">Select courier</option>
                                        {couriers.map((c) => (
                                          <option key={c._id} value={c._id}>
                                            {c.name} ({c.code})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-mute block mb-1">
                                        Location
                                      </label>
                                      <select
                                        value={shipForm.location}
                                        onChange={(e) =>
                                          setShipForm((f) => ({ ...f, location: e.target.value }))
                                        }
                                        className="input-field w-full"
                                      >
                                        {LOCATION_PICKS.map((loc) => (
                                          <option key={loc} value={loc}>
                                            {loc}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-mute block mb-1">
                                        Employee / Rider
                                      </label>
                                      <input
                                        type="text"
                                        value={shipForm.employee}
                                        onChange={(e) =>
                                          setShipForm((f) => ({ ...f, employee: e.target.value }))
                                        }
                                        placeholder="Rider name"
                                        className="input-field w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-mute block mb-1">
                                        Vehicle
                                      </label>
                                      <input
                                        type="text"
                                        value={shipForm.vehicle}
                                        onChange={(e) =>
                                          setShipForm((f) => ({ ...f, vehicle: e.target.value }))
                                        }
                                        placeholder="Bike ABC-123"
                                        className="input-field w-full"
                                      />
                                    </div>
                                    <div>
                                      <label className="text-xs text-slate-mute block mb-1">
                                        Tracking # (optional)
                                      </label>
                                      <input
                                        type="text"
                                        value={shipForm.trackingNumber}
                                        onChange={(e) =>
                                          setShipForm((f) => ({
                                            ...f,
                                            trackingNumber: e.target.value,
                                          }))
                                        }
                                        placeholder="Auto-generated if empty"
                                        className="input-field w-full"
                                      />
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleShipSubmit(order._id)}
                                    disabled={actionLoading === `${order._id}-ship`}
                                    className="btn-primary"
                                  >
                                    {actionLoading === `${order._id}-ship`
                                      ? 'Shipping...'
                                      : 'Confirm Ship'}
                                  </button>
                                </div>
                              )}

                              <div>
                                <p className="text-xs uppercase tracking-wider text-slate-mute mb-2">
                                  Secondary Actions
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {SECONDARY_ACTIONS.map(({ key, label }) => (
                                    <button
                                      key={key}
                                      type="button"
                                      disabled={actionLoading === `${order._id}-${key}`}
                                      onClick={() => runAction(order._id, key)}
                                      className="btn-outline text-sm"
                                    >
                                      {actionLoading === `${order._id}-${key}` ? '...' : label}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div className="glass p-4 space-y-3">
                                <p className="text-xs uppercase tracking-wider text-slate-mute flex items-center gap-2">
                                  <MapPin size={14} /> Cancel Reason (for Cancel Order)
                                </p>
                                <input
                                  type="text"
                                  value={cancelReason}
                                  onChange={(e) => setCancelReason(e.target.value)}
                                  placeholder="Reason for cancellation..."
                                  className="input-field w-full"
                                />
                              </div>

                              <div className="glass p-4 space-y-4">
                                <p className="text-xs uppercase tracking-wider text-slate-mute">
                                  Update Tracking
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {LOCATION_PICKS.map((loc) => (
                                    <button
                                      key={loc}
                                      type="button"
                                      onClick={() =>
                                        setTrackingForm((f) => ({ ...f, currentLocation: loc }))
                                      }
                                      className={`text-xs px-3 py-1.5 border transition-colors ${
                                        trackingForm.currentLocation === loc
                                          ? 'border-gold bg-gold/15 text-gold'
                                          : 'border-black/10 dark:border-white/10 text-slate-mute hover:border-gold/50'
                                      }`}
                                    >
                                      {loc}
                                    </button>
                                  ))}
                                </div>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  <div>
                                    <label className="text-xs text-slate-mute block mb-1">
                                      Current Location
                                    </label>
                                    <input
                                      type="text"
                                      value={trackingForm.currentLocation}
                                      onChange={(e) =>
                                        setTrackingForm((f) => ({
                                          ...f,
                                          currentLocation: e.target.value,
                                        }))
                                      }
                                      className="input-field w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-mute block mb-1">Stage</label>
                                    <input
                                      type="text"
                                      value={trackingForm.stage}
                                      onChange={(e) =>
                                        setTrackingForm((f) => ({ ...f, stage: e.target.value }))
                                      }
                                      placeholder="e.g. In Transit"
                                      className="input-field w-full"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-mute block mb-1">
                                      Courier
                                    </label>
                                    <select
                                      value={trackingForm.courierId}
                                      onChange={(e) =>
                                        setTrackingForm((f) => ({
                                          ...f,
                                          courierId: e.target.value,
                                        }))
                                      }
                                      className="input-field w-full"
                                    >
                                      <option value="">Keep current</option>
                                      {couriers.map((c) => (
                                        <option key={c._id} value={c._id}>
                                          {c.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-xs text-slate-mute block mb-1">
                                      Tracking #
                                    </label>
                                    <input
                                      type="text"
                                      value={trackingForm.trackingNumber}
                                      onChange={(e) =>
                                        setTrackingForm((f) => ({
                                          ...f,
                                          trackingNumber: e.target.value,
                                        }))
                                      }
                                      className="input-field w-full"
                                    />
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="text-xs text-slate-mute block mb-1">
                                      Description
                                    </label>
                                    <input
                                      type="text"
                                      value={trackingForm.description}
                                      onChange={(e) =>
                                        setTrackingForm((f) => ({
                                          ...f,
                                          description: e.target.value,
                                        }))
                                      }
                                      placeholder="Customer-facing update message"
                                      className="input-field w-full"
                                    />
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTracking(order._id)}
                                  disabled={actionLoading === `${order._id}-tracking`}
                                  className="btn-primary text-sm"
                                >
                                  {actionLoading === `${order._id}-tracking`
                                    ? 'Updating...'
                                    : 'Update Tracking & Notify'}
                                </button>
                              </div>

                              <div>
                                <p className="text-xs uppercase tracking-wider text-slate-mute mb-3">
                                  Timeline
                                </p>
                                {order.timeline?.length > 0 ? (
                                  <ol className="space-y-3">
                                    {[...(order.timeline || [])].reverse().map((ev, i) => (
                                      <li
                                        key={ev._id || i}
                                        className="flex gap-3 text-sm border-l-2 border-gold/30 pl-4 py-1"
                                      >
                                        <div className="min-w-0 flex-1">
                                          <p className="font-medium text-gold">
                                            {ev.title || ev.stage}
                                          </p>
                                          {ev.description && (
                                            <p className="text-slate-mute mt-0.5">{ev.description}</p>
                                          )}
                                          <div className="flex flex-wrap gap-x-3 text-xs text-slate-mute mt-1">
                                            {ev.at && (
                                              <span>
                                                {new Date(ev.at).toLocaleString('en-PK', {
                                                  dateStyle: 'medium',
                                                  timeStyle: 'short',
                                                })}
                                              </span>
                                            )}
                                            {ev.location && <span>· {ev.location}</span>}
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ol>
                                ) : (
                                  <p className="text-sm text-slate-mute">No timeline events yet</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
