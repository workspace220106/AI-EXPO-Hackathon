import { describe, expect, it } from 'vitest';
import { deriveStage, stageIndex, STAGES, type ProgressContext } from '@/lib/progress';

const base: ProgressContext = { signedIn: true, teamSize: 1, openedChallenge: false, hasSubmission: false, nowMs: 100, deadlineMs: 200, rank: null };

describe('deriveStage', () => {
  it('is null when signed out', () => expect(deriveStage({ ...base, signedIn: false })).toBeNull());
  it('walks the stages', () => {
    expect(deriveStage(base)).toBe('REGISTERED');
    expect(deriveStage({ ...base, teamSize: 2 })).toBe('TEAM READY');
    expect(deriveStage({ ...base, openedChallenge: true })).toBe('BUILDING');
    expect(deriveStage({ ...base, hasSubmission: true })).toBe('SUBMITTED');
    expect(deriveStage({ ...base, nowMs: 300 })).toBe('JUDGING');
    expect(deriveStage({ ...base, nowMs: 300, rank: 10 })).toBe('FINALIST');
    expect(deriveStage({ ...base, nowMs: 300, rank: 11 })).toBe('JUDGING');
    expect(deriveStage({ ...base, nowMs: 100, rank: 1 })).toBe('REGISTERED');
  });
  it('takes the highest true predicate regardless of lower ones', () => {
    expect(deriveStage({ ...base, hasSubmission: true, teamSize: 1, openedChallenge: false })).toBe('SUBMITTED');
  });
  it('indexes stages', () => {
    expect(STAGES).toHaveLength(6);
    expect(stageIndex('BUILDING')).toBe(2);
  });
});
