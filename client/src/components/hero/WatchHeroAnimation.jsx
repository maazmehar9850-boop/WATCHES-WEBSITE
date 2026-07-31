import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  WatchDefs,
  Gear,
  WatchCase,
  Dial,
  HourHand,
  MinuteHand,
  SecondHand,
  Crown,
  Screws,
  Glass,
  Bezel,
  StrapLeft,
  StrapRight,
} from './WatchParts';
import { LOOP_SECONDS, T, PARTS } from './timeline';
import './WatchHero.css';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp01(t) {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * Sample part pose. Returns null when fully settled (caller can skip DOM write).
 */
function samplePart(scatter, assembleAt, duration, spin, hideAfter, time, force) {
  const start = assembleAt - 0.25;
  const end = assembleAt + duration;

  if (!force && hideAfter != null && time >= hideAfter) {
    return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0, settled: true };
  }

  if (!force && time >= end && (hideAfter == null || time < hideAfter - 0.4)) {
    return { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, settled: true };
  }

  let x = scatter.x;
  let y = scatter.y;
  let rotate = scatter.rotate || 0;
  let scale = scatter.scale ?? 1;
  let opacity = 1;

  if (time < start) {
    const phase = scatter.x * 0.01;
    const w = Math.sin(time * 1.8 + phase) * 4;
    y = scatter.y + w;
    rotate = (scatter.rotate || 0) + w * 0.25;
  } else if (time < end) {
    const t = easeOutCubic(clamp01((time - start) / (end - start)));
    x = lerp(scatter.x, 0, t);
    y = lerp(scatter.y, 0, t);
    rotate = lerp(scatter.rotate || 0, spin || 0, t);
    scale = lerp(scatter.scale ?? 1, 1, t);
  } else {
    x = 0;
    y = 0;
    rotate = 0;
    scale = 1;
  }

  if (hideAfter != null) {
    if (time >= hideAfter) opacity = 0;
    else if (time > hideAfter - 0.35) opacity = clamp01((hideAfter - time) / 0.35);
  }

  return { x, y, rotate, scale, opacity, settled: false };
}

const PART_CONFIG = [
  { id: 'strapL', scatter: PARTS.strapLeft, at: T.strap, dur: 1.05 },
  { id: 'strapR', scatter: PARTS.strapRight, at: T.strap + 0.1, dur: 1.05 },
  { id: 'case', scatter: PARTS.case, at: T.gears, dur: 0.95 },
  { id: 'g1', scatter: PARTS.gearLarge, at: T.gears, dur: 1.15, spin: 360, hide: T.dial + 0.45 },
  { id: 'g2', scatter: PARTS.gearSmall, at: T.gears + 0.1, dur: 1.05, spin: -400, hide: T.dial + 0.45 },
  { id: 'g3', scatter: PARTS.gearTiny, at: T.gears + 0.18, dur: 1, spin: 480, hide: T.dial + 0.45 },
  { id: 'dial', scatter: PARTS.dial, at: T.dial, dur: 1.05 },
  { id: 'hh', scatter: PARTS.hourHand, at: T.hands, dur: 0.85, spin: -40 },
  { id: 'mh', scatter: PARTS.minuteHand, at: T.hands + 0.08, dur: 0.85, spin: 60 },
  { id: 'sh', scatter: PARTS.secondHand, at: T.hands + 0.16, dur: 0.8, spin: 120 },
  { id: 'crown', scatter: PARTS.crown, at: T.crown, dur: 0.75 },
  { id: 'screws', scatter: PARTS.screwTL, at: T.crown + 0.1, dur: 0.7, spin: 180 },
  { id: 'glass', scatter: PARTS.glass, at: T.glass, dur: 0.85 },
  { id: 'bezel', scatter: PARTS.bezel, at: T.bezel, dur: 0.8, spin: -80 },
];

const AssembledStatic = () => (
  <g transform="translate(0, -20)">
    <StrapLeft />
    <StrapRight />
    <WatchCase />
    <Dial />
    <HourHand />
    <MinuteHand />
    <SecondHand />
    <Crown />
    <Glass />
    <Bezel />
  </g>
);

