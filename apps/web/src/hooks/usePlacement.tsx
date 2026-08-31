import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./useAuth";
import { getStats } from "@/lib/userStats";
import type { AuthUser, Band, UserStats } from "@learn-english/shared";

interface PlacementContextValue {
  loading: boolean;
  user: AuthUser | null;
  admin: boolean;
  mustTakeTest: boolean;
  completedPlacement: boolean;
  unlockedBand: Band;
  // The raw stats object this provider already fetches once per session -
  // exposed so consumers that need more than the derived placement fields
  // (e.g. GamesListPage's achievements section) don't have to run their
  // own independent getStats() fetch. A one-time snapshot per session, not
  // a live subscription - it won't reflect an achievement unlocked
  // mid-session (that's the separate, event-based AchievementToast).
  stats: UserStats | null;
  // Called right after PlacementTestPage saves a fresh result, so every
  // already-mounted consumer (RequirePlacement, GamesListPage, every game
  // page) sees the new band immediately - without waiting on a fresh
  // API round-trip, which can be slow on real school wifi and would
  // otherwise make it look like the test was never taken.
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

    // Wait for auth itself to settle before deciding anything. useAuth()'s
    // `user` starts null and flips to the real value asynchronously - since
    // this effect and useAuth()'s own effect belong to the same component,
    // this effect's first run (registered right after useAuth()'s) can fire
    // while `user` is still the stale pre-resolution null, even though the
    // real value is about to land a tick later. Without this guard, that
    // transient null made statsLoading drop to false immediately, and once
    // `user` then resolved to non-null on the next render (with `stats`
    // still unset from that stale run), mustTakeTest briefly computed true
    // and RequirePlacement redirected an already-placed user straight back
    // into the test.
    if (authLoading) return;

    if (!user) {
      setStats(null);
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    getStats()
      .then((s) => {
        if (!cancelled) {
          setStats(s);
          setStatsLoading(false);
        }
      })
      .catch((err) => {
        // Belt-and-suspenders: getStats() itself shouldn't reject, but if
        // it (or anything else) ever does, don't let the loading gate get
        // stuck forever over it - fall back to "no saved placement" and
        // let the redirect-to-test path handle it, same as a timeout.
        console.warn("usePlacement: getStats() failed unexpectedly.", err);
        if (!cancelled) {
          setStats(null);
          setStatsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // Deliberately keyed on user?.id (a stable primitive), not the user
    // object itself - useAuth() constructs a new object on every refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading]);

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
    stats,
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
