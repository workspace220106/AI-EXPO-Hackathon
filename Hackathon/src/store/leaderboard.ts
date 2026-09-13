import { create } from 'zustand';
import { api } from '@/api';
import type { LeaderboardRow } from '@/api/types';
import { rankDeltas, tickScores } from '@/lib/leaderboard';
import { syncBadges } from './badgeSync';
import { useSession } from './session';
import { useToasts } from './toasts';
import { useWorld } from './world';

interface LeaderboardState {
  rows: LeaderboardRow[];
  deltas: Record<string, number>;
  running: boolean;
  load(): Promise<void>;
  tick(): void;
  start(intervalMs?: number): void;
  stop(): void;
  userTeamId(): string | null;
  userRank(): number | null;
}

let timer: ReturnType<typeof setInterval> | null = null;

export const useLeaderboard = create<LeaderboardState>()((set, get) => ({
  rows: [],
  deltas: {},
  running: false,
  async load() {
    set({ rows: await api.getLeaderboard(), deltas: {} });
    syncBadges({ rank: get().userRank() });
  },
  tick() {
    const before = get().rows;
    if (before.length === 0) return;
    const rows = tickScores(before, Math.random, get().userTeamId());
    const deltas = rankDeltas(before, rows);
    set({ rows, deltas });
    const mine = get().userTeamId();
    const d = mine ? deltas[mine] ?? 0 : 0;
    if (d > 0) {
      useToasts.getState().push({ kind: 'rank', title: `+${d} POSITIONS`, ttl: 2200 });
      useWorld.getState().emit({ type: 'celebrate' });
    } else if (d < 0) {
      useToasts.getState().push({ kind: 'rank', title: `RANK DROP ${d}`, ttl: 2200 });
    }
    syncBadges({ rank: get().userRank() });
  },
  start(intervalMs = 20_000) {
    if (timer) return;
    timer = setInterval(() => { if (typeof document === 'undefined' || !document.hidden) get().tick(); }, intervalMs);
    set({ running: true });
  },
  stop() {
    if (timer) clearInterval(timer);
    timer = null;
    set({ running: false });
  },
  userTeamId: () => useSession.getState().user?.teamId ?? null,
  userRank() {
    const id = get().userTeamId();
    return id ? get().rows.find((r) => r.teamId === id)?.rank ?? null : null;
  },
}));
