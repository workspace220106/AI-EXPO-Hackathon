import { describe, expect, it } from 'vitest';
import { DEMO_RUNNER, SEED_LEADERBOARD, SEED_TEAMS, makeSeedState } from '@/api/seed';
import { isTeamCode } from '@/lib/ids';

describe('seed', () => {
  it('starts the runner counter at 246 and seeds the demo runner', () => {
    const s = makeSeedState();
    expect(s.runnerCounter).toBe(246);
    expect(s.runners[DEMO_RUNNER.id]?.email).toBe('demo@aiexpo.run');
    expect(s.currentRunnerId).toBeNull();
  });
  it('seeds joinable teams with valid codes, including PIXEL RAIDERS', () => {
    const pixel = SEED_TEAMS.find((t) => t.name === 'PIXEL RAIDERS');
    expect(pixel?.code).toBe('RAIL-7K2Q');
    for (const t of SEED_TEAMS) expect(isTeamCode(t.code)).toBe(true);
  });
  it('seeds 24 leaderboard rows across all four domains', () => {
    expect(SEED_LEADERBOARD).toHaveLength(24);
    expect(new Set(SEED_LEADERBOARD.map((r) => r.domain)).size).toBe(4);
  });
});
