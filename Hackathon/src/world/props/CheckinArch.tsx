import { PLATFORM_X0, PLATFORM_X1, PLATFORM_Y } from '../layout';
import { mat } from '../materials';
import { Sign } from './Sign';

/** Painted navy arch across the platform with the RUNNER CHECK-IN sign. */
export function CheckinArch({ z }: { z: number }) {
  const xc = (PLATFORM_X0 + PLATFORM_X1) / 2;
  const span = PLATFORM_X1 - PLATFORM_X0 - 1;
  return (
    <group position={[xc, PLATFORM_Y, z]}>
      {[-span / 2, span / 2].map((dx) => (
        <mesh key={dx} position={[dx, 2.6, 0]} material={mat('navy')} castShadow>
          <boxGeometry args={[0.7, 5.2, 0.7]} />
        </mesh>
      ))}
      <mesh position={[0, 5.4, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[span + 0.7, 0.8, 0.7]} />
      </mesh>
      {[-span / 2, span / 2].map((dx) => (
        <mesh key={`b${dx}`} position={[dx, 1.2, 0]} material={mat('orange')}>
          <boxGeometry args={[0.75, 0.5, 0.75]} />
        </mesh>
      ))}
      <Sign text="RUNNER CHECK-IN" position={[0, 6.4, 0.1]} width={7} height={1.2} plate="yellow" ink="navy" size={0.6} />
    </group>
  );
}
