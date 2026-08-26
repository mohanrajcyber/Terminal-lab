/** Share Score Card — WhatsApp & image download */

import { loadProgress, getProgressSummary } from "./progress.js";
import { calculateXP, getLevelFromXP, getUnlockedBadges } from "./badges.js";
import { getMissionState } from "./missions.js";

const SITE_URL = "https://mohanrajcyber.github.io/Terminal-lab/";

export async function drawShareCardCanvas(settings) {
  const p = getProgressSummary();
  const xp = calculateXP(p);
  const level = getLevelFromXP(xp);
  const badges = getUnlockedBadges().slice(0, 4);
  const missions = getMissionState();
  const name = (settings?.username || "Student").toUpperCase();

  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0f2027");
  bg.addColorStop(0.4, "#203a43");
  bg.addColorStop(1, "#0a1628");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = "rgba(88, 166, 255, 0.3)";
  ctx.lineWidth = 3;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  ctx.fillStyle = "#58a6ff";
  ctx.font = '700 36px "Orbitron", sans-serif';
  ctx.textAlign = "center";
  ctx.fillText("EDUSHELL OS", W / 2, 90);

  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "400 18px sans-serif";
  ctx.fillText("Cyber Security Learning Platform", W / 2, 125);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 52px sans-serif";
  ctx.fillText(name, W / 2, 210);

  ctx.fillStyle = "#ffd43b";
  ctx.font = "700 80px sans-serif";
  ctx.fillText(`${xp} XP`, W / 2, 310);

  ctx.fillStyle = "#a371f7";
  ctx.font = "600 28px sans-serif";
  ctx.fillText(`Level: ${level}`, W / 2, 360);

  const stats = [
    { label: "Quiz Best", value: `${p.quizBest}%` },
    { label: "CTF Flags", value: `${p.ctfFlags}/6` },
    { label: "Missions", value: `${missions.completed.length}/5` },
    { label: "Badges", value: `${badges.length}` },
  ];

  const sx = W / 2 - 380;
  stats.forEach((s, i) => {
    const x = sx + i * 200;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.roundRect(x, 400, 170, 90, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.font = "400 16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.label, x + 85, 435);
    ctx.fillStyle = "#fff";
    ctx.font = "700 32px sans-serif";
    ctx.fillText(s.value, x + 85, 475);
  });

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "400 22px sans-serif";
  ctx.fillText("Badges Earned", W / 2, 540);

  const bx = W / 2 - (badges.length * 70) / 2;
  badges.forEach((b, i) => {
    ctx.font = "48px serif";
    ctx.fillText(b.emoji, bx + i * 70 + 35, 610);
  });
  if (!badges.length) {
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "400 18px sans-serif";
    ctx.fillText("Start learning to earn badges!", W / 2, 610);
  }

  ctx.fillStyle = "#69db7c";
  ctx.font = "700 28px sans-serif";
  ctx.fillText(`I scored ${xp} XP on EduShell OS! 🛡`, W / 2, 720);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "400 16px sans-serif";
  ctx.fillText("Created by Mohan Raj — Cyber Security Analyst / AI·ML", W / 2, 780);
  ctx.fillText(SITE_URL, W / 2, 810);

  ctx.fillStyle = "rgba(88, 166, 255, 0.2)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 200, 850, 400, 50, 25);
  ctx.fill();
  ctx.fillStyle = "#58a6ff";
  ctx.font = "600 18px sans-serif";
  ctx.fillText("Try EduShell OS — Free for Students!", W / 2, 882);

  return canvas;
}

export async function downloadShareCard(settings) {
  const canvas = await drawShareCardCanvas(settings);
  const name = settings?.username || "student";
  const link = document.createElement("a");
  link.download = `EduShell-Score-${name}.png`;
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
  return canvas;
}

export async function shareToWhatsApp(settings) {
  const p = getProgressSummary();
  const xp = calculateXP(p);
  const level = getLevelFromXP(xp);
  const text = encodeURIComponent(
    `🛡 I scored ${xp} XP on EduShell OS!\n` +
    `Level: ${level} | Quiz: ${p.quizBest}% | CTF: ${p.ctfFlags}/6\n\n` +
    `Free Cyber Security learning platform for students.\n` +
    `Created by Mohan Raj — Cyber Security Analyst / AI·ML\n\n` +
    `Try it: ${SITE_URL}`
  );

  const canvas = await drawShareCardCanvas(settings);

  if (navigator.share && navigator.canShare) {
    try {
      const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
      const file = new File([blob], "edushell-score.png", { type: "image/png" });
      const shareData = { text: decodeURIComponent(text), files: [file] };
      if (navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return { ok: true, method: "native" };
      }
    } catch { /* fallback below */ }
  }

  await downloadShareCard(settings);
  window.open(`https://wa.me/?text=${text}`, "_blank");
  return { ok: true, method: "whatsapp" };
}

export function formatSharePanelHTML(settings) {
  const p = getProgressSummary();
  const xp = calculateXP(p);
  const level = getLevelFromXP(p);

  return `
    <div class="share-panel">
      <div class="share-score-big">${xp} <span>XP</span></div>
      <div class="share-level">${level}</div>
      <div class="share-stats-row">
        <span>Quiz ${p.quizBest}%</span>
        <span>CTF ${p.ctfFlags}/6</span>
        <span>Badges ${(p.badgesUnlocked || []).length}</span>
      </div>
      <p class="share-msg">"I scored ${xp} XP on EduShell OS! 🛡"</p>
      <div class="share-actions">
        <button type="button" class="share-btn whatsapp" id="share-wa">📱 Share on WhatsApp</button>
        <button type="button" class="share-btn" id="share-dl">⬇ Download Score Card</button>
      </div>
      <p class="share-hint">Share with friends & classmates — free cyber security learning!</p>
    </div>`;
}

export function initSharePanel(win, settings, onNotify) {
  win.querySelector("#share-wa")?.addEventListener("click", async () => {
    const r = await shareToWhatsApp(settings);
    if (r.method === "whatsapp") {
      onNotify?.("Share", "Image downloaded + WhatsApp opened! Attach the image.", "success");
    } else {
      onNotify?.("Share", "Shared successfully!", "success");
    }
  });
  win.querySelector("#share-dl")?.addEventListener("click", async () => {
    await downloadShareCard(settings);
    onNotify?.("Share", "Score card downloaded!", "success");
  });
}
