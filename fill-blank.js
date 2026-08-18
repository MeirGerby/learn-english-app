import { loadWords, getAdvancedCategoryKeys, getCategoryLabel } from "./words-db.js";
import { recordAnswer, recordGameCompleted } from "./user-stats.js";

const ROUND_SIZE = 10;
const POINTS_PER_CORRECT = 10;

const state = {
  category: null,
  words: [],
  order: [],
  index: 0,
  correctCount: 0,
  score: Number(localStorage.getItem("eng-score") || 0),
  streak: Number(localStorage.getItem("eng-streak") || 0),
  answered: false,
};

const categorySelect = document.getElementById("category");
const loadingMessage = document.getElementById("loading-message");
const gameContent = document.getElementById("game-content");
const roundView = document.getElementById("round-view");
const resultsView = document.getElementById("fb-results-view");

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

function blankOutWord(example, word) {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "i");
  if (re.test(example)) {
    return example.replace(re, "_____");
  }
  return example;
}

async function startRound() {
  loadingMessage.classList.remove("hidden");
  gameContent.classList.add("hidden");

  // Only sentences that actually contain the target word can be blanked.
  const words = await loadWords(state.category);
  state.words = words.filter((w) => blankOutWord(w.example, w.word) !== w.example);

  state.order = shuffle(state.words).slice(0, Math.min(ROUND_SIZE, state.words.length));
  state.index = 0;
  state.correctCount = 0;

  loadingMessage.classList.add("hidden");
  gameContent.classList.remove("hidden");
  resultsView.classList.add("hidden");
  roundView.classList.remove("hidden");

  renderQuestion();
}

function renderQuestion() {
  state.answered = false;
  const total = state.order.length;
  const current = state.order[state.index];

  document.getElementById("fb-progress-text").textContent = `משפט ${state.index + 1} מתוך ${total}`;
  document.getElementById("fb-progress-fill").style.width = `${(state.index / total) * 100}%`;
  document.getElementById("fb-sentence").textContent = blankOutWord(current.example, current.word);
  document.getElementById("fb-feedback").textContent = "";

  const wrongOptions = shuffle(state.words.filter((w) => w.word !== current.word)).slice(0, 3);
  const options = shuffle([current, ...wrongOptions]);

  const optionsEl = document.getElementById("fb-options");
  optionsEl.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt.word;
    btn.style.direction = "ltr";
    btn.addEventListener("click", () => handleAnswer(btn, opt, current));
    optionsEl.appendChild(btn);
  });
}

function handleAnswer(btn, chosen, correct) {
  if (state.answered) return;
  state.answered = true;

  const allBtns = document.querySelectorAll(".quiz-option");
  allBtns.forEach((b) => (b.disabled = true));

  const feedback = document.getElementById("fb-feedback");
  const isCorrect = chosen.word === correct.word;
  if (isCorrect) {
    btn.classList.add("correct");
    feedback.textContent = "נכון! ✓";
    feedback.style.color = "var(--green)";
    state.score += POINTS_PER_CORRECT;
    state.streak += 1;
    state.correctCount += 1;
  } else {
    btn.classList.add("incorrect");
    allBtns.forEach((b) => {
      if (b.textContent === correct.word) b.classList.add("correct");
    });
    feedback.textContent = `לא נכון. המילה הנכונה: "${correct.word}"`;
    feedback.style.color = "var(--red)";
    state.streak = 0;
  }
  saveStats();
  recordAnswer({ points: isCorrect ? POINTS_PER_CORRECT : 0, correct: isCorrect, currentStreak: state.streak });

  setTimeout(() => {
    state.index += 1;
    if (state.index >= state.order.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }, 1200);
}

function showResults() {
  roundView.classList.add("hidden");
  resultsView.classList.remove("hidden");
  document.getElementById("fb-results-summary").textContent =
    `ענית נכון על ${state.correctCount} מתוך ${state.order.length} משפטים.`;
  recordGameCompleted("fillBlank");
}

document.getElementById("fb-restart").addEventListener("click", startRound);
categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  startRound();
});

populateCategories();
startRound();
saveStats();
