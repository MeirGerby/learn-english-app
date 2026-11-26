import { verifyAuthToken } from '@learn-english/bff';
import type { AwilixContainer } from 'awilix';
import type { Hono } from 'hono';
import type { Cradle } from '../container.js';

// A plain GET, not tRPC, so the browser can open or embed the PDF directly.
// A navigation cannot send the Authorization header, so the token comes as
// a query parameter.
export function materialsRoutes(container: AwilixContainer<Cradle>) {
  return (app: Hono) => {
    app.get('/materials/:id/file', async (c) => {
      const { config, materialsService } = container.cradle;
      const token = c.req.query('token');

      if (!token || !verifyAuthToken(config.JWT_SECRET, token)) {
        return c.text('Invalid or expired token.', 401);
      }

      const file = await materialsService.findFile(c.req.param('id'));

      if (!file) return c.text('Material not found.', 404);

      return c.body(new Uint8Array(file.buffer), 200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${encodeURIComponent(file.filename)}"`,
        'Content-Length': String(file.buffer.length),
      });
    });
  };
}
