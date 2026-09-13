import { create } from 'zustand';
import { api } from '@/api';
import type { Team } from '@/api/types';
import { syncBadges } from './badgeSync';
import { useSession } from './session';

interface TeamState {
  team: Team | null;
  loading: boolean;
  load(): Promise<void>;
  create(name: string, maxMembers: number): Promise<Team>;
  join(code: string): Promise<Team>;
  leave(): Promise<void>;
}

export const useTeam = create<TeamState>()((set) => {
  const settle = (team: Team | null) => { set({ team, loading: false }); useSession.getState().hydrate(); syncBadges(); };
  return {
    team: null,
    loading: false,
    async load() { set({ loading: true }); settle(await api.getTeam()); },
    async create(name, maxMembers) { const t = await api.createTeam({ name, maxMembers }); settle(t); return t; },
    async join(code) { const t = await api.joinTeam(code); settle(t); return t; },
    async leave() { await api.leaveTeam(); settle(null); },
  };
});
