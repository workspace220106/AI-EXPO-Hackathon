import type { ReactNode } from 'react';
import { NavLink } from 'react-router';

export interface PillProps {
  to?: string;
  href?: string;
  active?: boolean;
  tone?: 'pale' | 'yellow' | 'cyan';
  onClick?: () => void;
  children: ReactNode;
}

const TONE = { pale: 'bg-pale', yellow: 'bg-yellow', cyan: 'bg-cyan' };
const BASE = 'pointer-auto inline-flex items-center rounded-full border-[3px] border-navy px-3 py-1 font-display text-xs tracking-wider text-navy shadow-bevel-sm transition-colors hover:bg-cyan';

export function Pill({ to, href, active, tone = 'pale', onClick, children }: PillProps) {
  const cls = `${BASE} ${active ? 'bg-cyan' : TONE[tone]}`;
  if (to) return <NavLink to={to} className={({ isActive }) => `${BASE} ${isActive || active ? 'bg-cyan' : TONE[tone]}`} onClick={onClick}>{children}</NavLink>;
  if (href) return <a href={href} className={cls} onClick={onClick}>{children}</a>;
  return <button type="button" className={cls} onClick={onClick}>{children}</button>;
}
