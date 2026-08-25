/** First-time tutorial + ? keyboard help overlay */

const TUTORIAL_KEY = "edushell_tutorial_done";

const STEPS = [
  { target: "#start-btn", title: "Start Menu", text: "Click the ⊞ Start button (bottom-left) to see all apps. It will open above the taskbar.", tryLabel: "Open Start Menu" },
  { target: "#desktop-icons", title: "Desktop Icons", text: "Click any icon to launch a tool. Right-click to add to Favorites ⭐" },
  { target: "#app", title: "Terminal", text: "Type Linux & Windows commands here. Drag titlebar to move, corner to resize." },
  { target: ".desktop-search", title: "Search", text: "Search tools quickly on the desktop." },
  { target: "#taskbar", title: "Taskbar", text: "Switch terminals, Linux/Windows mode. Press ? anytime for keyboard help." },
];

let tutorialActive = false;

export function isTutorialActive() {
  return tutorialActive;
}

export function shouldShowTutorial() {
  return !localStorage.getItem(TUTORIAL_KEY);
}

export function markTutorialDone() {
  localStorage.setItem(TUTORIAL_KEY, "1");
}

export function runTutorial(onDone, actions = {}) {
  let step = 0;
  tutorialActive = true;

  const overlay = document.createElement("div");
  overlay.id = "tutorial-overlay";
  overlay.innerHTML = `
    <div class="tutorial-spotlight"></div>
    <div class="tutorial-card">
      <div class="tutorial-step-num"></div>
      <h3 class="tutorial-title"></h3>
      <p class="tutorial-text"></p>
      <div class="tutorial-actions">
        <button type="button" class="app-btn" id="tut-try" style="display:none">Try it</button>
        <button type="button" class="app-btn" id="tut-skip">Skip</button>
        <button type="button" class="app-btn primary" id="tut-next">Next →</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const spotlight = overlay.querySelector(".tutorial-spotlight");
  const card = overlay.querySelector(".tutorial-card");
  const tryBtn = overlay.querySelector("#tut-try");
  const startBtn = document.getElementById("start-btn");

  function cleanup() {
    tutorialActive = false;
    startBtn?.classList.remove("tutorial-pulse");
    overlay.remove();
    onDone?.();
  }

  function finish() {
    markTutorialDone();
    cleanup();
  }

  function showStep(i) {
    if (i >= STEPS.length) {
      finish();
      return;
    }
    const s = STEPS[i];
    overlay.querySelector(".tutorial-step-num").textContent = `Step ${i + 1} of ${STEPS.length}`;
    overlay.querySelector(".tutorial-title").textContent = s.title;
    overlay.querySelector(".tutorial-text").textContent = s.text;
    overlay.querySelector("#tut-next").textContent = i === STEPS.length - 1 ? "Finish ✓" : "Next →";

    startBtn?.classList.toggle("tutorial-pulse", s.target === "#start-btn");

    if (s.tryLabel && actions.onTry) {
      tryBtn.style.display = "";
      tryBtn.textContent = s.tryLabel;
    } else {
      tryBtn.style.display = "none";
    }

    const el = document.querySelector(s.target);
    card.style.transform = "";

    if (el) {
      const r = el.getBoundingClientRect();
      spotlight.style.cssText = `
        top:${r.top - 8}px;left:${r.left - 8}px;
        width:${r.width + 16}px;height:${r.height + 16}px;
        display:block;
      `;
      const cardTop = r.bottom + 16;
      if (cardTop + 180 > window.innerHeight) {
        card.style.top = `${Math.max(12, r.top - 170)}px`;
      } else {
        card.style.top = `${cardTop}px`;
      }
      card.style.left = `${Math.max(12, Math.min(window.innerWidth - 320, r.left))}px`;
    } else {
      spotlight.style.display = "none";
      card.style.top = "50%";
      card.style.left = "50%";
      card.style.transform = "translate(-50%,-50%)";
    }
  }

  overlay.querySelector("#tut-next").addEventListener("click", () => { step++; showStep(step); });
  overlay.querySelector("#tut-skip").addEventListener("click", finish);

  tryBtn.addEventListener("click", () => {
    if (actions.onTry) actions.onTry(step);
  });

  showStep(0);
}

const HELP_HTML = `
  <h3>⌨ Keyboard Shortcuts</h3>
  <div class="help-grid">
    <span>Enter</span><span>Run command</span>
    <span>↑ / ↓</span><span>Command history</span>
    <span>Tab</span><span>Autocomplete</span>
    <span>Ctrl+L</span><span>Clear screen</span>
    <span>Ctrl+C</span><span>Cancel / quit game</span>
    <span>F11</span><span>Fullscreen</span>
    <span>?</span><span>This help panel</span>
  </div>
  <h3>📱 Mobile Tips</h3>
  <ul class="help-list">
    <li>Tap icons once to launch tools</li>
    <li>Terminal opens full-width on phone</li>
    <li>Use Start menu for quick access</li>
    <li>Rotate to landscape for more space</li>
  </ul>
  <h3>🎓 Learning Path</h3>
  <ol class="help-list">
    <li>Learn OS → Cheat Sheet → Practice Mode</li>
    <li>Quiz Game → CTF Lab → Leaderboard</li>
    <li>Security Demos → Web Hunter → Msg Guard</li>
  </ol>
  <p class="help-credit">Created by <strong>Mohan Raj</strong> · Cyber Security Analyst / AI·ML</p>
`;

export function openHelpOverlay() {
  let modal = document.getElementById("help-overlay");
  if (modal) { modal.classList.add("show"); return; }

  modal = document.createElement("div");
  modal.id = "help-overlay";
  modal.className = "help-overlay";
  modal.innerHTML = `
    <div class="help-panel">
      <header class="help-header">
        <span>📖 EduShell Help Guide</span>
        <button type="button" class="help-close">×</button>
      </header>
      <div class="help-body">${HELP_HTML}</div>
    </div>
  `;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add("show"));

  const close = () => modal.classList.remove("show");
  modal.querySelector(".help-close").addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
}
