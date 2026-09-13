import { useEffect } from 'react';
import { EVENT } from '@/config/event';
import { deriveStage, stageIndex, type Stage } from '@/lib/progress';
import { now } from '@/lib/time';
import { useLeaderboard } from '@/store/leaderboard';
import { useSession } from '@/store/session';
import { useSubmission } from '@/store/submission';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';

export function useStage(): { stage: Stage | null; index: number } {
  const user = useSession((s) => s.user);
  const team = useTeam((s) => s.team);
  const submission = useSubmission((s) => s.submission);
  const rows = useLeaderboard((s) => s.rows);
  const rank = user?.teamId ? rows.find((r) => r.teamId === user.teamId)?.rank ?? null : null;
  const stage = deriveStage({
    signedIn: !!user,
    teamSize: team?.members.length ?? 0,
    openedChallenge: !!user?.openedChallengeAt,
    hasSubmission: !!submission,
    nowMs: now(),
    deadlineMs: Date.parse(EVENT.timeline.submissionDeadline),
    rank,
  });
  const index = stage ? stageIndex(stage) : -1;
  useEffect(() => { useWorld.getState().setStageIndex(index); }, [index]);
  return { stage, index };
}
