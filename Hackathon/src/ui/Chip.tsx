import type { ReactNode } from 'react';
import { PALETTE, type PaletteName } from '@/theme/palette';

export interface ChipProps {
  selected?: boolean;
  swatch?: PaletteName;
  onClick: () => void;
  onMouseEnter?: () => void;
  children?: ReactNode;
  title?: string;
}

export function Chip({ selected, swatch, onClick, onMouseEnter, children, title }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      aria-label={title}
      title={title}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`pointer-auto inline-flex min-h-11 items-center gap-2 border-[3px] border-navy px-3 py-1.5 font-ui text-sm font-bold text-navy transition-transform hover:-translate-y-0.5 ${
        selected ? 'bg-cyan shadow-bevel' : 'bg-white shadow-bevel-sm'
      }`}
    >
      {swatch && <span aria-hidden className="inline-block h-5 w-5 border-2 border-navy" style={{ background: PALETTE[swatch] }} />}
      {children}
    </button>
  );
}
