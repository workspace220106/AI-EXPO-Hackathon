import type { DomainId } from '@/config/event';

export type ZoneName = 'TRACKS' | 'HALL' | 'ROUTES' | 'LINE' | 'BOARD' | 'CHECKIN' | 'WALL' | 'LOCKER' | 'CREW' | 'STATION';

/** The station is one long hall along −Z. Each zone owns a Z range (z0 > z1). */
export const ZONES: Record<ZoneName, { z0: number; z1: number }> = {
  TRACKS: { z0: 0, z1: -20 },
  HALL: { z0: -20, z1: -50 },
  ROUTES: { z0: -50, z1: -80 },
  LINE: { z0: -80, z1: -100 },
  BOARD: { z0: -100, z1: -120 },
  CHECKIN: { z0: -120, z1: -140 },
  WALL: { z0: -140, z1: -155 },
  LOCKER: { z0: -155, z1: -170 },
  CREW: { z0: -170, z1: -185 },
  STATION: { z0: -185, z1: -240 },
};

export const zoneCenter = (z: ZoneName): number => (ZONES[z].z0 + ZONES[z].z1) / 2;
export const zoneLength = (z: ZoneName): number => ZONES[z].z0 - ZONES[z].z1;

/** Cross-section: tracks on the left, platform on the right, walls at ±12. */
export const TRACK_X = -6;
export const PLATFORM_X0 = -3;
export const PLATFORM_X1 = 9;
export const PLATFORM_Y = 0.6;
export const LEFT_WALL_X = -12;
export const RIGHT_WALL_X = 12;
export const CEILING_Y = 9;
export const WORLD_Z_END = -240;

/** Z position of each route door on the left wall (ROUTES zone). */
export const DOOR_Z: Record<DomainId, number> = { ai: -56, data: -63, cyber: -70, future: -77 };

/** World positions that zone-addressed events (pulse/burst/look) resolve to. */
export const ZONE_ANCHORS: Record<string, [number, number, number]> = {
  kiosk: [4, 2.4, -134.4],
  checkin: [4, 2.4, -134.4],
  wall: [-6, 3, -147],
  locker: [3, 1.6, -163],
  crew: [3, 1.6, -178],
  station: [3, 1.6, -205],
};
