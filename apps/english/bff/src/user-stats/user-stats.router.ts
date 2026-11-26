import {
  RecordAnswerInput,
  RecordGameCompletedInput,
  SavePlacementResultInput,
  StatsWithUnlocksOutput,
  UserStatsOutput,
} from '@learn-english/english-contract';
import { authedProcedure, router } from '../trpc.js';

export const userStatsRouter = router({
  getStats: authedProcedure
    .output(UserStatsOutput)
    .query(({ ctx }) => ctx.cradle.userStatsService.getStats(ctx.user.id)),

  recordAnswer: authedProcedure
    .input(RecordAnswerInput)
    .output(StatsWithUnlocksOutput)
    .mutation(({ input, ctx }) =>
      ctx.cradle.userStatsService.recordAnswer(ctx.user.id, input),
    ),

  recordGameCompleted: authedProcedure
    .input(RecordGameCompletedInput)
    .output(StatsWithUnlocksOutput)
    .mutation(({ input, ctx }) =>
      ctx.cradle.userStatsService.recordGameCompleted(ctx.user.id, input),
    ),

  savePlacementResult: authedProcedure
    .input(SavePlacementResultInput)
    .output(UserStatsOutput)
    .mutation(({ input, ctx }) =>
      ctx.cradle.userStatsService.savePlacementResult(
        ctx.user.id,
        input.band,
        input.score,
        input.totalQuestions,
      ),
    ),
});
