import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { GameHeader } from "@/components/GameHeader";
import { CategorySelect } from "@/components/CategorySelect";
import { BandBadge } from "@/components/BandBadge";
import { EmptyGameState } from "@/components/EmptyGameState";
import { useGameScore } from "@/hooks/useGameScore";
import { usePlacement } from "@/hooks/usePlacement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { loadWords, getCategoryKeys, getCategoryBand, getCategoryKeysUpToBand, shuffle } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const QUIZ_SESSION_SIZE = 10;
const CATEGORIES = getCategoryKeys();

function buildOptions(current: WordEntry, pool: WordEntry[]): WordEntry[] {
  const wrong = shuffle(pool.filter((w) => w.word !== current.word)).slice(0, 3);
  return shuffle([current, ...wrong]);
}

export default function FlashcardsPage() {
  useDocumentTitle("כרטיסיות וחידון");
  const { score, streak, recordLocal } = useGameScore();
  const { unlockedBand } = usePlacement();
  const unlockedCategories = getCategoryKeysUpToBand(unlockedBand);
  const [category, setCategory] = useState<CategoryKey>("basics");
  const [words, setWords] = useState<WordEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"flashcards" | "quiz">("flashcards");

  const [fcIndex, setFcIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const answeringRef = useRef(false);

  const [quizOrder, setQuizOrder] = useState<WordEntry[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizOptions, setQuizOptions] = useState<WordEntry[]>([]);
  const [answeredOption, setAnsweredOption] = useState<WordEntry | null>(null);
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((data) => {
      if (cancelled) return;
      setWords(data);
      setFcIndex(0);
      setFlipped(false);
      answeringRef.current = false;
      setLoading(false);
      const order = shuffle(data).slice(0, Math.min(QUIZ_SESSION_SIZE, data.length));
      setQuizOrder(order);
      setQuizIndex(0);
      setQuizCorrectCount(0);
      setShowQuizResults(false);
      setAnsweredOption(null);
      if (order.length) setQuizOptions(buildOptions(order[0], data));
    });
    return () => {
      cancelled = true;
    };
  }, [category]);

  const card = words[fcIndex];

  useEffect(() => {
    answeringRef.current = false;
  }, [fcIndex]);

  function nextFlashcard() {
    setFcIndex((i) => (i + 1) % words.length);
    setFlipped(false);
  }

  function prevFlashcard() {
    setFcIndex((i) => (i - 1 + words.length) % words.length);
    setFlipped(false);
  }

  function handleKnown() {
    if (answeringRef.current) return;
    answeringRef.current = true;
    recordLocal(1, true);
    recordAnswer({ points: 1, correct: true, currentStreak: streak + 1 });
    nextFlashcard();
  }

  function handleUnknown() {
    if (answeringRef.current) return;
    answeringRef.current = true;
    recordLocal(0, false);
    recordAnswer({ points: 0, correct: false, currentStreak: 0 });
    nextFlashcard();
  }

  function restartQuiz() {
    const order = shuffle(words).slice(0, Math.min(QUIZ_SESSION_SIZE, words.length));
    setQuizOrder(order);
    setQuizIndex(0);
    setQuizCorrectCount(0);
    setShowQuizResults(false);
    setAnsweredOption(null);
    if (order.length) setQuizOptions(buildOptions(order[0], words));
  }

  function handleQuizAnswer(opt: WordEntry) {
    if (answeredOption) return;
    const current = quizOrder[quizIndex];
    const isCorrect = opt.word === current.word;
    setAnsweredOption(opt);
    recordLocal(10, isCorrect);
    if (isCorrect) setQuizCorrectCount((c) => c + 1);
    recordAnswer({ points: isCorrect ? 10 : 0, correct: isCorrect, currentStreak: isCorrect ? streak + 1 : 0 });
  }

  function nextQuizQuestion() {
    const nextIndex = quizIndex + 1;
    if (nextIndex >= quizOrder.length) {
      setShowQuizResults(true);
      recordGameCompleted("quiz");
      return;
    }
    setQuizIndex(nextIndex);
    setAnsweredOption(null);
    setQuizOptions(buildOptions(quizOrder[nextIndex], words));
  }

  const currentQuizWord = quizOrder[quizIndex];

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/", label: "🏠 חזרה לדף הבית" }} />

      <GameHeader
        title={
          <>
            🗂️ כרטיסיות וחידון <BandBadge band={getCategoryBand(category)} />
          </>
        }
        score={score}
        streak={streak}
      />

      <CategorySelect categories={CATEGORIES} value={category} onChange={setCategory} unlockedCategories={unlockedCategories} />

      {loading ? (
        <p className="text-center text-muted-foreground text-sm">טוען מילים...</p>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <Button
              className="flex-1 h-11"
              variant={mode === "flashcards" ? "default" : "secondary"}
              onClick={() => setMode("flashcards")}
            >
              כרטיסיות
            </Button>
            <Button
              className="flex-1 h-11"
              variant={mode === "quiz" ? "default" : "secondary"}
              onClick={() => setMode("quiz")}
            >
              חידון
            </Button>
          </div>

          {mode === "flashcards" && (card ? (
            <section>
              <div className="[perspective:1200px] mb-3">
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={flipped}
                  className={cn(
                    "relative h-56 rounded-2xl cursor-pointer transition-transform duration-500 shadow-lg [transform-style:preserve-3d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    flipped && "[transform:rotateY(180deg)]"
                  )}
                  onClick={() => setFlipped((f) => !f)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      if (event.key === " ") {
                        event.preventDefault();
                      }
                      setFlipped((f) => !f);
                    }
                  }}
                >
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-6 text-center [backface-visibility:hidden] bg-gradient-to-br from-primary to-indigo-400 text-white">
                    <span className="text-3xl font-bold" dir="ltr" lang="en">{card.word}</span>
                  </div>
                  <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center gap-2 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card border">
                    <span className="text-xl font-semibold">{card.translation}</span>
                    <span className="text-sm text-muted-foreground italic" dir="ltr" lang="en">{card.example}</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-muted-foreground text-sm mb-4">לחצו על הכרטיס כדי להפוך אותו</p>
              <div className="flex items-center justify-between mb-4">
                <Button className="h-11" variant="outline" onClick={prevFlashcard}>
                  הקודם
                </Button>
                <span className="text-muted-foreground text-sm">
                  {fcIndex + 1} מתוך {words.length}
                </span>
                <Button className="h-11" variant="outline" onClick={nextFlashcard}>
                  הבא
                </Button>
              </div>
              <Progress value={(fcIndex / words.length) * 100} className="mt-1.5" />
              <div className="flex gap-2.5">
                <Button
                  className="flex-1 h-11 bg-red-100 text-red-600 hover:bg-red-200"
                  onClick={handleUnknown}
                >
                  עדיין לומד/ת
                </Button>
                <Button
                  className="flex-1 h-11 bg-green-100 text-green-600 hover:bg-green-200"
                  onClick={handleKnown}
                >
                  אני כבר יודע/ת ✓
                </Button>
              </div>
            </section>
          ) : (
            <EmptyGameState />
          ))}

          {mode === "quiz" && !showQuizResults && (currentQuizWord ? (
            <section>
              <div className="mb-5">
                <span className="text-sm text-muted-foreground">
                  שאלה {quizIndex + 1} מתוך {quizOrder.length}
                </span>
                <Progress value={(quizIndex / quizOrder.length) * 100} className="mt-1.5" />
              </div>
              <div className="text-center mb-6">
                <p className="text-muted-foreground mb-1.5">מה המשמעות של המילה?</p>
                <h2 className="text-3xl text-primary font-bold m-0" dir="ltr" lang="en">{currentQuizWord.word}</h2>
              </div>
              <div className="flex flex-col gap-2.5">
                {quizOptions.map((opt) => {
                  const isThisCorrect = opt.word === currentQuizWord.word;
                  const isAnswered = !!answeredOption;
                  return (
                    <button
                      key={opt.word}
                      disabled={isAnswered}
                      onClick={() => handleQuizAnswer(opt)}
                      className={cn(
                        "rounded-lg border px-4 py-3.5 text-start text-sm transition-colors",
                        !isAnswered && "hover:bg-accent cursor-pointer",
                        isAnswered && isThisCorrect && "bg-green-100 border-green-500 text-green-700 font-semibold",
                        isAnswered &&
                          !isThisCorrect &&
                          opt.word === answeredOption?.word &&
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
                  "text-center mt-3.5 font-semibold min-h-6",
                  answeredOption &&
                    (answeredOption.word === currentQuizWord.word ? "text-green-600" : "text-red-600")
                )}
              >
                {answeredOption
                  ? answeredOption.word === currentQuizWord.word
                    ? "נכון! ✓"
                    : `לא נכון. התשובה הנכונה הייתה: "${currentQuizWord.translation}"`
                  : ""}
              </p>
              {answeredOption && (
                <Button className="block mx-auto mt-5" onClick={nextQuizQuestion}>
                  לשאלה הבאה
                </Button>
              )}
            </section>
          ) : (
            <EmptyGameState />
          ))}

          {mode === "quiz" && showQuizResults && (
            <section className="text-center py-10">
              <h2 className="text-primary font-bold text-xl mb-2">סיימתם את החידון! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                ענית נכון על {quizCorrectCount} מתוך {quizOrder.length} שאלות.
              </p>
              <div className="flex gap-2.5 justify-center">
                <Button onClick={restartQuiz}>נסו שוב</Button>
                <Link to="/games">
                  <Button variant="outline">לרשימת המשחקים</Button>
                </Link>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
