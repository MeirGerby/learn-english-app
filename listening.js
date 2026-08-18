import { loadWords, getAdvancedCategoryKeys, getCategoryLabel } from "./words-db.js";
import { recordAnswer, recordGameCompleted } from "./user-stats.js";

const ROUND_SIZE = 10;

const state = {
  category: null,
  words: [],
  order: [],
  index: 0,
  hintUsedThisWord: false,
  correctCount: 0,
  score: Number(localStorage.getItem("eng-score") || 0),
  streak: Number(localStorage.getItem("eng-streak") || 0),
};

const categorySelect = document.getElementById("category");
const loadingMessage = document.getElementById("loading-message");
const unsupportedMessage = document.getElementById("unsupported-message");
const gameContent = document.getElementById("game-content");
const roundView = document.getElementById("round-view");
const resultsView = document.getElementById("ls-results-view");

const speechSupported = "speechSynthesis" in window;

function saveStats() {
  localStorage.setItem("eng-score", state.score);
  localStorage.setItem("eng-streak", state.streak);
  document.getElementById("score").textContent = `ניקוד: ${state.score}`;
  document.getElementById("streak").textContent = `רצף: ${state.streak}`;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function populateCategories() {
  const keys = getAdvancedCategoryKeys();
  keys.forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = getCategoryLabel(key);
    categorySelect.appendChild(opt);
  });
  state.category = keys[0];
  categorySelect.value = state.category;
}

function speak(text) {
  if (!speechSupported) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

async function startRound() {
  loadingMessage.classList.remove("hidden");
  gameContent.classList.add("hidden");

  state.words = await loadWords(state.category);
  state.order = shuffle(state.words).slice(0, Math.min(ROUND_SIZE, state.words.length));
  state.index = 0;
  state.correctCount = 0;

  loadingMessage.classList.add("hidden");
  gameContent.classList.remove("hidden");
  resultsView.classList.add("hidden");
  roundView.classList.remove("hidden");

  renderWord();
}

function renderWord() {
  state.hintUsedThisWord = false;
  const total = state.order.length;
  const current = state.order[state.index];

  document.getElementById("ls-progress-text").textContent = `מילה ${state.index + 1} מתוך ${total}`;
  document.getElementById("ls-progress-fill").style.width = `${(state.index / total) * 100}%`;
  document.getElementById("ls-feedback").textContent = "";
  const input = document.getElementById("ls-input");
  input.value = "";
  input.disabled = false;
  input.focus();

  speak(current.word);
}

function normalize(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function handleSubmit(e) {
  e.preventDefault();
  const input = document.getElementById("ls-input");
  if (input.disabled) return;
  const current = state.order[state.index];
  const guess = normalize(input.value);
  const feedback = document.getElementById("ls-feedback");

  if (guess === normalize(current.word)) {
    const points = state.hintUsedThisWord ? 6 : 12;
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
    feedback.textContent = "לא בדיוק, נסו שוב! (או האזינו שוב)";
    feedback.style.color = "var(--red)";
    state.streak = 0;
    saveStats();
    recordAnswer({ points: 0, correct: false, currentStreak: 0 });
  }
}

function handleHint() {
  state.hintUsedThisWord = true;
  const current = state.order[state.index];
  const feedback = document.getElementById("ls-feedback");
  feedback.textContent = `רמז: ${current.translation}`;
  feedback.style.color = "var(--muted)";
}

function handleSkip() {
  const current = state.order[state.index];
  const feedback = document.getElementById("ls-feedback");
  feedback.textContent = `המילה הייתה: ${current.word}`;
  feedback.style.color = "var(--red)";
  state.streak = 0;
  saveStats();
  document.getElementById("ls-input").disabled = true;
  setTimeout(advance, 1400);
}

function advance() {
  state.index += 1;
  if (state.index >= state.order.length) {
    showResults();
  } else {
    renderWord();
  }
}

function showResults() {
  window.speechSynthesis?.cancel();
  roundView.classList.add("hidden");
  resultsView.classList.remove("hidden");
  document.getElementById("ls-results-summary").textContent =
    `שמעתם וכתבתם נכון ${state.correctCount} מתוך ${state.order.length} מילים.`;
  recordGameCompleted("listening");
}

document.getElementById("ls-form").addEventListener("submit", handleSubmit);
document.getElementById("ls-hint-btn").addEventListener("click", handleHint);
document.getElementById("ls-skip-btn").addEventListener("click", handleSkip);
document.getElementById("ls-play-btn").addEventListener("click", () => {
  const current = state.order[state.index];
  if (current) speak(current.word);
});
document.getElementById("ls-restart").addEventListener("click", startRound);
categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  startRound();
});

if (!speechSupported) {
  unsupportedMessage.classList.remove("hidden");
}

populateCategories();
startRound();
saveStats();
