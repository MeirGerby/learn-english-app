import { auth, db, isAdmin } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

const guardMessage = document.getElementById("admin-guard-message");
const content = document.getElementById("admin-content");
const feedbackCol = collection(db, "feedback");

let currentAdmin = null;
let unsubscribeFeedback = null;

onAuthStateChanged(auth, (user) => {
  if (unsubscribeFeedback) {
    unsubscribeFeedback();
    unsubscribeFeedback = null;
  }

  if (!user) {
    currentAdmin = null;
    guardMessage.textContent = "עליכם להתחבר כדי לגשת לאזור זה. מעבירים אתכם לדף ההתחברות...";
    content.classList.add("hidden");
    setTimeout(() => (window.location.href = "login.html"), 1200);
    return;
  }

  if (!isAdmin(user)) {
    currentAdmin = null;
    guardMessage.textContent = "אין לכם הרשאה לגשת לאזור זה.";
    content.classList.add("hidden");
    return;
  }

  currentAdmin = user;
  guardMessage.classList.add("hidden");
  content.classList.remove("hidden");
  subscribeFeedback();
});

// Attached once at module load - reads currentAdmin at submit time rather
// than re-binding on every auth state change (which fires on token refresh
// too, not just login/logout).
document.getElementById("admin-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentAdmin) return;

  const input = document.getElementById("feedback-text");
  const text = input.value.trim();
  if (!text) return;

  await addDoc(feedbackCol, {
    text,
    authorEmail: currentAdmin.email,
    createdAt: serverTimestamp(),
  });
  input.value = "";
});

function subscribeFeedback() {
  const q = query(feedbackCol, orderBy("createdAt", "desc"));
  unsubscribeFeedback = onSnapshot(q, (snapshot) => {
    const list = document.getElementById("feedback-list");
    list.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const li = document.createElement("li");
      li.className = "feedback-item";

      const textEl = document.createElement("p");
      textEl.className = "feedback-text";
      textEl.textContent = data.text;

      const footer = document.createElement("div");
      footer.className = "feedback-footer";

      const metaEl = document.createElement("span");
      metaEl.className = "feedback-meta";
      const dateText = data.createdAt ? data.createdAt.toDate().toLocaleString("he-IL") : "";
      metaEl.textContent = `${data.authorEmail} · ${dateText}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "feedback-delete";
      deleteBtn.type = "button";
      deleteBtn.textContent = "מחיקה";
      deleteBtn.addEventListener("click", () => deleteDoc(doc(db, "feedback", docSnap.id)));

      footer.append(metaEl, deleteBtn);
      li.append(textEl, footer);
      list.appendChild(li);
    });
  });
}

// --- Word database import (one-time / re-runnable) ---

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function importWords() {
  const btn = document.getElementById("import-words-btn");
  const status = document.getElementById("import-status");
  btn.disabled = true;
  status.textContent = "מתחיל ייבוא...";

  const entries = [];
  Object.entries(window.WORD_DATA).forEach(([category, words]) => {
    words.forEach((w) => entries.push({ ...w, category }));
  });

  const BATCH_LIMIT = 450;
  let written = 0;

  try {
    for (let i = 0; i < entries.length; i += BATCH_LIMIT) {
      const chunk = entries.slice(i, i + BATCH_LIMIT);
      const batch = writeBatch(db);
      chunk.forEach((entry) => {
        const id = `${entry.category}__${slugify(entry.word)}`;
        batch.set(doc(db, "words", id), entry);
      });
      await batch.commit();
      written += chunk.length;
      status.textContent = `מייבא... ${written} / ${entries.length}`;
    }
    status.textContent = `✓ הייבוא הושלם! ${written} מילים יובאו בהצלחה.`;
  } catch (err) {
    status.textContent = `שגיאה בייבוא: ${err.message}`;
  } finally {
    btn.disabled = false;
  }
}

document.getElementById("import-words-btn").addEventListener("click", importWords);
