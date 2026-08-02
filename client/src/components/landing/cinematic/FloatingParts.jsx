import { forwardRef, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { metal, goldMetal } from './materials';

/**
 * Lightweight instanced scatter — fewer instances, cheaper update loop.
 */
const FloatingParts = forwardRef(function FloatingParts({ count = 72 }, ref) {
  const screws = useRef();
  const gears = useRef();
  const links = useRef();

  const { scatter, targets, quats } = useMemo(() => {
    const scatterArr = [];
    const targetArr = [];
    const quatArr = [];
    const tmpQ = new THREE.Quaternion();
    const euler = new THREE.Euler();

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 3.2;
      const y = (Math.random() - 0.5) * 3.2;
      scatterArr.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius));

      const ring = 0.35 + (i % 6) * 0.1;
      const a = (i / count) * Math.PI * 2;
      targetArr.push(
        new THREE.Vector3(Math.cos(a) * ring * 0.25, 0.15 + (i % 4) * 0.03, Math.sin(a) * ring * 0.25)
      );

      euler.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      quatArr.push(tmpQ.clone().setFromEuler(euler));
    }
    return { scatter: scatterArr, targets: targetArr, quats: quatArr };
  }, [count]);

  const progress = useRef({ t: 0, opacity: 1, spin: 0 });

  useLayoutEffect(() => {
    if (!ref) return undefined;
    const api = {
      progress,
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
    if (opacity < 0.02) {
      if (screws.current) screws.current.visible = false;
      if (gears.current) gears.current.visible = false;
      if (links.current) links.current.visible = false;
      return;
    }

    const ease = t * t * (3 - 2 * t);
    const groups = [
      { mesh: screws.current, start: 0, stride: 3, scale: 0.055, matSpin: spin },
      { mesh: gears.current, start: 1, stride: 3, scale: 0.11, matSpin: spin * 1.2 },
      { mesh: links.current, start: 2, stride: 3, scale: 0.09, matSpin: spin * 0.5 },
    ];

    for (const g of groups) {
      if (!g.mesh) continue;
      let idx = 0;
      for (let i = g.start; i < count; i += g.stride) {
        mid.lerpVectors(scatter[i], targets[i], ease);
        dummy.position.copy(mid);
        dummy.quaternion.copy(quats[i]);
        dummy.rotateY(g.matSpin);
        const s = g.scale * (1 - ease * 0.9) * opacity + 0.001;
        dummy.scale.setScalar(Math.max(s, 0.001));
        dummy.updateMatrix();
        g.mesh.setMatrixAt(idx, dummy.matrix);
        idx += 1;
      }
      g.mesh.count = idx;
      g.mesh.instanceMatrix.needsUpdate = true;
      g.mesh.visible = ease < 0.98;
    }
  });

  if (count < 1) return null;

  const n = Math.ceil(count / 3);

  return (
    <group>
      <instancedMesh ref={screws} args={[undefined, undefined, n]} frustumCulled={false} material={goldMetal}>
        <cylinderGeometry args={[0.35, 0.35, 0.45, 5]} />
      </instancedMesh>
      <instancedMesh ref={gears} args={[undefined, undefined, n]} frustumCulled={false} material={metal}>
        <torusGeometry args={[0.45, 0.15, 5, 10]} />
      </instancedMesh>
      <instancedMesh ref={links} args={[undefined, undefined, n]} frustumCulled={false} material={metal}>
        <boxGeometry args={[0.9, 0.3, 0.6]} />
      </instancedMesh>
    </group>
  );
});

export default FloatingParts;
