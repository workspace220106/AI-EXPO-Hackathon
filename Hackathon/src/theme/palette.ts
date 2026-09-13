export const PALETTE = {
  yellow: '#FDD013',
  cyan: '#6AEEFD',
  navy: '#354093',
  pale: '#C6FEFE',
  orange: '#F7BE76',
  red: '#E31902',
  white: '#FFFFFF',
} as const;

export type PaletteName = keyof typeof PALETTE;
export const PALETTE_NAMES = Object.keys(PALETTE) as PaletteName[];
/** The six pickable colours (white is reserved for readability). */
export const SWATCH_NAMES: PaletteName[] = ['yellow', 'cyan', 'navy', 'pale', 'orange', 'red'];
