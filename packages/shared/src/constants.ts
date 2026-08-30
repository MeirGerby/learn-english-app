import type { Band, CategoryKey } from "./types.js";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  basics: "בסיס",
  food: "אוכל",
  travel: "טיולים",
  business: "עסקים",
  technology: "טכנולוגיה",
  society: "חברה וסביבה",
  foundation: "אוצר מילים - Band I",
  idioms: "ניבים",
  phrasalVerbs: "פעלים דו-מיליים",
  advancedVocab: "אוצר מילים מתקדם",
};

// Band 1 = beginner (everyday basics + the Cambridge Foundation Band I
// list), Band 2 = intermediate, Band 3 = advanced (idioms/phrasal verbs/
// abstract vocabulary).
export const CATEGORY_BANDS: Record<CategoryKey, Band> = {
  basics: 1,
  food: 1,
  travel: 1,
  foundation: 1,
  business: 2,
  technology: 2,
  society: 2,
  idioms: 3,
  phrasalVerbs: 3,
  advancedVocab: 3,
};

export const CATEGORY_KEYS = Object.keys(CATEGORY_LABELS) as CategoryKey[];

export const BAND_LABELS: Record<Band, string> = {
  1: "רמה 1 - בסיס",
  2: "רמה 2 - בינוני",
  3: "רמה 3 - מתקדם",
};

export const GAME_KEYS = [
  "quiz",
  "scramble",
  "fillBlank",
  "listening",
  "speedRound",
  "wordMatch",
  "typeWord",
  "sentenceBuilder",
] as const;

export function getCategoryKeys(): CategoryKey[] {
  return CATEGORY_KEYS;
}

export function getCategoryLabel(key: CategoryKey): string {
  return CATEGORY_LABELS[key] ?? key;
}

export function getCategoryBand(key: CategoryKey): Band {
  return CATEGORY_BANDS[key] ?? 1;
}

export function getBandLabel(band: Band): string {
  return BAND_LABELS[band];
}

export function getCategoryKeysForBand(band: Band): CategoryKey[] {
  return CATEGORY_KEYS.filter((key) => getCategoryBand(key) === band);
}

// Every category at or below the given band - what a user placed into
// that band has unlocked.
export function getCategoryKeysUpToBand(maxBand: Band): CategoryKey[] {
  return CATEGORY_KEYS.filter((key) => getCategoryBand(key) <= maxBand);
}
