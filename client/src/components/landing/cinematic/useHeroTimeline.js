import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useThree } from '@react-three/fiber';

/**
 * Fast cinematic timeline — pack framed dead-center for mobile + desktop.
 */
export function useHeroTimeline({
  watchRef,
  partsRef,
  boxRef,
  camera,
  enabled,
  reducedMotion,
  isMobile,
  onComplete,
  onWatchReady,
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
        sessionStorage.setItem('lw_intro_seen_v3', '1');
      } catch {
        /* ignore */
      }
      onComplete?.();
    };

    const tick = () => invalidate();

    // Framing: keep pack in middle of screen
    const camSpin = isMobile
      ? { x: 0, y: 1.05, z: 4.6 }
      : { x: 0.15, y: 1.2, z: 4.5 };
    const camPack = isMobile
      ? { x: 0, y: 0.55, z: 5.2 }
      : { x: 0, y: 0.75, z: 4.8 };
    const boxY = isMobile ? -0.15 : -0.35;
    const watchPackY = isMobile ? 0.12 : -0.05;
    const watchPackScale = isMobile ? 0.48 : 0.5;

    if (reducedMotion) {
      const watch = watchRef.current;
      if (watch) {
        watch.rotation.set(0.12, 0.35, 0);
        watch.position.set(0, 0.2, 0);
        watch.scale.setScalar(isMobile ? 1.05 : 1.2);
      }
      if (partsRef.current) partsRef.current.hide();
      if (camera) camera.position.set(camPack.x, camPack.y, camPack.z);
      onWatchReady?.();
      const t = gsap.delayedCall(0.4, finish);
      return () => t.kill();
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
        if (retries++ < 20) startId = requestAnimationFrame(runTimeline);
        else finish();
        return;
      }

      const prog = parts?.progress?.current || { t: 1, opacity: 0, spin: 0 };
      const boxRoot = box.root.current;
      const lid = box.lid.current;
      const glow = box.glow.current;
      const logoText = box.logo.current?.children?.[0];

      // Always assemble / pack on world center (x=0, z=0)
      watch.scale.setScalar(0.02);
      watch.rotation.set(0.12, 0, 0);
      watch.position.set(0, 0.35, 0);

      prog.t = 0;
      prog.opacity = parts ? 1 : 0;
      prog.spin = 0;

      boxRoot.visible = false;
      boxRoot.position.set(0, -2.2, 0);
      boxRoot.scale.setScalar(isMobile ? 0.85 : 1);
      if (lid) lid.rotation.x = 0;

      if (camera) {
        camera.position.set(0, isMobile ? 1.0 : 1.15, isMobile ? 5.0 : 4.8);
        camera.lookAt(0, 0.1, 0);
      }

      const tl = gsap.timeline({
        onUpdate: () => {
          tick();
          if (camera) camera.lookAt(0, isMobile ? 0.05 : 0.1, 0);
        },
        onComplete: finish,
      });
      tlRef.current = tl;
      // Slightly slower overall pacing (~8s)
      tl.timeScale(0.78);

      // 1) Assemble at center
      tl.to(prog, { t: 1, spin: Math.PI * 2, duration: 1.8, ease: 'power3.inOut' }, 0);
      tl.to(
        watch.scale,
        {
          x: isMobile ? 1.05 : 1.2,
          y: isMobile ? 1.05 : 1.2,
          z: isMobile ? 1.05 : 1.2,
          duration: 0.7,
          ease: 'back.out(1.6)',
        },
        1.15
      );
      tl.to(prog, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 1.7);
      tl.call(() => onWatchReady?.(), null, 1.9);

      // 2) Spin — camera stays centered
      tl.to(watch.rotation, { y: Math.PI * 2, duration: 2.0, ease: 'power1.inOut' }, 2.0);
      if (camera) {
        tl.to(camera.position, { ...camSpin, duration: 2.0, ease: 'sine.inOut' }, 2.0);
      }

      // 3) Pack in middle of frame
      if (camera) {
        tl.to(camera.position, { ...camPack, duration: 0.85, ease: 'power2.inOut' }, 3.9);
      }
      tl.set(boxRoot, { visible: true }, 4.0);
      tl.fromTo(
        boxRoot.position,
        { x: 0, y: -2.2, z: 0 },
        { x: 0, y: boxY, z: 0, duration: 0.85, ease: 'power3.out' },
        4.0
      );
      if (lid) {
        tl.fromTo(lid.rotation, { x: 0 }, { x: -1.75, duration: 0.55, ease: 'power2.out' }, 4.15);
      }
      tl.to(
        watch.position,
        { x: 0, y: watchPackY, z: 0, duration: 0.85, ease: 'power2.inOut' },
        4.5
      );
      tl.to(
        watch.scale,
        {
          x: watchPackScale,
          y: watchPackScale,
          z: watchPackScale,
          duration: 0.85,
          ease: 'power2.inOut',
        },
        4.5
      );
      tl.to(watch.rotation, { x: 0.08, y: Math.PI * 2 + 0.15, duration: 0.85 }, 4.5);
      if (lid) {
        tl.to(lid.rotation, { x: 0, duration: 0.65, ease: 'power3.inOut' }, 5.25);
      }
      if (logoText?.material) {
        tl.to(logoText.material, { fillOpacity: 1, outlineOpacity: 0.55, duration: 0.5 }, 5.8);
      }
      if (glow) {
        tl.to(glow, { intensity: 1.6, duration: 0.45, ease: 'sine.out' }, 6.1);
        tl.to(glow, { intensity: 0.45, duration: 0.5 }, 6.55);
      }
      tl.to({}, { duration: 0.4 }, 6.9);
    };

    startId = requestAnimationFrame(runTimeline);

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      tlRef.current?.kill();
      tlRef.current = null;
    };
  }, [
    enabled,
    reducedMotion,
    isMobile,
    watchRef,
    partsRef,
    boxRef,
    camera,
    invalidate,
    onComplete,
    onWatchReady,
  ]);

  return tlRef;
}
