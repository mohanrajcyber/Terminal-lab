/** Story / Mission Mode — 5 cyber analyst missions */

import { loadProgress, saveProgressData } from "./progress.js";
import { evaluateBadges } from "./badges.js";

export const MISSIONS = [
  {
    id: "m1_phishing",
    num: 1,
    title: "Phishing Detective",
    emoji: "📧",
    story: "HQ received a suspicious email! A cyber analyst must scan every message before anyone clicks a link.",
    task: "Run `msgcheck` and scan a suspicious message",
    hint: "Type msgcheck in terminal, then paste any suspicious text",
    verify: (ctx) => ctx.cmd === "msgcheck" || ctx.scanType === "msg",
  },
  {
    id: "m2_password",
    num: 2,
    title: "Password Shield",
    emoji: "🔐",
    story: "Employees use weak passwords! Your job: analyze password strength before hackers exploit them.",
    task: "Run `passcheck` with a password to analyze",
    hint: "Example: passcheck MyPassword123",
    verify: (ctx) => ctx.cmd === "passcheck" && ctx.args?.length >= 2,
  },
  {
    id: "m3_flag",
    num: 3,
    title: "Hidden Intel",
    emoji: "🗂",
    story: "Classified intel is hidden on the server. Find the secret file and read its contents.",
    task: "Run `cat secret.txt` to find hidden intel",
    hint: "The file is in /home/student — try: cat secret.txt",
    verify: (ctx) => /cat\s+\S*secret\.txt/i.test(ctx.line || ""),
  },
  {
    id: "m4_webscan",
    num: 4,
    title: "Web Hunter",
    emoji: "🌐",
    story: "A company website may have vulnerabilities. Scan it before attackers find the holes.",
    task: "Run `webscan` and scan a website URL",
    hint: "Type webscan, then enter a URL like https://example.com",
    verify: (ctx) => ctx.cmd === "webscan" || ctx.scanType === "web",
  },
  {
    id: "m5_firewall",
    num: 5,
    title: "Firewall Defender",
    emoji: "🧱",
    story: "Port 445 is under attack! Block it immediately to protect the network.",
    task: "Run `firewall block 445` to secure the network",
    hint: "Type exactly: firewall block 445",
    verify: (ctx) => /firewall\s+block\s+445/i.test(ctx.line || ""),
  },
];

export function getMissionState() {
  const p = loadProgress();
  const done = p.missionsCompleted || [];
  const next = MISSIONS.find((m) => !done.includes(m.id));
  return { completed: done, next, allDone: done.length >= MISSIONS.length };
}

export function isMissionUnlocked(missionId) {
  const { completed } = getMissionState();
  const idx = MISSIONS.findIndex((m) => m.id === missionId);
  if (idx <= 0) return true;
  return completed.includes(MISSIONS[idx - 1].id);
}

export function completeMission(missionId) {
  const p = loadProgress();
  if (!p.missionsCompleted) p.missionsCompleted = [];
  if (p.missionsCompleted.includes(missionId)) return null;

  const mission = MISSIONS.find((m) => m.id === missionId);
  if (!mission || !isMissionUnlocked(missionId)) return null;

  p.missionsCompleted.push(missionId);
  saveProgressData(p);
  const badges = evaluateBadges();
  return { mission, badges };
}

export function onMissionAction(ctx) {
  const { next } = getMissionState();
  if (!next) return null;

  if (!next.verify(ctx)) return null;
  return completeMission(next.id);
}

export function formatMissionsHTML() {
  const { completed } = getMissionState();

  return MISSIONS.map((m) => {
    const done = completed.includes(m.id);
    const unlocked = isMissionUnlocked(m.id);
    const status = done ? "done" : unlocked ? "active" : "locked";
    return `
      <div class="mission-card ${status}">
        <div class="mission-head">
          <span class="mission-num">${done ? "✓" : m.num}</span>
          <span class="mission-emoji">${m.emoji}</span>
          <strong>Mission ${m.num}: ${m.title}</strong>
        </div>
        <p class="mission-story">${m.story}</p>
        <p class="mission-task"><strong>Task:</strong> ${m.task}</p>
        ${!done && unlocked ? `<p class="mission-hint">💡 ${m.hint}</p>` : ""}
        ${done ? '<span class="mission-badge">COMPLETED ✓</span>' : ""}
        ${!unlocked ? '<span class="mission-lock">🔒 Complete previous mission first</span>' : ""}
      </div>`;
  }).join("");
}

export function getMissionIntro() {
  const { next, allDone } = getMissionState();
  if (allDone) {
    return [
      "╔══════════════════════════════════════╗",
      "║   🎖 ALL MISSIONS COMPLETE!          ║",
      "╚══════════════════════════════════════╝",
      "",
      "You are now a certified Cyber Security Analyst!",
      "Download your certificate from My Progress → Certificate",
    ];
  }
  if (!next) return ["No missions available."];

  return [
    "╔══════════════════════════════════════╗",
    "║   🛡 CYBER ANALYST — MISSION MODE    ║",
    "╚══════════════════════════════════════╝",
    "",
    `Active: Mission ${next.num} — ${next.title}`,
    next.story,
    "",
    `📋 Task: ${next.task}`,
    `💡 Hint: ${next.hint}`,
    "",
    "Complete in terminal. Progress saves automatically!",
  ];
}
