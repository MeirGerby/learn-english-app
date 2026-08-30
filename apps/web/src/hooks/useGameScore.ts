import { useState } from "react";

// Per-session score/streak, persisted to localStorage - works for
// anonymous visitors too. Separate from the Firestore cumulative stats
// (see userStats.ts), which only track logged-in users.
export function useGameScore() {
  const [score, setScore] = useState(() => Number(localStorage.getItem("eng-score") || 0));
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("eng-streak") || 0));

  function recordLocal(pointsIfCorrect: number, correct: boolean) {
    setScore((prev) => {
      const next = correct ? prev + pointsIfCorrect : prev;
      localStorage.setItem("eng-score", String(next));
      return next;
    });
    setStreak((prev) => {
      const next = correct ? prev + 1 : 0;
      localStorage.setItem("eng-streak", String(next));
      return next;
    });
  }

  return { score, streak, recordLocal };
}
