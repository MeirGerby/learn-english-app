import { trpc } from "./trpc";
import { WORD_DATA } from "@learn-english/shared";
import type { CategoryKey, WordEntry } from "@learn-english/shared";

// Longer than the old Firestore-hang timeout (5s) - the API can be cold-
// starting on Render's free tier (up to ~30-50s), so give it more room
// before falling back rather than bailing out during a routine cold start.
const FETCH_TIMEOUT_MS = 15000;

function timeout(ms: number): Promise<"TIMEOUT"> {
  return new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), ms));
}

async function fetchWords(category: CategoryKey): Promise<WordEntry[]> {
  try {
    const result = await Promise.race([
      trpc.words.listByCategory.query({ category }),
      timeout(FETCH_TIMEOUT_MS),
    ]);
    if (result !== "TIMEOUT" && result.length > 0) {
      return result.map((w) => ({ word: w.word, translation: w.translation, example: w.example }));
    }
    if (result === "TIMEOUT") {
      console.warn(`API word fetch timed out for "${category}", using local fallback.`);
    }
  } catch (err) {
    console.warn(`API word fetch failed for "${category}", using local fallback.`, err);
  }
  return WORD_DATA[category] ?? [];
}

// Session-scoped cache: every category switch, game mount, and round
// restart across the whole app calls loadWords() for the same handful of
// categories over and over, and each miss races a 15s API timeout (see
// fetchWords above) - a real, repeated cost on the school wifi this
// audience uses, and worse during a Render cold start. Caching the promise
// (not just the resolved value) means concurrent callers for the same
// category (e.g. two games mounting near simultaneously) also dedupe onto
// one API request instead of two. Cached for the lifetime of the tab
// (module-level, resets on reload). fetchWords() never rejects (it catches
// everything internally and falls back to the bundled word list), but the
// .catch() below is a defensive backstop so a future change to fetchWords
// can't silently turn a single bad call into a permanently-poisoned cache
// entry for the rest of the session.
const wordCache = new Map<CategoryKey, Promise<WordEntry[]>>();

// Loads the word list for a category from the API (Postgres, seeded from
// the same WORD_DATA this falls back to). Falls back to the bundled
// wordData.ts content if the API is empty, errors, or is too slow, so the
// site keeps working either way.
export function loadWords(category: CategoryKey): Promise<WordEntry[]> {
  const cached = wordCache.get(category);
  if (cached) return cached;
  const promise = fetchWords(category).catch((err) => {
    wordCache.delete(category);
    console.warn(`Unexpected loadWords failure for "${category}", using local fallback.`, err);
    return WORD_DATA[category] ?? [];
  });
  wordCache.set(category, promise);
  return promise;
}
