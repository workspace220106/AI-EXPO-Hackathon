export const ARRIVAL_DURATION = 2.5;
export const ARRIVAL_STOP_Z = -186;
const START_Z = -120;

const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - t, 3); };

/** Lights flick on over the first 1.5 s; the train decelerates in over 2 s; doors open in the last 0.5 s. */
export function arrivalAt(t: number): { trainZ: number; doors: number; lightsOn: number } {
  const c = Math.min(ARRIVAL_DURATION, Math.max(0, t));
  const lightsOn = Math.min(8, Math.floor((c / 1.5) * 8 + 1e-9));
  const trainZ = START_Z + (ARRIVAL_STOP_Z - START_Z) * ease(c / 2.0);
  const doors = c < 2.0 ? 0 : (c - 2.0) / 0.5;
  return { trainZ, doors: Math.min(1, doors), lightsOn };
}
