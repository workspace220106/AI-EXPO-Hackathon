import type { ShotName } from '@/store/world';
import { TRACK_X } from './layout';

export interface Shot {
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}

/** Station train cars sit on the track at these Z positions (car i of 6). */
export const TRAIN_Z = (i: number): number => -196 - (i - 1) * 8;

const train = (i: number): Shot => ({ position: [2, 2.2, TRAIN_Z(i) + 4], lookAt: [TRACK_X, 1.8, TRAIN_Z(i)], fov: 45 });

export const SHOTS: Record<Exclude<ShotName, 'landing'>, Shot> = {
  hero: { position: [3, 3.2, -22], lookAt: [1, 2.2, -40], fov: 55 },
  routes: { position: [2, 2.6, -58], lookAt: [-8, 2.4, -70], fov: 50 },
  line: { position: [1, 2.6, -86], lookAt: [10, 3, -92], fov: 50 },
  board: { position: [1, 3, -104], lookAt: [3, 3.5, -118], fov: 50 },
  checkin: { position: [3, 2.4, -124], lookAt: [3, 2, -134], fov: 48 },
  wall: { position: [3, 2.8, -144], lookAt: [-8, 3.5, -150], fov: 55 },
  locker: { position: [3, 2.2, -158], lookAt: [3, 1.4, -164], fov: 45 },
  crew: { position: [3, 2.6, -173], lookAt: [3, 1.4, -180], fov: 50 },
  station: { position: [3, 3.4, -190], lookAt: [0, 1.6, -212], fov: 55 },
  stationArrival: { position: [1, 1.6, -188], lookAt: [-4, 1.8, -205], fov: 60 },
  train1: train(1), train2: train(2), train3: train(3), train4: train(4), train5: train(5), train6: train(6),
  hall404: { position: [3, 3, -26], lookAt: [3, 3, -36], fov: 50 },
};

/** One control point per landing section: HERO, ROUTES, LINE, BOARD, CHECKIN, FOOTER. */
export const LANDING_POINTS: Shot[] = [
  SHOTS.hero, SHOTS.routes, SHOTS.line, SHOTS.board, SHOTS.checkin,
  { position: [3, 2.2, -128], lookAt: [3, 2, -138], fov: 50 },
];

const STATION_SECTIONS: Record<string, ShotName> = {
  profile: 'train1', team: 'train2', challenge: 'train3', submissions: 'train4', leaderboard: 'train5', announcements: 'train6',
};

export function shotForPath(pathname: string): ShotName {
  if (pathname === '/') return 'landing';
  if (pathname === '/signin') return 'checkin';
  if (pathname === '/register/identity') return 'wall';
  if (pathname === '/register/domain') return 'routes';
  if (pathname === '/register/runner') return 'locker';
  if (pathname === '/register/crew') return 'crew';
  if (pathname === '/register/pass') return 'stationArrival';
  if (pathname === '/station') return 'station';
  if (pathname === '/station/runner') return 'locker';
  const m = pathname.match(/^\/station\/([a-z]+)$/);
  if (m && STATION_SECTIONS[m[1]]) return STATION_SECTIONS[m[1]];
  return 'hall404';
}
