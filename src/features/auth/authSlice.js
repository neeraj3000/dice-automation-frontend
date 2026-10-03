import { createSlice } from '@reduxjs/toolkit';

// token lives in memory only; the refresh token is an httpOnly cookie managed by the API
const slice = createSlice({
  name: 'auth',
  initialState: { status: 'checking', token: null, user: null },
  reducers: {
    setCredentials: (s, { payload }) => ({ status: 'authenticated', token: payload.access_token, user: payload.user }),
    loggedOut: () => ({ status: 'unauthenticated', token: null, user: null }),
  },
});
export const { setCredentials, loggedOut } = slice.actions;
export default slice.reducer;
export const selectAuth = (s) => s.auth;
