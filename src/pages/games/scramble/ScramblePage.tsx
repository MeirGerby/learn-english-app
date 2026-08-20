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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const SESSION_SIZE = 10;
const CATEGORIES = getCategoryKeys();

function scrambleWord(word: string): string {
  const upper = word.toUpperCase();
  return upper
    .split(/([\s/])/)
    .map((token) => {
      if (token === " " || token === "/") return token;
      const letters = token.split("");
      if (letters.length <= 1) return token;
      let scrambled: string;
      do {
        scrambled = shuffle(letters).join("");
      } while (scrambled === token);
      return scrambled;
    })
    .join("");
}

export default function ScramblePage() {
  useDocumentTitle("ערבוב מילים");
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
  const answeringRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((words) => {
      if (cancelled) return;
      const nextOrder = shuffle(words).slice(0, Math.min(SESSION_SIZE, words.length));
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
    answeringRef.current = false;
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
    if (answeringRef.current) return;
    const current = order[index];
    if (input.trim().toLowerCase() === current.word.toLowerCase()) {
      const points = Math.max(10 - hintsUsed * 3, 2);
      recordLocal(points, true);
      setCorrectCount((c) => c + 1);
      setFeedback({ text: `נכון! +${points} נקודות ✓`, color: "text-green-600" });
      setDisabled(true);
      answeringRef.current = true;
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
    if (answeringRef.current) return;
    setHintsUsed((h) => h + 1);
    setHint(`רמז: ${order[index].translation}`);
  }

  function handleSkip() {
    if (answeringRef.current) return;
    setFeedback({ text: `המילה הייתה: ${order[index].word}`, color: "text-red-600" });
    recordLocal(0, false);
    recordAnswer({ points: 0, correct: false, currentStreak: 0 });
    setDisabled(true);
    answeringRef.current = true;
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
          <div className="flex gap-2.5 justify-center">
            <Button onClick={() => setRoundKey((k) => k + 1)}>שחקו שוב</Button>
            <Link to="/games">
              <Button variant="outline">לרשימת המשחקים</Button>
            </Link>
          </div>
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
          <div className="text-center text-3xl font-extrabold tracking-widest text-primary bg-card border rounded-2xl py-5 px-2.5 mb-3 ltr:direction-ltr" dir="ltr" lang="en">
            {scrambled}
          </div>

          <p aria-live="polite" className={cn("min-h-5 text-center italic text-muted-foreground text-sm mb-3 transition-opacity", hint ? "opacity-100" : "opacity-0")}>
            {hint}
          </p>

          <form onSubmit={handleSubmit} className="flex gap-2.5 mb-3">
            <Input
              ref={inputRef}
              dir="ltr"
              lang="en"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="הקלידו את התשובה..."
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
    </div>
  );
}
