import { ListWordsInput, WordOutput } from '@learn-english/english-contract';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc.js';

// Public: the word bank is not behind login. Only the band unlocks are,
// and those are enforced in the web.
export const wordsRouter = router({
  listByCategory: publicProcedure
    .input(ListWordsInput)
    .output(z.array(WordOutput))
    .query(({ input, ctx }) =>
      ctx.cradle.wordsService.listByCategory(input.category),
    ),
});
