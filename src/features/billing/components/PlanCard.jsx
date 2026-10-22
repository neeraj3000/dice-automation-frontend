import { Check } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { cn } from '../../../lib/cn';
import { applicationAllowance, formatPrice, profileAllowance } from '../billingUtils';

export default function PlanCard({ plan, current, action }) {
  const features = [applicationAllowance(plan), profileAllowance(plan), ...plan.features].filter(Boolean);
  const featured = plan.highlight && !current;

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-card border bg-paper-raised p-6 transition-all duration-300',
        featured
          ? 'border-signal/40 shadow-raised ring-1 ring-signal/20'
          : 'border-line shadow-card hover:-translate-y-0.5 hover:shadow-raised',
        current && 'border-signal ring-1 ring-signal/30',
      )}
    >
      {(current || featured) && (
        <span
          className={cn(
            'absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
            current ? 'bg-signal text-on-signal' : 'bg-ink text-paper',
          )}
        >
          {current ? 'Current plan' : 'Most popular'}
        </span>
      )}

      <h3 className="text-sm font-semibold text-ink">{plan.name}</h3>
      {plan.description && <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{plan.description}</p>}

      <div className="mt-5 flex items-baseline gap-1">
        <span className="font-serif text-4xl font-medium tracking-tight tabular-nums">
          {plan.is_trial ? 'Free' : formatPrice(plan.unit_amount, plan.currency)}
        </span>
        <span className="text-sm text-ink-soft">/ {plan.is_trial ? 'trial' : plan.interval}</span>
      </div>

      {action && <div className="mt-6">{action}</div>}

      <div className="my-6 h-px bg-line" />

      <ul className="flex-1 space-y-3 text-[13px]">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <span className="mt-px grid size-4 shrink-0 place-items-center rounded-full bg-signal-soft text-signal">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            <span className="text-ink">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlanAction({ plan, status, pendingPriceId, onCheckout, onPortal, portalLoading }) {
  const subscribed = status?.source === 'subscription';
  const isCurrent = subscribed ? status.plan?.key === plan.key : plan.is_trial && status?.source === 'trial';

  if (isCurrent) return <Button variant="secondary" className="w-full" disabled>Your current plan</Button>;
  if (plan.is_trial) {
    return <Button variant="secondary" className="w-full" disabled>{subscribed ? 'Trial used' : 'Trial ended'}</Button>;
  }
  if (subscribed) {
    // Plan changes go through the Stripe Customer Portal, which handles proration
    return <Button variant="secondary" className="w-full" loading={portalLoading} onClick={onPortal}>Switch to {plan.name}</Button>;
  }
  return (
    <Button
      variant={plan.highlight ? 'primary' : 'secondary'}
      className="w-full"
      loading={pendingPriceId === plan.price_id}
      disabled={Boolean(pendingPriceId)}
      onClick={() => onCheckout(plan.price_id)}
    >
      Get {plan.name}
    </Button>
  );
}
