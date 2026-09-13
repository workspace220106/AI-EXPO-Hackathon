import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { motion } from 'framer-motion';
import { domainById } from '@/config/event';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { syncBadges } from '@/store/badgeSync';
import { useGame } from '@/store/game';
import { useRegistration } from '@/store/registration';
import { useSession } from '@/store/session';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { ArcadeButton } from '@/ui/ArcadeButton';
import { HackPass } from '@/ui/HackPass';

export default function Pass() {
  const user = useSession((s) => s.user);
  const team = useTeam((s) => s.team);
  const [beat, setBeat] = useState(prefersReducedMotion() ? 3 : 0);

  useEffect(() => {
    const w = useWorld.getState();
    w.startArrival();
    void useTeam.getState().load();
    const reg = useRegistration.getState();
    if (!reg.completed.pass) {
      useGame.getState().awardCoins(25, 'CHECKED IN');
      reg.complete('pass');
    }
    syncBadges();
    if (prefersReducedMotion()) return () => w.clearArrival();
    const t1 = setTimeout(() => setBeat(1), 600);
    const t2 = setTimeout(() => setBeat(2), 1400);
    const t3 = setTimeout(() => setBeat(3), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); w.clearArrival(); };
  }, []);

  if (!user) return <Navigate to="/signin" replace />;
  const domain = domainById(user.domain);

  return (
    <main id="content" className="pointer-none relative z-10 flex min-h-dvh flex-col items-center justify-center gap-5 p-4 md:flex-row md:items-center md:justify-end md:gap-10 md:pr-[6vw]">
      <div className="pointer-auto max-w-md">
        <motion.h1 initial={{ scale: 0.6, opacity: 0 }} animate={beat >= 1 ? { scale: 1, opacity: 1 } : {}} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="font-display text-5xl text-navy md:text-7xl" style={{ textShadow: `0.06em 0.06em 0 ${PALETTE.yellow}` }}>
          YOU'RE IN.
        </motion.h1>
        <motion.ul initial={{ opacity: 0, y: 20 }} animate={beat >= 2 ? { opacity: 1, y: 0 } : {}} className="mt-4 space-y-1 font-display text-sm text-navy md:text-base">
          <li>{`RUNNER ID: ${user.id}`}</li>
          <li>{`DOMAIN: ${domain.name}`}</li>
          <li>{`TEAM: ${team?.name ?? 'SOLO RUNNER'}`}</li>
          <li>STATUS: REGISTERED</li>
        </motion.ul>
        <motion.div initial={{ opacity: 0 }} animate={beat >= 3 ? { opacity: 1 } : {}} className="mt-6">
          <ArcadeButton size="lg" to="/station">ENTER THE STATION</ArcadeButton>
        </motion.div>
      </div>
      <motion.div className="pointer-auto" initial={{ y: 120, opacity: 0, rotate: -3 }} animate={beat >= 3 ? { y: 0, opacity: 1, rotate: 0 } : {}} transition={{ type: 'spring', stiffness: 220, damping: 20 }}>
        <HackPass runner={user} teamName={team?.name ?? null} />
      </motion.div>
    </main>
  );
}
