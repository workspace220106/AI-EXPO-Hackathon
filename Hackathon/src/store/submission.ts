import { create } from 'zustand';
import { api } from '@/api';
import type { Submission, SubmissionInput } from '@/api/types';
import { syncBadges } from './badgeSync';
import { useGame } from './game';

interface SubmissionState {
  submission: Submission | null;
  loaded: boolean;
  load(): Promise<void>;
  submit(input: SubmissionInput): Promise<Submission>;
}

export const useSubmission = create<SubmissionState>()((set, get) => ({
  submission: null,
  loaded: false,
  async load() { set({ submission: await api.getSubmission(), loaded: true }); },
  async submit(input) {
    const first = get().submission == null;
    const s = await api.submitProject(input);
    set({ submission: s, loaded: true });
    if (first) useGame.getState().awardCoins(50, 'RUN SUBMITTED');
    syncBadges({ hasSubmission: true, submittedAtMs: Date.parse(s.submittedAt) });
    return s;
  },
}));
