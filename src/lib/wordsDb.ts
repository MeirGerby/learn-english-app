import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { WORD_DATA, CATEGORY_LABELS, CATEGORY_LEVELS } from "@/data/wordData";
import type { CategoryKey, WordEntry } from "@/types";

const FETCH_TIMEOUT_MS = 5000;

function timeout(ms: number): Promise<"TIMEOUT"> {
  return new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), ms));
}

// Loads the word list for a category from Firestore (the source of truth
// once an admin has run the one-time import in the admin page). Falls
// back to the bundled wordData.ts content if Firestore is empty, errors,
// or hangs, so the site keeps working either way. Note: a stalled
// getDocs() call can hang forever rather than reject (seen with broken
// IndexedDB), so this races it against a timeout rather than relying on
// try/catch alone.
export async function loadWords(category: CategoryKey): Promise<WordEntry[]> {
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

export function getCategoryKeys(): CategoryKey[] {
  return Object.keys(WORD_DATA) as CategoryKey[];
}

export function getCategoryLabel(key: CategoryKey): string {
  return CATEGORY_LABELS[key] ?? key;
}

export function getCategoryLevel(key: CategoryKey): "beginner" | "advanced" {
  return CATEGORY_LEVELS[key] ?? "beginner";
}

export function getAdvancedCategoryKeys(): CategoryKey[] {
  return getCategoryKeys().filter((key) => getCategoryLevel(key) === "advanced");
}

export function getBeginnerCategoryKeys(): CategoryKey[] {
  return getCategoryKeys().filter((key) => getCategoryLevel(key) === "beginner");
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
