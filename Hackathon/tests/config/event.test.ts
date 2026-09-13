import { describe, expect, it } from 'vitest';
import { DOMAINS, EVENT, TIMELINE_STOPS, domainById, formatEventDates } from '@/config/event';

describe('EVENT config', () => {
  it('names the event AI EXPO with the tagline', () => {
    expect(EVENT.name).toBe('AI EXPO');
    expect(EVENT.tagline).toBe('RUN THE HACKATHON');
  });
  it('has four domains with the locked dominant colours', () => {
    expect(DOMAINS.map((d) => [d.id, d.number, d.color])).toEqual([
      ['ai', '01', 'yellow'], ['data', '02', 'cyan'], ['cyber', '03', 'red'], ['future', '04', 'orange'],
    ]);
    expect(domainById('cyber').line).toBe('BREAK IT. SECURE IT.');
    for (const d of DOMAINS) expect(d.problems).toHaveLength(3);
  });
  it('orders the timeline and flags the deadline as an alert', () => {
    const times = TIMELINE_STOPS.map((s) => Date.parse(s.at));
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(TIMELINE_STOPS.find((s) => s.id === 'deadline')?.alert).toBe(true);
  });
  it('formats the event dates', () => {
    expect(formatEventDates()).toBe('14–15 NOV 2026');
  });
});
