import { createShell, getPrompt, addHistory, historyPrev, historyNext, setMode } from "./shell.js";
import { parseArgs, asciiBanner } from "./utils.js";
import { runLinux, linuxCommandList } from "./commands/linux.js";
import { runWindows, windowsCommandList } from "./commands/windows.js";
import { quizQuestions, formatQuestion, checkQuizAnswer, getCorrectAnswer, formatQuizResult } from "./quiz.js";
import { scanMessage, scanWebsite, MSG_SCAN_STEPS, WEB_SCAN_STEPS } from "./scanners.js";
import {
  processEmailScan, processPassCheck, processIpLookup, processPortScan,
  processSqlTest, processXssTest, processUsbScan, processDarkWeb, getHangmanWord,
} from "./features/commands.js";
import { buildDesktop, updateTaskbarClock } from "./desktop.js";
import { runBoot } from "./boot.js";
import { notify, setLastReport, exportReport } from "./notify.js";
import { sounds, setSoundEnabled } from "./sounds.js";
import { loadSettings, applySettings, saveSettings, toggleFavorite } from "./settings.js";
import { openSettings, openFileManager, openRecycleBin, openStartMenu, openProgress, openLeaderboard, openHelp, openSecurityDemos, openCtfLab, openMissions, openBadges } from "./os-apps.js";
import { isGameCmd, openGameTerminal } from "./game-terminal.js";
import { getAiReply, getChatWelcome, resetChatHistory, isCasualMessage } from "./ai-chat.js";
import { startCtf, startCtfMenu, checkCtfAnswer, clearCtf, formatCtfMenu, getCtfState, CTF_CHALLENGES } from "./ctf.js";
import { trackTool, trackCommand, trackQuizScore, trackCtfComplete, trackScan, trackGame, trackDailyVisit } from "./progress.js";
import { evaluateBadges } from "./badges.js";
import { onMissionAction } from "./missions.js";
import { addScore } from "./leaderboard.js";
import { runTutorial, shouldShowTutorial, openHelpOverlay } from "./tutorial.js";
import { loadProgress } from "./progress.js";

const shell = createShell();

const outputEl = document.getElementById("output");
const promptEl = document.getElementById("prompt");
const typedEl = document.getElementById("typed");
const terminalEl = document.getElementById("terminal");
const hiddenInput = document.getElementById("hidden-input");
const statusMode = document.getElementById("status-mode");
const statusPath = document.getElementById("status-path");
const btnLinux = document.getElementById("btn-linux");
const btnWindows = document.getElementById("btn-windows");
const btnClear = document.getElementById("btn-clear");
const btnClose = document.getElementById("btn-close");
const btnMinimize = document.getElementById("btn-minimize");
const btnMaximize = document.getElementById("btn-maximize");
const titlebarEl = document.getElementById("titlebar");
const appEl = document.getElementById("app");
const desktopEl = document.getElementById("desktop-icons");
const taskbarTerminal = document.getElementById("taskbar-terminal");
const taskbarLinux = document.getElementById("taskbar-linux");
const taskbarWindows = document.getElementById("taskbar-windows");
const taskbarClock = document.getElementById("taskbar-clock");
const startBtn = document.getElementById("start-btn");
const app2El = document.getElementById("app2");
const taskbarTerminal2 = document.getElementById("taskbar-terminal2");

let settings = loadSettings();
applySettings(settings, shell);
setSoundEnabled(settings.sound);

const shell2 = createShell();
applySettings(settings, shell2);

let inputBuffer = "";
let quizState = null;
let scanState = null;
let promptState = null;
let snakeState = null;
let hangmanState = null;
let typetestState = null;
let chatState = null;
let clockInterval = null;
let timerInterval = null;
let matrixInterval = null;
let scanRunning = false;
let ctfActive = null;

function scrollBottom() {
  terminalEl.scrollTop = terminalEl.scrollHeight;
}

function appendLine(text, type = "out") {
  const div = document.createElement("div");
  div.className = `line ${type}`;
  div.textContent = text;
  outputEl.appendChild(div);
  scrollBottom();
}

function printResults(results) {
  for (const r of results || []) {
    if (r.special) return r;
    const lines = (r.text || "").split("\n");
    for (const ln of lines) appendLine(ln, r.type || "out");
  }
  return null;
}

