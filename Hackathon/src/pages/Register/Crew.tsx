import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useTeam } from '@/store/team';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { Panel } from '@/ui/Panel';
import { CreateTeamForm, CrewCards, JoinTeamForm } from './CrewForms';

type View = 'choose' | 'create' | 'join';

export default function Crew() {
  const navigate = useNavigate();
  const team = useTeam((s) => s.team);
  const [view, setView] = useState<View>('choose');

  useEffect(() => { void useTeam.getState().load(); }, []);

  const finish = () => {
    const reg = useRegistration.getState();
    if (!reg.completed.crew) useGame.getState().awardCoins(25, 'CREW STEP');
    reg.complete('crew');
    navigate('/register/pass');
  };

  return (
    <main id="content" className="pointer-none relative z-10 flex min-h-dvh items-center justify-center p-4 md:justify-end md:pr-[8vw]">
      <Panel title="BUILD YOUR CREW." className="w-full max-w-lg max-h-[90dvh] overflow-y-auto">
        <p className="-mt-2 mb-5 font-ui text-sm font-bold">Step 4 of 5 — teams of 1–4. Create a crew, join one with a code, or run solo.</p>
        {team ? (
          <>
            <h3 className="mb-3 font-display text-xs tracking-widest">YOUR CREW</h3>
            <CrewCards team={team} />
            <div className="mt-5"><ArcadeButton size="lg" className="w-full" onClick={finish}>CONTINUE TO CHECK-IN</ArcadeButton></div>
          </>
        ) : view === 'choose' ? (
          <div className="grid gap-3">
            <ArcadeButton size="lg" onClick={() => setView('create')}>CREATE TEAM</ArcadeButton>
            <ArcadeButton size="lg" variant="secondary" onClick={() => setView('join')}>JOIN TEAM</ArcadeButton>
            <ArcadeButton variant="ghost" burst={false} onClick={finish}>RUN SOLO FOR NOW</ArcadeButton>
          </div>
        ) : view === 'create' ? (
          <>
            <CreateTeamForm onDone={() => undefined} />
            <button type="button" onClick={() => setView('choose')} className="pointer-auto mt-3 font-ui text-xs font-bold underline">← BACK</button>
          </>
        ) : (
          <>
            <JoinTeamForm onDone={() => undefined} />
            <button type="button" onClick={() => setView('choose')} className="pointer-auto mt-3 font-ui text-xs font-bold underline">← BACK</button>
          </>
        )}
      </Panel>
    </main>
  );
}
