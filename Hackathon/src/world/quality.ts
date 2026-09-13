import type { QualityTier } from '@/store/world';

export interface QualitySettings {
  dpr: number;
  shadows: boolean;
  density: number;   // fraction of instanced props to draw
  particles: boolean;
  fogFar: number;
}

export function qualitySettings(tier: QualityTier, devicePixelRatio: number): QualitySettings {
  return tier === 'high'
    ? { dpr: Math.min(devicePixelRatio, 2), shadows: true, density: 1, particles: true, fogFar: 140 }
    : { dpr: 1, shadows: false, density: 0.5, particles: false, fogFar: 90 };
}

export interface QualityEnv { coarsePointer: boolean; cores: number; memoryGb: number | null }

export function detectQualityTier(env: QualityEnv): QualityTier {
  if (env.coarsePointer) return 'low';
  if (env.cores <= 4) return 'low';
  if (env.memoryGb != null && env.memoryGb <= 4) return 'low';
  return 'high';
}

export function readEnv(): QualityEnv {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return {
    coarsePointer: typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches,
    cores: nav.hardwareConcurrency ?? 8,
    memoryGb: nav.deviceMemory ?? null,
  };
}
