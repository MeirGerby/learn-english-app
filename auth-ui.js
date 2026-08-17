import { auth, isAdmin } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";

function render(user) {
  const bar = document.getElementById("auth-bar");
  if (!bar) return;
  bar.innerHTML = "";

  if (user) {
    const emailEl = document.createElement("span");
    emailEl.className = "auth-email";
    emailEl.textContent = user.email;
    bar.appendChild(emailEl);

    if (isAdmin(user)) {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.className = "auth-link";
      adminLink.textContent = "⚙️ ניהול";
      bar.appendChild(adminLink);
    }

    const logoutBtn = document.createElement("button");
    logoutBtn.className = "auth-link auth-logout";
    logoutBtn.textContent = "התנתקות";
    logoutBtn.addEventListener("click", () => signOut(auth));
    bar.appendChild(logoutBtn);
  } else {
    const loginLink = document.createElement("a");
    loginLink.href = "login.html";
    loginLink.className = "auth-link";
    loginLink.textContent = "התחברות";
    bar.appendChild(loginLink);

    const registerLink = document.createElement("a");
    registerLink.href = "register.html";
    registerLink.className = "auth-link auth-primary";
    registerLink.textContent = "הרשמה";
    bar.appendChild(registerLink);
  }
}

onAuthStateChanged(auth, render);
