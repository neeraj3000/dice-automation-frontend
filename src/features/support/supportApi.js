import { api } from '../../app/api';

export const SUPPORT_EMAIL = 'support@apply2hire.com';

export const supportApi = api.injectEndpoints({
  endpoints: (b) => ({
    contactSupport: b.mutation({
      query: (body) => ({ url: '/support/contact', method: 'POST', body }),
    }),
  }),
});

export const { useContactSupportMutation } = supportApi;
