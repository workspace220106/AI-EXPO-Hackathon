import { beforeEach, describe, expect, it } from 'vitest';
import { createMockApi } from '@/api/mock';
import { DEFAULT_AVATAR, ApiError, type RegistrationInput } from '@/api/types';
import { DEMO_PASSWORD } from '@/api/seed';
import { createStorage } from '@/lib/storage';
import { EVENT } from '@/config/event';

const input = (over: Partial<RegistrationInput> = {}): RegistrationInput => ({
  name: 'Asha Rao', email: 'asha@example.com', org: 'RV College', phone: '+919876543210',
  password: 'longpassword', domain: 'data', avatar: { ...DEFAULT_AVATAR, name: 'ASHA' }, ...over,
});

const BEFORE = Date.parse('2026-11-14T12:00:00+05:30');
const AFTER = Date.parse(EVENT.timeline.submissionDeadline) + 1000;

function make(nowMs = BEFORE) {
  return createMockApi({ storage: createStorage(null), latency: [0, 0], now: () => nowMs, random: () => 0.5 });
}

async function expectCode(p: Promise<unknown>, code: string) {
  await expect(p).rejects.toSatisfy((e) => e instanceof ApiError && e.code === code);
}

describe('mock api — runners', () => {
  let api: ReturnType<typeof make>;
  beforeEach(() => { api = make(); });

  it('registers with sequential ids starting at #0247 and signs the runner in', async () => {
    const a = await api.register(input());
    expect(a.id).toBe('#0247');
    expect(api.currentRunner()?.id).toBe('#0247');
    const b = await api.register(input({ email: 'b@example.com' }));
    expect(b.id).toBe('#0248');
  });
  it('rejects a taken email', async () => {
    await api.register(input());
    await expectCode(api.register(input()), 'EMAIL_TAKEN');
  });
  it('signs in by email or runner name with the right password', async () => {
    await api.register(input());
    await api.signOut();
    expect(api.currentRunner()).toBeNull();
    await expect(api.signIn({ identifier: 'ASHA@example.com', password: 'longpassword' })).resolves.toMatchObject({ id: '#0247' });
    await expect(api.signIn({ identifier: 'ASHA', password: 'longpassword' })).resolves.toMatchObject({ id: '#0247' });
    await expectCode(api.signIn({ identifier: 'asha@example.com', password: 'nope' }), 'BAD_PASSWORD');
    await expectCode(api.signIn({ identifier: 'ghost@example.com', password: 'x' }), 'NO_RUNNER');
  });
  it('provider sign-in returns the demo runner', async () => {
    const r = await api.signInWithProvider('google');
    expect(r.email).toBe('demo@aiexpo.run');
    await api.signOut();
    await expect(api.signIn({ identifier: 'demo@aiexpo.run', password: DEMO_PASSWORD })).resolves.toMatchObject({ id: '#0100' });
  });
  it('updates the avatar and marks the challenge opened once', async () => {
    await api.register(input());
    const r = await api.updateAvatar({ ...DEFAULT_AVATAR, name: 'NEW' });
    expect(r.avatar.name).toBe('NEW');
    const first = await api.markChallengeOpened();
    const second = await api.markChallengeOpened();
    expect(first.openedChallengeAt).toBe(new Date(BEFORE).toISOString());
    expect(second.openedChallengeAt).toBe(first.openedChallengeAt);
  });
  it('requires a session for runner operations', async () => {
    await expectCode(api.updateAvatar(DEFAULT_AVATAR), 'NOT_SIGNED_IN');
    await expectCode(api.createTeam({ name: 'X', maxMembers: 2 }), 'NOT_SIGNED_IN');
  });
});

