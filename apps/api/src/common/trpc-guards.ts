import { TRPCError } from '@trpc/server';
import type { AppContextValue } from '../auth/trpc-context.js';

export function requireUser(ctx: AppContextValue) {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Not authenticated.',
    });
  }
  return ctx.user;
}

export function requireAdmin(ctx: AppContextValue) {
  const user = requireUser(ctx);
  if (!user.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required.',
    });
  }
  return user;
}
