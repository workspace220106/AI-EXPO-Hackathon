import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { mat } from '../materials';

export function Coin({ position, spin = 1.6 }: { position: [number, number, number]; spin?: number }) {
  const g = useRef<Group>(null);
  useFrame((s, delta) => { if (g.current) { g.current.rotation.y += spin * delta; g.current.position.y = position[1] + Math.sin(s.clock.elapsedTime * 2 + position[2]) * 0.08; } });
  return (
    <group ref={g} position={position}>
      <mesh rotation-x={Math.PI / 2} material={mat('yellow', 'emissive')} castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.08, 20]} />
      </mesh>
      <mesh material={mat('navy')}>
        <torusGeometry args={[0.24, 0.03, 6, 20]} />
      </mesh>
    </group>
  );
}
