import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FaMoneyBillWave } from 'react-icons/fa';
import { formatPrice, postWithRetry } from '../api/axios';
import { clearCart, selectCartTotal } from '../store/cartSlice';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const shipping = total > 50000 || total === 0 ? 0 : 500;
  const tax = Math.round(total * 0.05);
  const grand = total + shipping + tax;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
  });

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 section-pad page-wrap text-center">
        <h1 className="font-display text-4xl mb-4">Nothing to Checkout</h1>
        <Link to="/products" className="btn-primary">
          Browse Collection
        </Link>
      </div>
    );
  }

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { email, ...shippingAddress } = form;
      const res = await postWithRetry('/orders', {
        orderItems: items.map((i) => ({
          product: i._id,
          name: i.name,
          quantity: i.quantity,
        })),
        shippingAddress,
        guestEmail: email,
        paymentMethod: 'cod',
      });

      const order = res.data.order;
      toast.success(`Order ${order.orderNumber} placed!`);
      dispatch(clearCart());
      navigate(`/order-success/${order._id}?oid=${order.orderNumber}`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (!err.response
          ? 'Cannot reach server. Make sure backend is running.'
          : 'Checkout failed');
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 section-pad page-wrap">
      <h1 className="font-display text-4xl md:text-5xl mb-10">Checkout</h1>
      <p className="text-slate-mute text-sm -mt-6 mb-10">
        Enter shipping details and place your order. Pay cash when it arrives.
      </p>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6">
            <h2 className="font-display text-2xl mb-6">Shipping Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: 'fullName', label: 'Full Name', span: 2 },
                { name: 'email', label: 'Email', span: 1, type: 'email' },
                { name: 'phone', label: 'Phone', span: 1 },
                { name: 'street', label: 'Street Address', span: 2 },
                { name: 'city', label: 'City', span: 1 },
                { name: 'state', label: 'State', span: 1 },
                { name: 'zipCode', label: 'Zip Code', span: 1 },
                { name: 'country', label: 'Country', span: 1 },
              ].map((f) => (
                <div key={f.name} className={f.span === 2 ? 'sm:col-span-2' : ''}>
                  <label className="text-xs tracking-wider uppercase text-slate-mute">
                    {f.label}
                  </label>
                  <input
                    required
                    type={f.type || 'text'}
                    name={f.name}
                    value={form[f.name]}
                    onChange={onChange}
                    className="input-field mt-1"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-6">
            <h2 className="font-display text-2xl mb-4">Payment Method</h2>
            <div className="flex items-center gap-4 p-4 border border-gold bg-gold/5">
              <FaMoneyBillWave size={28} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-xs text-slate-mute">
                  Pay in cash when your order is delivered to your door.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6 h-fit sticky top-28">
          <h2 className="font-display text-2xl mb-6">Your Order</h2>
          <ul className="space-y-3 text-sm mb-6">
            {items.map((i) => (
              <li key={i._id} className="flex justify-between gap-2">
                <span className="truncate">
                  {i.name} × {i.quantity}
                </span>
                <span className="shrink-0">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm border-t border-black/10 dark:border-white/10 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-mute">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-mute">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-mute">Tax</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium pt-2">
              <span>Total</span>
              <span className="text-gold">{formatPrice(grand)}</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            {loading ? 'Placing order…' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
