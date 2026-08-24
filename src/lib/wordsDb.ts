import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { WORD_DATA, CATEGORY_LABELS, CATEGORY_BANDS } from "@/data/wordData";
import type { Band, CategoryKey, WordEntry } from "@/types";

const BAND_LABELS: Record<Band, string> = {
  1: "רמה 1 - בסיס",
  2: "רמה 2 - בינוני",
  3: "רמה 3 - מתקדם",
};

const FETCH_TIMEOUT_MS = 5000;

function timeout(ms: number): Promise<"TIMEOUT"> {
  return new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), ms));
}

async function fetchWords(category: CategoryKey): Promise<WordEntry[]> {
  try {
    const q = query(collection(db, "words"), where("category", "==", category));
    const result = await Promise.race([getDocs(q), timeout(FETCH_TIMEOUT_MS)]);
    if (result !== "TIMEOUT" && !result.empty) {
      return result.docs.map((docSnap) => {
        const data = docSnap.data();
        return { word: data.word, translation: data.translation, example: data.example };
      });
    }
    if (result === "TIMEOUT") {
      console.warn(`Firestore word fetch timed out for "${category}", using local fallback.`);
    }
  } catch (err) {
    console.warn(`Firestore word fetch failed for "${category}", using local fallback.`, err);
  }
  return WORD_DATA[category] ?? [];
}

// Session-scoped cache: every category switch, game mount, and round
// restart across the whole app calls loadWords() for the same handful of
// categories over and over, and each miss races a 5s Firestore timeout
// (see fetchWords above) - a real, repeated cost on the school wifi this
// audience uses. Caching the promise (not just the resolved value) means
// concurrent callers for the same category (e.g. two games mounting near
// simultaneously) also dedupe onto one Firestore request instead of two.
// Cached for the lifetime of the tab (module-level, resets on reload) -
// matching the session-scoped caching this app already uses for placement
// status. fetchWords() never rejects (it catches everything internally and
// falls back to the bundled word list), but the .catch() below is a
// defensive backstop so a future change to fetchWords can't silently turn
// a single bad call into a permanently-poisoned cache entry for the rest
// of the session.
const wordCache = new Map<CategoryKey, Promise<WordEntry[]>>();

// Loads the word list for a category from Firestore (the source of truth
// once an admin has run the one-time import in the admin page). Falls
// back to the bundled wordData.ts content if Firestore is empty, errors,
// or hangs, so the site keeps working either way. Note: a stalled
// getDocs() call can hang forever rather than reject (seen with broken
// IndexedDB), so this races it against a timeout rather than relying on
// try/catch alone.
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

export function getCategoryKeys(): CategoryKey[] {
  return Object.keys(WORD_DATA) as CategoryKey[];
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
  return getCategoryKeys().filter((key) => getCategoryBand(key) === band);
}

// Every category at or below the given band - what a user placed into
// that band has unlocked.
export function getCategoryKeysUpToBand(maxBand: Band): CategoryKey[] {
  return getCategoryKeys().filter((key) => getCategoryBand(key) <= maxBand);
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
