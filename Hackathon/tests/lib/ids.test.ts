import { describe, expect, it } from 'vitest';
import { CODE_ALPHABET, formatRunnerId, isTeamCode, makeTeamCode, uid } from '@/lib/ids';

describe('ids', () => {
  it('formats runner ids as # + 4 digits', () => {
    expect(formatRunnerId(247)).toBe('#0247');
    expect(formatRunnerId(12)).toBe('#0012');
  });
  it('makes RAIL-XXXX codes without ambiguous characters', () => {
    expect(CODE_ALPHABET).not.toMatch(/[0O1I]/);
    const code = makeTeamCode(() => 0);
    expect(code).toBe('RAIL-AAAA');
    expect(isTeamCode(code)).toBe(true);
    expect(isTeamCode('RAIL-0OI1')).toBe(false);
    expect(isTeamCode('rail-aaaa')).toBe(false);
  });
  it('makes unique uids with a prefix', () => {
    expect(uid('t')).toMatch(/^t_/);
    expect(uid('t')).not.toBe(uid('t'));
  });
});
