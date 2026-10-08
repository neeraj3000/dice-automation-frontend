import { api } from '../../app/api';

export const resumesApi = api.injectEndpoints({
  endpoints: (b) => ({
    getResumes: b.query({
      query: (params) => {
        if (typeof params === 'string') {
          return { url: '/resumes', params: { search: params } };
        }
        return { url: '/resumes', params };
      },
      providesTags: ['Resume'],
    }),
    getResume: b.query({
      query: (id) => `/resumes/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Resume', id }],
    }),
    uploadResume: b.mutation({
      query: (arg) => {
        const body = new FormData();
        if (Array.isArray(arg)) {
          arg.forEach((f) => body.append('files', f));
        } else if (arg instanceof File) {
          body.append('file', arg);
        } else if (arg?.files && Array.isArray(arg.files)) {
          arg.files.forEach((f) => body.append('files', f));
        }
        return { url: '/resumes/upload', method: 'POST', body };
      },
      invalidatesTags: ['Resume', 'Stats'],
    }),
    updateResume: b.mutation({
      query: ({ id, ...body }) => ({
        url: `/resumes/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Resume'],
    }),
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
    setDefaultResume: b.mutation({
      query: (id) => ({ url: `/resumes/${id}/set-default`, method: 'POST' }),
      invalidatesTags: ['Resume'],
    }),
    deleteResume: b.mutation({
      query: (id) => ({ url: `/resumes/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Resume', 'Stats'],
    }),
  }),
});

export const {
  useGetResumesQuery,
  useGetResumeQuery,
  useUploadResumeMutation,
  useReplaceResumeMutation,
  useReparseResumeMutation,
  useUpdateResumeMutation,
  useSetDefaultResumeMutation,
  useDeleteResumeMutation,
} = resumesApi;
