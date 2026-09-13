import { useWorld } from '@/store/world';
import { Sign } from '../props/Sign';
import { Barrier } from '../props/street';

/** Only present while the 404 shot is active: a red warning sign and barriers across the platform. */
export function Hall404() {
  const active = useWorld((s) => s.shot === 'hall404');
  if (!active) return null;
  return (
    <group>
      <Sign text="WRONG PLATFORM" position={[3, 3.4, -36]} width={6} height={1.3} plate="red" ink="white" size={0.55} />
      <Barrier position={[1.5, 0.6, -34]} />
      <Barrier position={[4.5, 0.6, -34]} />
    </group>
  );
}
