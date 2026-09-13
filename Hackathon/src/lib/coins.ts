import { sampleLanding } from './landingPath';

export const LANDING_COINS = [0.06, 0.12, 0.2, 0.28, 0.34, 0.42, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9].map((t, i) => ({ id: `coin_${i}`, t }));

/** A coin floats a little right, lower and ahead of the camera position at its scroll-t. */
export function coinWorldPosition(t: number): [number, number, number] {
  const p = sampleLanding(t).position;
  const side = t * 100 % 2 < 1 ? 1.6 : -1.2;
  return [p[0] + side, p[1] - 0.9, p[2] - 7];
}

export function dueCoins(scrollT: number, collected: string[]): string[] {
  return LANDING_COINS.filter((c) => scrollT >= c.t - 0.01 && !collected.includes(c.id)).map((c) => c.id);
}
