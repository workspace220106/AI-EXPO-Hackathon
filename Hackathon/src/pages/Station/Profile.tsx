import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { domainById } from '@/config/event';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { BadgeGrid } from '@/ui/BadgeGrid';
import { HackPass } from '@/ui/HackPass';
import { SectionPanel } from './SectionPanel';

export default function Profile() {
  const navigate = useNavigate();
  const user = useSession((s) => s.user);
  const team = useTeam((s) => s.team);
  const badges = useGame((s) => s.badges);
  const coins = useGame((s) => s.coins);
  const [pass, setPass] = useState(false);
  if (!user) return <Navigate to="/signin" replace />;
  const domain = domainById(user.domain);

  return (
    <SectionPanel train={1} title="MY PROFILE">
      <div className="flex items-center gap-4">
        <span aria-hidden className="grid h-16 w-16 place-items-center border-4 border-navy font-display text-xl text-navy" style={{ background: PALETTE[user.avatar.teamColor] }}>{user.avatar.name.slice(0, 2)}</span>
        <div>
          <p className="font-display text-2xl">{user.avatar.name}</p>
          <p className="font-ui text-sm font-bold">{user.name} · {user.org}</p>
          <p className="font-display text-sm">{user.id}</p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 font-ui text-xs font-bold">
        <div className="border-[3px] border-navy bg-white p-2"><dt className="font-display text-[10px]">ROUTE</dt><dd>{`${domain.number} ${domain.name}`}</dd></div>
        <div className="border-[3px] border-navy bg-white p-2"><dt className="font-display text-[10px]">CREW</dt><dd>{team?.name ?? 'SOLO RUNNER'}</dd></div>
        <div className="border-[3px] border-navy bg-white p-2"><dt className="font-display text-[10px]">EMAIL</dt><dd className="break-all">{user.email}</dd></div>
        <div className="border-[3px] border-navy bg-yellow p-2"><dt className="font-display text-[10px]">COINS</dt><dd className="font-display text-lg">{coins}</dd></div>
      </dl>
      <h3 className="mb-2 mt-5 font-display text-xs tracking-widest">BADGES</h3>
      <BadgeGrid badges={badges} />
      <div className="mt-5 flex flex-wrap gap-3">
        <ArcadeButton onClick={() => setPass((p) => !p)} burst={false}>VIEW PASS</ArcadeButton>
        <Link to="/station/runner" className="pointer-auto inline-flex items-center border-4 border-navy bg-pale px-5 py-3 font-display text-navy shadow-bevel hover:bg-cyan">EDIT RUNNER</Link>
        <ArcadeButton variant="ghost" burst={false} onClick={async () => { await useSession.getState().signOut(); navigate('/'); }}>SIGN OUT</ArcadeButton>
      </div>
      {pass && <div className="mt-5"><HackPass runner={user} teamName={team?.name ?? null} /></div>}
    </SectionPanel>
  );
}
