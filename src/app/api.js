import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Resume', 'Job', 'Application', 'Settings', 'Board', 'Stats', 'SearchProfile'],
  keepUnusedDataFor: 120,
  refetchOnFocus: true,
  endpoints: () => ({}),
});
