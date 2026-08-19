import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TopBar } from "@/components/TopBar";
import { GameHeader } from "@/components/GameHeader";
import { CategorySelect } from "@/components/CategorySelect";
import { BandBadge } from "@/components/BandBadge";
import { useGameScore } from "@/hooks/useGameScore";
import { usePlacement } from "@/hooks/usePlacement";
import { loadWords, getCategoryKeysForBand, shuffle } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EmptyGameState } from "@/components/EmptyGameState";

const ROUND_SIZE = 10;
const CATEGORIES = getCategoryKeysForBand(3);
const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

function speak(text: string) {
  if (!speechSupported) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function ListeningPage() {
  const { score, streak, recordLocal } = useGameScore();
  const { unlockedBand, loading: placementLoading } = usePlacement();
  const gameLocked = placementLoading || unlockedBand < 3;
  const [category, setCategory] = useState<CategoryKey>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<WordEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [input, setInput] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((words) => {
      if (cancelled) return;
      const nextOrder = shuffle(words).slice(0, Math.min(ROUND_SIZE, words.length));
      setOrder(nextOrder);
      setIndex(0);
      setCorrectCount(0);
      setShowResults(false);
      setLoading(false);
      if (nextOrder.length) startWord(nextOrder[0]);
    });
    return () => {
      cancelled = true;
      window.speechSynthesis?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, roundKey]);

  function startWord(word: WordEntry) {
    setInput("");
    setDisabled(false);
    setFeedback(null);
    setHintUsed(false);
    setTimeout(() => inputRef.current?.focus(), 0);
    speak(word.word);
  }

  function advance() {
    const next = index + 1;
    if (next >= order.length) {
      setShowResults(true);
      recordGameCompleted("listening");
      return;
    }
    setIndex(next);
    startWord(order[next]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const current = order[index];
    if (normalize(input) === normalize(current.word)) {
      const points = hintUsed ? 6 : 12;
      recordLocal(points, true);
      setCorrectCount((c) => c + 1);
      setFeedback({ text: `נכון! +${points} נקודות ✓`, color: "text-green-600" });
      setDisabled(true);
      recordAnswer({ points, correct: true, currentStreak: streak + 1 });
      setTimeout(advance, 900);
    } else {
      setFeedback({ text: "לא בדיוק, נסו שוב! (או האזינו שוב)", color: "text-red-600" });
      recordLocal(0, false);
      recordAnswer({ points: 0, correct: false, currentStreak: 0 });
      inputRef.current?.select();
    }
  }

  function handleHint() {
    setHintUsed(true);
    setFeedback({ text: `רמז: ${order[index].translation}`, color: "text-muted-foreground" });
  }

  function handleSkip() {
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
            🎧 אתגר האזנה <BandBadge band={3} />
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

      {!speechSupported && (
        <p className="text-center text-muted-foreground text-sm mb-3">
          הדפדפן שלכם לא תומך בהקראה קולית (Web Speech API). נסו בדפדפן אחר, כמו Chrome או Edge.
        </p>
      )}

      {loading ? (
        <p className="text-center text-muted-foreground text-sm">טוען מילים...</p>
      ) : showResults ? (
        <section className="text-center py-10">
          <h2 className="text-primary font-bold text-xl mb-2">הסיבוב הושלם! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            שמעתם וכתבתם נכון {correctCount} מתוך {order.length} מילים.
          </p>
          <Button onClick={() => setRoundKey((k) => k + 1)}>שחקו שוב</Button>
        </section>
      ) : current ? (
        <section>
          <div className="mb-5">
            <span className="text-sm text-muted-foreground">
              מילה {index + 1} מתוך {order.length}
            </span>
            <Progress value={(index / order.length) * 100} className="mt-1.5" />
          </div>

          <p className="text-center text-muted-foreground mb-2">הקשיבו וכתבו את מה ששמעתם:</p>
          <Button
            type="button"
            className="block mx-auto mb-5 rounded-full px-8 py-6 text-lg"
            onClick={() => speak(current.word)}
          >
            🔊 השמיעו
          </Button>

          <form onSubmit={handleSubmit} className="flex gap-2.5 mb-3">
            <Input
              ref={inputRef}
              dir="ltr"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="הקלידו כאן..."
              value={input}
              disabled={disabled}
              onChange={(e) => setInput(e.target.value)}
              className="h-11"
            />
            <Button type="submit" className="h-11">בדיקה ✓</Button>
          </form>

          <p
            aria-live="polite"
            className={cn("min-h-6 text-center font-semibold mb-3", feedback?.color)}
          >
            {feedback?.text}
          </p>

          <div className="flex gap-2.5">
            <Button variant="outline" className="flex-1 h-11" type="button" onClick={handleHint}>
              💡 רמז (תרגום)
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
