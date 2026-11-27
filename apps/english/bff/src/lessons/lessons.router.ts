import {
  CompleteLessonInput,
  LessonProgressOutput,
} from '@learn-english/english-contract';
import { authedProcedure, router } from '../trpc.js';

// Self-scoped: a user reads and writes only their own lesson progress.
export const lessonsRouter = router({
  getProgress: authedProcedure
    .output(LessonProgressOutput)
    .query(async ({ ctx }) => ({
      completed: await ctx.cradle.lessonsService.getCompleted(ctx.user.id),
    })),

  complete: authedProcedure
    .input(CompleteLessonInput)
    .output(LessonProgressOutput)
    .mutation(async ({ input, ctx }) => ({
      completed: await ctx.cradle.lessonsService.complete(
        ctx.user.id,
        input.lessonId,
        ctx.user.isAdmin,
      ),
    })),
});
