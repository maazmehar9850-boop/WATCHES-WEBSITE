import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import FeaturedWatches from '../components/landing/FeaturedWatches';
import NewArrivals from '../components/landing/NewArrivals';
import BestSellers from '../components/landing/BestSellers';
import Collections from '../components/landing/Collections';
import WhyLuxe from '../components/landing/WhyLuxe';
import Reviews from '../components/landing/Reviews';
import Newsletter from '../components/landing/Newsletter';

const CinematicHero = lazy(() => import('../components/landing/cinematic/CinematicHero'));

const HOME_CACHE_KEY = 'lw_home_v3';
const HOME_CACHE_TTL = 5 * 60 * 1000;

const asArray = (value) => (Array.isArray(value) ? value : []);

function normalizeHomeData(data) {
  if (!data || typeof data !== 'object') return null;
  return {
    featured: asArray(data.featured),
    newest: asArray(data.newest),
    bestsellers: asArray(data.bestsellers),
    categories: asArray(data.categories),
  };
}

function readHomeCache() {
  try {
    const raw = sessionStorage.getItem(HOME_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.ts > HOME_CACHE_TTL) return null;
    return normalizeHomeData(parsed.data);
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
  const [featured, setFeatured] = useState([]);
  const [newest, setNewest] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(() => {
    try {
      return sessionStorage.getItem('lw_intro_seen_v4') === '1';
    } catch {
      return false;
    }
  });

  // Force dark luxury canvas on the landing experience
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.add('dark');
    return () => {
      if (!hadDark) {
        const saved = localStorage.getItem('theme');
        if (saved !== 'dark') root.classList.remove('dark');
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = readHomeCache();
    if (cached) {
      setFeatured(cached.featured);
      setNewest(cached.newest);
      setBestsellers(cached.bestsellers);
      setCategories(cached.categories);
      setLoading(false);
    }

    const load = async () => {
      try {
        const [feat, neu, best, cats] = await Promise.all([
          api.get('/products?trending=true&limit=4'),
          api.get('/products?sort=newest&limit=4'),
          api.get('/products?bestseller=true&limit=4'),
          api.get('/categories'),
        ]);
        if (cancelled) return;
        const data = normalizeHomeData({
          featured: feat.data?.products,
          newest: neu.data?.products,
          bestsellers: best.data?.products,
          categories: cats.data?.categories,
        });
        if (!data) return;
        setFeatured(data.featured);
        setNewest(data.newest);
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

  const onIntroComplete = useCallback(() => setRevealed(true), []);

  const luxuryCat = categories.find((c) => /luxury/i.test(c.slug) || /luxury/i.test(c.name));
  const luxuryLink = luxuryCat ? `/products?category=${luxuryCat._id}` : '/products?keyword=luxury';

  return (
    <div className="bg-[#0B0B0B] text-mist min-h-screen">
      <Suspense fallback={<div className="h-screen min-h-[640px] bg-[#0B0B0B]" />}>
        <CinematicHero onComplete={onIntroComplete} luxuryLink={luxuryLink} />
      </Suspense>

      <motion.div
        initial={false}
        animate={{ opacity: revealed ? 1 : 0.35 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ pointerEvents: revealed ? 'auto' : 'none' }}
      >
        <FeaturedWatches products={featured} loading={loading} />
        <NewArrivals products={newest} loading={loading} />
        <BestSellers products={bestsellers} loading={loading} />
        <Collections categories={categories} loading={loading} />
        <WhyLuxe />
        <Reviews />
        <Newsletter />
      </motion.div>
    </div>
  );
};

export default Home;
