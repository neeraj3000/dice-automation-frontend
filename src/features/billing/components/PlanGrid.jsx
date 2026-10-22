import { CreditCard } from 'lucide-react';
import { EmptyState, Skeleton } from '../../../components/ui/Misc';
import { cn } from '../../../lib/cn';
import { useGetPlansQuery } from '../billingApi';
import { useBillingRedirect } from '../hooks/useBillingRedirect';
import PlanCard, { PlanAction } from './PlanCard';

export default function PlanGrid({ status }) {
  const { data: plans = [], isLoading, isError } = useGetPlansQuery();
  const redirect = useBillingRedirect();

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-96 rounded-card" />)}
      </div>
    );
  }
  if (isError || !plans.some((p) => !p.is_trial)) {
    return <EmptyState icon={CreditCard} title="Plans unavailable" description="We couldn't load plans right now. Please try again shortly." />;
  }

  // Always show every plan, including the free trial; the current one is marked with a badge
  const visible = plans;
  const isCurrent = (plan) =>
    status?.source === 'subscription' ? status.plan?.key === plan.key : plan.is_trial && status?.source === 'trial';

  return (
    <div className={cn('grid gap-5 pt-3 sm:grid-cols-2', visible.length > 4 ? 'lg:grid-cols-3 xl:grid-cols-5' : 'xl:grid-cols-4')}>
      {visible.map((plan) => (
        <PlanCard
          key={plan.key}
          plan={plan}
          current={isCurrent(plan)}
          action={
            <PlanAction
              plan={plan}
              status={status}
              pendingPriceId={redirect.pendingPriceId}
              onCheckout={redirect.startCheckout}
              onPortal={redirect.openPortal}
              portalLoading={redirect.portalLoading}
            />
          }
        />
      ))}
    </div>
  );
}
