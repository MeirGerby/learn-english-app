import { Module } from '@nestjs/common';
import { DashboardRouter } from './dashboard.router.js';
import { DashboardService } from './dashboard.service.js';
import { DashboardRepository } from './dashboard.repository.js';
import { ProgressModule } from '../progress/progress.module.js';

@Module({
  imports: [ProgressModule],
  providers: [DashboardRouter, DashboardService, DashboardRepository],
})
export class DashboardModule {}
