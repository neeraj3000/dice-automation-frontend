import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export const Spinner = ({ className }) => <Loader2 className={cn('size-5 animate-spin text-ink-soft', className)} aria-label="Loading" />;

export const Skeleton = ({ className }) => <div className={cn('animate-pulse rounded-control bg-paper-sunken', className)} />;

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="mt-0.5 text-sm text-ink-soft">{description}</p>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
        className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50', checked ? 'bg-signal' : 'bg-line-strong')}
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

const LOGO_SRC = {
  full: { light: '/images/apply2hire_full-logo.png', dark: '/images/apply2hire_full-logo_for-dark-bg.png' },
  text: { light: '/images/apply2hire_text.png', dark: '/images/apply2hire_text_for-dark-bg.png' },
  icon: { light: '/images/apply2hire_icon.png', dark: '/images/apply2hire_icon.png' },
};

// variant: 'full' (icon + wordmark) | 'icon' | 'text'.
// onDark forces the dark-background artwork (e.g. on the green login hero);
// otherwise the artwork follows the app's light/dark theme via CSS.
export function Logo({ variant = 'full', onDark = false, className, to }) {
  const src = LOGO_SRC[variant];
  const imgCls = cn('h-full w-auto select-none', variant === 'icon' && 'aspect-square');
  const hasCustomHeight = className && /\bh-\S+/.test(className);
  const defaultHeight = variant === 'icon' ? 'h-8' : 'h-7';
  const content = (
    <span className={cn('inline-flex shrink-0 items-center', !hasCustomHeight && defaultHeight, className)}>
      {onDark || src.light === src.dark ? (
        <img src={onDark ? src.dark : src.light} alt="Apply2Hire" className={imgCls} draggable="false" />
      ) : (
        <>
          <img src={src.light} alt="Apply2Hire" className={cn(imgCls, 'dark:hidden')} draggable="false" />
          <img src={src.dark} alt="Apply2Hire" className={cn(imgCls, 'hidden dark:block')} draggable="false" />
        </>
      )}
    </span>
  );

  if (to) {
    return (
      <Link to={to} aria-label="Apply2Hire Home" className="inline-flex shrink-0 items-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-signal rounded-md">
        {content}
      </Link>
    );
  }
  return content;
}

export function LogoLink({ to = '/', variant = 'full', onDark = false, className, title = 'Apply2Hire Home' }) {
  return (
    <Link to={to} title={title} aria-label="Apply2Hire Home" className={cn('inline-flex shrink-0 items-center transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-signal rounded-md', className)}>
      <Logo variant={variant} onDark={onDark} />
    </Link>
  );
}
