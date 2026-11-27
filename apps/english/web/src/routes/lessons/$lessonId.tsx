import { createFileRoute } from '@tanstack/react-router';
import { LessonPage } from '../../features/lessons/components/lesson-page';
import { requireSignedIn } from '../../lib/guards';

export const Route = createFileRoute('/lessons/$lessonId')({
  beforeLoad: requireSignedIn,
  component: LessonPage,
});
