import { useEffect, useState, type FormEvent } from 'react';
import { ApiError, type SubmissionInput } from '@/api/types';
import { EVENT } from '@/config/event';
import { now } from '@/lib/time';
import { hasErrors, validateSubmission, wordCount } from '@/lib/validation';
import { useSubmission } from '@/store/submission';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Field } from '@/ui/Field';
import { SectionPanel } from './SectionPanel';

const EMPTY: SubmissionInput = { projectName: '', repoUrl: '', demoUrl: '', description: '', deckUrl: '' };
const fmt = (iso: string) => new Date(iso).toLocaleString('en-GB', { timeZone: EVENT.timezone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function Submissions() {
  const submission = useSubmission((s) => s.submission);
  const loaded = useSubmission((s) => s.loaded);
  const [values, setValues] = useState<SubmissionInput>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof SubmissionInput | 'form', string>>>({});
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const locked = now() >= Date.parse(EVENT.timeline.submissionDeadline);

  useEffect(() => { void useSubmission.getState().load(); }, []);
  useEffect(() => { if (submission) setValues({ projectName: submission.projectName, repoUrl: submission.repoUrl, demoUrl: submission.demoUrl, description: submission.description, deckUrl: submission.deckUrl }); }, [submission]);

  const set = (k: keyof SubmissionInput) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validateSubmission(values);
    setErrors(v);
    if (hasErrors(v)) return;
    setBusy(true);
    try { await useSubmission.getState().submit(values); setEditing(false); }
    catch (err) { setErrors({ form: err instanceof ApiError ? err.message : 'The drop box jammed. Try again.' }); }
    finally { setBusy(false); }
  };

  const showForm = loaded && !locked && (!submission || editing);

  return (
    <SectionPanel train={4} title="SUBMISSIONS">
      {locked && (
        <p className="mb-4 inline-block border-4 border-navy bg-red px-3 py-1 font-display text-sm text-white shadow-bevel-sm">DEADLINE PASSED</p>
      )}
      {!loaded ? <p className="font-display text-sm">CHECKING THE DROP BOX…</p> : showForm ? (
        <form onSubmit={submit} noValidate>
          <Field label="PROJECT NAME" name="projectName" zone="station" value={values.projectName} onChange={set('projectName')} error={errors.projectName} />
          <Field label="REPOSITORY URL" name="repoUrl" type="url" zone="station" value={values.repoUrl} onChange={set('repoUrl')} error={errors.repoUrl} placeholder="https://github.com/…" />
          <Field label="DEMO URL" name="demoUrl" type="url" zone="station" value={values.demoUrl} onChange={set('demoUrl')} error={errors.demoUrl} hint="Optional" />
          <Field label="DESCRIPTION" name="description" multiline zone="station" value={values.description} onChange={set('description')} error={errors.description} hint={`${wordCount(values.description)} / 300 words`} />
          <Field label="DECK LINK" name="deckUrl" type="url" zone="station" value={values.deckUrl} onChange={set('deckUrl')} error={errors.deckUrl} hint="Optional" />
          {errors.form && <p role="alert" className="mb-3 font-ui text-sm font-bold text-red">{errors.form}</p>}
          <div className="flex gap-3">
            <ArcadeButton type="submit" size="lg" disabled={busy}>SUBMIT RUN</ArcadeButton>
            {submission && <ArcadeButton variant="ghost" burst={false} onClick={() => setEditing(false)}>CANCEL</ArcadeButton>}
          </div>
        </form>
      ) : submission ? (
        <div className="border-4 border-navy bg-white p-4">
          <p className="inline-block border-[3px] border-navy bg-cyan px-2 py-0.5 font-display text-xs">SUBMITTED</p>
          <h3 className="mt-2 font-display text-xl">{submission.projectName}</h3>
          <p className="font-ui text-sm">{submission.description}</p>
          <dl className="mt-3 grid gap-1 font-ui text-xs font-bold">
            <div><dt className="inline font-display text-[10px]">REPO </dt><dd className="inline break-all"><a className="underline" href={submission.repoUrl}>{submission.repoUrl}</a></dd></div>
            {submission.demoUrl && <div><dt className="inline font-display text-[10px]">DEMO </dt><dd className="inline break-all"><a className="underline" href={submission.demoUrl}>{submission.demoUrl}</a></dd></div>}
            <div><dt className="inline font-display text-[10px]">FIRST SUBMITTED </dt><dd className="inline">{fmt(submission.submittedAt)}</dd></div>
            <div><dt className="inline font-display text-[10px]">LAST UPDATED </dt><dd className="inline">{fmt(submission.updatedAt)}</dd></div>
          </dl>
          {!locked && <div className="mt-4"><ArcadeButton variant="secondary" burst={false} onClick={() => setEditing(true)}>EDIT</ArcadeButton></div>}
        </div>
      ) : (
        <p className="font-ui text-sm font-bold">No submission — the drop box is closed.</p>
      )}
    </SectionPanel>
  );
}
