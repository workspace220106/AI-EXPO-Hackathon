import { LEFT_WALL_X, PLATFORM_X1, RIGHT_WALL_X, WORLD_Z_END, ZONES } from './layout';
import { Intro } from './cinematic/Intro';
import { Coins } from './props/Coins';
import { Floor } from './props/Floor';
import { GraffitiWall } from './props/GraffitiWall';
import { Particles } from './props/Particles';
import { Pillars } from './props/Pillars';
import { Platform } from './props/Platform';
import { Rails } from './props/Rails';
import { Barrier, Cone, Poster, Skateboard, Sneaker, SprayCan } from './props/street';
import { Train } from './props/Train';
import { TunnelMouth } from './props/TunnelMouth';
import { Wall as WallPanel } from './props/Wall';
import { Board } from './zones/Board';
import { Checkin } from './zones/Checkin';
import { Crew } from './zones/Crew';
import { Hall404 } from './zones/Hall404';
import { Line } from './zones/Line';
import { Locker } from './zones/Locker';
import { Routes } from './zones/Routes';
import { Station } from './zones/Station';
import { Wall } from './zones/Wall';

/** Everything that spans the whole hall lives here; zone-specific set pieces are composed as zones. */
export function World() {
  return (
    <group>
      <Floor />
      <Rails z0={ZONES.TRACKS.z0 + 20} z1={WORLD_Z_END} />
      <Platform z0={ZONES.HALL.z0} z1={WORLD_Z_END} />
      <WallPanel side="left" z0={ZONES.TRACKS.z0} z1={WORLD_Z_END} />
      <WallPanel side="right" z0={ZONES.TRACKS.z0} z1={WORLD_Z_END} />
      <Pillars z0={ZONES.HALL.z0} z1={WORLD_Z_END} x={PLATFORM_X1 - 1.2} />
      <TunnelMouth z={ZONES.TRACKS.z0 - 2} />

      {/* HALL dressing */}
      <Poster word="RUN" position={[RIGHT_WALL_X - 0.05, 3.2, -28]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster word="GO!" accent="cyan" position={[RIGHT_WALL_X - 0.05, 3.2, -34]} rotation={[0, -Math.PI / 2, 0]} />
      <Poster word="HACK" accent="red" position={[RIGHT_WALL_X - 0.05, 3.2, -44]} rotation={[0, -Math.PI / 2, 0]} />
      <Cone position={[5.5, 0.6, -27]} />
      <Cone position={[6.2, 0.6, -27.9]} />
      <Barrier position={[2, 0.6, -46]} rotation={[0, 0.3, 0]} />
      <SprayCan position={[7.5, 0.6, -31]} cap="cyan" />
      <SprayCan position={[7.9, 0.6, -31.3]} cap="red" />
      <Skateboard position={[4.5, 0.6, -38]} rotation={[0, 0.8, 0]} />
      <Sneaker position={[6.8, 0.6, -41]} rotation={[0, -0.5, 0]} color="cyan" />
      <Sneaker position={[7.3, 0.6, -41.2]} rotation={[0, 0.2, 0]} color="yellow" />
      <GraffitiWall
        spec={{ words: ['RUN', 'THE', 'LINE'], base: 'pale', ink: 'yellow', accents: ['cyan', 'red', 'orange'], seed: 11 }}
        position={[LEFT_WALL_X + 0.06, 4.2, -36]} rotation={[0, Math.PI / 2, 0]} width={22} height={6} revealFrom="intro"
      />
      <GraffitiWall
        spec={{ words: ['AI EXPO'], base: 'pale', ink: 'cyan', accents: ['yellow', 'red'], seed: 23 }}
        position={[RIGHT_WALL_X - 0.06, 5.2, -60]} rotation={[0, -Math.PI / 2, 0]} width={14} height={4} revealFrom="intro"
      />
      <Train cars={2} z={-66} doorsOpen={0} band="cyan" />

      <Routes />
      <Line />
      <Board />
      <Checkin />
      <Wall />
      <Locker />
      <Crew />
      <Station />
      <Hall404 />

      <Coins />
      <Particles />
      <Intro />
    </group>
  );
}
