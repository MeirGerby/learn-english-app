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
import { loadWords, getCategoryKeysForBand, shuffle, pickRoundWithDistinctTranslations } from "@/lib/wordsDb";
import { recordAnswer, recordGameCompleted } from "@/lib/userStats";
import type { CategoryKey, WordEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PAIR_COUNT = 8;
const POINTS_PER_MATCH = 10;
const CATEGORIES = getCategoryKeysForBand(2);

export default function WordMatchPage() {
  useDocumentTitle("התאמת מילים");
  const location = useLocation();
  const { score, streak, recordLocal } = useGameScore("wordMatch");
  const { unlockedBand, loading: placementLoading } = usePlacement();
  const gameLocked = placementLoading || unlockedBand < 2;
  const [category, setCategory] = useState<CategoryKey>(CATEGORIES[0]);
  const [loading, setLoading] = useState(true);
  const [pairs, setPairs] = useState<WordEntry[]>([]);
  const [leftOrder, setLeftOrder] = useState<WordEntry[]>([]);
  const [rightOrder, setRightOrder] = useState<WordEntry[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [wrongFlash, setWrongFlash] = useState<{ left: string; right: string } | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [roundKey, setRoundKey] = useState(0);
  const [statusMessage, setStatusMessage] = useState<{ text: string; color: string } | null>(null);
  const [wrongCounts, setWrongCounts] = useState<Map<string, number>>(new Map());
  const [missedWords, setMissedWords] = useState<WordEntry[]>([]);
  const busyRef = useRef(false);
  const pendingPracticeRef = useRef<{ category: CategoryKey; words: WordEntry[] } | null>(null);

  useEffect(() => {
    busyRef.current = false;
  });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWords(category).then((words) => {
      if (cancelled) return;
      let round: WordEntry[];
      if (pendingPracticeRef.current && pendingPracticeRef.current.category === category) {
        round = pendingPracticeRef.current.words;
      } else {
        round = pickRoundWithDistinctTranslations(words, Math.min(PAIR_COUNT, words.length));
      }
      pendingPracticeRef.current = null;
      setPairs(round);
      setLeftOrder(shuffle(round));
      setRightOrder(shuffle(round));
      setMatched(new Set());
      setSelectedLeft(null);
      setSelectedRight(null);
      setWrongFlash(null);
      setWrongAttempts(0);
      setShowResults(false);
      setStatusMessage(null);
      setWrongCounts(new Map());
      setMissedWords([]);
      busyRef.current = false;
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [category, roundKey]);

  function attemptMatch(leftWord: string | null, rightWord: string | null) {
    if (!leftWord || !rightWord) return;
    if (leftWord === rightWord) {
      const nextMatched = new Set(matched);
      nextMatched.add(leftWord);
      setMatched(nextMatched);
      setSelectedLeft(null);
      setSelectedRight(null);
      setStatusMessage({ text: "התאמה נכונה! ✓", color: "text-green-600" });
      recordLocal(POINTS_PER_MATCH, true);
      recordAnswer({ points: POINTS_PER_MATCH, correct: true, currentStreak: streak + 1 });
      if (nextMatched.size >= pairs.length) {
        setShowResults(true);
        recordGameCompleted("wordMatch");
      }
    } else {
      setWrongFlash({ left: leftWord, right: rightWord });
      setWrongAttempts((n) => n + 1);
      setStatusMessage({ text: "לא נכון, נסו שוב", color: "text-red-600" });
      recordLocal(0, false);
      recordAnswer({ points: 0, correct: false, currentStreak: 0 });
      const nextCounts = new Map(wrongCounts);
      const newlyMissed: WordEntry[] = [];
      for (const w of [leftWord, rightWord]) {
        const count = (nextCounts.get(w) ?? 0) + 1;
        nextCounts.set(w, count);
        if (count === 2) {
          const entry = pairs.find((p) => p.word === w);
          if (entry) newlyMissed.push(entry);
        }
      }
      setWrongCounts(nextCounts);
      if (newlyMissed.length > 0) {
        setMissedWords((m) => [...m, ...newlyMissed.filter((e) => !m.some((x) => x.word === e.word))]);
      }
      setTimeout(() => {
        setWrongFlash(null);
        setSelectedLeft(null);
        setSelectedRight(null);
        setStatusMessage(null);
      }, 600);
    }
  }

  function practiceMissed() {
    pendingPracticeRef.current = { category, words: missedWords };
    setRoundKey((k) => k + 1);
  }

  function clickLeft(word: string) {
    if (matched.has(word) || wrongFlash) return;
    if (busyRef.current) return;
    busyRef.current = true;
    if (word === selectedLeft) {
      setSelectedLeft(null);
      return;
    }
    setSelectedLeft(word);
    attemptMatch(word, selectedRight);
  }

  function clickRight(word: string) {
    if (matched.has(word) || wrongFlash) return;
    if (busyRef.current) return;
    busyRef.current = true;
    if (word === selectedRight) {
      setSelectedRight(null);
      return;
    }
    setSelectedRight(word);
    attemptMatch(selectedLeft, word);
  }

  function cellClass(word: string, selected: boolean) {
    const isWrong = wrongFlash?.left === word || wrongFlash?.right === word;
    const isMatched = matched.has(word);
    return cn(
      "rounded-lg border px-3 py-3 text-sm text-center transition-colors min-h-14 flex items-center justify-center",
      isMatched && "bg-green-100 border-green-500 text-green-700 font-semibold opacity-60",
      !isMatched && isWrong && "bg-red-100 border-red-500 text-red-700 font-semibold",
      !isMatched && !isWrong && selected && "bg-primary/10 border-primary",
      !isMatched && !isWrong && !selected && "hover:bg-accent cursor-pointer"
    );
  }

  return (
    <div className="app mx-auto max-w-xl w-full px-4 py-6">
      <TopBar backTo={{ href: "/games", label: "🏠 חזרה למשחקים" }} />
      <GameHeader
        title={
          <>
            🧩 התאמת מילים <BandBadge band={2} />
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
              <h2 className="text-primary font-bold text-xl mb-2">כל הכבוד! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                התאמתם את כל {pairs.length} הזוגות{wrongAttempts > 0 && ` (עם ${wrongAttempts} ניסיונות שגויים)`}.
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
                <Button
                  onClick={() => {
                    pendingPracticeRef.current = null;
                    setRoundKey((k) => k + 1);
                  }}
                >
                  שחקו שוב
                </Button>
                {missedWords.length >= 2 && (
                  <Button variant="secondary" onClick={practiceMissed}>
                    תרגלו את המילים שטעיתם ({missedWords.length})
                  </Button>
                )}
                <Link to="/games">
                  <Button variant="outline">לרשימת המשחקים</Button>
                </Link>
              </div>
            </section>
          ) : pairs.length ? (
            <section>
              <p className="text-center text-muted-foreground text-sm mb-4">התאימו כל מילה באנגלית לתרגום שלה בעברית:</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  {leftOrder.map((w) => (
                    <button
                      key={w.word}
                      dir="ltr"
                      lang="en"
                      disabled={matched.has(w.word)}
                      onClick={() => clickLeft(w.word)}
                      className={cellClass(w.word, selectedLeft === w.word)}
                    >
                      {w.word}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {rightOrder.map((w) => (
                    <button
                      key={w.word}
                      disabled={matched.has(w.word)}
                      onClick={() => clickRight(w.word)}
                      className={cellClass(w.word, selectedRight === w.word)}
                    >
                      {w.translation}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-center text-muted-foreground text-sm mt-4">
                {matched.size} מתוך {pairs.length} זוגות
              </p>
              <Progress value={(matched.size / pairs.length) * 100} className="mt-1.5" />
              <p aria-live="polite" className={cn("min-h-6 text-center font-semibold", statusMessage?.color)}>
                {statusMessage?.text}
              </p>
            </section>
          ) : (
            <EmptyGameState />
          )}
        </>
      )}
    </div>
  );
}
