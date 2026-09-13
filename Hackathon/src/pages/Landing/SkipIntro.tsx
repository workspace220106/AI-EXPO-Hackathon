import { useEffect } from 'react';
import { INTRO_DURATION } from '@/lib/intro';
import { useWorld } from '@/store/world';
import { introBus } from '@/world/cinematic/introBus';

export function skipIntro() { if (introBus.active) introBus.t = INTRO_DURATION; }

export function SkipIntro() {
  const running = useWorld((s) => s.introRunning);
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') skipIntro(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);
  if (!running) return null;
  return (
    <button type="button" onClick={skipIntro} className="pointer-auto fixed bottom-5 right-5 z-30 border-[3px] border-navy bg-yellow px-4 py-2 font-display text-sm text-navy shadow-bevel-sm">
      SKIP ▶
    </button>
  );
}
