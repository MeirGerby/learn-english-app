import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { WORD_DATA } from "@learn-english/shared";
import type { CategoryKey, WordEntry } from "@learn-english/shared";

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
