import { api } from '../../app/api';

const inv = ['Application', 'Stats'];
export const applicationsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getApplications: b.query({ query: (params) => ({ url: '/applications', params }), providesTags: ['Application'] }),
    startApplication: b.mutation({ query: (body) => ({ url: '/applications', method: 'POST', body }), invalidatesTags: inv }),
    submitApplication: b.mutation({ query: (id) => ({ url: `/applications/${id}/submit`, method: 'POST' }), invalidatesTags: inv }),
    retryApplication: b.mutation({ query: (id) => ({ url: `/applications/${id}/retry`, method: 'POST' }), invalidatesTags: inv }),
    answerApplication: b.mutation({ query: ({ id, answers }) => ({ url: `/applications/${id}/answers`, method: 'POST', body: { answers } }), invalidatesTags: inv }),
  }),
});
export const {
  useGetApplicationsQuery, useStartApplicationMutation, useSubmitApplicationMutation, useRetryApplicationMutation, useAnswerApplicationMutation,
} = applicationsApi;
