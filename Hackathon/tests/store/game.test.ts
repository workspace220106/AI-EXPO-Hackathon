import { beforeEach, describe, expect, it } from 'vitest';
import { useGame } from '@/store/game';
import { useToasts } from '@/store/toasts';
import { useWorld } from '@/store/world';

describe('game store', () => {
  beforeEach(() => { window.localStorage.clear(); useGame.getState().reset(); useToasts.setState({ items: [] }); });

  it('awards coins and pushes a coin toast', () => {
    useGame.getState().awardCoins(25, 'STEP COMPLETE');
    expect(useGame.getState().coins).toBe(25);
    expect(useToasts.getState().items[0]).toMatchObject({ kind: 'coin', title: '+25' });
  });
  it('pays a zone visit only once', () => {
    expect(useGame.getState().visit('hall')).toBe(true);
    expect(useGame.getState().visit('hall')).toBe(false);
    expect(useGame.getState().coins).toBe(10);
  });
  it('collects a coin once', () => {
    expect(useGame.getState().collectCoin('c1')).toBe(true);
    expect(useGame.getState().collectCoin('c1')).toBe(false);
    expect(useGame.getState().coins).toBe(10);
  });
  it('awards a badge once with a timestamp and a badge toast', () => {
    expect(useGame.getState().awardBadge('FIRST_RUN')).toBe(true);
    expect(useGame.getState().awardBadge('FIRST_RUN')).toBe(false);
    expect(useGame.getState().badges.FIRST_RUN).toMatch(/^\d{4}-/);
    expect(useToasts.getState().items.some((t) => t.kind === 'badge' && t.title === 'FIRST RUN')).toBe(true);
  });
  it('emits a world celebrate event when a badge unlocks', () => {
    useWorld.setState({ events: [] });
    useGame.getState().awardBadge('CODE_WARRIOR');
    expect(useWorld.getState().events.some((e) => e.type === 'celebrate')).toBe(true);
  });
});
