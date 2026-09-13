import type { ReactNode } from 'react';

export interface PanelProps {
  title?: string;
  tone?: 'pale' | 'navy' | 'white';
  className?: string;
  children: ReactNode;
}

const TONE = {
  pale: 'bg-pale text-navy',
  navy: 'bg-navy text-pale',
  white: 'bg-white text-navy',
};

export function Panel({ title, tone = 'pale', className = '', children }: PanelProps) {
  return (
    <section className={`pointer-auto border-4 border-navy p-5 shadow-bevel-lg md:p-7 ${TONE[tone]} ${className}`}>
      {title && <h2 className="mb-4 font-display text-2xl leading-tight md:text-3xl">{title}</h2>}
      {children}
    </section>
  );
}
