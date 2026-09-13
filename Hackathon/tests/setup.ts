import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

if (typeof window !== 'undefined') {
  if (typeof window.matchMedia !== 'function') {
    window.matchMedia = ((query: string) => ({
      matches: false, media: query, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }
  class Observer { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver ??= Observer;
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver ??= Observer;
}

// Lenis needs real layout; replace it with an inert stub in tests (LenisRoot mounts it on "/").
vi.mock('lenis', () => ({
  default: class LenisStub {
    scroll = 0; limit = 0; animatedScroll = 0;
    on() {} raf() {} stop() {} start() {} destroy() {} scrollTo() {}
  },
}));
