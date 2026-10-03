import { api } from '../../app/api';

export const settingsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getSettings: b.query({ query: () => '/settings', providesTags: ['Settings'] }),
    updateSettings: b.mutation({ query: (body) => ({ url: '/settings', method: 'PUT', body }), invalidatesTags: ['Settings'] }),
    getStats: b.query({ query: () => '/stats', providesTags: ['Stats'] }),
  }),
});
export const { useGetSettingsQuery, useUpdateSettingsMutation, useGetStatsQuery } = settingsApi;