const WatchHeroAnimation = () => {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  const stageRef = useRef(null);
  const rootRef = useRef(null);
  const boxRef = useRef(null);
  const lidRef = useRef(null);
  const sparkleRef = useRef(null);
  const partRefs = useRef({});
  const settledRef = useRef({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.12,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!mounted || reduceMotion || !visible) return undefined;

    let raf = 0;
    let start = performance.now();
    let running = true;
    let lastFrame = 0;
    let loopsDone = 0;
    const FRAME_MS = 33;
    const MAX_LOOPS = 1; // play once, then freeze — kills ongoing RAF cost

    const setPart = (id, t) => {
      const node = partRefs.current[id];
      if (!node) return;
      node.setAttribute(
        'transform',
        `translate(${t.x.toFixed(1)} ${t.y.toFixed(1)}) rotate(${t.rotate.toFixed(1)}) scale(${t.scale.toFixed(2)})`
      );
      node.style.opacity = t.opacity.toFixed(2);
    };

    const freezeAssembled = () => {
      for (const cfg of PART_CONFIG) {
        if (cfg.hide != null) {
          setPart(cfg.id, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 0 });
        } else {
          setPart(cfg.id, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
        }
      }
      const root = rootRef.current;
      if (root) root.setAttribute('transform', 'translate(0 152) rotate(360) scale(0.4)');
      const box = boxRef.current;
      if (box) {
        box.style.opacity = '1';
        box.setAttribute('transform', 'translate(0 128)');
      }
      const lid = lidRef.current;
      if (lid) lid.setAttribute('transform', 'rotate(0)');
      const sparkle = sparkleRef.current;
      if (sparkle) sparkle.style.opacity = '0';
      const glow = stageRef.current?.querySelector('.wh-glow');
      if (glow) glow.style.animation = 'none';
    };

    const tick = (now) => {
      if (!running) return;

      if (now - lastFrame < FRAME_MS) {
        raf = requestAnimationFrame(tick);
        return;
      }
      lastFrame = now;

      const total = (now - start) / 1000;
      const elapsed = total % LOOP_SECONDS;
      const currentLoop = Math.floor(total / LOOP_SECONDS);

      if (currentLoop >= MAX_LOOPS) {
        freezeAssembled();
        running = false;
        return;
      }

      if (currentLoop > loopsDone) {
        loopsDone = currentLoop;
        settledRef.current = {};
      }

      const assembling = elapsed < T.assembled + 0.15;

      for (const cfg of PART_CONFIG) {
        if (!assembling && settledRef.current[cfg.id]) continue;

        const sampled = samplePart(
          cfg.scatter,
          cfg.at,
          cfg.dur,
          cfg.spin || 0,
          cfg.hide ?? null,
          elapsed,
          false
        );

        if (sampled.settled) {
          if (!settledRef.current[cfg.id]) {
            setPart(cfg.id, sampled);
            settledRef.current[cfg.id] = true;
          }
          continue;
        }

        setPart(cfg.id, sampled);
      }

      const root = rootRef.current;
      if (root) {
        let ry = 0;
        let rs = 1;
        let rr = 0;

        if (elapsed >= T.assembled && elapsed < T.watchToBox) {
          const t = easeInOut(clamp01((elapsed - T.assembled) / (T.rotateEnd - T.assembled)));
          rr = t * 360;
        } else if (elapsed >= T.watchToBox && elapsed < T.lidClose + 0.4) {
          const t = easeOutCubic(clamp01((elapsed - T.watchToBox) / 1.35));
          rr = 360;
          ry = lerp(0, 152, t);
          rs = lerp(1, 0.4, t);
        } else if (elapsed >= T.lidClose + 0.4) {
          rr = 360;
          ry = 152;
          rs = 0.4;
        }

        root.setAttribute(
          'transform',
          `translate(0 ${ry.toFixed(1)}) rotate(${rr.toFixed(1)}) scale(${rs.toFixed(2)})`
        );
      }

      const box = boxRef.current;
      const lid = lidRef.current;
      const sparkle = sparkleRef.current;

      if (box) {
        if (elapsed < T.boxIn) {
          box.style.opacity = '0';
          box.setAttribute('transform', 'translate(220 128)');
        } else if (elapsed < T.boxIn + 1) {
          const t = easeOutCubic(clamp01((elapsed - T.boxIn) / 1));
          box.style.opacity = String(t.toFixed(2));
          box.setAttribute('transform', `translate(${lerp(220, 0, t).toFixed(0)} 128)`);
        } else {
          box.style.opacity = '1';
          box.setAttribute('transform', 'translate(0 128)');
        }
      }

      if (lid) {
        let angle = 0;
        if (elapsed >= T.lidOpen && elapsed < T.lidClose) {
          if (elapsed < T.lidOpen + 0.9) {
            angle = lerp(0, -112, easeOutCubic(clamp01((elapsed - T.lidOpen) / 0.9)));
          } else {
            angle = -112;
          }
        } else if (elapsed >= T.lidClose && elapsed < T.lidClose + 1) {
          angle = lerp(-112, 0, easeOutCubic(clamp01((elapsed - T.lidClose) / 1)));
        }
        lid.setAttribute('transform', `rotate(${angle.toFixed(1)})`);
      }

      if (sparkle) {
        const on = elapsed >= T.sparkle && elapsed < T.sparkle + 0.9;
        if (on) {
          const p = (elapsed - T.sparkle) / 0.9;
          sparkle.style.opacity = String(Math.sin(p * Math.PI).toFixed(2));
          sparkle.setAttribute('transform', `scale(${(0.6 + p * 0.8).toFixed(2)})`);
        } else {
          sparkle.style.opacity = '0';
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
  }, [mounted, reduceMotion, visible]);

  if (!mounted) {
    return <div className="wh-stage wh-stage--placeholder" aria-hidden />;
  }

  if (reduceMotion) {
    return (
      <div className="wh-stage" aria-hidden>
        <div className="wh-vignette" />
        <svg viewBox="-200 -160 400 360" className="wh-svg">
          <WatchDefs />
          <AssembledStatic />
        </svg>
      </div>
    );
  }

  return (
    <div className="wh-stage" ref={stageRef} aria-hidden>
      <div className="wh-glow" />
      <div className="wh-vignette" />

      <svg viewBox="-220 -180 440 400" className="wh-svg">
        <WatchDefs />

        <g ref={boxRef} style={{ opacity: 0 }} transform="translate(220 128)">
          <rect x="-92" y="0" width="184" height="74" rx="7" fill="url(#wh-box)" />
          <rect x="-86" y="7" width="172" height="52" rx="4" fill="url(#wh-velvet)" />
          <ellipse cx="0" cy="34" rx="52" ry="15" fill="#2a0e18" opacity="0.75" />
          <rect
            x="-92"
            y="0"
            width="184"
            height="74"
            rx="7"
            fill="none"
            stroke="#c9a227"
            strokeWidth="1.2"
            opacity="0.55"
          />
          <text
            x="0"
            y="62"
            textAnchor="middle"
            fill="#c9a227"
            fontSize="7"
            fontFamily="Georgia, serif"
            letterSpacing="3.5"
            opacity="0.75"
          >
            LUXEWATCH
          </text>
          <g ref={lidRef}>
            <path
              d="M -92 0 L -92 -10 Q -92 -20 -80 -20 L 80 -20 Q 92 -20 92 -10 L 92 0 Z"
              fill="url(#wh-box)"
              stroke="#c9a227"
              strokeWidth="1"
            />
            <rect x="-72" y="-16" width="144" height="9" rx="1" fill="rgba(201,162,39,0.14)" />
          </g>
          <g ref={sparkleRef} style={{ opacity: 0 }} transform="translate(0 -8)">
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={Math.cos(a) * 28}
                  cy={Math.sin(a) * 16}
                  r="2"
                  fill="#e8d48b"
                />
              );
            })}
          </g>
        </g>

        <g ref={rootRef}>
          {PART_CONFIG.map((cfg) => {
            const s = cfg.scatter;
            const content = {
              strapL: <StrapLeft />,
              strapR: <StrapRight />,
              case: <WatchCase />,
              g1: (
                <g transform="translate(-18 8)">
                  <Gear size={30} teeth={8} />
                </g>
              ),
              g2: (
                <g transform="translate(20 -6)">
                  <Gear size={22} teeth={7} />
                </g>
              ),
              g3: (
                <g transform="translate(2 22)">
                  <Gear size={14} teeth={6} />
                </g>
              ),
              dial: <Dial />,
              hh: <HourHand />,
              mh: <MinuteHand />,
              sh: <SecondHand />,
              crown: <Crown />,
              screws: <Screws />,
              glass: <Glass />,
              bezel: <Bezel />,
            }[cfg.id];

            return (
              <g
                key={cfg.id}
                ref={(n) => {
                  partRefs.current[cfg.id] = n;
                }}
                transform={`translate(${s.x} ${s.y}) rotate(${s.rotate || 0}) scale(${s.scale ?? 1})`}
              >
                {content}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="wh-dof" />
    </div>
  );
};

export default WatchHeroAnimation;
