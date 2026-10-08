import { api } from '../../app/api';

export const jobsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getJobs: b.query({
      query: (params) => ({ url: '/jobs', params }),
      transformResponse: (res) => {
        if (Array.isArray(res)) {
          return { items: res, total: res.length };
        }
        return res ?? { items: [], total: 0 };
      },
      providesTags: (r) => [
        { type: 'Job', id: 'LIST' },
        ...(r?.items ?? []).map((j) => ({ type: 'Job', id: j.id })),
      ],
    }),
    getJob: b.query({
      query: (id) => `/jobs/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Job', id }],
    }),
    analyzeJob: b.mutation({
      query: (id) => ({ url: `/jobs/${id}/analyze`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Job', id }],
    }),
    matchJob: b.mutation({
      query: (id) => ({ url: `/jobs/${id}/match`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Job', id }],
    }),
    matchDirect: b.mutation({
      query: (body) => ({ url: '/jobs/match-direct', method: 'POST', body }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }, 'Stats'],
    }),
    applyJob: b.mutation({
      query: ({ job_id, resume_id }) => ({
        url: '/applications/apply',
        method: 'POST',
        body: { job_id, resume_id },
      }),
      invalidatesTags: (_r, _e, { job_id }) => [
        { type: 'Job', id: job_id },
        { type: 'Job', id: 'LIST' },
        'Application',
        'Stats',
      ],
    }),
    prepareApplication: b.mutation({
      query: ({ job_id, resume_id, mode = 'PREPARE' }) => ({
        url: '/applications/prepare',
        method: 'POST',
        body: { job_id, resume_id, mode },
      }),
      invalidatesTags: (_r, _e, { job_id }) => [
        { type: 'Job', id: job_id },
        { type: 'Job', id: 'LIST' },
        'Application',
        'Stats',
      ],
    }),
    clearAllJobs: b.mutation({
      query: () => ({ url: '/jobs/clear', method: 'DELETE' }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }, 'Stats'],
    }),
    deleteJob: b.mutation({
      query: (id) => ({ url: `/jobs/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Job', id: 'LIST' }, 'Stats'],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useGetJobQuery,
  useAnalyzeJobMutation,
  useMatchJobMutation,
  useMatchDirectMutation,
  useApplyJobMutation,
  usePrepareApplicationMutation,
  useClearAllJobsMutation,
  useDeleteJobMutation,
} = jobsApi;
