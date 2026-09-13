import { describe, expect, it } from 'vitest';
import type { LeaderboardRow } from '@/api/types';
import { rankDeltas, rankRows, tickScores } from '@/lib/leaderboard';

const rows: LeaderboardRow[] = [
  { teamId: 'a', team: 'A', domain: 'ai', score: 900, rank: 1 },
  { teamId: 'b', team: 'B', domain: 'data', score: 800, rank: 2 },
  { teamId: 'c', team: 'C', domain: 'cyber', score: 700, rank: 3 },
  { teamId: 'd', team: 'D', domain: 'future', score: 600, rank: 4 },
];

function seq(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe('leaderboard math', () => {
  it('ranks by score descending', () => {
    const r = rankRows([...rows].reverse());
    expect(r.map((x) => x.teamId)).toEqual(['a', 'b', 'c', 'd']);
    expect(r.map((x) => x.rank)).toEqual([1, 2, 3, 4]);
  });
  it('ticks 3–6 teams by ±5–40 with a positive bias for the user team, never below 0', () => {
    const out = tickScores(rows, seq([0, 0, 0.99, 0.5, 0.2, 0.7, 0.1]), 'd');
    const changed = out.filter((r) => r.score !== rows.find((x) => x.teamId === r.teamId)!.score);
    expect(changed.length).toBeGreaterThanOrEqual(3);
    expect(changed.length).toBeLessThanOrEqual(6);
    for (const r of out) {
      const before = rows.find((x) => x.teamId === r.teamId)!.score;
      const d = Math.abs(r.score - before);
      expect(d === 0 || (d >= 5 && d <= 40)).toBe(true);
      expect(r.score).toBeGreaterThanOrEqual(0);
    }
    const user = out.find((r) => r.teamId === 'd')!;
    expect(user.score).toBeGreaterThanOrEqual(600);
  });
  it('computes rank deltas (positive = climbed)', () => {
    const after = rankRows(rows.map((r) => (r.teamId === 'd' ? { ...r, score: 850 } : r)));
    expect(rankDeltas(rows, after)).toEqual({ a: 0, b: -1, c: -1, d: 2 });
  });
});
