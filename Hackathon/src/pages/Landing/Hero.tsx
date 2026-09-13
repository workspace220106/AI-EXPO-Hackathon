import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EVENT, formatEventDates } from '@/config/event';
import { getLenis, scrollToId } from '@/hooks/useLenis';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** "The run": ride the whole line to the check-in over ~9 s. Returns false when it fell back to a jump. */
export function startAutoRun(onDone?: () => void): boolean {
  const lenis = getLenis();
  if (!lenis || prefersReducedMotion()) { scrollToId('checkin', true); onDone?.(); return false; }
  lenis.scrollTo(lenis.limit, {
    duration: 9,
    easing: easeInOutCubic,
    onComplete: () => { onDone?.(); document.getElementById('checkin-cta')?.focus(); },
  });
  return true;
}

export function cancelAutoRun() {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(lenis.animatedScroll, { immediate: true });
}

export function Hero() {
  const introRunning = useWorld((s) => s.introRunning);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const cancel = () => { cancelAutoRun(); setRunning(false); };
    window.addEventListener('wheel', cancel, { passive: true });
    window.addEventListener('touchstart', cancel, { passive: true });
    window.addEventListener('keydown', cancel);
    return () => {
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [running]);

  const onStart = () => { if (startAutoRun(() => setRunning(false))) setRunning(true); };

  return (
    <motion.div
      className="pointer-auto"
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      animate={introRunning ? { opacity: 0, y: 60, scale: 0.94 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay: introRunning ? 0 : 0.1 }}
    >
      <p className="mb-4 inline-block border-[3px] border-navy bg-navy px-3 py-1 font-display text-xs tracking-wider text-pale shadow-bevel-yellow">
        {`${EVENT.name} · ${formatEventDates()} · ${EVENT.venue}`}
      </p>
      <h1
        className="font-display text-[clamp(2.6rem,8.5vw,7.5rem)] leading-[0.92] text-navy"
        style={{ textShadow: `0.06em 0.06em 0 ${PALETTE.yellow}` }}
      >
        RUN THE HACKATHON.
      </h1>
      <p className="mt-4 font-display text-base text-navy md:text-2xl">BUILD. COMPETE. CREATE YOUR OWN RUN.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <ArcadeButton size="lg" onClick={onStart} aria-pressed={running}>▶ START RUNNING</ArcadeButton>
        <ArcadeButton size="lg" variant="secondary" to="/signin">SIGN IN</ArcadeButton>
      </div>
      <p className="mt-8 font-ui text-sm font-bold tracking-widest text-navy">{running ? 'RUNNING THE LINE — SCROLL TO TAKE OVER' : 'SCROLL TO RIDE THE LINE ↓'}</p>
    </motion.div>
  );
}
