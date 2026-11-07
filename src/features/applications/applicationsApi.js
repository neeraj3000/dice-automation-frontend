import { api } from '../../app/api';
import { uiStatus } from './statusMeta';

/** Maps the backend's raw status onto the UI status, keeping the original as raw_status. */
export const normalizeApp = (a) => (a && a.status ? { ...a, raw_status: a.status, status: uiStatus(a.status) } : a);
const normalizeList = (data) => (Array.isArray(data) ? data.map(normalizeApp) : data);

// Invalidate the global list tag + stats/billing on any write mutation.
// Run-scoped cache entries use their own polling interval in RunApplicationsModal.
const inv = [{ type: 'Application', id: 'LIST' }, 'Stats', 'Billing'];

export const applicationsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getApplications: b.query({
      query: (params) => ({ url: '/applications', params }),
      transformResponse: normalizeList,
      // Provide a stable tag per cache key so run-scoped and global queries
      // are invalidated independently. The global (no-params) list gets the
      // generic LIST tag; run-scoped queries additionally get a run-specific
      // tag for future targeted invalidation if needed.
      providesTags: (result, _err, params) => {
        const base = [{ type: 'Application', id: 'LIST' }];
        if (params?.automation_run_id) {
          base.push({ type: 'Application', id: `run-${params.automation_run_id}` });
        }
        return base;
      },
    }),
    getApplication: b.query({
      query: (id) => `/applications/${id}`,
      transformResponse: normalizeApp,
      providesTags: (result, _err, id) => [{ type: 'Application', id }],
    }),
    startApplication: b.mutation({
      query: (body) => ({ url: '/applications', method: 'POST', body }),
      invalidatesTags: inv,
    }),
    submitApplication: b.mutation({
      query: (id) => ({ url: `/applications/${id}/submit`, method: 'POST' }),
      transformResponse: normalizeApp,
      invalidatesTags: inv,
    }),
    retryApplication: b.mutation({
      query: (id) => ({ url: `/applications/${id}/retry`, method: 'POST' }),
      invalidatesTags: inv,
    }),
    stopApplication: b.mutation({
      query: (id) => ({ url: `/applications/${id}/stop`, method: 'POST' }),
      // Optimistically flip the row in the global list; roll back if rejected.
      // Run-scoped modal lists will sync via their polling interval.
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          applicationsApi.util.updateQueryData('getApplications', undefined, (draft) => {
            const app = draft?.find((a) => a.id === id);
            if (app) Object.assign(app, { status: 'CANCELLED', raw_status: 'CANCELLED', message: 'Stopped by user' });
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: [...inv, 'Job'],
    }),
    answerApplication: b.mutation({
      query: ({ id, answers }) => ({ url: `/applications/${id}/answers`, method: 'POST', body: { answers } }),
      transformResponse: normalizeApp,
      invalidatesTags: inv,
    }),
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
    /** Removes unapplied jobs older than the given number of hours (default 72). */
    purgeStaleJobs: b.mutation({
      query: (olderThanHours = 72) => ({
        url: `/jobs/purge-stale?older_than_hours=${olderThanHours}`,
        method: 'DELETE',
      }),
      // Invalidate Job list so the UI reflects the deletions immediately
      invalidatesTags: ['Job'],
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
  usePurgeStaleJobsMutation,
} = applicationsApi;
