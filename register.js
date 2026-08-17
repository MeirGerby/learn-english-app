import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const ERROR_MESSAGES = {
  "auth/email-already-in-use": "כתובת האימייל כבר רשומה במערכת.",
  "auth/invalid-email": "כתובת אימייל לא תקינה.",
  "auth/weak-password": "הסיסמה חלשה מדי.",
};

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;
  const errorEl = document.getElementById("register-error");
  errorEl.textContent = "";

  if (password !== confirm) {
    errorEl.textContent = "הסיסמאות אינן תואמות.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    errorEl.textContent = ERROR_MESSAGES[err.code] || "אירעה שגיאה. נסו שוב.";
  }
});
