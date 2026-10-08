import { api } from '../../app/api';

const LOCAL_STORAGE_KEY = 'a2h_search_profiles';

export const getLocalProfiles = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveLocalProfile = (profile) => {
  const current = getLocalProfiles();
  const updated = [profile, ...current.filter((p) => p.id !== profile.id)];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const removeLocalProfile = (id) => {
  const current = getLocalProfiles();
  const updated = current.filter((p) => p.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const searchProfilesApi = api.injectEndpoints({
  endpoints: (b) => ({
    getSearchProfiles: b.query({
      query: () => '/search-profiles',
      providesTags: ['SearchProfile'],
      transformResponse: (response) => {
        if (Array.isArray(response) && response.length > 0) {
          return response;
        }
        return getLocalProfiles();
      },
    }),
    getSearchProfile: b.query({
      query: (id) => `/search-profiles/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'SearchProfile', id }],
    }),
    createSearchProfile: b.mutation({
      query: (body) => ({ url: '/search-profiles', method: 'POST', body }),
      invalidatesTags: ['SearchProfile', 'Stats'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          saveLocalProfile(data);
        } catch {
          saveLocalProfile({
            ...arg,
            id: `local_${Date.now()}`,
            created_at: new Date().toISOString(),
          });
        }
      },
    }),
    updateSearchProfile: b.mutation({
      query: ({ id, ...body }) => ({
        url: `/search-profiles/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['SearchProfile'],
      async onQueryStarted({ id, ...body }, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          saveLocalProfile(data);
        } catch {
          saveLocalProfile({ id, ...body, updated_at: new Date().toISOString() });
        }
      },
    }),
    deleteSearchProfile: b.mutation({
      query: (id) => ({ url: `/search-profiles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SearchProfile', 'Stats'],
      async onQueryStarted(id, { queryFulfilled }) {
        removeLocalProfile(id);
        try {
          await queryFulfilled;
        } catch {
          // Handled locally
        }
      },
    }),
    runSearchProfile: b.mutation({
      query: (id) => ({
        url: `/search-profiles/${id}/run`,
        method: 'POST',
      }),
      invalidatesTags: ['Job', 'Stats', 'SearchProfile'],
    }),
  }),
});

export const {
  useGetSearchProfilesQuery,
  useGetSearchProfileQuery,
  useCreateSearchProfileMutation,
  useUpdateSearchProfileMutation,
  useDeleteSearchProfileMutation,
  useRunSearchProfileMutation,
} = searchProfilesApi;
