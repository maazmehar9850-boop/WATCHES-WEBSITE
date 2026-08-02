import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useThree, useFrame } from '@react-three/fiber';

/**
 * Assemble → showcase spin → stay on poster (no box).
 */
export function useHeroTimeline({
  watchRef,
  partsRef,
  camera,
  enabled,
  reducedMotion,
  isMobile,
  stageX,
  onComplete,
  onWatchReady,
}) {
  const invalidate = useThree((s) => s.invalidate);
  const done = useRef(false);
  const idle = useRef(false);
  const tlRef = useRef(null);

  useFrame((_, delta) => {
    if (!idle.current || !watchRef.current) return;
    watchRef.current.rotation.y += delta * 0.28;
  });

  useEffect(() => {
    if (!enabled) return undefined;

    const finish = () => {
      if (done.current) return;
      done.current = true;
      idle.current = true;
      try {
        sessionStorage.setItem('lw_intro_seen_v4', '1');
      } catch {
        /* ignore */
      }
      onComplete?.();
    };

    const tick = () => invalidate();
    const lookY = isMobile ? 0.25 : 0.2;
    const watchScale = isMobile ? 1.15 : 1.32;
    const camHome = isMobile
      ? { x: 0, y: 1.0, z: 4.9 }
      : { x: stageX + 0.35, y: 1.05, z: 4.1 };
    const camSpin = isMobile
      ? { x: 0.4, y: 1.1, z: 4.5 }
      : { x: stageX + 0.7, y: 1.2, z: 3.7 };

    if (reducedMotion) {
      const watch = watchRef.current;
      if (watch) {
        watch.rotation.set(0.18, 0.45, 0);
        watch.position.set(0, 0.2, 0);
        watch.scale.setScalar(watchScale);
      }
      if (partsRef.current) partsRef.current.hide();
      if (camera) {
        camera.position.set(camHome.x, camHome.y, camHome.z);
        camera.lookAt(stageX, lookY, 0);
      }
      idle.current = true;
      onWatchReady?.();
      const t = gsap.delayedCall(0.35, finish);
      return () => t.kill();
    }

    let cancelled = false;
    let retries = 0;
    let startId = 0;

    const runTimeline = () => {
      if (cancelled) return;
      const watch = watchRef.current;
      const parts = partsRef.current;
      if (!watch) {
        if (retries++ < 20) startId = requestAnimationFrame(runTimeline);
        else finish();
        return;
      }

      const prog = parts?.progress?.current || { t: 1, opacity: 0, spin: 0 };

      watch.scale.setScalar(0.02);
      watch.rotation.set(0.2, 0, 0);
      watch.position.set(0, 0.25, 0);

      prog.t = 0;
      prog.opacity = parts ? 1 : 0;
      prog.spin = 0;

      if (camera) {
        camera.position.set(camHome.x, camHome.y, camHome.z);
        camera.lookAt(stageX, lookY, 0);
      }

      const tl = gsap.timeline({
        onUpdate: () => {
          tick();
          if (camera) camera.lookAt(stageX, lookY, 0);
        },
        onComplete: finish,
      });
      tlRef.current = tl;
      tl.timeScale(0.82);

      tl.to(prog, { t: 1, spin: Math.PI * 2.2, duration: 2.0, ease: 'power3.inOut' }, 0);
      tl.to(
        watch.scale,
        { x: watchScale, y: watchScale, z: watchScale, duration: 0.75, ease: 'back.out(1.5)' },
        1.25
      );
      tl.to(prog, { opacity: 0, duration: 0.45, ease: 'power1.in' }, 1.85);
      tl.call(() => onWatchReady?.(), null, 2.1);

      tl.to(watch.rotation, { y: Math.PI * 2 + 0.4, duration: 2.4, ease: 'power1.inOut' }, 2.2);
      tl.to(watch.rotation, { x: 0.22, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, 2.2);
      if (camera) {
        tl.to(camera.position, { ...camSpin, duration: 2.4, ease: 'sine.inOut' }, 2.2);
        tl.to(camera.position, { ...camHome, duration: 1.0, ease: 'power2.inOut' }, 4.5);
      }
      tl.to({}, { duration: 0.5 }, 5.4);
    };

    startId = requestAnimationFrame(runTimeline);

    return () => {
      cancelled = true;
      cancelAnimationFrame(startId);
      tlRef.current?.kill();
      tlRef.current = null;
      idle.current = false;
    };
  }, [
    enabled,
    reducedMotion,
    isMobile,
    stageX,
    watchRef,
    partsRef,
    camera,
    invalidate,
    onComplete,
    onWatchReady,
  ]);

  return tlRef;
}
