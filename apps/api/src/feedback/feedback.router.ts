import { Logger } from '@nestjs/common';
import { Router, Query, Mutation, Input, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { FeedbackService } from './feedback.service.js';
import { requireAdmin } from '../common/trpc-guards.js';
import type { AppContextValue } from '../auth/trpc-context.js';
import {
  feedbackListOutputSchema,
  createFeedbackInputSchema,
  removeFeedbackInputSchema,
  type CreateFeedbackInput,
  type RemoveFeedbackInput,
} from './dto/feedback.dto.js';

// The whole feedback log is admin-only (Hodaya's own notes-to-self page,
// not a public suggestion box) - matches AdminPage.tsx's existing
// admin-gated render, see CLAUDE.md's "Structure" section.
@Router({ alias: 'feedback' })
export class FeedbackRouter {
  private readonly logger = new Logger(FeedbackRouter.name);

  constructor(private readonly feedbackService: FeedbackService) {}

  @Query({
    output: feedbackListOutputSchema,
  })
  async list(@Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      return await this.feedbackService.list();
    } catch (error) {
      this.logger.error('Failed to list feedback', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching feedback.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: createFeedbackInputSchema,
  })
  async create(@Input() data: CreateFeedbackInput, @Ctx() ctx: AppContextValue) {
    const user = requireAdmin(ctx);
    try {
      await this.feedbackService.create(user.id, data);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to create feedback', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while saving feedback.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: removeFeedbackInputSchema,
  })
  async remove(@Input() data: RemoveFeedbackInput, @Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      await this.feedbackService.remove(data.id);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to remove feedback', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while removing feedback.',
        cause: error,
      });
    }
  }
}
