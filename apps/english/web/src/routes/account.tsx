import { createFileRoute } from '@tanstack/react-router';
import { AccountPage } from '../features/account/components/account-page';
import { requireSignedIn } from '../lib/guards';

export const Route = createFileRoute('/account')({
  beforeLoad: requireSignedIn,
  component: AccountPage,
});
