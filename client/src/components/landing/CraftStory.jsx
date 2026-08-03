import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AssembledWatch, ExplodedParts, LuxuryBox } from './CraftVisuals';

const BEATS = [
  {
    id: 'parts',
    eyebrow: '01 — Components',
    title: 'Crafted from over 100 precision parts',
    body: 'Gears, dials, bezels, crystals, and bracelet links — each milled to micron tolerance before it ever meets the case.',
  },
  {
    id: 'assemble',
    eyebrow: '02 — Assembly',
    title: 'Assembled by expert hands',
    body: 'Master watchmakers bring every component into harmony — a choreography of steel, gold, and quiet concentration.',
  },
  {
    id: 'finish',
    eyebrow: '03 — Finishing',
    title: 'Engineered for perfection',
    body: 'Polished edges, hand-applied indices, and crystal clarity. The final light catch is never accidental.',
  },
  {
    id: 'pack',
    eyebrow: '04 — Packaging',
    title: 'Delivered in timeless luxury',
    body: 'Nested in a matte-black presentation box with gold foil — the first ritual of ownership.',
  },
  {
    id: 'final',
    eyebrow: '05 — Masterpiece',
    title: 'Not a product. A legacy.',
    body: 'What leaves our atelier is more than a timepiece — it is engineering made eternal.',
  },
];

function playSoftClick() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = 820;
    g.gain.value = 0.028;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    o.stop(ctx.currentTime + 0.08);
    setTimeout(() => ctx.close(), 180);
  } catch {
    /* ignore */
  }
}

export default function CraftStory() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const prevBeat = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.35 });

  const assemble = useTransform(smooth, [0.08, 0.36], [0, 1]);
  const polish = useTransform(smooth, [0.36, 0.52], [0, 1]);
  const packOpen = useTransform(smooth, [0.52, 0.66], [0, 1]);
  const packSeal = useTransform(smooth, [0.66, 0.8], [0, 1]);
  const finalZoom = useTransform(smooth, [0.78, 1], [1, 1.06]);

  const [assembleV, setAssembleV] = useState(0);
  const [polishV, setPolishV] = useState(0);
  const [openV, setOpenV] = useState(0);
  const [sealV, setSealV] = useState(0);
  const [zoomV, setZoomV] = useState(1);

  useEffect(() => {
    const unsubs = [
      assemble.on('change', setAssembleV),
      polish.on('change', setPolishV),
      packOpen.on('change', setOpenV),
      packSeal.on('change', setSealV),
      finalZoom.on('change', setZoomV),
      smooth.on('change', (v) => {
        setActive(Math.min(BEATS.length - 1, Math.floor(v * BEATS.length)));
      }),
    ];
    return () => unsubs.forEach((u) => u());
  }, [assemble, polish, packOpen, packSeal, finalZoom, smooth]);

  useEffect(() => {
    if (active !== prevBeat.current) {
      if (soundOn) playSoftClick();
      prevBeat.current = active;
    }
  }, [active, soundOn]);

  const beat = BEATS[active];
  const showExploded = active <= 1;
  const showWatch = active === 1 || active === 2 || (active === 0 && assembleV > 0.7);
  const showBox = active >= 3;

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#050506]"
      style={{ height: '420vh' }}
      aria-label="How a Luxe Watch is crafted"
    >
      <div className="sticky top-0 h-[100svh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0 craft-story-bg" aria-hidden />
        <div className="absolute inset-0 hero-lux-noise" aria-hidden />

        <div className="relative z-10 h-full section-pad page-wrap grid lg:grid-cols-2 gap-6 lg:gap-12 items-center py-20 md:py-24">
          <div className="order-2 lg:order-1">
            <div className="liquid-glass liquid-panel glow-border p-6 sm:p-8 md:p-10 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center justify-between gap-3 mb-5">
                <p className="text-[10px] sm:text-xs tracking-[0.28em] uppercase text-gold/80">
                  The Atelier Process
                </p>
                <button
                  type="button"
                  onClick={() => setSoundOn((s) => !s)}
                  className="text-[10px] tracking-[0.18em] uppercase text-mist/40 hover:text-gold transition-colors"
                  aria-pressed={soundOn}
                >
                  Sound {soundOn ? 'On' : 'Off'}
                </button>
              </div>

              <div className="flex gap-2 mb-7" aria-hidden>
                {BEATS.map((b, i) => (
                  <div
                    key={b.id}
                    className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                      i <= active ? 'bg-gold' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={beat.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[11px] tracking-[0.22em] uppercase text-mist/45 mb-3">
                    {beat.eyebrow}
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] text-mist leading-[1.1] mb-4">
                    {beat.title}
                  </h2>
                  <p className="text-sm sm:text-base text-mist/55 leading-relaxed max-w-md">
                    {beat.body}
                  </p>
                </motion.div>
              </AnimatePresence>

              {active === BEATS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 flex flex-wrap gap-3"
                >
                  <Link to="/products" className="btn-primary btn-lux">
                    Explore Collection <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/products?sort=newest"
                    className="btn-outline border-gold/40 text-gold hover:bg-gold hover:text-ink btn-lux"
                  >
                    Shop Now
                  </Link>
                </motion.div>
              )}
            </div>
          </div>

          <div className="order-1 lg:order-2 relative h-[40vh] sm:h-[46vh] lg:h-[60vh] flex items-center justify-center">
            <div className="absolute w-[70%] h-[70%] rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />

            <div className="relative w-full h-full max-w-lg mx-auto" style={{ transform: `scale(${zoomV})` }}>
              {showExploded && (
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{ opacity: assembleV > 0.92 ? 0 : 1 }}
                >
                  <ExplodedParts progress={1} assemble={assembleV} />
                </div>
              )}

              {showWatch && !showBox && (
                <div
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                  style={{ opacity: active === 0 ? Math.max(0, (assembleV - 0.7) / 0.3) : 1 }}
                >
                  <AssembledWatch polish={active >= 2 ? polishV : assembleV * 0.4} />
                </div>
              )}

              {showBox && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <LuxuryBox open={active === 4 ? 0 : openV} sealed={active === 4 ? 1 : sealV} />
                </div>
              )}
            </div>

            <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] uppercase text-mist/30 hidden md:block">
              Scroll to continue
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
