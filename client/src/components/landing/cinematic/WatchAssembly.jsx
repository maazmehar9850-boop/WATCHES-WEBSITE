import { forwardRef, useMemo } from 'react';
import { metal, goldMetal, dialMat, glassMat } from './materials';

/**
 * Procedural luxury watch — low segment counts for 60 FPS.
 * Exposed via ref group for GSAP transforms.
 */
const WatchAssembly = forwardRef(function WatchAssembly(_, ref) {
  const markers = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
      return {
        x: Math.cos(a) * 0.72,
        y: Math.sin(a) * 0.72,
        major: i % 3 === 0,
      };
    });
  }, []);

  return (
    <group ref={ref} position={[0, 0.35, 0]} scale={1.15}>
      {/* Case */}
      <mesh material={metal} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 0.28, 48]} />
      </mesh>
      {/* Bezel */}
      <mesh material={goldMetal} position={[0, 0.16, 0]} castShadow>
        <torusGeometry args={[1.02, 0.08, 12, 48]} />
      </mesh>
      {/* Dial */}
      <mesh material={dialMat} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.92, 48]} />
      </mesh>
      {/* Hour markers */}
      {markers.map((m, i) => (
        <mesh
          key={i}
          material={goldMetal}
          position={[m.x, 0.16, m.y]}
          rotation={[0, 0, Math.atan2(m.y, m.x)]}
        >
          <boxGeometry args={[m.major ? 0.06 : 0.03, 0.02, m.major ? 0.16 : 0.1]} />
        </mesh>
      ))}
      {/* Hands */}
      <mesh material={goldMetal} position={[0.22, 0.18, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.45, 0.02, 0.05]} />
      </mesh>
      <mesh material={metal} position={[0.05, 0.185, 0.28]} rotation={[0, 0, 1.1]}>
        <boxGeometry args={[0.62, 0.015, 0.035]} />
      </mesh>
      <mesh material={goldMetal} position={[0, 0.19, 0]}>
        <sphereGeometry args={[0.05, 12, 12]} />
      </mesh>
      {/* Crown */}
      <mesh material={goldMetal} position={[1.18, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 0.18, 12]} />
      </mesh>
      {/* Crystal */}
      <mesh material={glassMat} position={[0, 0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 48]} />
      </mesh>
      {/* Bracelet stubs */}
      <mesh material={metal} position={[0, -0.05, 1.15]} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.55]} />
      </mesh>
      <mesh material={metal} position={[0, -0.05, -1.15]} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.55]} />
      </mesh>
    </group>
  );
});

export default WatchAssembly;
