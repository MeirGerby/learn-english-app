import type { AppRouter } from '@learn-english/english-bff';
import type { QueryClient } from '@tanstack/react-query';
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query';
import type { AuthContextType } from './context/auth-context';
import type { PlacementContextType } from './context/placement-context';

export type RouterContext = {
  auth: AuthContextType;
  placement: PlacementContextType;
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<AppRouter>;
};
