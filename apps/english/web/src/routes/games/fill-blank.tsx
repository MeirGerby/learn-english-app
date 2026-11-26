import { createFileRoute } from '@tanstack/react-router';
import { FillBlankPage } from '../../features/fill-blank/components/fill-blank-page';

export const Route = createFileRoute('/games/fill-blank')({
  component: FillBlankPage,
});
