import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { errorMessage } from '../../../lib/format';
import { useCreateCheckoutSessionMutation, useCreatePortalSessionMutation } from '../billingApi';

// Starts Stripe-hosted Checkout or the Customer Portal and sends the browser there.
export function useBillingRedirect() {
  const [createCheckout, checkoutState] = useCreateCheckoutSessionMutation();
  const [createPortal, portalState] = useCreatePortalSessionMutation();

  const go = useCallback(async (request, fallback) => {
    try {
      const { url } = await request.unwrap();
      window.location.assign(url);
    } catch (err) {
      toast.error(errorMessage(err, fallback));
    }
  }, []);

  const startCheckout = useCallback(
    (priceId) => go(createCheckout(priceId), 'Could not start checkout. Please try again.'),
    [go, createCheckout],
  );
  const openPortal = useCallback(
    () => go(createPortal(), 'Could not open billing. Please try again.'),
    [go, createPortal],
  );

  return {
    startCheckout,
    openPortal,
    pendingPriceId: checkoutState.isLoading ? checkoutState.originalArgs : null,
    portalLoading: portalState.isLoading,
  };
}
