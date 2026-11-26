import {
  AddCourseItemInput,
  CourseItemOutput,
  IdInput,
  SuccessOutput,
} from '@learn-english/english-contract';
import { z } from 'zod';
import { adminProcedure, authedProcedure, router } from '../trpc.js';

// Any signed-in user may view the course; only admins change it.
export const courseContentRouter = router({
  list: authedProcedure
    .output(z.array(CourseItemOutput))
    .query(({ ctx }) => ctx.cradle.courseContentService.list()),

  add: adminProcedure
    .input(AddCourseItemInput)
    .output(CourseItemOutput)
    .mutation(({ input, ctx }) => ctx.cradle.courseContentService.add(input)),

  remove: adminProcedure
    .input(IdInput)
    .output(SuccessOutput)
    .mutation(async ({ input, ctx }) => {
      await ctx.cradle.courseContentService.remove(input.id);

      return { success: true as const };
    }),
});
