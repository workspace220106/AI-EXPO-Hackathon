import { describe, expect, it } from 'vitest';
import { PALETTE, PALETTE_NAMES, SWATCH_NAMES } from '@/theme/palette';

describe('PALETTE', () => {
  it('has exactly the seven locked colours', () => {
    expect(PALETTE).toEqual({
      yellow: '#FDD013', cyan: '#6AEEFD', navy: '#354093', pale: '#C6FEFE',
      orange: '#F7BE76', red: '#E31902', white: '#FFFFFF',
    });
    expect(PALETTE_NAMES).toHaveLength(7);
    expect(SWATCH_NAMES).toEqual(['yellow', 'cyan', 'navy', 'pale', 'orange', 'red']);
  });
});
