import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/api';
import { hasErrors, validateIdentity, type IdentityValues } from '@/lib/validation';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';
import { Panel } from '@/ui/Panel';

const EMPTY: IdentityValues = { name: '', email: '', org: '', phone: '', password: '', confirm: '' };

export default function Identity() {
  const navigate = useNavigate();
  const draft = useRegistration((s) => s.identity);
  const [values, setValues] = useState<IdentityValues>({ ...EMPTY, ...draft, password: '', confirm: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof IdentityValues, string>>>({});
  const set = (k: keyof IdentityValues) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = validateIdentity(values);
    if (!v.email && api.isEmailTaken(values.email)) v.email = 'That email already has a runner.';
    setErrors(v);
    if (hasErrors(v)) return;
    const reg = useRegistration.getState();
    reg.setIdentity(values);
    if (!reg.completed.identity) useGame.getState().awardCoins(25, 'IDENTITY LOCKED');
    reg.complete('identity');
    navigate('/register/domain');
  };

  return (
    <main id="content" className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="CREATE YOUR RUNNER" className="w-full max-w-md max-h-[90dvh] overflow-y-auto">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Step 1 of 5 — who's running?</p>
        <form onSubmit={submit} noValidate>
          <Field label="FULL NAME" name="name" zone="wall" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} />
          <Field label="EMAIL" name="email" type="email" zone="wall" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
          <Field label="COLLEGE / ORGANIZATION" name="org" zone="wall" autoComplete="organization" value={values.org} onChange={set('org')} error={errors.org} />
          <Field label="PHONE" name="phone" type="tel" zone="wall" autoComplete="tel" value={values.phone} onChange={set('phone')} error={errors.phone} hint="Optional" />
          <Field label="PASSWORD" name="password" type="password" zone="wall" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} hint="At least 8 characters" />
          <Field label="CONFIRM PASSWORD" name="confirm" type="password" zone="wall" autoComplete="new-password" value={values.confirm} onChange={set('confirm')} error={errors.confirm} />
          <ArcadeButton type="submit" size="lg" className="w-full">NEXT: CHOOSE YOUR DOMAIN</ArcadeButton>
        </form>
      </Panel>
    </main>
  );
}
