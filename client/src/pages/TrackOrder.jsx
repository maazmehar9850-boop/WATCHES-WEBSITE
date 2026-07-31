import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Truck, Package, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { formatPrice } from '../api/axios';
import OrderTimeline from '../components/OrderTimeline';

const TrackOrder = () => {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get('id') || '');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (id = query) => {
    const q = (id || '').trim();
    if (!q) return toast.error('Enter Order ID or Tracking Number');
    setLoading(true);
    try {
      const res = await api.get(`/orders/track?id=${encodeURIComponent(q)}`);
      setTracking(res.data.tracking);
      setParams({ id: res.data.tracking.orderNumber });
    } catch (err) {
      setTracking(null);
      toast.error(err.response?.data?.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = params.get('id');
    if (id) {
      setQuery(id);
      search(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    search();
  };

  return (
    <div className="pt-28 pb-20 section-pad page-wrap">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl mb-3">Track Your Order</h1>
        <p className="text-slate-mute text-sm">
          Enter your Order ID (e.g. WM-20260730-000001) or tracking number
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex gap-2 mb-14">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="WM-20260730-000001"
          className="input-field flex-1"
        />
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          <Search size={16} /> {loading ? '...' : 'Track'}
        </button>
      </form>

      {tracking && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="glass p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs tracking-widest uppercase text-slate-mute">Order ID</p>
                <p className="font-display text-2xl text-gold">{tracking.orderNumber}</p>
              </div>
              <span className="text-xs tracking-wider uppercase px-3 py-1.5 bg-gold/15 text-gold">
                {tracking.status}
              </span>
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-xs text-slate-mute mb-2">
                <span>{tracking.currentStage}</span>
                <span>{tracking.progress}%</span>
              </div>
              <div className="h-2 bg-black/10 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${tracking.progress}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex gap-3 items-start">
                <MapPin size={18} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-mute text-xs uppercase tracking-wider">Location</p>
                  <p className="font-medium">{tracking.currentLocation || '—'}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Truck size={18} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-mute text-xs uppercase tracking-wider">Courier</p>
                  <p className="font-medium">{tracking.courierName || '—'}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Package size={18} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-mute text-xs uppercase tracking-wider">Tracking #</p>
                  <p className="font-medium font-mono text-xs">
                    {tracking.trackingNumber || 'Pending'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <Clock size={18} className="text-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-mute text-xs uppercase tracking-wider">Est. Delivery</p>
                  <p className="font-medium">
                    {tracking.estimatedDelivery
                      ? new Date(tracking.estimatedDelivery).toLocaleDateString('en-PK')
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 glass p-6 md:p-8">
              <h2 className="font-display text-2xl mb-6">Live Timeline</h2>
              <OrderTimeline timeline={tracking.timeline} stages={tracking.stages} />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <div className="glass p-6">
                <h3 className="font-display text-xl mb-4">Order Summary</h3>
                <ul className="space-y-2 text-sm mb-4">
                  {(tracking.orderItems || []).map((i, idx) => (
                    <li key={idx} className="flex justify-between gap-2">
                      <span className="truncate">
                        {i.name} × {i.quantity}
                      </span>
                      <span className="text-gold shrink-0">
                        {formatPrice(i.price * i.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-black/10 dark:border-white/10 pt-3 flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-gold">{formatPrice(tracking.totalPrice)}</span>
                </div>
              </div>
              <Link to={`/track-order?id=${tracking.orderNumber}`} className="btn-outline w-full text-center block">
                Refresh Tracking
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrackOrder;
