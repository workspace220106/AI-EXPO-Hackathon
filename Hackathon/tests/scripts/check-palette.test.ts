import { describe, expect, it } from 'vitest';
import { findViolations } from '../../scripts/check-palette.mjs';

describe('check-palette', () => {
  it('accepts the seven palette colours in any case and 3-digit white', () => {
    expect(findViolations('color: #fdd013; background: #C6FEFE; border: #fff')).toEqual([]);
  });
  it('rejects off-palette hex, rgb and hsl', () => {
    const v = findViolations('a{color:#8b5cf6} b{color: rgb(0,0,0)} c{color: hsl(0 0% 0%)}');
    expect(v).toEqual(['#8b5cf6', 'rgb(0,0,0)', 'hsl(0 0% 0%)']);
  });
});
