import { beforeEach, describe, expect, it } from 'vitest';
import { useWorld } from '@/store/world';

describe('world store', () => {
  beforeEach(() => useWorld.setState({ events: [], shot: 'landing', scrollT: 0 }));

  it('emits events with ids and prunes old ones', () => {
    useWorld.getState().emit({ type: 'burst', position: [0, 1, 0], color: 'cyan' });
    useWorld.getState().emit({ type: 'pulse', zone: 'checkin' });
    const [a, b] = useWorld.getState().events;
    expect(a.id).not.toBe(b.id);
    expect(a.at).toBeLessThanOrEqual(Date.now());
    useWorld.getState().prune(a.at + 5000);
    expect(useWorld.getState().events).toEqual([]);
  });
  it('clamps scrollT to [0,1]', () => {
    useWorld.getState().setScrollT(1.5);
    expect(useWorld.getState().scrollT).toBe(1);
    useWorld.getState().setScrollT(-1);
    expect(useWorld.getState().scrollT).toBe(0);
  });
  it('tracks door mode, selection and a click handler', () => {
    const calls: string[] = [];
    useWorld.getState().setDoorMode('select');
    useWorld.getState().setSelectedDomain('cyber');
    useWorld.getState().setDoorHandler((id) => calls.push(id));
    useWorld.getState().doorHandler?.('ai');
    expect(useWorld.getState().doorMode).toBe('select');
    expect(useWorld.getState().selectedDomain).toBe('cyber');
    expect(calls).toEqual(['ai']);
    useWorld.getState().setDoorHandler(null);
  });
});
