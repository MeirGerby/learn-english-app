import { type Db, words } from '@learn-english/db';
import { and, eq, isNull } from 'drizzle-orm';

export class WordsService {
  private readonly db: Db;

  constructor({ db }: { db: Db }) {
    this.db = db;
  }

  // Archived words stay in the table for progress history, but leave games.
  listByCategory(category: string) {
    return this.db
      .select({
        id: words.id,
        category: words.category,
        slug: words.slug,
        word: words.word,
        translation: words.translation,
        example: words.example,
      })
      .from(words)
      .where(and(eq(words.category, category), isNull(words.archivedAt)));
  }
}
