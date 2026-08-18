import { loadWords, getCategoryKeys, getCategoryLabel } from "./words-db.js";
import { recordAnswer, recordGameCompleted } from "./user-stats.js";

const SCRAMBLE_SESSION_SIZE = 10;

const state = {
  category: "basics",
  words: [],
  order: [],
  index: 0,
  hintsUsedThisWord: 0,
  correctCount: 0,
  score: Number(localStorage.getItem("eng-score") || 0),
  streak: Number(localStorage.getItem("eng-streak") || 0),
};

const categorySelect = document.getElementById("category");
const loadingMessage = document.getElementById("loading-message");
const gameArea = document.getElementById("game-area");
const mainView = document.querySelector("#game-area .view");
const resultsView = document.getElementById("scramble-results-view");

function saveStats() {
  localStorage.setItem("eng-score", state.score);
  localStorage.setItem("eng-streak", state.streak);
  document.getElementById("score").textContent = `ניקוד: ${state.score}`;
  document.getElementById("streak").textContent = `רצף: ${state.streak}`;
}

function populateCategories() {
  getCategoryKeys().forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = getCategoryLabel(key);
    categorySelect.appendChild(opt);
  });
  categorySelect.value = state.category;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function scrambleWord(word) {
  const letters = word.toUpperCase().split("");
  let scrambled;
  do {
    scrambled = shuffle(letters).join("");
  } while (scrambled === word.toUpperCase() && letters.length > 1);
  return scrambled;
}

async function startRound() {
  loadingMessage.classList.remove("hidden");
  gameArea.classList.add("hidden");

  const words = await loadWords(state.category);
  state.words = words;
  // Multi-word phrases (e.g. "ask for", "a lot of") don't work as a letter
  // scramble - their spaces/slashes get shuffled into nonsense. Prefer
  // single-word entries for this game; fall back to the full list only if
  // a category has too few single words to fill a session.
  const singleWordCandidates = state.words.filter((w) => !/[\s/]/.test(w.word));
  const pool = singleWordCandidates.length >= SCRAMBLE_SESSION_SIZE ? singleWordCandidates : state.words;
  state.order = shuffle(pool).slice(0, Math.min(SCRAMBLE_SESSION_SIZE, pool.length));
  state.index = 0;
  state.correctCount = 0;

  loadingMessage.classList.add("hidden");
  gameArea.classList.remove("hidden");
  resultsView.classList.add("hidden");
  mainView.classList.remove("hidden");
  renderWord();
}

function renderWord() {
  const total = state.order.length;
  const current = state.order[state.index];
  state.hintsUsedThisWord = 0;

  document.getElementById("scramble-progress-text").textContent = `מילה ${state.index + 1} מתוך ${total}`;
  document.getElementById("scramble-progress-fill").style.width = `${(state.index / total) * 100}%`;
  document.getElementById("scramble-letters").textContent = scrambleWord(current.word);
  document.getElementById("scramble-hint-text").textContent = "";
  document.getElementById("scramble-hint-text").classList.remove("visible");
  document.getElementById("scramble-feedback").textContent = "";
  const input = document.getElementById("scramble-input");
  input.value = "";
  input.disabled = false;
  input.focus();
}

function handleSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("scramble-input");
  if (input.disabled) return;
  const current = state.order[state.index];
  const guess = input.value.trim().toLowerCase();
  const feedback = document.getElementById("scramble-feedback");

  if (guess === current.word.toLowerCase()) {
    const points = Math.max(10 - state.hintsUsedThisWord * 3, 2);
    state.score += points;
    state.streak += 1;
    state.correctCount += 1;
    feedback.textContent = `נכון! +${points} נקודות ✓`;
    feedback.style.color = "var(--green)";
    input.disabled = true;
    saveStats();
    recordAnswer({ points, correct: true, currentStreak: state.streak });
    setTimeout(advance, 900);
  } else {
    feedback.textContent = "לא בדיוק, נסו שוב!";
    feedback.style.color = "var(--red)";
    state.streak = 0;
    saveStats();
    recordAnswer({ points: 0, correct: false, currentStreak: 0 });
  }
}

function advance() {
  state.index += 1;
  if (state.index >= state.order.length) {
    showResults();
  } else {
    renderWord();
  }
}

function handleHint() {
  const current = state.order[state.index];
  state.hintsUsedThisWord += 1;
  const hintText = document.getElementById("scramble-hint-text");
  hintText.textContent = `רמז: ${current.translation}`;
  hintText.classList.add("visible");
}

function handleSkip() {
  const current = state.order[state.index];
  const feedback = document.getElementById("scramble-feedback");
  feedback.textContent = `המילה הייתה: ${current.word}`;
  feedback.style.color = "var(--red)";
  state.streak = 0;
  saveStats();
  document.getElementById("scramble-input").disabled = true;
  setTimeout(advance, 1200);
}

function showResults() {
  mainView.classList.add("hidden");
  resultsView.classList.remove("hidden");
  document.getElementById("scramble-results-summary").textContent =
    `פתרתם נכון ${state.correctCount} מתוך ${state.order.length} מילים.`;
  recordGameCompleted("scramble");
}

document.getElementById("scramble-form").addEventListener("submit", handleSubmit);
document.getElementById("scramble-hint-btn").addEventListener("click", handleHint);
document.getElementById("scramble-skip-btn").addEventListener("click", handleSkip);
document.getElementById("scramble-restart").addEventListener("click", startRound);

categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  startRound();
});

populateCategories();
startRound();
saveStats();
