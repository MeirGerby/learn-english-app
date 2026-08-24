import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { GameHeader } from "@/components/GameHeader";
import { CategorySelect } from "@/components/CategorySelect";
import { EmptyGameState } from "@/components/EmptyGameState";
import { BandBadge } from "@/components/BandBadge";
import { useGameScore } from "@/hooks/useGameScore";
import { usePlacement } from "@/hooks/usePlacement";
import { loadWords, getCategoryKeys, getCategoryBand, getCategoryKeysUpToBand, shuffle } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const ROUND_SIZE = 12;
const TIME_PER_QUESTION_MS = 6000;
const POINTS_PER_CORRECT = 15;
// Speed Round spans every band's categories, not just one tier - per
// earlier user request for more variety as a fast-recall drill. Now that
// band-gating exists, "every category" means every category the user has
// unlocked; individual categories still lock per their band like
// everywhere else (see CATEGORIES + unlockedCategories below).
const CATEGORIES = getCategoryKeys();

export default function SpeedRoundPage() {
  useDocumentTitle("סבב מהיר");
  const { score, streak, recordLocal } = useGameScore("speedRound");
  const { unlockedBand } = usePlacement();
  const unlockedCategories = getCategoryKeysUpToBand(unlockedBand);
  const [category, setCategory] = useState<CategoryKey>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<WordEntry[]>([]);
  const [order, setOrder] = useState<WordEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedWords, setMissedWords] = useState<WordEntry[]>([]);
  const [options, setOptions] = useState<WordEntry[]>([]);
  const [answered, setAnswered] = useState<WordEntry | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerFillRef = useRef<HTMLDivElement>(null);
  // Always points at the latest advance() closure. startQuestion() is
  // called synchronously from the data-loading effect's .then(), before
  // that render has committed - so the handleTimeout/advance it schedules
  // via setTimeout would otherwise close over stale index/order/pool
  // (still the initial empty state), ending the round after just one
  // unanswered question. Routing every advance() call through this ref
  // instead guarantees the freshest render's version always runs.
  const advanceRef = useRef<() => void>(() => {});
  // Guards handleAnswer against a same-tick double-dispatch (e.g. a
  // bouncing mobile touch firing two click events in the same JS
  // macrotask, before a useState-based guard's setter would have any
  // chance to commit a re-render). A ref read is live/mutable rather than
  // closure-captured, so it correctly blocks the second same-tick call -
  // see CLAUDE.md rule 73 for the same fix already proven in
  // FlashcardsPage.tsx. Reset only from startQuestion(), which is only
  // ever reached asynchronously (a .then() callback or a deferred
  // setTimeout via advance()), never synchronously within handleAnswer's
  // own call stack.
  const answeringRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((words) => {
      if (cancelled) return;
      const nextOrder = shuffle(words).slice(0, Math.min(ROUND_SIZE, words.length));
      setPool(words);
      setOrder(nextOrder);
      setIndex(0);
      setCorrectCount(0);
      setMissedWords([]);
      setShowResults(false);
      setLoading(false);
      if (nextOrder.length) startQuestion(nextOrder[0], words);
    });
    return () => {
      cancelled = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, roundKey]);

  function buildOptions(current: WordEntry, words: WordEntry[]) {
    const wrong = shuffle(words.filter((w) => w.word !== current.word)).slice(0, 3);
    return shuffle([current, ...wrong]);
  }

  function startQuestion(word: WordEntry, words: WordEntry[]) {
    answeringRef.current = false;
    setAnswered(null);
    setFeedback(null);
    setOptions(buildOptions(word, words));
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimerKey((k) => k + 1);
    timeoutRef.current = setTimeout(() => handleTimeout(word), TIME_PER_QUESTION_MS);
  }

  useEffect(() => {
    const el = timerFillRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.width = "100%";
    void el.offsetWidth;
    el.style.transition = `width ${TIME_PER_QUESTION_MS}ms linear`;
    el.style.width = "0%";
  }, [timerKey]);

  function advance() {
    const next = index + 1;
    if (next >= order.length) {
      setShowResults(true);
      recordGameCompleted("speedRound");
      return;
    }
    setIndex(next);
    startQuestion(order[next], pool);
  }

  useEffect(() => {
    advanceRef.current = advance;
  });

  function handleTimeout(current: WordEntry) {
    if (answeringRef.current) return;
    answeringRef.current = true;
    setAnswered((prev) => prev ?? current); // marks answered without a chosen option
    setFeedback({ text: `הזמן נגמר! התשובה הנכונה: "${current.translation}"`, color: "text-red-600" });
    recordLocal(0, false);
    recordAnswer({ points: 0, correct: false, currentStreak: 0 });
    setMissedWords((m) => [...m, current]);
    setTimeout(() => advanceRef.current(), 1200);
  }

  function handleAnswer(opt: WordEntry) {
    if (answeringRef.current) return;
    answeringRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const current = order[index];
    const isCorrect = opt.word === current.word;
    setAnswered(opt);
    recordLocal(POINTS_PER_CORRECT, isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissedWords((m) => [...m, current]);
    }
    setFeedback(
      isCorrect
        ? { text: "נכון! ✓", color: "text-green-600" }
        : { text: `לא נכון. התשובה הנכונה: "${current.translation}"`, color: "text-red-600" }
    );
    recordAnswer({
      points: isCorrect ? POINTS_PER_CORRECT : 0,
      correct: isCorrect,
      currentStreak: isCorrect ? streak + 1 : 0,
    });
    setTimeout(() => advanceRef.current(), 900);
  }

  const current = order[index];

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/", label: "🏠 חזרה לדף הבית" }} />
      <GameHeader
        title={
          <>
            ⏱️ סבב מהיר <BandBadge band={getCategoryBand(category)} />
          </>
        }
        score={score}
        streak={streak}
      />
      <CategorySelect categories={CATEGORIES} value={category} onChange={setCategory} unlockedCategories={unlockedCategories} />

      {loading ? (
        <p className="text-center text-muted-foreground text-sm">טוען מילים...</p>
      ) : showResults ? (
        <section className="text-center py-10">
          <h2 className="text-primary font-bold text-xl mb-2">הסבב הושלם! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            ענית נכון על {correctCount} מתוך {order.length} שאלות.
          </p>
          {missedWords.length > 0 && (
            <div className="text-start bg-card border rounded-2xl p-4 mb-6 max-w-sm mx-auto">
              <h3 className="font-semibold text-sm mb-2 text-center">מילים לתרגול נוסף</h3>
              <ul className="space-y-1.5">
                {missedWords.map((w, i) => (
                  <li key={`${w.word}-${i}`} className="flex items-center justify-between text-sm gap-3">
                    <span dir="ltr" lang="en" className="font-medium">{w.word}</span>
                    <span className="text-muted-foreground">{w.translation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-2.5 justify-center">
            <Button onClick={() => setRoundKey((k) => k + 1)}>שחקו שוב</Button>
            <Link to="/games">
              <Button variant="outline">לרשימת המשחקים</Button>
            </Link>
          </div>
        </section>
      ) : current ? (
        <section>
          <div className="mb-3">
            <span className="text-sm text-muted-foreground">
              שאלה {index + 1} מתוך {order.length}
            </span>
            <Progress value={(index / order.length) * 100} className="mt-1.5" />
          </div>

          <div className="h-1.5 bg-muted rounded-full mb-5 overflow-hidden">
            <div ref={timerFillRef} className="h-full bg-primary w-full" />
          </div>

          <div className="text-center mb-6">
            <p className="text-muted-foreground mb-1.5">מה המשמעות של המילה?</p>
            <h2 className="text-3xl text-primary font-bold m-0" dir="ltr" lang="en">{current.word}</h2>
          </div>

          <div className="flex flex-col gap-2.5">
            {options.map((opt) => {
              const isThisCorrect = opt.word === current.word;
              const isAnswered = !!answered;
              return (
                <button
                  key={opt.word}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(opt)}
                  className={cn(
                    "rounded-lg border px-4 py-3.5 text-start text-sm transition-colors",
                    !isAnswered && "hover:bg-accent cursor-pointer",
                    isAnswered && isThisCorrect && "bg-green-100 border-green-500 text-green-700 font-semibold",
                    isAnswered && !isThisCorrect && answered && opt.word === answered.word && "bg-red-100 border-red-500 text-red-700 font-semibold"
                  )}
                >
                  {opt.translation}
                </button>
              );
            })}
          </div>

          <p aria-live="polite" className={cn("min-h-6 text-center font-semibold mt-3.5", feedback?.color)}>
            {feedback?.text}
          </p>
        </section>
      ) : (
        <EmptyGameState />
      )}
    </div>
  );
}
