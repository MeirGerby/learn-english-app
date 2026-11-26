import { createFileRoute } from '@tanstack/react-router';
import { GamesListPage } from '../../features/games-list/components/games-list-page';

export const Route = createFileRoute('/games/')({
  component: GamesListPage,
});
