/** Real playable games for game terminals */

import { getHangmanWord } from "./features/commands.js";

const FORTUNES = [
  "The best firewall is an educated user.",
  "Patch today, sleep tonight.",
  "Trust, but verify — then scan again.",
  "A strong password beats a weak firewall.",
  "In cyberspace, the paranoid survive.",
];

const TYPE_SENTENCES = [
  "the quick brown fox jumps over the lazy dog",
  "cyber security starts with strong passwords",
  "always verify before you click any link",
  "education is the best defense against hackers",
];

const HANGMAN_ART = [
  `  +---+\n  |   |\n      |\n      |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n      |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n  |   |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|   |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|\\  |\n      |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|\\  |\n /    |\n      |\n=========`,
  `  +---+\n  |   |\n  O   |\n /|\\  |\n / \\  |\n      |\n=========`,
];

export const GAME_CMDS = new Set([
  "snake", "hangman", "typetest", "matrix", "clock", "timer", "fortune",
]);

export function isGameCmd(cmd) {
  return GAME_CMDS.has(cmd);
}

export function launchGame(term, cmd, args = []) {
  const map = {
    snake: () => startSnake(term),
    hangman: () => startHangman(term),
    typetest: () => startTypetest(term),
    matrix: () => startMatrix(term),
    clock: () => startClock(term),
    timer: () => startTimer(term, args[0] || "30s"),
    fortune: () => startFortune(term),
  };
  if (map[cmd]) map[cmd]();
  else term.appendLine(`Unknown game: ${cmd}`, "err");
}

function startSnake(term) {
  const SIZE = 12;
  let snake = [{ x: 6, y: 6 }];
  let dir = { x: 1, y: 0 };
  let nextDir = { ...dir };
  let food = spawnFood();
  let score = 0;
  let over = false;
  let tickId = null;

  function spawnFood() {
    let f;
    let tries = 0;
    do {
      f = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) };
      tries++;
    } while (snake.some((s) => s.x === f.x && s.y === f.y) && tries < 200);
    return f;
  }

  function render() {
    const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill("·"));
    snake.forEach((s, i) => { grid[s.y][s.x] = i === 0 ? "●" : "○"; });
    grid[food.y][food.x] = "★";
    term.setStage(
      `<div class="game-hud">Score: <strong>${score}</strong> · Length: ${snake.length} · ←↑→↓ move</div>` +
      `<pre class="game-grid">${grid.map((r) => r.join(" ")).join("\n")}</pre>`
    );
  }

  function gameOver(msg) {
    over = true;
    clearInterval(tickId);
    term.clearStage();
    term.appendLine(`💀 Game Over! ${msg}`, "err");
    term.appendLine(`Final Score: ${score}  ·  Length: ${snake.length}`, "info");
    term.appendLine("Type 'snake' to play again · close window to exit", "info");
    term.setInteractive(null);
  }

  function tick() {
    if (over) return;
    dir = { ...nextDir };
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    if (head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE) {
      gameOver("Hit the wall!");
      return;
    }
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver("You bit yourself!");
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      food = spawnFood();
    } else {
      snake.pop();
    }
    render();
  }

  term.appendLine("🐍 SNAKE — Real-time game! Use arrow keys", "ok");
  term.setInteractive({
    onKey(e) {
      if (over) return;
      const dirs = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      };
      const nd = dirs[e.key];
      if (!nd) return;
      e.preventDefault();
      if (nd.x === -dir.x && nd.y === -dir.y) return;
      nextDir = nd;
    },
    onCtrlC() {
      clearInterval(tickId);
      term.clearStage();
      term.appendLine("Snake quit.", "info");
      term.setInteractive(null);
    },
    cleanup: () => clearInterval(tickId),
  });

  render();
  tickId = setInterval(tick, 160);
}

function startHangman(term) {
  const word = getHangmanWord();
  const guessed = new Set();
  let misses = 0;
  let over = false;

  function render() {
    const display = word.split("").map((c) => (guessed.has(c) ? c.toUpperCase() : "_")).join(" ");
    term.setStage(
      `<pre class="game-ascii">${HANGMAN_ART[misses]}</pre>` +
      `<div class="game-hud">Word: <strong>${display}</strong></div>` +
      `<div class="game-hud">Misses: ${misses}/6 · Guessed: ${[...guessed].join(", ") || "—"}</div>`
    );
  }

  function finish(won) {
    over = true;
    term.clearStage();
    if (won) {
      term.appendLine(`🎉 You won! The word was: ${word.toUpperCase()}`, "ok");
    } else {
      term.appendLine(`💀 You lost! The word was: ${word.toUpperCase()}`, "err");
    }
    term.appendLine("Type 'hangman' to play again", "info");
    term.setInteractive(null);
  }

  term.appendLine("🎯 HANGMAN — Type a letter and press Enter", "ok");
  term.setInteractive({
    onLine(line) {
      if (over) return;
      const ch = line.trim().toLowerCase()[0];
      if (!ch || !/[a-z]/.test(ch)) {
        term.appendLine("Enter a single letter (a-z)", "err");
        return;
      }
      if (guessed.has(ch)) {
        term.appendLine(`Already guessed '${ch}'`, "info");
        return;
      }
      guessed.add(ch);
      if (!word.includes(ch)) misses++;
      render();
      if (word.split("").every((c) => guessed.has(c))) finish(true);
      else if (misses >= 6) finish(false);
    },
    onCtrlC() {
      term.clearStage();
      term.appendLine("Hangman quit.", "info");
      term.setInteractive(null);
    },
  });
  render();
}

