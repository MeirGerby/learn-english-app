import { createFileRoute } from '@tanstack/react-router';
import { ListeningPage } from '../../features/listening/components/listening-page';

export const Route = createFileRoute('/games/listening')({
  component: ListeningPage,
});
