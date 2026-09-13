import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorld, type WorldEvent, type WorldEventType } from '@/store/world';

export function consumeEvents(events: WorldEvent[], type: WorldEventType, seen: Set<number>): WorldEvent[] {
  const out: WorldEvent[] = [];
  for (const e of events) {
    if (e.type !== type || seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  if (seen.size > 500) { const keep = events.map((e) => e.id); seen.forEach((id) => { if (!keep.includes(id)) seen.delete(id); }); }
  return out;
}

/** Inside the canvas: run `handler` once for every new world event of `type`. Also prunes stale events. */
export function useWorldEvents(type: WorldEventType, handler: (e: WorldEvent) => void) {
  const seen = useRef(new Set<number>());
  useFrame(() => {
    const w = useWorld.getState();
    for (const e of consumeEvents(w.events, type, seen.current)) handler(e);
    if (w.events.length && Date.now() - w.events[0].at > 3000) w.prune(Date.now());
  });
}
