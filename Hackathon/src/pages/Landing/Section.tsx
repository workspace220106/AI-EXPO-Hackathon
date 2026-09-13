import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useGame } from '@/store/game';

export function Section({ id, children, className = '', align = 'start', wide = false }: { id: string; children: ReactNode; className?: string; align?: 'start' | 'end' | 'center'; wide?: boolean }) {
  const reduced = useReducedMotion();
  const justify = align === 'end' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  return (
    <section id={id} className={`pointer-none relative flex min-h-dvh snap-start items-center px-4 py-20 md:px-12 md:py-24 ${justify} ${className}`}>
      <motion.div
        className={`w-full ${wide ? 'max-w-4xl' : 'max-w-xl'}`}
        initial={reduced ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.4, once: false }}
        onViewportEnter={() => useGame.getState().visit(`landing:${id}`)}
        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      >
        {children}
      </motion.div>
    </section>
  );
}
