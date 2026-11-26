import { createTrpc } from '@learn-english/bff';
import type { Cradle } from './container.js';

export const trpc = createTrpc<Cradle>();

export const { router, publicProcedure, authedProcedure, adminProcedure } =
  trpc;
