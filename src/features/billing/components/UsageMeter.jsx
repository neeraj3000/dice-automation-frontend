import { cn } from '../../../lib/cn';

export default function UsageMeter({ label, used, limit, hint }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 100;
  const tone = pct >= 100 ? 'bg-rust' : pct >= 80 ? 'bg-amber' : 'bg-signal';

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{label}</p>
      <p className="mt-2 flex items-baseline gap-1.5 tabular-nums">
        <span className="font-serif text-3xl font-medium tracking-tight text-ink">{used}</span>
        <span className="text-sm text-ink-soft">of {limit}</span>
      </p>
      <div
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-sunken"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone)} style={{ width: `${pct}%` }} />
      </div>
      {hint && <p className="mt-2 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
