import { useEffect, useState } from 'react';
import { api } from '@/api';
import type { Announcement } from '@/api/types';
import { EVENT } from '@/config/event';
import { SectionPanel } from './SectionPanel';

const TAG: Record<Announcement['tag'], string | null> = { none: null, live: 'LIVE', deadline: 'DEADLINE', tip: 'TIP' };
const TAG_CLASS: Record<Announcement['tag'], string> = { none: '', live: 'bg-red text-white', deadline: 'bg-red text-white', tip: 'bg-cyan text-navy' };
const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { timeZone: EVENT.timezone, day: 'numeric', month: 'short' });

export default function Announcements() {
  const [items, setItems] = useState<Announcement[] | null>(null);
  useEffect(() => {
    let alive = true;
    void api.getAnnouncements().then((a) => { if (alive) { setItems(a); api.markAnnouncementsRead(); } });
    return () => { alive = false; };
  }, []);

  return (
    <SectionPanel train={6} title="ANNOUNCEMENTS">
      {!items ? <p className="font-display text-sm">TUNING THE PA…</p> : (
        <ul className="space-y-3">
          {items.map((a) => (
            <li key={a.id} className="border-[3px] border-navy bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-sm">{a.title}</h3>
                {TAG[a.tag] && <span className={`border-2 border-navy px-2 py-0.5 font-display text-[10px] ${TAG_CLASS[a.tag]}`}>{TAG[a.tag]}</span>}
              </div>
              <p className="mt-1 font-ui text-sm">{a.body}</p>
              <p className="mt-1 font-ui text-[10px] font-bold tracking-widest">{fmt(a.at)}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionPanel>
  );
}
