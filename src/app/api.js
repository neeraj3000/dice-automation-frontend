import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Resume',
    'Job',
    'Application',
    'Settings',
    'Profile',
    'Board',
    'Stats',
    'SearchProfile',
    'ReviewQueue',
    'DiceSession',
    'Health',
  ],
  keepUnusedDataFor: 120,
  refetchOnFocus: true,
  endpoints: () => ({}),
});

