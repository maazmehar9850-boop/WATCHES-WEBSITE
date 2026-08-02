import { forwardRef, useMemo } from 'react';
import { metal, goldMetal, dialMat, glassMat } from './materials';

/** Refined procedural watch — fewer segments, sharper gold accents. */
const WatchAssembly = forwardRef(function WatchAssembly(_, ref) {
  const markers = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return {
          x: Math.cos(a) * 0.7,
          z: Math.sin(a) * 0.7,
          major: i % 3 === 0,
        };
      }),
    []
  );

  return (
    <group ref={ref} position={[0, 0.2, 0]} scale={1.25}>
      {/* Case body */}
      <mesh material={metal}>
        <cylinderGeometry args={[1.0, 1.02, 0.32, 32]} />
      </mesh>
      {/* Case rim */}
      <mesh material={metal} position={[0, 0.14, 0]}>
        <cylinderGeometry args={[1.04, 1.04, 0.06, 32]} />
      </mesh>
      {/* Gold bezel */}
      <mesh material={goldMetal} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.98, 0.07, 8, 32]} />
      </mesh>
      {/* Dial */}
      <mesh material={dialMat} position={[0, 0.17, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 32]} />
      </mesh>
      {/* Inner gold ring */}
      <mesh material={goldMetal} position={[0, 0.175, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.82, 0.012, 6, 32]} />
      </mesh>
      {markers.map((m, i) => (
        <mesh
          key={i}
          material={goldMetal}
          position={[m.x, 0.18, m.z]}
          rotation={[0, -Math.atan2(m.z, m.x), 0]}
        >
          <boxGeometry args={[m.major ? 0.055 : 0.028, 0.018, m.major ? 0.14 : 0.08]} />
        </mesh>
      ))}
      {/* Hands */}
      <mesh material={goldMetal} position={[0.2, 0.2, 0]} rotation={[0, 0, -0.45]}>
        <boxGeometry args={[0.42, 0.018, 0.045]} />
      </mesh>
      <mesh material={metal} position={[0.02, 0.205, 0.26]} rotation={[0, 0, 1.05]}>
        <boxGeometry args={[0.58, 0.014, 0.03]} />
      </mesh>
      <mesh material={goldMetal} position={[0, 0.21, 0]}>
        <sphereGeometry args={[0.045, 10, 10]} />
      </mesh>
      {/* Crown */}
      <mesh material={goldMetal} position={[1.12, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.08, 0.16, 10]} />
      </mesh>
      {/* Crystal */}
      <mesh material={glassMat} position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 32]} />
      </mesh>
      {/* Bracelet */}
      <mesh material={metal} position={[0, -0.02, 1.05]}>
        <boxGeometry args={[0.65, 0.1, 0.5]} />
      </mesh>
      <mesh material={metal} position={[0, -0.02, -1.05]}>
        <boxGeometry args={[0.65, 0.1, 0.5]} />
      </mesh>
      <mesh material={goldMetal} position={[0, 0.02, 1.28]}>
        <boxGeometry args={[0.55, 0.04, 0.08]} />
      </mesh>
      <mesh material={goldMetal} position={[0, 0.02, -1.28]}>
        <boxGeometry args={[0.55, 0.04, 0.08]} />
      </mesh>
    </group>
  );
});

export default WatchAssembly;
