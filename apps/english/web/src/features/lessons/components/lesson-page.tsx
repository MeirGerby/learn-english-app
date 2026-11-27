import {
  isLessonUnlocked,
  LESSONS,
  type Lesson,
} from '@learn-english/english-contract';
import { Button } from '@learn-english/ui/components/ui/button';
import { Progress } from '@learn-english/ui/components/ui/progress';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useEffect, useState, type ReactNode } from 'react';
import { TopBar } from '../../../components/top-bar';
import { useAuth } from '../../../context/auth-context';
import { useDocumentTitle } from '../../../hooks/use-document-title';
import { useTRPC } from '../../../lib/trpc';
import { stopSpeaking } from '../lib/speech';
import { ChooseStep } from './choose-step';
import { DialogueStep } from './dialogue-step';
import { ReplyStep } from './reply-step';
import { SpeakStep } from './speak-step';

const routeApi = getRouteApi('/lessons/$lessonId');

export function LessonPage() {
  const { lessonId } = routeApi.useParams();
  const { admin } = useAuth();
  const trpc = useTRPC();
  const progress = useQuery(trpc.lessons.getProgress.queryOptions());
  const index = LESSONS.findIndex((item) => item.id === lessonId);
  const lesson = LESSONS[index];

  useDocumentTitle(lesson?.title ?? 'שיעור לא נמצא');

  let content: ReactNode;

  if (!lesson) {
    content = <Notice text="השיעור לא נמצא." />;
  } else if (progress.isPending) {
    content = <p className="text-center text-muted-foreground">טוען...</p>;
  } else if (progress.isError) {
    content = (
      <div className="text-center">
        <p className="text-destructive mb-3">טעינת ההתקדמות נכשלה.</p>
        <Button className="h-11" onClick={() => void progress.refetch()}>
          נסו שוב
        </Button>
      </div>
    );
  } else if (!isLessonUnlocked(lesson.id, progress.data.completed, admin)) {
    content = <Notice text="🔒 השיעור ייפתח אחרי שתסיימו את השיעור הקודם." />;
  } else {
    // The key starts the next lesson from its first step.
    content = (
      <LessonSteps key={lesson.id} lesson={lesson} next={LESSONS[index + 1]} />
    );
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: '/lessons', label: 'חזרה לשיעורים' }} />
      <main className="mt-6">
        {lesson && (
          <header className="mb-5">
            <h1 className="text-2xl font-bold mb-1">{lesson.title}</h1>
            <p className="text-muted-foreground text-sm">{lesson.goal}</p>
          </header>
        )}
        {content}
      </main>
    </div>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="text-center py-10">
      <p className="mb-4">{text}</p>
      <Button asChild className="h-11">
        <Link to="/lessons">לרשימת השיעורים</Link>
      </Button>
    </div>
  );
}

// The lesson as a row of screens: the dialogue, then every exercise.
function LessonSteps({
  lesson,
  next,
}: {
  lesson: Lesson;
  next: Lesson | undefined;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [position, setPosition] = useState(0);

  const save = useMutation(
    trpc.lessons.complete.mutationOptions({
      onSuccess: (data) =>
        queryClient.setQueryData(trpc.lessons.getProgress.queryKey(), data),
    }),
  );

  const total =
    1 + lesson.choices.length + lesson.replies.length + lesson.speak.length;

  // Sets the next position rather than adding one, so a double tap on a
  // "continue" button cannot skip a screen.
  const advance = () => {
    stopSpeaking();
    const following = position + 1;
    setPosition(following);
    window.scrollTo(0, 0);
    if (following === total) save.mutate({ lessonId: lesson.id });
  };

  useEffect(() => stopSpeaking, []);

  const choiceAt = position - 1;
  const replyAt = choiceAt - lesson.choices.length;
  const speakAt = replyAt - lesson.replies.length;
  const choice = lesson.choices[choiceAt];
  const reply = lesson.replies[replyAt];
  const line = lesson.speak[speakAt];

  if (position >= total) {
    return (
      <section className="text-center py-8">
        <h2 className="text-primary font-bold text-xl mb-3">
          סיימתם את השיעור! 🎉
        </h2>
        <div aria-live="polite" className="mb-5">
          {save.isPending && <p>שומרים את ההתקדמות...</p>}
          {save.isSuccess && <p>ההתקדמות נשמרה.</p>}
          {save.isError && (
            <>
              <p className="text-destructive mb-3">שמירת ההתקדמות נכשלה.</p>
              <Button
                className="h-11"
                onClick={() => save.mutate({ lessonId: lesson.id })}
              >
                נסו לשמור שוב
              </Button>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {/* The next lesson opens only once this one is saved. */}
          {next && save.isSuccess && (
            <Button asChild className="h-11">
              <Link to="/lessons/$lessonId" params={{ lessonId: next.id }}>
                לשיעור הבא: {next.title}
              </Link>
            </Button>
          )}
          <Button asChild variant="outline" className="h-11">
            <Link to="/lessons">לרשימת השיעורים</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="mb-5">
        <span className="text-sm text-muted-foreground">
          שלב {position + 1} מתוך {total}
        </span>
        <Progress value={(position / total) * 100} className="mt-1.5" />
      </div>
      {position === 0 && <DialogueStep lesson={lesson} onDone={advance} />}
      {choice && (
        <ChooseStep key={position} exercise={choice} onDone={advance} />
      )}
      {reply && <ReplyStep key={position} exercise={reply} onDone={advance} />}
      {line && <SpeakStep key={position} line={line} onDone={advance} />}
    </>
  );
}
