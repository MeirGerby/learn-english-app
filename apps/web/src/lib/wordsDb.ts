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

// Loads the word list for a category from the API (Postgres, seeded from
// the same WORD_DATA this falls back to). Falls back to the bundled
// wordData.ts content if the API is empty, errors, or is too slow, so the
// site keeps working either way.
export async function loadWords(category: CategoryKey): Promise<WordEntry[]> {
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
