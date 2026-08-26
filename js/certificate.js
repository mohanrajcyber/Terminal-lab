/** Professional Certificate — canvas PNG + print PDF */

import {
  isCertificateEligible,
  markCertificateIssued,
  generateCertId,
  loadProgress,
} from "./progress.js";
import { getUnlockedBadges } from "./badges.js";

const SITE_URL = "https://mohanrajcyber.github.io/Terminal-lab/";

async function loadFonts() {
  if (!document.fonts) return;
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('700 52px "Cinzel"'),
        document.fonts.load('600 24px "Cinzel"'),
        document.fonts.load('400 96px "Great Vibes"'),
        document.fonts.load('400 48px "Playfair Display"'),
        document.fonts.load('700 20px "Playfair Display"'),
      ]),
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  } catch { /* optional */ }
}

const GOLD = "#d4af37";
const GOLD_LIGHT = "#f0d875";
const GOLD_DARK = "#9a7b1a";
const NAVY = "#07101f";
const NAVY_MID = "#0c1a32";

function drawPatternBg(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.035;
  for (let x = 0; x < W; x += 48) {
    for (let y = 0; y < H; y += 48) {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 8, y + 8, 32, 32);
    }
  }
  ctx.globalAlpha = 0.06;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 320, 0, Math.PI * 2);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 280, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCornerFlourish(ctx, x, y, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, 0, 80, 80);
  g.addColorStop(0, GOLD_LIGHT);
  g.addColorStop(1, GOLD_DARK);
  ctx.strokeStyle = g;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(70, 0);
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 70);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, 8);
  ctx.quadraticCurveTo(42, 8, 42, 42);
  ctx.quadraticCurveTo(42, 42, 8, 42);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGoldDivider(ctx, cx, y, width) {
  const g = ctx.createLinearGradient(cx - width / 2, y, cx + width / 2, y);
  g.addColorStop(0, "transparent");
  g.addColorStop(0.2, GOLD_DARK);
  g.addColorStop(0.5, GOLD_LIGHT);
  g.addColorStop(0.8, GOLD_DARK);
  g.addColorStop(1, "transparent");
  ctx.strokeStyle = g;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - width / 2, y);
  ctx.lineTo(cx + width / 2, y);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx - 6, y - 4);
  ctx.lineTo(cx, y + 5);
  ctx.lineTo(cx + 6, y - 4);
  ctx.closePath();
  ctx.fill();
}

function drawSeal(ctx, cx, cy, r) {
  ctx.save();
  ctx.shadowColor = "rgba(212, 175, 55, 0.45)";
  ctx.shadowBlur = 18;
  const ring = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
  ring.addColorStop(0, GOLD_LIGHT);
  ring.addColorStop(0.7, GOLD);
  ring.addColorStop(1, GOLD_DARK);
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.font = '700 11px "Cinzel", serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const tx = cx + Math.cos(a) * (r - 5);
    const ty = cy + Math.sin(a) * (r - 5);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText("★", 0, 0);
    ctx.restore();
  }
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = '700 9px "Cinzel", serif';
  const label = "EDUSHELL OS · VERIFIED";
  for (let i = 0; i < label.length; i++) {
    const a = (i / label.length) * Math.PI * 1.35 + Math.PI * 0.82;
    const tx = cx + Math.cos(a) * (r - 22);
    const ty = cy + Math.sin(a) * (r - 22);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillText(label[i], 0, 0);
    ctx.restore();
  }
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 18);
  ctx.lineTo(cx + 16, cy + 14);
  ctx.lineTo(cx + 5, cy + 10);
  ctx.lineTo(cx, cy + 18);
  ctx.lineTo(cx - 5, cy + 10);
  ctx.lineTo(cx - 16, cy + 14);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = NAVY;
  ctx.beginPath();
  ctx.arc(cx, cy + 2, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function fillGoldText(ctx, text, x, y, font, maxWidth) {
  ctx.font = font;
  ctx.textAlign = "center";
  const g = ctx.createLinearGradient(x - maxWidth / 2, y - 20, x + maxWidth / 2, y + 10);
  g.addColorStop(0, GOLD_LIGHT);
  g.addColorStop(0.45, GOLD);
  g.addColorStop(1, GOLD_DARK);
  ctx.fillStyle = g;
  ctx.fillText(text, x, y);
}

function drawSkillPills(ctx, skills, cx, startY) {
  ctx.font = '600 13px "Cinzel", Georgia, serif';
  const gap = 14;
  const pillH = 28;
  let totalW = 0;
  const widths = skills.map((s) => ctx.measureText(s).width + 28);
  totalW = widths.reduce((a, b) => a + b, 0) + gap * (skills.length - 1);
  let x = cx - totalW / 2;
  skills.forEach((skill, i) => {
    const w = widths[i];
    ctx.fillStyle = "rgba(212, 175, 55, 0.12)";
    ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, startY, w, pillH, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.82)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(skill, x + w / 2, startY + pillH / 2);
    x += w + gap;
  });
}

