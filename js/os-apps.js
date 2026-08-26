import { TOOL_CATEGORIES, getToolByCmd } from "./features/registry.js";
import { listDir, readFile, writeFile, remove, mkdir, resolveNode } from "./filesystem.js";
import { resolvePath } from "./shell.js";
import { listRecycleItems, restoreItem, emptyRecycle, addToRecycle } from "./recycle.js";
import { WALLPAPERS, THEMES, saveSettings, toggleFavorite } from "./settings.js";
import { sounds } from "./sounds.js";
import { notify } from "./notify.js";
import { getProgressSummary } from "./progress.js";
import { formatLeaderboardHTML } from "./leaderboard.js";
import { CTF_CHALLENGES } from "./ctf.js";
import { formatBadgesHTML, calculateXP, getLevelFromXP } from "./badges.js";
import { formatMissionsHTML, getMissionIntro } from "./missions.js";
import { formatCertificatePanelHTML, initCertificatePanel, openCertificatePreview } from "./certificate.js";
import { formatSharePanelHTML, initSharePanel } from "./share-card.js";
import {
  getPhishingDemoHTML, getDarkWebDemoHTML, getVideoDemoHTML,
  initPhishingDemo, initDarkWebDemo, initVideoDemos,
} from "./security-demos.js";
import { openHelpOverlay } from "./tutorial.js";
import { AI_MODES } from "./ai-chat.js";

function makeWindow(id, title, contentHtml, w = 520, h = 420) {
  let win = document.getElementById(id);
  if (win) {
    win.classList.remove("minimized");
    win.style.zIndex = 60;
    return win;
  }
  win = document.createElement("div");
  win.id = id;
  win.className = "app-window";
  win.style.width = `${w}px`;
  win.style.height = `${h}px`;
  win.style.left = `${(window.innerWidth - w) / 2}px`;
  win.style.top = `${(window.innerHeight - h) / 2 - 40}px`;
  win.innerHTML = `
    <header class="app-titlebar">
      <span class="app-win-title">${title}</span>
      <button type="button" class="app-win-close">×</button>
    </header>
    <div class="app-win-body">${contentHtml}</div>
  `;
  document.getElementById("desktop").appendChild(win);
  win.querySelector(".app-win-close").addEventListener("click", () => win.remove());
  setupDrag(win);
  return win;
}

function setupDrag(win) {
  const bar = win.querySelector(".app-titlebar");
  let drag = false, sx, sy, sl, st;
  bar.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("app-win-close")) return;
    drag = true;
    win.style.zIndex = 70;
    const r = win.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top;
  });
  document.addEventListener("mousemove", (e) => {
    if (!drag) return;
    win.style.left = `${sl + e.clientX - sx}px`;
    win.style.top = `${st + e.clientY - sy}px`;
  });
  document.addEventListener("mouseup", () => { drag = false; });
}

export function openSettings(settings, shell, onUpdate) {
  sounds.click();
  const win = makeWindow("win-settings", "⚙ Settings", `
    <div class="settings-form">
      <label>Username<input id="set-user" value="${settings.username}" /></label>
      <label>Theme<select id="set-theme">${THEMES.map((t) => `<option value="${t}" ${settings.theme === t ? "selected" : ""}>${t}</option>`).join("")}</select></label>
      <label>Wallpaper<select id="set-wall">${Object.keys(WALLPAPERS).map((k) => `<option value="${k}" ${settings.wallpaper === k ? "selected" : ""}>${k}</option>`).join("")}</select></label>
      <label class="chk"><input type="checkbox" id="set-sound" ${settings.sound ? "checked" : ""} /> System sounds</label>
      <hr class="set-divider" />
      <label>🤖 EduBot AI Mode<select id="set-ai-mode">${AI_MODES.map((m) => `<option value="${m.id}" ${settings.aiMode === m.id ? "selected" : ""}>${m.label}</option>`).join("")}</select></label>
      <label>Groq API Key <span class="set-hint">(optional — stored locally only)</span><input id="set-groq-key" type="password" value="${settings.groqApiKey || ""}" placeholder="gsk_..." autocomplete="off" /></label>
      <label>Ollama URL<input id="set-ollama" value="${settings.ollamaUrl || "http://localhost:11434"}" placeholder="http://localhost:11434" /></label>
      <p class="set-ai-note">⚠ Never commit API keys to GitHub. Offline mode works for all students without key.</p>
      <button type="button" id="set-save" class="app-btn primary">Save Settings</button>
    </div>
  `, 420, 480);

  win.querySelector("#set-save").addEventListener("click", () => {
    settings.username = win.querySelector("#set-user").value || "student";
    settings.theme = win.querySelector("#set-theme").value;
    settings.wallpaper = win.querySelector("#set-wall").value;
    settings.sound = win.querySelector("#set-sound").checked;
    settings.aiMode = win.querySelector("#set-ai-mode").value;
    settings.groqApiKey = win.querySelector("#set-groq-key").value.trim();
    settings.ollamaUrl = win.querySelector("#set-ollama").value.trim() || "http://localhost:11434";
    saveSettings(settings);
    onUpdate(settings);
    sounds.success();
    win.remove();
  });
}

