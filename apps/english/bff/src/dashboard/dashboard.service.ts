import { type Db, practiceSessions, users, userStats } from '@learn-english/db';
import type {
  ProgressSummaryOutput,
  StudentListItem,
} from '@learn-english/english-contract';
import { TRPCError } from '@trpc/server';
import { eq, sql } from 'drizzle-orm';
import type { ProgressService } from '../progress/progress.service.js';

export class DashboardService {
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

  async listStudents(): Promise<StudentListItem[]> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        createdAt: users.createdAt,
        totalScore: userStats.totalScore,
        totalCorrect: userStats.totalCorrect,
        totalIncorrect: userStats.totalIncorrect,
        bestStreak: userStats.bestStreak,
        placementBand: userStats.placementBand,
        lastActiveAt: sql<string | null>`max(${practiceSessions.completedAt})`,
      })
      .from(users)
      .innerJoin(userStats, eq(userStats.userId, users.id))
      .leftJoin(practiceSessions, eq(practiceSessions.userId, users.id))
      .where(eq(users.isAdmin, false))
      .groupBy(users.id, userStats.userId)
      .orderBy(users.email);

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      displayName: row.displayName ?? undefined,
      createdAt: row.createdAt.getTime(),
      totalScore: row.totalScore,
      totalCorrect: row.totalCorrect,
      totalIncorrect: row.totalIncorrect,
      bestStreak: row.bestStreak,
      placementBand:
        row.placementBand === 1 ||
        row.placementBand === 2 ||
        row.placementBand === 3
          ? row.placementBand
          : undefined,
      lastActiveAt: row.lastActiveAt
        ? new Date(row.lastActiveAt).getTime()
        : undefined,
    }));
  }

  async getStudentSummary(userId: string): Promise<ProgressSummaryOutput> {
    const [row] = await this.db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!row || row.isAdmin) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Student '${userId}' was not found.`,
      });
    }

    return this.progressService.getSummaryForUser(userId);
  }
}
