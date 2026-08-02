import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';

/**
 * GSAP master timeline for the cinematic sequence (steps 1–9).
 * Uses invalidate() so frameloop="demand" stays in sync.
 */
export function useHeroTimeline({
  watchRef,
  partsRef,
  boxRef,
  camera,
  enabled,
  reducedMotion,
  onComplete,
}) {
  const invalidate = useThree((s) => s.invalidate);
  const done = useRef(false);
  const tlRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const finish = () => {
      if (done.current) return;
      done.current = true;
      try {
        sessionStorage.setItem('lw_intro_seen', '1');
      } catch {
        /* ignore */
      }
      onComplete?.();
    };

    const tick = () => invalidate();

    if (reducedMotion) {
      const watch = watchRef.current;
      if (watch) {
        watch.rotation.set(0.15, 0.4, 0);
        watch.position.set(0, 0.2, 0);
        watch.scale.setScalar(1.1);
      }
      if (partsRef.current) partsRef.current.hide();
      const t = gsap.delayedCall(1.2, finish);
      return () => {
        t.kill();
      };
    }

    let cancelled = false;
    let retries = 0;
    let startId = 0;

    const runTimeline = () => {
      if (cancelled) return;
      const watch = watchRef.current;
      const parts = partsRef.current;
      const box = boxRef.current;
      if (!watch || !box?.root?.current) {
        if (retries++ < 30) {
          startId = requestAnimationFrame(runTimeline);
        } else {
          finish();
        }
        return;
      }

      const prog = parts?.progress?.current || { t: 1, opacity: 0, spin: 0 };
      const boxRoot = box.root.current;
      const lid = box.lid.current;
      const glow = box.glow.current;
      const logoGroup = box.logo.current;
      const logoText = logoGroup?.children?.[0];

      watch.scale.setScalar(0.01);
      watch.rotation.set(0.2, 0, 0);
      watch.position.set(0, 0.4, 0);

      prog.t = 0;
      prog.opacity = parts ? 1 : 0;
      prog.spin = 0;

      boxRoot.visible = false;
      boxRoot.position.y = -2.8;
      if (lid) lid.rotation.x = 0;

      const tl = gsap.timeline({
        onUpdate: tick,
        onComplete: finish,
      });
      tlRef.current = tl;

      // 1–3: floating parts assemble
      tl.to(prog, { t: 1, spin: Math.PI * 3, duration: 3.6, ease: 'power2.inOut' }, 0);
      tl.to(
        watch.scale,
        { x: 1.15, y: 1.15, z: 1.15, duration: 1.2, ease: 'back.out(1.4)' },
        2.4
      );
      tl.to(prog, { opacity: 0, duration: 0.6, ease: 'power1.in' }, 3.4);

      // 4: 360° rotate + camera arc
      tl.to(watch.rotation, { y: Math.PI * 2, duration: 4.2, ease: 'none' }, 4.0);
      tl.to(
        watch.rotation,
        { x: 0.35, duration: 2.1, ease: 'sine.inOut', yoyo: true, repeat: 1 },
        4.0
      );
      if (camera) {
        tl.to(
          camera.position,
          { x: 1.4, y: 1.6, z: 4.2, duration: 4.2, ease: 'sine.inOut' },
          4.0
        );
      }

      // 5: box appears
      tl.set(boxRoot, { visible: true }, 8.0);
      tl.fromTo(
        boxRoot.position,
        { y: -2.8 },
        { y: -1.15, duration: 1.4, ease: 'power3.out' },
        8.0
      );
      if (lid) {
        tl.fromTo(lid.rotation, { x: 0 }, { x: -1.85, duration: 1.0, ease: 'power2.out' }, 8.2);
      }

      // 6: watch into box
      tl.to(watch.position, { y: -0.72, z: 0, duration: 1.5, ease: 'power2.inOut' }, 9.2);
      tl.to(watch.scale, { x: 0.55, y: 0.55, z: 0.55, duration: 1.5, ease: 'power2.inOut' }, 9.2);
      tl.to(watch.rotation, { x: 0.1, y: Math.PI * 2 + 0.3, duration: 1.5 }, 9.2);

      // 7: lid closes
      if (lid) {
        tl.to(lid.rotation, { x: 0, duration: 1.2, ease: 'power3.inOut' }, 10.6);
      }

      // 8: gold foil logo
      if (logoText?.material) {
        tl.to(logoText.material, { fillOpacity: 1, outlineOpacity: 0.6, duration: 1.0 }, 11.6);
      } else {
        tl.to({}, { duration: 1.0 }, 11.6);
      }

      // 9: glow handoff
      if (glow) {
        tl.to(glow, { intensity: 2.4, duration: 1.0, ease: 'sine.out' }, 12.2);
        tl.to(glow, { intensity: 0.6, duration: 0.8 }, 13.2);
      }
      tl.to({}, { duration: 0.6 }, 13.8);
    };

    startId = requestAnimationFrame(runTimeline);

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, [enabled, reducedMotion, watchRef, partsRef, boxRef, camera, invalidate, onComplete]);

  return tlRef;
}