function printBanner() {
  asciiBanner().trim().split("\n").forEach((line) => appendLine(line, "banner"));
  appendLine("");
  appendLine("EduShell OS Desktop ready!", "ok");
  appendLine("Click icon to run · Yellow dot = minimize · Drag · Resize corner", "info");
  appendLine("");
}

function clearInteractive() {
  quizState = scanState = promptState = snakeState = hangmanState = typetestState = chatState = ctfActive = null;
  clearCtf();
  scanRunning = false;
  if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (matrixInterval) { clearInterval(matrixInterval); matrixInterval = null; }
}

function updateUI() {
  promptEl.textContent = getPrompt(shell);
  typedEl.textContent = inputBuffer;
  statusMode.textContent = shell.mode === "windows" ? "Mode: Windows (CMD)" : "Mode: Linux (bash)";
  statusPath.textContent = shell.cwd;
  btnLinux.classList.toggle("active", shell.mode === "linux");
  btnWindows.classList.toggle("active", shell.mode === "windows");
}

function clearScreen() {
  outputEl.innerHTML = "";
}

function restoreTerminal() {
  appEl.classList.remove("minimized");
  taskbarTerminal.classList.add("active");
  focusInput();
}

function minimizeTerminal() {
  appEl.classList.add("minimized");
  taskbarTerminal.classList.remove("active");
}

function toggleMaximize() {
  appEl.classList.toggle("maximized");
  if (appEl.classList.contains("maximized")) {
    appEl.style.left = "0";
    appEl.style.top = "0";
    appEl.style.width = "";
    appEl.style.height = "";
  }
}

function initWindowPosition() {
  const w = Math.min(680, window.innerWidth * 0.55);
  const h = Math.min(420, window.innerHeight * 0.5);
  appEl.style.width = `${w}px`;
  appEl.style.height = `${h}px`;
  appEl.style.left = `${(window.innerWidth - w) / 2}px`;
  appEl.style.top = `${(window.innerHeight - h) / 2 - 30}px`;
  appEl.style.transform = "none";
}

function setupWindowDrag() {
  let dragging = false;
  let startX, startY, startLeft, startTop;

  titlebarEl.addEventListener("mousedown", (e) => {
    if (e.target.closest(".mode-btn") || e.target.classList.contains("dot")) return;
    if (appEl.classList.contains("maximized")) return;

    dragging = true;
    appEl.classList.add("dragging");
    appEl.style.zIndex = "50";
    const rect = appEl.getBoundingClientRect();
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    appEl.style.transform = "none";
    appEl.style.left = `${startLeft}px`;
    appEl.style.top = `${startTop}px`;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const newLeft = Math.max(0, Math.min(window.innerWidth - 100, startLeft + e.clientX - startX));
    const newTop = Math.max(0, Math.min(window.innerHeight - 80, startTop + e.clientY - startY));
    appEl.style.left = `${newLeft}px`;
    appEl.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", () => {
    if (dragging) appEl.classList.remove("dragging");
    dragging = false;
  });
}

function setupWindowResize() {
  const handle = document.getElementById("resize-handle");
  if (!handle) return;

  let resizing = false;
  let startX, startY, startW, startH;

  handle.addEventListener("mousedown", (e) => {
    if (appEl.classList.contains("maximized")) return;
    resizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startW = appEl.offsetWidth;
    startH = appEl.offsetHeight;
    appEl.style.transform = "none";
    e.preventDefault();
    e.stopPropagation();
  });

  document.addEventListener("mousemove", (e) => {
    if (!resizing) return;
    const w = Math.max(380, Math.min(window.innerWidth - 20, startW + e.clientX - startX));
    const h = Math.max(260, Math.min(window.innerHeight - 60, startH + e.clientY - startY));
    appEl.style.width = `${w}px`;
    appEl.style.height = `${h}px`;
  });

  document.addEventListener("mouseup", () => { resizing = false; });
}

async function runScanSteps(steps) {
  scanRunning = true;
  for (const step of steps) {
    appendLine(`  → ${step}`, "info");
    await new Promise((r) => setTimeout(r, 350));
  }
}

