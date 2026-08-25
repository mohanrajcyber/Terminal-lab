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
};

export function loadProgress() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...defaults };
  }
}

function save(p) {
  localStorage.setItem(KEY, JSON.stringify(p));
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
