import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  desc,
  eq,
  gte,
  sql,
  type Database,
  userWordProgress,
  practiceSessions,
  words,
} from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class ProgressRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  // One row per (user, word) - insert on first sight, atomically increment
  // in place on every later answer. Matches the SQL-side-increment style
  // already established in UserStatsRepository.
  async upsertWordProgress(userId: string, wordId: string, correct: boolean) {
    await this.db
      .insert(userWordProgress)
      .values({
        userId,
        wordId,
        timesSeen: 1,
        timesCorrect: correct ? 1 : 0,
        lastCorrectAt: correct ? new Date() : null,
      })
      .onConflictDoUpdate({
        target: [userWordProgress.userId, userWordProgress.wordId],
        set: {
          timesSeen: sql`${userWordProgress.timesSeen} + 1`,
          timesCorrect: sql`${userWordProgress.timesCorrect} + ${correct ? 1 : 0}`,
          lastSeenAt: sql`now()`,
          lastCorrectAt: correct ? sql`now()` : userWordProgress.lastCorrectAt,
        },
      });
  }

  async insertSession(data: {
    userId: string;
    game: string;
    category: string | null;
    correctCount: number;
    totalCount: number;
    score: number;
    durationSeconds: number | null;
  }) {
    await this.db.insert(practiceSessions).values(data);
  }

  async countWordsPracticed(userId: string) {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(userWordProgress)
      .where(eq(userWordProgress.userId, userId));
    return row?.count ?? 0;
  }

  // Lowest accuracy first, minimum 3 attempts - a single unlucky miss on a
  // word seen once would otherwise dominate the list.
  async findWeakWords(userId: string, limit: number) {
    return this.db
      .select({
        wordId: userWordProgress.wordId,
        word: words.word,
        translation: words.translation,
        timesSeen: userWordProgress.timesSeen,
        timesCorrect: userWordProgress.timesCorrect,
      })
      .from(userWordProgress)
      .innerJoin(words, eq(words.id, userWordProgress.wordId))
      .where(and(eq(userWordProgress.userId, userId), gte(userWordProgress.timesSeen, 3)))
      .orderBy(sql`${userWordProgress.timesCorrect}::float / ${userWordProgress.timesSeen}`)
      .limit(limit);
  }

  async recentSessions(userId: string, limit: number) {
    return this.db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.userId, userId))
      .orderBy(desc(practiceSessions.completedAt))
      .limit(limit);
  }

  // Daily streaks must be computed in Israel local time, not UTC, or a
  // late-night session lands on the wrong day.
  async distinctPracticeDaysInRange(userId: string, sinceDays: number) {
    const dayExpr = sql<string>`(${practiceSessions.completedAt} AT TIME ZONE 'Asia/Jerusalem')::date`;
    const rows = await this.db
      .selectDistinct({ day: dayExpr })
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.userId, userId),
          gte(practiceSessions.completedAt, sql`now() - ${sinceDays}::int * interval '1 day'`),
        ),
      );
    return rows.length;
  }
}
