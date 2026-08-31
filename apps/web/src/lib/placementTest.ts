import { loadWords } from "./wordsDb";
import { getCategoryKeysForBand, pickDistractors, shuffle } from "@learn-english/shared";
import type { Band, WordEntry } from "@learn-english/shared";

export interface PlacementQuestion {
  word: WordEntry;
  band: Band;
  options: WordEntry[];
}

const QUESTIONS_PER_BAND = 8;
const BANDS: Band[] = [1, 2, 3];

// Builds a mixed-difficulty multiple-choice test (word -> pick the
// correct translation) drawing from all three bands, so the score
// reflects how far into the curriculum the learner can actually go.
export async function generatePlacementTest(): Promise<PlacementQuestion[]> {
  const wordsByBand: Record<Band, WordEntry[]> = { 1: [], 2: [], 3: [] };

  for (const band of BANDS) {
    const categories = getCategoryKeysForBand(band);
    const lists = await Promise.all(categories.map((c) => loadWords(c)));
    wordsByBand[band] = lists.flat();
  }

  const globalPool = [...wordsByBand[1], ...wordsByBand[2], ...wordsByBand[3]];

  const questions: PlacementQuestion[] = [];
  for (const band of BANDS) {
    const picked = shuffle(wordsByBand[band]).slice(0, Math.min(QUESTIONS_PER_BAND, wordsByBand[band].length));
    for (const word of picked) {
      const wrong = pickDistractors(globalPool, word, 3);
      questions.push({ word, band, options: shuffle([word, ...wrong]) });
    }
  }

  return shuffle(questions);
}
