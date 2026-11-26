import { createFileRoute } from '@tanstack/react-router';
import { AdminPage } from '../features/admin/components/admin-page';
import { requireSignedIn } from '../lib/guards';

export const Route = createFileRoute('/admin')({
  beforeLoad: requireSignedIn,
  component: AdminPage,
});
