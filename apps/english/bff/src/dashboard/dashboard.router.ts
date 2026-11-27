import {
  ProgressSummaryOutput,
  StudentSummaryInput,
  UserListItem,
} from '@learn-english/english-contract';
import { z } from 'zod';
import { adminProcedure, router } from '../trpc.js';

export const dashboardRouter = router({
  listUsers: adminProcedure
    .output(z.array(UserListItem))
    .query(({ ctx }) => ctx.cradle.dashboardService.listUsers()),

  getStudentSummary: adminProcedure
    .input(StudentSummaryInput)
    .output(ProgressSummaryOutput)
    .query(({ input, ctx }) =>
      ctx.cradle.dashboardService.getStudentSummary(input.userId),
    ),
});
