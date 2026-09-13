import { useEffect, useState } from 'react';
import { useTeam } from '@/store/team';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { CreateTeamForm, CrewCards, JoinTeamForm } from '@/pages/Register/CrewForms';
import { SectionPanel } from './SectionPanel';

export default function Team() {
  const team = useTeam((s) => s.team);
  const loading = useTeam((s) => s.loading);
  const [view, setView] = useState<'choose' | 'create' | 'join'>('choose');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { void useTeam.getState().load(); }, []);

  return (
    <SectionPanel train={2} title="MY TEAM">
      {team ? (
        <>
          <CrewCards team={team} />
          <div className="mt-5 flex gap-3">
            {confirm ? (
              <>
                <ArcadeButton variant="danger" onClick={async () => { await useTeam.getState().leave(); setConfirm(false); setView('choose'); }}>CONFIRM LEAVE</ArcadeButton>
                <ArcadeButton variant="ghost" burst={false} onClick={() => setConfirm(false)}>STAY</ArcadeButton>
              </>
            ) : (
              <ArcadeButton variant="secondary" burst={false} onClick={() => setConfirm(true)}>LEAVE CREW</ArcadeButton>
            )}
          </div>
        </>
      ) : loading ? (
        <p className="font-display text-sm">CHECKING THE CREW BOARD…</p>
      ) : view === 'choose' ? (
        <div className="grid gap-3">
          <p className="font-ui text-sm font-bold">You are running solo. Build or join a crew of up to four.</p>
          <ArcadeButton size="lg" onClick={() => setView('create')}>CREATE TEAM</ArcadeButton>
          <ArcadeButton size="lg" variant="secondary" onClick={() => setView('join')}>JOIN TEAM</ArcadeButton>
        </div>
      ) : view === 'create' ? (
        <><CreateTeamForm onDone={() => setView('choose')} /><button type="button" className="pointer-auto mt-3 font-ui text-xs font-bold underline" onClick={() => setView('choose')}>← BACK</button></>
      ) : (
        <><JoinTeamForm onDone={() => setView('choose')} /><button type="button" className="pointer-auto mt-3 font-ui text-xs font-bold underline" onClick={() => setView('choose')}>← BACK</button></>
      )}
    </SectionPanel>
  );
}
