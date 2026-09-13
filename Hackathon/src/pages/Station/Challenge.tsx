import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { api } from '@/api';
import type { Challenge as ChallengeData } from '@/api/types';
import { EVENT, TIMELINE_STOPS, domainById } from '@/config/event';
import { useSession } from '@/store/session';
import { PALETTE } from '@/theme/palette';
import { SectionPanel } from './SectionPanel';

export default function Challenge() {
  const user = useSession((s) => s.user);
  const [data, setData] = useState<ChallengeData | null>(null);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    void api.getChallenge(user.domain).then((c) => { if (alive) setData(c); });
    if (!user.openedChallengeAt) void api.markChallengeOpened().then((r) => useSession.getState().setUser(r));
    return () => { alive = false; };
  }, [user?.domain]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return <Navigate to="/signin" replace />;
  const domain = domainById(user.domain);
  const lineInk = domain.color === 'red' ? PALETTE.white : PALETTE.navy;

  return (
    <SectionPanel train={3} title="CHALLENGE" wide>
      {!data ? <p className="font-display text-sm">LOADING THE ROUTE…</p> : (
        <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="inline-block border-[3px] border-navy px-2 py-0.5 font-display text-xs" style={{ background: PALETTE[domain.color], color: lineInk }}>{domain.line}</p>
            <h3 className="mt-2 font-display text-xl">{data.title}</h3>
            <p className="mt-2 font-ui text-sm leading-relaxed">{data.statement}</p>
            <h4 className="mt-4 font-display text-xs tracking-widest">PROBLEM STATEMENTS</h4>
            <ol className="mt-1 list-decimal space-y-1 pl-5 font-ui text-sm">{data.problems.map((p) => <li key={p}>{p}</li>)}</ol>
            <h4 className="mt-4 font-display text-xs tracking-widest">RULES</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 font-ui text-sm">{data.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
          <aside className="space-y-4">
            <div className="border-[3px] border-navy bg-navy p-3 text-pale">
              <h4 className="font-display text-xs tracking-widest text-yellow">JUDGING</h4>
              <ul className="mt-1 font-ui text-xs">{EVENT.judging.map((j) => <li key={j}>• {j}</li>)}</ul>
            </div>
            <div className="border-[3px] border-navy bg-white p-3">
              <h4 className="font-display text-xs tracking-widest">TIMELINE</h4>
              <ul className="mt-1 space-y-1 font-ui text-xs font-bold">
                {TIMELINE_STOPS.map((s) => <li key={s.id} className={s.alert ? 'text-red' : ''}>{`${new Date(s.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: EVENT.timezone })} — ${s.label}`}</li>)}
              </ul>
            </div>
            <div className="border-[3px] border-navy bg-white p-3">
              <h4 className="font-display text-xs tracking-widest">RESOURCES</h4>
              <ul className="mt-1 font-ui text-xs font-bold">{data.resources.map((r) => <li key={r.label}><a className="underline decoration-2 underline-offset-2 hover:bg-cyan" href={r.url}>{r.label}</a></li>)}</ul>
            </div>
          </aside>
        </div>
      )}
    </SectionPanel>
  );
}
