import { forwardRef, useLayoutEffect, useRef } from 'react';
import { Text } from '@react-three/drei';
import { boxMat, boxGold } from './materials';

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
    <group ref={root} position={[0, -2.5, 0]} visible={false}>
      <mesh material={boxMat} position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.5, 2.2]} />
      </mesh>
      <mesh material={boxGold} position={[0, 0.26, 0]}>
        <boxGeometry args={[2.22, 0.035, 2.22]} />
      </mesh>
      <mesh material={boxMat} position={[0, 0.2, 0]}>
        <boxGeometry args={[1.85, 0.1, 1.85]} />
      </mesh>
      <group ref={lid} position={[0, 0.28, -1.1]}>
        <mesh material={boxMat} position={[0, 0.07, 1.1]}>
          <boxGeometry args={[2.2, 0.14, 2.2]} />
        </mesh>
        <mesh material={boxGold} position={[0, 0, 1.1]}>
          <boxGeometry args={[2.22, 0.025, 2.22]} />
        </mesh>
        <group ref={logo} position={[0, 0.18, 1.1]} rotation={[-Math.PI / 2, 0, 0]}>
          <Text
            fontSize={0.2}
            color="#D4AF37"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.14}
            fillOpacity={0}
            outlineWidth={0.006}
            outlineColor="#8a7020"
            outlineOpacity={0}
          >
            LUXE WATCHES
          </Text>
        </group>
      </group>
      <pointLight ref={glow} color="#D4AF37" intensity={0} distance={5} position={[0, 0.7, 0]} />
    </group>
  );
});

export default WatchBox;
