import { loadWords, getAdvancedCategoryKeys, getCategoryLabel } from "./words-db.js";
import { recordAnswer, recordGameCompleted } from "./user-stats.js";

const ROUND_SIZE = 12;
const TIME_PER_QUESTION_MS = 6000;
const POINTS_PER_CORRECT = 15;

const state = {
  category: null,
  words: [],
  order: [],
  index: 0,
  correctCount: 0,
  score: Number(localStorage.getItem("eng-score") || 0),
  streak: Number(localStorage.getItem("eng-streak") || 0),
  timeoutId: null,
  answered: false,
};

const categorySelect = document.getElementById("category");
const loadingMessage = document.getElementById("loading-message");
const gameContent = document.getElementById("game-content");
const roundView = document.getElementById("round-view");
const resultsView = document.getElementById("sr-results-view");

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

function clearTimer() {
  if (state.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }
}

async function startRound() {
  clearTimer();
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

  renderQuestion();
}

function renderQuestion() {
  clearTimer();
  state.answered = false;
  const total = state.order.length;
  const current = state.order[state.index];

  document.getElementById("sr-progress-text").textContent = `שאלה ${state.index + 1} מתוך ${total}`;
  document.getElementById("sr-progress-fill").style.width = `${(state.index / total) * 100}%`;
  document.getElementById("sr-word").textContent = current.word;
  document.getElementById("sr-feedback").textContent = "";

  const wrongOptions = shuffle(state.words.filter((w) => w.word !== current.word)).slice(0, 3);
  const options = shuffle([current, ...wrongOptions]);

  const optionsEl = document.getElementById("sr-options");
  optionsEl.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt.translation;
    btn.addEventListener("click", () => handleAnswer(btn, opt, current));
    optionsEl.appendChild(btn);
  });

  startTimer(current);
}

function startTimer(current) {
  const fill = document.getElementById("sr-timer-fill");
  fill.style.transition = "none";
  fill.style.width = "100%";
  void fill.offsetWidth; // force reflow so the next transition actually animates
  fill.style.transition = `width ${TIME_PER_QUESTION_MS}ms linear`;
  fill.style.width = "0%";

  state.timeoutId = setTimeout(() => handleTimeout(current), TIME_PER_QUESTION_MS);
}

function handleTimeout(current) {
  if (state.answered) return;
  state.answered = true;
  const feedback = document.getElementById("sr-feedback");
  feedback.textContent = `הזמן נגמר! התשובה הנכונה: "${current.translation}"`;
  feedback.style.color = "var(--red)";
  state.streak = 0;
  saveStats();
  recordAnswer({ points: 0, correct: false, currentStreak: 0 });
  document.querySelectorAll(".quiz-option").forEach((b) => (b.disabled = true));
  setTimeout(advance, 1200);
}

function handleAnswer(btn, chosen, correct) {
  if (state.answered) return;
  state.answered = true;
  clearTimer();

  const allBtns = document.querySelectorAll(".quiz-option");
  allBtns.forEach((b) => (b.disabled = true));

  const feedback = document.getElementById("sr-feedback");
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
      if (b.textContent === correct.translation) b.classList.add("correct");
    });
    feedback.textContent = `לא נכון. התשובה הנכונה: "${correct.translation}"`;
    feedback.style.color = "var(--red)";
    state.streak = 0;
  }
  saveStats();
  recordAnswer({ points: isCorrect ? POINTS_PER_CORRECT : 0, correct: isCorrect, currentStreak: state.streak });
  setTimeout(advance, 900);
}

function advance() {
  state.index += 1;
  if (state.index >= state.order.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults() {
  clearTimer();
  roundView.classList.add("hidden");
  resultsView.classList.remove("hidden");
  document.getElementById("sr-results-summary").textContent =
    `ענית נכון על ${state.correctCount} מתוך ${state.order.length} שאלות.`;
  recordGameCompleted("speedRound");
}

document.getElementById("sr-restart").addEventListener("click", startRound);
categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  startRound();
});

populateCategories();
startRound();
saveStats();
