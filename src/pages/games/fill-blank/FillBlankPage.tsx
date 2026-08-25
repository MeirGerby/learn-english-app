import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { GameHeader } from "@/components/GameHeader";
import { CategorySelect } from "@/components/CategorySelect";
import { BandBadge } from "@/components/BandBadge";
import { EmptyGameState } from "@/components/EmptyGameState";
import { useGameScore } from "@/hooks/useGameScore";
import { usePlacement } from "@/hooks/usePlacement";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { loadWords, getCategoryKeysForBand, shuffle } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ROUND_SIZE = 10;
const POINTS_PER_CORRECT = 10;
const CATEGORIES = getCategoryKeysForBand(3);

function blankOutWord(example: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "i");
  return re.test(example) ? example.replace(re, "_____") : example;
}

export default function FillBlankPage() {
  useDocumentTitle("השלמת משפטים");
  const location = useLocation();
  const { score, streak, recordLocal } = useGameScore("fillBlank");
  const { unlockedBand, loading: placementLoading } = usePlacement();
  const gameLocked = placementLoading || unlockedBand < 3;
  const [category, setCategory] = useState<CategoryKey>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [pool, setPool] = useState<WordEntry[]>([]);
  const [order, setOrder] = useState<WordEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [missedWords, setMissedWords] = useState<WordEntry[]>([]);
  const [options, setOptions] = useState<WordEntry[]>([]);
  const [answered, setAnswered] = useState<WordEntry | null>(null);
  const [showResults, setShowResults] = useState(false);
  const answeringRef = useRef(false);
  const pendingPracticeRef = useRef<{ category: CategoryKey; words: WordEntry[] } | null>(null);

  const [roundKey, setRoundKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((words) => {
      if (cancelled) return;
      const usable = words.filter((w) => blankOutWord(w.example, w.word) !== w.example);
      let nextOrder: WordEntry[];
      if (pendingPracticeRef.current && pendingPracticeRef.current.category === category) {
        nextOrder = shuffle(pendingPracticeRef.current.words);
      } else {
        nextOrder = shuffle(usable).slice(0, Math.min(ROUND_SIZE, usable.length));
      }
      pendingPracticeRef.current = null;
      setPool(usable);
      setOrder(nextOrder);
      setIndex(0);
      setCorrectCount(0);
      setMissedWords([]);
      setShowResults(false);
      setAnswered(null);
      answeringRef.current = false;
      setLoading(false);
      if (nextOrder.length) setOptions(buildOptions(nextOrder[0], usable));
    });
    return () => {
      cancelled = true;
    };
  }, [category, roundKey]);

  function handlePracticeMissed() {
    pendingPracticeRef.current = { category, words: missedWords };
    setRoundKey((k) => k + 1);
  }

  function buildOptions(current: WordEntry, words: WordEntry[]) {
    const wrong = shuffle(words.filter((w) => w.word !== current.word)).slice(0, 3);
    return shuffle([current, ...wrong]);
  }

  function handleAnswer(opt: WordEntry) {
    if (answeringRef.current) return;
    answeringRef.current = true;
    const current = order[index];
    const isCorrect = opt.word === current.word;
    setAnswered(opt);
    recordLocal(POINTS_PER_CORRECT, isCorrect);
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setMissedWords((m) => [...m, current]);
    }
    recordAnswer({
      points: isCorrect ? POINTS_PER_CORRECT : 0,
      correct: isCorrect,
      currentStreak: isCorrect ? streak + 1 : 0,
    });

    setTimeout(() => {
      const next = index + 1;
      if (next >= order.length) {
        setShowResults(true);
        recordGameCompleted("fillBlank");
        return;
      }
      setIndex(next);
      setAnswered(null);
      answeringRef.current = false;
      setOptions(buildOptions(order[next], pool));
    }, 1200);
  }

  const current = order[index];

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/games", label: "🏠 חזרה למשחקים" }} />
      <GameHeader
        title={
          <>
            ✏️ השלמת משפטים <BandBadge band={3} />
          </>
        }
        score={score}
        streak={streak}
      />

      {gameLocked ? (
        <section className="text-center py-10">
          <p className="text-4xl mb-3">🔒</p>
          <h2 className="text-primary font-bold text-xl mb-2">משחק זה דורש רמה 3 - מתקדם</h2>
          <p className="text-muted-foreground mb-6">
            עברו את מבחן הרמה בהצלחה גבוהה יותר, או תרגלו במשחקים אחרים כדי להתקדם לרמה המתקדמת.
          </p>
          <div className="flex gap-2.5 justify-center">
            <Link to="/placement-test" state={{ from: location.pathname }}>
              <Button className="h-11">מבחן רמה</Button>
            </Link>
            <Link to="/games">
              <Button variant="outline" className="h-11">חזרה למשחקים</Button>
            </Link>
          </div>
        </section>
      ) : (
        <>
      <CategorySelect categories={CATEGORIES} value={category} onChange={setCategory} />

      {loading ? (
        <p className="text-center text-muted-foreground text-sm">טוען מילים...</p>
      ) : showResults ? (
        <section className="text-center py-10">
          <h2 className="text-primary font-bold text-xl mb-2">הסיבוב הושלם! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            ענית נכון על {correctCount} מתוך {order.length} משפטים.
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
          <div className="flex gap-2.5 justify-center flex-wrap">
            <Button onClick={() => { pendingPracticeRef.current = null; setRoundKey((k) => k + 1); }}>שחקו שוב</Button>
            {missedWords.length > 0 && (
              <Button variant="secondary" onClick={handlePracticeMissed}>
                תרגלו את המילים שטעיתם ({missedWords.length})
              </Button>
            )}
            <Link to="/games">
              <Button variant="outline">לרשימת המשחקים</Button>
            </Link>
          </div>
        </section>
      ) : (
        current ? (
          <section>
            <div className="mb-5">
              <span className="text-sm text-muted-foreground">
                משפט {index + 1} מתוך {order.length}
              </span>
              <Progress value={(index / order.length) * 100} className="mt-1.5" />
            </div>

            <p className="text-center text-muted-foreground mb-2">השלימו את המשפט עם המילה הנכונה:</p>
            <div className="text-center text-lg leading-relaxed bg-card border rounded-2xl py-6 px-4.5 mb-5" dir="ltr" lang="en">
              {blankOutWord(current.example, current.word)}
            </div>

            <div className="flex flex-col gap-2.5">
              {options.map((opt) => {
                const isThisCorrect = opt.word === current.word;
                const isAnswered = !!answered;
                return (
                  <button
                    key={opt.word}
                    disabled={isAnswered}
                    dir="ltr"
                    lang="en"
                    onClick={() => handleAnswer(opt)}
                    className={cn(
                      "rounded-lg border px-4 py-3.5 text-start text-sm transition-colors",
                      !isAnswered && "hover:bg-accent cursor-pointer",
                      isAnswered && isThisCorrect && "bg-green-100 border-green-500 text-green-700 font-semibold",
                      isAnswered && !isThisCorrect && opt.word === answered?.word && "bg-red-100 border-red-500 text-red-700 font-semibold"
                    )}
                  >
                    {opt.word}
                  </button>
                );
              })}
            </div>

            <p
              aria-live="polite"
              className={cn(
                "min-h-6 text-center font-semibold mt-3.5",
                answered && (answered.word === current.word ? "text-green-600" : "text-red-600")
              )}
            >
              {answered ? (answered.word === current.word ? "נכון! ✓" : `לא נכון. המילה הנכונה: "${current.word}"`) : ""}
            </p>
          </section>
        ) : (
          <EmptyGameState />
        )
      )}
        </>
      )}
    </div>
  );
}
