import { PLATFORM_Y } from '../layout';
import { CheckinArch } from '../props/CheckinArch';
import { Kiosk } from '../props/Kiosk';
import { Cone, SprayCan } from '../props/street';

export function Checkin() {
  return (
    <group>
      <CheckinArch z={-130} />
      <Kiosk position={[4, PLATFORM_Y, -135]} />
      <Cone position={[0.5, PLATFORM_Y, -132]} />
      <SprayCan position={[7.5, PLATFORM_Y, -133]} cap="yellow" />
      <SprayCan position={[7.9, PLATFORM_Y, -133.4]} cap="red" />
    </group>
  );
}
