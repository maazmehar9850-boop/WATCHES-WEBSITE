import { useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Environment, ContactShadows } from '@react-three/drei';
import WatchAssembly from './WatchAssembly';
import FloatingParts from './FloatingParts';
import WatchBox from './WatchBox';
import { useHeroTimeline } from './useHeroTimeline';

function SceneContent({ partCount, reducedMotion, onComplete, enabled }) {
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
    onComplete,
  });

  return (
    <>
      <color attach="background" args={['#0B0B0B']} />
      <fog attach="fog" args={['#0B0B0B', 6, 16]} />

      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.45} color="#D4AF37" />
      <spotLight
        position={[0, 5, 2]}
        angle={0.45}
        penumbra={0.7}
        intensity={1.1}
        color="#fff5e0"
      />

      <Environment preset="city" environmentIntensity={0.45} />

      <FloatingParts ref={partsRef} count={partCount} />
      <WatchAssembly ref={watchRef} />
      <WatchBox ref={boxRef} />

      <ContactShadows
        position={[0, -1.35, 0]}
        opacity={0.45}
        scale={12}
        blur={2.4}
        far={4}
      />
    </>
  );
}

/**
 * Inner R3F scene — kept separate so Canvas can remount cleanly.
 */
export default function WatchScene({ onComplete, reducedMotion, enabled = true }) {
  const isMobile = useMemo(
    () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false),
    []
  );
  const partCount = reducedMotion ? 0 : isMobile ? 64 : 160;

  return (
    <SceneContent
      partCount={partCount}
      reducedMotion={reducedMotion}
      onComplete={onComplete}
      enabled={enabled}
    />
  );
}
