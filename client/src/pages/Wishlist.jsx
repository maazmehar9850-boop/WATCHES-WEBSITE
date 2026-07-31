import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist } from '../store/wishlistSlice';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const items = useSelector((s) => s.wishlist.items);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      dispatch(fetchWishlist()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, dispatch]);

  if (!token) {
    return (
      <div className="pt-32 pb-20 section-pad page-wrap text-center">
        <h1 className="font-display text-4xl mb-4">Wishlist</h1>
        <p className="text-slate-mute mb-8">Login to view your saved watches</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 section-pad page-wrap">
      <h1 className="font-display text-4xl md:text-5xl mb-10">Wishlist</h1>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-display text-2xl mb-4">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary">Explore Collection</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {items.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
