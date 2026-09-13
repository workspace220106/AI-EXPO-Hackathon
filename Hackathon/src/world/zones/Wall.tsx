import { LEFT_WALL_X, PLATFORM_Y } from '../layout';
import { GraffitiWall } from '../props/GraffitiWall';
import { Skateboard, SprayCan } from '../props/street';

export function Wall() {
  return (
    <group>
      <GraffitiWall
        spec={{ words: ['CREATE', 'YOUR', 'RUNNER'], base: 'pale', ink: 'yellow', accents: ['cyan', 'red', 'orange'], seed: 42 }}
        position={[LEFT_WALL_X + 0.06, 4.4, -147.5]} rotation={[0, Math.PI / 2, 0]} width={14} height={6}
      />
      <SprayCan position={[-1, PLATFORM_Y, -145]} cap="yellow" />
      <SprayCan position={[-0.6, PLATFORM_Y, -145.3]} cap="cyan" />
      <SprayCan position={[-1.4, PLATFORM_Y, -145.4]} cap="red" />
      <Skateboard position={[1, PLATFORM_Y, -150]} rotation={[0, -0.4, 0]} />
    </group>
  );
}
