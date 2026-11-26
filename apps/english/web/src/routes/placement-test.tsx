import { createFileRoute } from '@tanstack/react-router';
import { PlacementTestPage } from '../features/placement/components/placement-test-page';
import { RedirectSearch } from '../lib/redirect-search';

export const Route = createFileRoute('/placement-test')({
  validateSearch: RedirectSearch,
  component: PlacementTestPage,
});
