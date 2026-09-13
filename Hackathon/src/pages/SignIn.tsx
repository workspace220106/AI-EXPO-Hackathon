import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { api } from '@/api';
import { ApiError } from '@/api/types';
import { hasErrors, validateSignIn } from '@/lib/validation';
import { useSession } from '@/store/session';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';
import { Panel } from '@/ui/Panel';

export default function SignIn() {
  const navigate = useNavigate();
  const setUser = useSession((s) => s.setUser);
  const [values, setValues] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const finish = (runner: Awaited<ReturnType<typeof api.signIn>>) => { setUser(runner); navigate('/station'); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateSignIn(values);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try {
      finish(await api.signIn(values));
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NO_RUNNER') setErrors({ identifier: err.message });
      else if (err instanceof ApiError && err.code === 'BAD_PASSWORD') setErrors({ password: err.message });
      else setErrors({ form: 'The kiosk jammed. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  const provider = async (p: 'google' | 'github') => {
    setBusy(true);
    try { finish(await api.signInWithProvider(p)); } finally { setBusy(false); }
  };

  return (
    <main id="content" className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="WELCOME, RUNNER." className="w-full max-w-md max-h-[90dvh] overflow-y-auto">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Ready to enter the race?</p>
        <form onSubmit={submit} noValidate>
          <Field label="EMAIL / USERNAME" name="identifier" zone="kiosk" autoComplete="username" value={values.identifier}
            onChange={(e) => setValues({ ...values, identifier: e.target.value })} error={errors.identifier} />
          <Field label="PASSWORD" name="password" type="password" zone="kiosk" autoComplete="current-password" value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })} error={errors.password} />
          {errors.form && <p role="alert" className="mb-3 font-ui text-sm font-bold text-red">{errors.form}</p>}
          <ArcadeButton type="submit" size="lg" className="w-full" disabled={busy}>RUN IN</ArcadeButton>
        </form>
        <div className="mt-4 grid gap-2">
          <ArcadeButton variant="secondary" burst={false} disabled={busy} onClick={() => provider('google')}>Continue with Google</ArcadeButton>
          <ArcadeButton variant="secondary" burst={false} disabled={busy} onClick={() => provider('github')}>Continue with GitHub</ArcadeButton>
        </div>
        <p className="mt-5 font-ui text-sm font-bold">
          New runner? <Link to="/register/identity" className="underline decoration-4 underline-offset-4 hover:bg-cyan">CREATE ACCOUNT</Link>
        </p>
      </Panel>
    </main>
  );
}
