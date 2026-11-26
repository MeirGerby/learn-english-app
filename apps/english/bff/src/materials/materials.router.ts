import {
  IdInput,
  MaterialOutput,
  SuccessOutput,
  UploadMaterialInput,
} from '@learn-english/english-contract';
import { z } from 'zod';
import { adminProcedure, authedProcedure, router } from '../trpc.js';

export const materialsRouter = router({
  list: authedProcedure
    .output(z.array(MaterialOutput))
    .query(({ ctx }) => ctx.cradle.materialsService.list()),

  upload: adminProcedure
    .input(UploadMaterialInput)
    .output(MaterialOutput)
    .mutation(({ input, ctx }) => ctx.cradle.materialsService.upload(input)),

  remove: adminProcedure
    .input(IdInput)
    .output(SuccessOutput)
    .mutation(async ({ input, ctx }) => {
      await ctx.cradle.materialsService.remove(input.id);

      return { success: true as const };
    }),
});
