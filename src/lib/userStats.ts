import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { increment } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { Achievement, UserStats } from "@/types";

// Achievements are computed from cumulative userStats fields. Add new ones
// here; existing users automatically unlock them next time they play.
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_correct",
    icon: "🌱",
    nameHe: "צעד ראשון",
    descHe: "ענית נכון בפעם הראשונה",
    check: (s) => s.totalCorrect >= 1,
  },
  {
    id: "correct_50",
    icon: "📚",
    nameHe: "50 תשובות נכונות",
    descHe: "צברת 50 תשובות נכונות בסך הכל",
    check: (s) => s.totalCorrect >= 50,
  },
  {
    id: "correct_200",
    icon: "🏆",
    nameHe: "200 תשובות נכונות",
    descHe: "צברת 200 תשובות נכונות בסך הכל",
    check: (s) => s.totalCorrect >= 200,
  },
  {
    id: "streak_10",
    icon: "🔥",
    nameHe: "רצף של 10",
    descHe: "השגת רצף של 10 תשובות נכונות ברצף",
    check: (s) => (s.bestStreak || 0) >= 10,
  },
  {
    id: "score_500",
    icon: "⭐",
    nameHe: "500 נקודות",
    descHe: "צברת 500 נקודות בסך הכל",
    check: (s) => (s.totalScore || 0) >= 500,
  },
  {
    id: "advanced_explorer",
    icon: "🚀",
    nameHe: "חוקר/ת מתקדם/ת",
    descHe: "שיחקת בכל שלושת המשחקים ברמה המתקדמת",
    check: (s) =>
      (s.roundsCompleted?.fillBlank ?? 0) > 0 &&
      (s.roundsCompleted?.listening ?? 0) > 0 &&
      (s.roundsCompleted?.speedRound ?? 0) > 0,
  },
];

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

export type GameKey = "quiz" | "scramble" | "fillBlank" | "listening" | "speedRound";

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
  }
  return newlyUnlocked;
}

// Returns the signed-in user's cumulative stats, or null if signed out,
// they haven't played anything with an account yet, or Firestore doesn't
// respond in time (races against a timeout - see wordsDb.ts for why).
export async function getStats(): Promise<UserStats | null> {
  const user = auth.currentUser;
  if (!user) return null;
  const result = await Promise.race([getDoc(statsDocRef(user.uid)), timeout(5000)]);
  if (result === "TIMEOUT") {
    console.warn("Firestore stats fetch timed out.");
    return null;
  }
  return result.exists() ? (result.data() as UserStats) : null;
}
