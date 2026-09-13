import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { TRACK_X } from '../layout';
import { mat } from '../materials';
import { spread, useDensity } from './instancing';

/** Two yellow rails on a pale bed with instanced navy ties. */
export function Rails({ z0, z1 }: { z0: number; z1: number }) {
  const density = useDensity();
  const ties = useMemo(() => spread(z0, z1, 1.2, density), [z0, z1, density]);
  const length = z0 - z1;
  const zc = (z0 + z1) / 2;
  return (
    <group>
      {[-0.75, 0.75].map((dx) => (
        <mesh key={dx} position={[TRACK_X + dx, 0.16, zc]} material={mat('yellow')} castShadow>
          <boxGeometry args={[0.16, 0.16, length]} />
        </mesh>
      ))}
      <Instances range={ties.length} limit={400} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.12, 0.4]} />
        <primitive object={mat('navy')} attach="material" />
        {ties.map((z) => <Instance key={z} position={[TRACK_X, 0.06, z]} />)}
      </Instances>
    </group>
  );
}
