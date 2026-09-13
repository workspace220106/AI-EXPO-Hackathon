import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { EVENT, formatEventDates } from '@/config/event';
import { getLenis, scrollToId } from '@/hooks/useLenis';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { replayIntro } from './SkipIntro';

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
      className="pointer-auto relative"
      initial={{ opacity: 0, y: 70, scale: 0.92 }}
      animate={introRunning ? { opacity: 0, y: 70, scale: 0.92 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18, delay: introRunning ? 0 : 0.08 }}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="inline-block border-[3px] border-navy bg-navy px-3 py-1 font-display text-xs tracking-wider text-pale shadow-bevel-yellow">
          {`${EVENT.name} · ${formatEventDates()} · ${EVENT.venue}`}
        </p>
        <span className="border-[3px] border-navy bg-yellow px-2.5 py-1 font-display text-[11px] tracking-wider text-navy shadow-bevel-sm">
          SUBWAY SURFERS EDITION
        </span>
      </div>

      <motion.h1
        className="font-display text-[clamp(2.6rem,8.5vw,7.5rem)] leading-[0.92] text-navy"
        style={{ textShadow: `0.06em 0.06em 0 ${PALETTE.yellow}` }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={introRunning ? { scale: 1.15, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20, delay: 0.12 }}
      >
        RUN THE HACKATHON.
      </motion.h1>

      <p className="mt-4 font-display text-base text-navy md:text-2xl">
        36H SPRINT. BUILD. COMPETE. GRIND THE RAILS.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <ArcadeButton size="lg" onClick={onStart} aria-pressed={running}>
          ▶ START RUNNING
        </ArcadeButton>
        <ArcadeButton size="lg" variant="secondary" to="/signin">
          SIGN IN
        </ArcadeButton>
        <button
          type="button"
          onClick={replayIntro}
          className="pointer-auto border-[3px] border-navy bg-pale px-4 py-3 font-display text-xs tracking-wider text-navy shadow-bevel-sm transition hover:bg-cyan active:translate-x-0.5 active:translate-y-0.5"
          title="Replay the 3D train arrival intro"
        >
          🎬 REPLAY TRAIN RUN
        </button>
      </div>

      <p className="mt-8 font-ui text-sm font-bold tracking-widest text-navy">
        {running ? 'RUNNING THE LINE — SCROLL TO TAKE OVER' : 'SCROLL TO RIDE THE LINE ↓'}
      </p>
    </motion.div>
  );
}