export function openFileManager(shell, onNotify) {
  sounds.click();
  let cwd = shell.cwd;
  const mode = shell.mode;

  function render() {
    const body = win.querySelector(".fm-body");
    const r = listDir(cwd, mode);
    if (r.error) {
      body.innerHTML = `<p class="err">${r.error}</p>`;
      return;
    }
    const rows = r.entries.map((e) => `
      <div class="fm-row" data-name="${e.name}" data-type="${e.type}">
        <span>${e.type === "dir" ? "📁" : "📄"} ${e.name}</span>
        <span>${e.size || 0} B</span>
      </div>
    `).join("");
    body.innerHTML = `
      <div class="fm-toolbar">
        <button type="button" class="app-btn" id="fm-up">↑ Up</button>
        <button type="button" class="app-btn" id="fm-upload">Upload File</button>
        <button type="button" class="app-btn" id="fm-mkdir">New Folder</button>
        <input type="file" id="fm-file-input" hidden />
      </div>
      <div class="fm-path">${cwd}</div>
      <div class="fm-list">${rows || "<p>Empty folder</p>"}</div>
    `;

    body.querySelector("#fm-up").addEventListener("click", () => {
      const parts = mode === "windows" ? cwd.split("\\").filter(Boolean) : cwd.split("/").filter(Boolean);
      if (parts.length <= 1) return;
      parts.pop();
      cwd = mode === "windows" ? parts.join("\\") : "/" + parts.join("/");
      shell.cwd = cwd;
      render();
    });

    body.querySelector("#fm-upload").addEventListener("click", () => body.querySelector("#fm-file-input").click());
    body.querySelector("#fm-file-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const path = resolvePath(cwd, file.name, mode);
        writeFile(path, mode, reader.result);
        onNotify("File Manager", `${file.name} uploaded`, "success");
        render();
      };
      reader.readAsText(file);
    });

    body.querySelector("#fm-mkdir").addEventListener("click", () => {
      const name = prompt("Folder name:");
      if (!name) return;
      mkdir(resolvePath(cwd, name, mode), mode);
      render();
    });

    body.querySelectorAll(".fm-row").forEach((row) => {
      row.addEventListener("click", () => {
        const name = row.dataset.name;
        if (row.dataset.type === "dir") {
          cwd = resolvePath(cwd, name, mode);
          shell.cwd = cwd;
          render();
        } else {
          const content = readFile(resolvePath(cwd, name, mode), mode);
          alert(content.content?.slice(0, 500) || "Empty file");
        }
      });
      row.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        const name = row.dataset.name;
        const path = resolvePath(cwd, name, mode);
        const action = prompt("Type: delete or rename");
        if (action === "delete") {
          const { node } = resolveNode(path, mode);
          if (node?.type === "file") addToRecycle(name, node.content || "", mode, path);
          remove(path, mode, true);
          onNotify("Recycle Bin", `${name} moved to recycle bin`, "info");
          render();
        } else if (action === "rename") {
          const nn = prompt("New name:", name);
          if (nn && nn !== name) {
            const content = readFile(path, mode);
            writeFile(resolvePath(cwd, nn, mode), mode, content.content || "");
            remove(path, mode, false);
            render();
          }
        }
      });
    });
  }

  const win = makeWindow("win-fm", "📁 File Manager", `<div class="fm-body"></div>`, 560, 440);
  render();
}

export function openRecycleBin(onRestore, onNotify) {
  sounds.click();
  const items = listRecycleItems();
  const rows = items.length
    ? items.map((i) => `<div class="fm-row"><span>📄 ${i.name}</span><button data-id="${i.id}" class="app-btn sm">Restore</button></div>`).join("")
    : "<p>Recycle Bin is empty</p>";

  const win = makeWindow("win-recycle", "🗑 Recycle Bin", `
    <div class="fm-body">
      <div class="fm-list">${rows}</div>
      ${items.length ? '<button type="button" id="rb-empty" class="app-btn">Empty Bin</button>' : ""}
    </div>
  `, 440, 320);

  win.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = restoreItem(parseInt(btn.dataset.id));
      if (item) {
        writeFile(item.path, item.mode, item.content);
        onNotify("Restored", item.name, "success");
        onRestore?.();
        win.remove();
      }
    });
  });
  win.querySelector("#rb-empty")?.addEventListener("click", () => {
    emptyRecycle();
    onNotify("Recycle Bin", "Emptied", "info");
    win.remove();
  });
}

