import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { generatePlacementTest, type PlacementQuestion } from "@/lib/placementTest";
import { savePlacementResult } from "@/lib/userStats";
import { useAuth } from "@/hooks/useAuth";
import { usePlacement } from "@/hooks/usePlacement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { getBandLabel, scoreToBand } from "@learn-english/shared";
import type { Band, WordEntry } from "@learn-english/shared";

interface TestState {
  index: number;
  correctCount: number;
  answered: WordEntry | null;
  done: boolean;
  resultBand: Band | null;
  wasClamped: boolean;
}

const INITIAL_STATE: TestState = {
  index: 0,
  correctCount: 0,
  answered: null,
  done: false,
  resultBand: null,
  wasClamped: false,
};

export default function PlacementTestPage() {
  useDocumentTitle("מבחן מיון רמה");
  const { user, loading: authLoading } = useAuth();
  const { applyPlacementResult, unlockedBand } = usePlacement();
  const navigate = useNavigate();
  const location = useLocation();

  const locationState = location.state as { from?: string } | null;
  const from = typeof locationState?.from === "string" && locationState.from.startsWith("/")
    ? locationState.from
    : "/games";

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [state, setState] = useState<TestState>(INITIAL_STATE);
  const answeringRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    generatePlacementTest().then((qs) => {
      if (cancelled) return;
      setQuestions(qs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = questions[state.index];

  const handleAnswer = (opt: WordEntry) => {
    if (answeringRef.current || !current) return;
    answeringRef.current = true;

    const isCorrect = opt.word === current.word.word;
    const nextCorrect = isCorrect ? state.correctCount + 1 : state.correctCount;

    setState((prev) => ({ ...prev, answered: opt, correctCount: nextCorrect }));

    setTimeout(() => {
      const nextIndex = state.index + 1;

      if (nextIndex >= questions.length) {
        const band = scoreToBand(nextCorrect, questions.length);
        const finalBand = Math.max(band, unlockedBand) as Band;

        setState((prev) => ({
          ...prev,
          done: true,
          resultBand: finalBand,
          wasClamped: finalBand > band,
        }));

        applyPlacementResult(finalBand);
        savePlacementResult(finalBand, nextCorrect, questions.length);
        return;
      }

      setState((prev) => ({
        ...prev,
        index: nextIndex,
        answered: null,
      }));
      answeringRef.current = false;
    }, 700);
  };

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar />
      <h1 className="text-center font-bold text-2xl mb-2">מבחן רמה</h1>
      <p className="text-center text-muted-foreground text-sm mb-6">
        ענו על השאלות כדי שנתאים לכם את רמת המשחקים הנכונה. אפשר לחזור על המבחן בעתיד ולהתקדם.
      </p>

      {!authLoading && !user && !state.done && (
        <p className="text-center text-muted-foreground text-sm mb-6">
          אתם לא מחוברים - התוצאה לא תישמר.{" "}
          <Link to="/login" state={{ from }} className="text-primary hover:underline">
            מומלץ להתחבר
          </Link>{" "}
          לפני שמתחילים.
        </p>
      )}

      {loading ? (
        <p className="text-center text-muted-foreground text-sm">טוען שאלות...</p>
      ) : state.done && state.resultBand ? (
        <ResultsView
          correctCount={state.correctCount}
          totalQuestions={questions.length}
          resultBand={state.resultBand}
          wasClamped={state.wasClamped}
          isLoggedIn={Boolean(user)}
          onNavigate={() => navigate(from)}
        />
      ) : (
        current && (
          <QuestionView
            index={state.index}
            totalQuestions={questions.length}
            current={current}
            answered={state.answered}
            onAnswer={handleAnswer}
          />
        )
      )}
    </div>
  );
}

function ResultsView({
  correctCount,
  totalQuestions,
  resultBand,
  wasClamped,
  isLoggedIn,
  onNavigate,
}: {
  correctCount: number;
  totalQuestions: number;
  resultBand: Band;
  wasClamped: boolean;
  isLoggedIn: boolean;
  onNavigate: () => void;
}) {
  return (
    <section className="text-center py-10">
      <h2 className="text-primary font-bold text-xl mb-2">סיימתם את המבחן! 🎉</h2>
      <p className="text-muted-foreground mb-2">
        ענית נכון על {correctCount} מתוך {totalQuestions} שאלות.
      </p>
      <div className="mb-6">
        <p className="text-lg font-semibold">הרמה שלכם: {getBandLabel(resultBand)}</p>
        {wasClamped && (
          <p className="text-sm text-muted-foreground mt-1">
            הציון הפעם היה נמוך יותר, אך הרמה שלכם לא יורדת - היא נשארת {getBandLabel(resultBand)}.
          </p>
        )}
      </div>
      {!isLoggedIn && (
        <p className="text-sm text-muted-foreground mb-4">
          שימו לב: כדי שהרמה תישמר ותפתח לכם גישה קבועה, יש להתחבר לפני ביצוע המבחן.
        </p>
      )}
      <Button onClick={onNavigate}>למשחקים</Button>
    </section>
  );
}

function QuestionView({
  index,
  totalQuestions,
  current,
  answered,
  onAnswer,
}: {
  index: number;
  totalQuestions: number;
  current: PlacementQuestion;
  answered: WordEntry | null;
  onAnswer: (opt: WordEntry) => void;
}) {
  return (
    <section>
      <div className="mb-5">
        <span className="text-sm text-muted-foreground">
          שאלה {index + 1} מתוך {totalQuestions}
        </span>
        <Progress value={(index / totalQuestions) * 100} className="mt-1.5" />
      </div>

      <div className="text-center mb-6">
        <p className="text-muted-foreground mb-1.5">מה המשמעות של המילה?</p>
        <h2 className="text-3xl text-primary font-bold m-0" dir="ltr" lang="en">
          {current.word.word}
        </h2>
      </div>

      <div className="flex flex-col gap-2.5">
        {current.options.map((opt) => {
          const isThisCorrect = opt.word === current.word.word;
          const isAnswered = Boolean(answered);

          return (
            <button
              key={opt.word}
              disabled={isAnswered}
              onClick={() => onAnswer(opt)}
              className={cn(
                "rounded-lg border px-4 py-3.5 text-start text-sm transition-colors",
                !isAnswered && "hover:bg-accent cursor-pointer",
                isAnswered && isThisCorrect && "bg-green-100 border-green-500 text-green-700 font-semibold",
                isAnswered &&
                  !isThisCorrect &&
                  opt.word === answered?.word &&
                  "bg-red-100 border-red-500 text-red-700 font-semibold"
              )}
            >
              {opt.translation}
            </button>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className={cn(
          "min-h-6 text-center font-semibold mt-3.5",
          answered && (answered.word === current.word.word ? "text-green-600" : "text-red-600")
        )}
      >
        {answered
          ? answered.word === current.word.word
            ? "נכון! ✓"
            : `לא נכון. התשובה הנכונה: "${current.word.translation}"`
          : ""}
      </p>
    </section>
  );
}