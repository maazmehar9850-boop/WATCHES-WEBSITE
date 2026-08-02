import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { addToCart } from '../store/cartSlice';
import { mediaUrl, formatPrice, PLACEHOLDER_IMG } from '../api/axios';

const ProductCard = memo(function ProductCard({ product, luxury = false }) {
  const dispatch = useDispatch();

  const handleCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) return toast.error('Out of stock');
    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        stock: product.stock,
        quantity: 1,
      })
    );
    toast.success('Added to cart');
  };

  const discount =
    product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : 0;

  return (
    <div className={`group ${luxury ? 'glow-border' : ''}`}>
      <Link to={`/product/${product.slug || product._id}`} className="block">
        <div
          className={`relative aspect-[3/4] overflow-hidden mb-4 ${
            luxury ? 'bg-ink-soft ring-1 ring-gold/10' : 'bg-mist-soft dark:bg-ink-soft'
          }`}
        >
          <img
            src={mediaUrl(product.images?.[0])}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PLACEHOLDER_IMG;
            }}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {luxury && (
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-transparent via-gold/10 to-transparent" />
          )}
          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-gold text-ink text-xs font-semibold px-2 py-1">
              -{discount}%
            </span>
          )}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={handleCart}
              className={`p-2 shadow-sm transition-transform hover:scale-110 ${
                luxury
                  ? 'bg-ink/90 text-gold border border-gold/30'
                  : 'bg-mist/95 dark:bg-ink/90 text-ink dark:text-mist'
              }`}
              aria-label="Add to cart"
            >
              <ShoppingBag size={16} />
            </button>
          </div>
          {product.stock < 1 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white tracking-widest text-sm uppercase">Sold Out</span>
            </div>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-mute mb-1">
          {product.brand || 'Luxe Watches'}
        </p>
        <h3 className="font-display text-lg leading-snug group-hover:text-gold transition-colors line-clamp-2">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-gold font-medium">{formatPrice(product.price)}</span>
          {product.comparePrice > product.price && (
            <span className="text-xs text-slate-mute line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
});

export default ProductCard;
