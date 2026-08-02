import { forwardRef, useLayoutEffect, useRef } from 'react';
import { Text } from '@react-three/drei';
import { boxMat, boxGold } from './materials';

/**
 * Matte-black presentation box with gold accents and embossed logo.
 */
const WatchBox = forwardRef(function WatchBox(_, ref) {
  const root = useRef();
  const lid = useRef();
  const logo = useRef();
  const glow = useRef();

  useLayoutEffect(() => {
    if (!ref) return undefined;
    const api = { root, lid, logo, glow };
    if (typeof ref === 'function') ref(api);
    else ref.current = api;
    return () => {
      if (typeof ref === 'function') ref(null);
      else if (ref) ref.current = null;
    };
  }, [ref]);

  return (
    <group ref={root} position={[0, -2.8, 0]} visible={false}>
      {/* Base */}
      <mesh material={boxMat} position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.55, 2.4]} />
      </mesh>
      {/* Gold trim */}
      <mesh material={boxGold} position={[0, 0.28, 0]}>
        <boxGeometry args={[2.42, 0.04, 2.42]} />
      </mesh>
      {/* Interior cushion */}
      <mesh material={boxMat} position={[0, 0.22, 0]}>
        <boxGeometry args={[2.0, 0.12, 2.0]} />
      </mesh>
      {/* Lid — pivots at back edge */}
      <group ref={lid} position={[0, 0.3, -1.2]}>
        <mesh material={boxMat} position={[0, 0.08, 1.2]} castShadow>
          <boxGeometry args={[2.4, 0.16, 2.4]} />
        </mesh>
        <mesh material={boxGold} position={[0, 0, 1.2]}>
          <boxGeometry args={[2.42, 0.03, 2.42]} />
        </mesh>
        {/* Embossed logo on lid top */}
        <group ref={logo} position={[0, 0.2, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={0.22}
            color="#D4AF37"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.12}
            fillOpacity={0}
            outlineWidth={0.008}
            outlineColor="#8a7020"
            outlineOpacity={0}
          >
            LUXE WATCHES
          </Text>
        </group>
      </group>
      {/* Soft golden glow point */}
      <pointLight
        ref={glow}
        color="#D4AF37"
        intensity={0}
        distance={6}
        position={[0, 0.8, 0]}
      />
    </group>
  );
});

export default WatchBox;
