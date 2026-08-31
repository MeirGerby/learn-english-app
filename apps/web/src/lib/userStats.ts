import { trpc } from "./trpc";
import { getAuthToken } from "./authToken";
import type { Band, GameKey, UserStats } from "@learn-english/shared";

function isSignedIn(): boolean {
  return !!getAuthToken();
}

function dispatchUnlocks(newlyUnlocked: string[]) {
  if (newlyUnlocked.length) {
    window.dispatchEvent(new CustomEvent("achievement-unlocked", { detail: { ids: newlyUnlocked } }));
  }
}

interface RecordAnswerArgs {
  points?: number;
  correct: boolean;
  currentStreak?: number;
}

// Records one answer's outcome for the signed-in user. No-op for anonymous
// visitors - their score stays localStorage-only.
export async function recordAnswer({ points = 0, correct, currentStreak = 0 }: RecordAnswerArgs) {
  if (!isSignedIn()) return;
  try {
    const { newlyUnlocked } = await trpc.userStats.recordAnswer.mutate({
      points,
      correct,
      currentStreak,
    });
    dispatchUnlocks(newlyUnlocked);
  } catch (err) {
    console.warn("recordAnswer failed.", err);
  }
}

// Saves the result of the placement test, which determines the bands
// unlocked across every game. No-op for anonymous visitors - they can
// take the test but the result only persists once they're signed in.
export async function savePlacementResult(band: Band, score: number, totalQuestions: number) {
  if (!isSignedIn()) return;
  try {
    await trpc.userStats.savePlacementResult.mutate({ band, score, totalQuestions });
  } catch (err) {
    console.warn("savePlacementResult failed.", err);
  }
}

// Records that the user finished one round of a game (used for the
// "played all advanced/intermediate games" achievements).
export async function recordGameCompleted(gameKey: GameKey) {
  if (!isSignedIn()) return;
  try {
    const { newlyUnlocked } = await trpc.userStats.recordGameCompleted.mutate({ gameKey });
    dispatchUnlocks(newlyUnlocked);
  } catch (err) {
    console.warn("recordGameCompleted failed.", err);
  }
}

// Returns the signed-in user's cumulative stats, or null if signed out or
// the API call fails for any reason (network error, cold start, etc.) -
// callers already treat null as "nothing to show yet".
export async function getStats(): Promise<UserStats | null> {
  if (!isSignedIn()) return null;
  try {
    return await trpc.userStats.getStats.query();
  } catch (err) {
    console.warn("getStats failed.", err);
    return null;
  }
}
