import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { MobileNav, type NavItem } from './MobileNav';
import { Pill } from './Pill';

const SECTIONS: { label: string; id: string }[] = [
  { label: 'RUN', id: 'hero' }, { label: 'DOMAINS', id: 'domains' }, { label: 'CHALLENGE', id: 'challenge' }, { label: 'LEADERBOARD', id: 'leaderboard' },
];

export function Hud() {
  const user = useSession((s) => s.user);
  const coins = useGame((s) => s.coins);
  const scrollT = useWorld((s) => s.scrollT);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const onLanding = pathname === '/';

  const sectionItems: NavItem[] = SECTIONS.map((s) => ({ label: s.label, href: onLanding ? `#${s.id}` : `/#${s.id}` }));
  const items: NavItem[] = user
    ? [...sectionItems, { label: 'STATION', to: '/station', tone: 'cyan' }]
    : [...sectionItems, { label: 'SIGN IN', to: '/signin', tone: 'yellow' }];

  return (
    <>
      <header className="pointer-none fixed inset-x-0 top-0 z-20 flex items-start justify-between p-3 md:p-4">
        <Link to="/" className="pointer-auto block border-4 border-navy bg-pale px-3 py-1.5 shadow-bevel">
          <span className="block font-display text-xl leading-none text-navy md:text-2xl">AI EXPO</span>
          <span className="block font-ui text-[10px] font-bold tracking-[0.2em] text-navy">// RUN THE HACKATHON</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-2 md:flex">
          {sectionItems.map((it) => <Pill key={it.label} href={it.href}>{it.label}</Pill>)}
          {user ? (
            <>
              <Pill to="/station" tone="cyan">STATION</Pill>
              <Link to="/station/profile" className="pointer-auto flex items-center gap-2 border-[3px] border-navy bg-white px-2 py-1 shadow-bevel-sm">
                <span aria-hidden className="h-5 w-5 border-2 border-navy" style={{ background: PALETTE[user.avatar.teamColor] }} />
                <span className="font-display text-xs text-navy">{user.avatar.name}</span>
                <span id="hud-coins" className="rounded-full border-2 border-navy bg-yellow px-2 font-display text-xs text-navy">{coins}</span>
              </Link>
            </>
          ) : (
            <Pill to="/signin" tone="yellow">SIGN IN</Pill>
          )}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {user && <span id="hud-coins-mobile" className="rounded-full border-2 border-navy bg-yellow px-2 font-display text-xs text-navy">{coins}</span>}
          <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}
            className="pointer-auto border-4 border-navy bg-yellow px-3 py-2 font-display text-navy shadow-bevel">
            MENU
          </button>
        </div>
      </header>

      {onLanding && (
        <div aria-hidden className="pointer-none fixed bottom-4 left-4 z-20 hidden h-2 w-40 border-2 border-navy bg-pale md:block">
          <div className="absolute inset-y-0 left-0 bg-yellow" style={{ width: `${scrollT * 100}%` }} />
          <div className="absolute -top-1.5 h-4 w-4 -translate-x-1/2 border-2 border-navy bg-cyan" style={{ left: `${scrollT * 100}%` }} />
        </div>
      )}

      <MobileNav open={open} items={items} onClose={() => setOpen(false)} />
    </>
  );
}
