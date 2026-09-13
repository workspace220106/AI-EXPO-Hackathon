import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { api } from '@/api';
import type { AvatarConfig } from '@/api/types';
import { Customizer } from '@/pages/Register/Customizer';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';
import { useToasts } from '@/store/toasts';

export default function EditRunner() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const [value, setValue] = useState<AvatarConfig | null>(user?.avatar ?? null);
  const [saving, setSaving] = useState(false);
  if (!user || !value) return <Navigate to="/signin" replace />;

  const save = async () => {
    setSaving(true);
    try {
      useSession.getState().setUser(await api.updateAvatar(value));
      await useTeam.getState().load();
      useToasts.getState().push({ kind: 'info', title: 'RUNNER UPDATED', body: value.name });
      navigate('/station/profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main id="content" className="pointer-none flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[6vw]">
      <Customizer title="EDIT YOUR RUNNER" subtitle="Change anything. Your Hack Pass updates too." value={value} onChange={setValue} onSave={save} saving={saving} saveLabel="SAVE CHANGES" />
    </main>
  );
}
