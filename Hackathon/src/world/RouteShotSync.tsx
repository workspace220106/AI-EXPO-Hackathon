import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useWorld } from '@/store/world';
import { shotForPath } from './shots';

/** Keeps the camera shot in step with the router. Lives in the DOM tree (needs router context). */
export function RouteShotSync() {
  const { pathname } = useLocation();
  const setShot = useWorld((s) => s.setShot);
  useEffect(() => { setShot(shotForPath(pathname)); }, [pathname, setShot]);
  return null;
}
