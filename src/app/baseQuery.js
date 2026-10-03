import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { loggedOut, setCredentials } from '../features/auth/authSlice';

const raw = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

let refreshing = null; // single-flight refresh so parallel 401s trigger one refresh

export const baseQueryWithReauth = async (args, api, extra) => {
  let result = await raw(args, api, extra);
  const url = typeof args === 'string' ? args : args.url;
  if (result.error?.status === 401 && !url.startsWith('/auth/')) {
    refreshing ??= Promise.resolve(raw({ url: '/auth/refresh', method: 'POST' }, api, extra)).finally(() => { refreshing = null; });
    const res = await refreshing;
    if (res.data) {
      api.dispatch(setCredentials(res.data));
      result = await raw(args, api, extra);
    } else {
      api.dispatch(loggedOut());
    }
  }
  return result;
};
