import type { AppRouter } from '@learn-english/english-bff';
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  splitLink,
  isTRPCClientError,
  type TRPCClient,
} from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { getAuthToken } from './auth-token';

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

// Empty in development: the Vite proxy forwards /trpc to the BFF. A
// production build on GitHub Pages calls the BFF's own origin.
export const API_URL: string = import.meta.env.VITE_API_URL ?? '';

function headers(): Record<string, string> {
  const token = getAuthToken();

  return token ? { authorization: `Bearer ${token}` } : {};
}

export const trpcClient: TRPCClient<AppRouter> = createTRPCClient<AppRouter>({
  links: [
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
