import { SHOTS } from '@/world/shots';

export const INTRO_DURATION = 3.6;

export interface IntroFrame {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  trainZ: number;
  reveal: number;
  shake: number;
  done: boolean;
}

type V3 = [number, number, number];

export function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const lerp3 = (a: V3, b: V3, f: number): V3 => [lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f)];

// Camera Shot 1: Facing up the track as the train rushes towards the camera with glowing headlamps
const ONCOMING_POS: V3 = [-2.5, 2.2, -14];
const ONCOMING_LOOK: V3 = [-6, 2.0, 20];

// Camera Shot 2: Chasing behind the train as it speeds down the station hall
const CHASE_POS: V3 = [-3.2, 3.4, -6];
const CHASE_LOOK: V3 = [-6, 1.8, -48];

export function introAt(t: number): IntroFrame {
  const c = Math.min(INTRO_DURATION, Math.max(0, t));
  const progress = smoothstep(c / INTRO_DURATION);
  const trainZ = lerp(32, -55, progress);
  const shake = c < 1.4 ? 0.025 * (1 - c / 1.4) : 0;

  let position: V3 = ONCOMING_POS;
  let lookAt: V3 = ONCOMING_LOOK;
  let fov = 58;

  if (c < 1.3) {
    const f = smoothstep(c / 1.3);
    position = lerp3(ONCOMING_POS, [-2.2, 2.4, -12], f);
    lookAt = lerp3(ONCOMING_LOOK, [-6, 2.0, trainZ], f);
    fov = 58;
  } else if (c >= 1.3 && c < 2.4) {
    const f = smoothstep((c - 1.3) / 1.1);
    position = lerp3([-2.2, 2.4, -12], CHASE_POS, f);
    lookAt = lerp3([-6, 2.0, trainZ], CHASE_LOOK, f);
    fov = lerp(58, 62, f);
  } else {
    const f = smoothstep((c - 2.4) / (INTRO_DURATION - 2.4));
    position = lerp3(CHASE_POS, SHOTS.hero.position, f);
    lookAt = lerp3(CHASE_LOOK, SHOTS.hero.lookAt, f);
    fov = lerp(62, SHOTS.hero.fov, f);
  }

  const reveal = c < 2.4 ? 0 : smoothstep((c - 2.4) / (INTRO_DURATION - 2.4));
  const done = t >= INTRO_DURATION;
  if (done) {
    position = SHOTS.hero.position;
    lookAt = SHOTS.hero.lookAt;
    fov = SHOTS.hero.fov;
  }
  return { position, lookAt, fov, trainZ, reveal, shake, done };
}
