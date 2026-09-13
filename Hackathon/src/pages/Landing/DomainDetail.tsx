import { motion } from 'framer-motion';
import type { DomainConfig } from '@/config/event';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';

export function DomainDetail({ domain, onClose }: { domain: DomainConfig; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="pointer-auto">
      <Panel title={`ROUTE ${domain.number} — ${domain.name}`} tone="white">
        <p
          className={`mb-3 inline-block border-[3px] border-navy px-2 py-0.5 font-display text-xs ${domain.color === 'red' ? 'text-white' : 'text-navy'}`}
          style={{ background: PALETTE[domain.color] }}
        >
          {domain.line}
        </p>
        <p className="font-ui text-sm leading-relaxed">{domain.theme}</p>
        <h3 className="mt-4 font-display text-sm tracking-widest">EXAMPLE PROBLEM STATEMENTS</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 font-ui text-sm">
          {domain.problems.map((p) => <li key={p}>{p}</li>)}
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <ArcadeButton to="/register/identity">RUN THIS ROUTE</ArcadeButton>
          <ArcadeButton variant="ghost" burst={false} onClick={onClose}>CLOSE</ArcadeButton>
        </div>
      </Panel>
    </motion.div>
  );
}
