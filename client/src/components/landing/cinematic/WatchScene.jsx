import { useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import WatchAssembly from './WatchAssembly';
import FloatingParts from './FloatingParts';
import { useHeroTimeline } from './useHeroTimeline';

function SceneContent({ partCount, reducedMotion, isMobile, stageX, onComplete, onWatchReady, enabled }) {
  const watchRef = useRef();
  const partsRef = useRef();
  const camera = useThree((s) => s.camera);

  useHeroTimeline({
    watchRef,
    partsRef,
    camera,
    enabled,
    reducedMotion,
    isMobile,
    stageX,
    onComplete,
    onWatchReady,
  });

  return (
    <>
      {/* Transparent clear — CSS hero bg shows through */}
      <fog attach="fog" args={['#0B0B0B', 10, 18]} />

      <ambientLight intensity={0.48} />
      <directionalLight position={[3.5, 5.5, 3]} intensity={1.75} color="#fff6e8" />
      <directionalLight position={[-2.5, 2, -2]} intensity={0.7} color="#D4AF37" />
      <pointLight position={[stageX, 2.2, 1.4]} intensity={0.9} color="#ffe7b0" distance={12} />

      {/* Mobile: higher + slightly smaller so full watch fits the upper band */}
      <group position={[stageX, isMobile ? 0.15 : 0.15, 0]} scale={isMobile ? 0.92 : 1}>
        <FloatingParts ref={partsRef} count={partCount} />
        <WatchAssembly ref={watchRef} />
        <ContactShadows position={[0, -0.7, 0]} opacity={0.4} scale={7} blur={2} far={3} />
        <mesh position={[0, -0.69, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.45, 32]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.08} />
        </mesh>
      </group>
    </>
  );
}

export default function WatchScene({ onComplete, onWatchReady, reducedMotion, enabled = true }) {
  const isMobile = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false),
    []
  );
  const stageX = isMobile ? 0 : 1.05;
  const partCount = reducedMotion ? 0 : isMobile ? 32 : 80;

  return (
    <SceneContent
      partCount={partCount}
      reducedMotion={reducedMotion}
      isMobile={isMobile}
      stageX={stageX}
      onComplete={onComplete}
      onWatchReady={onWatchReady}
      enabled={enabled}
    />
  );
}