function startWebScan() {
  setMode(shell, "linux"); updateUI();
  scanState = { type: "web" };
  appendLine("[Web Hunter] Enter website URL:", "ok");
  appendLine("Example: https://example.com", "info");
  focusInput(); restoreTerminal();
}

function startMsgScan() {
  setMode(shell, "windows"); updateUI();
  scanState = { type: "msg" };
  appendLine("[Msg Guard] Paste message to scan:", "ok");
  focusInput(); restoreTerminal();
}

function startPrompt(type, msg) {
  promptState = { type };
  appendLine(msg, "info");
  focusInput(); restoreTerminal();
}

function showQuizQuestion() {
  const lines = formatQuestion(quizState.index);
  if (!lines) { finishQuiz(); return; }
  lines.forEach((line) => appendLine(line, line.startsWith("═") ? "info" : "out"));
}

function startQuiz() {
  quizState = { index: 0, score: 0 };
  appendLine("Starting Quiz...", "ok");
  showQuizQuestion(); restoreTerminal();
}

function finishQuiz() {
  const pct = trackQuizScore(quizState.score, quizQuestions.length);
  addScore(settings.username, "Quiz", pct, `${quizState.score}/${quizQuestions.length}`);
  formatQuizResult(quizState.score, quizQuestions.length).forEach((line) => {
    appendLine(line, line.includes("QUIZ") || line.startsWith("═") ? "info" : "ok");
  });
  notify("Quiz Complete", `Score ${pct}% — saved to leaderboard!`, pct >= 60 ? "success" : "warning");
  handleGamification({ cmd: "quiz", line: "quiz", args: ["quiz"] });
  quizState = null;
}

function startSnake() {
  snakeState = { x: 4, y: 4, body: [[4, 4]], food: [6, 6], dir: [0, 1], over: false };
  appendLine("Snake! Use arrow keys · Ctrl+C to quit", "ok");
  renderSnake();
  restoreTerminal();
}

function renderSnake() {
  const s = snakeState;
  const grid = Array.from({ length: 8 }, () => Array(8).fill("·"));
  s.body.forEach(([x, y]) => { if (grid[y]) grid[y][x] = "○"; });
  grid[s.food[1]][s.food[0]] = "★";
  grid[s.y][s.x] = "●";
  appendLine(grid.map((r) => r.join(" ")).join("\n"), "out");
}

function startHangman() {
  const word = getHangmanWord();
  hangmanState = { word, guessed: new Set(), misses: 0 };
  appendLine("Hangman! Guess letters · Ctrl+C to quit", "ok");
  showHangman(); restoreTerminal();
}

function showHangman() {
  const h = hangmanState;
  const display = h.word.split("").map((c) => (h.guessed.has(c) ? c : "_")).join(" ");
  appendLine(`Word: ${display}  |  Misses: ${h.misses}/6`, "out");
}

function startTypetest() {
  const s = "the quick brown fox jumps over the lazy dog";
  typetestState = { target: s, start: Date.now() };
  appendLine(`Type this: ${s}`, "ok");
  restoreTerminal();
}

function startMatrix() {
  appendLine("Matrix rain... Ctrl+C to stop", "ok");
  let n = 0;
  matrixInterval = setInterval(() => {
    if (n++ > 12) { clearInterval(matrixInterval); matrixInterval = null; appendLine("Matrix ended.", "info"); return; }
    const line = Array.from({ length: 40 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)).join("");
    appendLine(line, "ok");
  }, 200);
  restoreTerminal();
}

function startClock() {
  appendLine("Live clock · Ctrl+C to stop", "ok");
  clockInterval = setInterval(() => {
    appendLine(new Date().toLocaleString(), "info");
  }, 1000);
  restoreTerminal();
}

function startTimer(duration) {
  const m = duration.match(/^(\d+)(s|m|h)$/i);
  if (!m) { appendLine("Invalid format. Use: 30s, 5m, 1h", "err"); return; }
  let ms = parseInt(m[1]) * (m[2] === "h" ? 3600000 : m[2] === "m" ? 60000 : 1000);
  appendLine(`Timer: ${duration}`, "ok");
  const end = Date.now() + ms;
  timerInterval = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    if (left <= 0) { clearInterval(timerInterval); timerInterval = null; appendLine("Timer finished!", "ok"); return; }
    appendLine(`  ${Math.ceil(left / 1000)}s remaining`, "info");
  }, 1000);
  restoreTerminal();
}

