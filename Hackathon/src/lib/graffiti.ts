import { PALETTE, type PaletteName } from '@/theme/palette';

export interface GraffitiSpec {
  words: string[];
  base: PaletteName;
  ink: PaletteName;
  accents: PaletteName[];
  seed: number;
}

export type GraffitiItem =
  | { kind: 'word'; text: string; x: number; y: number; size: number; rot: number; color: PaletteName; outline: PaletteName }
  | { kind: 'splat'; x: number; y: number; r: number; color: PaletteName }
  | { kind: 'arrow'; x: number; y: number; len: number; rot: number; color: PaletteName }
  | { kind: 'drip'; x: number; y: number; len: number; color: PaletteName };

/** mulberry32 — tiny deterministic PRNG so walls look the same every visit. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function layoutGraffiti(spec: GraffitiSpec, w: number, h: number): GraffitiItem[] {
  const rnd = seededRandom(spec.seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
  const items: GraffitiItem[] = [];
  for (let i = 0; i < 6; i++) items.push({ kind: 'splat', x: rnd() * w, y: rnd() * h, r: 30 + rnd() * 90, color: pick(spec.accents) });
  spec.words.forEach((text, i) => {
    const size = Math.min(h * 0.5, (w / spec.words.length) * 0.32);
    items.push({
      kind: 'word', text,
      x: ((i + 0.5) / spec.words.length) * w + (rnd() - 0.5) * w * 0.08,
      y: h * (0.4 + rnd() * 0.25),
      size, rot: (rnd() - 0.5) * 0.25, color: spec.ink, outline: 'navy',
    });
    for (let d = 0; d < 3; d++) items.push({ kind: 'drip', x: ((i + 0.3 + rnd() * 0.4) / spec.words.length) * w, y: h * 0.55, len: 20 + rnd() * 80, color: spec.ink });
  });
  for (let i = 0; i < 4; i++) items.push({ kind: 'arrow', x: rnd() * w, y: rnd() * h, len: 60 + rnd() * 120, rot: rnd() * Math.PI * 2, color: pick(spec.accents) });
  return items;
}

/** Paints `items` onto a 2D context; `reveal` ∈ [0,1] clips the paint left→right for the intro wipe. */
export function paintGraffiti(ctx: CanvasRenderingContext2D, items: GraffitiItem[], w: number, h: number, reveal: number, base: PaletteName) {
  ctx.save();
  ctx.fillStyle = PALETTE[base];
  ctx.fillRect(0, 0, w, h);
  ctx.beginPath();
  ctx.rect(0, 0, Math.max(0, Math.min(1, reveal)) * w, h);
  ctx.clip();
  for (const it of items) {
    ctx.fillStyle = PALETTE[it.color];
    ctx.strokeStyle = PALETTE.navy;
    if (it.kind === 'splat') {
      ctx.beginPath();
      for (let k = 0; k < 9; k++) {
        const ang = (k / 9) * Math.PI * 2;
        const rr = it.r * (k % 2 ? 0.6 : 1);
        ctx.lineTo(it.x + Math.cos(ang) * rr, it.y + Math.sin(ang) * rr);
      }
      ctx.closePath(); ctx.fill();
    } else if (it.kind === 'drip') {
      ctx.fillRect(it.x - 6, it.y, 12, it.len);
      ctx.beginPath(); ctx.arc(it.x, it.y + it.len, 9, 0, Math.PI * 2); ctx.fill();
    } else if (it.kind === 'arrow') {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
      ctx.lineWidth = 14; ctx.strokeStyle = PALETTE[it.color]; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(it.len, 0); ctx.moveTo(it.len - 30, -26); ctx.lineTo(it.len, 0); ctx.lineTo(it.len - 30, 26); ctx.stroke();
      ctx.restore();
    } else {
      ctx.save(); ctx.translate(it.x, it.y); ctx.rotate(it.rot);
      ctx.font = `${it.size}px Bungee, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = Math.max(6, it.size * 0.12); ctx.lineJoin = 'round';
      ctx.strokeStyle = PALETTE[it.outline]; ctx.strokeText(it.text, 0, 0);
      ctx.fillStyle = PALETTE[it.color]; ctx.fillText(it.text, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}
