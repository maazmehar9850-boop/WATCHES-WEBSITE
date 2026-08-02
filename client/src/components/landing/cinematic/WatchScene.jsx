import { useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import WatchAssembly from './WatchAssembly';
import FloatingParts from './FloatingParts';
import WatchBox from './WatchBox';
import { useHeroTimeline } from './useHeroTimeline';

function SceneContent({ partCount, reducedMotion, isMobile, onComplete, onWatchReady, enabled }) {
  const watchRef = useRef();
  const partsRef = useRef();
  const boxRef = useRef();
  const camera = useThree((s) => s.camera);

  useHeroTimeline({
    watchRef,
    partsRef,
    boxRef,
    camera,
    enabled,
    reducedMotion,
    isMobile,
    onComplete,
    onWatchReady,
  });

  return (
    <>
      <color attach="background" args={['#0B0B0B']} />
      <fog attach="fog" args={['#0B0B0B', 7, 14]} />

      <ambientLight intensity={0.45} />
      <directionalLight position={[3.5, 5, 2.5]} intensity={1.55} color="#fff8ec" />
      <directionalLight position={[-2.5, 1.5, -2]} intensity={0.55} color="#D4AF37" />
      <pointLight position={[0, 2.2, 1.5]} intensity={0.7} color="#ffecc0" distance={10} />

      {/* Centered stage — pack always happens at origin */}
      <group position={[0, isMobile ? 0.15 : 0, 0]}>
        <FloatingParts ref={partsRef} count={partCount} />
        <WatchAssembly ref={watchRef} />
        <WatchBox ref={boxRef} />
      </group>
    </>
  );
}

export default function WatchScene({ onComplete, onWatchReady, reducedMotion, enabled = true }) {
  const isMobile = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false),
    []
  );
  const partCount = reducedMotion ? 0 : isMobile ? 36 : 72;

  return (
    <SceneContent
      partCount={partCount}
      reducedMotion={reducedMotion}
      isMobile={isMobile}
      onComplete={onComplete}
      onWatchReady={onWatchReady}
      enabled={enabled}
    />
  );
}
