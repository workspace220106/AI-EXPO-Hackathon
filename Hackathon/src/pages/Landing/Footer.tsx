import { EVENT } from '@/config/event';

export function Footer() {
  return (
    <footer className="pointer-auto border-4 border-navy bg-navy p-5 text-pale shadow-bevel-yellow">
      <p className="font-display text-2xl">AI EXPO</p>
      <p className="font-ui text-xs font-bold tracking-widest">{`${EVENT.organizer} · ${EVENT.city}`}</p>
      <nav aria-label="Social" className="mt-3 flex gap-3 font-display text-xs">
        <a href={EVENT.socials.instagram} className="border-2 border-pale px-2 py-1 hover:bg-cyan hover:text-navy">INSTAGRAM</a>
        <a href={EVENT.socials.linkedin} className="border-2 border-pale px-2 py-1 hover:bg-cyan hover:text-navy">LINKEDIN</a>
        <a href={EVENT.socials.discord} className="border-2 border-pale px-2 py-1 hover:bg-cyan hover:text-navy">DISCORD</a>
      </nav>
      <p className="mt-4 font-display text-[10px] tracking-[0.3em] text-yellow">BUILT ON THE LINE</p>
    </footer>
  );
}
