import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/cn';

// A "⋯" button with a dropdown. items: { label, icon, onClick, danger?, mobileOnly? } | 'divider' | falsy.
export default function ActionMenu({ items, open, onOpenChange }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) onOpenChange(false); };
    const onKey = (e) => e.key === 'Escape' && onOpenChange(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'grid size-8 place-items-center rounded-control border border-transparent text-ink-soft transition hover:border-line hover:bg-paper-sunken hover:text-ink',
          open && 'border-line bg-paper-sunken text-ink'
        )}
      >
        <MoreHorizontal className="size-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full z-30 mt-1.5 w-48 origin-top-right rounded-control border border-line bg-paper-raised p-1 shadow-popover"
          >
            {items.filter(Boolean).map((it) =>
              it === 'divider' ? (
                <div key="divider" className="my-1 h-px bg-line" />
              ) : (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  onClick={() => { onOpenChange(false); it.onClick(); }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
                    it.danger ? 'text-rust hover:bg-rust-soft' : 'text-ink hover:bg-paper-sunken',
                    it.mobileOnly && 'sm:hidden'
                  )}
                >
                  <it.icon className={cn('size-4', !it.danger && 'text-ink-soft')} />
                  {it.label}
                </button>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
