import { createFileRoute } from '@tanstack/react-router';
import { WordMatchPage } from '../../features/word-match/components/word-match-page';

export const Route = createFileRoute('/games/word-match')({
  component: WordMatchPage,
});
