/**
 * SVG watch-part visuals for the craftsmanship story.
 * Pure vectors — no heavy 3D, mobile-friendly.
 */
import { motion } from 'framer-motion';
import { useState } from 'react';

const GOLD = '#D4AF37';
const SILVER = '#C8CDD4';
const STEEL = '#8B9098';
const INK = '#0B0B0B';

const PARTS = [
  { id: 'gear', label: 'Escapement Gear', x: -120, y: -70, r: -18 },
  { id: 'dial', label: 'Sapphire Dial', x: 110, y: -80, r: 12 },
  { id: 'case', label: 'Steel Case', x: -100, y: 75, r: 8 },
  { id: 'bezel', label: 'Gold Bezel', x: 130, y: 40, r: -10 },
  { id: 'crown', label: 'Crown', x: 150, y: -10, r: 0 },
  { id: 'strap', label: 'Bracelet Link', x: -140, y: 10, r: 20 },
  { id: 'hand', label: 'Hour Hand', x: 40, y: -110, r: 35 },
  { id: 'crystal', label: 'Crystal Glass', x: -40, y: 110, r: -5 },
];

function Gear({ size = 36, className }) {
  return (
    <g className={className}>
      <circle r={size * 0.55} fill="none" stroke={GOLD} strokeWidth="2.5" />
      <circle r={size * 0.18} fill={GOLD} />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <rect
            key={i}
            x={-3}
            y={-size * 0.72}
            width="6"
            height={size * 0.28}
            fill={GOLD}
            transform={`rotate(${(a * 180) / Math.PI})`}
          />
        );
      })}
    </g>
  );
}

function PartShape({ id }) {
  switch (id) {
    case 'gear':
      return <Gear />;
    case 'dial':
      return (
        <g>
          <circle r="34" fill={INK} stroke={SILVER} strokeWidth="2" />
          <circle r="28" fill="none" stroke={GOLD} strokeWidth="1" opacity="0.7" />
          {[0, 90, 180, 270].map((d) => (
            <rect key={d} x="-1.5" y="-26" width="3" height="8" fill={GOLD} transform={`rotate(${d})`} />
          ))}
        </g>
      );
    case 'case':
      return <circle r="38" fill="none" stroke={SILVER} strokeWidth="6" />;
    case 'bezel':
      return <circle r="42" fill="none" stroke={GOLD} strokeWidth="4" opacity="0.9" />;
    case 'crown':
      return (
        <g>
          <rect x="-6" y="-10" width="12" height="20" rx="2" fill={GOLD} />
          <rect x="-8" y="-4" width="4" height="8" fill={STEEL} />
        </g>
      );
    case 'strap':
      return (
        <g>
          <rect x="-18" y="-10" width="36" height="20" rx="3" fill={STEEL} />
          <rect x="-12" y="-3" width="24" height="6" fill={GOLD} opacity="0.8" />
        </g>
      );
    case 'hand':
      return <rect x="-2" y="-28" width="4" height="32" rx="1" fill={GOLD} />;
    case 'crystal':
      return <circle r="30" fill={SILVER} opacity="0.25" stroke={SILVER} strokeWidth="1.5" />;
    default:
      return null;
  }
}

