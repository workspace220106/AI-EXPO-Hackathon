import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { TRACK_X } from '../layout';
import { mat } from '../materials';
import { Train } from './Train';

export interface StationTrainProps {
  index: number;            // 1..6
  z: number;
  label: string;            // "01 MY PROFILE"
  hovered: boolean;
  selected: boolean;
  unread?: number;
  onHover(h: boolean): void;
  onClick(): void;
}

export function StationTrain({ index, z, label, hovered, selected, unread = 0, onHover, onClick }: StationTrainProps) {
  const doors = useRef({ v: 0 });
  useFrame((_, delta) => { damp(doors.current, 'v', selected ? 1 : hovered ? 0.3 : 0, 0.2, delta); });
  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();
  return (
    <group
      onPointerOver={(e) => { stop(e); onHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { stop(e); onHover(false); document.body.style.cursor = ''; }}
      onClick={(e) => { stop(e); onClick(); }}
    >
      <Train cars={1} z={z} doorsRef={doors} />
      <group position={[TRACK_X + 1.5, 4.2, z]} rotation-y={Math.PI / 2}>
        <mesh material={hovered || selected ? mat('cyan', 'emissive') : mat('pale')}><boxGeometry args={[5.5, 0.9, 0.12]} /></mesh>
        <mesh position={[-2.3, 0, 0.07]} material={mat('yellow')}><boxGeometry args={[0.8, 0.7, 0.02]} /></mesh>
        <Text font={BUNGEE_URL} fontSize={0.34} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[-2.3, 0, 0.09]}>{String(index).padStart(2, '0')}</Text>
        <Text font={BUNGEE_URL} fontSize={0.34} color={PALETTE.navy} anchorX="left" anchorY="middle" position={[-1.7, 0, 0.09]}>{label.replace(/^\d+ /, '')}</Text>
        {unread > 0 && (
          <group position={[2.4, 0.55, 0.1]}>
            <mesh material={mat('red')}><cylinderGeometry args={[0.32, 0.32, 0.06, 16]} /></mesh>
            <Text font={BUNGEE_URL} fontSize={0.28} color={PALETTE.white} anchorX="center" anchorY="middle" position={[0, 0, 0.05]}>{String(unread)}</Text>
          </group>
        )}
      </group>
    </group>
  );
}
