import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getStats } from "@/lib/userStats";
import type { UserStats } from "@learn-english/shared";

export function useAchievements() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Wait for auth to settle first - see usePlacement.tsx's PlacementProvider
    // effect for why acting on a transient pre-resolution `user` is wrong.
    if (authLoading) return;
    if (!user) {
      setStats(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    getStats()
      .then((s) => {
        if (!cancelled) {
          setStats(s);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("useAchievements: getStats() failed unexpectedly.", err);
        if (!cancelled) {
          setStats(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // Keyed on user?.id, not the user object - see usePlacement.tsx for why.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

  return { stats, loading, loggedIn: !!user };
}
