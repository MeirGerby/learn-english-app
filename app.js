const QUIZ_SESSION_SIZE = 10;

const state = {
  mode: "flashcards",
  category: "basics",
  words: [],
  fcIndex: 0,
  flipped: false,
  quizIndex: 0,
  quizOrder: [],
  quizCorrectCount: 0,
  score: Number(localStorage.getItem("eng-score") || 0),
  streak: Number(localStorage.getItem("eng-streak") || 0),
};

const categorySelect = document.getElementById("category");
const tabBtns = document.querySelectorAll(".tab-btn");
const views = {
  flashcards: document.getElementById("flashcards-view"),
  quiz: document.getElementById("quiz-view"),
  results: document.getElementById("results-view"),
};

function saveStats() {
  localStorage.setItem("eng-score", state.score);
  localStorage.setItem("eng-streak", state.streak);
  document.getElementById("score").textContent = `ניקוד: ${state.score}`;
  document.getElementById("streak").textContent = `רצף: ${state.streak}`;
}

function populateCategories() {
  Object.keys(WORD_DATA).forEach((key) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = CATEGORY_LABELS[key] || key;
    categorySelect.appendChild(opt);
  });
  categorySelect.value = state.category;
}

function loadCategory() {
  state.words = WORD_DATA[state.category];
  state.fcIndex = 0;
  state.flipped = false;
  renderFlashcard();
  setupQuiz();
}

function switchMode(mode) {
  state.mode = mode;
  tabBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === mode));
  views.flashcards.classList.toggle("hidden", mode !== "flashcards");
  views.quiz.classList.toggle("hidden", mode !== "quiz");
  views.results.classList.add("hidden");
  if (mode === "quiz") setupQuiz();
}

// --- Flashcards ---

function renderFlashcard() {
  const card = state.words[state.fcIndex];
  document.getElementById("fc-word").textContent = card.word;
  document.getElementById("fc-def").textContent = card.translation;
  document.getElementById("fc-example").textContent = card.example;
  document.getElementById("fc-progress").textContent = `${state.fcIndex + 1} מתוך ${state.words.length}`;
  document.getElementById("flashcard").classList.remove("flipped");
  state.flipped = false;
}

function nextFlashcard() {
  state.fcIndex = (state.fcIndex + 1) % state.words.length;
  renderFlashcard();
}

function prevFlashcard() {
  state.fcIndex = (state.fcIndex - 1 + state.words.length) % state.words.length;
  renderFlashcard();
}

document.getElementById("flashcard").addEventListener("click", () => {
  state.flipped = !state.flipped;
  document.getElementById("flashcard").classList.toggle("flipped", state.flipped);
});

document.getElementById("fc-next").addEventListener("click", nextFlashcard);
document.getElementById("fc-prev").addEventListener("click", prevFlashcard);

document.getElementById("fc-known").addEventListener("click", () => {
  state.score += 1;
  saveStats();
  nextFlashcard();
});

document.getElementById("fc-unknown").addEventListener("click", () => {
  nextFlashcard();
});

// --- Quiz ---

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function setupQuiz() {
  state.quizOrder = shuffle(state.words).slice(0, Math.min(QUIZ_SESSION_SIZE, state.words.length));
  state.quizIndex = 0;
  state.quizCorrectCount = 0;
  views.results.classList.add("hidden");
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const total = state.quizOrder.length;
  const current = state.quizOrder[state.quizIndex];
  document.getElementById("quiz-progress-text").textContent = `שאלה ${state.quizIndex + 1} מתוך ${total}`;
  document.getElementById("quiz-progress-fill").style.width = `${(state.quizIndex / total) * 100}%`;
  document.getElementById("quiz-word").textContent = current.word;
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-next").classList.add("hidden");

  const wrongOptions = shuffle(state.words.filter((w) => w.word !== current.word)).slice(0, 3);
  const options = shuffle([current, ...wrongOptions]);

  const optionsEl = document.getElementById("quiz-options");
  optionsEl.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt.translation;
    btn.addEventListener("click", () => handleAnswer(btn, opt, current));
    optionsEl.appendChild(btn);
  });
}

function handleAnswer(btn, chosen, correct) {
  const allBtns = document.querySelectorAll(".quiz-option");
  allBtns.forEach((b) => (b.disabled = true));

  const feedback = document.getElementById("quiz-feedback");
  if (chosen.word === correct.word) {
    btn.classList.add("correct");
    feedback.textContent = "נכון! ✓";
    feedback.style.color = "var(--green)";
    state.score += 10;
    state.streak += 1;
    state.quizCorrectCount += 1;
  } else {
    btn.classList.add("incorrect");
    allBtns.forEach((b) => {
      if (b.textContent === correct.translation) b.classList.add("correct");
    });
    feedback.textContent = `לא נכון. התשובה הנכונה הייתה: "${correct.translation}"`;
    feedback.style.color = "var(--red)";
    state.streak = 0;
  }
  saveStats();
  document.getElementById("quiz-next").classList.remove("hidden");
}

document.getElementById("quiz-next").addEventListener("click", () => {
  state.quizIndex += 1;
  if (state.quizIndex >= state.quizOrder.length) {
    showResults();
  } else {
    renderQuizQuestion();
  }
});

function showResults() {
  views.quiz.classList.add("hidden");
  views.results.classList.remove("hidden");
  const total = state.quizOrder.length;
  document.getElementById("results-summary").textContent =
    `ענית נכון על ${state.quizCorrectCount} מתוך ${total} שאלות.`;
}

document.getElementById("quiz-restart").addEventListener("click", setupQuiz);

// --- Tabs & category ---

tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => switchMode(btn.dataset.mode));
});

categorySelect.addEventListener("change", () => {
  state.category = categorySelect.value;
  loadCategory();
});

// --- Init ---

populateCategories();
loadCategory();
saveStats();
