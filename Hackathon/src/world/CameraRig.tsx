import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { damp, damp3 } from 'maath/easing';
import { PerspectiveCamera, Vector3 } from 'three';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { sampleLanding } from '@/lib/landingPath';
import { useWorld } from '@/store/world';
import { SHOTS } from './shots';

const SMOOTH = 0.35;

/** Damps the camera toward the current shot (route) or the landing spline (scroll). */
export function CameraRig() {
  const camera = useThree((s) => s.camera);
  const reduced = useReducedMotion();
  const targetPos = useRef(new Vector3(...SHOTS.hero.position));
  const look = useRef(new Vector3(...SHOTS.hero.lookAt));
  const targetLook = useRef(new Vector3(...SHOTS.hero.lookAt));

  useFrame((_, delta) => {
    const w = useWorld.getState();
    if (w.introRunning) return;
    const shot = w.shot === 'landing' ? sampleLanding(w.scrollT) : SHOTS[w.shot];
    targetPos.current.set(...shot.position);
    targetLook.current.set(...shot.lookAt);
    const dt = Math.min(delta, 0.1);
    if (reduced) {
      camera.position.copy(targetPos.current);
      look.current.copy(targetLook.current);
    } else {
      damp3(camera.position, targetPos.current, SMOOTH, dt);
      damp3(look.current, targetLook.current, SMOOTH, dt);
    }
    camera.lookAt(look.current);
    if (camera instanceof PerspectiveCamera && Math.abs(camera.fov - shot.fov) > 0.01) {
      if (reduced) camera.fov = shot.fov; else damp(camera, 'fov', shot.fov, SMOOTH, dt);
      camera.updateProjectionMatrix();
    }
  });
  return null;
}