function startTypetest(term) {
  const target = TYPE_SENTENCES[Math.floor(Math.random() * TYPE_SENTENCES.length)];
  let typed = "";
  const start = Date.now();

  function render() {
    const html = target.split("").map((c, i) => {
      if (i < typed.length) {
        return typed[i] === c
          ? `<span class="tt-ok">${c === " " ? "·" : c}</span>`
          : `<span class="tt-err">${c === " " ? "·" : c}</span>`;
      }
      if (i === typed.length) return `<span class="tt-cur">${c === " " ? "·" : c}</span>`;
      return `<span class="tt-pending">${c === " " ? "·" : c}</span>`;
    }).join("");
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const wpm = typed.length > 0 ? Math.round((typed.length / 5) / (elapsed / 60)) : 0;
    term.setStage(
      `<div class="game-hud">Type the sentence below · ${elapsed}s · ${wpm} WPM</div>` +
      `<div class="typetest-text">${html}</div>`
    );
  }

  function finish() {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const words = target.split(" ").length;
    const wpm = Math.round((words / (elapsed / 60)));
    const acc = Math.round((target.split("").filter((c, i) => typed[i] === c).length / target.length) * 100);
    term.clearStage();
    term.appendLine(`⌨ Typing complete!`, "ok");
    term.appendLine(`Time: ${elapsed}s · WPM: ${wpm} · Accuracy: ${acc}%`, "info");
    term.setInteractive(null);
  }

  term.appendLine("⌨ TYPING TEST — Type the sentence exactly", "ok");
  term.setInteractive({
    onChar(ch) {
      if (typed.length >= target.length) return;
      typed += ch;
      render();
      if (typed.length === target.length) finish();
    },
    onBackspace() {
      if (typed.length > 0) { typed = typed.slice(0, -1); render(); }
    },
    onCtrlC() {
      term.clearStage();
      term.appendLine("Typing test quit.", "info");
      term.setInteractive(null);
    },
  });
  render();
}

function startMatrix(term) {
  term.appendLine("💚 MATRIX RAIN — Ctrl+C to stop", "ok");
  const cols = 48;
  const rows = 16;
  const id = setInterval(() => {
    const lines = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () =>
        Math.random() > 0.3 ? String.fromCharCode(0x30A0 + Math.random() * 96) : " "
      ).join("")
    );
    term.setStage(`<pre class="matrix-rain">${lines.join("\n")}</pre>`);
  }, 80);

  term.setInteractive({
    onCtrlC() {
      clearInterval(id);
      term.clearStage();
      term.appendLine("Matrix ended.", "info");
      term.setInteractive(null);
    },
    cleanup: () => clearInterval(id),
  });
}

function startClock(term) {
  term.appendLine("🕐 LIVE CLOCK — Ctrl+C to stop", "ok");
  const id = setInterval(() => {
    const now = new Date();
    term.setStage(
      `<div class="game-clock">${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>` +
      `<div class="game-hud">${now.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>`
    );
  }, 1000);

  term.setInteractive({
    onCtrlC() {
      clearInterval(id);
      term.clearStage();
      term.appendLine("Clock stopped.", "info");
      term.setInteractive(null);
    },
    cleanup: () => clearInterval(id),
  });
}

function startTimer(term, duration) {
  const m = duration.match(/^(\d+)(s|m|h)$/i);
  if (!m) {
    term.appendLine("Usage: timer 30s | 5m | 1h", "err");
    return;
  }
  let ms = parseInt(m[1]) * (m[2].toLowerCase() === "h" ? 3600000 : m[2].toLowerCase() === "m" ? 60000 : 1000);
  const end = Date.now() + ms;
  term.appendLine(`⏱ Timer started: ${duration}`, "ok");

  const id = setInterval(() => {
    const left = Math.max(0, end - Date.now());
    const sec = Math.ceil(left / 1000);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    const display = min > 0 ? `${min}:${String(s).padStart(2, "0")}` : `${s}s`;
    const pct = 1 - left / ms;
    term.setStage(
      `<div class="game-timer">${display}</div>` +
      `<div class="timer-bar"><div class="timer-fill" style="width:${Math.round(pct * 100)}%"></div></div>`
    );
    if (left <= 0) {
      clearInterval(id);
      term.clearStage();
      term.appendLine("⏰ Timer finished!", "ok");
      term.setInteractive(null);
    }
  }, 100);

  term.setInteractive({
    onCtrlC() {
      clearInterval(id);
      term.clearStage();
      term.appendLine("Timer cancelled.", "info");
      term.setInteractive(null);
    },
    cleanup: () => clearInterval(id),
  });
}

function startFortune(term) {
  const quote = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
  term.setStage(`<div class="fortune-box">🔮 "${quote}"</div>`);
  term.appendLine("Fortune delivered!", "ok");
}