export function openStartMenu(onSelect, onSystemApp) {
  sounds.click();
  let menu = document.getElementById("start-menu");
  if (menu) { menu.remove(); return; }

  menu = document.createElement("div");
  menu.id = "start-menu";
  menu.innerHTML = `
    <div class="start-header">EduShell OS</div>
    <input type="text" class="start-search" placeholder="Search apps..." />
    <div class="start-apps"></div>
    <div class="start-system">
      <button data-app="settings">⚙ Settings</button>
      <button data-app="filemanager">📁 File Manager</button>
      <button data-app="recyclebin">🗑 Recycle Bin</button>
      <button data-app="terminal2">⌨ New Terminal</button>
    </div>
  `;
  document.getElementById("desktop").appendChild(menu);

  const apps = menu.querySelector(".start-apps");
  TOOL_CATEGORIES.forEach((cat) => {
    cat.tools.forEach((t) => {
      const b = document.createElement("button");
      b.className = "start-app-btn";
      b.textContent = t.title;
      b.addEventListener("click", () => {
        menu.remove();
        const full = getToolByCmd(t.cmd);
        onSelect({ ...t, category: full?.category });
      });
      apps.appendChild(b);
    });
  });

  menu.querySelector(".start-search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    apps.querySelectorAll(".start-app-btn").forEach((b) => {
      b.style.display = b.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });

  menu.querySelectorAll("[data-app]").forEach((b) => {
    b.addEventListener("click", () => {
      menu.remove();
      onSystemApp(b.dataset.app);
    });
  });

  setTimeout(() => {
    document.addEventListener("click", function close(e) {
      if (!menu.contains(e.target) &&
          !e.target.closest("#start-btn") &&
          !e.target.closest("#tutorial-overlay") &&
          !e.target.closest(".tutorial-card")) {
        menu.remove();
        document.removeEventListener("click", close);
      }
    });
  }, 50);
}

export function pinFavorite(cmd, settings, onUpdate) {
  toggleFavorite(cmd, settings);
  onUpdate(settings);
  sounds.notify();
}

export function openProgress(settings) {
  sounds.click();
  const p = getProgressSummary();
  const xp = calculateXP(p);
  const xpLevel = getLevelFromXP(xp);
  const badgeCount = (p.badgesUnlocked || []).length;
  const missionCount = (p.missionsCompleted || []).length;

  const win = makeWindow("win-progress", "📊 My Progress & Achievements", `
    <div class="progress-hub">
      <div class="prog-xp-banner">
        <div class="prog-xp-score">${xp} <span>XP</span></div>
        <div class="prog-xp-meta">
          <strong>${xpLevel}</strong>
          <span>${badgeCount} badges · ${missionCount}/5 missions</span>
        </div>
      </div>
      <div class="hub-tabs">
        <button type="button" class="hub-tab active" data-tab="stats">Stats</button>
        <button type="button" class="hub-tab" data-tab="badges">🏅 Badges</button>
        <button type="button" class="hub-tab" data-tab="missions">🛡 Missions</button>
        <button type="button" class="hub-tab" data-tab="cert">🎓 Certificate</button>
        <button type="button" class="hub-tab" data-tab="share">📱 Share</button>
      </div>
      <div class="hub-panels">
        <div class="hub-panel active" data-panel="stats">
          <div class="progress-panel">
            <div class="prog-level">Level: <strong>${p.level}</strong></div>
            <div class="prog-stat"><span>Tools Used</span><strong>${p.toolCount} (${p.toolPercent}%)</strong></div>
            <div class="prog-bar"><div class="prog-fill" style="width:${p.toolPercent}%"></div></div>
            <div class="prog-stat"><span>Commands Run</span><strong>${p.commandsRun}</strong></div>
            <div class="prog-stat"><span>Quiz Best Score</span><strong>${p.quizBest}%</strong></div>
            <div class="prog-stat"><span>CTF Flags</span><strong>${p.ctfFlags} / ${CTF_CHALLENGES.length}</strong></div>
            <div class="prog-stat"><span>Security Scans</span><strong>${p.scansDone}</strong></div>
            <div class="prog-stat"><span>🔥 Day Streak</span><strong>${p.streak || 0} days</strong></div>
            <div class="prog-stat"><span>Games Played</span><strong>${p.gamesPlayed}</strong></div>
          </div>
        </div>
        <div class="hub-panel" data-panel="badges">
          <p class="hub-intro">Unlock badges by exploring EduShell OS!</p>
          <div class="badges-grid">${formatBadgesHTML()}</div>
        </div>
        <div class="hub-panel" data-panel="missions">
          <p class="hub-intro">You are a Cyber Security Analyst — complete 5 missions in the terminal!</p>
          <div class="missions-list">${formatMissionsHTML()}</div>
        </div>
        <div class="hub-panel" data-panel="cert">${formatCertificatePanelHTML(settings)}</div>
        <div class="hub-panel" data-panel="share">${formatSharePanelHTML(settings)}</div>
      </div>
    </div>
  `, 520, 520);

  win.querySelectorAll(".hub-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      win.querySelectorAll(".hub-tab").forEach((t) => t.classList.remove("active"));
      win.querySelectorAll(".hub-panel").forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      win.querySelector(`[data-panel="${tab.dataset.tab}"]`)?.classList.add("active");
    });
  });

  initCertificatePanel(win, settings, (t, m, ty) => notify(t, m, ty));
  initSharePanel(win, settings, (t, m, ty) => notify(t, m, ty));
  return win;
}

