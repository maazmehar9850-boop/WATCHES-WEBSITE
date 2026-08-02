import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { metal, goldMetal } from './materials';

/**
 * Instanced floating components — hundreds of visuals, few draw calls.
 * Matrices are driven by GSAP via the exposed `progress` object on the ref.
 */
const FloatingParts = forwardRef(function FloatingParts({ count = 140 }, ref) {
  const screws = useRef();
  const gears = useRef();
  const links = useRef();
  const plates = useRef();

  const { scatter, targets, quats } = useMemo(() => {
    const scatterArr = [];
    const targetArr = [];
    const quatArr = [];
    const tmpQ = new THREE.Quaternion();
    const euler = new THREE.Euler();

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 2.2 + Math.random() * 4.5;
      const y = (Math.random() - 0.5) * 4.5;
      scatterArr.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));

      // Magnetic sockets near assembled watch
      const ring = 0.4 + (i % 8) * 0.12;
      const a = (i / count) * Math.PI * 2;
      targetArr.push(
        new THREE.Vector3(Math.cos(a) * ring * 0.3, 0.2 + (i % 5) * 0.04, Math.sin(a) * ring * 0.3)
      );

      euler.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      quatArr.push(tmpQ.clone().setFromEuler(euler));
    }
    return { scatter: scatterArr, targets: targetArr, quats: quatArr };
  }, [count]);

  // Mutable progress driven by GSAP (0 = scatter, 1 = assembled / hidden)
  const progress = useRef({ t: 0, opacity: 1, spin: 0 });

  useLayoutEffect(() => {
    if (!ref) return undefined;
    const api = {
      progress,
      meshes: { screws, gears, links, plates },
      hide() {
        progress.current.opacity = 0;
      },
    };
    if (typeof ref === 'function') ref(api);
    else ref.current = api;
    return () => {
      if (typeof ref === 'function') ref(null);
      else if (ref) ref.current = null;
    };
  }, [ref]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const mid = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const { t, opacity, spin } = progress.current;
    const ease = t * t * (3 - 2 * t); // smoothstep
    const groups = [
      { mesh: screws.current, start: 0, stride: 4, scale: 0.06, matSpin: spin },
      { mesh: gears.current, start: 1, stride: 4, scale: 0.12, matSpin: spin * 1.4 },
      { mesh: links.current, start: 2, stride: 4, scale: 0.1, matSpin: spin * 0.6 },
      { mesh: plates.current, start: 3, stride: 4, scale: 0.08, matSpin: spin },
    ];

    for (const g of groups) {
      if (!g.mesh) continue;
      let idx = 0;
      for (let i = g.start; i < count; i += g.stride) {
        mid.lerpVectors(scatter[i], targets[i], ease);
        // Subtle magnetic wobble while assembling
        if (ease > 0.05 && ease < 0.95) {
          mid.y += Math.sin(spin * 4 + i) * 0.02 * (1 - ease);
        }
        dummy.position.copy(mid);
        dummy.quaternion.copy(quats[i]);
        dummy.rotateY(g.matSpin + i * 0.01);
        const s = g.scale * (1 - ease * 0.85) * opacity + 0.001;
        dummy.scale.setScalar(Math.max(s, 0.001));
        dummy.updateMatrix();
        g.mesh.setMatrixAt(idx, dummy.matrix);
        idx += 1;
      }
      g.mesh.count = idx;
      g.mesh.instanceMatrix.needsUpdate = true;
      g.mesh.visible = opacity > 0.02 && ease < 0.98;
    }
  });

  const screwN = Math.ceil(count / 4);
  const gearN = Math.ceil(count / 4);
  const linkN = Math.ceil(count / 4);
  const plateN = Math.ceil(count / 4);

  if (count < 1) return null;

  return (
    <group>
      <instancedMesh ref={screws} args={[undefined, undefined, screwN]} frustumCulled={false} material={goldMetal}>
        <cylinderGeometry args={[0.4, 0.4, 0.5, 6]} />
      </instancedMesh>
      <instancedMesh ref={gears} args={[undefined, undefined, gearN]} frustumCulled={false} material={metal}>
        <torusGeometry args={[0.5, 0.18, 6, 12]} />
      </instancedMesh>
      <instancedMesh ref={links} args={[undefined, undefined, linkN]} frustumCulled={false} material={metal}>
        <boxGeometry args={[1, 0.35, 0.7]} />
      </instancedMesh>
      <instancedMesh ref={plates} args={[undefined, undefined, plateN]} frustumCulled={false} material={goldMetal}>
        <boxGeometry args={[0.9, 0.12, 0.9]} />
      </instancedMesh>
    </group>
  );
});

export default FloatingParts;
