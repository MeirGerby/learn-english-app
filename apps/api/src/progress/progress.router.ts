import { Logger } from '@nestjs/common';
import { Router, Query, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { ProgressService } from './progress.service.js';
import { requireUser } from '../common/trpc-guards.js';
import type { AppContextValue } from '../auth/trpc-context.js';
import { progressSummaryOutputSchema } from './dto/progress.dto.js';

// Self-scoped only - a signed-in user reading their own word/session
// history. Cross-user reads (a teacher viewing a student) live in the
// separate admin-only DashboardRouter, which reuses this same service.
@Router({ alias: 'progress' })
export class ProgressRouter {
  private readonly logger = new Logger(ProgressRouter.name);

  constructor(private readonly progressService: ProgressService) {}

  @Query({
    output: progressSummaryOutputSchema,
  })
  async getMySummary(@Ctx() ctx: AppContextValue) {
    const user = requireUser(ctx);
    try {
      return await this.progressService.getSummaryForUser(user.id);
    } catch (error) {
      this.logger.error('Failed to fetch progress summary', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching your progress.',
        cause: error,
      });
    }
  }
}
