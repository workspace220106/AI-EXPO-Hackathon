import { Text } from '@react-three/drei';
import { PALETTE, type PaletteName } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

export interface SignProps {
  text: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  plate?: PaletteName;
  ink?: PaletteName;
  size?: number;
}

/** A pale plate with Bungee text — station signage. */
export function Sign({ text, position, rotation = [0, 0, 0], width = 4, height = 1, plate = 'pale', ink = 'navy', size = 0.45 }: SignProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh material={mat(plate)} castShadow>
        <boxGeometry args={[width, height, 0.15]} />
      </mesh>
      <mesh position={[0, 0, 0.08]} material={mat('navy')}>
        <boxGeometry args={[width + 0.16, height + 0.16, 0.02]} />
      </mesh>
      <mesh position={[0, 0, 0.1]} material={mat(plate)}>
        <boxGeometry args={[width, height, 0.02]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={size} color={PALETTE[ink]} anchorX="center" anchorY="middle" position={[0, 0, 0.12]} maxWidth={width - 0.3}>
        {text}
      </Text>
    </group>
  );
}
