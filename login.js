import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

const ERROR_MESSAGES = {
  "auth/invalid-email": "כתובת אימייל לא תקינה.",
  "auth/user-disabled": "המשתמש הזה חסום.",
  "auth/user-not-found": "לא נמצא משתמש עם אימייל זה.",
  "auth/wrong-password": "סיסמה שגויה.",
  "auth/invalid-credential": "אימייל או סיסמה שגויים.",
  "auth/too-many-requests": "יותר מדי ניסיונות. נסו שוב מאוחר יותר.",
};

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "index.html";
  } catch (err) {
    errorEl.textContent = ERROR_MESSAGES[err.code] || "אירעה שגיאה. נסו שוב.";
  }
});
