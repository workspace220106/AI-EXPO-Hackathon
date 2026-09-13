import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { canAccess, furthestStep, STEP_PATH, useRegistration, type Step } from '@/store/registration';
import { useSession } from '@/store/session';
import { useToasts } from '@/store/toasts';

/** Station routes: signed-out visitors go to the kiosk with a short toast. */
export function RequireSession() {
  const user = useSession((s) => s.user);
  const location = useLocation();
  useEffect(() => {
    if (!user) useToasts.getState().push({ kind: 'info', title: 'WRONG PLATFORM', body: 'Wrong platform, runner — heading back.' });
  }, [user]);
  if (!user) return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Kiosk and the first registration step: a signed-in runner belongs in the station. */
export function RedirectIfSignedIn({ to = '/station' }: { to?: string }) {
  const user = useSession((s) => s.user);
  return user ? <Navigate to={to} replace /> : <Outlet />;
}

/** Registration steps must be completed in order; out-of-order visits go to the furthest open step. */
export function RequireStep({ step }: { step: Step }) {
  const completed = useRegistration((s) => s.completed);
  if (!canAccess(step, completed)) return <Navigate to={STEP_PATH[furthestStep(completed)]} replace />;
  return <Outlet />;
}
