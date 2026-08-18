import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getStats, ACHIEVEMENTS } from "./user-stats.js";

const section = document.getElementById("achievements-section");
const title = document.getElementById("achievements-title");
const row = document.getElementById("achievements-row");

async function render(user) {
  if (!user) {
    section.classList.add("hidden");
    return;
  }

  section.classList.remove("hidden");
  title.textContent = "טוען הישגים...";
  row.innerHTML = "";

  const stats = (await getStats()) || {};
  const unlocked = stats.achievements || [];
  const cumulativeScore = stats.totalScore || 0;

  title.textContent = `ניקוד מצטבר בחשבון: ${cumulativeScore} · ההישגים שלי`;

  ACHIEVEMENTS.forEach((ach) => {
    const isUnlocked = unlocked.includes(ach.id);
    const badge = document.createElement("span");
    badge.className = "achievement-badge" + (isUnlocked ? "" : " locked");
    badge.title = ach.descHe;
    badge.textContent = `${ach.icon} ${ach.nameHe}`;
    row.appendChild(badge);
  });
}

onAuthStateChanged(auth, render);
