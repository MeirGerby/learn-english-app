import { useEffect, useState } from "react";
import type { AuthUser } from "@learn-english/shared";
import { trpc, getTRPCErrorCode } from "@/lib/trpc";
import { getAuthToken, clearAuthToken, onAuthTokenChanged } from "@/lib/authToken";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    function refresh() {
      const token = getAuthToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      trpc.auth.me
        .query()
        .then((me) => {
          if (!cancelled) {
            setUser(me);
            setLoading(false);
          }
        })
        .catch((err) => {
          // An invalid/expired token - treat as signed out rather than
          // leaving the loading gate stuck.
          if (getTRPCErrorCode(err) === "UNAUTHORIZED") {
            clearAuthToken();
          }
          if (!cancelled) {
            setUser(null);
            setLoading(false);
          }
        });
    }

    refresh();
    const unsubscribe = onAuthTokenChanged(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { user, loading, admin: user?.isAdmin ?? false };
}
