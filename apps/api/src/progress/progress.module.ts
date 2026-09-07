import { Module } from '@nestjs/common';
import { ProgressRouter } from './progress.router.js';
import { ProgressService } from './progress.service.js';
import { ProgressRepository } from './progress.repository.js';

@Module({
  providers: [ProgressRouter, ProgressService, ProgressRepository],
  exports: [ProgressService],
})
export class ProgressModule {}
