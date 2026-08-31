import { Injectable } from '@nestjs/common';
import { WordsRepository } from './words.repository.js';
import type { WordOutput } from './dto/word.dto.js';

@Injectable()
export class WordsService {
  constructor(private readonly wordsRepository: WordsRepository) {}

  async listByCategory(category: string): Promise<WordOutput[]> {
    return this.wordsRepository.findByCategory(category);
  }
}
