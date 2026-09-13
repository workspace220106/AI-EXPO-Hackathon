import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { useGame } from '@/store/game';
import { Panel } from '@/ui/Panel';

export function SectionPanel({ train, title, children, wide = false }: { train: number; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => { useGame.getState().visit(`train:${train}`); }, [train]);   // +10 coins, first ride only
  return (
    <main id="content" className="flex min-h-dvh items-end justify-center p-3 md:items-center md:justify-end md:p-4 md:pr-[6vw]">
      <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <Panel className="max-h-[80dvh] overflow-y-auto md:max-h-[88dvh]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl leading-none md:text-3xl"><span className="mr-2 inline-block border-[3px] border-navy bg-yellow px-2 py-0.5 text-base">{`0${train}`}</span>{title}</h2>
            <Link to="/station" className="pointer-auto shrink-0 border-[3px] border-navy bg-white px-3 py-1 font-display text-xs shadow-bevel-sm hover:bg-cyan">BACK TO PLATFORM</Link>
          </div>
          {children}
        </Panel>
      </motion.div>
    </main>
  );
}
