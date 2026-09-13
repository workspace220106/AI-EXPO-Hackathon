import type { DomainId } from '@/config/event';
import type { PaletteName } from '@/theme/palette';

export type BodyType = 'slim' | 'regular' | 'chunky';
export type ToneName = 'orange' | 'pale' | 'yellow';
export type HairStyle = 'buzz' | 'spike' | 'bob' | 'afro' | 'cap';
export type OutfitPattern = 'solid' | 'stripe' | 'block';
export type ShoeStyle = 'low' | 'high' | 'boot';
export type BackpackStyle = 'none' | 'daypack' | 'tube';
export type BoardStyle = 'skate' | 'hover' | 'none';

export interface AvatarConfig {
  body: BodyType;
  tone: ToneName;
  hair: HairStyle;
  hairColor: PaletteName;
  outfit: { color: PaletteName; pattern: OutfitPattern };
  shoes: { style: ShoeStyle; color: PaletteName };
  backpack: BackpackStyle;
  board: BoardStyle;
  teamColor: PaletteName;
  name: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
  body: 'regular',
  tone: 'orange',
  hair: 'spike',
  hairColor: 'navy',
  outfit: { color: 'yellow', pattern: 'solid' },
  shoes: { style: 'high', color: 'cyan' },
  backpack: 'daypack',
  board: 'skate',
  teamColor: 'cyan',
  name: 'RUNNER',
};

export interface Runner {
  id: string;            // "#0247"
  name: string;
  email: string;
  org: string;
  phone: string;
  domain: DomainId;
  avatar: AvatarConfig;
  teamId: string | null;
  registeredAt: string;  // ISO
  openedChallengeAt: string | null;
}

export type TeamRole = 'leader' | 'member';

export interface TeamMember {
  runnerId: string;
  name: string;
  avatar: AvatarConfig;
  domain: DomainId;
  role: TeamRole;
}

export interface Team {
  id: string;
  name: string;
  code: string;          // "RAIL-7K2Q"
  leaderId: string;
  maxMembers: number;
  members: TeamMember[];
}

export interface Submission {
  id: string;
  ownerKey: string;      // teamId if the runner has a team, else runnerId
  projectName: string;
  repoUrl: string;
  demoUrl: string;
  description: string;
  deckUrl: string;
  submittedAt: string;
  updatedAt: string;
}

export interface LeaderboardRow {
  teamId: string;
  team: string;
  domain: DomainId;
  score: number;
  rank: number;
}

export type AnnouncementTag = 'none' | 'live' | 'deadline' | 'tip';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  at: string;
  tag: AnnouncementTag;
}

export interface Challenge {
  domain: DomainId;
  title: string;
  statement: string;
  problems: string[];
  rules: string[];
  resources: { label: string; url: string }[];
}

export interface RegistrationInput {
  name: string;
  email: string;
  org: string;
  phone: string;
  password: string;
  domain: DomainId;
  avatar: AvatarConfig;
}

export interface SubmissionInput {
  projectName: string;
  repoUrl: string;
  demoUrl: string;
  description: string;
  deckUrl: string;
}

export type ApiErrorCode =
  | 'NO_RUNNER' | 'BAD_PASSWORD' | 'EMAIL_TAKEN' | 'NOT_SIGNED_IN'
  | 'TEAM_NOT_FOUND' | 'TEAM_FULL' | 'ALREADY_IN_TEAM' | 'NOT_IN_TEAM' | 'DEADLINE_PASSED';

export class ApiError extends Error {
  constructor(public code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface HackathonApi {
  currentRunner(): Runner | null;
  signIn(input: { identifier: string; password: string }): Promise<Runner>;
  signInWithProvider(provider: 'google' | 'github'): Promise<Runner>;
  signOut(): Promise<void>;
  register(input: RegistrationInput): Promise<Runner>;
  updateAvatar(avatar: AvatarConfig): Promise<Runner>;
  markChallengeOpened(): Promise<Runner>;
  createTeam(input: { name: string; maxMembers: number }): Promise<Team>;
  joinTeam(code: string): Promise<Team>;
  leaveTeam(): Promise<void>;
  getTeam(): Promise<Team | null>;
  getChallenge(domain: DomainId): Promise<Challenge>;
  getSubmission(): Promise<Submission | null>;
  submitProject(input: SubmissionInput): Promise<Submission>;
  getLeaderboard(): Promise<LeaderboardRow[]>;
  getAnnouncements(): Promise<Announcement[]>;
}
