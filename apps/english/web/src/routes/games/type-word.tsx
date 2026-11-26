import { createFileRoute } from '@tanstack/react-router';
import { TypeWordPage } from '../../features/type-word/components/type-word-page';

export const Route = createFileRoute('/games/type-word')({
  component: TypeWordPage,
});