export function openCertificatePreviewApp(settings) {
  sounds.click();
  return openCertificatePreview(settings);
}

export function openMissions() {
  sounds.click();
  const intro = getMissionIntro();
  const win = makeWindow("win-missions", "🛡 Mission Mode", `
    <div class="missions-hub">
      <div class="mission-intro-box">${intro.map((l) => `<p>${l}</p>`).join("")}</div>
      <div class="missions-list">${formatMissionsHTML()}</div>
      <button type="button" class="mission-start-btn" id="mission-focus-term">⌨ Open Terminal & Start</button>
    </div>
  `, 480, 480);

  win.querySelector("#mission-focus-term")?.addEventListener("click", () => {
    win.remove();
    document.getElementById("app")?.classList.remove("minimized");
    document.getElementById("hidden-input")?.focus();
  });
  return win;
}

export function openBadges() {
  sounds.click();
  const p = getProgressSummary();
  const win = makeWindow("win-badges", "🏅 Badges & Achievements", `
    <p class="hub-intro">${(p.badgesUnlocked || []).length} / 8 badges unlocked · ${p.streak || 0}-day streak</p>
    <div class="badges-grid">${formatBadgesHTML()}</div>
  `, 440, 460);
  return win;
}

export function openLeaderboard(settings) {
  sounds.click();
  const name = settings?.username || "Student";
  const win = makeWindow("win-leaderboard", "🏆 Leaderboard", `
    <div class="lb-panel">
      <p class="lb-intro">Top scores on this device (local)</p>
      <div class="lb-header"><span>Rank</span><span>Name</span><span>Type</span><span>Score</span><span>Date</span></div>
      ${formatLeaderboardHTML()}
    </div>
  `, 480, 360);
  return win;
}

export function openHelp() {
  sounds.click();
  openHelpOverlay();
}

export function openSecurityDemos() {
  sounds.click();
  const win = makeWindow("win-demos", "🎬 Security Demos", `
    <div class="demo-tabs">
      <button type="button" class="demo-tab active" data-tab="phish">Phishing</button>
      <button type="button" class="demo-tab" data-tab="darkweb">Dark Web</button>
      <button type="button" class="demo-tab" data-tab="video">Scenarios</button>
    </div>
    <div class="demo-content" id="demo-content">${getPhishingDemoHTML()}</div>
  `, 560, 480);

  const content = win.querySelector("#demo-content");
  initPhishingDemo(content);

  win.querySelectorAll(".demo-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      win.querySelectorAll(".demo-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const map = {
        phish: getPhishingDemoHTML,
        darkweb: getDarkWebDemoHTML,
        video: getVideoDemoHTML,
      };
      content.innerHTML = map[tab.dataset.tab]();
      if (tab.dataset.tab === "phish") initPhishingDemo(content);
      if (tab.dataset.tab === "darkweb") initDarkWebDemo(content);
      if (tab.dataset.tab === "video") initVideoDemos(content);
    });
  });
  return win;
}

export function openCtfLab(onStartChallenge) {
  sounds.click();
  const completed = getProgressSummary().ctfCompleted;
  const rows = CTF_CHALLENGES.map((c, i) => {
    const done = completed.includes(c.id) ? "✓" : "○";
    return `<button type="button" class="ctf-btn" data-n="${i + 1}">${done} ${i + 1}. ${c.title} (${c.points}pts)</button>`;
  }).join("");

  const win = makeWindow("win-ctf", "🚩 CTF Lab", `
    <p class="ctf-intro">Capture the flag! Complete challenges in terminal.</p>
    <div class="ctf-list">${rows}</div>
    <p class="prog-hint">Opens in terminal — follow challenge instructions</p>
  `, 440, 400);

  win.querySelectorAll(".ctf-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      win.remove();
      onStartChallenge?.(parseInt(btn.dataset.n));
    });
  });
  return win;
}