describe('mock api — teams', () => {
  let api: ReturnType<typeof make>;
  beforeEach(async () => { api = make(); await api.register(input()); });

  it('creates a team with a RAIL code, the creator as leader, and a leaderboard row', async () => {
    const t = await api.createTeam({ name: 'NEW CREW', maxMembers: 3 });
    expect(t.code).toMatch(/^RAIL-[A-Z2-9]{4}$/);
    expect(t.members).toEqual([expect.objectContaining({ runnerId: '#0247', role: 'leader' })]);
    expect(api.currentRunner()?.teamId).toBe(t.id);
    const rows = await api.getLeaderboard();
    expect(rows.find((r) => r.teamId === t.id)).toMatchObject({ team: 'NEW CREW', domain: 'data' });
  });
  it('joins a seeded team by code (case-insensitive) and rejects unknown/full/duplicate joins', async () => {
    const t = await api.joinTeam('rail-7k2q');
    expect(t.name).toBe('PIXEL RAIDERS');
    expect(t.members.map((m) => m.runnerId)).toContain('#0247');
    await expectCode(api.joinTeam('RAIL-B8YT'), 'ALREADY_IN_TEAM');
    await api.leaveTeam();
    await expectCode(api.joinTeam('RAIL-ZZZZ'), 'TEAM_NOT_FOUND');
    await expectCode(api.joinTeam('RAIL-M4XZ'), 'TEAM_FULL');
  });
  it('leaving promotes the next member or deletes an empty team', async () => {
    const t = await api.createTeam({ name: 'SOLO', maxMembers: 2 });
    await api.leaveTeam();
    expect(await api.getTeam()).toBeNull();
    expect((await api.getLeaderboard()).some((r) => r.teamId === t.id)).toBe(false);
    await api.joinTeam('RAIL-B8YT');
    await expectCode(api.leaveTeam().then(() => api.leaveTeam()), 'NOT_IN_TEAM');
  });
});

describe('mock api — submissions, challenge, board, announcements', () => {
  it('creates and edits a submission before the deadline, locks after', async () => {
    const api = make();
    await api.register(input());
    expect(await api.getSubmission()).toBeNull();
    const s = await api.submitProject({ projectName: 'Metro Mind', repoUrl: 'https://github.com/x/y', demoUrl: 'https://demo.x', description: 'Predicts crowding.', deckUrl: '' });
    expect(s.ownerKey).toBe('#0247');
    const s2 = await api.submitProject({ projectName: 'Metro Mind 2', repoUrl: s.repoUrl, demoUrl: s.demoUrl, description: s.description, deckUrl: '' });
    expect(s2.id).toBe(s.id);
    expect(s2.projectName).toBe('Metro Mind 2');
    expect(s2.submittedAt).toBe(s.submittedAt);
    const late = make(AFTER);
    await late.register(input());
    await expectCode(late.submitProject({ projectName: 'x', repoUrl: 'https://a', demoUrl: '', description: 'd', deckUrl: '' }), 'DEADLINE_PASSED');
  });
  it('keys submissions by team when the runner has one', async () => {
    const api = make();
    await api.register(input());
    const t = await api.createTeam({ name: 'CREW', maxMembers: 2 });
    const s = await api.submitProject({ projectName: 'P', repoUrl: 'https://a', demoUrl: '', description: 'd', deckUrl: '' });
    expect(s.ownerKey).toBe(t.id);
  });
  it('returns ranked leaderboard rows, the challenge and announcements', async () => {
    const api = make();
    const rows = await api.getLeaderboard();
    expect(rows[0].rank).toBe(1);
    expect(rows.every((r, i) => i === 0 || rows[i - 1].score >= r.score)).toBe(true);
    expect((await api.getChallenge('cyber')).title).toBe('ROUTE 03 — CYBER');
    expect(await api.getAnnouncements()).toHaveLength(8);
    expect(api.unreadAnnouncementCount()).toBe(8);
    api.markAnnouncementsRead();
    expect(api.unreadAnnouncementCount()).toBe(0);
    expect(api.isEmailTaken('DEMO@aiexpo.run')).toBe(true);
    expect(api.isEmailTaken('nobody@aiexpo.run')).toBe(false);
  });
  it('persists state through the storage and resets', async () => {
    const store = createStorage(window.localStorage);
    const a = createMockApi({ storage: store, latency: [0, 0], now: () => BEFORE });
    await a.register(input());
    const b = createMockApi({ storage: store, latency: [0, 0], now: () => BEFORE });
    expect(b.currentRunner()?.id).toBe('#0247');
    b.reset();
    expect(b.currentRunner()).toBeNull();
  });
});
