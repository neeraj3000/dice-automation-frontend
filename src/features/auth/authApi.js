import { api } from '../../app/api';
import { loggedOut, setCredentials } from './authSlice';

const withCreds = async (_arg, { dispatch, queryFulfilled }) => {
  try { dispatch(setCredentials((await queryFulfilled).data)); } catch { /* handled by caller */ }
};

export const authApi = api.injectEndpoints({
  endpoints: (b) => ({
    login: b.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }), onQueryStarted: withCreds }),
    register: b.mutation({ query: (body) => ({ url: '/auth/register', method: 'POST', body }), onQueryStarted: withCreds }),
    googleLogin: b.mutation({ query: (credential) => ({ url: '/auth/google', method: 'POST', body: { credential } }), onQueryStarted: withCreds }),
    refresh: b.mutation({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      onQueryStarted: async (_a, { dispatch, queryFulfilled }) => {
        try { dispatch(setCredentials((await queryFulfilled).data)); } catch { dispatch(loggedOut()); }
      },
    }),
    logout: b.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      onQueryStarted: async (_a, { dispatch, queryFulfilled }) => {
        try { await queryFulfilled; } catch { /* ignore */ }
        dispatch(loggedOut());
        dispatch(api.util.resetApiState());
      },
    }),
  }),
});
export const { useLoginMutation, useRegisterMutation, useGoogleLoginMutation, useRefreshMutation, useLogoutMutation } = authApi;
