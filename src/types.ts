export interface WordEntry {
  word: string;
  translation: string;
  example: string;
}

export type CategoryKey =
  | "basics"
  | "food"
  | "travel"
  | "business"
  | "foundation"
  | "idioms"
  | "phrasalVerbs"
  | "advancedVocab";

export type CategoryLevel = "beginner" | "advanced";

export interface RoundsCompleted {
  quiz?: number;
  scramble?: number;
  fillBlank?: number;
  listening?: number;
  speedRound?: number;
}

export interface UserStats {
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  bestStreak: number;
  roundsCompleted: RoundsCompleted;
  achievements: string[];
}

export interface Achievement {
  id: string;
  icon: string;
  nameHe: string;
  descHe: string;
  check: (stats: UserStats) => boolean;
}

export interface CourseItem {
  id: string;
  type: "video" | "image";
  url: string;
  caption: string;
  createdAt: number;
}
