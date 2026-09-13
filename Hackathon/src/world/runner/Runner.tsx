import { forwardRef, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Object3D } from 'three';
import type { AvatarConfig } from '@/api/types';
import { useWorldEvents } from '@/hooks/useWorldEvents';
import { ZONE_ANCHORS } from '../layout';
import { createAnim, pose, step, trigger, type RunnerAnim } from './animations';
import { RunnerParts, type PartRefs } from './parts';

export interface RunnerProps {
  config: AvatarConfig;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  zone?: string;
  celebrateKey?: number;
  runTo?: { from: [number, number, number]; to: [number, number, number]; duration?: number } | null;
}

export const Runner = forwardRef<Group, RunnerProps>(function Runner({ config, position, rotationY = 0, scale = 1, zone, celebrateKey = 0, runTo = null }, ref) {
  const anim = useRef<RunnerAnim>(createAnim(performance.now() / 1000));
  const inner = useRef<Group>(null);
  const refs: PartRefs = {
    head: useRef<Object3D | null>(null), torso: useRef<Object3D | null>(null),
    leftArm: useRef<Object3D | null>(null), rightArm: useRef<Object3D | null>(null),
    leftLeg: useRef<Object3D | null>(null), rightLeg: useRef<Object3D | null>(null),
    leftFoot: useRef<Object3D | null>(null), body: useRef<Group | null>(null),
  };

  useWorldEvents('look', (e) => {
    if (zone && e.zone !== zone) return;
    const target = e.position ?? (e.zone ? ZONE_ANCHORS[e.zone] : undefined);
    if (target) anim.current = trigger(anim.current, 'look', performance.now() / 1000, { lookAt: target });
  });
  useWorldEvents('celebrate', () => { anim.current = trigger(anim.current, 'celebrate', performance.now() / 1000); });

  useEffect(() => { if (celebrateKey > 0) anim.current = trigger(anim.current, 'celebrate', performance.now() / 1000); }, [celebrateKey]);
  useEffect(() => { if (runTo) anim.current = trigger(anim.current, 'run', performance.now() / 1000, { from: runTo.from, to: runTo.to, duration: runTo.duration }); }, [runTo]);

  useFrame(() => {
    const now = performance.now() / 1000;
    anim.current = step(anim.current, now, Math.random);
    const p = pose(anim.current, now, rotationY, position);
    if (inner.current) {
      inner.current.position.set(p.offset[0], p.offset[1] + p.bodyY, p.offset[2]);
      inner.current.rotation.y = p.spin + p.hipSway;
    }
    if (refs.head.current) { refs.head.current.rotation.y = p.headYaw; refs.head.current.rotation.x = p.headPitch; }
    if (refs.leftArm.current) refs.leftArm.current.rotation.x = p.leftArm;
    if (refs.rightArm.current) refs.rightArm.current.rotation.x = p.rightArm;
    if (refs.leftLeg.current) refs.leftLeg.current.rotation.x = p.leftLeg;
    if (refs.rightLeg.current) refs.rightLeg.current.rotation.x = p.rightLeg;
    if (refs.leftFoot.current) refs.leftFoot.current.rotation.x = -p.footTap;
    if (refs.torso.current) refs.torso.current.rotation.z = p.hipSway * 0.5;
  });

  return (
    <group ref={ref} position={position} rotation-y={rotationY} scale={scale}>
      <group ref={inner}>
        <RunnerParts config={config} refs={refs} />
      </group>
    </group>
  );
});
