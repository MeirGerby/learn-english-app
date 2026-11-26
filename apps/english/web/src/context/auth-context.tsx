import type { AuthUser } from '@learn-english/english-contract';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  clearAuthToken,
  getAuthToken,
  onAuthTokenChanged,
  setAuthToken,
} from '../lib/auth-token';
import { getTRPCErrorCode, useTRPC } from '../lib/trpc';

export type AuthContextType = {
  user: AuthUser | null;
  admin: boolean;
  // True only while a stored token is being checked against the BFF.
  loading: boolean;
  signIn: (token: string, user: AuthUser) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [token, setToken] = useState(getAuthToken);

  // A sign-in or sign-out anywhere drops every cached query, so no stats of
  // the previous user survive.
  useEffect(
    () =>
      onAuthTokenChanged(() => {
        setToken(getAuthToken());
        queryClient.removeQueries();
      }),
    [queryClient],
  );

  const me = useQuery(
    trpc.auth.me.queryOptions(undefined, {
      enabled: token !== null,
      retry: false,
      staleTime: Infinity,
    }),
  );

  // An expired or forged token signs the user out instead of leaving the
  // app waiting on it.
  const unauthorized =
    me.error !== null && getTRPCErrorCode(me.error) === 'UNAUTHORIZED';

  useEffect(() => {
    if (unauthorized) clearAuthToken();
  }, [unauthorized]);

  const user = token !== null ? (me.data ?? null) : null;

  const value: AuthContextType = {
    user,
    admin: user?.isAdmin ?? false,
    loading: token !== null && me.isPending,
    signIn: (newToken, signedInUser) => {
      setAuthToken(newToken);
      queryClient.setQueryData(trpc.auth.me.queryKey(), signedInUser);
    },
    signOut: clearAuthToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
