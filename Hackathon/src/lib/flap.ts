export const FLAP_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#+-';

/** Departure-board reveal: characters settle left→right as progress goes 0→1. */
export function flapFrame(target: string, progress: number, rng: () => number = Math.random): string {
  const settled = Math.floor(Math.min(1, Math.max(0, progress)) * target.length + 1e-9);
  let out = '';
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    out += ch === ' ' || i < settled ? ch : FLAP_GLYPHS[Math.floor(rng() * FLAP_GLYPHS.length)];
  }
  return out;
}
