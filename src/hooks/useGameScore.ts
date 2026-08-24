import { useState } from "react";

// Per-session score/streak, persisted to localStorage - works for
// anonymous visitors too. Separate from the Firestore cumulative stats
// (see userStats.ts), which only track logged-in users.
// Namespaced per-game via gameKey - each game's header shows its own
// independent score/streak, not a total shared across every game.
export function useGameScore(gameKey: string) {
  const scoreStorageKey = `eng-score-${gameKey}`;
  const streakStorageKey = `eng-streak-${gameKey}`;
  const [score, setScore] = useState(() => Number(localStorage.getItem(scoreStorageKey) || 0));
  const [streak, setStreak] = useState(() => Number(localStorage.getItem(streakStorageKey) || 0));

  function recordLocal(pointsIfCorrect: number, correct: boolean) {
    setScore((prev) => {
      const next = correct ? prev + pointsIfCorrect : prev;
      localStorage.setItem(scoreStorageKey, String(next));
      return next;
    });
    setStreak((prev) => {
      const next = correct ? prev + 1 : 0;
      localStorage.setItem(streakStorageKey, String(next));
      return next;
    });
  }

  return { score, streak, recordLocal };
}
