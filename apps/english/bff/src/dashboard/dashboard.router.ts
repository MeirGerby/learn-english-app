import {
  ProgressSummaryOutput,
  StudentListItem,
  StudentSummaryInput,
} from '@learn-english/english-contract';
import { z } from 'zod';
import { adminProcedure, router } from '../trpc.js';

export const dashboardRouter = router({
  listStudents: adminProcedure
    .output(z.array(StudentListItem))
    .query(({ ctx }) => ctx.cradle.dashboardService.listStudents()),

  getStudentSummary: adminProcedure
    .input(StudentSummaryInput)
    .output(ProgressSummaryOutput)
    .query(({ input, ctx }) =>
      ctx.cradle.dashboardService.getStudentSummary(input.userId),
    ),
});
