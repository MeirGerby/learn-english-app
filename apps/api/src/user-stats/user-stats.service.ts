import { Injectable } from '@nestjs/common';
import { ACHIEVEMENTS } from '@learn-english/shared';
import type { Band, GameKey, UserStats } from '@learn-english/shared';
import { UserStatsRepository } from './user-stats.repository.js';
import type { StatsWithUnlocksOutput, UserStatsOutput } from './dto/user-stats.dto.js';

export class UserStatsNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`User stats for '${userId}' were not found.`);
    this.name = 'UserStatsNotFoundError';
  }
}

type UserStatsRow = {
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  bestStreak: number;
  roundsCompleted: unknown;
  achievements: string[];
  placementBand: number | null;
  placementScore: number | null;
  placementTotalQuestions: number | null;
  placementCompletedAt: Date | null;
};

function toUserStats(row: UserStatsRow): UserStatsOutput {
  return {
    totalScore: row.totalScore,
    totalCorrect: row.totalCorrect,
    totalIncorrect: row.totalIncorrect,
    bestStreak: row.bestStreak,
    roundsCompleted: (row.roundsCompleted ?? {}) as Record<string, number>,
    achievements: row.achievements ?? [],
    placementBand: (row.placementBand ?? undefined) as Band | undefined,
    placementScore: row.placementScore ?? undefined,
    placementTotalQuestions: row.placementTotalQuestions ?? undefined,
    placementCompletedAt: row.placementCompletedAt?.getTime(),
  };
}

@Injectable()
export class UserStatsService {
  constructor(private readonly userStatsRepository: UserStatsRepository) {}

  async getStats(userId: string): Promise<UserStatsOutput> {
    const row = await this.userStatsRepository.findByUserId(userId);
    if (!row) {
      throw new UserStatsNotFoundError(userId);
    }
    return toUserStats(row);
  }

  private async checkAndApplyAchievements(
    userId: string,
    current: UserStatsOutput,
  ): Promise<string[]> {
    const newlyUnlocked = ACHIEVEMENTS.filter(
      (achievement) =>
        !current.achievements.includes(achievement.id) && achievement.check(current as UserStats),
    ).map((achievement) => achievement.id);

    if (newlyUnlocked.length) {
      await this.userStatsRepository.appendAchievements(userId, newlyUnlocked);
    }

    return newlyUnlocked;
  }

  private async withAchievementCheck(userId: string): Promise<StatsWithUnlocksOutput> {
    const stats = await this.getStats(userId);
    const newlyUnlocked = await this.checkAndApplyAchievements(userId, stats);
    return {
      stats: { ...stats, achievements: [...stats.achievements, ...newlyUnlocked] },
      newlyUnlocked,
    };
  }

  async recordAnswer(
    userId: string,
    points: number,
    correct: boolean,
    currentStreak: number,
  ): Promise<StatsWithUnlocksOutput> {
    await this.userStatsRepository.applyAnswer(userId, points, correct, currentStreak);
    return this.withAchievementCheck(userId);
  }

  async recordGameCompleted(userId: string, gameKey: GameKey): Promise<StatsWithUnlocksOutput> {
    await this.userStatsRepository.incrementRound(userId, gameKey);
    return this.withAchievementCheck(userId);
  }

  async savePlacementResult(
    userId: string,
    band: Band,
    score: number,
    totalQuestions: number,
  ): Promise<UserStatsOutput> {
    await this.userStatsRepository.savePlacement(userId, band, score, totalQuestions);
    return this.getStats(userId);
  }
}
