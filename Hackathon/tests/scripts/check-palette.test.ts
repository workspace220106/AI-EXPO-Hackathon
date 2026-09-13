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
  it('rejects named CSS colours used as CSS values', () => {
    expect(findViolations('a { color: red; } b { background: Tomato }', 'x.css')).toEqual(['red', 'Tomato']);
    expect(findViolations('<div style="color: navy"></div>', 'x.html')).toEqual(['navy']);
  });
  it('ignores keywords that are not colour values', () => {
    expect(findViolations('@theme { --color-red: #E31902; } a { background: transparent; font-family: "Bungee", sans-serif }', 'x.css')).toEqual([]);
    expect(findViolations('.x { background-image: repeating-linear-gradient(90deg, #354093 0 2px, transparent 2px 48px); }', 'x.css')).toEqual([]);
  });
  it('in TS/TSX only flags named colours inside JSX style objects', () => {
    expect(findViolations("<div style={{ color: 'tomato', background: PALETTE.navy }} />", 'x.tsx')).toEqual(['tomato']);
    expect(findViolations("const a = { outfit: { color: 'red' }, hairColor: 'navy' }; mat('white');", 'x.ts')).toEqual([]);
  });
  it('does not mistake runner ids (# + four digits) for colours', () => {
    expect(findViolations("id: '#0247', leaderId: '#0100'", 'x.ts')).toEqual([]);
    expect(findViolations('a { color: #0247 }', 'x.css')).toEqual([]);
    expect(findViolations('a { color: #0247a }', 'x.css')).toEqual(['#0247a']);
  });
});
