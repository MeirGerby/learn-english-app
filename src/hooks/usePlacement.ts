import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { getStats } from "@/lib/userStats";
import type { Band, UserStats } from "@/types";

// Admins always see everything unlocked (they need to review/test all
// content); signed-out visitors default to Band 1 until they log in and
// take the test. Signed-in users who haven't tested yet are handled by
// RequirePlacement, which redirects them before this matters.
export function usePlacement() {
  const { user, loading: authLoading, admin } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setStats(null);
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    getStats().then((s) => {
      if (!cancelled) {
        setStats(s);
        setStatsLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = authLoading || (!!user && statsLoading);
  const completedPlacement = !!stats?.placementBand;
  const mustTakeTest = !!user && !admin && !loading && !completedPlacement;
  const unlockedBand: Band = admin ? 3 : (stats?.placementBand as Band | undefined) ?? 1;

  return { loading, user, admin, mustTakeTest, completedPlacement, unlockedBand };
}
