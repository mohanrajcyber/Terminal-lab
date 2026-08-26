/** Professional Certificate — canvas PNG + print PDF */

import {
  isCertificateEligible,
  markCertificateIssued,
  generateCertId,
  loadProgress,
} from "./progress.js";
import { getUnlockedBadges } from "./badges.js";
import { MISSIONS } from "./missions.js";

const SITE_URL = "https://mohanrajcyber.github.io/Terminal-lab/";

async function loadFonts() {
  if (!document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load('700 48px "Cinzel"'),
      document.fonts.load('400 48px "Cinzel"'),
      document.fonts.load('400 72px "Great Vibes"'),
    ]);
  } catch { /* fonts optional fallback */ }
}

function drawOrnament(ctx, x, y, size, flip) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.lineTo(size, size * 0.3);
  ctx.quadraticCurveTo(size * 0.5, size * 0.5, 0, size * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.15, size * 0.15, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#c9a227";
  ctx.fill();
  ctx.restore();
}

export async function drawCertificateCanvas(name, certId, dateStr) {
  await loadFonts();

  const W = 1400;
  const H = 990;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0a1628");
  bg.addColorStop(0.5, "#0f2040");
  bg.addColorStop(1, "#0a1628");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.04;
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = "#58a6ff";
    ctx.font = "120px serif";
    ctx.fillText("🛡", (i % 5) * 300, Math.floor(i / 5) * 250 + 80);
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "#c9a227";
  ctx.lineWidth = 4;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  ctx.lineWidth = 1;
  ctx.strokeRect(52, 52, W - 104, H - 104);
  ctx.strokeRect(58, 58, W - 116, H - 116);

  drawOrnament(ctx, 70, 70, 60, false);
  drawOrnament(ctx, W - 70, 70, 60, true);
  drawOrnament(ctx, 70, H - 130, 60, false);
  drawOrnament(ctx, W - 70, H - 130, 60, true);

  ctx.fillStyle = "#c9a227";
  ctx.font = '700 28px "Cinzel", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText("EDUSHELL OS", W / 2, 110);

  ctx.font = '700 42px "Cinzel", Georgia, serif';
  ctx.fillText("CERTIFICATE OF COMPLETION", W / 2, 175);

  ctx.strokeStyle = "rgba(201, 162, 39, 0.6)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 200, 195);
  ctx.lineTo(W / 2 + 200, 195);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = '400 22px "Cinzel", Georgia, serif';
  ctx.fillText("This is to certify that", W / 2, 250);

  ctx.fillStyle = "#ffffff";
  ctx.font = '400 88px "Great Vibes", "Segoe Script", cursive';
  ctx.fillText(name, W / 2, 340);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = '400 20px "Cinzel", Georgia, serif';
  ctx.fillText("has successfully completed the professional training program", W / 2, 395);

  ctx.fillStyle = "#58a6ff";
  ctx.font = '700 32px "Cinzel", Georgia, serif';
  ctx.fillText("Cyber Security Fundamentals", W / 2, 445);

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.font = '400 18px "Cinzel", Georgia, serif';
  ctx.fillText("EduShell OS — Browser-Based Security Learning Platform", W / 2, 480);

  const skills = ["Linux Terminal", "Windows CMD", "Security Tools", "CTF Challenges", "Ethical Hacking Basics"];
  ctx.font = "400 16px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText(skills.join("  ·  "), W / 2, 520);

  ctx.strokeStyle = "rgba(201, 162, 39, 0.4)";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, 555);
  ctx.lineTo(W / 2 + 280, 555);
  ctx.stroke();

  ctx.fillStyle = "#c9a227";
  ctx.beginPath();
  ctx.arc(W / 2, 640, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0a1628";
  ctx.font = "700 36px serif";
  ctx.fillText("🛡", W / 2, 655);

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = '600 22px "Cinzel", Georgia, serif';
  ctx.textAlign = "left";
  ctx.fillText("Mohan Raj", W / 2 - 320, 760);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 320, 770);
  ctx.lineTo(W / 2 - 80, 770);
  ctx.stroke();
  ctx.font = "400 14px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("Cyber Security Analyst · AI · ML", W / 2 - 320, 795);
  ctx.fillText("Creator, EduShell OS", W / 2 - 320, 815);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = '600 20px "Cinzel", Georgia, serif';
  ctx.fillText(dateStr, W / 2 + 320, 760);
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(W / 2 + 80, 770);
  ctx.lineTo(W / 2 + 320, 770);
  ctx.stroke();
  ctx.font = "400 14px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("Date of Completion", W / 2 + 320, 795);

  ctx.textAlign = "center";
  ctx.font = "400 13px monospace";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText(`Certificate ID: ${certId}`, W / 2, 870);
  ctx.fillText(`Verify: ${SITE_URL}`, W / 2, 895);

  ctx.font = "400 12px sans-serif";
  ctx.fillStyle = "rgba(201, 162, 39, 0.7)";
  ctx.fillText("Authorized for portfolio · LinkedIn · Resume · Job Applications", W / 2, 930);

  return canvas;
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
          <button type="button" class="cert-btn primary" id="cert-png">⬇ Download PNG</button>
          <button type="button" class="cert-btn" id="cert-pdf">🖨 Save as PDF</button>
        </div>
      </div>`;
  }

  return `
    <div class="cert-panel locked">
      <h3>🎓 Certificate of Completion</h3>
      <p>Complete the program to unlock your professional certificate.</p>
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
