import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWorld } from '@/store/world';

export function StatsProbe() {
  const n = useRef(0);
  useFrame(({ gl }) => { if (++n.current % 30 === 0) useWorld.getState().setDrawCalls(gl.info.render.calls); });
  return null;
}
