import { Module } from '@nestjs/common';
import { WordsRouter } from './words.router.js';
import { WordsService } from './words.service.js';
import { WordsRepository } from './words.repository.js';

@Module({
  providers: [WordsRouter, WordsService, WordsRepository],
})
export class WordsModule {}
