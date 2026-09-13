import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { TRAIN_LABELS } from '@/config/trains';
import { useStage } from '@/hooks/useStage';
import { useLeaderboard } from '@/store/leaderboard';
import { useTeam } from '@/store/team';
import { useWorld } from '@/store/world';

export default function StationLayout() {
  const navigate = useNavigate();
  useStage();
  useEffect(() => {
    const w = useWorld.getState();
    w.setTrainHandler((i) => navigate(TRAIN_LABELS[i - 1].path));
    void useTeam.getState().load();
    const lb = useLeaderboard.getState();
    if (lb.rows.length === 0) void lb.load();
    lb.start();
    return () => { w.setTrainHandler(null); w.setHovered(null); lb.stop(); };
  }, [navigate]);

  return (
    <div className="pointer-none relative z-10 min-h-dvh">
      <Outlet />
    </div>
  );
}
