import type { Runner } from '@/api/types';
import { EVENT, domainById, formatEventDates } from '@/config/event';
import { PALETTE } from '@/theme/palette';
import { QrCode } from './QrCode';

export const qrValue = (runnerId: string) => `aiexpo:runner:${runnerId}`;

export function HackPass({ runner, teamName, status = 'PENDING' }: { runner: Runner; teamName: string | null; status?: string }) {
  const domain = domainById(runner.domain);
  return (
    <article aria-label="Hack Pass" className="w-full max-w-md border-4 border-navy bg-pale text-navy shadow-bevel-lg">
      <header className="flex items-center justify-between border-b-4 border-navy bg-yellow px-4 py-2">
        <span className="font-display text-lg">HACK PASS</span>
        <span className="font-display text-xs tracking-widest">{EVENT.name}</span>
      </header>
      <div className="grid grid-cols-[1fr_auto] gap-4 p-4">
        <dl className="space-y-2 font-ui text-xs font-bold">
          <div><dt className="font-display text-[10px] tracking-widest">RUNNER</dt><dd className="font-display text-xl">{runner.avatar.name}</dd><dd>{runner.name}</dd></div>
          <div><dt className="font-display text-[10px] tracking-widest">RUNNER ID</dt><dd className="font-display text-base">{runner.id}</dd></div>
          <div><dt className="font-display text-[10px] tracking-widest">TEAM</dt><dd>{teamName ?? 'SOLO RUNNER'}</dd></div>
          <div className="flex items-center gap-2"><dt className="font-display text-[10px] tracking-widest">ROUTE</dt><dd className="flex items-center gap-1"><span aria-hidden className="inline-block h-3 w-3 border-2 border-navy" style={{ background: PALETTE[domain.color] }} />{`${domain.number} ${domain.name}`}</dd></div>
        </dl>
        <div className="flex flex-col items-center gap-1">
          <QrCode value={qrValue(runner.id)} size={128} />
          <span className="font-display text-[10px] tracking-widest">SCAN AT GATE</span>
        </div>
      </div>
      <div className="mx-4 border-t-4 border-dashed border-navy" aria-hidden />
      <footer className="flex items-center justify-between px-4 py-3 font-ui text-xs font-bold">
        <span>{`${formatEventDates()} · ${EVENT.venue}`}</span>
        <span className={`border-2 border-navy px-2 py-0.5 font-display ${status === 'CHECKED IN' ? 'bg-cyan' : 'bg-white'}`}>{`CHECK-IN: ${status}`}</span>
      </footer>
    </article>
  );
}
