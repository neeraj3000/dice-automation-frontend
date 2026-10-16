import { api } from '../../app/api';
import { uiStatus } from './statusMeta';

/** Maps the backend's raw status onto the UI status, keeping the original as raw_status. */
export const normalizeApp = (a) => (a && a.status ? { ...a, raw_status: a.status, status: uiStatus(a.status) } : a);
const normalizeList = (data) => (Array.isArray(data) ? data.map(normalizeApp) : data);

const inv = ['Application', 'Stats'];
export const applicationsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getApplications: b.query({ query: (params) => ({ url: '/applications', params }), transformResponse: normalizeList, providesTags: ['Application'] }),
    getApplication: b.query({ query: (id) => `/applications/${id}`, transformResponse: normalizeApp, providesTags: ['Application'] }),
    startApplication: b.mutation({ query: (body) => ({ url: '/applications', method: 'POST', body }), invalidatesTags: inv }),
    submitApplication: b.mutation({ query: (id) => ({ url: `/applications/${id}/submit`, method: 'POST' }), transformResponse: normalizeApp, invalidatesTags: inv }),
    retryApplication: b.mutation({ query: (id) => ({ url: `/applications/${id}/retry`, method: 'POST' }), invalidatesTags: inv }),
    stopApplication: b.mutation({
      query: (id) => ({ url: `/applications/${id}/stop`, method: 'POST' }),
      // Flip the row to "Stopped" immediately; roll back if the server rejects it.
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(applicationsApi.util.updateQueryData('getApplications', undefined, (draft) => {
          const app = draft?.find((a) => a.id === id);
          if (app) Object.assign(app, { status: 'CANCELLED', raw_status: 'CANCELLED', message: 'Stopped by user' });
        }));
        try { await queryFulfilled; } catch { patch.undo(); }
      },
      invalidatesTags: [...inv, 'Job'],
    }),
    answerApplication: b.mutation({ query: ({ id, answers }) => ({ url: `/applications/${id}/answers`, method: 'POST', body: { answers } }), transformResponse: normalizeApp, invalidatesTags: inv }),
    trackExternalApplication: b.mutation({
      query: (body) => ({ url: '/applications/external', method: 'POST', body }),
      transformResponse: normalizeApp,
      invalidatesTags: inv,
    }),
    updateExternalApplication: b.mutation({
      query: ({ id, ...body }) => ({ url: `/applications/external/${id}`, method: 'PATCH', body }),
      transformResponse: normalizeApp,
      invalidatesTags: inv,
    }),
    getExternalApplicationHistory: b.query({
      query: (id) => `/applications/external/${id}/history`,
      providesTags: (result, error, id) => [{ type: 'Application', id: `${id}-history` }],
    }),
  }),
});
export const {
  useGetApplicationsQuery,
  useLazyGetApplicationQuery,
  useStartApplicationMutation,
  useSubmitApplicationMutation,
  useRetryApplicationMutation,
  useStopApplicationMutation,
  useAnswerApplicationMutation,
  useTrackExternalApplicationMutation,
  useUpdateExternalApplicationMutation,
  useGetExternalApplicationHistoryQuery,
} = applicationsApi;
