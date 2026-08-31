import type { WordEntry } from "./types.js";

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Picks `count` multiple-choice distractors from `pool` for `correct`,
// preferring candidates whose Hebrew translation doesn't already appear
// among the options. English is many-to-one with Hebrew in this word
// bank (several distinct English words can share one translation), so
// filtering distractors only by English word can put two visibly-identical
// answer buttons in front of a student, one graded correct and one wrong,
// with no way to tell them apart. Falls back to allowing a duplicate
// translation only if the pool genuinely doesn't have enough distinct-
// translation candidates (a thin category) - never throws or loops forever.
export function pickDistractors(pool: WordEntry[], correct: WordEntry, count = 3): WordEntry[] {
  const candidates = shuffle(pool.filter((w) => w.word !== correct.word));
  const picked: WordEntry[] = [];
  const usedTranslations = new Set([correct.translation]);
  for (const w of candidates) {
    if (picked.length >= count) break;
    if (usedTranslations.has(w.translation)) continue;
    picked.push(w);
    usedTranslations.add(w.translation);
  }
  if (picked.length < count) {
    const pickedWords = new Set(picked.map((w) => w.word));
    for (const w of candidates) {
      if (picked.length >= count) break;
      if (pickedWords.has(w.word)) continue;
      picked.push(w);
      pickedWords.add(w.word);
    }
  }
  return picked;
}

// Picks `count` words from `pool` with mutually-distinct Hebrew
// translations, for games (like Word Match) that render every picked
// word's translation on screen at once rather than grading against one
// "correct" answer - same many-to-one English/Hebrew risk as
// pickDistractors above, but here two picked words sharing a translation
// makes two on-screen cells visually identical with no "correct" one to
// disambiguate against. Same greedy-then-fallback shape as pickDistractors.
export function pickRoundWithDistinctTranslations(pool: WordEntry[], count: number): WordEntry[] {
  const candidates = shuffle(pool);
  const picked: WordEntry[] = [];
  const usedTranslations = new Set<string>();
  for (const w of candidates) {
    if (picked.length >= count) break;
    if (usedTranslations.has(w.translation)) continue;
    picked.push(w);
    usedTranslations.add(w.translation);
  }
  if (picked.length < count) {
    const pickedWords = new Set(picked.map((w) => w.word));
    for (const w of candidates) {
      if (picked.length >= count) break;
      if (pickedWords.has(w.word)) continue;
      picked.push(w);
      pickedWords.add(w.word);
    }
  }
  return picked;
}
