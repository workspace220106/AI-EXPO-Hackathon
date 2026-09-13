import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { CEILING_Y, LEFT_WALL_X, RIGHT_WALL_X } from '../layout';
import { mat } from '../materials';
import { spread, useDensity } from './instancing';

/** Pale wall panel with instanced navy beams and an orange trim band. Faces into the hall. */
export function Wall({ side, z0, z1 }: { side: 'left' | 'right'; z0: number; z1: number }) {
  const density = useDensity();
  const x = side === 'left' ? LEFT_WALL_X : RIGHT_WALL_X;
  const inward = side === 'left' ? 1 : -1;
  const beams = useMemo(() => spread(z0, z1, 6, density), [z0, z1, density]);
  const length = z0 - z1;
  const zc = (z0 + z1) / 2;
  return (
    <group>
      <mesh position={[x, CEILING_Y / 2, zc]} rotation-y={inward * Math.PI / 2} material={mat('pale')} receiveShadow>
        <planeGeometry args={[length, CEILING_Y]} />
      </mesh>
      <mesh position={[x + inward * 0.1, 7.5, zc]} material={mat('orange')}>
        <boxGeometry args={[0.2, 0.5, length]} />
      </mesh>
      <Instances range={beams.length} limit={80} castShadow>
        <boxGeometry args={[0.4, CEILING_Y, 0.5]} />
        <primitive object={mat('navy')} attach="material" />
        {beams.map((z) => <Instance key={z} position={[x + inward * 0.2, CEILING_Y / 2, z]} />)}
      </Instances>
    </group>
  );
}
