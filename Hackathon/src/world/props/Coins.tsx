import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { coinWorldPosition, dueCoins, LANDING_COINS } from '@/lib/coins';
import { useGame } from '@/store/game';
import { useWorld } from '@/store/world';
import { Coin } from './Coin';

const v = new Vector3();

export function Coins() {
  const collected = useGame((s) => s.collectedCoins);
  const shot = useWorld((s) => s.shot);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const positions = useMemo(() => Object.fromEntries(LANDING_COINS.map((c) => [c.id, coinWorldPosition(c.t)])), []);

  useFrame(() => {
    if (shot !== 'landing') return;
    const w = useWorld.getState();
    if (w.introRunning) return;
    for (const id of dueCoins(w.scrollT, useGame.getState().collectedCoins)) {
      const p = positions[id];
      v.set(p[0], p[1], p[2]).project(camera);
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      useGame.getState().collectCoin(id, x, y);
      w.emit({ type: 'coin', position: p, color: 'yellow' });
    }
  });

  if (shot !== 'landing') return null;
  return (
    <group>
      {LANDING_COINS.filter((c) => !collected.includes(c.id)).map((c) => (
        <Coin key={c.id} position={positions[c.id]} />
      ))}
    </group>
  );
}
