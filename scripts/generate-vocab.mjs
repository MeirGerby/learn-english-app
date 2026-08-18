// Phase 2 vocabulary expansion tool - generates new WordEntry batches via
// the Gemini API and writes one JSON file per category to scripts/generated/
// (gitignored). Integration into src/data/wordData.ts is a separate,
// reviewed step (see scripts/integrate-vocab.mjs) - this script never
// touches the app source itself.
//
// Usage: GEMINI_API_KEY=... [GEMINI_MODEL=gemini-3.6-flash] node scripts/generate-vocab.mjs
//
// Edit the CATEGORIES list below before each run - pick whichever
// bands/categories currently need the most content (check CATEGORY_BANDS
// and word counts in src/data/wordData.ts first). Free-tier Gemini quota
// is limited per model per day; if one model's quota runs out mid-run,
// rerun with a different GEMINI_MODEL (separate quota pool) rather than
// waiting - see CLAUDE.md's Learned Rules for models known to work on
// this project's key.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "generated");
mkdirSync(OUT_DIR, { recursive: true });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Set GEMINI_API_KEY env var");
  process.exit(1);
}
const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const WORD_DATA_PATH = path.join(__dirname, "..", "src", "data", "wordData.ts");

const BATCH_SIZE = 80;
const MAX_ATTEMPTS = 10;

// Example config - replace with whatever category/band actually needs
// content next. `isNew`/`band`/`label` are only relevant for a category
// that doesn't exist in wordData.ts yet (you'll still need to add it to
// CategoryKey/CATEGORY_LABELS/CATEGORY_BANDS by hand before integrating).
const CATEGORIES = [
  {
    key: "business",
    targetNew: 100,
    prompt:
      "CEFR B1-B2 intermediate English vocabulary about the workplace, business, and office life for a Hebrew-speaking learner: meetings, emails, projects, teamwork, careers, finance basics. Genuinely intermediate difficulty.",
  },
];

function extractExistingWords(wordDataText) {
  const set = new Set();
  const re = /word:\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(wordDataText))) set.add(m[1].toLowerCase());
  return set;
}

async function callGemini(prompt, existingList) {
  const body = {
    contents: [
      {
        parts: [
          {
            text: `${prompt}

Generate exactly ${BATCH_SIZE} NEW vocabulary entries. Do not include any of these words/phrases (already used, case-insensitive): ${existingList.join(", ") || "(none yet)"}.

Return a JSON array. Each item: {"word": "...", "translation": "...", "example": "..."}.
- "word": the English word or short phrase, natural casing.
- "translation": a direct Hebrew word/phrase translation only - never a descriptive sentence.
- "example": one natural English sentence that uses the word/phrase, appropriate to the stated difficulty level.
No duplicates within your own output.`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            word: { type: "STRING" },
            translation: { type: "STRING" },
            example: { type: "STRING" },
          },
          required: ["word", "translation", "example"],
        },
      },
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${JSON.stringify(json).slice(0, 500)}`);
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";
  return JSON.parse(text);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const wordDataText = readFileSync(WORD_DATA_PATH, "utf-8");
  const globalSeen = extractExistingWords(wordDataText);
  console.log(`Loaded ${globalSeen.size} existing words for dedupe. Model: ${MODEL}`);

  for (const cat of CATEGORIES) {
    console.log(`\n=== ${cat.key} (target +${cat.targetNew}) ===`);
    const collected = [];
    let attempts = 0;
    while (collected.length < cat.targetNew && attempts < MAX_ATTEMPTS) {
      attempts++;
      const recentSample = [...globalSeen].slice(-250);
      let batch;
      try {
        batch = await callGemini(cat.prompt, recentSample);
      } catch (e) {
        console.error(`  batch failed (attempt ${attempts}):`, e.message);
        await sleep(2000);
        continue;
      }
      let added = 0;
      for (const item of batch) {
        if (!item?.word || !item?.translation || !item?.example) continue;
        const key = item.word.trim().toLowerCase();
        if (!key || globalSeen.has(key)) continue;
        globalSeen.add(key);
        collected.push({ word: item.word.trim(), translation: item.translation.trim(), example: item.example.trim() });
        added++;
        if (collected.length >= cat.targetNew) break;
      }
      console.log(`  batch ${attempts}: +${added} (total ${collected.length}/${cat.targetNew})`);
      await sleep(1200);
    }
    writeFileSync(path.join(OUT_DIR, `${cat.key}.json`), JSON.stringify(collected, null, 2), "utf-8");
    console.log(`  wrote generated/${cat.key}.json (${collected.length} words)`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
