import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { damp } from 'maath/easing';
import { PointLight } from 'three';
import { useWorldEvents } from '@/hooks/useWorldEvents';
import { PALETTE } from '@/theme/palette';
import { BUNGEE_URL } from '../fonts';
import { mat } from '../materials';

/** Accent light that flares on `pulse`/`burst` events addressed to any of its `zones`, then decays. */
export function ZoneLight({ position, zones, color = 'cyan' }: { position: [number, number, number]; zones: string[]; color?: 'cyan' | 'yellow' }) {
  const light = useRef<PointLight>(null);
  const target = useRef(0.8);
  const hit = (zone?: string) => { if (!zone || zones.includes(zone)) target.current = 6; };
  useWorldEvents('pulse', (e) => hit(e.zone));
  useWorldEvents('burst', (e) => hit(e.zone));
  useFrame((_, delta) => {
    if (!light.current) return;
    damp(light.current, 'intensity', target.current, 0.12, delta);
    target.current = Math.max(0.8, target.current - delta * 9);
  });
  return <pointLight ref={light} color={PALETTE[color]} intensity={0.8} distance={14} position={position} />;
}

export function Kiosk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.3, 0]} material={mat('navy')} castShadow>
        <boxGeometry args={[2.4, 2.6, 1]} />
      </mesh>
      <mesh position={[0, 1.7, 0.52]} rotation-x={-0.18} material={mat('pale', 'emissive')}>
        <boxGeometry args={[2.0, 1.3, 0.06]} />
      </mesh>
      {[-0.6, 0, 0.6].map((dx) => (
        <mesh key={dx} position={[dx, 0.8, 0.52]} material={mat('yellow')}>
          <boxGeometry args={[0.4, 0.2, 0.08]} />
        </mesh>
      ))}
      <mesh position={[0, 2.95, 0]} material={mat('orange')} castShadow>
        <boxGeometry args={[2.6, 0.6, 1.1]} />
      </mesh>
      <Text font={BUNGEE_URL} fontSize={0.32} color={PALETTE.navy} anchorX="center" anchorY="middle" position={[0, 2.95, 0.58]}>
        CHECK-IN
      </Text>
      <ZoneLight position={[0, 3.6, 2]} zones={['kiosk', 'checkin']} />
    </group>
  );
}
