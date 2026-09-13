import { EVENT, TIMELINE_STOPS } from '@/config/event';
import { PALETTE } from '@/theme/palette';
import { Panel } from '@/ui/Panel';
import { SplitFlap } from '@/ui/SplitFlap';

function stopDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone: EVENT.timezone, day: 'numeric', month: 'short' }).format(new Date(iso)).toUpperCase();
}

export function LineSection() {
  const n = TIMELINE_STOPS.length;
  return (
    <div className="pointer-auto">
      <h2 className="font-display text-3xl text-navy md:text-5xl">THE LINE</h2>
      <p className="mt-2 font-ui text-sm font-bold text-navy">{`${EVENT.timeline.buildHours} hours. One route. Every stop matters.`}</p>

      <svg viewBox={`0 0 ${n * 120} 110`} className="mt-6 w-full" role="img" aria-label="Event timeline">
        <line x1="40" y1="40" x2={n * 120 - 80} y2="40" stroke={PALETTE.yellow} strokeWidth="10" strokeLinecap="round" />
        {TIMELINE_STOPS.map((s, i) => (
          <g key={s.id} transform={`translate(${40 + i * 120}, 40)`}>
            <circle r="13" fill={s.alert ? PALETTE.red : PALETTE.pale} stroke={PALETTE.navy} strokeWidth="5" />
            <text y="42" textAnchor="middle" fontSize="11" fontFamily="Bungee" fill={PALETTE.navy}>{s.label}</text>
            <text y="60" textAnchor="middle" fontSize="10" fontFamily="Rubik" fontWeight="700" fill={s.alert ? PALETTE.red : PALETTE.navy}>{stopDate(s.at)}</text>
          </g>
        ))}
      </svg>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Panel tone="navy" className="p-4!">
          <h3 className="font-display text-sm tracking-widest text-yellow"><SplitFlap text="WHAT TO BUILD" /></h3>
          <ul className="mt-2 space-y-1 font-ui text-xs">{EVENT.rules.map((r) => <li key={r}>• {r}</li>)}</ul>
        </Panel>
        <Panel tone="navy" className="p-4!">
          <h3 className="font-display text-sm tracking-widest text-yellow"><SplitFlap text="JUDGING" /></h3>
          <ul className="mt-2 space-y-1 font-ui text-xs">{EVENT.judging.map((j) => <li key={j}>• {j}</li>)}</ul>
        </Panel>
        <Panel tone="navy" className="p-4!">
          <h3 className="font-display text-sm tracking-widest text-yellow"><SplitFlap text="PRIZES" /></h3>
          <ul className="mt-2 space-y-1 font-ui text-xs">
            {EVENT.prizes.map((p) => (
              <li key={p.label} className="flex justify-between gap-2"><span>{p.label}</span><span className="font-display text-yellow">{p.amount}</span></li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
