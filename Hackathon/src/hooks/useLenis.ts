import { useEffect } from 'react';
import { useLocation } from 'react-router';
import Lenis from 'lenis';
import { useWorld } from '@/store/world';
import { prefersReducedMotion } from './useReducedMotion';

let instance: Lenis | null = null;

export function getLenis(): Lenis | null {
  return instance;
}

export function scrollToId(id: string, immediate = false) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { immediate, offset: 0 });
  else el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
}

/** Mount once in the Shell. Runs Lenis only on the landing route and mirrors progress into the world store. */
export function LenisRoot() {
  const { pathname, hash } = useLocation();
  const locked = useWorld((s) => s.scrollLocked);

  useEffect(() => {
    if (pathname !== '/') { useWorld.getState().setScrollT(0); return; }
    const lenis = new Lenis({ duration: 1.1, smoothWheel: !prefersReducedMotion() });
    instance = lenis;
    let raf = requestAnimationFrame(function loop(time) { lenis.raf(time); raf = requestAnimationFrame(loop); });
    lenis.on('scroll', (l: Lenis) => useWorld.getState().setScrollT(l.limit > 0 ? l.scroll / l.limit : 0));
    if (hash) requestAnimationFrame(() => scrollToId(hash.slice(1), true));
    return () => { cancelAnimationFrame(raf); lenis.destroy(); instance = null; };
  }, [pathname, hash]);

  useEffect(() => {
    if (!instance) return;
    if (locked) instance.stop(); else instance.start();
    document.documentElement.style.overflow = locked ? 'hidden' : '';
  }, [locked]);

  return null;
}
