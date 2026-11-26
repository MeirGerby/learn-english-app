import { createFileRoute } from '@tanstack/react-router';
import { MaterialsPage } from '../features/materials/components/materials-page';
import { requireSignedIn } from '../lib/guards';

export const Route = createFileRoute('/materials')({
  beforeLoad: requireSignedIn,
  component: MaterialsPage,
});
