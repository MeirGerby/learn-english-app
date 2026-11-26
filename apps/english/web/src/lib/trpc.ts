import type { AppRouter } from '@learn-english/english-bff';
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  splitLink,
  isTRPCClientError,
  type TRPCClient,
  type TRPCLink,
} from '@trpc/client';
import { observable } from '@trpc/server/observable';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { clearAuthToken, getAuthToken } from './auth-token';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// Empty in development: the Vite proxy forwards /trpc to the BFF. A
// production build on GitHub Pages calls the BFF's own origin.
export const API_URL: string = import.meta.env.VITE_API_URL ?? '';

function headers(): Record<string, string> {
  const token = getAuthToken();

  return token ? { authorization: `Bearer ${token}` } : {};
}

// An UNAUTHORIZED answer to a request that carried a token means the token
// expired or is invalid, so the user is signed out. It covers every call,
// including the fire-and-forget writes of a game.
const signOutOnUnauthorized: TRPCLink<AppRouter> =
  () =>
  ({ next, op }) =>
    observable((observer) => {
      const sentToken = getAuthToken();

      return next(op).subscribe({
        next: (value) => observer.next(value),
        error: (error) => {
          // A wrong password at login is also UNAUTHORIZED. The token check
          // keeps a late answer from ending a newer session.
          if (
            error.data?.code === 'UNAUTHORIZED' &&
            op.path !== 'auth.login' &&
            sentToken !== null &&
            getAuthToken() === sentToken
          ) {
            clearAuthToken();
          }
          observer.error(error);
        },
        complete: () => observer.complete(),
      });
    });

export const trpcClient: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: [
    signOutOnUnauthorized,
    // A PDF upload is a large body, so it goes alone instead of in a batch.
    splitLink({
      condition: (op) => op.path === 'materials.upload',
      true: httpLink({ url: `${API_URL}/trpc`, headers }),
      false: httpBatchLink({ url: `${API_URL}/trpc`, headers }),
    }),
  ],
});

// The tRPC error code (for example "UNAUTHORIZED" or "CONFLICT") of a
// caught error, for the per-page Hebrew messages.
export function getTRPCErrorCode(error: unknown): string | null {
  return isTRPCClientError<AppRouter>(error)
    ? (error.data?.code ?? null)
    : null;
}
