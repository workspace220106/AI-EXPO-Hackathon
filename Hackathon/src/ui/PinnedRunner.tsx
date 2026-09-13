import { Link } from 'react-router';
import { useGame } from '@/store/game';
import { useSession } from '@/store/session';
import { PALETTE } from '@/theme/palette';

export function PinnedRunner() {
  const user = useSession((s) => s.user);
  const coins = useGame((s) => s.coins);
  if (!user) return null;
  return (
    <Link to="/station" className="pointer-auto fixed bottom-4 right-4 z-20 flex items-center gap-2 border-[3px] border-navy bg-white px-2 py-1.5 shadow-bevel md:hidden">
      <span aria-hidden className="h-7 w-7 border-2 border-navy" style={{ background: PALETTE[user.avatar.teamColor] }} />
      <span className="font-display text-xs text-navy">{user.avatar.name}</span>
      <span className="rounded-full border-2 border-navy bg-yellow px-2 font-display text-xs text-navy">{coins}</span>
    </Link>
  );
}
