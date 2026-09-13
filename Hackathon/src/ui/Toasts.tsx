import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToasts, type Toast } from '@/store/toasts';
import { Confetti } from './Confetti';

const KIND_CLASS: Record<Toast['kind'], string> = {
  coin: 'bg-yellow text-navy',
  badge: 'bg-pale text-navy',
  rank: 'bg-yellow text-navy',
  info: 'bg-white text-navy',
  error: 'bg-red text-white',
};

export function coinsTarget(): { x: number; y: number } {
  for (const id of ['hud-coins', 'hud-coins-mobile']) {
    const r = document.getElementById(id)?.getBoundingClientRect();
    if (r && r.width > 0) return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  return { x: window.innerWidth - 40, y: 24 };
}

function ToastItem({ t }: { t: Toast }) {
  const dismiss = useToasts((s) => s.dismiss);
  useEffect(() => {
    const h = setTimeout(() => dismiss(t.id), t.ttl);
    return () => clearTimeout(h);
  }, [t.id, t.ttl, dismiss]);

  if (t.kind === 'coin' && t.x != null && t.y != null) {
    const target = coinsTarget();
    return (
      <motion.div
        aria-hidden
        className="pointer-none fixed z-30 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-navy bg-yellow font-display text-xs text-navy"
        initial={{ x: t.x - 16, y: t.y - 16, scale: 1, opacity: 1 }}
        animate={{ x: target.x - 16, y: target.y - 16, scale: 0.5, opacity: 0.9 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        ¢
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      role="status"
      className={`pointer-auto relative border-4 border-navy px-4 py-3 shadow-bevel ${KIND_CLASS[t.kind]} ${t.kind === 'badge' ? '[transform-style:preserve-3d]' : ''}`}
      initial={t.kind === 'badge' ? { rotateY: 90, opacity: 0 } : { y: 16, opacity: 0 }}
      animate={{ rotateY: 0, y: 0, opacity: 1 }}
      exit={{ y: -8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
    >
      {t.kind === 'badge' && <Confetti />}
      <p className="font-display text-base leading-none">{t.title}</p>
      {t.body && <p className="mt-1 font-ui text-xs font-bold">{t.body}</p>}
    </motion.div>
  );
}

export function Toasts() {
  const items = useToasts((s) => s.items);
  return (
    <div aria-live="polite" className="pointer-none fixed bottom-4 right-4 z-30 flex w-72 flex-col gap-2">
      <AnimatePresence>{items.map((t) => <ToastItem key={t.id} t={t} />)}</AnimatePresence>
    </div>
  );
}
