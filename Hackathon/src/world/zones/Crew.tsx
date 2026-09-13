import { useTeam } from '@/store/team';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PLATFORM_Y } from '../layout';
import { mat } from '../materials';
import { Runner } from '../runner/Runner';

const SLOTS = [1.5, 3, 4.5, 6];

/** Team markers painted on the platform; members stand on them while the crew shot is active. */
export function Crew() {
  const team = useTeam((s) => s.team);
  const user = useSession((s) => s.user);
  const active = useWorld((s) => s.shot === 'crew');
  const members = team?.members ?? (user ? [{ runnerId: user.id, avatar: user.avatar }] : []);
  return (
    <group>
      {SLOTS.map((x, i) => (
        <mesh key={x} position={[x, PLATFORM_Y + 0.01, -178]} rotation-x={-Math.PI / 2} material={mat(members[i] ? members[i].avatar.teamColor : 'pale')}>
          <circleGeometry args={[0.7, 24]} />
        </mesh>
      ))}
      {active && members.slice(0, 4).map((m, i) => (
        <Runner key={m.runnerId} config={m.avatar} position={[SLOTS[i], PLATFORM_Y, -178]} rotationY={0} zone="crew" />
      ))}
    </group>
  );
}
