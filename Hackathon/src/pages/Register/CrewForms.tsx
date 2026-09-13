import { useState, type FormEvent } from 'react';
import { ApiError, type Team } from '@/api/types';
import { EVENT, domainById } from '@/config/event';
import { hasErrors, validateTeamCode, validateTeamCreate } from '@/lib/validation';
import { useTeam } from '@/store/team';
import { useToasts } from '@/store/toasts';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';

export function CreateTeamForm({ onDone }: { onDone: (t: Team) => void }) {
  const [name, setName] = useState('');
  const [max, setMax] = useState<number>(EVENT.team.max);
  const [errors, setErrors] = useState<{ name?: string; maxMembers?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateTeamCreate({ name, maxMembers: max }, EVENT.team.max);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try { onDone(await useTeam.getState().create(name.trim().toUpperCase(), max)); }
    catch (err) { setErrors({ form: err instanceof ApiError ? err.message : 'The crew board jammed.' }); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="TEAM NAME" name="teamName" zone="crew" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} maxLength={24} />
      <label htmlFor="field-maxMembers" className="mb-1 block font-display text-xs tracking-widest">MAXIMUM MEMBERS</label>
      <select id="field-maxMembers" value={max} onChange={(e) => setMax(Number(e.target.value))}
        className="pointer-auto mb-4 block w-full border-[3px] border-navy bg-white px-3 py-3 font-ui text-navy focus:border-cyan focus:outline-none">
        {Array.from({ length: EVENT.team.max - 1 }, (_, i) => i + 2).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
      {errors.maxMembers && <p role="alert" className="mb-2 text-sm font-bold text-red">{errors.maxMembers}</p>}
      <p className="mb-4 font-ui text-xs font-bold">TEAM LEADER: you.</p>
      {errors.form && <p role="alert" className="mb-3 font-ui text-sm font-bold text-red">{errors.form}</p>}
      <ArcadeButton type="submit" className="w-full" disabled={busy}>CREATE CREW</ArcadeButton>
    </form>
  );
}

export function JoinTeamForm({ onDone }: { onDone: (t: Team) => void }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateTeamCode(code);
    setError(v);
    if (v) return;
    setBusy(true);
    try { onDone(await useTeam.getState().join(code)); }
    catch (err) { setError(err instanceof ApiError ? err.message : 'The crew board jammed.'); }
    finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate>
      <Field label="ENTER TEAM CODE" name="teamCode" zone="crew" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} error={error} placeholder="RAIL-7K2Q" maxLength={9} />
      <ArcadeButton type="submit" className="w-full" disabled={busy}>JOIN CREW</ArcadeButton>
    </form>
  );
}

export function CrewCards({ team }: { team: Team }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(team.code); useToasts.getState().push({ kind: 'info', title: 'CODE COPIED', body: team.code }); }
    catch { useToasts.getState().push({ kind: 'info', title: 'TEAM CODE', body: team.code }); }
  };
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-xl">{team.name}</p>
        <p className="flex items-center gap-2 font-display text-sm">
          <span className="border-[3px] border-navy bg-yellow px-2 py-0.5">{team.code}</span>
          <button type="button" onClick={copy} className="pointer-auto border-[3px] border-navy bg-white px-2 py-0.5 shadow-bevel-sm hover:bg-cyan">COPY</button>
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {team.members.map((m) => (
          <li key={m.runnerId} className="flex items-center gap-3 border-[3px] border-navy bg-white p-2">
            <span aria-hidden className="grid h-10 w-10 place-items-center border-2 border-navy font-display text-xs" style={{ background: PALETTE[m.avatar.teamColor] }}>{m.avatar.name.slice(0, 2)}</span>
            <span>
              <span className="block font-display text-sm">{m.avatar.name}</span>
              <span className="block font-ui text-xs font-bold">{`${m.role === 'leader' ? 'LEADER' : 'RUNNER'} · ${domainById(m.domain).name}`}</span>
            </span>
          </li>
        ))}
        {Array.from({ length: team.maxMembers - team.members.length }, (_, i) => (
          <li key={`open-${i}`} className="grid place-items-center border-[3px] border-dashed border-navy p-2 font-display text-xs">OPEN SEAT</li>
        ))}
      </ul>
    </div>
  );
}
