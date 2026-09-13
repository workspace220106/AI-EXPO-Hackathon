let offsetMs = 0;

/** Wall-clock now in ms, plus a dev-panel offset used to demo later event stages. */
export function now(): number {
  return Date.now() + offsetMs;
}
export function setTimeOffset(ms: number): void { offsetMs = ms; }
export function getTimeOffset(): number { return offsetMs; }
