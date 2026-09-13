export const LANDING_SECTIONS = [
  { id: 'hero', label: 'RUN' },
  { id: 'domains', label: 'DOMAINS' },
  { id: 'challenge', label: 'CHALLENGE' },
  { id: 'leaderboard', label: 'LEADERBOARD' },
  { id: 'checkin', label: 'CHECK-IN' },
  { id: 'footer', label: 'END OF LINE' },
] as const;

export type SectionId = (typeof LANDING_SECTIONS)[number]['id'];

const N = LANDING_SECTIONS.length;

/** Scroll-t window during which the camera travels from section i to i+1 (6 sections → 5 intervals). */
export function sectionWindow(i: number): { start: number; end: number } {
  const start = i / (N - 1);
  return { start, end: Math.min(1, (i + 1) / (N - 1)) };
}

export function activeSection(t: number): SectionId {
  const i = Math.min(N - 1, Math.round(Math.min(1, Math.max(0, t)) * (N - 1)));
  return LANDING_SECTIONS[i].id;
}
