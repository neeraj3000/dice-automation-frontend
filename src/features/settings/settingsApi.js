import { api } from '../../app/api';

export const settingsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getSettings: b.query({
      query: () => '/settings',
      providesTags: ['Settings'],
    }),
    updateSettings: b.mutation({
      query: (body) => ({ url: '/settings', method: 'PUT', body }),
      invalidatesTags: ['Settings'],
    }),
    getProfile: b.query({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
    updateProfile: b.mutation({
      query: (body) => ({ url: '/profile', method: 'PUT', body }),
      invalidatesTags: ['Profile'],
    }),
    getStats: b.query({
      query: () => '/dashboard/stats',
      providesTags: ['Stats'],
    }),
    getHealth: b.query({
      query: () => '/health',
      providesTags: ['Health'],
    }),
    getDiceStatus: b.query({
      query: (params) => ({ url: '/settings/dice-status', params }),
      providesTags: ['DiceSession', 'Board'],
    }),
    getDiceSessionStatus: b.query({
      query: (params) => ({ url: '/api/dice/session/status', params }),
      providesTags: ['DiceSession', 'Board'],
    }),
    openDiceLogin: b.mutation({
      query: () => ({ url: '/settings/open-dice-login', method: 'POST' }),
    }),
    importDiceSession: b.mutation({
      query: (body) => ({ url: '/settings/import-dice-session', method: 'POST', body }),
      invalidatesTags: ['DiceSession', 'Board', 'Stats'],
    }),
    disconnectDice: b.mutation({
      query: (params) => ({ url: '/api/dice/session/disconnect', method: 'POST', params }),
      invalidatesTags: ['DiceSession', 'Board', 'Stats'],
    }),
  }),
});

export const {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetStatsQuery,
  useGetHealthQuery,
  useGetDiceStatusQuery,
  useLazyGetDiceStatusQuery,
  useGetDiceSessionStatusQuery,
  useOpenDiceLoginMutation,
  useImportDiceSessionMutation,
  useDisconnectDiceMutation,
} = settingsApi;
