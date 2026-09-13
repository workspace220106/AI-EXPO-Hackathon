import { DOMAINS, EVENT, type DomainId } from '@/config/event';
import type { AvatarConfig, Announcement, Challenge, LeaderboardRow, Runner, Submission, Team } from './types';

export interface StoredRunner extends Runner { password: string }

export interface MockState {
  version: 1;
  runnerCounter: number;
  runners: Record<string, StoredRunner>;
  teams: Record<string, Team>;
  submissions: Record<string, Submission>;
  leaderboard: LeaderboardRow[];
  announcements: Announcement[];
  readAnnouncementIds: string[];
  currentRunnerId: string | null;
}

const av = (p: Partial<AvatarConfig>): AvatarConfig => ({
  body: 'regular', tone: 'orange', hair: 'spike', hairColor: 'navy',
  outfit: { color: 'yellow', pattern: 'solid' }, shoes: { style: 'high', color: 'cyan' },
  backpack: 'daypack', board: 'skate', teamColor: 'cyan', name: 'RUNNER', ...p,
});

export const DEMO_PASSWORD = 'runner123';

export const DEMO_RUNNER: StoredRunner = {
  id: '#0100',
  name: 'Demo Runner',
  email: 'demo@aiexpo.run',
  org: 'AI EXPO',
  phone: '+910000000000',
  domain: 'ai',
  avatar: av({ name: 'DEMO', hair: 'cap', hairColor: 'red', outfit: { color: 'cyan', pattern: 'stripe' } }),
  teamId: 'team_pixel',
  registeredAt: '2026-10-02T09:00:00+05:30',
  openedChallengeAt: null,
  password: DEMO_PASSWORD,
};

const mate = (runnerId: string, name: string, domain: DomainId, p: Partial<AvatarConfig>) => ({
  runnerId, name, domain, avatar: av({ name: name.toUpperCase(), ...p }), role: 'member' as const,
});

export const SEED_TEAMS: Team[] = [
  {
    id: 'team_pixel', name: 'PIXEL RAIDERS', code: 'RAIL-7K2Q', leaderId: '#0100', maxMembers: 4,
    members: [
      { runnerId: '#0100', name: 'Demo Runner', domain: 'ai', avatar: DEMO_RUNNER.avatar, role: 'leader' },
      mate('#0101', 'Mira', 'data', { hair: 'bob', hairColor: 'yellow', outfit: { color: 'red', pattern: 'block' } }),
    ],
  },
  {
    id: 'team_track', name: 'TRACK HACKERS', code: 'RAIL-M4XZ', leaderId: '#0102', maxMembers: 3,
    members: [
      { ...mate('#0102', 'Dev', 'cyber', { hair: 'buzz', hairColor: 'navy', outfit: { color: 'orange', pattern: 'solid' } }), role: 'leader' },
      mate('#0103', 'Sana', 'cyber', { hair: 'afro', hairColor: 'navy', outfit: { color: 'pale', pattern: 'stripe' } }),
      mate('#0104', 'Arjun', 'ai', { hair: 'cap', hairColor: 'cyan', outfit: { color: 'navy', pattern: 'solid' } }),
    ],
  },
  {
    id: 'team_line', name: 'LINE BREAKERS', code: 'RAIL-B8YT', leaderId: '#0105', maxMembers: 4,
    members: [
      { ...mate('#0105', 'Kai', 'future', { hair: 'spike', hairColor: 'orange', outfit: { color: 'cyan', pattern: 'block' } }), role: 'leader' },
    ],
  },
];