export async function drawCertificateCanvas(name, certId, dateStr, options = {}) {
  const { watermark = "" } = options;
  await loadFonts();

  const W = 1600;
  const H = 1130;
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, NAVY);
  bg.addColorStop(0.45, NAVY_MID);
  bg.addColorStop(1, NAVY);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  drawPatternBg(ctx, W, H);

  const m = 48;
  ctx.strokeStyle = GOLD_DARK;
  ctx.lineWidth = 1;
  ctx.strokeRect(m, m, W - m * 2, H - m * 2);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.strokeRect(m + 8, m + 8, W - (m + 8) * 2, H - (m + 8) * 2);
  ctx.strokeStyle = GOLD_LIGHT;
  ctx.lineWidth = 1;
  ctx.strokeRect(m + 16, m + 16, W - (m + 16) * 2, H - (m + 16) * 2);

  drawCornerFlourish(ctx, m + 24, m + 24, 0);
  drawCornerFlourish(ctx, W - m - 24, m + 24, Math.PI / 2);
  drawCornerFlourish(ctx, W - m - 24, H - m - 24, Math.PI);
  drawCornerFlourish(ctx, m + 24, H - m - 24, -Math.PI / 2);

  ctx.fillStyle = "rgba(212, 175, 55, 0.08)";
  ctx.fillRect(W / 2 - 420, 88, 840, 52);
  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.strokeRect(W / 2 - 420, 88, 840, 52);
  fillGoldText(ctx, "EDUSHELL OS", W / 2, 122, '700 26px "Cinzel", Georgia, serif', 400);

  fillGoldText(ctx, "CERTIFICATE OF COMPLETION", W / 2, 195, '700 46px "Cinzel", Georgia, serif', 900);
  drawGoldDivider(ctx, W / 2, 218, 520);

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = '600 18px "Playfair Display", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText("THIS IS TO CERTIFY THAT", W / 2, 268);

  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = "#ffffff";
  ctx.font = '400 96px "Great Vibes", "Segoe Script", cursive';
  ctx.fillText(name, W / 2, 358);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, 378);
  ctx.lineTo(W / 2 + 280, 378);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = '400 19px "Playfair Display", Georgia, serif';
  ctx.fillText("has successfully completed the Professional Training Program in", W / 2, 418);

  ctx.fillStyle = "rgba(7, 16, 31, 0.92)";
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(W / 2 - 340, 440, 680, 56, 6);
  ctx.fill();
  ctx.stroke();
  fillGoldText(ctx, "CYBER SECURITY FUNDAMENTALS", W / 2, 478, '700 30px "Cinzel", Georgia, serif', 660);

  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.font = '400 16px "Playfair Display", Georgia, serif';
  ctx.fillText("EduShell OS — Enterprise-Grade Browser Security Learning Platform", W / 2, 530);

  drawSkillPills(ctx,
    ["Linux Terminal", "Windows CMD", "Security Tools", "CTF Lab", "Ethical Hacking"],
    W / 2, 555
  );

  drawGoldDivider(ctx, W / 2, 615, 600);
  drawSeal(ctx, W / 2, 710, 62);

  const sigY = 830;
  ctx.textAlign = "left";
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(180, sigY + 8);
  ctx.lineTo(480, sigY + 8);
  ctx.stroke();
  ctx.fillStyle = GOLD_LIGHT;
  ctx.font = '400 38px "Great Vibes", cursive';
  ctx.fillText("Mohan Raj", 200, sigY);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = '700 18px "Cinzel", serif';
  ctx.fillText("MOHAN RAJ", 180, sigY + 38);
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  ctx.font = '400 13px "Playfair Display", serif';
  ctx.fillText("Cyber Security Analyst · AI · ML", 180, sigY + 58);
  ctx.fillText("Creator & Lead Instructor — EduShell OS", 180, sigY + 76);

  ctx.textAlign = "right";
  ctx.beginPath();
  ctx.moveTo(W - 480, sigY + 8);
  ctx.lineTo(W - 180, sigY + 8);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.font = '700 18px "Cinzel", serif';
  ctx.fillText(dateStr.toUpperCase(), W - 180, sigY + 38);
  ctx.fillStyle = "rgba(255,255,255,0.52)";
  ctx.font = '400 13px "Playfair Display", serif';
  ctx.fillText("Date of Completion", W - 180, sigY + 58);
  ctx.fillText("Valid for Portfolio & Employment", W - 180, sigY + 76);

  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(212, 175, 55, 0.12)";
  ctx.fillRect(W / 2 - 420, 940, 840, 72);
  ctx.strokeStyle = "rgba(212, 175, 55, 0.3)";
  ctx.strokeRect(W / 2 - 420, 940, 840, 72);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = '600 12px "Cinzel", serif';
  ctx.fillText(`CERTIFICATE ID  ·  ${certId}`, W / 2, 968);
  ctx.font = "400 11px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.fillText(`Verify authenticity: ${SITE_URL}`, W / 2, 992);
  ctx.font = '600 11px "Cinzel", serif';
  ctx.fillStyle = "rgba(212, 175, 55, 0.75)";
  ctx.fillText("AUTHORIZED FOR LINKEDIN  ·  RESUME  ·  PORTFOLIO  ·  JOB APPLICATIONS", W / 2, 1018);

  if (watermark) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 193, 7, 0.92)";
    ctx.fillRect(W / 2 - 340, H - 58, 680, 32);
    ctx.fillStyle = NAVY;
    ctx.font = '700 12px "Cinzel", serif';
    ctx.textAlign = "center";
    ctx.fillText("SAMPLE PREVIEW — Complete all missions to download official certificate", W / 2, H - 37);
    ctx.restore();
  }

  return canvas;
}

