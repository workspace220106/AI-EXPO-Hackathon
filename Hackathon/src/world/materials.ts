import { Color, DataTexture, type Material, MeshBasicMaterial, MeshToonMaterial, NearestFilter, RedFormat } from 'three';
import { PALETTE, type PaletteName } from '@/theme/palette';

export type MatVariant = 'toon' | 'flat' | 'emissive';

let gradient: DataTexture | null = null;

/** 3-step toon ramp; the darkest step stays bright (128/255) so shaded sides read as tinted, not black. */
export function toonGradient(): DataTexture {
  if (!gradient) {
    gradient = new DataTexture(new Uint8Array([128, 200, 255]), 3, 1, RedFormat);
    gradient.minFilter = NearestFilter;
    gradient.magFilter = NearestFilter;
    gradient.generateMipmaps = false;
    gradient.needsUpdate = true;
  }
  return gradient;
}

const cache = new Map<string, Material>();

export function colorOf(name: PaletteName): Color {
  return new Color(PALETTE[name]);
}

/** Shared, cached palette materials. Never construct a material with a colour elsewhere. */
export function mat(name: PaletteName, variant: MatVariant = 'toon'): Material {
  const key = `${name}:${variant}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let m: Material;
  if (variant === 'flat') m = new MeshBasicMaterial({ color: PALETTE[name] });
  else if (variant === 'emissive') m = new MeshToonMaterial({ color: PALETTE[name], emissive: PALETTE[name], emissiveIntensity: 0.55, gradientMap: toonGradient() });
  else m = new MeshToonMaterial({ color: PALETTE[name], gradientMap: toonGradient() });
  m.name = key;
  cache.set(key, m);
  return m;
}

export function materialCount(): number {
  return cache.size;
}
