import { createFileRoute } from '@tanstack/react-router';
import { LessonsListPage } from '../../features/lessons/components/lessons-list-page';
import { requireSignedIn } from '../../lib/guards';

export const Route = createFileRoute('/lessons/')({
  beforeLoad: requireSignedIn,
  component: LessonsListPage,
});
