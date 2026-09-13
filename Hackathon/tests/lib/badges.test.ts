import { describe, expect, it } from 'vitest';
import { BADGES, evaluateBadges, type BadgeContext } from '@/lib/badges';

const base: BadgeContext = { registered: false, teamSize: 0, hasSubmission: false, localHour: 12, registeredAtMs: null, submittedAtMs: null, rank: null, judging: false };

describe('evaluateBadges', () => {
  it('defines six badges', () => expect(BADGES.map((b) => b.id)).toEqual(['FIRST_RUN', 'TEAM_BUILDER', 'CODE_WARRIOR', 'NIGHT_OWL', 'SPEED_BUILDER', 'FINALIST']));
  it('awards nothing for a fresh visitor at noon', () => expect(evaluateBadges(base)).toEqual([]));
  it('awards each badge by its rule', () => {
    expect(evaluateBadges({ ...base, registered: true })).toEqual(['FIRST_RUN']);
    expect(evaluateBadges({ ...base, teamSize: 2 })).toEqual(['TEAM_BUILDER']);
    expect(evaluateBadges({ ...base, hasSubmission: true })).toEqual(['CODE_WARRIOR']);
    expect(evaluateBadges({ ...base, localHour: 3 })).toEqual(['NIGHT_OWL']);
    expect(evaluateBadges({ ...base, localHour: 5 })).toEqual([]);
    const h = 3600_000;
    expect(evaluateBadges({ ...base, hasSubmission: true, registeredAtMs: 0, submittedAtMs: 23 * h })).toEqual(['CODE_WARRIOR', 'SPEED_BUILDER']);
    expect(evaluateBadges({ ...base, hasSubmission: true, registeredAtMs: 0, submittedAtMs: 25 * h })).toEqual(['CODE_WARRIOR']);
    expect(evaluateBadges({ ...base, rank: 10, judging: true })).toEqual(['FINALIST']);
    expect(evaluateBadges({ ...base, rank: 10, judging: false })).toEqual([]);
  });
});
