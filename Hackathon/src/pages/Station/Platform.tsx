import { Link } from 'react-router';
import { TRAIN_LABELS } from '@/config/trains';
import { useSession } from '@/store/session';
import { useWorld } from '@/store/world';
import { ProgressStrip } from '@/ui/ProgressStrip';

export default function Platform() {
  const user = useSession((s) => s.user);
  const setHovered = useWorld((s) => s.setHovered);
  return (
    <main id="content" className="flex min-h-dvh flex-col justify-end p-4 md:p-8">
      <div className="pointer-auto">
        <p className="font-display text-xs tracking-[0.3em] text-navy">{user ? `WELCOME BACK, ${user.avatar.name}` : 'PLATFORM'}</p>
        <h1 className="font-display text-2xl text-navy md:text-5xl">THE RUNNER STATION</h1>
        <p className="mt-1 font-ui text-sm font-bold text-navy">Board a train. Hover to peek, click to ride.</p>
      </div>
      <nav aria-label="Trains" className="pointer-auto mt-4 grid grid-cols-2 gap-2 md:grid-cols-6">
        {TRAIN_LABELS.map((t, i) => (
          <Link key={t.n} to={t.path}
            onMouseEnter={() => setHovered(`train:${i + 1}`)} onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-2 border-4 border-navy bg-pale px-3 py-2 font-display text-[11px] text-navy shadow-bevel transition-transform hover:-translate-y-1 hover:bg-cyan md:flex-col md:items-start md:text-xs">
            <span className="border-2 border-navy bg-yellow px-1.5">{t.n}</span>
            <span>{t.name}</span>
          </Link>
        ))}
      </nav>
      <div className="pointer-auto mt-3 max-w-2xl"><ProgressStrip /></div>
    </main>
  );
}