function startChat() {
  resetChatHistory();
  chatState = { active: true };
  getChatWelcome(settings.username).forEach((line) => {
    appendLine(line, line.startsWith("╔") || line.startsWith("║") ? "info" : line.startsWith("Vanakkam") ? "ok" : "out");
  });
  restoreTerminal();
}

async function handleScanInput(rawLine) {
  appendLine(getPrompt(shell) + rawLine, "cmd");
  if (rawLine.trim().toLowerCase() === "cancel") { scanState = null; scanRunning = false; appendLine("Cancelled.", "info"); return; }
  if (!rawLine.trim()) { appendLine("Empty input.", "err"); sounds.error(); return; }
  let report = "";
  if (scanState.type === "web") {
    await runScanSteps(WEB_SCAN_STEPS);
    const result = scanWebsite(rawLine.trim());
    report = result.lines.join("\n");
    result.lines.forEach((l) => appendLine(l, l.includes("RISK") || l.startsWith("[HIGH") ? "err" : l.startsWith("[OK") ? "ok" : "out"));
    notify("Web Hunter", `Scan complete — Score ${result.health}/100`, result.health >= 70 ? "success" : "warning");
  } else {
    await runScanSteps(MSG_SCAN_STEPS);
    const result = scanMessage(rawLine);
    report = result.lines.join("\n");
    result.lines.forEach((l) => appendLine(l, l.includes("DANGER") ? "err" : l.includes("SAFE") ? "ok" : "out"));
    notify("Msg Guard", `Health ${result.health}/100 — ${result.status}`, result.health >= 70 ? "success" : "error");
  }
  setLastReport(report);
  trackScan();
  sounds.success();
  const scanType = scanState.type;
  scanState = null; scanRunning = false;
  handleGamification({ cmd: scanType === "web" ? "webscan" : "msgcheck", line: rawLine, scanType, args: [scanType] });
}

async function handlePromptInput(rawLine) {
  appendLine(getPrompt(shell) + rawLine, "cmd");
  if (rawLine.trim().toLowerCase() === "cancel") { promptState = null; appendLine("Cancelled.", "info"); return; }
  const t = promptState.type;
  const handlers = {
    email: processEmailScan, pass: processPassCheck, ip: processIpLookup,
    port: processPortScan, sql: processSqlTest, xss: processXssTest,
    usb: processUsbScan, darkweb: processDarkWeb,
  };
  if (handlers[t]) {
    printResults(handlers[t](rawLine.trim()));
    notify(`${t} scan`, "Analysis complete", "success");
    sounds.success();
    if (t === "pass") {
      handleGamification({ cmd: "passcheck", line: `passcheck ${rawLine.trim()}`, args: ["passcheck", rawLine.trim()] });
    }
  } else if (t === "practice") {
    appendLine(`Practice '${rawLine}': try it now in terminal!`, "ok");
    appendLine(`Example: ${rawLine} ${shell.mode === "linux" ? "documents" : "Documents"}`, "info");
  }
  promptState = null;
}

function handleQuizInput(rawLine) {
  appendLine(getPrompt(shell) + rawLine, "cmd");
  const line = rawLine.trim().toLowerCase();
  if (line === "quit") { quizState = null; return; }
  if (!["a", "b", "c"].includes(line)) { appendLine("Type a, b, or c", "err"); return; }
  const correct = checkQuizAnswer(quizState.index, line);
  appendLine(correct ? "Correct!" : `Wrong! ${getCorrectAnswer(quizState.index)}`, correct ? "ok" : "err");
  if (correct) quizState.score++;
  quizState.index++;
  showQuizQuestion();
}

function handleSnakeKey(key) {
  const s = snakeState;
  const dirs = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
  if (!dirs[key]) return;
  s.dir = dirs[key];
  s.x += s.dir[0]; s.y += s.dir[1];
  if (s.x < 0 || s.x > 7 || s.y < 0 || s.y > 7) { appendLine("Game Over!", "err"); snakeState = null; return; }
  s.body.unshift([s.x, s.y]);
  if (s.x === s.food[0] && s.y === s.food[1]) {
    s.food = [Math.floor(Math.random() * 8), Math.floor(Math.random() * 8)];
    appendLine("Food eaten! +1", "ok");
  } else s.body.pop();
  renderSnake();
}

