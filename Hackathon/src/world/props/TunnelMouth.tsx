import { TRACK_X } from '../layout';
import { mat } from '../materials';

/** Navy portal frame around the track where trains enter the hall. */
export function TunnelMouth({ z }: { z: number }) {
  return (
    <group position={[TRACK_X, 0, z]}>
      {[-2.6, 2.6].map((dx) => (
        <mesh key={dx} position={[dx, 2.5, 0]} material={mat('navy')} castShadow>
          <boxGeometry args={[0.8, 5, 1]} />
        </mesh>
      ))}
      <mesh position={[0, 5.3, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[6, 0.8, 1]} />
      </mesh>
      <mesh position={[0, 5.3, 0.55]} material={mat('yellow')}>
        <boxGeometry args={[5.2, 0.3, 0.05]} />
      </mesh>
      <mesh position={[0, 2.4, -6]} material={mat('navy')}>
        <boxGeometry args={[5.5, 4.8, 12]} />
      </mesh>
    </group>
  );
}
