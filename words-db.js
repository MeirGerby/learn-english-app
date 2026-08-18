import { db } from "./firebase-config.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const FETCH_TIMEOUT_MS = 5000;

function timeout(ms) {
  return new Promise((resolve) => setTimeout(() => resolve("TIMEOUT"), ms));
}

// Loads the word list for a category from Firestore (the source of
// truth once an admin has run the one-time import in admin.html). Falls
// back to the bundled data.js content if Firestore is unreachable, slow,
// or the category hasn't been imported yet, so the site keeps working
// either way. Note: a stalled getDocs() call can hang forever rather than
// reject (seen with broken IndexedDB), so this races it against a timeout
// rather than relying on try/catch alone.
export async function loadWords(category) {
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
  return window.WORD_DATA[category] || [];
}

export function getCategoryKeys() {
  return Object.keys(window.WORD_DATA);
}

export function getCategoryLabel(key) {
  return window.CATEGORY_LABELS[key] || key;
}

export function getCategoryLevel(key) {
  return window.CATEGORY_LEVELS[key] || "beginner";
}

export function getAdvancedCategoryKeys() {
  return getCategoryKeys().filter((key) => getCategoryLevel(key) === "advanced");
}

export function getBeginnerCategoryKeys() {
  return getCategoryKeys().filter((key) => getCategoryLevel(key) === "beginner");
}
