import { ErrorComponent } from '@learn-english/ui/components/error-component';
import { Button } from '@learn-english/ui/components/ui/button';
import { Toaster } from '@learn-english/ui/components/ui/sonner';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { Direction } from 'radix-ui';
import { NotFoundPage } from '../components/not-found-page';
import type { RouterContext } from '../router-context';

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: RootError,
});

function RootLayout() {
  return (
    // Radix reads the direction from context, not from <html dir="rtl">.
    <Direction.Provider dir="rtl">
      <Outlet />
      <Toaster dir="rtl" position="top-center" />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </Direction.Provider>
  );
}

// A render error anywhere lands here instead of a blank page. The button
// reloads, because a soft navigation would keep the broken state.
function RootError() {
  return (
    <ErrorComponent
      icon="😕"
      title="משהו השתבש"
      message="אירעה שגיאה בלתי צפויה. נסו לחזור לדף הבית."
    >
      <Button
        variant="outline"
        onClick={() => {
          window.location.href = import.meta.env.BASE_URL;
        }}
      >
        חזרה לדף הבית
      </Button>
    </ErrorComponent>
  );
}
