import { type Db, feedback, users } from '@learn-english/db';
import { desc, eq } from 'drizzle-orm';

export class FeedbackService {
  private readonly db: Db;

  constructor({ db }: { db: Db }) {
    this.db = db;
  }

  async list() {
    const rows = await this.db
      .select({
        id: feedback.id,
        text: feedback.text,
        authorEmail: users.email,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .innerJoin(users, eq(feedback.authorId, users.id))
      .orderBy(desc(feedback.createdAt));

    return rows.map((row) => ({ ...row, createdAt: row.createdAt.getTime() }));
  }

  async create(authorId: string, text: string): Promise<void> {
    await this.db.insert(feedback).values({ text, authorId });
  }

  async remove(id: string): Promise<void> {
    await this.db.delete(feedback).where(eq(feedback.id, id));
  }
}
