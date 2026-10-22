import { api } from '../../app/api';

export const billingApi = api.injectEndpoints({
  endpoints: (b) => ({
    // Plans and prices come from Stripe via the backend; nothing is hardcoded here.
    getPlans: b.query({
      query: () => '/billing/plans',
      keepUnusedDataFor: 600,
    }),
    getBillingStatus: b.query({
      query: () => '/billing/status',
      providesTags: ['Billing'],
    }),
    getInvoices: b.query({
      query: () => '/billing/invoices',
      providesTags: ['Billing'],
    }),
    createCheckoutSession: b.mutation({
      query: (priceId) => ({ url: '/billing/checkout-session', method: 'POST', body: { price_id: priceId } }),
    }),
    confirmCheckoutSession: b.mutation({
      query: (sessionId) => ({ url: '/billing/checkout-session/confirm', method: 'POST', body: { session_id: sessionId } }),
      invalidatesTags: ['Billing'],
    }),
    createPortalSession: b.mutation({
      query: () => ({ url: '/billing/portal-session', method: 'POST' }),
    }),
    syncSubscription: b.mutation({
      query: () => ({ url: '/billing/sync', method: 'POST' }),
      invalidatesTags: ['Billing'],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetBillingStatusQuery,
  useGetInvoicesQuery,
  useCreateCheckoutSessionMutation,
  useConfirmCheckoutSessionMutation,
  useCreatePortalSessionMutation,
  useSyncSubscriptionMutation,
} = billingApi;
