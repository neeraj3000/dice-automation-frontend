import { api } from '../../app/api';

export const automationsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getAutomations: b.query({
      query: () => '/automations',
      providesTags: ['Automation'],
    }),
    createAutomation: b.mutation({
      query: (body) => ({ url: '/automations', method: 'POST', body }),
      invalidatesTags: ['Automation'],
    }),
    updateAutomation: b.mutation({
      query: ({ id, ...body }) => ({ url: `/automations/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Automation'],
    }),
    deleteAutomation: b.mutation({
      query: (id) => ({ url: `/automations/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Automation'],
    }),
    startAutomation: b.mutation({
      query: (id) => ({ url: `/automations/${id}/start`, method: 'POST' }),
      // Show the new run straight away instead of waiting for the next poll
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(automationsApi.util.upsertQueryData('getActiveAutomationRun', undefined, data));
        } catch {
          // Error is surfaced by the caller
        }
      },
      invalidatesTags: ['Automation', 'AutomationHistory'],
    }),
    pauseAutomationRun: b.mutation({
      query: (runId) => ({ url: `/automation-runs/${runId}/pause`, method: 'POST' }),
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(automationsApi.util.upsertQueryData('getActiveAutomationRun', undefined, data));
        } catch {
          // Error is surfaced by the caller
        }
      },
    }),
    resumeAutomationRun: b.mutation({
      query: (runId) => ({ url: `/automation-runs/${runId}/resume`, method: 'POST' }),
      invalidatesTags: ['AutomationRun'],
    }),
    stopAutomationRun: b.mutation({
      query: (runId) => ({ url: `/automation-runs/${runId}/stop`, method: 'POST' }),
      invalidatesTags: ['AutomationRun'],
    }),
    getActiveAutomationRun: b.query({
      query: () => '/automation-runs/active',
      providesTags: ['AutomationRun'],
    }),
    getAutomationRun: b.query({
      query: (id) => `/automation-runs/${id}`,
      providesTags: ['AutomationHistory'],
    }),
    getAutomationRunHistory: b.query({
      query: ({ automationId, limit = 20, skip = 0 } = {}) => ({
        url: '/automation-runs',
        params: { limit, skip, ...(automationId ? { automation_id: automationId } : {}) },
      }),
      providesTags: ['AutomationHistory'],
    }),
  }),
});

export const {
  useGetAutomationsQuery,
  useCreateAutomationMutation,
  useUpdateAutomationMutation,
  useDeleteAutomationMutation,
  useStartAutomationMutation,
  useStopAutomationRunMutation,
  usePauseAutomationRunMutation,
  useResumeAutomationRunMutation,
  useGetActiveAutomationRunQuery,
  useGetAutomationRunQuery,
  useLazyGetAutomationRunQuery,
  useGetAutomationRunHistoryQuery,
} = automationsApi;
