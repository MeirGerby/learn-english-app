import { createFileRoute } from '@tanstack/react-router';
import { SpeedRoundPage } from '../../features/speed-round/components/speed-round-page';

export const Route = createFileRoute('/games/speed-round')({
  component: SpeedRoundPage,
});
