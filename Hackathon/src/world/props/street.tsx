import { Text } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';

type GroupProps = ThreeElements['group'];
import { PALETTE, type PaletteName } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

export function Cone(props: GroupProps) {
  return (
    <group {...props}>
      <mesh position={[0, 0.45, 0]} material={mat('orange')} castShadow>
        <coneGeometry args={[0.3, 0.9, 12]} />
      </mesh>
      <mesh position={[0, 0.5, 0]} material={mat('pale')}>
        <cylinderGeometry args={[0.2, 0.24, 0.12, 12]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={mat('navy')}>
        <boxGeometry args={[0.7, 0.06, 0.7]} />
      </mesh>
    </group>
  );
}

export function Barrier(props: GroupProps) {
  return (
    <group {...props}>
      {[-0.9, 0.9].map((dx) => (
        <mesh key={dx} position={[dx, 0.5, 0]} material={mat('navy')} castShadow>
          <boxGeometry args={[0.12, 1, 0.12]} />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]} material={mat('yellow')} castShadow>
        <boxGeometry args={[2.2, 0.3, 0.1]} />
      </mesh>
      {[-0.55, 0, 0.55].map((dx) => (
        <mesh key={dx} position={[dx, 0.85, 0.06]} material={mat('navy')}>
          <boxGeometry args={[0.2, 0.3, 0.02]} />
        </mesh>
      ))}
    </group>
  );
}

export function SprayCan({ cap = 'cyan', ...props }: GroupProps & { cap?: PaletteName }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.3, 0]} material={mat('navy')} castShadow>
        <cylinderGeometry args={[0.16, 0.16, 0.6, 12]} />
      </mesh>
      <mesh position={[0, 0.66, 0]} material={mat(cap)}>
        <cylinderGeometry args={[0.1, 0.12, 0.12, 12]} />
      </mesh>
      <mesh position={[0, 0.3, 0]} material={mat('pale')}>
        <cylinderGeometry args={[0.165, 0.165, 0.2, 12]} />
      </mesh>
    </group>
  );
}

export function Poster({ word, accent = 'orange', ...props }: GroupProps & { word: string; accent?: PaletteName }) {
  return (
    <group {...props}>
      <mesh material={mat('pale')}>
        <planeGeometry args={[1.6, 2.2]} />
      </mesh>
      <mesh position={[0.6, 0.9, 0.01]} material={mat(accent)}>
        <planeGeometry args={[0.4, 0.4]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={0.36} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[0, -0.2, 0.02]} maxWidth={1.4}>
        {word}
      </Text>
    </group>
  );
}

export function Sneaker({ color = 'yellow', ...props }: GroupProps & { color?: PaletteName }) {
  return (
    <group {...props}>
      <mesh position={[0, 0.14, 0]} material={mat(color)} castShadow>
        <boxGeometry args={[0.5, 0.22, 0.26]} />
      </mesh>
      <mesh position={[0, 0.03, 0]} material={mat('pale')}>
        <boxGeometry args={[0.54, 0.06, 0.3]} />
      </mesh>
      <mesh position={[0.05, 0.28, 0]} material={mat('navy')}>
        <boxGeometry args={[0.3, 0.06, 0.28]} />
      </mesh>
    </group>
  );
}

export function Skateboard(props: GroupProps) {
  return (
    <group {...props}>
      <mesh position={[0, 0.16, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[1.1, 0.06, 0.32]} />
      </mesh>
      {[-0.35, 0.35].flatMap((dx) => [-0.14, 0.14].map((dz) => (
        <mesh key={`${dx}${dz}`} position={[dx, 0.08, dz]} rotation-x={Math.PI / 2} material={mat('yellow')}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 10]} />
        </mesh>
      )))}
    </group>
  );
}
