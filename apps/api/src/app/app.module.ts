import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TRPCModule } from 'nestjs-trpc';
import { join } from 'node:path';

import { HealthRouter } from './app.router.js';
import { DatabaseModule } from '../database/database.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AppContext } from '../auth/trpc-context.js';
import { WordsModule } from '../words/words.module.js';
import { UserStatsModule } from '../user-stats/user-stats.module.js';
import { CourseContentModule } from '../course-content/course-content.module.js';
import { FeedbackModule } from '../feedback/feedback.module.js';
import { MaterialsModule } from '../materials/materials.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '../../../../.env'),
    }),
    DatabaseModule,
    TRPCModule.forRoot({ context: AppContext }),
    AuthModule,
    WordsModule,
    UserStatsModule,
    CourseContentModule,
    FeedbackModule,
    MaterialsModule,
  ],
  controllers: [HealthRouter],
})
export class AppModule {}
