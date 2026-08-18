import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getStats } from "@/lib/userStats";
import type { UserStats } from "@/types";

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
    getStats().then((s) => {
      if (!cancelled) {
        setStats(s);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return { stats, loading, loggedIn: !!user };
}
