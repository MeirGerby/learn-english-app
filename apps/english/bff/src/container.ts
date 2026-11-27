import {
  type BaseCradle,
  createBaseBffRegistrations,
  createBffContainer,
} from '@learn-english/bff';
import { asClass, type AwilixContainer } from 'awilix';
import { AuthService } from './auth/auth.service.js';
import { EmailService } from './auth/email.service.js';
import { CourseContentService } from './course-content/course-content.service.js';
import { DashboardService } from './dashboard/dashboard.service.js';
import { FeedbackService } from './feedback/feedback.service.js';
import { LessonsService } from './lessons/lessons.service.js';
import { MaterialsService } from './materials/materials.service.js';
import { ProgressService } from './progress/progress.service.js';
import { loadServerEnv, type ServerEnv } from './server-env.js';
import { UserStatsService } from './user-stats/user-stats.service.js';
import { WordsService } from './words/words.service.js';

export interface Cradle extends BaseCradle<ServerEnv> {
  authService: AuthService;
  emailService: EmailService;
  wordsService: WordsService;
  userStatsService: UserStatsService;
  progressService: ProgressService;
  dashboardService: DashboardService;
  courseContentService: CourseContentService;
  feedbackService: FeedbackService;
  materialsService: MaterialsService;
  lessonsService: LessonsService;
}

export function createAppContainer(
  config: ServerEnv = loadServerEnv(),
): AwilixContainer<Cradle> {
  const container = createBffContainer<Cradle>();

  container.register({
    ...createBaseBffRegistrations(config, 'english-bff'),

    authService: asClass(AuthService).singleton(),
    emailService: asClass(EmailService).singleton(),
    wordsService: asClass(WordsService).singleton(),
    userStatsService: asClass(UserStatsService).singleton(),
    progressService: asClass(ProgressService).singleton(),
    dashboardService: asClass(DashboardService).singleton(),
    courseContentService: asClass(CourseContentService).singleton(),
    feedbackService: asClass(FeedbackService).singleton(),
    materialsService: asClass(MaterialsService).singleton(),
    lessonsService: asClass(LessonsService).singleton(),
  });

  return container;
}
