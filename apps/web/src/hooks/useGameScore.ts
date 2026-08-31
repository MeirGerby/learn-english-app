import { useState } from "react";

// Per-session score/streak, persisted to sessionStorage - works for
// anonymous visitors too. Separate from the Firestore cumulative stats
// (see userStats.ts), which only track logged-in users.
// Namespaced per-game via gameKey - each game's header shows its own
// independent score/streak, not a total shared across every game.
// sessionStorage (not localStorage) so the score/streak actually resets
// per session (survives an in-tab reload, clears when the tab closes) -
// localStorage never expired, so a score from weeks ago kept displaying
// as "current" indefinitely.
export function useGameScore(gameKey: string) {
  const scoreStorageKey = `eng-score-${gameKey}`;
  const streakStorageKey = `eng-streak-${gameKey}`;
  const [score, setScore] = useState(() => Number(sessionStorage.getItem(scoreStorageKey) || 0));
  const [streak, setStreak] = useState(() => Number(sessionStorage.getItem(streakStorageKey) || 0));

  function recordLocal(pointsIfCorrect: number, correct: boolean) {
    setScore((prev) => {
      const next = correct ? prev + pointsIfCorrect : prev;
      sessionStorage.setItem(scoreStorageKey, String(next));
      return next;
    });
    setStreak((prev) => {
      const next = correct ? prev + 1 : 0;
      sessionStorage.setItem(streakStorageKey, String(next));
      return next;
    });
  }

  return { score, streak, recordLocal };
}
