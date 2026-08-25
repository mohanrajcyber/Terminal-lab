/** Dynamic game terminal windows — one per game, like new tabs */

import { createShell, getPrompt } from "./shell.js";
import { applySettings } from "./settings.js";
import { sounds } from "./sounds.js";
import { isGameCmd, launchGame } from "./games.js";

let winCounter = 0;
const openWindows = new Map();

export { isGameCmd };

export function openGameTerminal(title, cmd, settings, args = []) {
  sounds.click();
  const id = `game-win-${++winCounter}`;
  const offset = (winCounter % 5) * 28;

  const win = document.createElement("div");
  win.id = id;
  win.className = "terminal-window game-terminal";
  win.style.cssText = `
    left:${120 + offset}px;top:${80 + offset}px;
    width:520px;height:440px;z-index:${60 + winCounter};
  `;

  win.innerHTML = `
    <header class="titlebar game-titlebar">
      <div class="titlebar-left">
        <span class="dot red game-close" title="Close"></span>
        <span class="dot yellow game-min" title="Minimize"></span>
        <span class="dot green"></span>
        <span class="title">🎮 ${title}</span>
      </div>
      <div class="titlebar-right">
        <span class="game-badge">GAME MODE</span>
      </div>
    </header>
    <main class="terminal game-terminal-body">
      <div class="output game-output"></div>
      <div class="game-stage"></div>
      <div class="input-line">
        <span class="prompt game-prompt"></span>
        <span class="typed game-typed"></span><span class="cursor">█</span>
      </div>
    </main>
    <footer class="statusbar game-status">
      <span>Game Terminal · Arrow keys / type · Ctrl+C quit</span>
    </footer>
    <input class="game-input" type="text" autocomplete="off" spellcheck="false" tabindex="-1" />
    <div class="resize-handle"></div>
  `;

  document.getElementById("desktop").appendChild(win);

  const shell = createShell();
  applySettings(settings, shell);

  const outputEl = win.querySelector(".game-output");
  const stageEl = win.querySelector(".game-stage");
  const promptEl = win.querySelector(".game-prompt");
  const typedEl = win.querySelector(".game-typed");
  const hiddenInput = win.querySelector(".game-input");
  const terminalBody = win.querySelector(".game-terminal-body");

  let inputBuffer = "";
  let interactive = null;

  const term = {
    shell,
    appendLine(text, type = "out") {
      const div = document.createElement("div");
      div.className = `line ${type}`;
      div.textContent = text;
      outputEl.appendChild(div);
      terminalBody.scrollTop = terminalBody.scrollHeight;
    },
    setStage(html) {
      stageEl.innerHTML = html;
      terminalBody.scrollTop = terminalBody.scrollHeight;
    },
    clearStage() { stageEl.innerHTML = ""; },
    clear() { outputEl.innerHTML = ""; stageEl.innerHTML = ""; },
    focus() { hiddenInput.focus({ preventScroll: true }); win.style.zIndex = 80 + winCounter; },
    setInteractive(handlers) {
      if (interactive?.cleanup) interactive.cleanup();
      interactive = handlers;
      updatePrompt();
    },
    close() { destroy(); },
  };

  function updatePrompt() {
    promptEl.textContent = interactive?.onLine ? getPrompt(shell) : "▶ ";
    typedEl.textContent = inputBuffer;
  }

  function destroy() {
    if (interactive?.cleanup) interactive.cleanup();
    interactive = null;
    win.remove();
    openWindows.delete(id);
  }

  // Drag
  const bar = win.querySelector(".game-titlebar");
  let dragging = false, sx, sy, sl, st;
  bar.addEventListener("mousedown", (e) => {
    if (e.target.classList.contains("dot")) return;
    dragging = true;
    term.focus();
    const r = win.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY; sl = r.left; st = r.top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    win.style.left = `${Math.max(0, sl + e.clientX - sx)}px`;
    win.style.top = `${Math.max(0, st + e.clientY - sy)}px`;
  });
  document.addEventListener("mouseup", () => { dragging = false; });

  // Resize
  const handle = win.querySelector(".resize-handle");
  let resizing = false, rsx, rsy, rsw, rsh;
  handle?.addEventListener("mousedown", (e) => {
    resizing = true;
    rsx = e.clientX; rsy = e.clientY;
    rsw = win.offsetWidth; rsh = win.offsetHeight;
    e.preventDefault(); e.stopPropagation();
  });
  document.addEventListener("mousemove", (e) => {
    if (!resizing) return;
    win.style.width = `${Math.max(380, rsw + e.clientX - rsx)}px`;
    win.style.height = `${Math.max(300, rsh + e.clientY - rsy)}px`;
  });
  document.addEventListener("mouseup", () => { resizing = false; });

  win.querySelector(".game-close").addEventListener("click", (e) => {
    e.stopPropagation(); destroy();
  });
  win.querySelector(".game-min").addEventListener("click", (e) => {
    e.stopPropagation(); win.classList.add("minimized");
  });
  terminalBody.addEventListener("click", () => term.focus());

  hiddenInput.addEventListener("input", () => {
    inputBuffer = hiddenInput.value;
    updatePrompt();
  });

  hiddenInput.addEventListener("keydown", (e) => {
    if (interactive?.onKey) {
      interactive.onKey(e);
      if (e.defaultPrevented) return;
    }

    if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      if (interactive?.onCtrlC) interactive.onCtrlC();
      else destroy();
      hiddenInput.value = ""; inputBuffer = "";
      updatePrompt();
      return;
    }

    // Typetest: capture chars live
    if (interactive?.onChar && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      hiddenInput.value = "";
      inputBuffer = "";
      interactive.onChar(e.key);
      return;
    }
    if (interactive?.onBackspace && e.key === "Backspace") {
      e.preventDefault();
      hiddenInput.value = "";
      inputBuffer = "";
      interactive.onBackspace();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const line = hiddenInput.value;
      hiddenInput.value = ""; inputBuffer = "";
      if (interactive?.onLine) {
        term.appendLine(getPrompt(shell) + line, "cmd");
        interactive.onLine(line);
      } else if (line.trim()) {
        term.appendLine(getPrompt(shell) + line, "cmd");
        const parts = line.trim().split(/\s+/);
        const gameCmd = parts[0].toLowerCase();
        if (isGameCmd(gameCmd)) {
          if (interactive?.cleanup) interactive.cleanup();
          stageEl.innerHTML = "";
          launchGame(term, gameCmd, parts.slice(1));
        } else {
          term.appendLine(`Type a game: snake · hangman · typetest · matrix · clock · timer · fortune`, "info");
        }
      }
      updatePrompt();
    }
  });

  openWindows.set(id, term);

  term.appendLine(`═══ ${title} ═══`, "banner");
  term.appendLine("Dedicated game terminal · Ctrl+C to quit game", "info");
  term.appendLine("");
  term.focus();
  launchGame(term, cmd, args);
  return term;
}
