import { createFileRoute } from '@tanstack/react-router';
import { CoursePage } from '../features/course/components/course-page';
import { requireSignedIn } from '../lib/guards';

export const Route = createFileRoute('/course')({
  beforeLoad: requireSignedIn,
  component: CoursePage,
});
