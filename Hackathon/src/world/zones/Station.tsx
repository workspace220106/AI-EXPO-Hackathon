import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, PointLight } from 'three';
import { api } from '@/api';
import { TRAIN_LABELS } from '@/config/trains';
import { ARRIVAL_DURATION, arrivalAt } from '@/lib/arrival';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { PLATFORM_Y } from '../layout';
import { ProgressTrack } from '../props/ProgressTrack';
import { StationTrain } from '../props/StationTrain';
import { Train } from '../props/Train';
import { Runner } from '../runner/Runner';
import { TRAIN_Z } from '../shots';

function PlatformLights() {
  const lights = useRef<PointLight[]>([]);
  useFrame(() => {
    const at = useWorld.getState().arrivalAt;
    const t = at == null ? ARRIVAL_DURATION : (Date.now() - at) / 1000;
    const { lightsOn } = arrivalAt(t);
    lights.current.forEach((l, i) => { if (l) l.intensity = i < lightsOn ? 2.2 : 0; });
  });
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => (
        <pointLight key={i} ref={(l) => { if (l) lights.current[i] = l; }} color={PALETTE.yellow} intensity={2.2} distance={12} position={[3, 6, -190 - i * 7]} />
      ))}
    </>
  );
}

function ArrivalTrain() {
  const at = useWorld((s) => s.arrivalAt);
  const g = useRef<Group>(null);
  const [doors, setDoors] = useState(0);
  useFrame(() => {
    if (at == null || !g.current) return;
    const f = arrivalAt((Date.now() - at) / 1000);
    g.current.position.z = f.trainZ;
    if (Math.abs(f.doors - doors) > 0.05) setDoors(f.doors);
  });
  if (at == null) return null;
  return (
    <group ref={g}>
      <Train cars={1} z={0} rotationY={Math.PI} band="yellow" doorsOpen={doors} speed={at ? 8 : 0} />
    </group>
  );
}

export function Station() {
  const shot = useWorld((s) => s.shot);
  const hovered = useWorld((s) => s.hovered);
  const setHovered = useWorld((s) => s.setHovered);
  const user = useSession((s) => s.user);
  const active = shot === 'station' || shot === 'stationArrival' || shot.startsWith('train');
  const selectedIndex = shot.startsWith('train') ? Number(shot.slice(5)) : 0;
  const [unread, setUnread] = useState(0);
  useEffect(() => { if (active) setUnread(api.unreadAnnouncementCount()); }, [active, shot]);

  return (
    <group>
      <PlatformLights />
      <ArrivalTrain />
      <ProgressTrack />
      {TRAIN_LABELS.map((t, i) => (
        <StationTrain
          key={t.n} index={i + 1} z={TRAIN_Z(i + 1)} label={`${t.n} ${t.name}`}
          hovered={hovered === `train:${i + 1}`} selected={selectedIndex === i + 1}
          unread={i === 5 ? unread : 0}
          onHover={(h) => setHovered(h ? `train:${i + 1}` : null)}
          onClick={() => useWorld.getState().trainHandler?.(i + 1)}
        />
      ))}
      {active && user && <Runner config={user.avatar} position={[2, PLATFORM_Y, -206]} rotationY={0.6} zone="station" />}
    </group>
  );
}
