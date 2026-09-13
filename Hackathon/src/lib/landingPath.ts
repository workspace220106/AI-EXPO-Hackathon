import { CatmullRomCurve3, Vector3 } from 'three';
import { LANDING_POINTS, type Shot } from '@/world/shots';

const posCurve = new CatmullRomCurve3(LANDING_POINTS.map((p) => new Vector3(...p.position)), false, 'centripetal');
const lookCurve = new CatmullRomCurve3(LANDING_POINTS.map((p) => new Vector3(...p.lookAt)), false, 'centripetal');
const scratchP = new Vector3();
const scratchL = new Vector3();

/** Camera shot for landing scroll progress t ∈ [0,1]. Allocation-free after warm-up. */
export function sampleLanding(t: number): Shot {
  const u = Math.min(1, Math.max(0, t));
  posCurve.getPointAt(u, scratchP);
  lookCurve.getPointAt(u, scratchL);
  const seg = Math.min(LANDING_POINTS.length - 2, Math.floor(u * (LANDING_POINTS.length - 1)));
  const f = u * (LANDING_POINTS.length - 1) - seg;
  const fov = LANDING_POINTS[seg].fov + (LANDING_POINTS[seg + 1].fov - LANDING_POINTS[seg].fov) * f;
  return { position: [scratchP.x, scratchP.y, scratchP.z], lookAt: [scratchL.x, scratchL.y, scratchL.z], fov };
}
