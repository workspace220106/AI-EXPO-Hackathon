import { afterEach, describe, expect, it } from 'vitest';
import { getTimeOffset, now, setTimeOffset } from '@/lib/time';

describe('time', () => {
  afterEach(() => setTimeOffset(0));
  it('applies a dev offset to now()', () => {
    const real = Date.now();
    setTimeOffset(60_000);
    expect(getTimeOffset()).toBe(60_000);
    expect(now() - real).toBeGreaterThanOrEqual(60_000);
  });
});
