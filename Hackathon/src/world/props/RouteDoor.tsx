import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { Group, Mesh } from 'three';
import type { DomainConfig, DomainId } from '@/config/event';
import { useWorld } from '@/store/world';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { LEFT_WALL_X } from '../layout';
import { mat } from '../materials';

const W = 4.4, H = 5.2, DEPTH = 3;

function Interior({ id }: { id: DomainId }) {
  const g = useRef<Group>(null);
  useFrame((s) => { if (g.current) { g.current.rotation.y = s.clock.elapsedTime * 0.6; g.current.position.y = 2.4 + Math.sin(s.clock.elapsedTime * 1.4) * 0.15; } });
  return (
    <group ref={g} position={[-1.2, 2.4, 0]}>
      {id === 'ai' && (<><mesh material={mat('yellow')} position={[0, 0, 0]}><octahedronGeometry args={[0.55]} /></mesh><mesh material={mat('yellow')} position={[0.8, 0.5, 0.3]}><boxGeometry args={[0.5, 0.5, 0.5]} /></mesh><mesh material={mat('yellow')} position={[-0.7, -0.4, -0.3]}><tetrahedronGeometry args={[0.45]} /></mesh></>)}
      {id === 'data' && [0.3, 0.7, 1.1, 0.5].map((h, i) => (<mesh key={i} material={mat('cyan')} position={[-0.9 + i * 0.6, h / 2 - 0.6, 0]}><boxGeometry args={[0.4, h, 0.4]} /></mesh>))}
      {id === 'cyber' && (<><mesh material={mat('red')} position={[0, -0.2, 0]}><boxGeometry args={[1.1, 0.9, 0.5]} /></mesh><mesh material={mat('red')} position={[0, 0.55, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[0.4, 0.12, 8, 16]} /></mesh></>)}
      {id === 'future' && [0.9, 0.6, 0.3].map((r, i) => (<mesh key={i} material={mat('orange')} rotation-x={Math.PI / 2 + i * 0.5}><torusGeometry args={[r, 0.08, 8, 24]} /></mesh>))}
    </group>
  );
}

/** A subway-door portal set into the left wall. Hover/select/dim states come from the world store. */
export function RouteDoor({ domain, z }: { domain: DomainConfig; z: number }) {
  const hovered = useWorld((s) => s.hovered === `door:${domain.id}`);
  const selected = useWorld((s) => s.selectedDomain === domain.id);
  const mode = useWorld((s) => s.doorMode);
  const anySelected = useWorld((s) => s.selectedDomain != null);
  const dimmed = mode === 'select' && anySelected && !selected;
  const left = useRef<Mesh>(null);
  const right = useRef<Mesh>(null);
  const root = useRef<Group>(null);

  useFrame((_, delta) => {
    const open = selected ? 1.7 : hovered ? 0.35 : 0;
    if (left.current) damp(left.current.position, 'z', -0.95 - open, 0.25, delta);
    if (right.current) damp(right.current.position, 'z', 0.95 + open, 0.25, delta);
    if (root.current) damp(root.current.position, 'x', LEFT_WALL_X + (hovered && !selected ? 0.25 : 0), 0.2, delta);
  });

  const panel = dimmed ? mat('navy') : mat(domain.color);
  const strip = hovered || selected ? mat('cyan', 'emissive') : mat('pale');
  const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();

  return (
    <group
      ref={root}
      position={[LEFT_WALL_X, 0, z]}
      onPointerOver={(e) => { stop(e); useWorld.getState().setHovered(`door:${domain.id}`); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { stop(e); if (useWorld.getState().hovered === `door:${domain.id}`) useWorld.getState().setHovered(null); document.body.style.cursor = ''; }}
      onClick={(e) => { stop(e); useWorld.getState().doorHandler?.(domain.id); }}
    >
      {/* portal box protruding into the hall; open front face at x = DEPTH */}
      <mesh position={[DEPTH / 2, H / 2 + 0.6, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[DEPTH, H + 0.6, W + 0.6]} />
      </mesh>
      <mesh position={[DEPTH / 2 + 0.01, H / 2 + 0.6, 0]} material={dimmed ? mat('navy') : mat(domain.color, 'emissive')}>
        <boxGeometry args={[DEPTH - 0.4, H - 0.2, W - 0.2]} />
      </mesh>
      <group position={[DEPTH + 0.05, 0, 0]}>
        <Interior id={domain.id} />
      </group>
      <mesh ref={left} position={[DEPTH + 0.02, H / 2 + 0.6, -0.95]} material={panel} castShadow>
        <boxGeometry args={[0.12, H - 0.2, 1.9]} />
      </mesh>
      <mesh ref={right} position={[DEPTH + 0.02, H / 2 + 0.6, 0.95]} material={panel} castShadow>
        <boxGeometry args={[0.12, H - 0.2, 1.9]} />
      </mesh>
      <mesh position={[DEPTH + 0.1, H + 0.75, 0]} material={strip}>
        <boxGeometry args={[0.15, 0.2, W]} />
      </mesh>
      <group position={[DEPTH + 0.12, H + 1.5, 0]} rotation-y={Math.PI / 2}>
        <mesh material={dimmed ? mat('navy') : mat('pale')}>
          <boxGeometry args={[W, 1.0, 0.12]} />
        </mesh>
        <Text font={BUNGEE_URL} fontSize={0.5} color={dimmed ? PALETTE.pale : PALETTE.navy} anchorX="center" anchorY="middle" position={[0, 0, 0.08]}>
          {`${domain.number} ${domain.name}`}
        </Text>
      </group>
    </group>
  );
}
