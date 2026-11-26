import { createFileRoute } from '@tanstack/react-router';
import { FlashcardsPage } from '../../features/flashcards/components/flashcards-page';

export const Route = createFileRoute('/games/flashcards')({
  component: FlashcardsPage,
});
