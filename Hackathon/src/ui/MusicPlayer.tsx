import { useEffect, useState } from 'react';
import { bgm } from '@/lib/audioService';

export function MusicPlayer() {
  const [status, setStatus] = useState(() => bgm.getStatus());

  useEffect(() => {
    bgm.init();
    return bgm.subscribe(() => {
      setStatus(bgm.getStatus());
    });
  }, []);

  const { muted, playing } = status;
  const isOff = muted || !playing;

  return (
    <button
      type="button"
      onClick={() => bgm.toggleMute()}
      aria-label={isOff ? 'Unmute Subway Surfers soundtrack' : 'Mute Subway Surfers soundtrack'}
      title={isOff ? 'Play Subway Surfers soundtrack' : 'Mute soundtrack'}
      className="pointer-auto flex items-center gap-1.5 border-[3px] border-navy bg-pale px-2.5 py-1 font-display text-xs text-navy shadow-bevel-sm transition hover:bg-cyan active:translate-x-0.5 active:translate-y-0.5"
    >
      <span aria-hidden className="text-sm leading-none">{isOff ? '🔇' : '🔊'}</span>
      <span className="hidden sm:inline">{isOff ? 'BGM OFF' : 'BGM ON'}</span>
    </button>
  );
}
