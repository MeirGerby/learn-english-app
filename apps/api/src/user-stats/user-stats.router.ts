import { Logger } from '@nestjs/common';
import { Router, Query, Mutation, Input, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { UserStatsService, UserStatsNotFoundError } from './user-stats.service.js';
import { requireUser } from '../common/trpc-guards.js';
import type { AppContextValue } from '../auth/trpc-context.js';
import {
  userStatsOutputSchema,
  statsWithUnlocksOutputSchema,
  recordAnswerInputSchema,
  recordGameCompletedInputSchema,
  savePlacementResultInputSchema,
  type RecordAnswerInput,
  type RecordGameCompletedInput,
  type SavePlacementResultInput,
} from './dto/user-stats.dto.js';

@Router({ alias: 'userStats' })
export class UserStatsRouter {
  private readonly logger = new Logger(UserStatsRouter.name);

  constructor(private readonly userStatsService: UserStatsService) {}

  @Query({
    output: userStatsOutputSchema,
  })
  async getStats(@Ctx() ctx: AppContextValue) {
    const user = requireUser(ctx);
    try {
      return await this.userStatsService.getStats(user.id);
    } catch (error) {
      if (error instanceof UserStatsNotFoundError) {
        throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
      }
      this.logger.error('Failed to fetch user stats', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching stats.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: recordAnswerInputSchema,
    output: statsWithUnlocksOutputSchema,
  })
  async recordAnswer(@Input() data: RecordAnswerInput, @Ctx() ctx: AppContextValue) {
    const user = requireUser(ctx);
    try {
      return await this.userStatsService.recordAnswer(
        user.id,
        data.points ?? 0,
        data.correct,
        data.currentStreak ?? 0,
      );
    } catch (error) {
      this.logger.error('Failed to record answer', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while recording the answer.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: recordGameCompletedInputSchema,
    output: statsWithUnlocksOutputSchema,
  })
  async recordGameCompleted(
    @Input() data: RecordGameCompletedInput,
    @Ctx() ctx: AppContextValue,
  ) {
    const user = requireUser(ctx);
    try {
      return await this.userStatsService.recordGameCompleted(user.id, data.gameKey);
    } catch (error) {
      this.logger.error('Failed to record game completion', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while recording game completion.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: savePlacementResultInputSchema,
    output: userStatsOutputSchema,
  })
  async savePlacementResult(
    @Input() data: SavePlacementResultInput,
    @Ctx() ctx: AppContextValue,
  ) {
    const user = requireUser(ctx);
    try {
      return await this.userStatsService.savePlacementResult(
        user.id,
        data.band,
        data.score,
        data.totalQuestions,
      );
    } catch (error) {
      this.logger.error('Failed to save placement result', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while saving the placement result.',
        cause: error,
      });
    }
  }
}
