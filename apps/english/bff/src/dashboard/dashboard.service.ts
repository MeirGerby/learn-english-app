import { type Db, practiceSessions, users, userStats } from '@learn-english/db';
import type {
  ProgressSummaryOutput,
  UserListItem,
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

  // Every account, admins included. The columns are listed one by one, so
  // the password hash cannot slip into the answer.
  async listUsers(): Promise<UserListItem[]> {
    const rows = await this.db
      .select({
        id: users.id,
        email: users.email,
        isAdmin: users.isAdmin,
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
      .leftJoin(userStats, eq(userStats.userId, users.id))
      .leftJoin(practiceSessions, eq(practiceSessions.userId, users.id))
      .groupBy(users.id, userStats.userId)
      .orderBy(users.email);

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      isAdmin: row.isAdmin,
      displayName: row.displayName ?? undefined,
      createdAt: row.createdAt.getTime(),
      totalScore: row.totalScore ?? 0,
      totalCorrect: row.totalCorrect ?? 0,
      totalIncorrect: row.totalIncorrect ?? 0,
      bestStreak: row.bestStreak ?? 0,
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
