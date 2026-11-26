import { type Db, userStats } from '@learn-english/db';
import {
  ACHIEVEMENTS,
  type Band,
  type RecordAnswerInput,
  type RecordGameCompletedInput,
  type UserStatsOutput,
} from '@learn-english/english-contract';
import { TRPCError } from '@trpc/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { ProgressService } from '../progress/progress.service.js';

type StatsWithUnlocks = { stats: UserStatsOutput; newlyUnlocked: string[] };

type UserStatsRow = typeof userStats.$inferSelect;

const RoundsCompleted = z.record(z.string(), z.number());

function toUserStats(row: UserStatsRow): UserStatsOutput {
  const rounds = RoundsCompleted.safeParse(row.roundsCompleted);

  return {
    totalScore: row.totalScore,
    totalCorrect: row.totalCorrect,
    totalIncorrect: row.totalIncorrect,
    bestStreak: row.bestStreak,
    roundsCompleted: rounds.success ? rounds.data : {},
    achievements: row.achievements,
    placementBand: toBand(row.placementBand),
    placementScore: row.placementScore ?? undefined,
    placementTotalQuestions: row.placementTotalQuestions ?? undefined,
    placementCompletedAt: row.placementCompletedAt?.getTime(),
  };
}

function toBand(value: number | null): Band | undefined {
  return value === 1 || value === 2 || value === 3 ? value : undefined;
}

export class UserStatsService {
  private readonly db: Db;
  private readonly progressService: ProgressService;

  constructor({
    db,
    progressService,
  }: {
    db: Db;
    progressService: ProgressService;
  }) {
    this.db = db;
    this.progressService = progressService;
  }

  async getStats(userId: string): Promise<UserStatsOutput> {
    const [row] = await this.db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (!row) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `User stats for '${userId}' were not found.`,
      });
    }

    return toUserStats(row);
  }

  async recordAnswer(
    userId: string,
    { points = 0, correct, currentStreak = 0, wordId }: RecordAnswerInput,
  ): Promise<StatsWithUnlocks> {
    await this.db
      .update(userStats)
      .set({
        totalScore: sql`${userStats.totalScore} + ${points}`,
        totalCorrect: sql`${userStats.totalCorrect} + ${correct ? 1 : 0}`,
        totalIncorrect: sql`${userStats.totalIncorrect} + ${correct ? 0 : 1}`,
        bestStreak: sql`GREATEST(${userStats.bestStreak}, ${currentStreak})`,
      })
      .where(eq(userStats.userId, userId));

    if (wordId) {
      await this.progressService.recordWordAnswer(userId, wordId, correct);
    }

    return this.withAchievementCheck(userId);
  }

  async recordGameCompleted(
    userId: string,
    { gameKey, ...session }: RecordGameCompletedInput,
  ): Promise<StatsWithUnlocks> {
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

    const { correctCount, totalCount, score } = session;

    if (
      correctCount !== undefined &&
      totalCount !== undefined &&
      score !== undefined
    ) {
      await this.progressService.recordSession(userId, gameKey, {
        category: session.category,
        correctCount,
        totalCount,
        score,
        durationSeconds: session.durationSeconds,
      });
    }

    return this.withAchievementCheck(userId);
  }

  async savePlacementResult(
    userId: string,
    band: Band,
    score: number,
    totalQuestions: number,
  ): Promise<UserStatsOutput> {
    await this.db
      .update(userStats)
      .set({
        placementBand: band,
        placementScore: score,
        placementTotalQuestions: totalQuestions,
        placementCompletedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    return this.getStats(userId);
  }

  // Achievements are checked here, once, on every stats write.
  private async withAchievementCheck(
    userId: string,
  ): Promise<StatsWithUnlocks> {
    const stats = await this.getStats(userId);

    const newlyUnlocked = ACHIEVEMENTS.filter(
      (achievement) =>
        !stats.achievements.includes(achievement.id) &&
        achievement.check(stats),
    ).map((achievement) => achievement.id);

    if (newlyUnlocked.length > 0) {
      const ids = sql`ARRAY[${sql.join(
        newlyUnlocked.map((id) => sql`${id}`),
        sql`, `,
      )}]::text[]`;

      await this.db
        .update(userStats)
        .set({
          achievements: sql`array_cat(${userStats.achievements}, ${ids})`,
        })
        .where(eq(userStats.userId, userId));
    }

    return {
      stats: {
        ...stats,
        achievements: [...stats.achievements, ...newlyUnlocked],
      },
      newlyUnlocked,
    };
  }
}
