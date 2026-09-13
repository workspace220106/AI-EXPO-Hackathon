import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { DEFAULT_AVATAR, type AvatarConfig } from '@/api/types';
import type { DomainId } from '@/config/event';
import type { IdentityValues } from '@/lib/validation';

export type Step = 'identity' | 'domain' | 'runner' | 'crew' | 'pass';
export const STEP_ORDER: Step[] = ['identity', 'domain', 'runner', 'crew', 'pass'];
export const STEP_PATH: Record<Step, string> = {
  identity: '/register/identity', domain: '/register/domain', runner: '/register/runner',
  crew: '/register/crew', pass: '/register/pass',
};

export type Completed = Record<Step, boolean>;
const NONE: Completed = { identity: false, domain: false, runner: false, crew: false, pass: false };

export function canAccess(step: Step, completed: Completed): boolean {
  const i = STEP_ORDER.indexOf(step);
  return STEP_ORDER.slice(0, i).every((s) => completed[s]);
}

export function furthestStep(completed: Completed): Step {
  return STEP_ORDER.find((s) => !completed[s]) ?? 'pass';
}

interface RegistrationState {
  identity: IdentityValues | null;
  domain: DomainId | null;
  avatar: AvatarConfig;
  completed: Completed;
  setIdentity(v: IdentityValues): void;
  setDomain(d: DomainId): void;
  setAvatar(a: AvatarConfig): void;
  complete(step: Step): void;
  reset(): void;
}

export const useRegistration = create<RegistrationState>()(
  persist(
    (set) => ({
      identity: null,
      domain: null,
      avatar: DEFAULT_AVATAR,
      completed: { ...NONE },
      setIdentity: (identity) => set({ identity }),
      setDomain: (domain) => set({ domain }),
      setAvatar: (avatar) => set({ avatar }),
      complete: (step) => set((s) => ({ completed: { ...s.completed, [step]: true } })),
      reset: () => set({ identity: null, domain: null, avatar: DEFAULT_AVATAR, completed: { ...NONE } }),
    }),
    {
      name: 'aiexpo.registration.v1',
      storage: createJSONStorage(() => window.localStorage),
      partialize: (s) => ({
        identity: s.identity ? { ...s.identity, password: '', confirm: '' } : null,
        domain: s.domain, avatar: s.avatar, completed: s.completed,
      }),
    },
  ),
);
