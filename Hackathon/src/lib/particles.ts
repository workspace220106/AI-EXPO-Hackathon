export const POOL = 64;
export interface Particle { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number }

export function makePool(): Particle[] {
  return Array.from({ length: POOL }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0 }));
}

export function spawnBurst(pool: Particle[], origin: [number, number, number], count: number, rng: () => number) {
  let spawned = 0;
  for (const p of pool) {
    if (spawned >= count) break;
    if (p.life > 0) continue;
    p.x = origin[0]; p.y = origin[1]; p.z = origin[2];
    p.vx = (rng() - 0.5) * 4; p.vy = 2 + rng() * 3; p.vz = (rng() - 0.5) * 4;
    p.life = 1;
    spawned++;
  }
}

export function stepParticles(pool: Particle[], dt: number) {
  for (const p of pool) {
    if (p.life <= 0) continue;
    p.vy -= 9 * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    p.life = Math.max(0, p.life - dt * 1.4);
  }
}
