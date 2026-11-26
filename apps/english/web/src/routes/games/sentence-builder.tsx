import { createFileRoute } from '@tanstack/react-router';
import { SentenceBuilderPage } from '../../features/sentence-builder/components/sentence-builder-page';

export const Route = createFileRoute('/games/sentence-builder')({
  component: SentenceBuilderPage,
});
