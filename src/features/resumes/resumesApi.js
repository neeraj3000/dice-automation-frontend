import { api } from '../../app/api';

export const resumesApi = api.injectEndpoints({
  endpoints: (b) => ({
    getResumes: b.query({ query: () => '/resumes', providesTags: ['Resume'] }),
    uploadResume: b.mutation({
      query: (file) => { const body = new FormData(); body.append('file', file); return { url: '/resumes/upload', method: 'POST', body }; },
      invalidatesTags: ['Resume', 'Stats'],
    }),
    updateResume: b.mutation({ query: ({ id, ...body }) => ({ url: `/resumes/${id}`, method: 'PATCH', body }), invalidatesTags: ['Resume'] }),
    replaceResume: b.mutation({
      query: ({ id, file }) => {
        const body = new FormData();
        body.append('file', file);
        return { url: `/resumes/${id}/replace`, method: 'POST', body };
      },
      invalidatesTags: ['Resume', 'Stats'],
    }),
    reparseResume: b.mutation({
      query: (id) => ({ url: `/resumes/${id}/reparse`, method: 'POST' }),
      invalidatesTags: ['Resume'],
    }),
    setDefaultResume: b.mutation({ query: (id) => ({ url: `/resumes/${id}/set-default`, method: 'POST' }), invalidatesTags: ['Resume'] }),
    deleteResume: b.mutation({ query: (id) => ({ url: `/resumes/${id}`, method: 'DELETE' }), invalidatesTags: ['Resume', 'Stats'] }),
  }),
});
export const {
  useGetResumesQuery,
  useUploadResumeMutation,
  useReplaceResumeMutation,
  useReparseResumeMutation,
  useUpdateResumeMutation,
  useSetDefaultResumeMutation,
  useDeleteResumeMutation,
} = resumesApi;
