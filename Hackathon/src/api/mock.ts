import { EVENT, type DomainId } from '@/config/event';
import { formatRunnerId, isTeamCode, makeTeamCode, uid } from '@/lib/ids';
import { storage as defaultStorage, type JsonStorage } from '@/lib/storage';
import { now as defaultNow } from '@/lib/time';
import { DEMO_RUNNER, SEED_CHALLENGES, makeSeedState, type MockState, type StoredRunner } from './seed';
import {
  ApiError, type Announcement, type AvatarConfig, type Challenge, type HackathonApi,
  type LeaderboardRow, type Runner, type Submission, type SubmissionInput, type Team,
} from './types';

export const MOCK_STORAGE_KEY = 'aiexpo.mock.v1';

export interface MockApiOptions {
  storage?: JsonStorage;
  latency?: [number, number];
  now?: () => number;
  random?: () => number;
}

export interface MockApi extends HackathonApi {
  reset(): void;
  markAnnouncementsRead(): void;
  unreadAnnouncementCount(): number;
  /** Synchronous helper for inline form validation (a real backend would expose an endpoint). */
  isEmailTaken(email: string): boolean;
}

const strip = (r: StoredRunner): Runner => {
  const { password: _password, ...runner } = r;
  return runner;
};

export function createMockApi(opts: MockApiOptions = {}): MockApi {
  const store = opts.storage ?? defaultStorage;
  const [minLat, maxLat] = opts.latency ?? [180, 420];
  const nowMs = opts.now ?? defaultNow;
  const rng = opts.random ?? Math.random;

  let state: MockState = store.get<MockState | null>(MOCK_STORAGE_KEY, null) ?? makeSeedState();
  if (state.version !== 1) state = makeSeedState();

  const save = () => store.set(MOCK_STORAGE_KEY, state);
  const wait = () => new Promise<void>((res) => setTimeout(res, minLat + rng() * (maxLat - minLat)));
  const iso = () => new Date(nowMs()).toISOString();

  const current = (): StoredRunner => {
    const r = state.currentRunnerId ? state.runners[state.currentRunnerId] : null;
    if (!r) throw new ApiError('NOT_SIGNED_IN', 'Sign in first, runner.');
    return r;
  };
  const teamOf = (r: StoredRunner): Team | null => (r.teamId ? state.teams[r.teamId] ?? null : null);
  const ownerKey = (r: StoredRunner) => r.teamId ?? r.id;
  const rankRows = (rows: LeaderboardRow[]) =>
    [...rows].sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 }));

  return {
    currentRunner: () => (state.currentRunnerId ? strip(state.runners[state.currentRunnerId]) : null),

    async signIn({ identifier, password }) {
      await wait();
      const key = identifier.trim().toLowerCase();
      const r = Object.values(state.runners).find(
        (x) => x.email.toLowerCase() === key || x.avatar.name.toLowerCase() === key,
      );
      if (!r) throw new ApiError('NO_RUNNER', 'No runner found on this line.');
      if (r.password !== password) throw new ApiError('BAD_PASSWORD', 'Wrong password, runner.');
      state.currentRunnerId = r.id; save();
      return strip(r);
    },

    async signInWithProvider() {
      await wait();
      if (!state.runners[DEMO_RUNNER.id]) state.runners[DEMO_RUNNER.id] = { ...DEMO_RUNNER };
      state.currentRunnerId = DEMO_RUNNER.id; save();
      return strip(state.runners[DEMO_RUNNER.id]);
    },

    async signOut() { await wait(); state.currentRunnerId = null; save(); },

    async register(input) {
      await wait();
      const email = input.email.trim().toLowerCase();
      if (Object.values(state.runners).some((r) => r.email.toLowerCase() === email))
        throw new ApiError('EMAIL_TAKEN', 'That email already has a runner.');
      state.runnerCounter += 1;
      const runner: StoredRunner = {
        id: formatRunnerId(state.runnerCounter), name: input.name.trim(), email, org: input.org.trim(),
        phone: input.phone.trim(), domain: input.domain, avatar: input.avatar, teamId: null,
        registeredAt: iso(), openedChallengeAt: null, password: input.password,
      };
      state.runners[runner.id] = runner;
      state.currentRunnerId = runner.id; save();
      return strip(runner);
    },

    async updateAvatar(avatar: AvatarConfig) {
      await wait();
      const r = current();
      r.avatar = avatar;
      const t = teamOf(r);
      if (t) t.members = t.members.map((m) => (m.runnerId === r.id ? { ...m, avatar, name: r.name } : m));
      save();
      return strip(r);
    },

    async markChallengeOpened() {
      await wait();
      const r = current();
      if (!r.openedChallengeAt) { r.openedChallengeAt = iso(); save(); }
      return strip(r);
    },

    async createTeam({ name, maxMembers }) {
      await wait();
      const r = current();
      if (r.teamId) throw new ApiError('ALREADY_IN_TEAM', 'You already have a crew.');
      let code = makeTeamCode(rng);
      const codes = new Set(Object.values(state.teams).map((t) => t.code));
      while (codes.has(code)) code = makeTeamCode(rng);
      const team: Team = {
        id: uid('team'), name: name.trim(), code, leaderId: r.id,
        maxMembers: Math.min(Math.max(maxMembers, 2), EVENT.team.max),
        members: [{ runnerId: r.id, name: r.name, avatar: r.avatar, domain: r.domain, role: 'leader' }],
      };
      state.teams[team.id] = team;
      r.teamId = team.id;
      state.leaderboard.push({ teamId: team.id, team: team.name, domain: r.domain, score: 420, rank: 0 });
      state.leaderboard = rankRows(state.leaderboard);
      save();
      return structuredClone(team);
    },

    async joinTeam(codeInput) {
      await wait();
      const r = current();
      const code = codeInput.trim().toUpperCase();
      const team = isTeamCode(code) ? Object.values(state.teams).find((t) => t.code === code) : undefined;
      if (r.teamId) throw new ApiError('ALREADY_IN_TEAM', 'You already have a crew.');
      if (!team) throw new ApiError('TEAM_NOT_FOUND', 'No crew with that code.');
      if (team.members.length >= team.maxMembers) throw new ApiError('TEAM_FULL', 'That crew is full.');
      team.members.push({ runnerId: r.id, name: r.name, avatar: r.avatar, domain: r.domain, role: 'member' });
      r.teamId = team.id; save();
      return structuredClone(team);
    },

    async leaveTeam() {
      await wait();
      const r = current();
      const team = teamOf(r);
      if (!team) throw new ApiError('NOT_IN_TEAM', 'You are not in a crew.');
      team.members = team.members.filter((m) => m.runnerId !== r.id);
      r.teamId = null;
      if (team.members.length === 0) {
        delete state.teams[team.id];
        state.leaderboard = rankRows(state.leaderboard.filter((row) => row.teamId !== team.id));
      } else if (team.leaderId === r.id) {
        team.leaderId = team.members[0].runnerId;
        team.members[0].role = 'leader';
      }
      save();
    },

    async getTeam() {
      await wait();
      const t = teamOf(current());
      return t ? structuredClone(t) : null;
    },

    async getChallenge(domain: DomainId): Promise<Challenge> {
      await wait();
      return structuredClone(SEED_CHALLENGES[domain]);
    },

    async getSubmission() {
      await wait();
      const s = state.submissions[ownerKey(current())];
      return s ? { ...s } : null;
    },

    async submitProject(input: SubmissionInput) {
      await wait();
      const r = current();
      if (nowMs() >= Date.parse(EVENT.timeline.submissionDeadline))
        throw new ApiError('DEADLINE_PASSED', 'The submission deadline has passed.');
      const key = ownerKey(r);
      const existing = state.submissions[key];
      const sub: Submission = {
        id: existing?.id ?? uid('sub'), ownerKey: key, ...input,
        submittedAt: existing?.submittedAt ?? iso(), updatedAt: iso(),
      };
      state.submissions[key] = sub; save();
      return { ...sub };
    },

    async getLeaderboard() {
      await wait();
      state.leaderboard = rankRows(state.leaderboard);
      return state.leaderboard.map((r) => ({ ...r }));
    },

    async getAnnouncements(): Promise<Announcement[]> {
      await wait();
      return [...state.announcements].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
    },

    markAnnouncementsRead() {
      state.readAnnouncementIds = state.announcements.map((a) => a.id); save();
    },
    unreadAnnouncementCount() {
      const read = new Set(state.readAnnouncementIds);
      return state.announcements.filter((a) => !read.has(a.id)).length;
    },
    isEmailTaken(email) {
      const key = email.trim().toLowerCase();
      return Object.values(state.runners).some((r) => r.email.toLowerCase() === key);
    },
    reset() { state = makeSeedState(); save(); },
  };
}
