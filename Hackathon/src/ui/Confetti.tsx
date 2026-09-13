import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { PALETTE, type PaletteName } from '@/theme/palette';

const COLORS: PaletteName[] = ['yellow', 'cyan', 'orange', 'red'];

export interface Piece { x: number; drift: number; delay: number; rot: number; color: PaletteName; size: number }

export function confettiPieces(n: number, rng: () => number = Math.random): Piece[] {
  return Array.from({ length: n }, (_, i) => ({
    x: (i / n) * 100 + rng() * 4, drift: (rng() - 0.5) * 60, delay: rng() * 0.3, rot: rng() * 720 - 360,
    color: COLORS[Math.floor(rng() * COLORS.length)], size: 6 + rng() * 8,
  }));
}

/** Palette-only paper squares falling over the toast column. Purely decorative. */
export function Confetti() {
  const reduced = useReducedMotion();
  const pieces = useMemo(() => confettiPieces(24), []);
  if (reduced) return null;
  return (
    <div aria-hidden className="pointer-none absolute inset-x-0 -top-40 h-40 overflow-visible">
      {pieces.map((p, i) => (
        <motion.span key={i} data-confetti className="absolute top-0 block border border-navy"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, background: PALETTE[p.color] }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: 220, x: p.drift, rotate: p.rot, opacity: 0 }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeIn' }} />
      ))}
    </div>
  );
}
