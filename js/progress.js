/** Student progress tracker — localStorage */

const KEY = "edushell_progress";

const defaults = {
  toolsUsed: [],
  commandsRun: 0,
  quizBest: 0,
  quizAttempts: 0,
  ctfCompleted: [],
  ctfFlags: 0,
  scansDone: 0,
  gamesPlayed: 0,
  firstVisit: null,
  lastVisit: null,
  visitDays: [],
  streak: 0,
  badgesUnlocked: [],
  missionsCompleted: [],
  certificateIssued: null,
};

export function loadProgress() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...defaults };
  }
}

export function saveProgressData(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

function save(p) {
  saveProgressData(p);
}

function calcStreak(visitDays) {
  if (!visitDays?.length) return 0;
  const sorted = [...new Set(visitDays)].sort();
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  let d = new Date(today);

  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if (sorted.includes(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else if (i === 0) {
      d.setDate(d.getDate() - 1);
      continue;
    } else break;
  }
  return streak;
}

export function trackDailyVisit() {
  const p = loadProgress();
  const today = new Date().toISOString().slice(0, 10);
  if (!p.visitDays) p.visitDays = [];
  if (!p.visitDays.includes(today)) {
    p.visitDays.push(today);
    p.visitDays = p.visitDays.slice(-60);
  }
  p.streak = calcStreak(p.visitDays);
  p.lastVisit = new Date().toISOString();
  if (!p.firstVisit) p.firstVisit = p.lastVisit;
  save(p);
}

export function trackTool(cmd) {
  const p = loadProgress();
  if (!p.toolsUsed.includes(cmd)) p.toolsUsed.push(cmd);
  p.lastVisit = new Date().toISOString();
  if (!p.firstVisit) p.firstVisit = p.lastVisit;
  save(p);
}

export function trackCommand() {
  const p = loadProgress();
  p.commandsRun++;
  p.lastVisit = new Date().toISOString();
  save(p);
}

export function trackQuizScore(score, total) {
  const p = loadProgress();
  p.quizAttempts++;
  const pct = Math.round((score / total) * 100);
  if (pct > p.quizBest) p.quizBest = pct;
  p.lastVisit = new Date().toISOString();
  save(p);
  return pct;
}

export function trackCtfComplete(id) {
  const p = loadProgress();
  if (!p.ctfCompleted.includes(id)) {
    p.ctfCompleted.push(id);
    p.ctfFlags++;
  }
  p.lastVisit = new Date().toISOString();
  save(p);
  return p.ctfFlags;
}

export function trackScan() {
  const p = loadProgress();
  p.scansDone++;
  save(p);
}

export function trackGame() {
  const p = loadProgress();
  p.gamesPlayed++;
  save(p);
}

export function getProgressSummary() {
  const p = loadProgress();
  const toolCount = p.toolsUsed.length;
  const totalTools = 45;
  return {
    ...p,
    toolPercent: Math.round((toolCount / totalTools) * 100),
    toolCount,
    level: p.ctfFlags >= 5 ? "Expert" : p.ctfFlags >= 3 ? "Advanced" : p.quizBest >= 60 ? "Intermediate" : "Beginner",
  };
}

export function isCertificateEligible() {
  const p = loadProgress();
  const missionsDone = (p.missionsCompleted?.length || 0) >= 5;
  const learningDone =
    p.quizBest >= 60 ||
    (p.ctfFlags || 0) >= 3 ||
    (p.commandsRun || 0) >= 30;
  return missionsDone && learningDone;
}

export function markCertificateIssued(id) {
  const p = loadProgress();
  p.certificateIssued = id;
  save(p);
}

export function generateCertId(name) {
  const base = `${name}-${Date.now()}`.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return `EDU-${new Date().getFullYear()}-${String(base % 100000).padStart(5, "0")}`;
}
