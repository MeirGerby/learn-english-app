import { type Db, lessonProgress } from '@learn-english/db';
import {
  isLessonUnlocked,
  type LessonId,
} from '@learn-english/english-contract';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';

export class LessonsService {
  private readonly db: Db;

  constructor({ db }: { db: Db }) {
    this.db = db;
  }

  async getCompleted(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ lessonId: lessonProgress.lessonId })
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));

    return rows.map((row) => row.lessonId);
  }

  // Finishing a lesson twice keeps the first date.
  async complete(
    userId: string,
    lessonId: LessonId,
    isAdmin: boolean,
  ): Promise<string[]> {
    const completed = await this.getCompleted(userId);

    if (!isLessonUnlocked(lessonId, completed, isAdmin)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Finish the previous lesson first.',
      });
    }

    await this.db
      .insert(lessonProgress)
      .values({ userId, lessonId })
      .onConflictDoNothing();

    return this.getCompleted(userId);
  }
}
