import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D } from 'three';
import { useWorldEvents } from '@/hooks/useWorldEvents';
import { prefersReducedMotion } from '@/hooks/useReducedMotion';
import { makePool, POOL, spawnBurst, stepParticles } from '@/lib/particles';
import { useWorld } from '@/store/world';
import { ZONE_ANCHORS } from '../layout';
import { mat } from '../materials';
import { qualitySettings } from '../quality';

const dummy = new Object3D();

export function Particles() {
  const enabled = useWorld((s) => qualitySettings(s.qualityTier, 1).particles) && !prefersReducedMotion();
  const mesh = useRef<InstancedMesh>(null);
  const pool = useMemo(makePool, []);

  const burst = (position: [number, number, number] | undefined, zone: string | undefined, n: number) => {
    const origin = position ?? (zone ? ZONE_ANCHORS[zone] : undefined);
    if (origin) spawnBurst(pool, origin, n, Math.random);
  };
  useWorldEvents('burst', (e) => burst(e.position, e.zone, 10));
  useWorldEvents('coin', (e) => burst(e.position, e.zone, 6));

  useFrame((_, delta) => {
    if (!mesh.current) return;
    stepParticles(pool, Math.min(delta, 0.05));
    pool.forEach((p, i) => {
      dummy.position.set(p.x, p.y, p.z);
      const s = p.life > 0 ? 0.12 * p.life : 0;
      dummy.scale.set(s, s, s);
      dummy.rotation.set(p.life * 6, p.life * 4, 0);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  if (!enabled) return null;
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, POOL]} material={mat('cyan', 'flat')} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}
