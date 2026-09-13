import { useEffect, useRef, useState, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, PerspectiveCamera } from 'three';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { introAt } from '@/lib/intro';
import { useWorld } from '@/store/world';
import { sfx } from '@/lib/sound';
import { mat } from '../materials';
import { Train } from '../props/Train';
import { introBus } from './introBus';

function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.location.pathname !== '/') return false;
  if (new URLSearchParams(window.location.search).has('nointro')) return false;
  if (prefersReducedMotion()) return false;
  return true;
}

/** Cyan speed streaks trailing the last car (the train is turned to face −Z, so its tail is on +Z). */
function Trail() {
  return (
    <group position={[0, 1.8, 3 * 8 + 6]}>
      {[0, 0.8, -0.8].map((dy, i) => (
        <mesh key={i} position={[i === 0 ? 0 : i === 1 ? -1.4 : 1.4, dy, 2 + i]} material={mat('cyan', 'flat')}>
          <boxGeometry args={[0.15, 0.15, 6 - i]} />
        </mesh>
      ))}
    </group>
  );
}

function TrailFollower({ target }: { target: RefObject<Group | null> }) {
  const g = useRef<Group>(null);
  useFrame(() => { if (g.current && target.current) g.current.position.z = target.current.position.z; });
  return <group ref={g}><Trail /></group>;
}

export function Intro() {
  const camera = useThree((s) => s.camera);
  const train = useRef<Group>(null);
  const [playing, setPlaying] = useState(false);
  const whooshPlayed = useRef(false);

  useEffect(() => {
    if (shouldPlayIntro()) {
      const w = useWorld.getState();
      introBus.active = true;
      introBus.t = 0;
      introBus.reveal = 0;
      introBus.trainZ = 30;
      w.setIntroRunning(true);
      w.lockScroll(true);
      whooshPlayed.current = false;
      setPlaying(true);
    } else {
      introBus.active = false;
      introBus.reveal = 1;
      const w = useWorld.getState();
      w.setIntroRunning(false);
      w.lockScroll(false);
      setPlaying(false);
    }
  }, []);

  useFrame((_, delta) => {
    if (!introBus.active) return;
    introBus.t += Math.min(delta, 0.05);

    if (introBus.t > 0.15 && !whooshPlayed.current) {
      whooshPlayed.current = true;
      sfx.playTrainWhoosh();
    }

    const f = introAt(introBus.t);
    introBus.trainZ = f.trainZ;
    introBus.reveal = f.reveal;
    camera.position.set(
      f.position[0] + (Math.random() - 0.5) * f.shake * 2,
      f.position[1] + (Math.random() - 0.5) * f.shake * 2,
      f.position[2],
    );
    camera.lookAt(f.lookAt[0], f.lookAt[1], f.lookAt[2]);
    if (camera instanceof PerspectiveCamera && camera.fov !== f.fov) { camera.fov = f.fov; camera.updateProjectionMatrix(); }
    if (train.current) train.current.position.z = f.trainZ;
    if (f.done) {
      introBus.active = false;
      introBus.reveal = 1;
      sfx.playBoom();
      sfx.playSubwayChime();
      const w = useWorld.getState();
      w.setIntroRunning(false);
      w.setIntroPlayed(true);
      w.lockScroll(false);
      setPlaying(false);
    }
  });

  if (!playing) return null;
  return (
    <group>
      <Train ref={train} cars={4} z={30} rotationY={Math.PI} speed={36} band="yellow" />
      <group position={[-6, 0, 0]}>
        <TrailFollower target={train} />
      </group>
    </group>
  );
}
