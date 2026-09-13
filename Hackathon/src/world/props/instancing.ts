import { useWorld } from '@/store/world';
import { qualitySettings } from '../quality';

/** Z positions from z0 down to z1 every `spacing / density` units (z0 > z1). */
export function spread(z0: number, z1: number, spacing: number, density = 1): number[] {
  const step = spacing / Math.max(density, 0.05);
  const out: number[] = [];
  for (let z = z0; z >= z1 - 1e-9; z -= step) out.push(Number(z.toFixed(6)));
  return out;
}

export function useDensity(): number {
  const tier = useWorld((s) => s.qualityTier);
  return qualitySettings(tier, 1).density;
}
