import { isLessonUnlocked, LESSONS } from '@learn-english/english-contract';
import { Button } from '@learn-english/ui/components/ui/button';
import { cn } from '@learn-english/ui/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { TopBar } from '../../../components/top-bar';
import { useAuth } from '../../../context/auth-context';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { useTRPC } from '../../../lib/trpc';

export function LessonsListPage() {
  useDocumentTitle('שיעורי שיחה');
  const { admin } = useAuth();
  const trpc = useTRPC();
  const progress = useQuery(trpc.lessons.getProgress.queryOptions());
  const completed = progress.data?.completed ?? [];

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: '/', label: '🏠 חזרה לדף הבית' }} />
      <main className="mt-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">💬 שיעורי שיחה</h1>
          <p className="text-muted-foreground text-sm">
            בכל שיעור השיחה מתקדמת צעד אחד. כל שיעור נפתח אחרי שמסיימים את
            הקודם.
          </p>
        </header>

        {progress.isPending ? (
          <p className="text-center text-muted-foreground py-8">טוען...</p>
        ) : progress.isError ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-3">טעינת ההתקדמות נכשלה.</p>
            <Button className="h-11" onClick={() => void progress.refetch()}>
              נסו שוב
            </Button>
          </div>
        ) : (
          <ol className="flex flex-col gap-3">
            {LESSONS.map((lesson, index) => {
              const done = completed.includes(lesson.id);
              const open = isLessonUnlocked(lesson.id, completed, admin);
              const card = (
                <>
                  <span className="text-xs font-bold text-primary">
                    שיעור {index + 1}
                    {done && ' · הושלם ✓'}
                    {!open && ' · 🔒 נעול'}
                  </span>
                  <span className="block font-semibold">{lesson.title}</span>
                  <span className="block text-sm text-muted-foreground">
                    {lesson.goal}
                  </span>
                </>
              );
              const shape = 'block border rounded-xl p-4 bg-card';

              return (
                <li key={lesson.id}>
                  {open ? (
                    <Link
                      to="/lessons/$lessonId"
                      params={{ lessonId: lesson.id }}
                      className={cn(shape, 'hover:bg-accent')}
                    >
                      {card}
                    </Link>
                  ) : (
                    <div className={cn(shape, 'opacity-60')}>{card}</div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </main>
    </div>
  );
}
