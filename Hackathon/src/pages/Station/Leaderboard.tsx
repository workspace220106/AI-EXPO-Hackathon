import { motion } from 'framer-motion';
import { domainById } from '@/config/event';
import { useLeaderboard } from '@/store/leaderboard';
import { PALETTE } from '@/theme/palette';
import { SplitFlap } from '@/ui/SplitFlap';
import { SectionPanel } from './SectionPanel';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const rows = useLeaderboard((s) => s.rows);
  const deltas = useLeaderboard((s) => s.deltas);
  const mine = useLeaderboard((s) => s.userTeamId());

  return (
    <SectionPanel train={5} title="THE RUNNERS" wide>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display text-xs tracking-widest">DEPARTURES · ALL CREWS</p>
        <span className="border-2 border-navy bg-red px-2 py-0.5 font-display text-xs text-white">LIVE</span>
      </div>
      <div className="overflow-x-auto border-4 border-navy bg-navy p-2">
        <table className="w-full border-separate border-spacing-y-1 font-ui text-xs text-navy">
          <thead>
            <tr className="font-display text-[10px] tracking-widest text-yellow">
              <th className="px-2 text-left">RANK</th><th className="px-2 text-left">TEAM</th><th className="px-2 text-left">ROUTE</th><th className="px-2 text-right">SCORE</th><th className="px-2 text-right">Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = deltas[r.teamId] ?? 0;
              const isMine = r.teamId === mine;
              return (
                <motion.tr layout key={r.teamId} data-mine={isMine ? 'true' : 'false'} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className={`${isMine ? 'bg-cyan' : 'bg-pale'} font-bold`}>
                  <td className="px-2 py-1.5 font-display">{r.rank <= 3 ? <span className="mr-1">{MEDALS[r.rank - 1]}</span> : null}{`#${String(r.rank).padStart(2, '0')}`}</td>
                  <td className="px-2 py-1.5 font-display">{r.team}</td>
                  <td className="px-2 py-1.5"><span className="inline-flex items-center gap-1"><span aria-hidden className="inline-block h-3 w-3 border-2 border-navy" style={{ background: PALETTE[domainById(r.domain).color] }} />{domainById(r.domain).name}</span></td>
                  <td className="px-2 py-1.5 text-right"><SplitFlap text={String(r.score)} /></td>
                  <td className={`px-2 py-1.5 text-right font-display ${d > 0 ? 'text-navy' : d < 0 ? 'text-red' : 'text-navy/50'}`}>{d > 0 ? `▲${d}` : d < 0 ? `▼${-d}` : '—'}</td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionPanel>
  );
}
