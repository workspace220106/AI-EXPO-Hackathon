import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useWorld } from '@/store/world';

type Base = { label: string; name: string; error?: string; hint?: string; zone?: string };
type InputProps = Base & { multiline?: false } & InputHTMLAttributes<HTMLInputElement>;
type AreaProps = Base & { multiline: true } & TextareaHTMLAttributes<HTMLTextAreaElement>;
export type FieldProps = InputProps | AreaProps;

const CONTROL =
  'pointer-auto block w-full border-[3px] border-navy bg-white px-3 py-3 font-ui text-base text-navy placeholder:text-navy/50 ' +
  'transition-transform duration-150 focus:scale-[1.02] focus:border-cyan focus:outline-none aria-[invalid=true]:border-red';

export function Field(props: FieldProps) {
  const { label, name, error, hint, zone, multiline, className = '', ...rest } = props as Base & {
    multiline?: boolean; className?: string;
  } & Record<string, unknown>;
  const id = `field-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  const onFocus = () => {
    const w = useWorld.getState();
    w.emit({ type: 'pulse', zone: zone ?? 'kiosk', color: 'cyan' });
    w.emit({ type: 'burst', zone: zone ?? 'kiosk', color: 'cyan' });
    w.emit({ type: 'look', zone: zone ?? 'kiosk' });
  };

  const shared = { id, name, 'aria-invalid': !!error, 'aria-describedby': describedBy, onFocus };
  const control = multiline ? (
    <textarea {...shared} className={`${CONTROL} min-h-32 ${className}`} {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)} />
  ) : (
    <input {...shared} className={`${CONTROL} ${className}`} {...(rest as InputHTMLAttributes<HTMLInputElement>)} />
  );

  return (
    <div className={`mb-4 ${error ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
      <label htmlFor={id} className="mb-1 block font-display text-xs tracking-widest text-navy">{label}</label>
      {control}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 font-ui text-sm font-bold text-red">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 font-ui text-xs text-navy/80">{hint}</p>
      ) : null}
    </div>
  );
}
