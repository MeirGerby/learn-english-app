import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { MaterialsRouter } from './materials.router.js';
import { MaterialsController } from './materials.controller.js';
import { MaterialsService } from './materials.service.js';
import { MaterialsRepository } from './materials.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [MaterialsController],
  providers: [MaterialsRouter, MaterialsService, MaterialsRepository],
})
export class MaterialsModule {}
