import { redirect } from '@tanstack/react-router';
import type { RouterContext } from '../router-context';

type GuardArgs = {
  context: RouterContext;
  location: { pathname: string };
};

// For a route's beforeLoad: a signed-out visitor goes to the login page,
// and comes back here after logging in.
export function requireSignedIn({ context, location }: GuardArgs): void {
  if (!context.auth.user) {
    throw redirect({
      to: '/login',
      search: { redirect: location.pathname },
      replace: true,
    });
  }
}

// For the games: a signed-in student who never took the placement test
// takes it first, then comes back to the game they asked for.
export function requirePlacement({ context, location }: GuardArgs): void {
  if (context.placement.mustTakeTest) {
    throw redirect({
      to: '/placement-test',
      search: { redirect: location.pathname },
      replace: true,
    });
  }
}
