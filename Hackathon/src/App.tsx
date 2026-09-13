import { useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { LenisRoot } from '@/hooks/useLenis';
import { AppRoutes } from '@/routes';
import { syncBadges } from '@/store/badgeSync';
import { DevPanel } from '@/ui/DevPanel';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { Hud } from '@/ui/Hud';
import { Toasts } from '@/ui/Toasts';
import { RouteShotSync } from '@/world/RouteShotSync';
import { World } from '@/world/World';
import { WorldCanvas } from '@/world/WorldCanvas';

function RestartPanel() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pale p-6">
      <div className="border-4 border-navy bg-navy p-6 text-pale shadow-bevel-yellow">
        <p className="font-display text-2xl">SIGNAL LOST</p>
        <p className="mt-2 font-ui text-sm">Something derailed. Restart the run.</p>
        <button type="button" onClick={() => window.location.reload()} className="mt-4 border-4 border-navy bg-yellow px-5 py-3 font-display text-navy shadow-bevel-sm">RESTART RUN</button>
      </div>
    </div>
  );
}

export function Shell() {
  useEffect(() => { syncBadges(); }, []);   // NIGHT OWL and anything else already earned
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative z-10">
        <a href="#content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:border-4 focus:border-navy focus:bg-yellow focus:px-4 focus:py-2 focus:font-display focus:text-navy">SKIP TO CONTENT</a>
        <RouteShotSync />
        <LenisRoot />
        <Hud />
        <AppRoutes />
        <Toasts />
        <DevPanel />
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <>
      <ErrorBoundary fallback={<div aria-hidden className="track-lines fixed inset-0 z-0 bg-pale" />}>
        <WorldCanvas><World /></WorldCanvas>
      </ErrorBoundary>
      <ErrorBoundary fallback={<RestartPanel />}>
        <Shell />
      </ErrorBoundary>
    </>
  );
}
