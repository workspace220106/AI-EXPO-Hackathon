import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '@/api';
import { ApiError } from '@/api/types';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { useToasts } from '@/store/toasts';
import { Customizer } from './Customizer';

export default function RunnerStep() {
  const navigate = useNavigate();
  const avatar = useRegistration((s) => s.avatar);
  const setAvatar = useRegistration((s) => s.setAvatar);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const reg = useRegistration.getState();
    if (!reg.identity || !reg.domain) { navigate('/register/identity'); return; }
    if (!reg.identity.password) {
      useToasts.getState().push({ kind: 'info', title: 'ONE MORE TIME', body: 'Re-enter your password to continue.' });
      navigate('/register/identity');
      return;
    }
    setSaving(true);
    try {
      const runner = await api.register({
        name: reg.identity.name, email: reg.identity.email, org: reg.identity.org, phone: reg.identity.phone,
        password: reg.identity.password, domain: reg.domain, avatar: reg.avatar,
      });
      useSession.getState().setUser(runner);
      if (!reg.completed.runner) useGame.getState().awardCoins(25, 'RUNNER CREATED');
      reg.complete('runner');
      navigate('/register/crew');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'EMAIL_TAKEN') {
        useToasts.getState().push({ kind: 'error', title: 'EMAIL TAKEN', body: 'That email already has a runner — sign in or use another.' });
        navigate('/register/identity');
      } else {
        useToasts.getState().push({ kind: 'error', title: 'KIOSK JAMMED', body: 'Try saving again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <main id="content" className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[6vw]">
      <Customizer title="YOUR RUN. YOUR IDENTITY." subtitle="Step 3 of 5 — dress your runner. Every part is a tap." value={avatar} onChange={setAvatar} onSave={save} saving={saving} saveLabel="SAVE RUNNER" />
    </main>
  );
}
