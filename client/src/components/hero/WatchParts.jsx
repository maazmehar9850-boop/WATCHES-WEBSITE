/** Lean premium defs — few gradients, no filters */
export const WatchDefs = () => (
  <defs>
    <linearGradient id="wh-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f0e0a8" />
      <stop offset="50%" stopColor="#c9a227" />
      <stop offset="100%" stopColor="#6e5914" />
    </linearGradient>
    <linearGradient id="wh-gold-bright" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#fff6d4" />
      <stop offset="100%" stopColor="#8a7019" />
    </linearGradient>
    <linearGradient id="wh-silver" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f4f2ec" />
      <stop offset="55%" stopColor="#9a978f" />
      <stop offset="100%" stopColor="#3a3834" />
    </linearGradient>
    <linearGradient id="wh-dial" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#1e1e22" />
      <stop offset="100%" stopColor="#080809" />
    </linearGradient>
    <linearGradient id="wh-strap" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#14100c" />
      <stop offset="50%" stopColor="#3a2a20" />
      <stop offset="100%" stopColor="#14100c" />
    </linearGradient>
    <linearGradient id="wh-glass" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
      <stop offset="45%" stopColor="rgba(255,255,255,0.03)" />
      <stop offset="100%" stopColor="rgba(180,210,255,0.1)" />
    </linearGradient>
    <linearGradient id="wh-velvet" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#3a1220" />
      <stop offset="100%" stopColor="#14060c" />
    </linearGradient>
    <linearGradient id="wh-box" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#2e2418" />
      <stop offset="100%" stopColor="#0c0a08" />
    </linearGradient>
  </defs>
);

export function Gear({ size = 28, teeth = 8 }) {
  const r = size / 2;
  const teethEls = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const x = Math.cos(a) * r * 0.78;
    const y = Math.sin(a) * r * 0.78;
    teethEls.push(
      <rect
        key={i}
        x={x - 2}
        y={y - 3}
        width={4}
        height={6.5}
        rx={0.5}
        fill="#c9a227"
        transform={`rotate(${(a * 180) / Math.PI} ${x} ${y})`}
      />
    );
  }
  return (
    <g>
      {teethEls}
      <circle r={r * 0.7} fill="#d4b84a" />
      <circle r={r * 0.38} fill="#141210" />
      <circle r={r * 0.14} fill="#c9a227" />
    </g>
  );
}

export function WatchCase() {
  return (
    <g>
      <ellipse cx="0" cy="9" rx="80" ry="11" fill="rgba(0,0,0,0.4)" />
      <circle r="77" fill="url(#wh-silver)" />
      <circle r="70" fill="#161618" />
      <circle r="70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
    </g>
  );
}

export function Dial() {
  const marks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const major = i % 3 === 0;
    return (
      <line
        key={i}
        x1={Math.cos(a) * (major ? 46 : 50)}
        y1={Math.sin(a) * (major ? 46 : 50)}
        x2={Math.cos(a) * 57}
        y2={Math.sin(a) * 57}
        stroke="#c9a227"
        strokeWidth={major ? 3 : 1.8}
        strokeLinecap="round"
      />
    );
  });

  return (
    <g>
      <circle r="62" fill="url(#wh-dial)" />
      <circle r="58" fill="none" stroke="rgba(201,162,39,0.15)" strokeWidth="0.7" />
      {marks}
      <text
        x="0"
        y="-24"
        textAnchor="middle"
        fill="#e8d48b"
        fontSize="8"
        fontFamily="Georgia, serif"
        letterSpacing="2"
      >
        LUXE
      </text>
      <rect x="28" y="-6" width="15" height="11" rx="1" fill="#0a0a0b" stroke="#c9a227" strokeWidth="0.6" />
      <text x="35.5" y="2.5" textAnchor="middle" fill="#e8d48b" fontSize="7" fontFamily="Georgia, serif">
        31
      </text>
      <circle r="3.4" fill="#c9a227" />
    </g>
  );
}

export function HourHand() {
  return (
    <path d="M -2.6 8 L -2.8 -30 L 0 -34 L 2.8 -30 L 2.6 8 Z" fill="url(#wh-gold)" />
  );
}

export function MinuteHand() {
  return (
    <path d="M -1.8 10 L -2 -46 L 0 -50 L 2 -46 L 1.8 10 Z" fill="url(#wh-gold-bright)" />
  );
}

export function SecondHand() {
  return (
    <g>
      <line x1="0" y1="14" x2="0" y2="-52" stroke="#e8d48b" strokeWidth="1" strokeLinecap="round" />
      <circle cy="-52" r="2.2" fill="#c9a227" />
      <circle r="2" fill="#c9a227" />
    </g>
  );
}

export function Crown() {
  return (
    <g>
      <rect x="68" y="-7" width="12" height="14" rx="2.5" fill="#c9a227" />
      <rect x="79" y="-10" width="8" height="20" rx="2" fill="#e8d48b" />
    </g>
  );
}

export function Screws() {
  const pts = [
    [-50, -50],
    [50, -50],
    [-50, 50],
    [50, 50],
  ];
  return (
    <g>
      {pts.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3.6" fill="#c8c5be" />
      ))}
    </g>
  );
}

export function Glass() {
  return (
    <g>
      <circle r="61" fill="url(#wh-glass)" />
      <path
        d="M -30 -36 Q -6 -52 22 -42"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </g>
  );
}

export function Bezel() {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    return (
      <line
        key={i}
        x1={Math.cos(a) * 66}
        y1={Math.sin(a) * 66}
        x2={Math.cos(a) * 72}
        y2={Math.sin(a) * 72}
        stroke="#f0e0a8"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    );
  });
  return (
    <g>
      <circle r="74.5" fill="none" stroke="#c9a227" strokeWidth="7.5" />
      {ticks}
      <path d="M 0 -78 L -4 -70 L 4 -70 Z" fill="#f0e0a8" />
    </g>
  );
}

export function StrapLeft() {
  return (
    <path
      d="M -44 -28 C -90 -32 -130 -28 -156 -18 L -156 18 C -130 28 -90 32 -44 28 Z"
      fill="url(#wh-strap)"
    />
  );
}

export function StrapRight() {
  return (
    <g>
      <path
        d="M 44 -28 C 90 -32 130 -28 156 -18 L 156 18 C 130 28 90 32 44 28 Z"
        fill="url(#wh-strap)"
      />
      <rect x="146" y="-14" width="18" height="28" rx="3" fill="#c9a227" />
    </g>
  );
}
