import { Injectable } from '@nestjs/common';
import type { Band } from '@learn-english/shared';
import { DashboardRepository } from './dashboard.repository.js';
import { ProgressService } from '../progress/progress.service.js';
import type { StudentListItemOutput } from './dto/dashboard.dto.js';
import type { ProgressSummaryOutput } from '../progress/dto/progress.dto.js';

export class StudentNotFoundError extends Error {
  constructor(public readonly userId: string) {
    super(`Student '${userId}' was not found.`);
    this.name = 'StudentNotFoundError';
  }
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly progressService: ProgressService,
  ) {}

  async listStudents(): Promise<StudentListItemOutput[]> {
    const rows = await this.dashboardRepository.listStudentsWithActivity();
    return rows.map((r) => ({
      id: r.id,
      email: r.email,
      displayName: r.displayName ?? undefined,
      createdAt: r.createdAt.getTime(),
      totalScore: r.totalScore,
      totalCorrect: r.totalCorrect,
      totalIncorrect: r.totalIncorrect,
      bestStreak: r.bestStreak,
      placementBand: (r.placementBand ?? undefined) as Band | undefined,
      lastActiveAt: r.lastActiveAt ? new Date(r.lastActiveAt).getTime() : undefined,
    }));
  }

  // Reuses ProgressService's own self-summary logic - a teacher sees
  // exactly the same shape a student would see about themselves.
  async getStudentSummary(userId: string): Promise<ProgressSummaryOutput> {
    const isStudent = await this.dashboardRepository.isNonAdminUser(userId);
    if (!isStudent) {
      throw new StudentNotFoundError(userId);
    }
    return this.progressService.getSummaryForUser(userId);
  }
}