function formatCertName(settings) {
  const raw = settings?.username || "Student";
  if (raw === "student") return "Your Name";
  return raw
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export async function buildCertificatePreview(settings, { official = false } = {}) {
  const name = formatCertName(settings);
  const certId = official && loadProgress().certificateIssued
    ? loadProgress().certificateIssued
    : generateCertId(name);
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const canvas = await drawCertificateCanvas(
    name,
    certId,
    dateStr,
    { watermark: official ? "" : "PREVIEW" }
  );
  return { canvas, dataUrl: canvas.toDataURL("image/png", 1.0), name, certId, dateStr };
}

export async function openCertificatePreview(settings) {
  try {
    const eligible = isCertificateEligible();
    const { dataUrl, name } = await buildCertificatePreview(settings, { official: eligible });

  let overlay = document.getElementById("cert-preview-overlay");
  if (overlay) overlay.remove();

  overlay = document.createElement("div");
  overlay.id = "cert-preview-overlay";
  overlay.className = "cert-preview-overlay";
  overlay.innerHTML = `
    <div class="cert-preview-backdrop"></div>
    <div class="cert-preview-dialog">
      <header class="cert-preview-header">
        <div>
          <strong>🎓 Certificate Preview</strong>
          <span>${eligible ? "Official — ready to download" : "Sample preview with your name"}</span>
        </div>
        <button type="button" class="cert-preview-close" aria-label="Close">×</button>
      </header>
      <div class="cert-preview-body">
        <img src="${dataUrl}" alt="EduShell Certificate for ${name}" class="cert-preview-img" />
      </div>
      <footer class="cert-preview-footer">
        ${eligible
          ? `<button type="button" class="cert-btn primary" id="cert-prev-png">⬇ Download PNG</button>
             <button type="button" class="cert-btn" id="cert-prev-pdf">🖨 Save as PDF</button>`
          : `<p class="cert-preview-note">Complete all 5 missions + learning goal to unlock download.</p>
             <button type="button" class="cert-btn" id="cert-prev-missions">🛡 View Missions</button>`}
        <button type="button" class="cert-btn" id="cert-prev-close">Close</button>
      </footer>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("visible"));

  const close = () => {
    overlay.classList.remove("visible");
    setTimeout(() => overlay.remove(), 250);
  };

  overlay.querySelector(".cert-preview-backdrop")?.addEventListener("click", close);
  overlay.querySelector(".cert-preview-close")?.addEventListener("click", close);
  overlay.querySelector("#cert-prev-close")?.addEventListener("click", close);
  overlay.querySelector("#cert-prev-png")?.addEventListener("click", async () => {
    await downloadCertificatePNG(settings);
  });
  overlay.querySelector("#cert-prev-pdf")?.addEventListener("click", async () => {
    await downloadCertificatePDF(settings);
  });
  overlay.querySelector("#cert-prev-missions")?.addEventListener("click", () => {
    close();
    import("./os-apps.js").then(({ openMissions }) => openMissions());
  });

  return overlay;
  } catch (err) {
    console.error("Certificate preview failed:", err);
    return { error: err.message || "Preview failed" };
  }
}

export function getCertificateStatus(settings) {
  const eligible = isCertificateEligible();
  const p = loadProgress();
  const name = settings?.username || "Student";
  const missions = p.missionsCompleted?.length || 0;
  const reasons = [];

  if (missions < 5) reasons.push(`Complete all 5 missions (${missions}/5)`);
  if (p.quizBest < 60 && (p.ctfFlags || 0) < 3 && (p.commandsRun || 0) < 30) {
    reasons.push("Score 60%+ on Quiz, OR capture 3 CTF flags, OR run 30 commands");
  }

  return { eligible, reasons, name, certId: p.certificateIssued };
}

export async function downloadCertificatePNG(settings) {
  const status = getCertificateStatus(settings);
  if (!status.eligible) return { ok: false, error: status.reasons.join(". ") };

  const name = status.name.charAt(0).toUpperCase() + status.name.slice(1);
  const certId = status.certId || generateCertId(name);
  markCertificateIssued(certId);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const canvas = await drawCertificateCanvas(name, certId, dateStr);
  const link = document.createElement("a");
  link.download = `EduShell-Certificate-${name.replace(/\s+/g, "-")}.png`;
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
  return { ok: true, certId };
}

export async function downloadCertificatePDF(settings) {
  const status = getCertificateStatus(settings);
  if (!status.eligible) return { ok: false, error: status.reasons.join(". ") };

  const name = status.name.charAt(0).toUpperCase() + status.name.slice(1);
  const certId = status.certId || generateCertId(name);
  markCertificateIssued(certId);

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  const canvas = await drawCertificateCanvas(name, certId, dateStr);
  const dataUrl = canvas.toDataURL("image/png", 1.0);

  const win = window.open("", "_blank");
  if (!win) return { ok: false, error: "Allow popups to print/save PDF" };

  win.document.write(`
    <!DOCTYPE html><html><head><title>EduShell Certificate — ${name}</title>
    <style>
      @page { size: landscape; margin: 0; }
      body { margin: 0; display: flex; justify-content: center; align-items: center; }
      img { width: 100%; height: auto; }
    </style></head>
    <body><img src="${dataUrl}" onload="setTimeout(()=>{window.print();},400)" /></body></html>
  `);
  win.document.close();
  return { ok: true, certId };
}

export function formatCertificatePanelHTML(settings) {
  const status = getCertificateStatus(settings);
  const p = loadProgress();
  const badges = getUnlockedBadges();

  if (status.eligible) {
    return `
      <div class="cert-panel eligible">
        <div class="cert-preview-badge">✓ ELIGIBLE</div>
        <h3>🎓 Professional Certificate Ready!</h3>
        <p>Congratulations! You completed the EduShell OS Cyber Security program.</p>
        <ul class="cert-checklist done">
          <li>✓ All 5 Missions completed</li>
          <li>✓ Learning requirements met</li>
          <li>✓ ${badges.length} badges earned</li>
        </ul>
        <p class="cert-note">Use for LinkedIn, resume, portfolio & job applications.</p>
        <div class="cert-actions">
          <button type="button" class="cert-btn" id="cert-preview">👁 Preview Certificate</button>
          <button type="button" class="cert-btn primary" id="cert-png">⬇ Download PNG</button>
          <button type="button" class="cert-btn" id="cert-pdf">🖨 Save as PDF</button>
        </div>
      </div>`;
  }

  return `
    <div class="cert-panel locked">
      <div class="cert-actions cert-actions-top">
        <button type="button" class="cert-btn primary cert-preview-main" id="cert-preview">👁 Preview Certificate — Click Here</button>
      </div>
      <h3>🎓 Certificate of Completion</h3>
      <p>Preview anytime! Complete program to download official copy.</p>
      <ul class="cert-checklist">
        <li class="${(p.missionsCompleted?.length || 0) >= 5 ? "done" : ""}">
          ${(p.missionsCompleted?.length || 0) >= 5 ? "✓" : "○"} All 5 Missions (${p.missionsCompleted?.length || 0}/5)
        </li>
        <li class="${p.quizBest >= 60 ? "done" : ""}">${p.quizBest >= 60 ? "✓" : "○"} Quiz 60%+ (${p.quizBest}%)</li>
        <li class="${(p.ctfFlags || 0) >= 3 ? "done" : ""}">${(p.ctfFlags || 0) >= 3 ? "✓" : "○"} 3+ CTF Flags (${p.ctfFlags || 0})</li>
        <li class="${(p.commandsRun || 0) >= 30 ? "done" : ""}">${(p.commandsRun || 0) >= 30 ? "✓" : "○"} 30 Commands (${p.commandsRun || 0})</li>
      </ul>
      <p class="cert-hint">Need: All missions + any ONE learning requirement above.</p>
    </div>`;
}

export function initCertificatePanel(win, settings, onNotify) {
  const openPreview = async () => {
    const r = await openCertificatePreview(settings);
    if (r?.error) onNotify?.("Certificate", r.error, "warning");
    else onNotify?.("Certificate", "Preview opened!", "info");
  };

  win.querySelector("#cert-preview")?.addEventListener("click", openPreview);
  win.querySelector("#cert-png")?.addEventListener("click", async () => {
    const r = await downloadCertificatePNG(settings);
    if (r.ok) onNotify?.("Certificate", "PNG downloaded! Add to LinkedIn/resume.", "success");
    else onNotify?.("Certificate", r.error, "warning");
  });
  win.querySelector("#cert-pdf")?.addEventListener("click", async () => {
    const r = await downloadCertificatePDF(settings);
    if (r.ok) onNotify?.("Certificate", "Print dialog opened — choose Save as PDF", "success");
    else onNotify?.("Certificate", r.error, "warning");
  });
}
