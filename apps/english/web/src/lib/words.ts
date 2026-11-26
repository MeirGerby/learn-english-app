import {
  WORD_DATA,
  type CategoryKey,
  type WordEntry,
} from '@learn-english/english-contract';
import { queryClient } from './query-client';
import { trpcClient } from './trpc';

// `id` exists only for a word that came from the database. A word from the
// bundled list has none, so its answers update the score but not the
// per-word progress.
export interface WordEntryWithId extends WordEntry {
  id?: string;
}

async function fetchWords(category: CategoryKey): Promise<WordEntryWithId[]> {
  const result = await trpcClient.words.listByCategory.query({ category });

  return result.map(({ id, word, translation, example }) => ({
    id,
    word,
    translation,
    example,
  }));
}

// A game never waits for the BFF, which may be failing or waking from a cold
// start on Render's free tier (30-50 s). Until the server's list arrives,
// this answers with the bundled one and fetches in the background, so a later
// round, category switch or visit gets the server's words.
//
// The fetched list is cached in TanStack Query for the whole tab, and two
// callers that ask at once share one request. A failure is not cached, so the
// next call tries again.
export function loadWords(category: CategoryKey): Promise<WordEntryWithId[]> {
  const queryKey = ['words', category];
  const fetched = queryClient.getQueryData<WordEntryWithId[]>(queryKey);

  if (fetched?.length) return Promise.resolve(fetched);

  // Does nothing if the list is already cached; never rejects.
  void queryClient.prefetchQuery({
    queryKey,
    queryFn: () => fetchWords(category),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return Promise.resolve(WORD_DATA[category]);
}
