import { Logger } from '@nestjs/common';
import { Router, Query, Mutation, Input, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { CourseContentService } from './course-content.service.js';
import { requireAdmin, requireUser } from '../common/trpc-guards.js';
import type { AppContextValue } from '../auth/trpc-context.js';
import {
  courseItemListOutputSchema,
  courseItemOutputSchema,
  addCourseItemInputSchema,
  removeCourseItemInputSchema,
  type AddCourseItemInput,
  type RemoveCourseItemInput,
} from './dto/course-content.dto.js';

// list() is any-signed-in-user (matches the old /course route: login-gated
// but not admin-gated to view, per CLAUDE.md rule 15). add/remove are
// admin-only, matching the Firestore security rules they replace.
@Router({ alias: 'courseContent' })
export class CourseContentRouter {
  private readonly logger = new Logger(CourseContentRouter.name);

  constructor(private readonly courseContentService: CourseContentService) {}

  @Query({
    output: courseItemListOutputSchema,
  })
  async list(@Ctx() ctx: AppContextValue) {
    requireUser(ctx);
    try {
      return await this.courseContentService.list();
    } catch (error) {
      this.logger.error('Failed to list course content', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching course content.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: addCourseItemInputSchema,
    output: courseItemOutputSchema,
  })
  async add(@Input() data: AddCourseItemInput, @Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      return await this.courseContentService.add(data);
    } catch (error) {
      this.logger.error('Failed to add course content', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while adding course content.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: removeCourseItemInputSchema,
  })
  async remove(@Input() data: RemoveCourseItemInput, @Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      await this.courseContentService.remove(data.id);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to remove course content', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while removing course content.',
        cause: error,
      });
    }
  }
}
