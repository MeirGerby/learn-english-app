import { createBffApp } from '@learn-english/bff';
import { createAppContainer } from './container.js';
import { materialsRoutes } from './materials/materials.routes.js';
import { appRouter } from './router.js';

export const container = createAppContainer();

const app = createBffApp({
  project: 'english-bff',
  container,
  router: appRouter,
  routes: materialsRoutes(container),
});

export default app;
