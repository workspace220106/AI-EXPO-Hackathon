import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { Group } from 'three';
import { DEFAULT_AVATAR } from '@/api/types';
import { useWorld } from '@/store/world';
import { PLATFORM_Y, RIGHT_WALL_X } from '../layout';
import { mat } from '../materials';
import { ZoneLight } from '../props/Kiosk';
import { Sign } from '../props/Sign';
import { Runner } from '../runner/Runner';

const PAD: [number, number, number] = [3, PLATFORM_Y, -163];

export function Locker() {
  const avatar = useWorld((s) => s.lockerAvatar);
  const celebrateKey = useWorld((s) => s.lockerCelebrate);
  const active = useWorld((s) => s.shot === 'locker');
  const turntable = useRef<Group>(null);
  const [drag, setDrag] = useState<{ x: number; rot: number } | null>(null);
  const targetRot = useRef(0);

  useFrame((_, delta) => {
    if (!turntable.current) return;
    if (!drag) targetRot.current = 0;
    damp(turntable.current.rotation, 'y', targetRot.current, drag ? 0.05 : 0.6, delta);
  });

  const onDown = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); setDrag({ x: e.clientX, rot: turntable.current?.rotation.y ?? 0 }); };
  const onMove = (e: ThreeEvent<PointerEvent>) => { if (drag) targetRot.current = drag.rot + (e.clientX - drag.x) * 0.01; };
  const onUp = () => setDrag(null);

  return (
    <group>
      {[-2, 0, 2, 4].map((dz) => (
        <group key={dz} position={[RIGHT_WALL_X - 0.6, PLATFORM_Y, -160 + dz]}>
          <mesh position={[0, 1.1, 0]} material={mat('navy')} castShadow><boxGeometry args={[0.8, 2.2, 1.6]} /></mesh>
          <mesh position={[-0.42, 1.1, 0]} material={mat('pale')}><boxGeometry args={[0.04, 2.0, 1.4]} /></mesh>
          <mesh position={[-0.45, 1.3, 0.4]} material={mat('yellow')}><boxGeometry args={[0.03, 0.2, 0.1]} /></mesh>
        </group>
      ))}
      <Sign text="YOUR RUN. YOUR IDENTITY." position={[RIGHT_WALL_X - 0.4, 4.6, -163]} rotation={[0, -Math.PI / 2, 0]} width={8} height={1.1} size={0.5} />
      {/* picking a part bursts at the locker; this light flashes the runner cyan for a beat (spec §7.4) */}
      <ZoneLight position={[3, 3.4, -161]} zones={['locker']} />
      <group ref={turntable} position={PAD} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        <mesh position={[0, 0.1, 0]} material={mat('yellow')} receiveShadow>
          <cylinderGeometry args={[1.6, 1.7, 0.2, 32]} />
        </mesh>
        <mesh position={[0, 0.21, 0]} material={mat('navy')}>
          <torusGeometry args={[1.3, 0.04, 6, 40]} />
        </mesh>
        {/* the runner's eyes are on its +Z face; the locker camera looks down −Z, so rotationY 0 faces the camera */}
        {active && <Runner config={avatar ?? DEFAULT_AVATAR} position={[0, 0.2, 0]} rotationY={0} zone="locker" celebrateKey={celebrateKey} />}
      </group>
    </group>
  );
}
