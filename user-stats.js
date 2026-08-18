import { auth, db } from "./firebase-config.js";
import {
  doc,
  getDoc,
  setDoc,
  increment,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Achievements are computed from cumulative userStats fields. Add new ones
// here; existing users automatically unlock them next time they play.
export const ACHIEVEMENTS = [
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
      (s.roundsCompleted?.fillBlank || 0) > 0 &&
      (s.roundsCompleted?.listening || 0) > 0 &&
      (s.roundsCompleted?.speedRound || 0) > 0,
  },
];

function statsDocRef(uid) {
  return doc(db, "userStats", uid);
}

// Records one answer's outcome for the signed-in user. No-op for anonymous
// visitors - their score stays localStorage-only, as before this feature.
export async function recordAnswer({ points = 0, correct, currentStreak = 0 }) {
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
    const existingBest = snap.exists() ? snap.data().bestStreak || 0 : 0;
    if (currentStreak > existingBest) {
      await setDoc(ref, { bestStreak: currentStreak }, { merge: true });
    }
  }

  await checkAchievements();
}

// Records that the user finished one round of a game (used for the
// "played all advanced games" achievement). gameKey e.g. "fillBlank".
export async function recordGameCompleted(gameKey) {
  const user = auth.currentUser;
  if (!user) return;
  const ref = statsDocRef(user.uid);
  await setDoc(ref, { roundsCompleted: { [gameKey]: increment(1) } }, { merge: true });
  await checkAchievements();
}

async function checkAchievements() {
  const user = auth.currentUser;
  if (!user) return [];
  const ref = statsDocRef(user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return [];
  const stats = snap.data();
  const unlocked = stats.achievements || [];
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (ach) => !unlocked.includes(ach.id) && ach.check(stats)
  ).map((ach) => ach.id);

  if (newlyUnlocked.length) {
    await setDoc(ref, { achievements: arrayUnion(...newlyUnlocked) }, { merge: true });
  }
  return newlyUnlocked;
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), ms));
}

// Returns the signed-in user's cumulative stats, or null if signed out,
// they haven't played anything with an account yet, or Firestore doesn't
// respond in time (races against a timeout - see words-db.js for why).
export async function getStats() {
  const user = auth.currentUser;
  if (!user) return null;
  const result = await Promise.race([getDoc(statsDocRef(user.uid)), timeout(5000)]);
  if (result === "TIMEOUT") {
    console.warn("Firestore stats fetch timed out.");
    return null;
  }
  return result.exists() ? result.data() : null;
}
