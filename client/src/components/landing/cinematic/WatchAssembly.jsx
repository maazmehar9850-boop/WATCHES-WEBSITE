import { forwardRef, useMemo } from 'react';
import { metal, goldMetal, dialMat, glassMat, strapMat } from './materials';

/** Higher-detail procedural watch that stays on the hero poster. */
const WatchAssembly = forwardRef(function WatchAssembly(_, ref) {
  const markers = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return {
          x: Math.cos(a) * 0.72,
          z: Math.sin(a) * 0.72,
          major: i % 3 === 0,
        };
      }),
    []
  );

  return (
    <group ref={ref} position={[0, 0.15, 0]} scale={1.2}>
      <mesh material={metal}>
        <cylinderGeometry args={[1.02, 1.04, 0.34, 48]} />
      </mesh>
      <mesh material={metal} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[1.06, 1.06, 0.07, 48]} />
      </mesh>
      <mesh material={goldMetal} position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.075, 10, 48]} />
      </mesh>
      <mesh material={dialMat} position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.9, 48]} />
      </mesh>
      <mesh material={goldMetal} position={[0, 0.185, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.84, 0.014, 8, 48]} />
      </mesh>
      {/* Brand pip */}
      <mesh material={goldMetal} position={[0, 0.19, -0.35]}>
        <sphereGeometry args={[0.03, 12, 12]} />
      </mesh>
      {markers.map((m, i) => (
        <mesh
          key={i}
          material={goldMetal}
          position={[m.x, 0.19, m.z]}
          rotation={[0, -Math.atan2(m.z, m.x), 0]}
        >
          <boxGeometry args={[m.major ? 0.06 : 0.03, 0.02, m.major ? 0.15 : 0.09]} />
        </mesh>
      ))}
      <mesh material={goldMetal} position={[0.22, 0.21, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.44, 0.02, 0.05]} />
      </mesh>
      <mesh material={metal} position={[0.04, 0.215, 0.28]} rotation={[0, 0, 1.05]}>
        <boxGeometry args={[0.6, 0.015, 0.032]} />
      </mesh>
      <mesh material={goldMetal} position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.048, 14, 14]} />
      </mesh>
      <mesh material={goldMetal} position={[1.15, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.075, 0.085, 0.18, 14]} />
      </mesh>
      <mesh material={glassMat} position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.92, 48]} />
      </mesh>
      {/* Linked bracelet */}
      {[0.95, 1.2, 1.45].map((z, i) => (
        <group key={`a${i}`}>
          <mesh material={strapMat} position={[0, -0.02, z]}>
            <boxGeometry args={[0.62 - i * 0.04, 0.09, 0.22]} />
          </mesh>
          <mesh material={goldMetal} position={[0, 0.03, z]}>
            <boxGeometry args={[0.5 - i * 0.03, 0.03, 0.06]} />
          </mesh>
        </group>
      ))}
      {[-0.95, -1.2, -1.45].map((z, i) => (
        <group key={`b${i}`}>
          <mesh material={strapMat} position={[0, -0.02, z]}>
            <boxGeometry args={[0.62 - i * 0.04, 0.09, 0.22]} />
          </mesh>
          <mesh material={goldMetal} position={[0, 0.03, z]}>
            <boxGeometry args={[0.5 - i * 0.03, 0.03, 0.06]} />
          </mesh>
        </group>
      ))}
    </group>
  );
});

export default WatchAssembly;
