export const STAGES = ['REGISTERED', 'TEAM READY', 'BUILDING', 'SUBMITTED', 'JUDGING', 'FINALIST'] as const;
export type Stage = (typeof STAGES)[number];

export interface ProgressContext {
  signedIn: boolean;
  teamSize: number;
  openedChallenge: boolean;
  hasSubmission: boolean;
  nowMs: number;
  deadlineMs: number;
  rank: number | null;
}

/** Highest stage whose predicate holds, evaluated in order. Never stored — always derived. */
export function deriveStage(c: ProgressContext): Stage | null {
  if (!c.signedIn) return null;
  const judging = c.nowMs >= c.deadlineMs;
  const predicates: Record<Stage, boolean> = {
    REGISTERED: true,
    'TEAM READY': c.teamSize >= 2,
    BUILDING: c.openedChallenge,
    SUBMITTED: c.hasSubmission,
    JUDGING: judging,
    FINALIST: judging && c.rank != null && c.rank <= 10,
  };
  let stage: Stage = 'REGISTERED';
  for (const s of STAGES) if (predicates[s]) stage = s;
  return stage;
}

export function stageIndex(stage: Stage): number {
  return STAGES.indexOf(stage);
}
