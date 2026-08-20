import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { GameHeader } from "@/components/GameHeader";
import { CategorySelect } from "@/components/CategorySelect";
import { BandBadge } from "@/components/BandBadge";
import { EmptyGameState } from "@/components/EmptyGameState";
import { useGameScore } from "@/hooks/useGameScore";
import { usePlacement } from "@/hooks/usePlacement";
import { loadWords, getCategoryKeysForBand, shuffle } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const ROUND_SIZE = 10;
const CATEGORIES = getCategoryKeysForBand(2);

function blankOutWord(example: string, word: string): string {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "i");
  return re.test(example) ? example.replace(re, "_____") : example;
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function TypeWordPage() {
  const { score, streak, recordLocal } = useGameScore();
  const { unlockedBand, loading: placementLoading } = usePlacement();
  const gameLocked = placementLoading || unlockedBand < 2;
  const [category, setCategory] = useState<CategoryKey>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<WordEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [input, setInput] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((words) => {
      if (cancelled) return;
      const usable = words.filter((w) => blankOutWord(w.example, w.word) !== w.example);
      const pool = usable.length >= ROUND_SIZE ? usable : words;
      const nextOrder = shuffle(pool).slice(0, Math.min(ROUND_SIZE, pool.length));
      setOrder(nextOrder);
      setIndex(0);
      setCorrectCount(0);
      setShowResults(false);
      setLoading(false);
      if (nextOrder.length) startWord();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, roundKey]);

  function startWord() {
    setInput("");
    setDisabled(false);
    setFeedback(null);
    setHint(null);
    setHintsUsed(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function advance() {
    const next = index + 1;
    if (next >= order.length) {
      setShowResults(true);
      recordGameCompleted("typeWord");
      return;
    }
    setIndex(next);
    startWord();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const current = order[index];
    if (normalize(input) === normalize(current.word)) {
      const points = Math.max(10 - hintsUsed * 3, 2);
      recordLocal(points, true);
      setCorrectCount((c) => c + 1);
      setFeedback({ text: `נכון! +${points} נקודות ✓`, color: "text-green-600" });
      setDisabled(true);
      recordAnswer({ points, correct: true, currentStreak: streak + 1 });
      setTimeout(advance, 900);
    } else {
      setFeedback({ text: "לא בדיוק, נסו שוב!", color: "text-red-600" });
      recordLocal(0, false);
      recordAnswer({ points: 0, correct: false, currentStreak: 0 });
      inputRef.current?.select();
    }
  }

  function handleHint() {
    if (disabled) return;
    const word = order[index].word;
    setHintsUsed((h) => h + 1);
    const revealCount = Math.min(hintsUsed + 1, word.length - 1 || 1);
    const revealed = word.slice(0, revealCount);
    setHint(`רמז: ${revealed}${"_".repeat(Math.max(word.length - revealCount, 0))} (${word.length} אותיות)`);
  }

  function handleSkip() {
    if (disabled) return;
    setFeedback({ text: `המילה הייתה: ${order[index].word}`, color: "text-red-600" });
    recordLocal(0, false);
    setDisabled(true);
    setTimeout(advance, 1400);
  }

  const current = order[index];

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/games", label: "🏠 חזרה למשחקים" }} />
      <GameHeader
        title={
          <>
            ⌨️ כתבו את המילה <BandBadge band={2} />
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
                כתבתם נכון {correctCount} מתוך {order.length} מילים.
              </p>
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
                  מילה {index + 1} מתוך {order.length}
                </span>
                <Progress value={(index / order.length) * 100} className="mt-1.5" />
              </div>

              <p className="text-center text-muted-foreground mb-2">איזו מילה מתאימה לתרגום?</p>
              <div className="text-center text-2xl font-bold text-primary bg-card border rounded-2xl py-5 px-4 mb-3">
                {current.translation}
              </div>
              <p className="text-center text-muted-foreground text-sm italic mb-3" dir="ltr" lang="en">
                {blankOutWord(current.example, current.word)}
              </p>

              <p className={cn("min-h-5 text-center italic text-muted-foreground text-sm mb-3 transition-opacity", hint ? "opacity-100" : "opacity-0")}>
                {hint}
              </p>

              <form onSubmit={handleSubmit} className="flex gap-2.5 mb-3">
                <Input
                  ref={inputRef}
                  dir="ltr"
                  lang="en"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="הקלידו את המילה באנגלית..."
                  value={input}
                  disabled={disabled}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-11"
                />
                <Button type="submit" className="h-11">בדיקה ✓</Button>
              </form>

              <p aria-live="polite" className={cn("min-h-6 text-center font-semibold mb-3", feedback?.color)}>
                {feedback?.text}
              </p>

              <div className="flex gap-2.5">
                <Button variant="outline" className="flex-1 h-11" type="button" onClick={handleHint}>
                  💡 רמז
                </Button>
                <Button variant="outline" className="flex-1 h-11" type="button" onClick={handleSkip}>
                  דלגו
                </Button>
              </div>
            </section>
          ) : (
            <EmptyGameState />
          )}
        </>
      )}
    </div>
  );
}
