import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { removeFromCart, updateQuantity, selectCartTotal } from '../store/cartSlice';
import { mediaUrl, formatPrice } from '../api/axios';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const shipping = total > 50000 || total === 0 ? 0 : 500;
  const tax = Math.round(total * 0.05);
  const grand = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="pt-32 pb-20 section-pad page-wrap text-center">
        <h1 className="font-display text-4xl mb-4">Your Cart is Empty</h1>
        <p className="text-slate-mute mb-8">Discover our collection of fine timepieces</p>
        <Link to="/products" className="btn-primary">Browse Collection</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 section-pad page-wrap">
      <h1 className="font-display text-4xl md:text-5xl mb-10">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item._id} className="glass p-4 flex gap-4 items-center">
              <Link to={`/product/${item._id}`} className="w-24 h-24 shrink-0 overflow-hidden bg-mist-soft dark:bg-ink-soft">
                <img
                  src={mediaUrl(item.image)}
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item._id}`} className="font-display text-lg hover:text-gold truncate block">
                  {item.name}
                </Link>
                <p className="text-gold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-black/10 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))
                      }
                      className="p-2"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(
                          updateQuantity({
                            id: item._id,
                            quantity: Math.min(item.stock || 99, item.quantity + 1),
                          })
                        )
                      }
                      className="p-2"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-slate-mute hover:text-red-500 p-2"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="font-medium hidden sm:block">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <div className="glass p-6 h-fit sticky top-28">
          <h2 className="font-display text-2xl mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-mute">Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-mute">Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-mute">Tax (5%)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-medium pt-3 border-t border-black/10 dark:border-white/10">
              <span>Total</span>
              <span className="text-gold">{formatPrice(grand)}</span>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6">
            Proceed to Checkout
          </button>
          <Link to="/products" className="block text-center text-sm text-slate-mute mt-4 hover:text-gold">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
