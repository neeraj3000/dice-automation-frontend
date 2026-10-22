import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Misc';
import { SUBSCRIPTION_STATUS, daysLeft, formatDate, formatPrice } from '../billingUtils';
import { useBillingRedirect } from '../hooks/useBillingRedirect';
import UsageMeter from './UsageMeter';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

function PlanDetails({ status }) {
  const { source, plan, subscription, trial_ends_at: trialEnds } = status;

  if (source === 'trial') {
    const left = daysLeft(trialEnds);
    return (
      <>
        <Detail label="Price">Free</Detail>
        <Detail label="Trial ends">{formatDate(trialEnds)} · {left} day{left === 1 ? '' : 's'} left</Detail>
      </>
    );
  }
  if (source === 'none') return <p className="text-sm text-ink-soft">Your free trial has ended. Choose a plan to keep applying.</p>;

  const cancelling = subscription?.cancel_at_period_end || subscription?.cancel_at;
  return (
    <>
      <Detail label="Price">
        {formatPrice(plan.unit_amount, plan.currency)}
        <span className="font-normal text-ink-soft"> / {plan.interval}</span>
      </Detail>
      <Detail label={cancelling ? 'Ends on' : 'Renews on'}>
        {formatDate(cancelling ? subscription.cancel_at || subscription.current_period_end : subscription?.current_period_end)}
      </Detail>
    </>
  );
}

export default function CurrentPlanCard({ status, isLoading }) {
  const { openPortal, portalLoading } = useBillingRedirect();

  if (isLoading || !status) return <Skeleton className="h-64 rounded-card" />;

  const { applications, search_profiles: profiles, subscription, source } = status;
  const statusMeta = subscription && SUBSCRIPTION_STATUS[subscription.status];

  return (
    <Card className="overflow-hidden">
      {subscription?.status === 'past_due' && (
        <div className="flex items-center gap-2 border-b border-amber/20 bg-amber-soft px-6 py-3 text-sm text-amber">
          <AlertCircle className="size-4 shrink-0" />
          Your last payment failed. Update your card in Manage billing to keep your plan.
        </div>
      )}
      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col p-6 sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Current plan</p>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h2 className="font-serif text-[2rem] font-medium leading-tight tracking-tight">
              {status.plan?.name || 'No active plan'}
            </h2>
            {source === 'trial' && <Badge tone="signal">Free trial</Badge>}
            {source === 'subscription' && statusMeta && <Badge tone={statusMeta.tone} dot>{statusMeta.label}</Badge>}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-5">
            <PlanDetails status={status} />
          </dl>

          {status.has_billing_account && (
            <div className="mt-auto pt-8">
              <Button variant="secondary" size="sm" icon={ArrowUpRight} loading={portalLoading} onClick={openPortal}>
                Manage billing
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-8 border-t border-line bg-paper/60 p-6 sm:grid-cols-2 sm:p-8 lg:border-l lg:border-t-0">
          <UsageMeter
            label={applications.period === 'day' ? 'Applications today' : 'Applications used'}
            used={applications.used}
            limit={applications.limit}
            hint={
              applications.period === 'day'
                ? `Resets ${new Date(applications.resets_at).toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' })}`
                : applications.period === 'trial' ? 'Across your whole trial' : undefined
            }
          />
          <UsageMeter label="Search profiles" used={profiles.used} limit={profiles.limit} hint="Active job searches" />
        </div>
      </div>
    </Card>
  );
}
