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
      // Transform response to combine with or fallback to local storage
      transformResponse: (response) => {
        const local = getLocalProfiles();
        if (Array.isArray(response) && response.length > 0) {
          return response;
        }
        return local;
      },
    }),
    createSearchProfile: b.mutation({
      query: (body) => ({ url: '/search-profiles', method: 'POST', body }),
      invalidatesTags: ['SearchProfile'],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          saveLocalProfile(data);
        } catch {
          // If backend fails, save locally
          saveLocalProfile({ ...arg, id: `local_${Date.now()}`, created_at: new Date().toISOString() });
        }
      },
    }),
    deleteSearchProfile: b.mutation({
      query: (id) => ({ url: `/search-profiles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['SearchProfile'],
      async onQueryStarted(id, { queryFulfilled }) {
        removeLocalProfile(id);
        try {
          await queryFulfilled;
        } catch {
          // Handled locally
        }
      },
    }),
  }),
});

export const {
  useGetSearchProfilesQuery,
  useCreateSearchProfileMutation,
  useDeleteSearchProfileMutation,
} = searchProfilesApi;
