import { ProgressSummaryOutput } from '@learn-english/english-contract';
import { authedProcedure, router } from '../trpc.js';

// Self-scoped: a user reads only their own progress.
export const progressRouter = router({
  getMySummary: authedProcedure
    .output(ProgressSummaryOutput)
    .query(({ ctx }) =>
      ctx.cradle.progressService.getSummaryForUser(ctx.user.id),
    ),
});