function handleHangmanInput(rawLine) {
  appendLine(getPrompt(shell) + rawLine, "cmd");
  const ch = rawLine.trim().toLowerCase()[0];
  if (!ch || !/[a-z]/.test(ch)) return;
  if (hangmanState.guessed.has(ch)) { appendLine("Already guessed.", "info"); return; }
  hangmanState.guessed.add(ch);
  if (!hangmanState.word.includes(ch)) hangmanState.misses++;
  showHangman();
  const won = hangmanState.word.split("").every((c) => hangmanState.guessed.has(c));
  if (won) { appendLine("You won!", "ok"); hangmanState = null; }
  else if (hangmanState.misses >= 6) { appendLine(`Lost! Word: ${hangmanState.word}`, "err"); hangmanState = null; }
}

function handleTypetestInput(rawLine) {
  appendLine(getPrompt(shell) + rawLine, "cmd");
  const elapsed = ((Date.now() - typetestState.start) / 1000).toFixed(1);
  const wpm = Math.round((rawLine.trim().split(/\s+/).length / elapsed) * 60);
  appendLine(`Time: ${elapsed}s · WPM: ${wpm} · Accuracy: ${rawLine === typetestState.target ? "100%" : "check"}`, "ok");
  typetestState = null;
}

function handleChatInput(rawLine) {
  appendLine(getPrompt(shell) + rawLine, "cmd");
  const line = rawLine.trim();
  if (!line) return;
  if (line.toLowerCase() === "exit") {
    chatState = null;
    resetChatHistory();
    appendLine("EduBot: Paarkalam! 👋 Happy learning!", "info");
    return;
  }

  const typingEl = document.createElement("div");
  typingEl.className = "line info chat-typing";
  typingEl.textContent = "EduBot is typing...";
  outputEl.appendChild(typingEl);
  scrollBottom();

  getAiReply(line, settings).then(({ text, mode }) => {
    typingEl.remove();
    const modeTag = mode === "offline" ? "" : ` [${mode}]`;
    appendLine(`EduBot${modeTag}: ${text}`, "info");
    trackTool("chat");
    scrollBottom();
  });
}

function beginCtfChallenge(challengeNum) {
  const ch = CTF_CHALLENGES[challengeNum - 1];
  if (!ch) return;
  ctfActive = startCtf(ch.id);
  restoreTerminal();
  appendLine(`🚩 CTF Challenge: ${ch.title}`, "ok");
  appendLine(ch.desc, "info");
  appendLine(`Hint: ${ch.hint}`, "info");
  appendLine("Submit answer or flag when ready · Ctrl+C to quit", "info");
  focusInput();
}

function handleGamification(ctx) {
  const missionResult = onMissionAction(ctx);
  if (missionResult) {
    notify("Mission Complete!", `${missionResult.mission.title} — Great work, Analyst!`, "success");
    sounds.success();
    appendLine(`🎖 MISSION ${missionResult.mission.num} COMPLETE: ${missionResult.mission.title}!`, "ok");
    for (const b of missionResult.badges || []) {
      appendLine(`🏅 Badge Unlocked: ${b.emoji} ${b.title}!`, "info");
    }
  }

  const shown = new Set((missionResult?.badges || []).map((b) => b.id));
  for (const b of evaluateBadges()) {
    if (shown.has(b.id)) continue;
    notify("Badge Unlocked!", `${b.emoji} ${b.title}`, "success");
    appendLine(`🏅 Badge Unlocked: ${b.emoji} ${b.title}!`, "info");
    sounds.success();
  }
}

function onCtfSuccess(result) {
  const flags = trackCtfComplete(ctfActive.id);
  addScore(settings.username, "CTF", result.points, ctfActive.title);
  appendLine(`🎉 FLAG CAPTURED! ${result.flag}`, "ok");
  appendLine(`+${result.points} points · Total flags: ${flags}`, "ok");
  notify("CTF", `Flag captured! ${ctfActive.title}`, "success");
  sounds.success();
  handleGamification({ cmd: "ctf", line: result.flag, args: ["ctf"] });
  ctfActive = null;
  clearCtf();
}

