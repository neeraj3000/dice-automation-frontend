import { api } from '../../app/api';

export const jobsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getJobs: b.query({
      query: (params) => ({ url: '/jobs', params }),
      providesTags: (r) => [{ type: 'Job', id: 'LIST' }, ...(r?.items ?? []).map((j) => ({ type: 'Job', id: j.id }))],
    }),
    matchJob: b.mutation({ query: (id) => ({ url: `/jobs/${id}/match`, method: 'POST' }), invalidatesTags: (_r, _e, id) => [{ type: 'Job', id }] }),
    deleteJob: b.mutation({ query: (id) => ({ url: `/jobs/${id}`, method: 'DELETE' }), invalidatesTags: [{ type: 'Job', id: 'LIST' }, 'Stats'] }),
  }),
});
export const { useGetJobsQuery, useMatchJobMutation, useDeleteJobMutation } = jobsApi;
