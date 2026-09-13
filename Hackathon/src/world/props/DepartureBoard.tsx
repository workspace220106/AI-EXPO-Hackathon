import { Text } from '@react-three/drei';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

export interface DepartureBoardProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  title: string;
  live?: boolean;
  rows?: number;
}

/** Navy board with a yellow header and pale flap rows. Row text is rendered by the DOM overlay. */
export function DepartureBoard({ position, rotation = [0, 0, 0], width = 8, height = 4, title, live, rows = 5 }: DepartureBoardProps) {
  const rowH = (height - 1) / rows;
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mat('navy')} castShadow>
        <boxGeometry args={[width, height, 0.3]} />
      </mesh>
      <mesh position={[0, height / 2 - 0.45, 0.16]} material={mat('yellow')}>
        <boxGeometry args={[width - 0.3, 0.7, 0.04]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={0.4} color={PALETTE.navy} anchorX="left" anchorY="middle" position={[-width / 2 + 0.4, height / 2 - 0.45, 0.2]}>
        {title}
      </Text>
      {live && (
        <group position={[width / 2 - 0.9, height / 2 - 0.45, 0.2]}>
          <mesh material={mat('red')}><boxGeometry args={[1.2, 0.45, 0.04]} /></mesh>
          <Text font={BUNGEE_URL} fontSize={0.26} color={PALETTE.white} anchorX="center" anchorY="middle" position={[0, 0, 0.03]}>LIVE</Text>
        </group>
      )}
      {Array.from({ length: rows }, (_, i) => (
        <mesh key={i} position={[0, height / 2 - 1.1 - rowH * (i + 0.5), 0.16]} material={mat('pale')}>
          <boxGeometry args={[width - 0.5, rowH - 0.12, 0.04]} />
        </mesh>
      ))}
    </group>
  );
}
