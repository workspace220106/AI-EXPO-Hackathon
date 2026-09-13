import { forwardRef, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Mesh } from 'three';
import { TRACK_X } from '../layout';
import { mat } from '../materials';

export interface TrainProps {
  cars?: number;
  z?: number;
  x?: number;
  rotationY?: number;  // π turns the headlamp to face −Z (the direction trains travel in the intro)
  speed?: number;      // world units / s, used only to spin wheels
  doorsOpen?: number;  // 0..1 (static)
  doorsRef?: RefObject<{ v: number }>; // 0..1, read every frame — overrides doorsOpen when given
  band?: 'yellow' | 'cyan' | 'orange' | 'red';
}

const CAR_LEN = 7.6;
const GAP = 0.4;

/** Navy subway cars with a coloured band, pale windows, yellow-hub wheels and sliding doors. Car 0 carries the headlamp on its +Z face. */
export const Train = forwardRef<Group, TrainProps>(function Train({ cars = 3, z = 0, x = TRACK_X, rotationY = 0, speed = 0, doorsOpen = 0, doorsRef, band = 'yellow' }, ref) {
  const wheels = useRef<Mesh[]>([]);
  const doors = useRef<{ mesh: Mesh; dir: number }[]>([]);
  useFrame((_, delta) => {
    for (const w of wheels.current) if (w) w.rotation.x -= speed * delta / 0.45;
    const open = doorsRef?.current?.v ?? doorsOpen;
    for (const d of doors.current) if (d) d.mesh.position.z = d.dir * (1.3 + open * 1.0);
  });

  return (
    <group ref={ref} position={[x, 0, z]} rotation-y={rotationY}>
      {Array.from({ length: cars }, (_, i) => {
        const cz = -i * (CAR_LEN + GAP);
        return (
          <group key={i} position={[0, 0, cz]}>
            <mesh position={[0, 2.0, 0]} material={mat('navy')} castShadow>
              <boxGeometry args={[2.6, 2.6, CAR_LEN]} />
            </mesh>
            <mesh position={[0, 3.4, 0]} material={mat('navy')}>
              <boxGeometry args={[2.2, 0.3, CAR_LEN - 0.6]} />
            </mesh>
            {[-1.31, 1.31].map((dx, side) => (
              <group key={dx}>
                <mesh position={[dx, 1.5, 0]} material={mat(band)}>
                  <boxGeometry args={[0.04, 0.5, CAR_LEN - 0.2]} />
                </mesh>
                {[-2.6, 0, 2.6].map((wz) => (
                  <mesh key={wz} position={[dx, 2.5, wz]} material={mat('pale')}>
                    <boxGeometry args={[0.04, 0.9, 1.6]} />
                  </mesh>
                ))}
                {[1, -1].map((dir, d) => (
                  <mesh
                    key={dir}
                    ref={(m) => { if (m) doors.current[i * 4 + side * 2 + d] = { mesh: m, dir }; }}
                    position={[dx, 1.7, dir * (1.3 + doorsOpen * 1.0)]}
                    material={mat('pale')}
                  >
                    <boxGeometry args={[0.06, 2.0, 1.0]} />
                  </mesh>
                ))}
              </group>
            ))}
            {[-2.6, 2.6].flatMap((wz, a) => [-1.0, 1.0].map((dx, b) => (
              <mesh key={`${wz}${dx}`} ref={(m) => { if (m) wheels.current[i * 4 + a * 2 + b] = m; }} position={[dx, 0.45, wz]} rotation-z={Math.PI / 2} material={mat('navy')}>
                <cylinderGeometry args={[0.45, 0.45, 0.3, 14]} />
              </mesh>
            )))}
            {[-2.6, 2.6].flatMap((wz) => [-1.16, 1.16].map((dx) => (
              <mesh key={`h${wz}${dx}`} position={[dx, 0.45, wz]} rotation-z={Math.PI / 2} material={mat('yellow')}>
                <cylinderGeometry args={[0.18, 0.18, 0.04, 10]} />
              </mesh>
            )))}
            {i === 0 && (
              <mesh position={[0, 1.6, CAR_LEN / 2 + 0.02]} material={mat('yellow', 'emissive')}>
                <boxGeometry args={[1.2, 0.3, 0.05]} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
});
