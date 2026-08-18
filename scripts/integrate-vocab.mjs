// Splices JSON word batches from scripts/generated/<category>.json into
// src/data/wordData.ts's WORD_DATA object, inserting before each
// category's closing bracket. Run this after reviewing the generated
// JSON for quality (see scripts/generate-vocab.mjs).
//
// Usage: node scripts/integrate-vocab.mjs category1 category2 ...
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORD_DATA_PATH = path.join(__dirname, "..", "src", "data", "wordData.ts");

const categories = process.argv.slice(2);
if (!categories.length) {
  console.error("Usage: node scripts/integrate-vocab.mjs <category> [category2 ...]");
  process.exit(1);
}

function insertIntoArray(text, key, items) {
  const startMarker = `${key}: [`;
  const startIdx = text.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`key "${key}" not found in wordData.ts`);
  const arrStart = startIdx + startMarker.length - 1;
  let depth = 0;
  let i = arrStart;
  for (; i < text.length; i++) {
    if (text[i] === "[") depth++;
    else if (text[i] === "]") {
      depth--;
      if (depth === 0) break;
    }
  }
  const arrEnd = i;
  const before = text.slice(0, arrEnd);
  const after = text.slice(arrEnd);
  const trimmed = before.replace(/,?\s*$/, "");
  const isEmpty = trimmed.endsWith("[");

  const itemsCode = items
    .map(
      (it) =>
        `    { word: ${JSON.stringify(it.word)}, translation: ${JSON.stringify(it.translation)}, example: ${JSON.stringify(it.example)} }`
    )
    .join(",\n");

  const insertion = isEmpty ? `\n${itemsCode}\n  ` : `,\n${itemsCode}\n  `;
  return trimmed + insertion + after;
}

let text = readFileSync(WORD_DATA_PATH, "utf-8");
for (const cat of categories) {
  const items = JSON.parse(readFileSync(path.join(__dirname, "generated", `${cat}.json`), "utf-8"));
  text = insertIntoArray(text, cat, items);
  console.log(`Inserted ${items.length} items into "${cat}"`);
}
writeFileSync(WORD_DATA_PATH, text, "utf-8");
console.log("Done - wordData.ts updated. Run `npm run build` and review the diff before committing.");
