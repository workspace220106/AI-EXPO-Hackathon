import { describe, expect, it } from 'vitest';
import {
  hasErrors, validateIdentity, validateRunnerName, validateSignIn, validateSubmission,
  validateTeamCode, validateTeamCreate, wordCount,
} from '@/lib/validation';

const good = { name: 'Asha Rao', email: 'asha@example.com', org: 'RV College', phone: '+919876543210', password: 'longpassword', confirm: 'longpassword' };

describe('validateIdentity', () => {
  it('passes a good form', () => expect(hasErrors(validateIdentity(good))).toBe(false));
  it('flags each bad field', () => {
    const e = validateIdentity({ name: 'A', email: 'nope', org: '', phone: '12', password: 'short', confirm: 'other' });
    expect(Object.keys(e).sort()).toEqual(['confirm', 'email', 'name', 'org', 'password', 'phone']);
  });
  it('allows an empty phone but not a malformed one', () => {
    expect(validateIdentity({ ...good, phone: '' }).phone).toBeUndefined();
    expect(validateIdentity({ ...good, phone: '98-76' }).phone).toBeDefined();
  });
});

describe('sign-in, runner name, team, code', () => {
  it('requires both sign-in fields', () => {
    expect(Object.keys(validateSignIn({ identifier: '', password: '' })).sort()).toEqual(['identifier', 'password']);
    expect(hasErrors(validateSignIn({ identifier: 'a', password: 'b' }))).toBe(false);
  });
  it('limits runner names to 2–16 letters, digits and spaces', () => {
    expect(validateRunnerName('A')).toBeDefined();
    expect(validateRunnerName('A'.repeat(17))).toBeDefined();
    expect(validateRunnerName('Bad!')).toBeDefined();
    expect(validateRunnerName('PIXEL 9')).toBeUndefined();
  });
  it('validates team creation against the max size', () => {
    expect(validateTeamCreate({ name: 'X', maxMembers: 5 }, 4)).toEqual({ name: expect.any(String), maxMembers: expect.any(String) });
    expect(validateTeamCreate({ name: 'PIXEL RAIDERS', maxMembers: 3 }, 4)).toEqual({});
  });
  it('validates team codes', () => {
    expect(validateTeamCode('RAIL-7K2Q')).toBeUndefined();
    expect(validateTeamCode('rail-7k2q')).toBeUndefined();
    expect(validateTeamCode('7K2Q')).toBeDefined();
  });
});

describe('submission', () => {
  it('counts words', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('  one  two\nthree ')).toBe(3);
  });
  it('requires name, repo url and description ≤ 300 words; demo/deck optional but must be urls', () => {
    const e = validateSubmission({ projectName: '', repoUrl: 'github.com/x', demoUrl: 'nope', description: 'w '.repeat(301), deckUrl: '' });
    expect(Object.keys(e).sort()).toEqual(['demoUrl', 'description', 'projectName', 'repoUrl']);
    expect(validateSubmission({ projectName: 'P', repoUrl: 'https://github.com/x/y', demoUrl: '', description: 'ok', deckUrl: 'https://d.eck' })).toEqual({});
  });
});
