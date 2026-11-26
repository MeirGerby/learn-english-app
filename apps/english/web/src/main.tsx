import type { AppRouter } from '@learn-english/english-bff';
import { ErrorComponent } from '@learn-english/ui/components/error-component';
import { LoadingSpinner } from '@learn-english/ui/components/loading-spinner';
import { Button } from '@learn-english/ui/components/ui/button';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { StrictMode, useEffect, useState } from 'react';
import * as ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './context/auth-context';
import { PlacementProvider, usePlacement } from './context/placement-context';
import { ThemeProvider } from './context/theme-context';
import { queryClient } from './lib/query-client';
import { TRPCProvider, trpcClient } from './lib/trpc';
import { routeTree } from './routeTree.gen';
import './styles.css';

const trpc = createTRPCOptionsProxy<AppRouter>({
  client: trpcClient,
  queryClient,
});

const router = createRouter({
  routeTree,
  basepath: '/learn-english-app',
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  // Replaced by the real values before the router first renders.
  context: {
    auth: undefined!,
    placement: undefined!,
    queryClient,
    trpc,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function InnerApp() {
  const auth = useAuth();
  const placement = usePlacement();

  // The router first mounts only once the stored token and the placement
  // stats are settled, so a guard never acts on a half-loaded user. Later
  // loads (a sign-in) keep it mounted; the guards rerun when they finish.
  const [ready, setReady] = useState(false);

  const unavailable = auth.unavailable || placement.unavailable;

  useEffect(() => {
    if (!placement.loading && !unavailable) setReady(true);
  }, [placement.loading, unavailable]);

  // Route guards read auth and placement in beforeLoad, so they run again
  // whenever either changes (sign-in, sign-out, a fresh placement band).
  // Before the router mounts there is nothing to rerun, and its context
  // still lacks auth and placement.
  useEffect(() => {
    if (ready) void router.invalidate();
  }, [ready, auth.user, placement.unlockedBand, placement.mustTakeTest]);

  if (!ready && unavailable) {
    return (
      <LoadFailed
        onRetry={auth.unavailable ? auth.retry : placement.retry}
        onSignOut={auth.signOut}
      />
    );
  }

  if (!ready) {
    return (
      <div className="mx-auto min-h-screen max-w-xl px-4 py-6">
        <LoadingSpinner label="טוען..." />
      </div>
    );
  }

  return (
    <RouterProvider
      router={router}
      context={{ auth, placement, queryClient, trpc }}
    />
  );
}

function LoadFailed({
  onRetry,
  onSignOut,
}: {
  onRetry: () => void;
  onSignOut: () => void;
}) {
  return (
    <ErrorComponent
      title="לא הצלחנו לטעון את החשבון"
      message="בדקו את החיבור לאינטרנט ונסו שוב."
    >
      <div className="flex justify-center gap-2.5">
        <Button className="h-11" onClick={onRetry}>
          נסו שוב
        </Button>
        <Button variant="outline" className="h-11" onClick={onSignOut}>
          התנתקות והמשך
        </Button>
      </div>
    </ErrorComponent>
  );
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root is missing from the document');
}

ReactDOM.createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <PlacementProvider>
              <InnerApp />
            </PlacementProvider>
          </AuthProvider>
        </ThemeProvider>
      </TRPCProvider>
    </QueryClientProvider>
  </StrictMode>,
);
