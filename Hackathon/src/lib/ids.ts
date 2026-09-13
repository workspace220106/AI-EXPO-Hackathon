export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function formatRunnerId(n: number): string {
  return `#${String(n).padStart(4, '0')}`;
}

export function makeTeamCode(rng: () => number = Math.random): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
  return `RAIL-${s}`;
}

export function isTeamCode(s: string): boolean {
  return /^RAIL-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(s);
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
