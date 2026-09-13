import { EVENT } from '@/config/event';
import { evaluateBadges, type BadgeId } from '@/lib/badges';
import { now } from '@/lib/time';
import { useGame } from './game';
import { useSession } from './session';
import { useTeam } from './team';

export interface BadgeExtra { hasSubmission?: boolean; submittedAtMs?: number | null; rank?: number | null; judging?: boolean }

/** Evaluate every badge rule against live state and award the new ones. Returns the newly awarded ids. */
export function syncBadges(extra: BadgeExtra = {}): BadgeId[] {
  const user = useSession.getState().user;
  const team = useTeam.getState().team;
  const earned = evaluateBadges({
    registered: !!user,
    teamSize: team?.members.length ?? 0,
    hasSubmission: extra.hasSubmission ?? false,
    localHour: new Date(now()).getHours(),
    registeredAtMs: user ? Date.parse(user.registeredAt) : null,
    submittedAtMs: extra.submittedAtMs ?? null,
    rank: extra.rank ?? null,
    judging: extra.judging ?? now() >= Date.parse(EVENT.timeline.submissionDeadline),
  });
  return earned.filter((id) => useGame.getState().awardBadge(id));
}
