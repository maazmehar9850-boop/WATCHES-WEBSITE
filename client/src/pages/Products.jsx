import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const page = Number(searchParams.get('page') || 1);
  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const trending = searchParams.get('trending') || '';
  const bestseller = searchParams.get('bestseller') || '';
  const featured = searchParams.get('featured') || '';

  const [localMin, setLocalMin] = useState(minPrice);
  const [localMax, setLocalMax] = useState(maxPrice);

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 12, sort });
        if (keyword) params.set('keyword', keyword);
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);
        if (trending) params.set('trending', trending);
        if (bestseller) params.set('bestseller', bestseller);
        if (featured) params.set('featured', featured);

        const res = await api.get(`/products?${params}`);
        setProducts(res.data.products);
        setPages(res.data.pages);
        setTotal(res.data.total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, keyword, category, sort, minPrice, maxPrice, trending, bestseller, featured]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  const applyPrice = () => {
    const next = new URLSearchParams(searchParams);
    if (localMin) next.set('minPrice', localMin);
    else next.delete('minPrice');
    if (localMax) next.set('maxPrice', localMax);
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
    setFiltersOpen(false);
  };

  const FilterPanel = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm tracking-[0.2em] uppercase mb-4">Category</h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => updateParam('category', '')}
            className={`block text-sm ${!category ? 'text-gold' : 'text-slate-mute hover:text-gold'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => updateParam('category', c._id)}
              className={`block text-sm ${category === c._id ? 'text-gold' : 'text-slate-mute hover:text-gold'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm tracking-[0.2em] uppercase mb-4">Price Range</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="input-field text-sm"
          />
          <span className="text-slate-mute">—</span>
          <input
            type="number"
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <button type="button" onClick={applyPrice} className="btn-primary w-full mt-3 text-sm py-2">
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <div className="pt-28 pb-20 section-pad page-wrap">
      <div className="mb-10">
        <h1 className="font-display text-4xl md:text-5xl">Collection</h1>
        <p className="mt-2 text-slate-mute text-sm">
          {keyword ? `Results for "${keyword}"` : 'Browse our curated timepieces'} — {total} pieces
        </p>
      </div>

      <div className="flex gap-10">
        <aside className="hidden lg:block w-56 shrink-0">
          <FilterPanel />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 gap-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-sm"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="input-field w-auto text-sm ml-auto"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popularity">Popularity</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-slate-mute">
              <p className="font-display text-2xl mb-2">No watches found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateParam('page', String(p))}
                  className={`w-10 h-10 text-sm ${
                    page === p ? 'bg-gold text-ink' : 'glass hover:text-gold'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-full glass-strong p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl">Filters</h2>
              <button type="button" onClick={() => setFiltersOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <FilterPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
