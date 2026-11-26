import {
  CreateFeedbackInput,
  FeedbackOutput,
  IdInput,
  SuccessOutput,
} from '@learn-english/english-contract';
import { z } from 'zod';
import { adminProcedure, router } from '../trpc.js';

// The admin's own notes log, reachable only from the admin page.
export const feedbackRouter = router({
  list: adminProcedure
    .output(z.array(FeedbackOutput))
    .query(({ ctx }) => ctx.cradle.feedbackService.list()),

  create: adminProcedure
    .input(CreateFeedbackInput)
    .output(SuccessOutput)
    .mutation(async ({ input, ctx }) => {
      await ctx.cradle.feedbackService.create(ctx.user.id, input.text);

      return { success: true as const };
    }),

  remove: adminProcedure
    .input(IdInput)
    .output(SuccessOutput)
    .mutation(async ({ input, ctx }) => {
      await ctx.cradle.feedbackService.remove(input.id);

      return { success: true as const };
    }),
});
