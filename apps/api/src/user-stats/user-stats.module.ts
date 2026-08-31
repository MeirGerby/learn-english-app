import { Module } from '@nestjs/common';
import { UserStatsRouter } from './user-stats.router.js';
import { UserStatsService } from './user-stats.service.js';
import { UserStatsRepository } from './user-stats.repository.js';

@Module({
  providers: [UserStatsRouter, UserStatsService, UserStatsRepository],
})
export class UserStatsModule {}
