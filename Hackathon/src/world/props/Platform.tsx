import { PLATFORM_X0, PLATFORM_X1, PLATFORM_Y } from '../layout';
import { mat } from '../materials';

/** Pale slab, yellow safety line, navy tactile strip, navy front face toward the track. */
export function Platform({ z0, z1 }: { z0: number; z1: number }) {
  const length = z0 - z1;
  const zc = (z0 + z1) / 2;
  const width = PLATFORM_X1 - PLATFORM_X0;
  const xc = (PLATFORM_X0 + PLATFORM_X1) / 2;
  return (
    <group>
      <mesh position={[xc, PLATFORM_Y / 2, zc]} material={mat('pale')} receiveShadow castShadow>
        <boxGeometry args={[width, PLATFORM_Y, length]} />
      </mesh>
      <mesh position={[PLATFORM_X0 - 0.05, PLATFORM_Y / 2, zc]} material={mat('navy')}>
        <boxGeometry args={[0.1, PLATFORM_Y, length]} />
      </mesh>
      <mesh position={[PLATFORM_X0 + 0.35, PLATFORM_Y + 0.01, zc]} material={mat('yellow')}>
        <boxGeometry args={[0.5, 0.02, length]} />
      </mesh>
      <mesh position={[PLATFORM_X0 + 1.1, PLATFORM_Y + 0.01, zc]} material={mat('navy')}>
        <boxGeometry args={[0.6, 0.02, length]} />
      </mesh>
    </group>
  );
}
