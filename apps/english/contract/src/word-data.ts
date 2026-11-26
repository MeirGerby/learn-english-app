import { WORD_DATA as SEED_WORDS } from '@learn-english/db/word-data';
import type { CategoryKey, WordEntry } from './types.js';

// The same list the `words` table is seeded from. The web uses it when the
// BFF is slow or has no words.
export const WORD_DATA: Record<CategoryKey, WordEntry[]> = SEED_WORDS;
