import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { GameHeader } from "@/components/GameHeader";
import { CategorySelect } from "@/components/CategorySelect";
import { BandBadge } from "@/components/BandBadge";
import { EmptyGameState } from "@/components/EmptyGameState";
import { useGameScore } from "@/hooks/useGameScore";
import { usePlacement } from "@/hooks/usePlacement";
import { loadWords, getCategoryKeys, getCategoryBand, getCategoryKeysUpToBand, shuffle } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const SESSION_SIZE = 10;
const CATEGORIES = getCategoryKeys();

function scrambleWord(word: string): string {
  const letters = word.toUpperCase().split("");
  let scrambled: string;
  do {
    scrambled = shuffle(letters).join("");
  } while (scrambled === word.toUpperCase() && letters.length > 1);
  return scrambled;
}

export default function ScramblePage() {
  const { score, streak, recordLocal } = useGameScore();
  const { unlockedBand } = usePlacement();
  const unlockedCategories = getCategoryKeysUpToBand(unlockedBand);
  const [category, setCategory] = useState<CategoryKey>("basics");
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<WordEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [scrambled, setScrambled] = useState("");
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
      const singleWord = words.filter((w) => !/[\s/]/.test(w.word));
      const pool = singleWord.length >= SESSION_SIZE ? singleWord : words;
      const nextOrder = shuffle(pool).slice(0, Math.min(SESSION_SIZE, pool.length));
      setOrder(nextOrder);
      setIndex(0);
      setCorrectCount(0);
      setShowResults(false);
      setLoading(false);
      if (nextOrder.length) startWord(nextOrder[0]);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, roundKey]);

  function startWord(word: WordEntry) {
    setScrambled(scrambleWord(word.word));
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
      recordGameCompleted("scramble");
      return;
    }
    setIndex(next);
    startWord(order[next]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const current = order[index];
    if (input.trim().toLowerCase() === current.word.toLowerCase()) {
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
    setHintsUsed((h) => h + 1);
    setHint(`רמז: ${order[index].translation}`);
  }

  function handleSkip() {
    setFeedback({ text: `המילה הייתה: ${order[index].word}`, color: "text-red-600" });
    recordLocal(0, false);
    setDisabled(true);
    setTimeout(advance, 1200);
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/", label: "🏠 חזרה לדף הבית" }} />
      <GameHeader
        title={
          <>
            🔤 ערבוב מילים <BandBadge band={getCategoryBand(category)} />
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
          <h2 className="text-primary font-bold text-xl mb-2">הסיבוב הושלם! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            פתרתם נכון {correctCount} מתוך {order.length} מילים.
          </p>
          <Button onClick={() => setRoundKey((k) => k + 1)}>שחקו שוב</Button>
        </section>
      ) : order.length > 0 ? (
        <section>
          <div className="mb-5">
            <span className="text-sm text-muted-foreground">
              מילה {index + 1} מתוך {order.length}
            </span>
            <Progress value={(index / order.length) * 100} className="mt-1.5" />
          </div>

          <p className="text-center text-muted-foreground mb-2">סדרו את האותיות כדי לגלות את המילה:</p>
          <div className="text-center text-3xl font-extrabold tracking-widest text-primary bg-card border rounded-2xl py-5 px-2.5 mb-3 ltr:direction-ltr" dir="ltr">
            {scrambled}
          </div>

          <p className={cn("min-h-5 text-center italic text-muted-foreground text-sm mb-3 transition-opacity", hint ? "opacity-100" : "opacity-0")}>
            {hint}
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2.5 mb-3">
            <Input
              ref={inputRef}
              dir="ltr"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="הקלידו את התשובה..."
              value={input}
              disabled={disabled}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit">בדיקה ✓</Button>
          </form>

          {feedback && <p className={cn("text-center font-semibold mb-3", feedback.color)}>{feedback.text}</p>}

          <div className="flex gap-2.5">
            <Button variant="outline" className="flex-1" type="button" onClick={handleHint}>
              💡 רמז
            </Button>
            <Button variant="outline" className="flex-1" type="button" onClick={handleSkip}>
              דלגו
            </Button>
          </div>
        </section>
      ) : (
        <EmptyGameState />
      )}
    </div>
  );
}
