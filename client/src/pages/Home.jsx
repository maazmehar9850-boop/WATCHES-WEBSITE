import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';

const WatchHeroAnimation = lazy(() => import('../components/hero/WatchHeroAnimation'));

const FALLBACK_CAT_IMAGE =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=480&q=70';

const HOME_CACHE_KEY = 'lw_home_v2';
const HOME_CACHE_TTL = 5 * 60 * 1000;

function readHomeCache() {
  try {
    const raw = sessionStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > HOME_CACHE_TTL) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeHomeCache(data) {
  try {
    sessionStorage.setItem(HOME_CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* ignore quota */
  }
}

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const cached = readHomeCache();
    if (cached) {
      setTrending(cached.trending);
      setBestsellers(cached.bestsellers);
      setCategories(cached.categories);
      setLoading(false);
      return undefined;
    }

    const load = async () => {
      try {
        const [t, b, c] = await Promise.all([
          api.get('/products?trending=true&limit=4'),
          api.get('/products?bestseller=true&limit=4'),
          api.get('/categories'),
        ]);
        if (cancelled) return;
        const data = {
          trending: t.data.products,
          bestsellers: b.data.products,
          categories: c.data.categories,
        };
        setTrending(data.trending);
        setBestsellers(data.bestsellers);
        setCategories(data.categories);
        writeHomeCache(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const catLink = (cat) => `/products?category=${cat._id}`;

  const luxuryCat = categories.find((c) => /luxury/i.test(c.slug) || /luxury/i.test(c.name));
  const luxuryLink = luxuryCat ? `/products?category=${luxuryCat._id}` : '/products?keyword=luxury';

  return (
    <div>
      <section className="relative h-screen min-h-[640px] overflow-hidden bg-[#0B0B0B]">
        <Suspense fallback={<div className="absolute inset-0 bg-[#0B0B0B]" />}>
          <WatchHeroAnimation />
        </Suspense>

        <div className="relative z-10 h-full section-pad page-wrap flex flex-col justify-center text-mist pt-20 pb-28 md:pb-20 md:max-w-[48%] lg:max-w-[42%]">
          <p className="font-display text-5xl sm:text-7xl lg:text-8xl text-gold leading-none mb-5 animate-[fadeUp_0.7s_ease-out_both]">
            LuxeWatch
          </p>
          <h1 className="font-sans text-base sm:text-lg tracking-[0.18em] uppercase max-w-md font-light text-mist/90 animate-[fadeUp_0.7s_ease-out_0.15s_both]">
            Crafted. Assembled. Eternal.
          </h1>
          <p className="mt-4 text-mist/65 max-w-sm text-sm leading-relaxed animate-[fadeUp_0.7s_ease-out_0.28s_both]">
            Precision timepieces, revealed piece by piece — for those who measure life in moments that matter.
          </p>
          <div className="mt-9 flex flex-wrap gap-4 animate-[fadeUp_0.7s_ease-out_0.4s_both]">
            <Link to="/products" className="btn-primary">
              Explore Collection <ArrowRight size={16} />
            </Link>
            <Link
              to={luxuryLink}
              className="btn-outline border-mist/35 text-mist hover:bg-mist hover:text-ink"
            >
              Luxury Line
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad page-wrap py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl">Collections</h2>
          <p className="mt-2 text-slate-mute text-sm tracking-wide">Find your signature style</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading && categories.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-black/5 dark:bg-white/5 animate-pulse" />
              ))
            : categories.slice(0, 8).map((cat) => (
                <Link
                  key={cat._id}
                  to={catLink(cat)}
                  className="group relative block aspect-[3/4] overflow-hidden"
                >
                  <img
                    src={cat.image || FALLBACK_CAT_IMAGE}
                    alt={cat.name}
                    loading="lazy"
                    decoding="async"
                    width={480}
                    height={640}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_CAT_IMAGE;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <h3 className="font-display text-2xl text-mist group-hover:text-gold transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      <section className="section-pad page-wrap py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">Trending Now</h2>
            <p className="mt-2 text-slate-mute text-sm">Most sought-after this season</p>
          </div>
          <Link to="/products?trending=true" className="btn-ghost text-gold hidden sm:flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : trending.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      <section className="relative my-16 h-[50vh] min-h-[360px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1200&q=70"
          alt="Craftsmanship"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=70';
          }}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/60 flex items-center justify-center text-center section-pad">
          <div>
            <p className="font-display text-4xl md:text-6xl text-gold mb-4">Precision. Passion. Legacy.</p>
            <p className="text-mist/80 max-w-md mx-auto mb-8 text-sm">
              Every LuxeWatch is a testament to meticulous craftsmanship and enduring design.
            </p>
            <Link to={luxuryLink} className="btn-primary">
              Explore Luxury
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad page-wrap py-16 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-display text-4xl md:text-5xl">Best Sellers</h2>
            <p className="mt-2 text-slate-mute text-sm">Loved by collectors worldwide</p>
          </div>
          <Link to="/products?bestseller=true" className="btn-ghost text-gold hidden sm:flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : bestsellers.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

export default Home;
