import { api } from '../../app/api';
import { loggedOut, setCredentials } from './authSlice';

const withCreds = async (_arg, { dispatch, queryFulfilled }) => {
  try { dispatch(setCredentials((await queryFulfilled).data)); } catch { /* handled by caller */ }
};

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = RAW_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');

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
      onQueryStarted: async (_a, { dispatch, queryFulfilled, getState }) => {
        try {
          const state = getState();
          const userId = state?.auth?.user?.id || state?.auth?.user?._id || 'default';
          const token = state?.auth?.token;
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          await Promise.allSettled([
            fetch(`${API_BASE_URL}/api/dice/session/disconnect?user_id=${userId}`, { method: 'POST', headers }),
            fetch(`${API_BASE_URL}/settings/disconnect-dice`, { method: 'POST', headers }),
          ]);
        } catch { /* ignore */ }
        try { await queryFulfilled; } catch { /* ignore */ }
        dispatch(loggedOut());
        dispatch(api.util.resetApiState());
      },
    }),
  }),
});
export const { useLoginMutation, useRegisterMutation, useGoogleLoginMutation, useRefreshMutation, useLogoutMutation } = authApi;
