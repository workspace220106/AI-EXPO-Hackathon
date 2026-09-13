import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { useToasts } from '@/store/toasts';
import { useWorld } from '@/store/world';
import type { LeaderboardRow } from '@/api/types';

const rows: LeaderboardRow[] = [
  { teamId: 'a', team: 'A', domain: 'ai', score: 900, rank: 1 },
  { teamId: 'b', team: 'B', domain: 'data', score: 800, rank: 2 },
  { teamId: 'me', team: 'ME', domain: 'cyber', score: 790, rank: 3 },
];

// With Math.random pinned to 0.99 every tick picks all three teams and moves them by 40:
// a → 860, b → 760, me → 830 (user team only climbs) ⇒ me rises from rank 3 to rank 2.
describe('leaderboard store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useLeaderboard.setState({ rows, deltas: {}, running: false });
    useToasts.setState({ items: [] });
    useWorld.setState({ events: [] });
    useSession.setState({ user: { id: '#1', name: 'Me', email: 'm@e', org: '', phone: '', domain: 'cyber', avatar: null as never, teamId: 'me', registeredAt: '', openedChallengeAt: null } });
  });
  afterEach(() => { useLeaderboard.getState().stop(); vi.useRealTimers(); });

  it('ticks on an interval, records deltas, and celebrates a climb', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    useLeaderboard.getState().start(1000);
    expect(useLeaderboard.getState().running).toBe(true);
    vi.advanceTimersByTime(1000);
    const s = useLeaderboard.getState();
    expect(s.deltas).toEqual({ a: 0, b: -1, me: 1 });
    expect(s.userRank()).toBe(2);
    expect(useToasts.getState().items.some((t) => t.kind === 'rank' && t.title === '+1 POSITIONS')).toBe(true);
    expect(useWorld.getState().events.some((e) => e.type === 'celebrate')).toBe(true);
    useLeaderboard.getState().stop();
    expect(useLeaderboard.getState().running).toBe(false);
  });
});