async function handleCtfLine(rawLine) {
  const line = rawLine.trim();
  appendLine(getPrompt(shell) + rawLine, "cmd");
  if (!line) return;
  addHistory(shell, line);
  trackCommand();

  let result = checkCtfAnswer(line.replace(/^flag\s+/i, ""), line);
  if (result?.correct) { onCtfSuccess(result); return; }

  const args = parseArgs(line);
  if (args[0]) trackTool(args[0].toLowerCase());
  const results = shell.mode === "windows" ? await runWindows(shell, args, line) : await runLinux(shell, args, line);
  for (const r of results || []) {
    if (await processSpecial(r)) continue;
    printResults([r]);
  }

  result = checkCtfAnswer(line.replace(/^flag\s+/i, ""), line);
  if (result?.correct) onCtfSuccess(result);
  else if (result?.showHint) appendLine(`Hint: ${result.hint}`, "warning");
  else if (/^flag\s|^edu\{/i.test(line)) appendLine("Wrong flag — try again!", "err");
  handleGamification({ cmd: args[0]?.toLowerCase(), line, args });
  updateUI();
}

async function processSpecial(r) {
  if (!r?.special) return false;
  const map = {
    clear: () => clearScreen(),
    "quiz-start": () => startQuiz(),
    "webscan-start": () => startWebScan(),
    "msgscan-start": () => startMsgScan(),
    "snake-start": () => startSnake(),
    "hangman-start": () => startHangman(),
    "typetest-start": () => startTypetest(),
    "matrix-start": () => startMatrix(),
    "clock-start": () => startClock(),
    "chat-start": () => startChat(),
    prompt: () => startPrompt(r.type, r.msg),
    "timer-start": () => startTimer(r.duration),
    "open-settings": () => openSettings(settings, shell, onSettingsUpdate),
    "open-filemanager": () => openFileManager(shell, (t, m, ty) => notify(t, m, ty)),
    "open-recyclebin": () => openRecycleBin(null, (t, m, ty) => notify(t, m, ty)),
    "report-export": () => {
      if (exportReport()) notify("Report Export", "Report downloaded!", "success");
      else appendLine("No report to export. Run a scan first.", "err");
    },
    "ctf-menu": () => {
      const completed = loadProgress().ctfCompleted;
      formatCtfMenu(completed).forEach((l) => appendLine(l, l.startsWith("╔") ? "info" : "out"));
      restoreTerminal();
    },
    "ctf-start": () => {
      const ch = CTF_CHALLENGES.find((c) => c.id === r.id);
      if (!ch) return;
      ctfActive = startCtf(ch.id);
      appendLine(`🚩 ${ch.title}: ${ch.desc}`, "ok");
      appendLine(`Hint: ${ch.hint}`, "info");
      restoreTerminal();
    },
    "open-progress": () => openProgress(settings),
    "open-leaderboard": () => openLeaderboard(settings),
    "open-help": () => openHelp(),
    "open-securitydemo": () => openSecurityDemos(),
    "open-missions": () => openMissions(),
    "open-badges": () => openBadges(),
  };
  if (map[r.special]) { map[r.special](); return true; }
  return false;
}

async function executeCommand(rawLine) {
  const line = rawLine.trim();

  if (quizState) { handleQuizInput(rawLine); return; }
  if (scanState) { await handleScanInput(rawLine); return; }
  if (promptState) { await handlePromptInput(rawLine); return; }
  if (hangmanState) { handleHangmanInput(rawLine); return; }
  if (typetestState) { handleTypetestInput(rawLine); return; }
  if (chatState) { handleChatInput(rawLine); return; }
  if (ctfActive) { await handleCtfLine(rawLine); return; }

  appendLine(getPrompt(shell) + line, "cmd");
  if (!line) return;

  addHistory(shell, line);

  // Human-like reply for hi, hello, hlo, casual talk (no `chat` needed)
  if (isCasualMessage(line)) {
    trackCommand();
    const typingEl = document.createElement("div");
    typingEl.className = "line info chat-typing";
    typingEl.textContent = "EduBot is typing...";
    outputEl.appendChild(typingEl);
    scrollBottom();
    getAiReply(line, settings).then(({ text, mode }) => {
      typingEl.remove();
      const tag = mode !== "offline" ? ` [${mode}]` : "";
      appendLine(`EduBot${tag}: ${text}`, "info");
      appendLine("💬 Type `chat` for full conversation", "info");
      updateUI();
    });
    return;
  }

  trackCommand();
  const cmdName = parseArgs(line)[0]?.toLowerCase();
  if (cmdName) trackTool(cmdName);

  const args = parseArgs(line);
  const results = shell.mode === "windows" ? await runWindows(shell, args, line) : await runLinux(shell, args, line);

  for (const r of results || []) {
    if (await processSpecial(r)) continue;
    printResults([r]);
  }

  handleGamification({ cmd: cmdName, line, args: parseArgs(line) });
  updateUI();
}

function getAllCommands() {
  return [...new Set(shell.mode === "windows" ? windowsCommandList() : linuxCommandList())];
}

function autocomplete() {
  const parts = parseArgs(inputBuffer.trim());
  const cmd = parts[0]?.toLowerCase() || "";
  const matches = getAllCommands().filter((c) => c.startsWith(cmd));
  if (matches.length === 1) inputBuffer = matches[0] + " ";
  else if (matches.length > 1) appendLine(matches.join("  "), "info");
  updateUI();
}

function focusInput() { hiddenInput.focus({ preventScroll: true }); }

function switchMode(mode) {
  setMode(shell, mode);
  appendLine(`Switched to ${mode === "windows" ? "Windows CMD" : "Linux bash"}.`, "ok");
  updateUI();
}

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
}

