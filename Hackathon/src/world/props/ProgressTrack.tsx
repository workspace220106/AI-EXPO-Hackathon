import { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from '@react-three/drei';
import { STAGES } from '@/lib/progress';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { PLATFORM_Y } from '../layout';
import { mat } from '../materials';
import { Runner } from '../runner/Runner';

const Z0 = -190, STEP = -8, X = 7.5;
const markerPos = (i: number): [number, number, number] => [X, PLATFORM_Y, Z0 + i * STEP];

/** Six station markers along the platform's back edge; the mini runner runs to the newest stage. */
export function ProgressTrack() {
  const user = useSession((s) => s.user);
  const index = useWorld((s) => s.stageIndex);
  const active = useWorld((s) => s.shot === 'station' || s.shot.startsWith('train'));
  const prev = useRef(index);
  const [runTo, setRunTo] = useState<{ from: [number, number, number]; to: [number, number, number]; duration: number } | null>(null);
  const standing = useMemo(() => markerPos(Math.max(0, index)), [index]);

  useEffect(() => {
    if (index > prev.current && prev.current >= 0) setRunTo({ from: markerPos(prev.current), to: markerPos(index), duration: 1.2 });
    prev.current = index;
  }, [index]);

  return (
    <group>
      <mesh position={[X, PLATFORM_Y + 0.02, Z0 + 2.5 * STEP]} material={mat('yellow')}>
        <boxGeometry args={[0.3, 0.02, -STEP * 5 + 1]} />
      </mesh>
      {STAGES.map((s, i) => (
        <group key={s} position={markerPos(i)}>
          <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2} material={i <= index ? mat('yellow') : mat('pale')}>
            <circleGeometry args={[0.5, 20]} />
          </mesh>
          <mesh position={[0, 0.03, 0]} material={mat('navy')}>
            <torusGeometry args={[0.5, 0.05, 6, 24]} />
          </mesh>
          <Text font={BUNGEE_URL} fontSize={0.28} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[0, 1.2, 0]} rotation-y={-Math.PI / 2}>{s}</Text>
        </group>
      ))}
      {active && user && index >= 0 && (
        <Runner config={user.avatar} position={standing} rotationY={0} scale={0.5} runTo={runTo} />
      )}
    </group>
  );
}
