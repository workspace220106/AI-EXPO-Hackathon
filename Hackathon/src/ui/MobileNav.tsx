import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router';

export interface NavItem { label: string; to?: string; href?: string; tone?: 'pale' | 'yellow' | 'cyan' }

export function MobileNav({ open, items, onClose }: { open: boolean; items: NavItem[]; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          aria-label="Menu"
          className="pointer-auto fixed inset-0 z-40 flex flex-col gap-3 bg-pale p-6 pt-20"
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {items.map((it) => {
            const cls = `block border-4 border-navy px-5 py-4 font-display text-xl text-navy shadow-bevel ${it.tone === 'yellow' ? 'bg-yellow' : it.tone === 'cyan' ? 'bg-cyan' : 'bg-white'}`;
            return it.to
              ? <Link key={it.label} to={it.to} className={cls} onClick={onClose}>{it.label}</Link>
              : <a key={it.label} href={it.href} className={cls} onClick={onClose}>{it.label}</a>;
          })}
          <button type="button" onClick={onClose} className="mt-auto border-4 border-navy bg-white px-5 py-4 font-display text-navy shadow-bevel">CLOSE</button>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
