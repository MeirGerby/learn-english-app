import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "api/router-type";
import { getAuthToken } from "./authToken";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
      headers() {
        const token = getAuthToken();
        return token ? { authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});

// Extracts the tRPC error code (e.g. "UNAUTHORIZED", "CONFLICT") from a
// caught error, for mapping to the existing per-page Hebrew error dictionaries.
export function getTRPCErrorCode(error: unknown): string | null {
  if (error instanceof TRPCClientError) {
    return (error.data as { code?: string } | undefined)?.code ?? null;
  }
  return null;
}
