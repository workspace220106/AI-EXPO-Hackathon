export type BadgeId = 'FIRST_RUN' | 'TEAM_BUILDER' | 'CODE_WARRIOR' | 'NIGHT_OWL' | 'SPEED_BUILDER' | 'FINALIST';

export interface BadgeDef { id: BadgeId; label: string; rule: string }

export const BADGES: BadgeDef[] = [
  { id: 'FIRST_RUN', label: 'FIRST RUN', rule: 'Complete registration.' },
  { id: 'TEAM_BUILDER', label: 'TEAM BUILDER', rule: 'Have a crew of two or more.' },
  { id: 'CODE_WARRIOR', label: 'CODE WARRIOR', rule: 'Submit a project.' },
  { id: 'NIGHT_OWL', label: 'NIGHT OWL', rule: 'Ride the line between midnight and 5 AM.' },
  { id: 'SPEED_BUILDER', label: 'SPEED BUILDER', rule: 'Submit within 24 hours of registering.' },
  { id: 'FINALIST', label: 'FINALIST', rule: 'Be in the top 10 during judging.' },
];

export interface BadgeContext {
  registered: boolean;
  teamSize: number;
  hasSubmission: boolean;
  localHour: number;
  registeredAtMs: number | null;
  submittedAtMs: number | null;
  rank: number | null;
  judging: boolean;
}

const DAY = 24 * 3600_000;

export function evaluateBadges(c: BadgeContext): BadgeId[] {
  const out: BadgeId[] = [];
  if (c.registered) out.push('FIRST_RUN');
  if (c.teamSize >= 2) out.push('TEAM_BUILDER');
  if (c.hasSubmission) out.push('CODE_WARRIOR');
  if (c.localHour >= 0 && c.localHour < 5) out.push('NIGHT_OWL');
  if (c.hasSubmission && c.registeredAtMs != null && c.submittedAtMs != null && c.submittedAtMs - c.registeredAtMs <= DAY) out.push('SPEED_BUILDER');
  if (c.judging && c.rank != null && c.rank <= 10) out.push('FINALIST');
  return out;
}
