import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '../features/auth/components/login-page';
import { RedirectSearch } from '../lib/redirect-search';

export const Route = createFileRoute('/login')({
  validateSearch: RedirectSearch,
  component: LoginPage,
});
