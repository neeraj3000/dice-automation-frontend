import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/ui/Misc';
import { useConfirmCheckoutSessionMutation, useGetBillingStatusQuery, useSyncSubscriptionMutation } from './billingApi';
import BillingHistory from './components/BillingHistory';
import CurrentPlanCard from './components/CurrentPlanCard';
import PlanGrid from './components/PlanGrid';

// Handles the return from Stripe Checkout: confirms the session right away so the new plan
// shows immediately, even if Stripe's webhook hasn't arrived yet.
function useCheckoutReturn() {
  const [params, setParams] = useSearchParams();
  const [confirm] = useConfirmCheckoutSessionMutation();
  const [sync] = useSyncSubscriptionMutation();
  const handled = useRef(false);

  useEffect(() => {
    const result = params.get('checkout');
    const fromPortal = params.get('portal') === 'return';
    if ((!result && !fromPortal) || handled.current) return;
    handled.current = true;
    const sessionId = params.get('session_id');
    setParams({}, { replace: true });

    // Back from the Customer Portal: pull any plan change straight from Stripe
    if (fromPortal) {
      sync();
      return;
    }
    if (result === 'cancelled') {
      toast('Checkout cancelled. You have not been charged.');
      return;
    }
    if (result === 'success' && sessionId) {
      confirm(sessionId)
        .unwrap()
        .then(() => toast.success('Subscription active. Thanks for upgrading!'))
        .catch(() => toast('Payment received. Your plan will update in a moment.'));
    }
  }, [params, setParams, confirm, sync]);
}

function Section({ title, description, children }) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="font-serif text-2xl font-medium tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function BillingPage() {
  const { data: status, isLoading } = useGetBillingStatusQuery(undefined, { refetchOnMountOrArgChange: true });
  useCheckoutReturn();

  return (
    <div className="mx-auto max-w-6xl space-y-14 pb-10">
      <div>
        <PageHeader title="Plan & Billing" description="Manage your subscription, track usage, and review past payments." />
        <CurrentPlanCard status={status} isLoading={isLoading} />
      </div>

      <Section title="Plans" description="Simple monthly pricing. Upgrade, downgrade, or cancel any time.">
        <PlanGrid status={status} />
        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-ink-soft">
          <ShieldCheck className="size-3.5" />
          Payments are processed securely by Stripe. We never store your card details.
        </p>
      </Section>

      <Section title="Billing history" description="Your invoices and receipts.">
        <BillingHistory />
      </Section>
    </div>
  );
}
