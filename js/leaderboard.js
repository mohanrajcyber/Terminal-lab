/** Local leaderboard — quiz & CTF scores */

const KEY = "edushell_leaderboard";
const MAX = 20;

export function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function save(entries) {
  localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX)));
}

export function addScore(name, type, score, detail = "") {
  const entries = loadLeaderboard();
  entries.push({
    name: name || "Student",
    type,
    score,
    detail,
    date: new Date().toLocaleDateString(),
    ts: Date.now(),
  });
  entries.sort((a, b) => b.score - a.score || b.ts - a.ts);
  save(entries);
  return entries.slice(0, MAX);
}

export function getTopScores(type = null, limit = 10) {
  let entries = loadLeaderboard();
  if (type) entries = entries.filter((e) => e.type === type);
  return entries.slice(0, limit);
}

export function formatLeaderboardHTML(type = null) {
  const entries = getTopScores(type, 10);
  if (!entries.length) {
    return `<p class="lb-empty">No scores yet — complete Quiz or CTF to appear here!</p>`;
  }
  const medals = ["🥇", "🥈", "🥉"];
  return entries.map((e, i) => `
    <div class="lb-row">
      <span class="lb-rank">${medals[i] || `#${i + 1}`}</span>
      <span class="lb-name">${e.name}</span>
      <span class="lb-type">${e.type}</span>
      <span class="lb-score">${e.score}%</span>
      <span class="lb-date">${e.date}</span>
    </div>
  `).join("");
}
