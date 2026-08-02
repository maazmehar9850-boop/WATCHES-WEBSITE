import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WatchScene from './WatchScene';

const INTRO_KEY = 'lw_intro_seen_v4';

function readIntroSeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return false;
  }
}

function useReducedMotionPref() {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);
}

export default function CinematicHero({ onComplete, luxuryLink = '/products' }) {
  const reducedMotion = useReducedMotionPref();
  const seen = useMemo(() => readIntroSeen(), []);
  const [introDone, setIntroDone] = useState(() => seen);
  const [showUi, setShowUi] = useState(() => seen || reducedMotion);
  // Keep canvas forever so assembled watch stays on the poster
  const [playIntro, setPlayIntro] = useState(() => !seen);

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* ignore */
    }
    setShowUi(true);
    setIntroDone(true);
    setPlayIntro(false);
    onComplete?.();
  }, [onComplete]);

  const onWatchReady = useCallback(() => setShowUi(true), []);

  useEffect(() => {
    if (seen) onComplete?.();
  }, [seen, onComplete]);

  return (
    <section className="relative h-[100svh] min-h-[640px] overflow-hidden bg-[#0B0B0B]">
      {/* Professional layered background */}
      <div className="absolute inset-0 z-0 hero-lux-bg" aria-hidden>
        <div className="hero-lux-orb hero-lux-orb--a" />
        <div className="hero-lux-orb hero-lux-orb--b" />
        <div className="hero-lux-orb hero-lux-orb--c" />
        <div className="hero-lux-grid" />
        <div className="hero-lux-noise" />
      </div>

      {/* Watch canvas — always mounted after first load so poster keeps the watch */}
      <div
        className={`absolute inset-0 z-[1] transition-opacity duration-700 ${
          introDone || playIntro ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Canvas
          dpr={[1, 1.5]}
          frameloop="always"
          performance={{ min: 0.6 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
          }}
          camera={{ position: [1.2, 1.05, 4.3], fov: 38, near: 0.1, far: 30 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            <WatchScene
              enabled={playIntro || introDone || seen}
              reducedMotion={reducedMotion || seen}
              onComplete={finishIntro}
              onWatchReady={onWatchReady}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Liquid vignette */}
      <div className="pointer-events-none absolute inset-0 z-[2] hero-lux-vignette" />

      {/* Liquid glass brand panel */}
      <div className="relative z-10 h-full section-pad page-wrap flex flex-col justify-end md:justify-center pb-14 md:pb-0 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="liquid-glass liquid-panel glow-border max-w-xl md:max-w-[42%] p-6 sm:p-8 md:p-10"
        >
          <p className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-gold leading-[0.95] mb-3">
            Luxe Watches
          </p>
          <h1 className="font-sans text-[11px] sm:text-sm tracking-[0.24em] uppercase font-light text-mist/80">
            Crafted. Assembled. Eternal.
          </h1>
          <p className="mt-4 text-mist/50 text-sm leading-relaxed max-w-sm hidden sm:block">
            Precision timepieces for collectors who measure life in moments that matter.
          </p>
          <AnimatePresence>
            {showUi && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                <Link to="/products" className="btn-primary btn-lux">
                  Explore Collection <ArrowRight size={16} />
                </Link>
                <Link
                  to={luxuryLink}
                  className="btn-outline border-gold/45 text-gold hover:bg-gold hover:text-ink btn-lux liquid-glass"
                >
                  Luxury Line
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {playIntro && !reducedMotion && (
        <button
          type="button"
          onClick={finishIntro}
          className="absolute bottom-5 right-4 md:bottom-7 md:right-5 z-20 text-[11px] tracking-[0.22em] uppercase text-mist/45 hover:text-gold transition-colors liquid-glass px-3.5 py-2"
        >
          Skip
        </button>
      )}
    </section>
  );
}