/** Exploded floating parts with hover labels */
export function ExplodedParts({ progress = 0, assemble = 0 }) {
  const [hovered, setHovered] = useState(null);

  return (
    <svg viewBox="-200 -160 400 320" className="w-full h-full max-h-[420px]">
      <defs>
        <radialGradient id="craftGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={GOLD} stopOpacity="0.2" />
          <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="90" fill="url(#craftGlow)" />
      {PARTS.map((p, i) => {
        const t = Math.min(1, Math.max(0, assemble));
        const x = p.x * (1 - t);
        const y = p.y * (1 - t);
        const rot = p.r * (1 - t);
        const delay = i * 0.04;
        const isHot = hovered === p.id;
        return (
          <motion.g
            key={p.id}
            initial={false}
            animate={{ x, y, rotate: rot, opacity: 0.55 + progress * 0.45 }}
            transition={{ type: 'spring', stiffness: 60, damping: 18, delay }}
            className="cursor-pointer"
            style={{ transformOrigin: '0px 0px' }}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(p.id)}
            onBlur={() => setHovered(null)}
            tabIndex={0}
            role="img"
            aria-label={p.label}
          >
            <PartShape id={p.id} />
            {isHot && assemble < 0.85 && (
              <text
                y={52}
                textAnchor="middle"
                fill={GOLD}
                fontSize="10"
                letterSpacing="0.14em"
                style={{ fontFamily: 'Outfit, sans-serif', textTransform: 'uppercase' }}
              >
                {p.label}
              </text>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

/** Assembled watch silhouette */
export function AssembledWatch({ polish = 0, scale = 1 }) {
  const shine = 0.35 + polish * 0.45;
  return (
    <svg viewBox="-120 -140 240 280" className="w-full h-full max-h-[440px]" style={{ transform: `scale(${scale})` }}>
      <defs>
        <linearGradient id="caseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E8ECF0" />
          <stop offset="50%" stopColor="#A8AEB6" />
          <stop offset="100%" stopColor="#6E747C" />
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0D78C" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A7019" />
        </linearGradient>
        <radialGradient id="dialGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#1a1a1e" />
          <stop offset="100%" stopColor="#050506" />
        </radialGradient>
      </defs>
      {/* Strap */}
      <rect x="-28" y="70" width="56" height="55" rx="4" fill="#1c1c20" stroke={GOLD} strokeWidth="1" opacity="0.9" />
      <rect x="-28" y="-125" width="56" height="55" rx="4" fill="#1c1c20" stroke={GOLD} strokeWidth="1" opacity="0.9" />
      {/* Case */}
      <circle r="68" fill="url(#caseGrad)" />
      <circle r="62" fill="none" stroke="url(#goldGrad)" strokeWidth="5" />
      <circle r="54" fill="url(#dialGrad)" />
      <circle r="50" fill="none" stroke={GOLD} strokeWidth="1" opacity={shine} />
      {/* Markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const major = i % 3 === 0;
        const x1 = Math.cos(a) * (major ? 42 : 44);
        const y1 = Math.sin(a) * (major ? 42 : 44);
        const x2 = Math.cos(a) * 48;
        const y2 = Math.sin(a) * 48;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={GOLD}
            strokeWidth={major ? 2.5 : 1.2}
            strokeLinecap="round"
          />
        );
      })}
      {/* Hands */}
      <line x1="0" y1="0" x2="0" y2="-28" stroke={GOLD} strokeWidth="3" strokeLinecap="round" />
      <line x1="0" y1="0" x2="22" y2="8" stroke={SILVER} strokeWidth="2" strokeLinecap="round" />
      <circle r="4" fill={GOLD} />
      {/* Crown */}
      <rect x="62" y="-8" width="14" height="16" rx="2" fill="url(#goldGrad)" />
      {/* Crystal reflection */}
      <ellipse cx="-18" cy="-18" rx="16" ry="10" fill="#fff" opacity={0.08 + polish * 0.1} />
    </svg>
  );
}

/** Luxury box with optional open lid + watch nestled */
export function LuxuryBox({ open = 0, sealed = 0 }) {
  const lidAngle = -110 * open * (1 - sealed);
  return (
    <svg viewBox="-140 -120 280 260" className="w-full h-full max-h-[420px]">
      <defs>
        <linearGradient id="boxGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1e" />
          <stop offset="100%" stopColor="#0a0a0c" />
        </linearGradient>
        <linearGradient id="boxGold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A7019" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8A7019" />
        </linearGradient>
      </defs>
      {/* Base */}
      <rect x="-90" y="20" width="180" height="70" rx="4" fill="url(#boxGrad)" stroke="url(#boxGold)" strokeWidth="2" />
      <rect x="-80" y="28" width="160" height="12" fill="#121214" />
      {/* Interior cushion */}
      <ellipse cx="0" cy="55" rx="50" ry="18" fill="#161618" />
      {/* Nested watch (small) when packing */}
      <g transform="translate(0,48) scale(0.35)" opacity={0.3 + open * 0.7}>
        <circle r="54" fill="#A8AEB6" />
        <circle r="48" fill="#0a0a0c" stroke={GOLD} strokeWidth="3" />
        <circle r="4" fill={GOLD} />
      </g>
      {/* Lid */}
      <g style={{ transformOrigin: '0px 20px', transform: `rotate(${lidAngle}deg)` }}>
        <rect x="-90" y="-50" width="180" height="70" rx="4" fill="url(#boxGrad)" stroke="url(#boxGold)" strokeWidth="2" />
        <text
          y="-10"
          textAnchor="middle"
          fill={GOLD}
          fontSize="11"
          letterSpacing="0.28em"
          opacity={0.4 + sealed * 0.6}
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          LUXE WATCHES
        </text>
      </g>
      {/* Soft glow when sealed */}
      <ellipse cx="0" cy="55" rx="100" ry="40" fill={GOLD} opacity={sealed * 0.12} />
    </svg>
  );
}
