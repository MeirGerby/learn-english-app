import { Logger } from '@nestjs/common';
import { Router, Query, Mutation, Input, Ctx } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
import { MaterialsService, InvalidPdfError } from './materials.service.js';
import { requireAdmin, requireUser } from '../common/trpc-guards.js';
import type { AppContextValue } from '../auth/trpc-context.js';
import {
  materialListOutputSchema,
  materialOutputSchema,
  uploadMaterialInputSchema,
  removeMaterialInputSchema,
  type UploadMaterialInput,
  type RemoveMaterialInput,
} from './dto/materials.dto.js';

// list() is any-signed-in-user (matches CoursePage's own gate: login
// required to view, not admin-only). upload/remove are admin-only.
@Router({ alias: 'materials' })
export class MaterialsRouter {
  private readonly logger = new Logger(MaterialsRouter.name);

  constructor(private readonly materialsService: MaterialsService) {}

  @Query({
    output: materialListOutputSchema,
  })
  async list(@Ctx() ctx: AppContextValue) {
    requireUser(ctx);
    try {
      return await this.materialsService.list();
    } catch (error) {
      this.logger.error('Failed to list materials', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while fetching materials.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: uploadMaterialInputSchema,
    output: materialOutputSchema,
  })
  async upload(@Input() data: UploadMaterialInput, @Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      return await this.materialsService.upload(data);
    } catch (error) {
      if (error instanceof InvalidPdfError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.message,
        });
      }
      this.logger.error('Failed to upload material', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while uploading the file.',
        cause: error,
      });
    }
  }

  @Mutation({
    input: removeMaterialInputSchema,
  })
  async remove(@Input() data: RemoveMaterialInput, @Ctx() ctx: AppContextValue) {
    requireAdmin(ctx);
    try {
      await this.materialsService.remove(data.id);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to remove material', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while removing the material.',
        cause: error,
      });
    }
  }
}
