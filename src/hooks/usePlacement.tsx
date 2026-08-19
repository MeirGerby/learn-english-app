import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { useAuth } from "./useAuth";
import { getStats } from "@/lib/userStats";
import type { Band, UserStats } from "@/types";

interface PlacementContextValue {
  loading: boolean;
  user: User | null;
  admin: boolean;
  mustTakeTest: boolean;
  completedPlacement: boolean;
  unlockedBand: Band;
  // Called right after PlacementTestPage saves a fresh result, so every
  // already-mounted consumer (RequirePlacement, GamesListPage, every game
  // page) sees the new band immediately - without waiting on a fresh
  // Firestore read, which can be slow/time out on real school wifi (rule
  // 12) and would otherwise make it look like the test was never taken.
  applyPlacementResult: (band: Band) => void;
}

const PlacementContext = createContext<PlacementContextValue | null>(null);

// Fetches placement status once per signed-in session and shares it via
// context, instead of every consumer independently calling getStats() on
// its own mount. That per-page refetch pattern was the actual bug: a
// slow/timed-out fetch on any one page (e.g. right after navigating away
// from a freshly-completed test) made it look like the test hadn't been
// taken, bouncing the user back into it.
export function PlacementProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, admin } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [overrideBand, setOverrideBand] = useState<Band | null>(null);

  useEffect(() => {
    let cancelled = false;
    setOverrideBand(null); // never carry a stale override across a login/logout
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
    // Deliberately keyed on user?.uid (a stable primitive), not the user
    // object itself: Firebase's onAuthStateChanged can fire more than once
    // for the same signed-in session with a new User object reference each
    // time. Depending on the object caused this effect to re-run on every
    // such firing, resetting statsLoading back to true before the previous
    // fetch resolved - if firings kept coming, loading never settled and
    // RequirePlacement's "בודק הרשאות..." screen never went away.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const loading = authLoading || (!!user && statsLoading);
  const effectiveBand = overrideBand ?? (stats?.placementBand as Band | undefined);
  const completedPlacement = !!effectiveBand;
  const mustTakeTest = !!user && !admin && !loading && !completedPlacement;
  const unlockedBand: Band = admin ? 3 : (effectiveBand ?? 1);

  const value: PlacementContextValue = {
    loading,
    user,
    admin,
    mustTakeTest,
    completedPlacement,
    unlockedBand,
    applyPlacementResult: (band) => setOverrideBand(band),
  };

  return <PlacementContext.Provider value={value}>{children}</PlacementContext.Provider>;
}

export function usePlacement(): PlacementContextValue {
  const ctx = useContext(PlacementContext);
  if (!ctx) {
    throw new Error("usePlacement() must be used within <PlacementProvider>");
  }
  return ctx;
}
