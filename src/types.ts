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
}

export interface CourseItem {
  id: string;
  type: "video" | "image";
  url: string;
  caption: string;
  createdAt: number;
}
