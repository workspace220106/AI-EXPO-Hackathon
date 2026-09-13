import type { SubmissionInput } from '@/api/types';

export type Errors<K extends string> = Partial<Record<K, string>>;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^\+?\d{8,15}$/;
const RUNNER_NAME_RE = /^[A-Za-z0-9 ]{2,16}$/;

export interface IdentityValues {
  name: string; email: string; org: string; phone: string; password: string; confirm: string;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

export function isUrl(s: string): boolean {
  try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; }
}

export function validateIdentity(v: IdentityValues): Errors<keyof IdentityValues> {
  const e: Errors<keyof IdentityValues> = {};
  if (v.name.trim().length < 2) e.name = 'Give us at least 2 characters.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'That email does not look right.';
  if (!v.org.trim()) e.org = 'Tell us where you run from.';
  if (v.phone.trim() && !PHONE_RE.test(v.phone.trim())) e.phone = '8–15 digits, optional leading +.';
  if (v.password.length < 8) e.password = 'At least 8 characters.';
  if (v.confirm !== v.password) e.confirm = 'Passwords do not match.';
  return e;
}

export function validateSignIn(v: { identifier: string; password: string }): Errors<'identifier' | 'password'> {
  const e: Errors<'identifier' | 'password'> = {};
  if (!v.identifier.trim()) e.identifier = 'Email or runner name, please.';
  if (!v.password) e.password = 'Password required.';
  return e;
}

export function validateRunnerName(name: string): string | undefined {
  return RUNNER_NAME_RE.test(name.trim()) ? undefined : '2–16 letters, digits or spaces.';
}

export function validateTeamCreate(v: { name: string; maxMembers: number }, max: number): Errors<'name' | 'maxMembers'> {
  const e: Errors<'name' | 'maxMembers'> = {};
  const n = v.name.trim().length;
  if (n < 2 || n > 24) e.name = 'Crew names are 2–24 characters.';
  if (!Number.isInteger(v.maxMembers) || v.maxMembers < 2 || v.maxMembers > max) e.maxMembers = `Between 2 and ${max} runners.`;
  return e;
}

export function validateTeamCode(code: string): string | undefined {
  return /^RAIL-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(code.trim().toUpperCase())
    ? undefined : 'Codes look like RAIL-7K2Q.';
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function validateSubmission(v: SubmissionInput): Errors<keyof SubmissionInput> {
  const e: Errors<keyof SubmissionInput> = {};
  if (!v.projectName.trim()) e.projectName = 'Name your project.';
  if (!isUrl(v.repoUrl.trim())) e.repoUrl = 'A full https:// repository link.';
  if (v.demoUrl.trim() && !isUrl(v.demoUrl.trim())) e.demoUrl = 'A full https:// link, or leave it empty.';
  if (v.deckUrl.trim() && !isUrl(v.deckUrl.trim())) e.deckUrl = 'A full https:// link, or leave it empty.';
  const words = wordCount(v.description);
  if (words === 0) e.description = 'Describe the run.';
  else if (words > 300) e.description = `Keep it under 300 words (${words} now).`;
  return e;
}
