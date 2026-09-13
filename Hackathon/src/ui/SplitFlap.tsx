import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { flapFrame } from '@/lib/flap';

export function SplitFlap({ text, active = true, duration = 900, className = '' }: { text: string; active?: boolean; duration?: number; className?: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(() => (reduced ? text : flapFrame(text, 0)));

  useEffect(() => {
    if (reduced || !active) { setShown(text); return; }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setShown(flapFrame(text, p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, duration, reduced]);

  return <span aria-label={text} className={`font-display tabular-nums ${className}`}>{shown}</span>;
}
