import type { AvatarConfig } from '@/api/types';
import { SWATCH_NAMES, type PaletteName } from '@/theme/palette';

export type PartKey = 'body' | 'tone' | 'hair' | 'hairColor' | 'outfitColor' | 'outfitPattern' | 'shoeStyle' | 'shoeColor' | 'backpack' | 'board' | 'teamColor';

export interface PartGroup { key: PartKey; label: string; swatch?: boolean; options: { value: string; label: string }[] }

const swatches = SWATCH_NAMES.map((c) => ({ value: c, label: c.toUpperCase() }));

export const PART_GROUPS: PartGroup[] = [
  { key: 'body', label: 'BODY', options: [{ value: 'slim', label: 'SLIM' }, { value: 'regular', label: 'REGULAR' }, { value: 'chunky', label: 'CHUNKY' }] },
  { key: 'tone', label: 'TONE', swatch: true, options: [{ value: 'orange', label: 'ORANGE' }, { value: 'pale', label: 'PALE' }, { value: 'yellow', label: 'YELLOW' }] },
  { key: 'hair', label: 'HAIR', options: [{ value: 'buzz', label: 'BUZZ' }, { value: 'spike', label: 'SPIKE' }, { value: 'bob', label: 'BOB' }, { value: 'afro', label: 'AFRO' }, { value: 'cap', label: 'CAP' }] },
  { key: 'hairColor', label: 'HAIR COLOUR', swatch: true, options: swatches },
  { key: 'outfitColor', label: 'OUTFIT', swatch: true, options: swatches },
  { key: 'outfitPattern', label: 'PATTERN', options: [{ value: 'solid', label: 'SOLID' }, { value: 'stripe', label: 'STRIPE' }, { value: 'block', label: 'BLOCK' }] },
  { key: 'shoeStyle', label: 'SHOES', options: [{ value: 'low', label: 'LOW' }, { value: 'high', label: 'HIGH' }, { value: 'boot', label: 'BOOT' }] },
  { key: 'shoeColor', label: 'SHOE COLOUR', swatch: true, options: swatches },
  { key: 'backpack', label: 'BACKPACK', options: [{ value: 'none', label: 'NONE' }, { value: 'daypack', label: 'DAYPACK' }, { value: 'tube', label: 'TUBE' }] },
  { key: 'board', label: 'BOARD', options: [{ value: 'skate', label: 'SKATE' }, { value: 'hover', label: 'HOVER' }, { value: 'none', label: 'NONE' }] },
  { key: 'teamColor', label: 'TEAM COLOUR', swatch: true, options: swatches },
];

export function currentValue(config: AvatarConfig, key: PartKey): string {
  switch (key) {
    case 'outfitColor': return config.outfit.color;
    case 'outfitPattern': return config.outfit.pattern;
    case 'shoeStyle': return config.shoes.style;
    case 'shoeColor': return config.shoes.color;
    default: return config[key];
  }
}

export function applyOption(config: AvatarConfig, key: PartKey, value: string): AvatarConfig {
  const c = value as PaletteName;
  switch (key) {
    case 'outfitColor': return { ...config, outfit: { ...config.outfit, color: c } };
    case 'outfitPattern': return { ...config, outfit: { ...config.outfit, pattern: value as AvatarConfig['outfit']['pattern'] } };
    case 'shoeStyle': return { ...config, shoes: { ...config.shoes, style: value as AvatarConfig['shoes']['style'] } };
    case 'shoeColor': return { ...config, shoes: { ...config.shoes, color: c } };
    case 'hairColor': case 'teamColor': return { ...config, [key]: c };
    case 'tone': return { ...config, tone: value as AvatarConfig['tone'] };
    case 'body': return { ...config, body: value as AvatarConfig['body'] };
    case 'hair': return { ...config, hair: value as AvatarConfig['hair'] };
    case 'backpack': return { ...config, backpack: value as AvatarConfig['backpack'] };
    case 'board': return { ...config, board: value as AvatarConfig['board'] };
  }
}
