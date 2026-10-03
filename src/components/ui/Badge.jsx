import { cn } from '../../lib/cn';

const tones = {
  neutral: 'bg-paper-sunken text-ink-soft',
  signal: 'bg-signal-soft text-signal-deep',
  amber: 'bg-amber-soft text-amber',
  rust: 'bg-rust-soft text-rust',
};
export default function Badge({ tone = 'neutral', className, children, dot }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
