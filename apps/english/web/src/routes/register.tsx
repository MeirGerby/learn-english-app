import { createFileRoute } from '@tanstack/react-router';
import { RegisterPage } from '../features/auth/components/register-page';
import { RedirectSearch } from '../lib/redirect-search';

export const Route = createFileRoute('/register')({
  validateSearch: RedirectSearch,
  component: RegisterPage,
});
