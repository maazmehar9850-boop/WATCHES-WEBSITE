import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WatchScene from './WatchScene';

const INTRO_KEY = 'lw_intro_seen_v3';

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
  const [active, setActive] = useState(() => !seen);
  const [showUi, setShowUi] = useState(() => seen || reducedMotion);

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* ignore */
    }
    setShowUi(true);
    setActive(false);
    onComplete?.();
  }, [onComplete]);

  const onWatchReady = useCallback(() => setShowUi(true), []);

  useEffect(() => {
    if (seen) onComplete?.();
  }, [seen, onComplete]);

  return (
    <section className="relative h-[100svh] min-h-[600px] overflow-hidden bg-[#0B0B0B]">
      {active && (
        <div className="absolute inset-0 z-0">
          <Canvas
            dpr={[1, 1.25]}
            frameloop="always"
            performance={{ min: 0.5 }}
            gl={{
              antialias: false,
              alpha: false,
              powerPreference: 'high-performance',
              stencil: false,
              depth: true,
            }}
            camera={{ position: [0, 1.1, 5], fov: 40, near: 0.1, far: 30 }}
          >
            <Suspense fallback={null}>
              <WatchScene
                enabled={active}
                reducedMotion={reducedMotion}
                onComplete={finish}
                onWatchReady={onWatchReady}
              />
            </Suspense>
          </Canvas>
        </div>
      )}

      {!active && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(212,175,55,0.14), transparent 55%), linear-gradient(160deg, #151518 0%, #0B0B0B 45%, #070708 100%)',
          }}
        />
      )}

      {/* Soft vignette — centered so mobile pack stays readable */}
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, transparent 30%, rgba(0,0,0,0.45) 100%), linear-gradient(180deg, rgba(11,11,11,0.55) 0%, transparent 28%, transparent 58%, rgba(11,11,11,0.75) 100%)',
        }}
      />

      {/* Desktop: text left. Mobile: text bottom so box stays middle */}
      <div className="relative z-10 h-full section-pad page-wrap flex flex-col justify-end md:justify-center pb-16 md:pb-24 pt-24 text-mist md:max-w-[46%] lg:max-w-[40%]">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl sm:text-6xl lg:text-7xl xl:text-8xl text-gold leading-[0.95] mb-3 md:mb-4 text-center md:text-left"
        >
          Luxe Watches
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="font-sans text-xs sm:text-base tracking-[0.22em] uppercase font-light text-mist/85 text-center md:text-left"
        >
          Crafted. Assembled. Eternal.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.18 }}
          className="mt-3 text-mist/50 text-sm leading-relaxed max-w-sm hidden md:block"
        >
          Precision timepieces, revealed piece by piece.
        </motion.p>
        <AnimatePresence>
          {showUi && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 md:mt-8 flex flex-wrap gap-3 justify-center md:justify-start"
            >
              <Link to="/products" className="btn-primary btn-lux">
                Explore Collection <ArrowRight size={16} />
              </Link>
              <Link
                to={luxuryLink}
                className="btn-outline border-gold/50 text-gold hover:bg-gold hover:text-ink btn-lux"
              >
                Luxury Line
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {active && !reducedMotion && (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-5 right-4 md:bottom-7 md:right-5 z-20 text-[11px] tracking-[0.22em] uppercase text-mist/45 hover:text-gold transition-colors liquid-glass px-3.5 py-2"
        >
          Skip
        </button>
      )}
    </section>
  );
}
