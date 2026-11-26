import { authRouter } from './auth/auth.router.js';
import { courseContentRouter } from './course-content/course-content.router.js';
import { dashboardRouter } from './dashboard/dashboard.router.js';
import { feedbackRouter } from './feedback/feedback.router.js';
import { materialsRouter } from './materials/materials.router.js';
import { progressRouter } from './progress/progress.router.js';
import { router } from './trpc.js';
import { userStatsRouter } from './user-stats/user-stats.router.js';
import { wordsRouter } from './words/words.router.js';

/**
 * The package entrypoint (`exports` in package.json). apps/english/web imports
 * `AppRouter` from here as a type: the real router, not a generated copy.
 */
export const appRouter = router({
  auth: authRouter,
  words: wordsRouter,
  userStats: userStatsRouter,
  progress: progressRouter,
  dashboard: dashboardRouter,
  courseContent: courseContentRouter,
  feedback: feedbackRouter,
  materials: materialsRouter,
});

export type AppRouter = typeof appRouter;
