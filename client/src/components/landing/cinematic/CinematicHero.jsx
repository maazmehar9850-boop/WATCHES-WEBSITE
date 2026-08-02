import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import WatchScene from './WatchScene';

const INTRO_KEY = 'lw_intro_seen';

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

/**
 * Full-bleed cinematic hero — R3F watch assembly + brand overlay.
 */
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

  useEffect(() => {
    if (seen) onComplete?.();
  }, [seen, onComplete]);

  const handleSkip = () => finish();

  return (
    <section className="relative h-screen min-h-[640px] overflow-hidden bg-[#0B0B0B]">
      {active && (
        <div className="absolute inset-0 z-0">
          <Canvas
            dpr={[1, 1.5]}
            frameloop="demand"
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: 'high-performance',
              stencil: false,
            }}
            camera={{ position: [0, 1.2, 5.2], fov: 42, near: 0.1, far: 40 }}
            shadows
          >
            <Suspense fallback={null}>
              <WatchScene enabled={active} reducedMotion={reducedMotion} onComplete={finish} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {!active && (
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 65% 45%, rgba(212,175,55,0.12), transparent 55%), linear-gradient(165deg, #141416 0%, #0B0B0B 50%, #080809 100%)',
          }}
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 55% 50%, transparent 25%, rgba(0,0,0,0.55) 100%), linear-gradient(90deg, rgba(11,11,11,0.88) 0%, rgba(11,11,11,0.25) 42%, transparent 70%)',
        }}
      />

      <div className="relative z-10 h-full section-pad page-wrap flex flex-col justify-center text-mist pt-20 pb-28 md:pb-20 md:max-w-[48%] lg:max-w-[42%]">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl text-gold leading-none mb-5"
        >
          Luxe Watches
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-base sm:text-lg tracking-[0.18em] uppercase max-w-md font-light text-mist/90"
        >
          Crafted. Assembled. Eternal.
        </motion.h1>
        <AnimatePresence>
          {showUi && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-9 flex flex-wrap gap-4"
            >
              <Link to="/products" className="btn-primary btn-lux">
                Explore Collection <ArrowRight size={16} />
              </Link>
              <Link
                to={luxuryLink}
                className="btn-outline border-mist/35 text-mist hover:bg-mist hover:text-ink btn-lux"
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
          onClick={handleSkip}
          className="absolute bottom-8 right-6 z-20 text-xs tracking-[0.2em] uppercase text-mist/50 hover:text-gold transition-colors liquid-glass px-4 py-2"
        >
          Skip intro
        </button>
      )}
    </section>
  );
}
