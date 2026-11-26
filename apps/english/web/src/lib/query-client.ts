import type { AppRouter } from '@learn-english/english-bff';
import { QueryClient } from '@tanstack/react-query';
import { isTRPCClientError } from '@trpc/client';

// A client error (4xx) will not fix itself, so only server errors retry.
function shouldRetry(failureCount: number, error: Error): boolean {
  if (
    isTRPCClientError<AppRouter>(error) &&
    (error.data?.httpStatus ?? 500) < 500
  ) {
    return false;
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: shouldRetry } },
});
