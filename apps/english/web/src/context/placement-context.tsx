import type { Band, UserStats } from '@learn-english/english-contract';
import { useQuery } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { useTRPC } from '../lib/trpc';
import { useAuth } from './auth-context';

export type PlacementContextType = {
  loading: boolean;
  mustTakeTest: boolean;
  completedPlacement: boolean;
  unlockedBand: Band;
  // Fetched once per signed-in session. It does not follow achievements
  // unlocked during play; those show as toasts.
  stats: UserStats | null;
  // Called the moment the placement test computes a band, so every screen
  // sees it before the save to the BFF even finishes.
  applyPlacementResult: (band: Band) => void;
};

const PlacementContext = createContext<PlacementContextType | undefined>(
  undefined,
);

export function PlacementProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const { user, admin, loading: authLoading } = useAuth();

  // The band the test just computed. It wins over the stored stats, so a
  // slow save can never look like "test not taken". An anonymous visitor
  // may take the test too; for them this is the only record.
  const [justPlacedBand, setJustPlacedBand] = useState<Band | null>(null);

  useEffect(() => setJustPlacedBand(null), [user?.id]);

  const statsQuery = useQuery(
    trpc.userStats.getStats.queryOptions(undefined, {
      enabled: user !== null,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }),
  );

  // A failed stats read counts as "no saved placement", never as loading
  // forever.
  const stats = user !== null ? (statsQuery.data ?? null) : null;
  const loading = authLoading || (user !== null && statsQuery.isPending);
  const band = justPlacedBand ?? stats?.placementBand;
  const completedPlacement = band !== undefined;

  const value: PlacementContextType = {
    loading,
    stats,
    completedPlacement,
    mustTakeTest: user !== null && !admin && !loading && !completedPlacement,
    unlockedBand: admin ? 3 : (band ?? 1),
    applyPlacementResult: setJustPlacedBand,
  };

  return (
    <PlacementContext.Provider value={value}>
      {children}
    </PlacementContext.Provider>
  );
}

export function usePlacement(): PlacementContextType {
  const context = useContext(PlacementContext);

  if (context === undefined) {
    throw new Error('usePlacement must be used within a PlacementProvider');
  }

  return context;
}
