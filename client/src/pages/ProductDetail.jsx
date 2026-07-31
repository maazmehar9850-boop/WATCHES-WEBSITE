import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { mediaUrl, formatPrice } from '../api/axios';
import { addToCart } from '../store/cartSlice';
import Skeleton from '../components/Skeleton';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        let res;
        try {
          res = await api.get(`/products/slug/${id}`);
        } catch {
          res = await api.get(`/products/${id}`);
        }
        setProduct(res.data.product);
        setActiveImg(0);
      } catch {
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="pt-28 section-pad page-wrap grid md:grid-cols-2 gap-10 py-10">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount =
    product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  const handleAddCart = () => {
    if (product.stock < 1) return toast.error('Out of stock');
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        stock: product.stock,
        quantity: qty,
      })
    );
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddCart();
    navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Reviews need staff/admin login');
    try {
      await api.post(`/products/${product._id}/reviews`, review);
      toast.success('Review submitted');
      setReview({ rating: 5, comment: '' });
      const res = await api.get(`/products/${product._id}`);
      setProduct(res.data.product);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="pt-28 pb-20 section-pad page-wrap">
      <nav className="text-xs text-slate-mute mb-8 tracking-wide">
        <Link to="/" className="hover:text-gold">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-gold">Collection</Link>
        <span className="mx-2">/</span>
        <span className="text-ink dark:text-mist">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="aspect-square bg-mist-soft dark:bg-ink-soft overflow-hidden mb-4">
            <img
              src={mediaUrl(product.images?.[activeImg])}
              alt={product.name}
              decoding="async"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto">
            {product.images?.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(i)}
                className={`w-20 h-20 shrink-0 overflow-hidden border-2 ${
                  activeImg === i ? 'border-gold' : 'border-transparent'
                }`}
              >
                <img
                  src={mediaUrl(img)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold mb-2">
            {product.category?.name} · {product.brand}
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-0.5" aria-label={`${product.rating || 0} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => {
                const filled = i < Math.round(product.rating || 0);
                return (
                  <Star
                    key={i}
                    size={16}
                    className={filled ? 'text-gold' : 'text-gold/35'}
                    fill={filled ? 'currentColor' : 'none'}
                    strokeWidth={1.75}
                  />
                );
              })}
            </div>
            <span className="text-sm text-ink/70 dark:text-mist/75">
              {Number(product.rating || 0).toFixed(1)} ({product.numReviews || 0} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-medium text-gold">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <>
                <span className="text-lg text-slate-mute line-through">
                  {formatPrice(product.comparePrice)}
                </span>
                <span className="text-xs bg-gold/20 text-gold px-2 py-1">-{discount}%</span>
              </>
            )}
          </div>

          <p className="mt-6 text-slate-mute leading-relaxed">{product.description}</p>

          <p className={`mt-4 text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-black/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 hover:text-gold"
              >
                <Minus size={16} />
              </button>
              <span className="w-10 text-center">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                className="p-3 hover:text-gold"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <button type="button" onClick={handleAddCart} disabled={product.stock < 1} className="btn-primary flex-1 min-w-[140px]">
              <ShoppingBag size={16} /> Add to Cart
            </button>
            <button type="button" onClick={handleBuyNow} disabled={product.stock < 1} className="btn-outline flex-1 min-w-[140px]">
              Buy Now
            </button>
          </div>

          {product.specifications && (
            <div className="mt-10 glass p-6">
              <h3 className="text-sm tracking-[0.2em] uppercase mb-4">Specifications</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(product.specifications)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-slate-mute capitalize">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-20 max-w-2xl">
        <h2 className="font-display text-3xl mb-6">Reviews</h2>
        <form onSubmit={submitReview} className="glass p-6 mb-8 space-y-4">
          <div>
            <label className="text-sm text-ink/70 dark:text-mist/75 block mb-2">Your rating</label>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Star rating">
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= review.rating;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={review.rating === n}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    onClick={() => setReview({ ...review, rating: n })}
                    className={`p-1 transition-colors ${
                      filled ? 'text-gold' : 'text-ink/25 dark:text-mist/30 hover:text-gold/70'
                    }`}
                  >
                    <Star size={28} fill={filled ? 'currentColor' : 'none'} strokeWidth={1.75} />
                  </button>
                );
              })}
              <span className="ml-3 text-sm font-medium text-ink dark:text-mist">
                {review.rating} / 5
              </span>
            </div>
          </div>
          <textarea
            required
            rows={3}
            placeholder="Share your experience..."
            value={review.comment}
            onChange={(e) => setReview({ ...review, comment: e.target.value })}
            className="input-field"
          />
          <button type="submit" className="btn-primary">
            Submit Review
          </button>
        </form>
        <div className="space-y-4">
          {product.reviews?.length === 0 && (
            <p className="text-ink/60 dark:text-mist/60 text-sm">No reviews yet.</p>
          )}
          {product.reviews?.map((r) => (
            <div key={r._id} className="border-b border-black/5 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-medium text-sm text-ink dark:text-mist">{r.name}</span>
                <span className="flex items-center gap-0.5 text-gold" aria-label={`${r.rating} stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      fill={i < r.rating ? 'currentColor' : 'none'}
                      className={i < r.rating ? 'text-gold' : 'text-gold/30'}
                      strokeWidth={1.75}
                    />
                  ))}
                </span>
              </div>
              <p className="text-sm text-ink/75 dark:text-mist/75 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
