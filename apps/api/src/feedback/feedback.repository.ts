import { Inject, Injectable } from '@nestjs/common';
import { desc, eq, type Database, feedback, users } from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class FeedbackRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async list() {
    return this.db
      .select({
        id: feedback.id,
        text: feedback.text,
        authorEmail: users.email,
        createdAt: feedback.createdAt,
      })
      .from(feedback)
      .innerJoin(users, eq(feedback.authorId, users.id))
      .orderBy(desc(feedback.createdAt));
  }

  async create(data: { text: string; authorId: string }) {
    const [row] = await this.db.insert(feedback).values(data).returning();
    return row;
  }

  async remove(id: string) {
    await this.db.delete(feedback).where(eq(feedback.id, id));
  }
}
