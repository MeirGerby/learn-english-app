import { serve } from '@hono/node-server';
import type { Project } from '@learn-english/logging';
import type { Hono } from 'hono';

export function serveBff(
  app: Hono,
  project: Project,
  onShutdown: () => Promise<void>,
): void {
  const port = Number(process.env['PORT'] ?? 8080);

  const server = serve({ fetch: app.fetch, port }, (info) => {
    console.log(`[${project}] listening on port ${info.port}`);
  });

  function gracefulShutdown(): void {
    server.close(() => {
      void onShutdown().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  }

  process.on('SIGINT', gracefulShutdown);

  process.on('SIGTERM', gracefulShutdown);
}
