import { beforeEach, describe, expect, it } from 'vitest';
import { canAccess, furthestStep, STEP_ORDER, STEP_PATH, useRegistration } from '@/store/registration';

describe('registration store', () => {
  beforeEach(() => { window.localStorage.clear(); useRegistration.getState().reset(); });

  it('orders steps and maps paths', () => {
    expect(STEP_ORDER).toEqual(['identity', 'domain', 'runner', 'crew', 'pass']);
    expect(STEP_PATH.domain).toBe('/register/domain');
  });
  it('gates steps on previous completion', () => {
    const c = useRegistration.getState().completed;
    expect(canAccess('identity', c)).toBe(true);
    expect(canAccess('domain', c)).toBe(false);
    expect(furthestStep(c)).toBe('identity');
    useRegistration.getState().complete('identity');
    expect(canAccess('domain', useRegistration.getState().completed)).toBe(true);
    expect(furthestStep(useRegistration.getState().completed)).toBe('domain');
  });
  it('persists the draft but never the password', () => {
    useRegistration.getState().setIdentity({ name: 'A', email: 'a@b.co', org: 'X', phone: '', password: 'secret123', confirm: 'secret123' });
    const raw = window.localStorage.getItem('aiexpo.registration.v1') ?? '';
    expect(raw).toContain('a@b.co');
    expect(raw).not.toContain('secret123');
  });
});
