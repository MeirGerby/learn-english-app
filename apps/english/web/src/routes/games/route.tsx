import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requirePlacement } from '../../lib/guards';

// Every game, and the games list, sits behind the placement test.
export const Route = createFileRoute('/games')({
  beforeLoad: requirePlacement,
  component: Outlet,
});
