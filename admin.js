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
