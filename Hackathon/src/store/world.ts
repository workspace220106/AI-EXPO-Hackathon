import { create } from 'zustand';
import type { AvatarConfig } from '@/api/types';
import type { DomainId } from '@/config/event';
import type { PaletteName } from '@/theme/palette';

export type ShotName =
  | 'landing' | 'hero' | 'routes' | 'line' | 'board' | 'checkin' | 'wall' | 'locker' | 'crew'
  | 'station' | 'stationArrival' | 'train1' | 'train2' | 'train3' | 'train4' | 'train5' | 'train6' | 'hall404';

export type QualityTier = 'high' | 'low';
export type WorldEventType = 'pulse' | 'burst' | 'look' | 'celebrate' | 'coin';

export interface WorldEvent {
  id: number;
  type: WorldEventType;
  at: number;
  position?: [number, number, number];
  color?: PaletteName;
  zone?: string;
}

interface WorldState {
  shot: ShotName;
  scrollT: number;
  scrollLocked: boolean;
  qualityTier: QualityTier;
  introPlayed: boolean;
  introRunning: boolean;
  hovered: string | null;
  events: WorldEvent[];
  doorMode: 'showcase' | 'select';
  selectedDomain: DomainId | null;
  doorHandler: ((id: DomainId) => void) | null;
  trainHandler: ((i: number) => void) | null;
  arrivalAt: number | null;
  lockerCelebrate: number;
  lockerAvatar: AvatarConfig | null;
  stageIndex: number;
  drawCalls: number;
  setShot(shot: ShotName): void;
  setScrollT(t: number): void;
  lockScroll(locked: boolean): void;
  setQuality(tier: QualityTier): void;
  setIntroPlayed(v: boolean): void;
  setIntroRunning(v: boolean): void;
  setHovered(id: string | null): void;
  emit(e: Omit<WorldEvent, 'id' | 'at'>): void;
  prune(nowMs: number): void;
  setDoorMode(mode: 'showcase' | 'select'): void;
  setSelectedDomain(id: DomainId | null): void;
  setDoorHandler(fn: ((id: DomainId) => void) | null): void;
  setTrainHandler(fn: ((i: number) => void) | null): void;
  startArrival(): void;
  clearArrival(): void;
  bumpLockerCelebrate(): void;
  setLockerAvatar(a: AvatarConfig | null): void;
  setStageIndex(i: number): void;
  setDrawCalls(n: number): void;
}

const INTRO_KEY = 'aiexpo.introPlayed';
const readIntro = () => { try { return sessionStorage.getItem(INTRO_KEY) === '1'; } catch { return false; } };

let eventSeq = 0;
const EVENT_TTL = 3000;

export const useWorld = create<WorldState>()((set) => ({
  shot: 'landing',
  scrollT: 0,
  scrollLocked: false,
  qualityTier: 'high',
  introPlayed: readIntro(),
  introRunning: false,
  hovered: null,
  events: [],
  doorMode: 'showcase',
  selectedDomain: null,
  doorHandler: null,
  trainHandler: null,
  arrivalAt: null,
  lockerCelebrate: 0,
  lockerAvatar: null,
  stageIndex: -1,
  drawCalls: 0,
  setShot: (shot) => set({ shot }),
  setScrollT: (t) => set({ scrollT: Math.min(1, Math.max(0, t)) }),
  lockScroll: (scrollLocked) => set({ scrollLocked }),
  setQuality: (qualityTier) => set({ qualityTier }),
  setIntroPlayed(v) {
    try { sessionStorage.setItem(INTRO_KEY, v ? '1' : '0'); } catch { /* memory only */ }
    set({ introPlayed: v });
  },
  setIntroRunning: (introRunning) => set({ introRunning }),
  setHovered: (hovered) => set({ hovered }),
  emit: (e) => set((s) => ({ events: [...s.events, { ...e, id: ++eventSeq, at: Date.now() }] })),
  prune: (nowMs) => set((s) => ({ events: s.events.filter((e) => nowMs - e.at < EVENT_TTL) })),
  setDoorMode: (doorMode) => set({ doorMode }),
  setSelectedDomain: (selectedDomain) => set({ selectedDomain }),
  setDoorHandler: (doorHandler) => set({ doorHandler }),
  setTrainHandler: (trainHandler) => set({ trainHandler }),
  startArrival: () => set({ arrivalAt: Date.now() }),
  clearArrival: () => set({ arrivalAt: null }),
  bumpLockerCelebrate: () => set((s) => ({ lockerCelebrate: s.lockerCelebrate + 1 })),
  setLockerAvatar: (lockerAvatar) => set({ lockerAvatar }),
  setStageIndex: (stageIndex) => set({ stageIndex }),
  setDrawCalls: (drawCalls) => set({ drawCalls }),
}));
