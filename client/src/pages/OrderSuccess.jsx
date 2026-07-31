import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle, Download, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { formatPrice } from '../api/axios';
import { downloadInvoicePdf } from '../utils/invoice';
import OrderTimeline from '../components/OrderTimeline';

const OrderSuccess = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Prefer Mongo id; fallback track by order number from query
    const oid = searchParams.get('oid');
    const load = async () => {
      try {
        try {
          const res = await api.get(`/orders/${id}`);
          setOrder(res.data.order);
        } catch {
          if (oid) {
            const res = await api.get(`/orders/track?id=${encodeURIComponent(oid)}`);
            setOrder(res.data.order);
          } else {
            throw new Error('not found');
          }
        }
      } catch {
        setError('Could not load order details, but your order may still be placed.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, searchParams]);

  const handleInvoice = async () => {
    try {
      const key = order.orderNumber || order._id;
      const res = await api.get(`/orders/invoice/${key}`);
      downloadInvoicePdf(res.data.invoice);
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invoice failed');
    }
  };

  return (
    <div className="pt-32 pb-20 section-pad page-wrap max-w-2xl mx-auto">
      <div className="text-center">
        <CheckCircle className="mx-auto text-gold mb-6" size={64} strokeWidth={1.5} />
        <h1 className="font-display text-4xl mb-4">Order Confirmed</h1>
        <p className="text-slate-mute mb-2">
          Thank you for your purchase. A confirmation email will be sent shortly.
        </p>
      </div>

      {loading && <p className="text-slate-mute mt-8 text-sm text-center">Loading order details...</p>}
      {error && !order && <p className="text-slate-mute mt-8 text-sm text-center">{error}</p>}

      {order && (
        <div className="space-y-6 mt-10">
          <div className="glass p-6 text-left text-sm space-y-2">
            <p>
              <span className="text-slate-mute">Order ID:</span>{' '}
              <span className="font-medium text-gold text-base">
                {order.orderNumber || `#${order._id.slice(-8).toUpperCase()}`}
              </span>
            </p>
            <p>
              <span className="text-slate-mute">Name:</span> {order.shippingAddress?.fullName}
            </p>
            <p>
              <span className="text-slate-mute">Phone:</span> {order.shippingAddress?.phone}
            </p>
            {order.guestEmail && (
              <p>
                <span className="text-slate-mute">Email:</span> {order.guestEmail}
              </p>
            )}
            <p>
              <span className="text-slate-mute">Total:</span>{' '}
              <span className="text-gold font-medium">{formatPrice(order.totalPrice)}</span>
            </p>
            <p>
              <span className="text-slate-mute">Payment:</span>{' '}
              {(order.paymentMethod || 'cod').toUpperCase()} · {order.paymentStatus || 'Pending'}
            </p>
            <p>
              <span className="text-slate-mute">Status:</span> {order.status}
            </p>
            {order.estimatedDelivery && (
              <p>
                <span className="text-slate-mute">Est. Delivery:</span>{' '}
                {new Date(order.estimatedDelivery).toLocaleDateString('en-PK')}
              </p>
            )}
            <p className="text-xs text-slate-mute pt-2">
              Save your Order ID to track shipment anytime.
            </p>
          </div>

          {order.timeline?.length > 0 && (
            <div className="glass p-6 text-left">
              <h2 className="font-display text-xl mb-4">Order Timeline</h2>
              <OrderTimeline timeline={order.timeline} stages={[]} />
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to={`/track-order?id=${encodeURIComponent(order.orderNumber || order._id)}`}
              className="btn-primary"
            >
              <MapPin size={16} /> Track Order
            </Link>
            <button type="button" onClick={handleInvoice} className="btn-outline">
              <Download size={16} /> Download Invoice
            </button>
            <Link to="/products" className="btn-ghost">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}

      {!order && !loading && (
        <div className="flex flex-wrap gap-4 justify-center mt-10">
          <Link to="/track-order" className="btn-primary">
            Track Order
          </Link>
          <Link to="/products" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrderSuccess;
