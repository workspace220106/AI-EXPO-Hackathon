import { PALETTE } from '@/theme/palette';

/** Bright station light: pale sky / navy ground hemisphere + warm orange key. No black anywhere. */
export function Lights({ shadows }: { shadows: boolean }) {
  return (
    <>
      <hemisphereLight args={[PALETTE.pale, PALETTE.navy, 1.1]} />
      <directionalLight
        color={PALETTE.orange}
        intensity={1.2}
        position={[8, 14, -30]}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-far={120}
      />
    </>
  );
}
