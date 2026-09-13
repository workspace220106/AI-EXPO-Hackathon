import { useState } from 'react';
import { api } from '@/api';
import { EVENT } from '@/config/event';
import { getTimeOffset, setTimeOffset } from '@/lib/time';
import { useGame } from '@/store/game';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';

const DAY = 86_400_000;

export function DevPanel({ search = typeof window === 'undefined' ? '' : window.location.search }: { search?: string }) {
  const [, force] = useState(0);
  const drawCalls = useWorld((s) => s.drawCalls);
  const tier = useWorld((s) => s.qualityTier);
  if (!new URLSearchParams(search).has('dev')) return null;
  const bump = () => force((n) => n + 1);
  const btn = 'pointer-auto border-2 border-navy bg-white px-2 py-1 font-display text-[10px] hover:bg-cyan';
  return (
    <aside className="pointer-auto fixed bottom-4 left-4 z-40 w-56 border-4 border-navy bg-yellow p-2 text-navy shadow-bevel">
      <p className="font-display text-xs">DEV</p>
      <p className="font-ui text-[10px] font-bold">{`clock +${Math.round(getTimeOffset() / 3600_000)}h · ${tier} · ${drawCalls} calls`}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <button type="button" className={btn} onClick={() => { setTimeOffset(getTimeOffset() + DAY); bump(); }}>+1 DAY</button>
        <button type="button" className={btn} onClick={() => { setTimeOffset(Date.parse(EVENT.timeline.submissionDeadline) - Date.now() + 3600_000); bump(); }}>JUMP TO JUDGING</button>
        <button type="button" className={btn} onClick={() => { setTimeOffset(0); bump(); }}>RESET CLOCK</button>
        <button type="button" className={btn} onClick={() => useLeaderboard.getState().tick()}>TICK BOARD</button>
        <button type="button" className={btn} onClick={() => useGame.getState().awardCoins(100, 'DEV')}>+100 COINS</button>
        <button type="button" className={btn} onClick={() => { api.reset(); useSession.getState().hydrate(); useGame.getState().reset(); window.location.href = '/'; }}>RESET MOCK DATA</button>
      </div>
    </aside>
  );
}
