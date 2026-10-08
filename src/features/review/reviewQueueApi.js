import { api } from '../../app/api';

export const reviewQueueApi = api.injectEndpoints({
  endpoints: (b) => ({
    getReviewQueue: b.query({
      query: () => '/review-queue',
      providesTags: ['ReviewQueue'],
    }),
    answerReviewQuestion: b.mutation({
      query: ({ questionId, answerText }) => ({
        url: `/review-queue/${questionId}/answer`,
        method: 'POST',
        body: { answer_text: answerText },
      }),
      invalidatesTags: ['ReviewQueue', 'Application', 'Job', 'Stats'],
    }),
  }),
});

export const {
  useGetReviewQueueQuery,
  useAnswerReviewQuestionMutation,
} = reviewQueueApi;
