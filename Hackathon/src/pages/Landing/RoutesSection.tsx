import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { DOMAINS, domainById, type DomainId } from '@/config/event';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { DomainDetail } from './DomainDetail';

export function RoutesSection() {
  const [open, setOpen] = useState<DomainId | null>(null);
  const setHovered = useWorld((s) => s.setHovered);

  useEffect(() => {
    const w = useWorld.getState();
    w.setDoorMode('showcase');
    w.setDoorHandler((id) => setOpen(id));
    return () => w.setDoorHandler(null);
  }, []);

  return (
    <div className="pointer-auto">
      <h2 className="font-display text-3xl text-navy md:text-5xl">CHOOSE YOUR ROUTE</h2>
      <p className="mt-2 font-ui text-sm font-bold text-navy">Four lines. One station. Pick the one you'll run.</p>
      <ul className="mt-6 grid gap-3">
        {DOMAINS.map((d) => (
          <li key={d.id}>
            <button
              type="button"
              onMouseEnter={() => setHovered(`door:${d.id}`)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(`door:${d.id}`)}
              onBlur={() => setHovered(null)}
              onClick={() => setOpen(d.id)}
              className="flex w-full items-center gap-4 border-4 border-navy bg-white p-3 text-left shadow-bevel transition-transform hover:-translate-y-1 hover:bg-cyan"
            >
              <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center border-[3px] border-navy font-display text-xl text-navy" style={{ background: PALETTE[d.color] }}>{d.number}</span>
              <span>
                <span className="block font-display text-xl text-navy">{`${d.number} ${d.name}`}</span>
                <span className="block font-ui text-sm font-bold text-navy">{d.line}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {open && (
          <div className="mt-4">
            <DomainDetail key={open} domain={domainById(open)} onClose={() => setOpen(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