function handleToolbarClick(e) {
  const btn = e.target.closest("button");
  if (btn) {
    e.preventDefault(); e.stopPropagation();
    if (btn === btnLinux) { switchMode("linux"); focusInput(); return; }
    if (btn === btnWindows) { switchMode("windows"); focusInput(); return; }
    if (btn === btnClear) { clearScreen(); focusInput(); return; }
  }
}

function handleWindowControls(e) {
  const t = e.target;
  if (t === btnClose || t === btnMinimize) { e.stopPropagation(); minimizeTerminal(); }
  if (t === btnMaximize) { e.stopPropagation(); toggleMaximize(); }
}

function onSettingsUpdate(s) {
  settings = s;
  applySettings(settings, shell);
  applySettings(settings, shell2);
  setSoundEnabled(settings.sound);
  rebuildDesktop();
  updateUI();
  notify("Settings", "Settings saved successfully", "success");
}

function rebuildDesktop() {
  buildDesktop(desktopEl, launchTool, settings);
}

function openTerminal2() {
  app2El.classList.remove("minimized");
  app2El.style.zIndex = "45";
  document.getElementById("hidden-input-2").focus();
  notify("Terminal 2", "Second terminal opened", "info");
}

function launchTool(tool) {
  if (tool.action === "favorite") {
    const wasFav = settings.favorites.includes(tool.cmd);
    toggleFavorite(tool.cmd, settings);
    rebuildDesktop();
    notify("Favorites", `${tool.title} ${wasFav ? "removed from" : "added to"} favorites`, "info");
    return;
  }
  if (tool.app === "settings") { openSettings(settings, shell, onSettingsUpdate); return; }
  if (tool.app === "filemanager") { openFileManager(shell, (t, m, ty) => notify(t, m, ty)); return; }
  if (tool.app === "recyclebin") { openRecycleBin(null, (t, m, ty) => notify(t, m, ty)); return; }
  if (tool.app === "progress") { openProgress(settings); return; }
  if (tool.app === "missions") { openMissions(); return; }
  if (tool.app === "badges") { openBadges(); return; }
  if (tool.app === "leaderboard") { openLeaderboard(settings); return; }
  if (tool.app === "help") { openHelp(); return; }
  if (tool.app === "securitydemo") { openSecurityDemos(); return; }
  if (tool.cmd === "ctf") { openCtfLab(beginCtfChallenge); return; }

  if (tool.category === "fun" || isGameCmd(tool.cmd)) {
    trackGame();
    trackTool(tool.cmd);
    openGameTerminal(tool.title, tool.cmd, settings);
    notify(tool.title, "Game terminal opened!", "success");
    return;
  }

  sounds.click();
  trackTool(tool.cmd);
  restoreTerminal();
  appEl.style.zIndex = "50";
  if (tool.mode === "linux") setMode(shell, "linux");
  else if (tool.mode === "windows") setMode(shell, "windows");
  updateUI();
  notify(tool.title, "Starting...", "info");
  executeCommand(tool.cmd);
}

