import { Inject, Injectable } from '@nestjs/common';
import { eq, sql, type Database, userStats } from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class UserStatsRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  async findByUserId(userId: string) {
    const [row] = await this.db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    return row ?? null;
  }

  async applyAnswer(
    userId: string,
    points: number,
    correct: boolean,
    currentStreak: number,
  ) {
    await this.db
      .update(userStats)
      .set({
        totalScore: sql`${userStats.totalScore} + ${points}`,
        totalCorrect: sql`${userStats.totalCorrect} + ${correct ? 1 : 0}`,
        totalIncorrect: sql`${userStats.totalIncorrect} + ${correct ? 0 : 1}`,
        bestStreak: sql`GREATEST(${userStats.bestStreak}, ${currentStreak})`,
      })
      .where(eq(userStats.userId, userId));
  }

  async incrementRound(userId: string, gameKey: string) {
    await this.db
      .update(userStats)
      .set({
        roundsCompleted: sql`jsonb_set(
          ${userStats.roundsCompleted},
          ARRAY[${gameKey}]::text[],
          (COALESCE((${userStats.roundsCompleted} ->> ${gameKey})::int, 0) + 1)::text::jsonb,
          true
        )`,
      })
      .where(eq(userStats.userId, userId));
  }

  async appendAchievements(userId: string, newIds: string[]) {
    // The Neon driver doesn't accept a plain JS array bound as a single
    // ::text[] parameter (it serializes to a non-Postgres-array-literal
    // string) - build the ARRAY[...] constructor from individually bound
    // elements instead.
    const newIdsArray = sql`ARRAY[${sql.join(
      newIds.map((id) => sql`${id}`),
      sql`, `,
    )}]::text[]`;

    await this.db
      .update(userStats)
      .set({
        achievements: sql`array_cat(${userStats.achievements}, ${newIdsArray})`,
      })
      .where(eq(userStats.userId, userId));
  }

  async savePlacement(
    userId: string,
    band: number,
    score: number,
    totalQuestions: number,
  ) {
    await this.db
      .update(userStats)
      .set({
        placementBand: band,
        placementScore: score,
        placementTotalQuestions: totalQuestions,
        placementCompletedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));
  }
}
