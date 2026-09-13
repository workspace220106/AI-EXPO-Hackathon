const AUDIO_SRC = '/subway_surfers.mp3';
const MUTE_KEY = 'aiexpo.music_muted';

type Listener = () => void;

class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isMuted: boolean;
  private isPlaying = false;
  private listeners = new Set<Listener>();
  private initialized = false;

  constructor() {
    let muted = false;
    try {
      muted = typeof window !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1';
    } catch {
      muted = false;
    }
    this.isMuted = muted;
  }

  public init() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    try {
      this.audio = new Audio(AUDIO_SRC);
      this.audio.loop = true;
      this.audio.volume = 0.35;

      if (!this.isMuted) {
        this.attemptPlay();
      }

      const onUserGesture = () => {
        if (this.audio && this.audio.paused && !this.isMuted) {
          this.attemptPlay();
        }
      };

      window.addEventListener('click', onUserGesture, { passive: true });
      window.addEventListener('keydown', onUserGesture, { passive: true });
      window.addEventListener('touchstart', onUserGesture, { passive: true });
      window.addEventListener('scroll', onUserGesture, { passive: true });
    } catch {
      // Audio element creation error ignored
    }
  }

  private attemptPlay() {
    if (!this.audio) return;
    try {
      const res = this.audio.play();
      if (res && typeof res.then === 'function') {
        res.then(() => {
          this.isPlaying = true;
          this.notify();
        }).catch(() => {
          // Autoplay blocked until user gesture
        });
      } else {
        this.isPlaying = true;
        this.notify();
      }
    } catch {
      // Ignore play error
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem(MUTE_KEY, this.isMuted ? '1' : '0');
    } catch {
      // Storage unavailable
    }

    if (this.audio) {
      if (this.isMuted) {
        try {
          this.audio.pause();
        } catch {
          // Pause error ignored
        }
        this.isPlaying = false;
      } else {
        this.attemptPlay();
      }
    }
    this.notify();
  }

  public getStatus() {
    return {
      muted: this.isMuted,
      playing: this.isPlaying,
    };
  }

  public subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const bgm = new AudioService();
