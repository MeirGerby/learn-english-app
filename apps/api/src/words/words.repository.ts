import { Inject, Injectable } from '@nestjs/common';
import { eq, type Database, words } from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class WordsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findByCategory(category: string) {
    return this.db.select().from(words).where(eq(words.category, category));
  }
}
