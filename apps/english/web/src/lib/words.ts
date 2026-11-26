import {
  WORD_DATA,
  type CategoryKey,
  type WordEntry,
} from '@learn-english/english-contract';
import { queryClient } from './query-client';
import { trpcClient } from './trpc';

// Longer than a normal request: the BFF may be waking from a cold start on
// Render's free tier (30-50 s), and the bundled list is a fine fallback.
const FETCH_TIMEOUT_MS = 15_000;

// `id` exists only for a word that came from the database. A word from the
// bundled fallback has none, so its answers update the score but not the
// per-word progress.
export interface WordEntryWithId extends WordEntry {
  id?: string;
}

function timeout(ms: number): Promise<'TIMEOUT'> {
  return new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), ms));
}

async function fetchWords(category: CategoryKey): Promise<WordEntryWithId[]> {
  try {
    const result = await Promise.race([
      trpcClient.words.listByCategory.query({ category }),
      timeout(FETCH_TIMEOUT_MS),
    ]);

    if (result !== 'TIMEOUT' && result.length > 0) {
      return result.map(({ id, word, translation, example }) => ({
        id,
        word,
        translation,
        example,
      }));
    }
  } catch (error) {
    console.warn(
      `Word fetch failed for "${category}", using the bundled list.`,
      error,
    );
  }

  return WORD_DATA[category];
}

// Cached in TanStack Query for the whole tab: category switches, game
// mounts and restarts reuse one request, and two callers that ask at once
// share it. fetchWords never rejects, so no failure is ever cached.
export function loadWords(category: CategoryKey): Promise<WordEntryWithId[]> {
  return queryClient.fetchQuery({
    queryKey: ['words', category],
    queryFn: () => fetchWords(category),
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
