import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { increment } from "firebase/firestore";
import { auth, db } from "./firebase";
import { ACHIEVEMENTS } from "@learn-english/shared";
import type { Band, GameKey, UserStats } from "@learn-english/shared";

function statsDocRef(uid: string) {
  return doc(db, "userStats", uid);
}

function timeout(ms: number): Promise<"TIMEOUT"> {
  return new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), ms));
}

interface RecordAnswerArgs {
  points?: number;
  correct: boolean;
  currentStreak?: number;
}

// Records one answer's outcome for the signed-in user. No-op for anonymous
// visitors - their score stays localStorage-only.
export async function recordAnswer({ points = 0, correct, currentStreak = 0 }: RecordAnswerArgs) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = statsDocRef(user.uid);

  await setDoc(
    ref,
    {
      totalScore: increment(points),
      totalCorrect: increment(correct ? 1 : 0),
      totalIncorrect: increment(correct ? 0 : 1),
    },
    { merge: true }
  );

  if (currentStreak > 0) {
    const snap = await getDoc(ref);
    const existingBest = snap.exists() ? (snap.data().bestStreak ?? 0) : 0;
    if (currentStreak > existingBest) {
      await setDoc(ref, { bestStreak: currentStreak }, { merge: true });
    }
  }

  await checkAchievements();
}

// Saves the result of the placement test, which determines the bands
// unlocked across every game. No-op for anonymous visitors - they can
// take the test but the result only persists once they're signed in.
export async function savePlacementResult(band: Band, score: number, totalQuestions: number) {
  const user = auth.currentUser;
  if (!user) return;
  await setDoc(
    statsDocRef(user.uid),
    {
      placementBand: band,
      placementScore: score,
      placementTotalQuestions: totalQuestions,
      placementCompletedAt: Date.now(),
    },
    { merge: true }
  );
}

// Records that the user finished one round of a game (used for the
// "played all advanced games" achievement).
export async function recordGameCompleted(gameKey: GameKey) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = statsDocRef(user.uid);
  await setDoc(ref, { roundsCompleted: { [gameKey]: increment(1) } }, { merge: true });
  await checkAchievements();
}

async function checkAchievements(): Promise<string[]> {
  const user = auth.currentUser;
  if (!user) return [];
  const ref = statsDocRef(user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const stats = snap.data() as UserStats;
  const unlocked = stats.achievements || [];
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (ach) => !unlocked.includes(ach.id) && ach.check(stats)
  ).map((ach) => ach.id);

  if (newlyUnlocked.length) {
    await setDoc(ref, { achievements: arrayUnion(...newlyUnlocked) }, { merge: true });
    window.dispatchEvent(
      new CustomEvent("achievement-unlocked", { detail: { ids: newlyUnlocked } })
    );
  }
  return newlyUnlocked;
}

// Returns the signed-in user's cumulative stats, or null if signed out,
// they haven't played anything with an account yet, or Firestore doesn't
// respond in time or errors out (races against a timeout AND catches
// rejections - see wordsDb.ts's loadWords() for the same pattern. This
// function used to only guard against getDoc() hanging, not against it
// rejecting - e.g. a transient network error on real wifi - which left
// the caller's loading state stuck forever, since an uncaught rejection
// here silently skips the .then() that would have cleared it).
export async function getStats(): Promise<UserStats | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    const result = await Promise.race([getDoc(statsDocRef(user.uid)), timeout(5000)]);
    if (result === "TIMEOUT") {
      console.warn("Firestore stats fetch timed out.");
      return null;
    }
    return result.exists() ? (result.data() as UserStats) : null;
  } catch (err) {
    console.warn("Firestore stats fetch failed.", err);
    return null;
  }
}
