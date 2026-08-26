/** Badges & Achievements — gamification for students */

import { loadProgress, saveProgressData } from "./progress.js";

export const SCAN_TOOLS = [
  "webscan", "msgcheck", "emailscan", "passcheck",
  "iplookup", "portscan", "filescan", "usbscan",
];

export const BADGES = [
  {
    id: "first_flag",
    emoji: "🏅",
    title: "First Flag Captured",
    desc: "Capture your first CTF flag",
    check: (p) => p.ctfFlags >= 1,
  },
  {
    id: "commands_10",
    emoji: "🏅",
    title: "10 Commands Mastered",
    desc: "Run 10 terminal commands",
    check: (p) => p.commandsRun >= 10,
  },
  {
    id: "linux_beginner",
    emoji: "🐧",
    title: "Linux Beginner",
    desc: "Use ls, cd, and cat commands",
    check: (p) => ["ls", "cd", "cat"].every((c) => p.toolsUsed.includes(c)),
  },
  {
    id: "quiz_master",
    emoji: "🏅",
    title: "Quiz Master",
    desc: "Score 80% or higher on Quiz Game",
    check: (p) => p.quizBest >= 80,
  },
  {
    id: "ctf_hero",
    emoji: "🚩",
    title: "CTF Hero",
    desc: "Complete all 6 CTF challenges",
    check: (p) => (p.ctfCompleted?.length || 0) >= 6,
  },
  {
    id: "security_scout",
    emoji: "🛡",
    title: "Security Scout",
    desc: "Try all 8 security scan tools",
    check: (p) => SCAN_TOOLS.every((t) => p.toolsUsed.includes(t)),
  },
  {
    id: "streak_7",
    emoji: "🔥",
    title: "7-Day Streak",
    desc: "Visit EduShell 7 days in a row",
    check: (p) => (p.streak || 0) >= 7,
  },
  {
    id: "mission_hero",
    emoji: "⭐",
    title: "Mission Complete",
    desc: "Finish all 5 analyst story missions",
    check: (p) => (p.missionsCompleted?.length || 0) >= 5,
  },
];

export function getBadgeById(id) {
  return BADGES.find((b) => b.id === id);
}

export function evaluateBadges() {
  const p = loadProgress();
  const unlocked = p.badgesUnlocked || [];
  const newly = [];

  for (const badge of BADGES) {
    if (!unlocked.includes(badge.id) && badge.check(p)) {
      unlocked.push(badge.id);
      newly.push(badge);
    }
  }

  if (newly.length) {
    p.badgesUnlocked = unlocked;
    saveProgressData(p);
  }

  return newly;
}

export function getUnlockedBadges() {
  const p = loadProgress();
  return BADGES.filter((b) => (p.badgesUnlocked || []).includes(b.id));
}

export function getLockedBadges() {
  const p = loadProgress();
  const set = new Set(p.badgesUnlocked || []);
  return BADGES.filter((b) => !set.has(b.id));
}

export function formatBadgesHTML() {
  const p = loadProgress();
  const unlocked = new Set(p.badgesUnlocked || []);

  return BADGES.map((b) => {
    const done = unlocked.has(b.id);
    return `
      <div class="badge-card ${done ? "unlocked" : "locked"}">
        <span class="badge-emoji">${done ? b.emoji : "🔒"}</span>
        <div class="badge-info">
          <strong>${b.title}</strong>
          <span>${b.desc}</span>
        </div>
        ${done ? '<span class="badge-done">✓</span>' : ""}
      </div>`;
  }).join("");
}

/** XP score for share card & level display */
export function calculateXP(p) {
  const prog = p || loadProgress();
  const badgeCount = (prog.badgesUnlocked || []).length;
  const missionCount = (prog.missionsCompleted || []).length;
  return (
    (prog.commandsRun || 0) * 2 +
    (prog.quizBest || 0) * 5 +
    (prog.ctfFlags || 0) * 50 +
    badgeCount * 30 +
    missionCount * 100 +
    (prog.scansDone || 0) * 3
  );
}

export function getLevelFromXP(xp) {
  if (xp >= 800) return "Expert Analyst";
  if (xp >= 500) return "Security Pro";
  if (xp >= 250) return "Cyber Scout";
  if (xp >= 100) return "Terminal Learner";
  return "Beginner";
}
