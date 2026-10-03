import { api } from '../../app/api';

export const boardsApi = api.injectEndpoints({
  endpoints: (b) => ({
    getBoards: b.query({ query: () => '/boards', providesTags: ['Board'] }),
    connectBoard: b.mutation({ query: (key) => ({ url: `/boards/${key}/connect`, method: 'POST' }), invalidatesTags: ['Board'] }),
    verifyBoard: b.mutation({ query: (key) => ({ url: `/boards/${key}/verify`, method: 'POST' }), invalidatesTags: ['Board'] }),
    disconnectBoard: b.mutation({ query: (key) => ({ url: `/boards/${key}/disconnect`, method: 'POST' }), invalidatesTags: ['Board', 'Stats'] }),
    importCookies: b.mutation({ query: ({ key, cookies }) => ({ url: `/boards/${key}/cookies`, method: 'POST', body: cookies }), invalidatesTags: ['Board'] }),
    runSearch: b.mutation({ query: (body) => ({ url: '/search/run', method: 'POST', body }) }),
    getLatestSearch: b.query({ query: () => '/search/latest' }),
    getSearch: b.query({ query: (id) => `/search/${id}` }),
  }),
});
export const {
  useGetBoardsQuery, useConnectBoardMutation, useVerifyBoardMutation, useDisconnectBoardMutation, useImportCookiesMutation,
  useRunSearchMutation, useLazyGetLatestSearchQuery, useGetSearchQuery, useGetLatestSearchQuery,
} = boardsApi;
