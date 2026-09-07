import { Logger } from '@nestjs/common';
import { Router, Query, Input, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { DashboardService, StudentNotFoundError } from './dashboard.service.js';
import { requireAdmin } from '../common/trpc-guards.js';
import type { AppContextValue } from '../auth/trpc-context.js';
import {
  studentListOutputSchema,
  getStudentSummaryInputSchema,
  type GetStudentSummaryInput,
} from './dto/dashboard.dto.js';
import { progressSummaryOutputSchema } from '../progress/dto/progress.dto.js';

// Admin-only. This is the app's first cross-user read - every procedure
// here MUST call requireAdmin(ctx) before touching another user's data.
@Router({ alias: 'dashboard' })
export class DashboardRouter {
  private readonly logger = new Logger(DashboardRouter.name);

  constructor(private readonly dashboardService: DashboardService) {}

  @Query({
    output: studentListOutputSchema,
  })
  async listStudents(@Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      return await this.dashboardService.listStudents();
    } catch (error) {
      this.logger.error('Failed to list students', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching the student list.',
        cause: error,
      });
    }
  }

  @Query({
    input: getStudentSummaryInputSchema,
    output: progressSummaryOutputSchema,
  })
  async getStudentSummary(@Input() data: GetStudentSummaryInput, @Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      return await this.dashboardService.getStudentSummary(data.userId);
    } catch (error) {
      if (error instanceof StudentNotFoundError) {
        throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
      }
      this.logger.error('Failed to fetch student summary', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching the student summary.',
        cause: error,
      });
    }
  }
}
