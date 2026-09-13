import { describe, expect, it } from 'vitest';
import { createStorage } from '@/lib/storage';

describe('createStorage', () => {
  it('round-trips JSON through a Storage backing', () => {
    const s = createStorage(window.localStorage);
    s.set('k', { a: 1 });
    expect(s.get('k', null)).toEqual({ a: 1 });
    s.remove('k');
    expect(s.get('k', 'fallback')).toBe('fallback');
  });
  it('falls back to memory when the backing throws', () => {
    const throwing = {
      getItem: () => { throw new Error('blocked'); },
      setItem: () => { throw new Error('blocked'); },
      removeItem: () => { throw new Error('blocked'); },
    } as unknown as Storage;
    const s = createStorage(throwing);
    s.set('k', 42);
    expect(s.get('k', 0)).toBe(42);
  });
  it('returns the fallback for corrupt JSON', () => {
    window.localStorage.setItem('bad', '{not json');
    expect(createStorage(window.localStorage).get('bad', 'x')).toBe('x');
  });
});
