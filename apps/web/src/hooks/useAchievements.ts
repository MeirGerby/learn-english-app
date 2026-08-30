import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getStats } from "@/lib/userStats";
import type { UserStats } from "@learn-english/shared";

export function useAchievements() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
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
    // Keyed on user?.uid, not the user object - see usePlacement.tsx for why.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return { stats, loading, loggedIn: !!user };
}
