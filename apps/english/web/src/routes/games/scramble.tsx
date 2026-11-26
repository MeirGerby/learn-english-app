import { createFileRoute } from '@tanstack/react-router';
import { ScramblePage } from '../../features/scramble/components/scramble-page';

export const Route = createFileRoute('/games/scramble')({
  component: ScramblePage,
});
