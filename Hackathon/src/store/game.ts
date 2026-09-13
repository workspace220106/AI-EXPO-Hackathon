import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BADGES, type BadgeId } from '@/lib/badges';
import { useToasts } from './toasts';
import { useWorld } from './world';

interface GameState {
  coins: number;
  badges: Partial<Record<BadgeId, string>>;
  visited: string[];
  collectedCoins: string[];
  sessionStartHour: number;
  awardCoins(n: number, reason?: string): void;
  visit(id: string, coins?: number): boolean;
  collectCoin(id: string, x?: number, y?: number): boolean;
  awardBadge(id: BadgeId): boolean;
  reset(): void;
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      coins: 0,
      badges: {},
      visited: [],
      collectedCoins: [],
      sessionStartHour: new Date().getHours(),
      awardCoins(n, reason) {
        set((s) => ({ coins: s.coins + n }));
        useToasts.getState().push({ kind: 'coin', title: `+${n}`, body: reason });
      },
      visit(id, coins = 10) {
        if (get().visited.includes(id)) return false;
        set((s) => ({ visited: [...s.visited, id] }));
        get().awardCoins(coins, 'NEW STOP');
        return true;
      },
      collectCoin(id, x, y) {
        if (get().collectedCoins.includes(id)) return false;
        set((s) => ({ collectedCoins: [...s.collectedCoins, id], coins: s.coins + 10 }));
        useToasts.getState().push({ kind: 'coin', title: '+10', x, y, ttl: 1400 });
        return true;
      },
      awardBadge(id) {
        if (get().badges[id]) return false;
        set((s) => ({ badges: { ...s.badges, [id]: new Date().toISOString() } }));
        const def = BADGES.find((b) => b.id === id)!;
        useToasts.getState().push({ kind: 'badge', title: def.label, body: def.rule, ttl: 4200 });
        useWorld.getState().emit({ type: 'celebrate' });
        return true;
      },
      reset() { set({ coins: 0, badges: {}, visited: [], collectedCoins: [] }); },
    }),
    {
      name: 'aiexpo.game.v1',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({ coins: s.coins, badges: s.badges, visited: s.visited, collectedCoins: s.collectedCoins }),
    },
  ),
);
