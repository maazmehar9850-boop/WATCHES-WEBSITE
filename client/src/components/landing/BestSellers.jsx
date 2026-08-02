import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard';
import { ProductCardSkeleton } from '../Skeleton';
import { SectionHeader, EmptyRow } from './SectionHeader';

export default function BestSellers({ products = [], loading }) {
  return (
    <section className="section-pad page-wrap py-16">
      <SectionHeader
        title="Best Sellers"
        subtitle="Loved by collectors worldwide"
        action={
          <Link to="/products?bestseller=true" className="btn-ghost text-gold hidden sm:flex btn-lux">
            View all <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.length > 0
            ? products.map((p) => <ProductCard key={p._id} product={p} luxury />)
            : null}
      </div>
      {!loading && products.length === 0 ? <EmptyRow /> : null}
    </section>
  );
}