const TEAM_NAMES: [string, DomainId][] = [
  ['PIXEL RAIDERS', 'ai'], ['TRACK HACKERS', 'cyber'], ['LINE BREAKERS', 'future'], ['TUNNEL VISION', 'data'],
  ['COIN COLLECTORS', 'ai'], ['SPRAY SQUAD', 'future'], ['RAIL RUNNERS', 'data'], ['PLATFORM NINE', 'cyber'],
  ['GRAFFITI GANG', 'ai'], ['SIGNAL LOST', 'cyber'], ['NIGHT TRAIN', 'data'], ['CONE HEADS', 'future'],
  ['DEPARTURE BOARD', 'data'], ['HOVERBOARDERS', 'future'], ['TICKET TO RIDE', 'ai'], ['RUSH HOUR', 'cyber'],
  ['LAST STOP', 'data'], ['ORANGE LINE', 'future'], ['CYAN DASH', 'data'], ['YELLOW CARD', 'ai'],
  ['RED SIGNAL', 'cyber'], ['STATION MASTERS', 'ai'], ['SUBWAY SURF', 'future'], ['TRACKSIDE', 'cyber'],
];

export const SEED_LEADERBOARD: LeaderboardRow[] = TEAM_NAMES.map(([team, domain], i) => {
  const id = i === 0 ? 'team_pixel' : i === 1 ? 'team_track' : i === 2 ? 'team_line' : `team_seed_${i}`;
  return { teamId: id, team, domain, score: 980 - i * 31 - (i % 3) * 7, rank: i + 1 };
});

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'REGISTRATION IS OPEN', body: 'Create your runner, pick a route, build your crew. The line opens now.', at: EVENT.timeline.registrationOpens, tag: 'live' },
  { id: 'a2', title: 'KICKOFF AT PLATFORM 9', body: `Doors open 09:00. Kickoff 10:00 sharp at ${EVENT.venue}.`, at: '2026-11-10T09:00:00+05:30', tag: 'none' },
  { id: 'a3', title: 'SUBMISSION DEADLINE', body: 'Submissions lock at 22:00 on 15 Nov. No extensions, no exceptions.', at: '2026-11-11T09:00:00+05:30', tag: 'deadline' },
  { id: 'a4', title: 'MENTOR HOURS', body: 'Route mentors are on the platform 14:00–18:00 both days. Flag one down.', at: '2026-11-12T09:00:00+05:30', tag: 'tip' },
  { id: 'a5', title: 'BRING YOUR OWN HARDWARE', body: 'Future Tech crews: power strips are provided, drones are not.', at: '2026-11-12T12:00:00+05:30', tag: 'none' },
  { id: 'a6', title: 'DEMO FORMAT', body: '2-minute video + live Q&A. Practice the pitch before the deadline.', at: '2026-11-13T09:00:00+05:30', tag: 'tip' },
  { id: 'a7', title: 'LIVE: LEADERBOARD UPDATES', body: 'Scores refresh every round. Watch the board on Train 05.', at: '2026-11-14T11:00:00+05:30', tag: 'live' },
  { id: 'a8', title: 'FINALS LINE-UP', body: 'Top 10 crews present at the finals on 17 Nov, 15:00.', at: '2026-11-16T18:00:00+05:30', tag: 'none' },
];

export const SEED_CHALLENGES: Record<DomainId, Challenge> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, {
    domain: d.id,
    title: `ROUTE ${d.number} — ${d.name}`,
    statement: d.theme,
    problems: d.problems,
    rules: [...EVENT.rules],
    resources: [
      { label: 'Starter kit', url: '#' },
      { label: 'Submission checklist', url: '#' },
      { label: 'Judging rubric', url: '#' },
    ],
  }]),
) as Record<DomainId, Challenge>;

export function makeSeedState(): MockState {
  return {
    version: 1,
    runnerCounter: 246,
    runners: { [DEMO_RUNNER.id]: { ...DEMO_RUNNER } },
    teams: Object.fromEntries(SEED_TEAMS.map((t) => [t.id, structuredClone(t)])),
    submissions: {},
    leaderboard: SEED_LEADERBOARD.map((r) => ({ ...r })),
    announcements: SEED_ANNOUNCEMENTS.map((a) => ({ ...a })),
    readAnnouncementIds: [],
    currentRunnerId: null,
  };
}
