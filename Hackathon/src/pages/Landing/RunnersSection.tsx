import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { domainById } from '@/config/event';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';
import { SplitFlap } from '@/ui/SplitFlap';

const MEDALS = ['🥇', '🥈', '🥉'];

export function RunnersSection() {
  const rows = useLeaderboard((s) => s.rows);
  const user = useSession((s) => s.user);

  useEffect(() => {
    const lb = useLeaderboard.getState();
    if (lb.rows.length === 0) void lb.load();
    lb.start();
    return () => lb.stop();
  }, []);

  return (
    <div className="pointer-auto">
      <h2 className="font-display text-3xl text-navy md:text-5xl">THE RUNNERS</h2>
      <Panel tone="navy" className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-xs tracking-widest text-yellow">DEPARTURES · TOP CREWS</span>
          <span className="border-2 border-white bg-red px-2 py-0.5 font-display text-xs text-white">LIVE</span>
        </div>
        <ol className="space-y-2">
          {rows.slice(0, 3).map((r, i) => (
            <motion.li layout key={r.teamId} className="flex items-center gap-3 border-[3px] border-navy bg-pale px-3 py-2 text-navy">
              <span className="text-xl" aria-label={`rank ${r.rank}`}>{MEDALS[i]}</span>
              <span className="font-display text-xs">{`#${String(r.rank).padStart(2, '0')}`}</span>
              <span className="flex-1 font-display text-sm">{r.team}</span>
              <span aria-hidden className="h-3 w-3 border-2 border-navy" style={{ background: PALETTE[domainById(r.domain).color] }} />
              <SplitFlap text={String(r.score)} className="text-sm" />
            </motion.li>
          ))}
        </ol>
        <div className="mt-4">
          <ArcadeButton to={user ? '/station/leaderboard' : '/signin'} variant="secondary" burst={false}>SEE THE FULL BOARD</ArcadeButton>
        </div>
      </Panel>
    </div>
  );
}
