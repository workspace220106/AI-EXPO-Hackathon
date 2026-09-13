import type { LeaderboardRow } from '@/api/types';

export function rankRows(rows: LeaderboardRow[]): LeaderboardRow[] {
  return [...rows].sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));
}

/**
 * One ticker step: 3–6 random teams move by ±(5–40). The user's team, when picked, only ever gains
 * (a mild demo bias so climbs are visible). Scores never drop below 0. Returns re-ranked rows.
 */
export function tickScores(rows: LeaderboardRow[], rng: () => number, userTeamId: string | null): LeaderboardRow[] {
  const count = Math.min(3 + Math.floor(rng() * 4), rows.length);
  // Partial Fisher–Yates: `count` distinct indices, terminates for any rng (even a constant one).
  const idx = rows.map((_, i) => i);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (idx.length - i));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const picked = new Set(idx.slice(0, count));
  const next = rows.map((r, i) => {
    if (!picked.has(i)) return { ...r };
    const magnitude = 5 + Math.floor(rng() * 36);
    const up = r.teamId === userTeamId ? true : rng() < 0.5;
    return { ...r, score: Math.max(0, r.score + (up ? magnitude : -magnitude)) };
  });
  return rankRows(next);
}

/** Positive = climbed that many places. Teams missing from `before` get 0. */
export function rankDeltas(before: LeaderboardRow[], after: LeaderboardRow[]): Record<string, number> {
  const prev = new Map(before.map((r) => [r.teamId, r.rank]));
  const out: Record<string, number> = {};
  for (const r of after) out[r.teamId] = (prev.get(r.teamId) ?? r.rank) - r.rank;
  return out;
}
