import { PALETTE } from '@/theme/palette';
import { mat } from '../materials';
import { WORLD_Z_END } from '../layout';

/** Pale ground plane along the whole hall; receives navy-tinted shadows at 35 %. */
export function Floor() {
  const length = -WORLD_Z_END + 20;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, WORLD_Z_END / 2]} receiveShadow material={mat('pale')}>
        <planeGeometry args={[60, length]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, WORLD_Z_END / 2]} receiveShadow>
        <planeGeometry args={[60, length]} />
        <shadowMaterial color={PALETTE.navy} opacity={0.35} transparent />
      </mesh>
    </group>
  );
}
