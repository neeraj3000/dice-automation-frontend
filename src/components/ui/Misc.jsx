import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export const Spinner = ({ className }) => <Loader2 className={cn('size-5 animate-spin text-ink-soft', className)} aria-label="Loading" />;

export const Skeleton = ({ className }) => <div className={cn('animate-pulse rounded-control bg-paper-sunken', className)} />;

export function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-signal' : 'bg-line-strong')}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 32 }} className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')} />
      </button>
    </div>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active}
      className={cn('rounded-full border px-3 py-1.5 text-[13px] font-medium transition', active ? 'border-signal bg-signal-soft text-signal-deep' : 'border-line-strong text-ink-soft hover:bg-paper-sunken')}
    >
      {children}
    </button>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line-strong px-6 py-14 text-center">
      {Icon && <div className="mb-4 grid size-12 place-items-center rounded-full bg-signal-soft text-signal"><Icon className="size-5" /></div>}
      <h3 className="font-serif text-lg font-medium">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-soft">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-xl text-[15px] text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Logo({ className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="grid size-8 place-items-center rounded-[9px] bg-signal text-white">
        <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 19 12 5l7 14M8 15h8" /></svg>
      </span>
      <span className="font-serif text-xl font-medium tracking-tight">Apply2Hire</span>
    </div>
  );
}
