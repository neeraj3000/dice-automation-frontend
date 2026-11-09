import { useRef, useState } from 'react';
import { Info, Briefcase, CalendarDays, Calculator, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useGetPlansQuery } from '../billingApi';
import { formatPrice } from '../billingUtils';

function InfoPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 rounded-control border border-line bg-paper-raised px-4 py-3 shadow-card">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-signal-soft text-signal">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </div>
  );
}

// Turns a plan from GET /billing/plans into a table row. Every number comes from the API
// (Stripe product metadata + backend settings); nothing about plans is hardcoded here.
function toRow(plan) {
  const isTrial = Boolean(plan.is_trial);
  return {
    key: plan.key || plan.name,
    name: plan.name,
    tag: isTrial && plan.description ? plan.description.replace(/free /i, '') : null,
    price: isTrial ? 'Free' : formatPrice(plan.unit_amount, plan.currency),
    interval: plan.interval === 'month' ? 'mo' : plan.interval,
    dailyLimit: plan.daily_application_limit,
    totalLimit: plan.total_application_limit,
    monthlyLimit: plan.monthly_application_limit,
    profiles: plan.search_profile_limit,
    highlight: Boolean(plan.highlight),
    isTrial,
  };
}

export default function HowItWorks({ plans: propPlans }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);
  const hasPropPlans = Boolean(propPlans && propPlans.length > 0);
  const { data: fetchedPlans = [], isLoading, isError } = useGetPlansQuery(undefined, { skip: hasPropPlans });

  const plans = hasPropPlans ? propPlans : fetchedPlans;
  const rows = plans.map(toRow);
  const workingDays = plans.find((p) => p.working_days_per_month)?.working_days_per_month;

  return (
    <div className="rounded-card border border-line bg-paper-raised shadow-card overflow-hidden">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition-colors hover:bg-paper-sunken/50"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-signal-soft text-signal">
            <Info className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">How application limits work</p>
            <p className="mt-0.5 text-[13px] text-ink-soft">
              Daily limits, working days & monthly totals explained
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-ink-soft transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Collapsible content */}
      <div
        ref={contentRef}
        className="transition-[max-height,opacity] duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: open ? (contentRef.current?.scrollHeight ? `${contentRef.current.scrollHeight}px` : '1200px') : '0px',
          opacity: open ? 1 : 0,
        }}
      >
        <div className="space-y-6 border-t border-line px-6 py-6">
          {/* Key explanation */}
          <div className="rounded-card border border-signal/20 bg-signal-soft/40 px-5 py-4">
            <p className="text-sm leading-relaxed text-ink-soft">
              Each paid plan has a <strong className="font-medium text-ink">daily limit</strong> on how many job
              applications can be submitted automatically. It resets every day at midnight in your timezone.
              {workingDays != null && (
                <>
                  {' '}Monthly totals assume <strong className="font-medium text-ink">{workingDays} working days
                  per month</strong> (Mon – Fri).
                </>
              )}{' '}
              Unused daily applications <em>do not</em> carry over to the next day.
            </p>
          </div>

          {/* Quick stats pills */}
          <div className="grid gap-3 sm:grid-cols-3">
            <InfoPill
              icon={Briefcase}
              label="Working days / month"
              value={workingDays != null ? `${workingDays} days (Mon–Fri)` : '—'}
            />
            <InfoPill icon={CalendarDays} label="Daily reset" value="Midnight, your local time" />
            <InfoPill
              icon={Calculator}
              label="Monthly total"
              value={workingDays != null ? `Daily limit × ${workingDays} days` : '—'}
            />
          </div>

          {/* Comparison table */}
          {rows.length === 0 ? (
            <p className="rounded-card border border-line px-5 py-4 text-sm text-ink-soft">
              {isLoading ? 'Loading plans…' : isError ? "We couldn't load plans right now. Please try again shortly." : 'No plans available.'}
            </p>
          ) : (
          <div className="overflow-x-auto rounded-card border border-line shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-paper-sunken text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
                  <th className="whitespace-nowrap px-5 py-3.5">Plan</th>
                  <th className="whitespace-nowrap px-5 py-3.5">Price</th>
                  <th className="whitespace-nowrap px-5 py-3.5">Per working day</th>
                  <th className="whitespace-nowrap px-5 py-3.5">
                    Per month{workingDays != null && ` (${workingDays} days)`}
                  </th>
                  <th className="whitespace-nowrap px-5 py-3.5 text-center">Search profiles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((plan) => (
                  <tr
                    key={plan.key || plan.name}
                    className={
                      plan.highlight
                        ? 'bg-signal-soft/30'
                        : 'bg-paper-raised transition-colors hover:bg-paper-sunken/50'
                    }
                  >
                    <td className="whitespace-nowrap px-5 py-3.5 font-medium text-ink">
                      <span className="flex items-center gap-2">
                        {plan.name}
                        {plan.tag && (
                          <span className="rounded-full bg-amber-soft px-2 py-0.5 text-[10px] font-semibold text-amber">
                            {plan.tag}
                          </span>
                        )}
                        {plan.highlight && (
                          <span className="rounded-full bg-signal px-2 py-0.5 text-[10px] font-semibold text-on-signal">
                            Popular
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-ink">
                      {plan.price}
                      {!plan.isTrial && plan.interval && (
                        <span className="text-ink-soft">/{plan.interval}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-ink">
                      {plan.dailyLimit == null ? (
                        <span className="text-ink-soft">—</span>
                      ) : (
                        <>{plan.dailyLimit.toLocaleString()} applications</>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-ink">
                      {plan.isTrial && plan.totalLimit != null ? (
                        <span className="text-ink-soft">
                          {plan.totalLimit.toLocaleString()} applications total
                        </span>
                      ) : plan.monthlyLimit != null ? (
                        <>{plan.monthlyLimit.toLocaleString()} applications</>
                      ) : (
                        <span className="text-ink-soft">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-center tabular-nums text-ink">
                      {plan.profiles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
