import { createSlice } from '@reduxjs/toolkit';

// Keep a local copy in localStorage for companion browser extension session bridge
const slice = createSlice({
  name: 'auth',
  initialState: { status: 'checking', token: null, user: null },
  reducers: {
    setCredentials: (s, { payload }) => {
      try {
        if (payload?.user) {
          localStorage.setItem('a2h_user', JSON.stringify(payload.user));
        }
        if (payload?.access_token) {
          localStorage.setItem('a2h_token', payload.access_token);
        }
        window.postMessage({ type: 'APPLY2HIRE_AUTH_SYNC', user: payload?.user, token: payload?.access_token }, '*');
      } catch (_) {}
      return { status: 'authenticated', token: payload.access_token, user: payload.user };
    },
    loggedOut: () => {
      try {
        localStorage.removeItem('a2h_user');
        localStorage.removeItem('a2h_token');
        window.postMessage({ type: 'APPLY2HIRE_AUTH_LOGOUT' }, '*');
      } catch (_) {}
      return { status: 'unauthenticated', token: null, user: null };
    },
  },
});
export const { setCredentials, loggedOut } = slice.actions;
export default slice.reducer;
export const selectAuth = (s) => s.auth;
