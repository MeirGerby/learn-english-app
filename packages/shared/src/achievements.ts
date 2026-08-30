import type { Achievement } from "./types.js";

// Achievements are computed from cumulative UserStats fields. Add new
// ones here; both the API (authoritative check on every stats write) and
// the web app (icon/name/description lookup for display) share this one
// source of truth.
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
  {
    id: "intermediate_explorer",
    icon: "🧭",
    nameHe: "חוקר/ת בינוני/ת",
    descHe: "שיחקת בכל שלושת המשחקים ברמה הבינונית",
    check: (s) =>
      (s.roundsCompleted?.wordMatch ?? 0) > 0 &&
      (s.roundsCompleted?.typeWord ?? 0) > 0 &&
      (s.roundsCompleted?.sentenceBuilder ?? 0) > 0,
  },
];
