import { Link } from 'react-router-dom';
import { cn } from '../../../lib/cn';
import { useGetBillingStatusQuery } from '../billingApi';

// Plan name plus how many applications / search profiles are left, derived from /billing/status.
// No polling: it refetches when an application finishes, an automation makes progress, the plan
// changes (BILLING_UPDATED pushed over SSE), or the tab regains focus.
function usePlanUsage() {
  const { data: status } = useGetBillingStatusQuery();
  if (!status) return null;

  const expired = status.source === 'none';
  const apps = status.applications || { used: 0, limit: 0 };
  const profiles = status.search_profiles || { used: 0, limit: 0 };
  const appsLeft = Math.max(0, apps.limit - apps.used);
  const ratioLeft = apps.limit > 0 ? appsLeft / apps.limit : 0;

  return {
    expired,
    planName: expired ? 'No plan' : status.source === 'trial' ? 'Free trial' : status.plan?.name || 'Plan',
    appsUsed: apps.used,
    appsLimit: apps.limit,
    appsLeft,
    period: apps.period === 'trial' ? 'in trial' : 'today',
    profilesUsed: profiles.used,
    profilesLimit: profiles.limit,
    tone: expired || appsLeft === 0 ? 'rust' : ratioLeft <= 0.2 ? 'amber' : 'signal',
  };
}

const TONE = {
  signal: { bar: 'bg-signal', ring: 'stroke-signal', text: 'text-signal-deep', dot: 'bg-signal' },
  amber: { bar: 'bg-amber', ring: 'stroke-amber', text: 'text-amber', dot: 'bg-amber' },
  rust: { bar: 'bg-rust', ring: 'stroke-rust', text: 'text-rust', dot: 'bg-rust' },
};

function appsLeftLabel(u) {
  if (u.expired) return 'Trial ended';
  if (u.appsLeft === 0) return `Limit reached ${u.period}`;
  return `${u.appsLeft} left ${u.period}`;
}

// Compact plan + remaining-usage card for the bottom of the sidebar.
export function SidebarPlanUsage({ collapsed = false, onClick }) {
  const u = usePlanUsage();
  if (!u) return null;
  const tone = TONE[u.tone];
  const pct = u.appsLimit > 0 ? Math.min(100, (u.appsUsed / u.appsLimit) * 100) : 100;

  if (collapsed) {
    // Ring showing applications left, with the details in the tooltip
    const r = 15;
    const circ = 2 * Math.PI * r;
    return (
      <Link
        to="/billing"
        onClick={onClick}
        title={`${u.planName}: ${appsLeftLabel(u)} · ${u.profilesUsed}/${u.profilesLimit} search profiles`}
        className="relative mx-auto mb-1 grid size-10 place-items-center rounded-xl hover:bg-paper-sunken/80 transition-colors"
      >
        <svg viewBox="0 0 36 36" className="absolute inset-0 size-10 -rotate-90">
          <circle cx="18" cy="18" r={r} fill="none" strokeWidth="2.5" className="stroke-line" />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (pct / 100)}
            className={cn('transition-[stroke-dashoffset] duration-700', tone.ring)}
          />
        </svg>
        <span className={cn('text-[11px] font-semibold tabular-nums', tone.text)}>{u.expired ? '!' : u.appsLeft}</span>
      </Link>
    );
  }

  return (
    <Link
      to="/billing"
      onClick={onClick}
      className="mb-2 block rounded-xl border border-line bg-paper-sunken/40 px-3.5 py-3 hover:border-signal/30 hover:bg-paper-sunken/70 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-ink">{u.planName}</span>
        <span className={cn('text-[11px] font-medium', u.expired ? 'text-rust' : 'text-ink-soft')}>
          {u.expired ? 'Upgrade' : 'Manage'}
        </span>
      </div>

      <div className="mt-2.5 flex items-baseline justify-between text-xs">
        <span className="text-ink-soft">Applications</span>
        <span className="tabular-nums text-ink-soft">
          <span className="font-semibold text-ink">{Math.min(u.appsUsed, u.appsLimit)}</span> / {u.appsLimit}
        </span>
      </div>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-paper-sunken">
        <div className={cn('h-full rounded-full transition-[width] duration-700 ease-out', tone.bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className={cn('mt-1.5 text-[11px] font-medium', tone.text)}>{appsLeftLabel(u)}</p>

      <div className="mt-2.5 flex items-baseline justify-between border-t border-line/70 pt-2.5 text-xs">
        <span className="text-ink-soft">Search profiles</span>
        <span
          className={cn('tabular-nums', u.profilesUsed > u.profilesLimit ? 'text-rust font-semibold' : 'text-ink-soft')}
        >
          {u.profilesUsed} / {u.profilesLimit}
        </span>
      </div>
    </Link>
  );
}

// Small chip for the top bar: plan name + applications left.
export function TopbarPlanUsage() {
  const u = usePlanUsage();
  if (!u) return null;
  const tone = TONE[u.tone];

  return (
    <Link
      to="/billing"
      title={`${u.planName}: ${u.appsUsed} of ${u.appsLimit} applications used ${u.period} · ${u.profilesUsed} of ${u.profilesLimit} search profiles`}
      className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-2.5 py-1 text-xs transition-colors hover:bg-paper-sunken"
    >
      <span className={cn('size-1.5 rounded-full', tone.dot)} />
      <span className="hidden font-semibold text-ink md:inline">{u.planName}</span>
      <span className="hidden h-3 w-px bg-line md:inline-block" />
      <span className={cn('font-medium tabular-nums', tone.text)}>{appsLeftLabel(u)}</span>
    </Link>
  );
}
