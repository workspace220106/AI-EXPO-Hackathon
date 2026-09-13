import { SHOTS } from '@/world/shots';

export const INTRO_DURATION = 4.2;

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

const RAIL_POS: V3 = [-4, 0.6, -2];
const RAIL_LOOK: V3 = [-6, 0.8, -20];
const FOLLOW_POS: V3 = [-2, 1.6, -30];
const FOLLOW_LOOK: V3 = [-6, 1.6, -60];
const CAMERA_Z = -2;
const TRAIN_SPEED = 36; // units per second

/**
 * Beats: 0–1.2 train roars past the rail-level camera · 1.2–2.6 camera follows into the hall ·
 * 2.6–3.6 graffiti wipes on · 3.6–4.2 pull back to the hero shot.
 */
export function introAt(t: number): IntroFrame {
  const c = Math.min(INTRO_DURATION, Math.max(0, t));
  const trainZ = 30 - TRAIN_SPEED * c;
  const shake = c < 1.4 && Math.abs(trainZ - CAMERA_Z) < 14 ? 0.03 : 0;

  let position: V3 = RAIL_POS;
  let lookAt: V3 = RAIL_LOOK;
  let fov = 60;
  if (c >= 1.2 && c < 2.6) {
    const f = smoothstep((c - 1.2) / 1.4);
    position = lerp3(RAIL_POS, FOLLOW_POS, f);
    lookAt = lerp3(RAIL_LOOK, FOLLOW_LOOK, f);
  } else if (c >= 2.6 && c < 3.6) {
    position = FOLLOW_POS;
    lookAt = FOLLOW_LOOK;
  } else if (c >= 3.6) {
    const f = smoothstep((c - 3.6) / 0.6);
    position = lerp3(FOLLOW_POS, SHOTS.hero.position, f);
    lookAt = lerp3(FOLLOW_LOOK, SHOTS.hero.lookAt, f);
    fov = lerp(60, SHOTS.hero.fov, f);
  }
  const reveal = c < 2.6 ? 0 : smoothstep((c - 2.6) / 1.0);
  const done = t >= INTRO_DURATION;
  if (done) { position = SHOTS.hero.position; lookAt = SHOTS.hero.lookAt; fov = SHOTS.hero.fov; }
  return { position, lookAt, fov, trainZ, reveal, shake, done };
}
