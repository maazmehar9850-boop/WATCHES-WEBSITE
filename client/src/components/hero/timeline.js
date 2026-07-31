/**
 * Timing (seconds) for one cinematic loop
 * Float → Assemble → Reveal → Package → Pause → Reset
 */
export const LOOP_SECONDS = 20;

export const T = {
  floatEnd: 1.4,
  gears: 1.6,
  dial: 2.4,
  hands: 3.4,
  crown: 4.2,
  glass: 5.0,
  bezel: 5.7,
  strap: 6.4,
  assembled: 7.4,
  rotateEnd: 11.0,
  boxIn: 11.2,
  lidOpen: 12.0,
  watchToBox: 13.2,
  lidClose: 15.0,
  sparkle: 15.6,
  pauseEnd: 17.8,
};

/** Scattered start poses relative to assembled (px / deg) */
export const PARTS = {
  gearLarge: { x: -72, y: 48, rotate: -140, scale: 0.85 },
  gearSmall: { x: 88, y: -36, rotate: 200, scale: 0.9 },
  gearTiny: { x: -40, y: -78, rotate: -90, scale: 0.8 },
  dial: { x: 0, y: -110, rotate: -18, scale: 0.92 },
  hourHand: { x: -95, y: 20, rotate: -110 },
  minuteHand: { x: 105, y: -30, rotate: 95 },
  secondHand: { x: 60, y: 95, rotate: 160 },
  crown: { x: 130, y: 10, rotate: 45 },
  screwTL: { x: -100, y: -90, rotate: -200 },
  screwTR: { x: 110, y: -85, rotate: 180 },
  screwBL: { x: -105, y: 100, rotate: 220 },
  screwBR: { x: 100, y: 95, rotate: -160 },
  glass: { x: 0, y: -160, rotate: 0, scale: 1.08 },
  bezel: { x: 0, y: 140, rotate: 90, scale: 1.05 },
  strapLeft: { x: -180, y: 20, rotate: -25 },
  strapRight: { x: 180, y: -15, rotate: 22 },
  case: { x: 15, y: 30, rotate: 8, scale: 0.96 },
};
