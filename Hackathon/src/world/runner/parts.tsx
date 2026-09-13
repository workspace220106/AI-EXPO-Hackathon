import type { RefObject } from 'react';
import type { Group, Object3D } from 'three';
import type { AvatarConfig } from '@/api/types';
import { mat } from '../materials';

export interface PartRefs {
  head: RefObject<Object3D | null>;
  torso: RefObject<Object3D | null>;
  leftArm: RefObject<Object3D | null>;
  rightArm: RefObject<Object3D | null>;
  leftLeg: RefObject<Object3D | null>;
  rightLeg: RefObject<Object3D | null>;
  leftFoot: RefObject<Object3D | null>;
  body: RefObject<Group | null>;
}

const BUILD = { slim: 0.5, regular: 0.62, chunky: 0.78 };

function Hair({ config }: { config: AvatarConfig }) {
  const m = mat(config.hairColor);
  switch (config.hair) {
    case 'buzz': return <mesh position={[0, 0.27, 0]} material={m}><boxGeometry args={[0.52, 0.08, 0.52]} /></mesh>;
    case 'spike': return (<group position={[0, 0.3, 0]}>{[-0.15, 0, 0.15].map((x, i) => <mesh key={i} position={[x, 0.12, 0]} rotation-z={(i - 1) * 0.35} material={m}><boxGeometry args={[0.12, 0.3, 0.3]} /></mesh>)}</group>);
    case 'bob': return (<group><mesh position={[0, 0.2, -0.05]} material={m}><boxGeometry args={[0.58, 0.2, 0.58]} /></mesh><mesh position={[0, -0.05, -0.2]} material={m}><boxGeometry args={[0.58, 0.45, 0.18]} /></mesh></group>);
    case 'afro': return <mesh position={[0, 0.2, 0]} material={m}><dodecahedronGeometry args={[0.42, 0]} /></mesh>;
    case 'cap': return (<group position={[0, 0.26, 0]}><mesh material={m}><boxGeometry args={[0.54, 0.14, 0.54]} /></mesh><mesh position={[0, -0.02, 0.36]} material={m}><boxGeometry args={[0.5, 0.05, 0.28]} /></mesh></group>);
  }
}

function Shoe({ config, side }: { config: AvatarConfig; side: -1 | 1 }) {
  const h = config.shoes.style === 'low' ? 0.12 : config.shoes.style === 'high' ? 0.2 : 0.28;
  return (
    <group position={[side * 0.16, 0, 0.04]}>
      <mesh position={[0, h / 2, 0]} material={mat(config.shoes.color)} castShadow><boxGeometry args={[0.26, h, 0.42]} /></mesh>
      {config.shoes.style === 'boot' && <mesh position={[0, 0.03, 0]} material={mat('navy')}><boxGeometry args={[0.28, 0.06, 0.44]} /></mesh>}
    </group>
  );
}

function Backpack({ config }: { config: AvatarConfig }) {
  if (config.backpack === 'none') return null;
  const m = mat(config.teamColor);
  return config.backpack === 'daypack'
    ? <mesh position={[0, 0.05, -0.32]} material={m} castShadow><boxGeometry args={[0.44, 0.5, 0.22]} /></mesh>
    : <mesh position={[0, 0.1, -0.3]} rotation-z={Math.PI / 2} material={m} castShadow><cylinderGeometry args={[0.13, 0.13, 0.6, 12]} /></mesh>;
}

function Board({ config }: { config: AvatarConfig }) {
  if (config.board === 'none') return null;
  if (config.board === 'hover') return (
    <group position={[0, 0.06, 0]}>
      <mesh material={mat(config.teamColor)} castShadow><boxGeometry args={[0.9, 0.08, 0.5]} /></mesh>
      <mesh position={[0, -0.05, 0]} material={mat('yellow', 'emissive')}><boxGeometry args={[0.7, 0.03, 0.36]} /></mesh>
    </group>
  );
  return (
    <group position={[0, 0.08, 0]}>
      <mesh material={mat('navy')} castShadow><boxGeometry args={[1.0, 0.06, 0.32]} /></mesh>
      {[-0.32, 0.32].flatMap((x) => [-0.13, 0.13].map((z) => <mesh key={`${x}${z}`} position={[x, -0.06, z]} rotation-x={Math.PI / 2} material={mat('yellow')}><cylinderGeometry args={[0.07, 0.07, 0.05, 8]} /></mesh>))}
    </group>
  );
}

/** Blocky toy-figure runner. Pivots: arms at shoulders, legs at hips, head at neck. Feet rest at y=0 (+ board). */
export function RunnerParts({ config, refs }: { config: AvatarConfig; refs: PartRefs }) {
  const w = BUILD[config.body];
  const boardLift = config.board === 'none' ? 0 : config.board === 'hover' ? 0.12 : 0.14;
  const tone = mat(config.tone);
  const outfit = mat(config.outfit.color);
  return (
    <group>
      <Board config={config} />
      <group ref={refs.body} position={[0, boardLift, 0]}>
        {([-1, 1] as const).map((side) => (
          <group key={side} ref={side === -1 ? refs.leftLeg : refs.rightLeg} position={[side * 0.16, 0.9, 0]}>
            <mesh position={[0, -0.42, 0]} material={mat('navy')} castShadow><boxGeometry args={[0.24, 0.8, 0.26]} /></mesh>
            <group ref={side === -1 ? refs.leftFoot : undefined} position={[-side * 0.16, -0.9, 0]}>
              <Shoe config={config} side={side} />
            </group>
          </group>
        ))}
        <group ref={refs.torso} position={[0, 0.9, 0]}>
          <mesh position={[0, 0.4, 0]} material={outfit} castShadow><boxGeometry args={[w, 0.8, 0.4]} /></mesh>
          {config.outfit.pattern === 'stripe' && <mesh position={[0, 0.4, 0.21]} material={mat('pale')}><boxGeometry args={[w + 0.02, 0.16, 0.02]} /></mesh>}
          {config.outfit.pattern === 'block' && <mesh position={[0, 0.2, 0]} material={mat('navy')}><boxGeometry args={[w + 0.01, 0.4, 0.41]} /></mesh>}
          <mesh position={[w / 2 - 0.08, 0.62, 0.21]} material={mat(config.teamColor)}><boxGeometry args={[0.14, 0.14, 0.02]} /></mesh>
          <Backpack config={config} />
          {([-1, 1] as const).map((side) => (
            <group key={side} ref={side === -1 ? refs.leftArm : refs.rightArm} position={[side * (w / 2 + 0.12), 0.75, 0]}>
              <mesh position={[0, -0.32, 0]} material={outfit} castShadow><boxGeometry args={[0.2, 0.64, 0.2]} /></mesh>
              <mesh position={[0, -0.7, 0]} material={tone}><boxGeometry args={[0.18, 0.14, 0.18]} /></mesh>
            </group>
          ))}
          <group ref={refs.head} position={[0, 0.85, 0]}>
            <mesh position={[0, 0.25, 0]} material={tone} castShadow><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh>
            <mesh position={[-0.12, 0.3, 0.26]} material={mat('navy')}><boxGeometry args={[0.07, 0.09, 0.02]} /></mesh>
            <mesh position={[0.12, 0.3, 0.26]} material={mat('navy')}><boxGeometry args={[0.07, 0.09, 0.02]} /></mesh>
            <group position={[0, 0.25, 0]}><Hair config={config} /></group>
          </group>
        </group>
      </group>
    </group>
  );
}
