import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { layoutGraffiti, paintGraffiti, type GraffitiSpec } from '@/lib/graffiti';
import { introBus } from '../cinematic/introBus';

export interface GraffitiWallProps {
  spec: GraffitiSpec;
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number;
  height: number;
  revealFrom?: 'intro' | 'always';
}

const PX_PER_UNIT = 64;

export function GraffitiWall({ spec, position, rotation = [0, 0, 0], width, height, revealFrom = 'always' }: GraffitiWallProps) {
  const w = Math.round(width * PX_PER_UNIT);
  const h = Math.round(height * PX_PER_UNIT);
  const items = useMemo(() => layoutGraffiti(spec, w, h), [spec, w, h]);
  const { canvas, texture } = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return { canvas: c, texture: t };
  }, [w, h]);
  const painted = useRef(-1);

  const paint = (reveal: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    paintGraffiti(ctx, items, w, h, reveal, spec.base);
    texture.needsUpdate = true;
    painted.current = reveal;
  };

  useEffect(() => {
    const initial = () => paint(revealFrom === 'intro' && introBus.active ? introBus.reveal : 1);
    initial();
    // Repaint once Bungee has loaded so the canvas text uses the display face, not the fallback.
    document.fonts?.ready.then(() => { painted.current = -1; initial(); });
  }, [items, revealFrom]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (revealFrom !== 'intro') return;
    const r = introBus.active ? introBus.reveal : 1;
    if (Math.abs(r - painted.current) > 0.02) paint(r);
  });

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
