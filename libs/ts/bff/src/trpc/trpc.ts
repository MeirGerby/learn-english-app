import { initTRPC, TRPCError } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { AwilixContainer } from 'awilix';
import type { Context as HonoContext } from 'hono';
import { type AuthTokenUser, verifyAuthToken } from '../auth/jwt.js';
import type { BaseCradle } from '../server/container.js';

export type BffContext<C extends BaseCradle = BaseCradle> = {
  cradle: C;
  honoContext: HonoContext;
  user: AuthTokenUser | undefined;
};

const BEARER = 'Bearer ';

// The web is served from another origin (GitHub Pages), so the token comes
// in the Authorization header rather than in a cookie.
export function createTrpcContext<C extends BaseCradle>(
  container: AwilixContainer<C>,
) {
  return (
    _opts: FetchCreateContextFnOptions,
    c: HonoContext,
  ): BffContext<C> => {
    const cradle = container.createScope().cradle;
    const header = c.req.header('authorization');

    const user = header?.startsWith(BEARER)
      ? verifyAuthToken(cradle.config.JWT_SECRET, header.slice(BEARER.length))
      : undefined;

    return { cradle, honoContext: c, user };
  };
}

export function createTrpc<C extends BaseCradle>() {
  const t = initTRPC.context<BffContext<C>>().create({
    errorFormatter: (opts) =>
      opts.error.code === 'INTERNAL_SERVER_ERROR' && opts.error.cause
        ? { ...opts.shape, message: 'Internal server error' }
        : opts.shape,
  });

  const authedProcedure = t.procedure.use(function isAuthed(opts) {
    const { ctx } = opts;

    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated.',
      });
    }

    return opts.next({ ctx: { user: ctx.user } });
  });

  const adminProcedure = authedProcedure.use(function isAdmin(opts) {
    if (!opts.ctx.user.isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required.',
      });
    }

    return opts.next();
  });

  return {
    router: t.router,
    publicProcedure: t.procedure,
    authedProcedure,
    adminProcedure,
  };
}

export type Trpc<C extends BaseCradle> = ReturnType<typeof createTrpc<C>>;
