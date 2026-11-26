import { trpcServer } from '@hono/trpc-server';
import type { Project } from '@learn-english/logging';
import type { AnyTRPCRouter } from '@trpc/server';
import type { AwilixContainer } from 'awilix';
import { sql } from 'drizzle-orm';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { cors } from 'hono/cors';
import { createTrpcContext } from '../trpc/trpc.js';
import type { BaseCradle } from './container.js';

const NANOSECONDS_PER_MS = 1_000_000;

// Base64 PDF uploads need room: an 8 MB file grows by a third when encoded.
const MAX_BODY_BYTES = 12 * 1024 * 1024;

type BffAppOptions<C extends BaseCradle> = {
  project: Project;
  container: AwilixContainer<C>;
  router: AnyTRPCRouter;
  // Extra non-tRPC routes, for example a file download.
  routes?: (app: Hono) => void;
};

function rootCause(error: Error): Error {
  return error.cause instanceof Error ? rootCause(error.cause) : error;
}

export function createBffApp<C extends BaseCradle>({
  project,
  container,
  router,
  routes,
}: BffAppOptions<C>): Hono {
  const { logger, config } = container.cradle;

  console.log(`[${project}] app initializing (env: ${config.NODE_ENV})`);

  const app = new Hono();

  app.use('*', cors({ origin: config.CORS_ORIGIN }));

  // Registered before the request logger so probe traffic stays out of the logs.
  app.get('/health', (c) => c.text('ok'));

  app.get('/ready', async (c) => {
    try {
      await container.cradle.db.execute(sql`select 1`);

      return c.text('ok');
    } catch {
      return c.text('not ready', 503);
    }
  });

  app.use('*', async (c, next) => {
    const startedAt = Date.now();
    await next();
    logger.info(
      {
        'http.request.method': c.req.method,
        'url.path': c.req.path,
        'http.response.status_code': c.res.status,
        'event.duration': (Date.now() - startedAt) * NANOSECONDS_PER_MS,
      },
      'request',
    );
  });

  routes?.(app);

  app.use(
    '/trpc/*',
    bodyLimit({ maxSize: MAX_BODY_BYTES }),
    trpcServer({
      router,
      createContext: createTrpcContext(container),
      onError: ({ error, path, type }) => {
        if (error.code !== 'INTERNAL_SERVER_ERROR' || !error.cause) return;

        logger.error(
          {
            err: rootCause(error),
            'app.procedure': path,
            'app.procedure_type': type,
          },
          'procedure failed',
        );
      },
    }),
  );

  return app;
}
