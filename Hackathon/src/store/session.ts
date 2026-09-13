import { create } from 'zustand';
import { api } from '@/api';
import type { Runner } from '@/api/types';

interface SessionState {
  user: Runner | null;
  setUser(user: Runner | null): void;
  hydrate(): void;
  signOut(): Promise<void>;
}

export const useSession = create<SessionState>()((set) => ({
  user: api.currentRunner(),
  setUser: (user) => set({ user }),
  hydrate: () => set({ user: api.currentRunner() }),
  async signOut() { await api.signOut(); set({ user: null }); },
}));
