import { BADGES, type BadgeId } from '@/lib/badges';

export function BadgeGrid({ badges }: { badges: Partial<Record<BadgeId, string>> }) {
  return (
    <ul className="grid grid-cols-3 gap-2" aria-label="Badges">
      {BADGES.map((b) => {
        const on = !!badges[b.id];
        return (
          <li key={b.id} title={b.rule} className={`flex aspect-square flex-col items-center justify-center border-[3px] border-navy p-1 text-center ${on ? 'bg-yellow text-navy shadow-bevel-sm' : 'bg-navy text-pale opacity-70'}`}>
            <span aria-hidden className={`mb-1 h-6 w-6 rotate-45 border-2 ${on ? 'border-navy bg-cyan' : 'border-pale bg-navy'}`} />
            <span className="font-display text-[10px] leading-tight">{on ? b.label : '???'}</span>
            {on && <span className="sr-only">unlocked</span>}
          </li>
        );
      })}
    </ul>
  );
}
