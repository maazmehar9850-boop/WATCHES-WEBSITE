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
      <color attach="background" args={['#0B0B0B']} />
      <fog attach="fog" args={['#0B0B0B', 8, 16]} />

      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 3]} intensity={1.7} color="#fff6e8" />
      <directionalLight position={[-3, 2, -2]} intensity={0.65} color="#D4AF37" />
      <pointLight position={[stageX, 2.4, 1.2]} intensity={0.85} color="#ffe7b0" distance={12} />
      <spotLight
        position={[stageX + 1, 4, 2]}
        angle={0.4}
        penumbra={0.8}
        intensity={1.2}
        color="#fff8f0"
      />

      <group position={[stageX, isMobile ? 0.4 : 0.15, 0]}>
        <FloatingParts ref={partsRef} count={partCount} />
        <WatchAssembly ref={watchRef} />
        <ContactShadows position={[0, -0.55, 0]} opacity={0.45} scale={8} blur={2.2} far={3.5} />
        <mesh position={[0, -0.54, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.6, 32]} />
          <meshBasicMaterial color="#D4AF37" transparent opacity={0.07} />
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
  const partCount = reducedMotion ? 0 : isMobile ? 40 : 80;

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
