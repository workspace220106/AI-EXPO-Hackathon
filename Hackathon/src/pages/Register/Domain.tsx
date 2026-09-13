import { useEffect, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { DOMAINS, type DomainId } from '@/config/event';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';
import { DOOR_Z } from '@/world/layout';

export default function Domain() {
  const navigate = useNavigate();
  const selected = useWorld((s) => s.selectedDomain);
  const setSelected = useWorld((s) => s.setSelectedDomain);
  const initial = useRegistration((s) => s.domain);

  useEffect(() => {
    const w = useWorld.getState();
    w.setDoorMode('select');
    w.setSelectedDomain(initial);
    w.setDoorHandler((id) => w.setSelectedDomain(id));
    return () => { w.setDoorMode('showcase'); w.setSelectedDomain(null); w.setDoorHandler(null); };
  }, [initial]);

  const move = (delta: number) => {
    const i = DOMAINS.findIndex((d) => d.id === selected);
    const next = DOMAINS[(i < 0 ? 0 : i + delta + DOMAINS.length) % DOMAINS.length];
    setSelected(next.id);
    useWorld.getState().emit({ type: 'burst', position: [-8, 3, DOOR_Z[next.id]], color: 'cyan' });
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
    if (e.key === 'Enter' && selected) lockIn();
  };

  const lockIn = () => {
    if (!selected) return;
    const reg = useRegistration.getState();
    reg.setDomain(selected as DomainId);
    if (!reg.completed.domain) useGame.getState().awardCoins(25, 'ROUTE LOCKED');
    reg.complete('domain');
    navigate('/register/runner');
  };

  return (
    <main id="content" className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="CHOOSE YOUR DOMAIN" className="w-full max-w-md max-h-[90dvh] overflow-y-auto">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Step 2 of 5 — pick the door you'll run through. Click a door or use the arrows.</p>
        <div role="radiogroup" aria-label="Domain" tabIndex={0} onKeyDown={onKey} className="grid gap-3 outline-none focus-visible:ring-4 focus-visible:ring-cyan">
          {DOMAINS.map((d) => {
            const on = selected === d.id;
            return (
              <button
                key={d.id} type="button" role="radio" aria-checked={on}
                onClick={() => { setSelected(d.id); useWorld.getState().emit({ type: 'burst', zone: 'wall', color: 'cyan' }); }}
                className={`flex items-center gap-4 border-4 border-navy p-3 text-left shadow-bevel transition-transform hover:-translate-y-0.5 ${on ? 'bg-cyan' : 'bg-white'}`}
              >
                <span aria-hidden className="flex h-12 w-12 shrink-0 items-center justify-center border-[3px] border-navy font-display text-lg text-navy" style={{ background: PALETTE[d.color] }}>{d.number}</span>
                <span>
                  <span className="block font-display text-lg text-navy">{`${d.number} ${d.name}`}</span>
                  <span className="block font-ui text-xs font-bold text-navy">{d.line}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-5">
          <ArcadeButton size="lg" className="w-full" disabled={!selected} onClick={lockIn}>LOCK IN ROUTE</ArcadeButton>
        </div>
      </Panel>
    </main>
  );
}
