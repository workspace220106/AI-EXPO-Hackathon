import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { Link } from 'react-router';
import { useWorld } from '@/store/world';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ArcadeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'lg';
  to?: string;
  burst?: boolean;
}

const VARIANT: Record<Variant, string> = {
  primary: 'bg-yellow text-navy border-navy shadow-bevel hover:shadow-bevel-lg',
  secondary: 'bg-pale text-navy border-navy shadow-bevel hover:shadow-bevel-lg',
  danger: 'bg-red text-white border-navy shadow-bevel hover:shadow-bevel-lg',
  ghost: 'bg-white text-navy border-navy shadow-bevel-sm hover:shadow-bevel',
};

const BASE =
  'inline-flex items-center justify-center gap-2 border-4 font-display uppercase tracking-wide select-none ' +
  'transition-[transform,box-shadow] duration-100 ease-out hover:-translate-x-0.5 hover:-translate-y-0.5 ' +
  'active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:pointer-events-none pointer-auto';

const SIZE = { md: 'px-5 py-3 text-base', lg: 'px-8 py-5 text-xl md:text-2xl' };

export function ArcadeButton({ variant = 'primary', size = 'md', to, burst, className = '', onClick, children, ...rest }: ArcadeButtonProps) {
  const shouldBurst = burst ?? variant === 'primary';
  const classes = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`;
  const fire = (e: MouseEvent<HTMLButtonElement>) => {
    if (shouldBurst) useWorld.getState().emit({ type: 'burst', color: 'yellow' });
    onClick?.(e);
  };
  if (to) {
    return (
      <Link id={rest.id} to={to} className={classes} onClick={() => { if (shouldBurst) useWorld.getState().emit({ type: 'burst', color: 'yellow' }); }}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} onClick={fire} {...rest}>
      {children}
    </button>
  );
}
