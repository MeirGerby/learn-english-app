import { Logger } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { WordsService } from './words.service.js';
import {
  listWordsByCategoryInputSchema,
  wordListOutputSchema,
} from './dto/word.dto.js';

// Public reads, matching the old Firestore "words" collection's public-read
// rule - the word bank isn't gated behind login, only per-game band unlocks
// (enforced client-side, see CLAUDE.md rule 17) are.
@Router({ alias: 'words' })
export class WordsRouter {
  private readonly logger = new Logger(WordsRouter.name);

  constructor(private readonly wordsService: WordsService) {}

  @Query({
    input: listWordsByCategoryInputSchema,
    output: wordListOutputSchema,
  })
  async listByCategory(@Input('category') category: string) {
    try {
      return await this.wordsService.listByCategory(category);
    } catch (error) {
      this.logger.error(`Failed to fetch words for category ${category}`, error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching words.',
        cause: error,
      });
    }
  }
}
