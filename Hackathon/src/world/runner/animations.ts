export type RunnerMode = 'idle' | 'look' | 'celebrate' | 'run';
export type MicroKind = 'lookLeft' | 'lookRight' | 'footTap' | 'strapTug' | 'weightShift';
type V3 = [number, number, number];

export interface MicroAction { kind: MicroKind; start: number; duration: number }

export interface RunnerAnim {
  mode: RunnerMode;
  since: number;
  lookAt: V3 | null;
  runFrom: V3 | null;
  runTo: V3 | null;
  runDuration: number;
  micro: MicroAction | null;
  nextMicroAt: number;
}

export interface Pose {
  bodyY: number; spin: number; headYaw: number; headPitch: number;
  leftArm: number; rightArm: number; leftLeg: number; rightLeg: number;
  footTap: number; hipSway: number; offset: V3;
}

export const CELEBRATE_DURATION = 0.8;
export const LOOK_DURATION = 1.5;
const MICRO: MicroKind[] = ['lookLeft', 'lookRight', 'footTap', 'strapTug', 'weightShift'];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };

export function scheduleMicro(now: number, rng: () => number): number {
  return now + 3 + rng() * 3;
}

export function createAnim(now: number): RunnerAnim {
  return { mode: 'idle', since: now, lookAt: null, runFrom: null, runTo: null, runDuration: 1.2, micro: null, nextMicroAt: scheduleMicro(now, Math.random) };
}

export function trigger(anim: RunnerAnim, mode: 'celebrate' | 'look' | 'run', now: number, extra: { lookAt?: V3; from?: V3; to?: V3; duration?: number } = {}): RunnerAnim {
  return {
    ...anim, mode, since: now, micro: null,
    lookAt: mode === 'look' ? extra.lookAt ?? anim.lookAt : anim.lookAt,
    runFrom: mode === 'run' ? extra.from ?? null : anim.runFrom,
    runTo: mode === 'run' ? extra.to ?? null : anim.runTo,
    runDuration: mode === 'run' ? extra.duration ?? 1.2 : anim.runDuration,
  };
}

/** Advance timers; returns a new anim when something changed, otherwise the same object. */
export function step(anim: RunnerAnim, now: number, rng: () => number): RunnerAnim {
  const elapsed = now - anim.since;
  if (anim.mode === 'celebrate' && elapsed >= CELEBRATE_DURATION) return { ...anim, mode: 'idle', since: now, nextMicroAt: scheduleMicro(now, rng) };
  if (anim.mode === 'look' && elapsed >= LOOK_DURATION) return { ...anim, mode: 'idle', since: now, nextMicroAt: scheduleMicro(now, rng) };
  if (anim.mode === 'run' && elapsed >= anim.runDuration) return { ...anim, mode: 'idle', since: now, runFrom: null, runTo: null, nextMicroAt: scheduleMicro(now, rng) };
  if (anim.mode === 'idle') {
    if (anim.micro && now >= anim.micro.start + anim.micro.duration) return { ...anim, micro: null, nextMicroAt: scheduleMicro(now, rng) };
    if (!anim.micro && now >= anim.nextMicroAt) {
      const kind = MICRO[Math.floor(rng() * MICRO.length)];
      return { ...anim, micro: { kind, start: now, duration: kind === 'footTap' ? 1.2 : 0.9 } };
    }
  }
  return anim;
}

export function pose(anim: RunnerAnim, now: number, facingYaw: number, position: V3): Pose {
  const p: Pose = { bodyY: Math.sin(now * 2) * 0.03, spin: 0, headYaw: 0, headPitch: 0, leftArm: 0, rightArm: 0, leftLeg: 0, rightLeg: 0, footTap: 0, hipSway: 0, offset: [0, 0, 0] };
  const elapsed = now - anim.since;

  if (anim.mode === 'celebrate') {
    const t = clamp01(elapsed / CELEBRATE_DURATION);
    p.bodyY = Math.sin(t * Math.PI) * 0.8;
    p.spin = t * Math.PI * 2;
    p.leftArm = p.rightArm = -2.6 * Math.sin(t * Math.PI);
    return p;
  }
  if (anim.mode === 'look' && anim.lookAt) {
    const dx = anim.lookAt[0] - position[0];
    const dz = anim.lookAt[2] - position[2];
    const yaw = Math.atan2(dx, dz) - facingYaw;
    const wrapped = Math.atan2(Math.sin(yaw), Math.cos(yaw));
    const amount = ease(elapsed / 0.25) * (elapsed > LOOK_DURATION - 0.3 ? ease((LOOK_DURATION - elapsed) / 0.3) : 1);
    p.headYaw = Math.max(-1, Math.min(1, wrapped)) * amount;
    p.headPitch = -0.1 * amount;
    return p;
  }
  if (anim.mode === 'run' && anim.runFrom && anim.runTo) {
    const t = clamp01(elapsed / anim.runDuration);
    p.offset = [
      anim.runFrom[0] + (anim.runTo[0] - anim.runFrom[0]) * t - position[0],
      anim.runFrom[1] + (anim.runTo[1] - anim.runFrom[1]) * t - position[1],
      anim.runFrom[2] + (anim.runTo[2] - anim.runFrom[2]) * t - position[2],
    ];
    const s = Math.sin(now * 14);
    p.leftLeg = s * 0.9; p.rightLeg = -s * 0.9; p.leftArm = -s * 0.8; p.rightArm = s * 0.8;
    p.bodyY = Math.abs(s) * 0.06;
    return p;
  }
  if (anim.micro) {
    const t = clamp01((now - anim.micro.start) / anim.micro.duration);
    const bump = Math.sin(t * Math.PI);
    switch (anim.micro.kind) {
      case 'lookLeft': p.headYaw = 0.7 * bump; break;
      case 'lookRight': p.headYaw = -0.7 * bump; break;
      case 'footTap': p.footTap = Math.max(0, Math.sin(t * Math.PI * 4)) * 0.45; break;
      case 'strapTug': p.rightArm = -1.3 * bump; p.headPitch = 0.15 * bump; break;
      case 'weightShift': p.hipSway = 0.09 * bump; break;
    }
  }
  return p;
}