function handleSystemApp(app) {
  if (app === "settings") openSettings(settings, shell, onSettingsUpdate);
  else if (app === "filemanager") openFileManager(shell, (t, m, ty) => notify(t, m, ty));
  else if (app === "recyclebin") openRecycleBin(null, (t, m, ty) => notify(t, m, ty));
  else if (app === "terminal2") openTerminal2();
}

function initOS() {
  rebuildDesktop();
  initWindowPosition();
  setupWindowDrag();
  setupWindowResize();

  startBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openStartMenu(launchTool, handleSystemApp);
  });

  taskbarTerminal.addEventListener("click", () => {
    if (appEl.classList.contains("minimized")) restoreTerminal();
    else minimizeTerminal();
  });

  taskbarTerminal2.addEventListener("click", () => {
    if (app2El.classList.contains("minimized")) openTerminal2();
    else app2El.classList.add("minimized");
  });

  document.querySelector(".btn-minimize-2")?.addEventListener("click", () => app2El.classList.add("minimized"));
  document.querySelector(".btn-close-2")?.addEventListener("click", () => app2El.classList.add("minimized"));

  taskbarLinux.addEventListener("click", () => { switchMode("linux"); restoreTerminal(); });
  taskbarWindows.addEventListener("click", () => { switchMode("windows"); restoreTerminal(); });

  updateTaskbarClock(taskbarClock);
  setInterval(() => updateTaskbarClock(taskbarClock), 1000);

  hiddenInput.addEventListener("input", () => { inputBuffer = hiddenInput.value; updateUI(); });

  hiddenInput.addEventListener("keydown", (e) => {
    if (e.key === "?" && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      openHelpOverlay();
      return;
    }
    if (snakeState && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault(); handleSnakeKey(e.key); return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const line = hiddenInput.value;
      hiddenInput.value = ""; inputBuffer = "";
      executeCommand(line);
      return;
    }
    if (e.key === "ArrowUp") { e.preventDefault(); hiddenInput.value = inputBuffer = historyPrev(shell); updateUI(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); hiddenInput.value = inputBuffer = historyNext(shell); updateUI(); return; }
    if (e.key === "Tab") { e.preventDefault(); autocomplete(); hiddenInput.value = inputBuffer; return; }
    if (e.key === "l" && e.ctrlKey) { e.preventDefault(); clearScreen(); return; }
    if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      appendLine(getPrompt(shell) + inputBuffer + "^C", "cmd");
      clearInteractive();
      hiddenInput.value = ""; inputBuffer = "";
      updateUI();
    }
    if (e.key === "F11") { e.preventDefault(); toggleFullscreen(); }
  });

  const hi2 = document.getElementById("hidden-input-2");
  const out2 = document.getElementById("output2");
  const pr2 = document.getElementById("prompt2");
  hi2?.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const line = hi2.value.trim();
    hi2.value = "";
    const div = document.createElement("div");
    div.className = "line cmd";
    div.textContent = getPrompt(shell2) + line;
    out2.appendChild(div);
    if (!line) return;
    const args = parseArgs(line);
    const results = shell2.mode === "windows" ? await runWindows(shell2, args, line) : await runLinux(shell2, args, line);
    results?.forEach((r) => {
      if (r.text) {
        const d = document.createElement("div");
        d.className = `line ${r.type || "out"}`;
        d.textContent = r.text;
        out2.appendChild(d);
      }
    });
    pr2.textContent = getPrompt(shell2);
  });

  titlebarEl.addEventListener("click", (e) => { handleWindowControls(e); handleToolbarClick(e); });
  terminalEl.addEventListener("click", focusInput);

  printBanner();
  updateUI();
  focusInput();
  sounds.boot();
  trackDailyVisit();
  evaluateBadges();
  notify("EduShell OS", `Welcome ${settings.username}! Desktop ready.`, "success");

  if (shouldShowTutorial()) {
    setTimeout(() => runTutorial(null, {
      onTry: (stepIndex) => {
        if (stepIndex === 0) openStartMenu(launchTool, handleSystemApp);
      },
    }), 800);
  }
}

runBoot(() => initOS());
