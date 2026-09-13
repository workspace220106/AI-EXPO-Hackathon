import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { CEILING_Y } from '../layout';
import { mat } from '../materials';
import { spread, useDensity } from './instancing';

/** Navy columns with an orange band, instanced every 10 units along x. */
export function Pillars({ z0, z1, x }: { z0: number; z1: number; x: number }) {
  const density = useDensity();
  const zs = useMemo(() => spread(z0 - 5, z1 + 5, 10, density), [z0, z1, density]);
  return (
    <group>
      <Instances range={zs.length} limit={40} castShadow>
        <boxGeometry args={[0.8, CEILING_Y, 0.8]} />
        <primitive object={mat('navy')} attach="material" />
        {zs.map((z) => <Instance key={z} position={[x, CEILING_Y / 2, z]} />)}
      </Instances>
      <Instances range={zs.length} limit={40}>
        <boxGeometry args={[0.9, 0.4, 0.9]} />
        <primitive object={mat('orange')} attach="material" />
        {zs.map((z) => <Instance key={z} position={[x, 3.2, z]} />)}
      </Instances>
    </group>
  );
}
