import { useEffect, useRef, useState } from 'react';

const AUDIO_SRC = '/subway_surfers.mp3';
const MUTE_KEY = 'aiexpo.music_muted';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;
    try {
      audio = new Audio(AUDIO_SRC);
      audio.loop = true;
      audio.volume = 0.35;
      audioRef.current = audio;

      if (!muted) {
        try {
          const res = audio.play();
          if (res && typeof res.then === 'function') {
            res.then(() => setPlaying(true)).catch(() => {
              // Browser autoplay policy prevented playback until gesture
            });
          } else {
            setPlaying(true);
          }
        } catch {
          // Playback error ignored
        }
      }
    } catch {
      // Audio element creation error ignored
    }

    const onUserGesture = () => {
      const el = audioRef.current;
      if (el && el.paused && !muted) {
        try {
          const res = el.play();
          if (res && typeof res.then === 'function') {
            res.then(() => setPlaying(true)).catch(() => {});
          } else {
            setPlaying(true);
          }
        } catch {
          // Playback error ignored
        }
      }
    };

    window.addEventListener('click', onUserGesture, { passive: true });
    window.addEventListener('keydown', onUserGesture, { passive: true });
    window.addEventListener('touchstart', onUserGesture, { passive: true });
    window.addEventListener('scroll', onUserGesture, { passive: true });

    return () => {
      window.removeEventListener('click', onUserGesture);
      window.removeEventListener('keydown', onUserGesture);
      window.removeEventListener('touchstart', onUserGesture);
      window.removeEventListener('scroll', onUserGesture);
      if (audio) {
        try {
          audio.pause();
          audio.src = '';
        } catch {
          // Clean up error ignored
        }
      }
    };
  }, [muted]);

  const toggle = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    try {
      localStorage.setItem(MUTE_KEY, nextMuted ? '1' : '0');
    } catch {
      // Storage unavailable
    }

    const el = audioRef.current;
    if (el) {
      if (nextMuted) {
        try {
          el.pause();
        } catch {
          // Pause error ignored
        }
        setPlaying(false);
      } else {
        try {
          const res = el.play();
          if (res && typeof res.then === 'function') {
            res.then(() => setPlaying(true)).catch(() => {});
          } else {
            setPlaying(true);
          }
        } catch {
          // Play error ignored
        }
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted || !playing ? 'Unmute Subway Surfers soundtrack' : 'Mute Subway Surfers soundtrack'}
      title={muted || !playing ? 'Play Subway Surfers soundtrack' : 'Mute soundtrack'}
      className="pointer-auto flex items-center gap-1.5 border-[3px] border-navy bg-pale px-2.5 py-1 font-display text-xs text-navy shadow-bevel-sm transition hover:bg-cyan active:translate-x-0.5 active:translate-y-0.5"
    >
      <span aria-hidden className="text-sm leading-none">{muted || !playing ? '🔇' : '🔊'}</span>
      <span className="hidden sm:inline">{muted || !playing ? 'BGM OFF' : 'BGM ON'}</span>
    </button>
  );
}
