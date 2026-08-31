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
  | "technology"
  | "society"
  | "foundation"
  | "idioms"
  | "phrasalVerbs"
  | "advancedVocab";

// 3-tier difficulty system modeled on the Cambridge-style band convention
// used by Israeli schools: Band 1 (beginner), Band 2 (intermediate),
// Band 3 (advanced). Every category is tagged with exactly one band.
export type Band = 1 | 2 | 3;

export type GameKey =
  | "quiz"
  | "scramble"
  | "fillBlank"
  | "listening"
  | "speedRound"
  | "wordMatch"
  | "typeWord"
  | "sentenceBuilder";

export interface RoundsCompleted {
  quiz?: number;
  scramble?: number;
  fillBlank?: number;
  listening?: number;
  speedRound?: number;
  wordMatch?: number;
  typeWord?: number;
  sentenceBuilder?: number;
}

export interface UserStats {
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  bestStreak: number;
  roundsCompleted: RoundsCompleted;
  achievements: string[];
  // Set once the user completes the placement test; determines which
  // bands are unlocked across all games. Absent until they take it.
  placementBand?: Band;
  placementScore?: number;
  placementTotalQuestions?: number;
  placementCompletedAt?: number;
}

export interface Achievement {
  id: string;
  icon: string;
  nameHe: string;
  descHe: string;
  check: (stats: UserStats) => boolean;
  // Optional: how close the user is to unlocking this achievement, for
  // display on the locked state. Omitted for binary/trivial achievements
  // (e.g. "first correct answer") where a progress count adds no value.
  progress?: (stats: UserStats) => { current: number; target: number };
}

export interface CourseItem {
  id: string;
  type: "video" | "image";
  url: string;
  caption: string;
  createdAt: number;
}

// The shape returned by the API for the signed-in user - used by both the
// web app (auth state) and the api itself (tRPC context/output types).
export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}
