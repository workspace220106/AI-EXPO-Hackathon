import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { CameraRig } from './CameraRig';
import { Lights } from './lights';
import { colorOf } from './materials';
import { detectQualityTier, qualitySettings, readEnv } from './quality';
import { SHOTS } from './shots';
import { StatsProbe } from './StatsProbe';

export function isWebGLAvailable(search: string = typeof window === 'undefined' ? '' : window.location.search): boolean {
  if (new URLSearchParams(search).has('nowebgl')) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function WorldCanvas({ children }: { children?: ReactNode }) {
  const tier = useWorld((s) => s.qualityTier);
  const setQuality = useWorld((s) => s.setQuality);
  const [ok] = useState(isWebGLAvailable);

  useEffect(() => { setQuality(detectQualityTier(readEnv())); }, [setQuality]);

  if (!ok) return <div aria-hidden className="track-lines fixed inset-0 z-0 bg-pale" />;

  const q = qualitySettings(tier, window.devicePixelRatio || 1);
  return (
    <div aria-hidden className="fixed inset-0 z-0">
      <Canvas
        dpr={q.dpr}
        shadows={q.shadows ? 'soft' : false}
        camera={{ fov: SHOTS.hero.fov, near: 0.1, far: 400, position: SHOTS.hero.position }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ scene }) => { scene.background = colorOf('pale'); }}
      >
        <fog attach="fog" args={[PALETTE.pale, 25, q.fogFar]} />
        <Lights shadows={q.shadows} />
        <CameraRig />
        <PerformanceMonitor onDecline={() => setQuality('low')} />
        <StatsProbe />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
