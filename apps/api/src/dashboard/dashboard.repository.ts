import { Inject, Injectable } from '@nestjs/common';
import { eq, sql, type Database, users, userStats, practiceSessions } from '@learn-english/db';
import { DRIZZLE } from '../database/database.module.js';

@Injectable()
export class DashboardRepository {
  constructor(@Inject(DRIZZLE) private readonly db: Database) {}

  // Every non-admin user + their cumulative stats + their most recent
  // completed round (null if they've never played). One query, not a
  // roster query plus a separate per-user activity lookup.
  async listStudentsWithActivity() {
    return this.db
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
        // A raw aggregate expression, not a drizzle-mapped timestamp column
        // - the neon driver returns this as a string, not a Date instance,
        // regardless of this type annotation. Parsed in DashboardService.
        lastActiveAt: sql<string | null>`max(${practiceSessions.completedAt})`,
      })
      .from(users)
      .innerJoin(userStats, eq(userStats.userId, users.id))
      .leftJoin(practiceSessions, eq(practiceSessions.userId, users.id))
      .where(eq(users.isAdmin, false))
      .groupBy(
        users.id,
        users.email,
        users.displayName,
        users.createdAt,
        userStats.totalScore,
        userStats.totalCorrect,
        userStats.totalIncorrect,
        userStats.bestStreak,
        userStats.placementBand,
      )
      .orderBy(users.email);
  }

  // Not a security boundary (an admin already sees everything) - just
  // keeps getStudentSummary honest: only real students should be readable
  // through the student-scoped dashboard endpoint, not another admin.
  async isNonAdminUser(userId: string) {
    const [row] = await this.db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return row ? !row.isAdmin : false;
  }
}
