import type { PaletteName } from '@/theme/palette';

export type DomainId = 'ai' | 'data' | 'cyber' | 'future';

export interface DomainConfig {
  id: DomainId;
  number: '01' | '02' | '03' | '04';
  name: string;
  line: string;
  color: PaletteName;
  theme: string;
  problems: string[];
}

export const DOMAINS: DomainConfig[] = [
  {
    id: 'ai', number: '01', name: 'AI', line: 'MAKE MACHINES THINK.', color: 'yellow',
    theme: 'Build systems that learn, reason and act. Agents, copilots, vision, speech — anything that makes a machine useful in a way it was not yesterday.',
    problems: [
      'An agent that turns a messy college notice board into a personal weekly plan.',
      'A voice assistant for a local language that works fully offline on a phone.',
      'A model that grades hackathon demos from a 2-minute video and explains its score.',
    ],
  },
  {
    id: 'data', number: '02', name: 'DATA', line: 'FIND THE PATTERN.', color: 'cyan',
    theme: 'Turn raw, noisy, real-world data into decisions. Pipelines, dashboards, forecasting, anomaly detection — make the invisible obvious.',
    problems: [
      'Predict crowding at metro stations from open transit feeds and weather.',
      'A live dashboard that spots fraudulent UPI patterns from synthetic transaction streams.',
      'Rank which city wards need a new water tanker route this week — with evidence.',
    ],
  },
  {
    id: 'cyber', number: '03', name: 'CYBER', line: 'BREAK IT. SECURE IT.', color: 'red',
    theme: 'Find the gap, then close it. Defensive tooling, threat detection, secure-by-default developer experience, privacy tech.',
    problems: [
      'A GitHub bot that flags leaked secrets and auto-opens a fix PR.',
      'Phishing-resistant login for a campus portal using passkeys.',
      'A honeypot dashboard that visualises attacker behaviour in real time.',
    ],
  },
  {
    id: 'future', number: '04', name: 'FUTURE TECH', line: "BUILD WHAT'S NEXT.", color: 'orange',
    theme: 'Robotics, AR/VR, drones, IoT, bio-inspired computing — prototypes that feel like they arrived early from ten years ahead.',
    problems: [
      'A drone that maps potholes on a campus loop and exports a repair list.',
      'AR wayfinding inside a metro station that works from a single photo of a sign.',
      'A low-cost sensor kit that turns any classroom into a live air-quality map.',
    ],
  },
];

export const EVENT = {
  name: 'AI EXPO',
  tagline: 'RUN THE HACKATHON',
  mode: 'In-person',
  venue: 'Innovation Hall, Platform 9',
  city: 'Bengaluru',
  organizer: 'AI EXPO Organising Committee',
  timezone: 'Asia/Kolkata',
  timeline: {
    registrationOpens: '2026-10-01T00:00:00+05:30',
    kickoff: '2026-11-14T10:00:00+05:30',
    buildHours: 36,
    submissionDeadline: '2026-11-15T22:00:00+05:30',
    judging: '2026-11-16T10:00:00+05:30',
    finals: '2026-11-17T15:00:00+05:30',
  },
  team: { min: 1, max: 4 },
  prizes: [
    { place: 1, label: 'GRAND PRIZE', amount: '₹1,00,000' },
    { place: 2, label: 'RUNNER-UP', amount: '₹50,000' },
    { place: 3, label: 'THIRD', amount: '₹25,000' },
    { place: 0, label: 'BEST IN EACH ROUTE', amount: '₹10,000 × 4' },
  ],
  judging: ['Innovation', 'Technical depth', 'Impact', 'Demo & pitch'],
  rules: [
    'Teams of 1–4. One submission per team.',
    'All code written during the 36-hour build window.',
    'Open-source libraries and public APIs are allowed; disclose them.',
    'Submit a repo, a demo link and a 2-minute walkthrough before the deadline.',
  ],
  socials: { instagram: '#', linkedin: '#', discord: '#' },
} as const;

export const TIMELINE_STOPS = [
  { id: 'opens', label: 'REGISTRATION OPENS', at: EVENT.timeline.registrationOpens, alert: false },
  { id: 'kickoff', label: 'KICKOFF', at: EVENT.timeline.kickoff, alert: false },
  { id: 'build', label: '36H BUILD', at: '2026-11-14T12:00:00+05:30', alert: false },
  { id: 'deadline', label: 'SUBMISSION DEADLINE', at: EVENT.timeline.submissionDeadline, alert: true },
  { id: 'judging', label: 'JUDGING', at: EVENT.timeline.judging, alert: false },
  { id: 'finals', label: 'FINALS', at: EVENT.timeline.finals, alert: false },
] as const;

export function domainById(id: DomainId): DomainConfig {
  const d = DOMAINS.find((x) => x.id === id);
  if (!d) throw new Error(`Unknown domain ${id}`);
  return d;
}

/** "14–15 NOV 2026" — derived from kickoff/deadline in the event timezone. */
export function formatEventDates(): string {
  const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat('en-GB', { timeZone: EVENT.timezone, ...opts }).format(new Date(iso));
  const start = fmt(EVENT.timeline.kickoff, { day: 'numeric' });
  const end = fmt(EVENT.timeline.submissionDeadline, { day: 'numeric' });
  const month = fmt(EVENT.timeline.kickoff, { month: 'short' }).toUpperCase();
  const year = fmt(EVENT.timeline.kickoff, { year: 'numeric' });
  return `${start}–${end} ${month} ${year}`;
}
