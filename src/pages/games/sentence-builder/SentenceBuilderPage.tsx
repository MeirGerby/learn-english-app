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
import { loadWords, getCategoryKeysForBand, shuffle } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ROUND_SIZE = 8;
const POINTS_PER_CORRECT = 15;
const MIN_TOKENS = 4;
const MAX_TOKENS = 14;
const CATEGORIES = getCategoryKeysForBand(2);

export default function SentenceBuilderPage() {
  useDocumentTitle("בניית משפטים");
  const { score, streak, recordLocal } = useGameScore();
  const { unlockedBand, loading: placementLoading } = usePlacement();
  const gameLocked = placementLoading || unlockedBand < 2;
  const [category, setCategory] = useState<CategoryKey>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<WordEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [tokens, setTokens] = useState<string[]>([]);
  const [bankIds, setBankIds] = useState<number[]>([]);
  const [answerIds, setAnswerIds] = useState<number[]>([]);
  const [result, setResult] = useState<"correct" | "incorrect" | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const [missedWords, setMissedWords] = useState<WordEntry[]>([]);
  const busyRef = useRef(false);

  useEffect(() => {
    busyRef.current = false;
  }, [answerIds, bankIds]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((words) => {
      if (cancelled) return;
      const usable = words.filter((w) => {
        const n = w.example.split(" ").length;
        return n >= MIN_TOKENS && n <= MAX_TOKENS;
      });
      const pool = usable.length >= ROUND_SIZE ? usable : words;
      const nextOrder = shuffle(pool).slice(0, Math.min(ROUND_SIZE, pool.length));
      setOrder(nextOrder);
      setIndex(0);
      setCorrectCount(0);
      setShowResults(false);
      setMissedWords([]);
      setLoading(false);
      if (nextOrder.length) startSentence(nextOrder[0]);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, roundKey]);

  function startSentence(word: WordEntry) {
    const nextTokens = word.example.split(" ");
    setTokens(nextTokens);
    setBankIds(shuffle(nextTokens.map((_, i) => i)));
    setAnswerIds([]);
    setResult(null);
    setHintsUsed(0);
  }

  function advance() {
    const next = index + 1;
    if (next >= order.length) {
      setShowResults(true);
      recordGameCompleted("sentenceBuilder");
      return;
    }
    setIndex(next);
    startSentence(order[next]);
  }

  function placeChip(id: number) {
    if (result) return;
    if (busyRef.current) return;
    busyRef.current = true;
    setBankIds((ids) => ids.filter((x) => x !== id));
    setAnswerIds((ids) => {
      const next = [...ids, id];
      if (next.length === tokens.length) {
        const isCorrect = next.every((chipId, i) => chipId === i);
        setResult(isCorrect ? "correct" : "incorrect");
        recordLocal(isCorrect ? Math.max(POINTS_PER_CORRECT - hintsUsed * 3, 2) : 0, isCorrect);
        if (isCorrect) setCorrectCount((c) => c + 1);
        else setMissedWords((m) => [...m, current]);
        recordAnswer({
          points: isCorrect ? Math.max(POINTS_PER_CORRECT - hintsUsed * 3, 2) : 0,
          correct: isCorrect,
          currentStreak: isCorrect ? streak + 1 : 0,
        });
        setTimeout(advance, isCorrect ? 900 : 2200);
      }
      return next;
    });
  }

  function returnChip(id: number) {
    if (result) return;
    if (busyRef.current) return;
    busyRef.current = true;
    setAnswerIds((ids) => ids.filter((x) => x !== id));
    setBankIds((ids) => [...ids, id]);
  }

  function resetAttempt() {
    if (result) return;
    if (busyRef.current) return;
    busyRef.current = true;
    setBankIds(shuffle(tokens.map((_, i) => i)));
    setAnswerIds([]);
  }

  function handleHint() {
    if (result || busyRef.current) return;
    const nextId = bankIds.find((id) => id === answerIds.length);
    if (nextId === undefined) return;
    setHintsUsed((h) => h + 1);
    placeChip(nextId);
  }

  function handleSkip() {
    if (result || busyRef.current) return;
    busyRef.current = true;
    setResult("incorrect");
    recordLocal(0, false);
    recordAnswer({ points: 0, correct: false, currentStreak: 0 });
    setMissedWords((m) => [...m, current]);
    setTimeout(advance, 2200);
  }

  const current = order[index];

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/games", label: "🏠 חזרה למשחקים" }} />
      <GameHeader
        title={
          <>
            🧱 בניית משפטים <BandBadge band={2} />
          </>
        }
        score={score}
        streak={streak}
      />

      {gameLocked ? (
        <section className="text-center py-10">
          <p className="text-4xl mb-3">🔒</p>
          <h2 className="text-primary font-bold text-xl mb-2">משחק זה דורש רמה 2 - בינוני</h2>
          <p className="text-muted-foreground mb-6">
            עברו את מבחן הרמה בהצלחה גבוהה יותר, או תרגלו במשחקים אחרים כדי להתקדם לרמה הבינונית.
          </p>
          <div className="flex gap-2.5 justify-center">
            <Link to="/placement-test">
              <Button>מבחן רמה</Button>
            </Link>
            <Link to="/games">
              <Button variant="outline">חזרה למשחקים</Button>
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
                בניתם נכון {correctCount} מתוך {order.length} משפטים.
              </p>
              {missedWords.length > 0 && (
                <div className="text-start bg-card border rounded-2xl p-4 mb-6 max-w-sm mx-auto">
                  <h3 className="font-semibold mb-2">מילים לתרגול נוסף</h3>
                  <ul className="space-y-1 text-sm">
                    {missedWords.map((w, i) => (
                      <li key={`${w.word}-${i}`}>
                        <span dir="ltr" lang="en">{w.word}</span> - {w.translation}
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
              <div className="mb-5">
                <span className="text-sm text-muted-foreground">
                  משפט {index + 1} מתוך {order.length}
                </span>
                <Progress value={(index / order.length) * 100} className="mt-1.5" />
              </div>

              <p className="text-center text-muted-foreground mb-2">
                סדרו את המילים כדי לבנות משפט עם המילה <span dir="ltr" lang="en" className="font-semibold text-primary">{current.word}</span>:
              </p>

              <div
                dir="ltr"
                lang="en"
                className={cn(
                  "min-h-16 flex flex-wrap gap-2 items-start content-start rounded-2xl border-2 border-dashed p-3 mb-3",
                  result === "correct" && "border-green-500 bg-green-50",
                  result === "incorrect" && "border-red-500 bg-red-50",
                  !result && "border-border bg-card"
                )}
              >
                {answerIds.length === 0 && <span className="text-muted-foreground text-sm">לחצו על המילים למטה כדי להוסיף אותן כאן</span>}
                {answerIds.map((id) => (
                  <button
                    key={id}
                    dir="ltr"
                    lang="en"
                    disabled={!!result}
                    onClick={() => returnChip(id)}
                    className="rounded-lg border bg-primary/10 border-primary px-3.5 py-2.5 text-sm min-h-11"
                  >
                    {tokens[id]}
                  </button>
                ))}
              </div>

              <div dir="ltr" lang="en" className="flex flex-wrap gap-2 mb-3 min-h-11">
                {bankIds.map((id) => (
                  <button
                    key={id}
                    dir="ltr"
                    lang="en"
                    onClick={() => placeChip(id)}
                    className="rounded-lg border px-3.5 py-2.5 text-sm min-h-11 hover:bg-accent cursor-pointer"
                  >
                    {tokens[id]}
                  </button>
                ))}
              </div>

              <p
                aria-live="polite"
                className={cn(
                  "text-center font-semibold mb-3 min-h-[28px]",
                  result === "correct" && "text-green-600",
                  result === "incorrect" && "text-red-600"
                )}
              >
                {result === "correct" ? (
                  "נכון! ✓"
                ) : result === "incorrect" ? (
                  <>
                    המשפט הנכון: <span dir="ltr" lang="en">{tokens.join(" ")}</span>
                  </>
                ) : (
                  ""
                )}
              </p>

              {!result && (
                <div className="flex gap-2.5">
                  {bankIds.length > 0 && answerIds.length > 0 && (
                    <Button variant="outline" className="flex-1 h-11" type="button" onClick={resetAttempt}>
                      נקו והתחילו מחדש
                    </Button>
                  )}
                  {bankIds.length > 1 && bankIds.includes(answerIds.length) && (
                    <Button variant="outline" className="flex-1 h-11" type="button" onClick={handleHint}>
                      💡 רמז
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 h-11" type="button" onClick={handleSkip}>
                    דלגו
                  </Button>
                </div>
              )}
            </section>
          ) : (
            <EmptyGameState />
          )}
        </>
      )}
    </div>
  );
}
