import { readFile, resolveNode } from "../filesystem.js";
import { resolvePath } from "../shell.js";
import { scanMessage, scanWebsite } from "../scanners.js";
import { CTF_CHALLENGES } from "../ctf.js";

function out(lines, type = "out") {
  return lines.map((t) => ({ text: t, type }));
}
function err(msg) { return [{ text: msg, type: "err" }]; }
function ok(msg) { return [{ text: msg, type: "ok" }]; }

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fakeIpLookup(ip) {
  const p = ip.split(".").map(Number);
  const hash = p.reduce((a, b) => a + b, 0);
  const countries = ["US", "IN", "DE", "GB", "SG", "JP", "AU"];
  const isps = ["Cloudflare", "AWS", "Google", "Airtel", "Jio", "Comcast", "DigitalOcean"];
  return {
    ip,
    country: countries[hash % countries.length],
    city: ["New York", "Chennai", "Berlin", "London", "Singapore"][hash % 5],
    isp: isps[hash % isps.length],
    org: "AS" + (10000 + hash * 37),
    lat: (hash % 90).toFixed(4),
    lon: (hash % 180).toFixed(4),
  };
}

function checkPassword(pw) {
  let score = 0;
  const issues = [];
  if (pw.length >= 8) score += 20; else issues.push("Too short (min 8 chars)");
  if (pw.length >= 12) score += 10;
  if (/[a-z]/.test(pw)) score += 15; else issues.push("No lowercase");
  if (/[A-Z]/.test(pw)) score += 15; else issues.push("No uppercase");
  if (/\d/.test(pw)) score += 15; else issues.push("No numbers");
  if (/[^a-zA-Z0-9]/.test(pw)) score += 15; else issues.push("No special chars");
  if (/(.)\1{2,}/.test(pw)) { score -= 10; issues.push("Repeated characters"); }
  if (/12345|password|qwerty|admin/i.test(pw)) { score -= 20; issues.push("Common password pattern"); }
  score = Math.max(0, Math.min(100, score));
  let label = "WEAK";
  if (score >= 80) label = "STRONG";
  else if (score >= 60) label = "GOOD";
  else if (score >= 40) label = "FAIR";
  return { score, label, issues };
}

function checkEmail(email) {
  const threats = [];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { valid: false, threats: ["Invalid email format"] };
  const domain = email.split("@")[1];
  const tld = domain.split(".").pop();
  if (["tk", "ml", "ga", "cf", "xyz"].includes(tld)) threats.push("Suspicious TLD (phishing risk)");
  if (/paypal|amazon|microsoft|google|apple/i.test(email.split("@")[0]) && !/^(paypal|amazon|microsoft|google|apple)/i.test(domain))
    threats.push("Brand impersonation in local part");
  if (/\d{4,}/.test(domain)) threats.push("Numeric-heavy domain (suspicious)");
  if (domain.split(".").length > 3) threats.push("Long subdomain chain");
  return { valid: true, domain, threats };
}

const LESSONS = {
  linux: [
    { cmd: "ls", desc: "List files", ex: "ls -la" },
    { cmd: "cd", desc: "Change directory", ex: "cd documents" },
    { cmd: "pwd", desc: "Show current path", ex: "pwd" },
    { cmd: "cat", desc: "View file", ex: "cat readme.txt" },
    { cmd: "mkdir", desc: "Create folder", ex: "mkdir projects" },
    { cmd: "rm", desc: "Remove file", ex: "rm -r folder" },
    { cmd: "grep", desc: "Search in file", ex: "grep hello file.txt" },
  ],
  windows: [
    { cmd: "dir", desc: "List files", ex: "dir" },
    { cmd: "cd", desc: "Change directory", ex: "cd Documents" },
    { cmd: "type", desc: "View file", ex: "type readme.txt" },
    { cmd: "md", desc: "Create folder", ex: "md NewFolder" },
    { cmd: "del", desc: "Delete file", ex: "del file.txt" },
    { cmd: "copy", desc: "Copy file", ex: "copy a.txt b.txt" },
    { cmd: "ipconfig", desc: "Network info", ex: "ipconfig" },
  ],
};

const FLASHCARDS = [
  { q: "Linux: list files?", a: "ls" },
  { q: "Windows: list files?", a: "dir" },
  { q: "Clear screen Linux?", a: "clear" },
  { q: "Clear screen Windows?", a: "cls" },
  { q: "Show file Linux?", a: "cat" },
  { q: "Show file Windows?", a: "type" },
  { q: "Current user?", a: "whoami" },
  { q: "Change directory?", a: "cd" },
];

const DAILY_COMMANDS = [
  { cmd: "ls", ex: "ls -la", tip: "List all files with details" },
  { cmd: "grep", ex: "grep error log.txt", tip: "Search text in files" },
  { cmd: "tree", ex: "tree", tip: "Show folder structure" },
  { cmd: "history", ex: "history", tip: "See past commands" },
  { cmd: "webscan", ex: "webscan", tip: "Scan website security" },
  { cmd: "passcheck", ex: "passcheck", tip: "Check password strength" },
  { cmd: "todo", ex: 'todo add "study"', tip: "Manage tasks" },
];

const FORTUNES = [
  "The best way to learn Linux is to break things safely.",
  "Every expert was once a beginner who didn't quit.",
  "grep is your best friend in the terminal.",
  "Security is not a product — it's a process.",
  "Automate the boring stuff. Learn scripting.",
  "Read the error message. It usually tells you the answer.",
  "Back up before rm -rf. Always.",
  "Practice one command every day.",
];

const HANGMAN_WORDS = ["terminal", "linux", "windows", "security", "hack", "python", "network", "server", "script", "kernel"];

export const featureCommands = {
  webscan: () => [{ special: "webscan-start" }],
  msgcheck: () => [{ special: "msgscan-start" }],
  quiz: () => [{ special: "quiz-start" }],
  emailscan: () => [{ special: "prompt", type: "email", msg: "Enter email address to scan:" }],
  passcheck: () => [{ special: "prompt", type: "pass", msg: "Enter password to analyze:" }],
  iplookup: () => [{ special: "prompt", type: "ip", msg: "Enter IP address (e.g. 8.8.8.8):" }],
  portscan: () => [{ special: "prompt", type: "port", msg: "Enter IP to port scan:" }],
  sqltest: () => [{ special: "prompt", type: "sql", msg: "Enter URL to test for SQL injection:" }],
  xsstest: () => [{ special: "prompt", type: "xss", msg: "Enter text/URL to test for XSS:" }],
  practice: () => [{ special: "prompt", type: "practice", msg: "Enter command to practice (e.g. cd, ls, dir):" }],
  snake: () => [{ special: "snake-start" }],
  hangman: () => [{ special: "hangman-start" }],
  typetest: () => [{ special: "typetest-start" }],
  matrix: () => [{ special: "matrix-start" }],
  clock: () => [{ special: "clock-start" }],
  chat: () => [{ special: "chat-start" }],

  async hashcheck(shell, args) {
    const sub = args[1]?.toLowerCase();
    const text = args.slice(sub === "verify" ? 3 : 2).join(" ");
    if (!text) return err("Usage: hashcheck [verify <hash>] <text>");
    const hash = await sha256(text);
    if (sub === "verify") {
      const expected = args[2];
      return hash === expected?.toLowerCase()
        ? ok(`Match! SHA-256: ${hash}`)
        : err(`No match.\nComputed: ${hash}\nExpected: ${expected}`);
    }
    return out([`SHA-256: ${hash}`, `Text length: ${text.length} chars`, "Use: hashcheck verify <hash> <text>"]);
  },

  emailscan(shell, args) {
    const email = args[1];
    if (!email) return [{ special: "prompt", type: "email", msg: "Enter email address:" }];
    return processEmailScan(email);
  },

  passcheck(shell, args) {
    const pw = args.slice(1).join(" ");
    if (!pw) return [{ special: "prompt", type: "pass", msg: "Enter password:" }];
    return processPassCheck(pw);
  },

  iplookup(shell, args) {
    const ip = args[1];
    if (!ip) return [{ special: "prompt", type: "ip", msg: "Enter IP:" }];
    return processIpLookup(ip);
  },

  portscan(shell, args) {
    const ip = args[1];
    if (!ip) return [{ special: "prompt", type: "port", msg: "Enter IP:" }];
    return processPortScan(ip);
  },

  sqltest(shell, args) {
    const url = args[1];
    if (!url) return [{ special: "prompt", type: "sql", msg: "Enter URL:" }];
    return processSqlTest(url);
  },

  xsstest(shell, args) {
    const input = args.slice(1).join(" ");
    if (!input) return [{ special: "prompt", type: "xss", msg: "Enter text:" }];
    return processXssTest(input);
  },

  filescan(shell, args) {
    const name = args[1];
    if (!name) return err("Usage: filescan <filename>");
    const path = resolvePath(shell.cwd, name, shell.mode);
    const { node } = resolveNode(path, shell.mode);
    if (!node) return err(`File not found: ${name}`);
    const lines = [`File: ${name}`, `Type: ${node.type}`, `Size: ${node.size || 0} bytes`];
    const ext = name.split(".").pop()?.toLowerCase();
    const risky = ["exe", "bat", "sh", "cmd", "ps1", "vbs", "scr", "dll", "msi"];
    if (risky.includes(ext)) lines.push(`[WARN] Executable extension (.${ext}) — run with caution`);
    if (name.startsWith(".")) lines.push("[INFO] Hidden file detected");
    if ((node.size || 0) > 10000) lines.push("[INFO] Large file");
    lines.push("[OK] Scan complete");
    return out(lines);
  },

  learn(shell, args) {
    const os = (args[1] || shell.mode).toLowerCase();
    const key = os.includes("win") ? "windows" : "linux";
    const lessons = LESSONS[key];
    const lines = [`═══ ${key.toUpperCase()} Tutorial ═══`, ""];
    lessons.forEach((l, i) => lines.push(`${i + 1}. ${l.cmd.padEnd(10)} — ${l.desc}\n   Example: ${l.ex}`));
    lines.push("", "Type 'practice <cmd>' to practice!");
    return out(lines);
  },

  flashcard() {
    const c = FLASHCARDS[Math.floor(Math.random() * FLASHCARDS.length)];
    return out([`Q: ${c.q}`, "", "Type your answer, then run 'flashcard' again for next card.", `Answer: ${c.a}`], "info");
  },

  daily() {
    const day = new Date().getDate() % DAILY_COMMANDS.length;
    const d = DAILY_COMMANDS[day];
    return out([
      "═══ Command of the Day ═══",
      `Command : ${d.cmd}`,
      `Example : ${d.ex}`,
      `Tip     : ${d.tip}`,
    ], "ok");
  },

  cheatsheet() {
    return out([
      "═══ EduShell Cheat Sheet ═══",
      "FILE: ls dir cd pwd cat type mkdir rm del cp copy mv tree",
      "SYS:  whoami date hostname uname ver ipconfig systeminfo ping",
      "SEC:  webscan msgcheck hashcheck emailscan passcheck iplookup portscan",
      "      sqltest xsstest filescan",
      "LEARN: learn flashcard daily cheatsheet practice quiz",
      "FUN:  snake hangman typetest fortune matrix clock timer",
      "UTIL: calc convert base64 json color qr todo note",
      "ADV:  login run alias export chat netmap",
      "MODE: mode linux | mode windows | help | clear | cls",
    ]);
  },

  fortune() {
    return ok(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
  },

  timer(shell, args) {
    const t = args[1];
    if (!t) return err("Usage: timer 5m | 30s | 1h");
    return [{ special: "timer-start", duration: t }];
  },

  calc(shell, args) {
    const expr = args.slice(1).join(" ");
    if (!expr) return err("Usage: calc 25*4+10");
    if (!/^[\d\s+\-*/().%]+$/.test(expr)) return err("Invalid characters in expression");
    try {
      const result = Function(`"use strict"; return (${expr})`)();
      return out([`${expr} = ${result}`]);
    } catch {
      return err("Invalid expression");
    }
  },

  convert(shell, args) {
    const val = parseFloat(args[1]);
    const from = args[2]?.toLowerCase();
    const to = args[5]?.toLowerCase() || args[4]?.toLowerCase();
    if (!val || !from) return err("Usage: convert 100 km to miles");
    const conv = {
      "km-miles": val * 0.621371, "miles-km": val * 1.60934,
      "c-f": val * 9 / 5 + 32, "f-c": (val - 32) * 5 / 9,
      "kg-lbs": val * 2.20462, "lbs-kg": val * 0.453592,
      "gb-mb": val * 1024, "mb-gb": val / 1024,
    };
    const key = `${from}-${to}`;
    if (conv[key] === undefined) return err(`Conversion ${from} to ${to} not supported`);
    return out([`${val} ${from} = ${conv[key].toFixed(4)} ${to}`]);
  },

  base64(shell, args) {
    const op = args[1]?.toLowerCase();
    const text = args.slice(2).join(" ");
    if (!op || !text) return err("Usage: base64 encode <text> | base64 decode <text>");
    try {
      if (op === "encode") return out([btoa(text)]);
      if (op === "decode") return out([atob(text)]);
    } catch { return err("Base64 error"); }
    return err("Use encode or decode");
  },

  json(shell, args) {
    const raw = args.slice(1).join(" ");
    if (!raw) return err('Usage: json {"key":"value"}');
    try {
      return out([JSON.stringify(JSON.parse(raw), null, 2)]);
    } catch { return err("Invalid JSON"); }
  },

  color(shell, args) {
    const hex = args[1];
    if (!hex || !/^#?[0-9a-fA-F]{6}$/.test(hex)) return err("Usage: color #ff5733");
    const h = hex.startsWith("#") ? hex : `#${hex}`;
    return out([`Color: ${h}`, "████████████████", `RGB: ${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)}`]);
  },

  qr(shell, args) {
    const text = args.slice(1).join(" ");
    if (!text) return err("Usage: qr <text or url>");
    const lines = ["┌─────────────────┐"];
    for (let i = 0; i < 5; i++) {
      let row = "│";
      for (let j = 0; j < 9; j++) row += ((text.charCodeAt(i) + j * 7) % 2 === 0) ? "██" : "  ";
      lines.push(row + "│");
    }
    lines.push("└─────────────────┘", `Data: ${text.slice(0, 40)}`, "(ASCII QR — educational)");
    return out(lines);
  },

  todo(shell, args) {
    const todos = JSON.parse(localStorage.getItem("edushell_todos") || "[]");
    const op = args[1]?.toLowerCase();
    if (op === "add") {
      const task = args.slice(2).join(" ").replace(/^["']|["']$/g, "");
      if (!task) return err('Usage: todo add "task"');
      todos.push({ task, done: false, id: Date.now() });
      localStorage.setItem("edushell_todos", JSON.stringify(todos));
      return ok(`Added: ${task}`);
    }
    if (op === "done") {
      const id = parseInt(args[2]);
      const t = todos.find((x) => x.id === id);
      if (t) { t.done = true; localStorage.setItem("edushell_todos", JSON.stringify(todos)); return ok(`Done: ${t.task}`); }
      return err("Task not found");
    }
    if (op === "clear") { localStorage.removeItem("edushell_todos"); return ok("Todos cleared"); }
    if (!todos.length) return out(["No todos. Use: todo add \"task\""]);
    return out(todos.map((t, i) => `${t.done ? "[x]" : "[ ]"} ${i + 1}. ${t.task} (id:${t.id})`));
  },

  note(shell, args) {
    const op = args[1]?.toLowerCase();
    if (op === "save") {
      const text = args.slice(2).join(" ");
      localStorage.setItem("edushell_note", text);
      return ok("Note saved.");
    }
    if (op === "clear") { localStorage.removeItem("edushell_note"); return ok("Note cleared"); }
    const note = localStorage.getItem("edushell_note");
    return note ? out([note]) : out(["No saved note. Use: note save <text>"]);
  },

  login(shell, args) {
    const user = args[1];
    const pass = args[2];
    if (!user || !pass) return err("Usage: login <user> <password>");
    const users = { student: "1234", admin: "admin", teacher: "class" };
    if (users[user] === pass) {
      shell.loggedIn = user;
      shell.user = user;
      return ok(`Welcome, ${user}! Login successful.`);
    }
    return err("Invalid username or password.");
  },

  run(shell, args) {
    const file = args[1];
    if (!file) return err("Usage: run script.sh");
    const path = resolvePath(shell.cwd, file, shell.mode);
    const r = readFile(path, shell.mode);
    if (r.error) return err(r.error);
    const lines = r.content.split("\n").filter((l) => l.trim() && !l.startsWith("#"));
    const output = [`Running ${file}...`, ""];
    lines.forEach((l) => {
      if (l.startsWith("echo ")) output.push(l.slice(5).replace(/^["']|["']$/g, ""));
      else output.push(`> ${l}`);
    });
    output.push("", "Script finished.");
    return out(output);
  },

  alias(shell, args) {
    if (!shell.aliases) shell.aliases = {};
    if (args[1] === "-l" || !args[1]) {
      const list = Object.entries(shell.aliases);
      return list.length ? out(list.map(([k, v]) => `  ${k}='${v}'`)) : out(["No aliases defined"]);
    }
    const m = args.slice(1).join(" ").match(/^(\w+)=([\w\s\-]+)$/);
    if (!m) return err("Usage: alias ll=ls -l | alias -l");
    shell.aliases[m[1]] = m[2];
    return ok(`Alias set: ${m[1]}='${m[2]}'`);
  },

  export(shell, args) {
    const m = args[1]?.match(/^(\w+)=(.+)$/);
    if (!m) return out(Object.entries(shell.env).map(([k, v]) => `  ${k}=${v}`));
    shell.env[m[1]] = m[2];
    return ok(`Exported ${m[1]}=${m[2]}`);
  },

  netmap() {
    return out([
      "        [Internet]",
      "            |",
      "       [Firewall]",
      "        /   |   \\",
      "   [Web] [DB] [App]",
      "    |     |     |",
      "  :443  :3306 :8080",
      "    |     |     |",
      "  [Server Network — 192.168.1.0/24]",
      "   .1 Gateway  .100 Web  .101 DB  .102 App",
    ]);
  },

  settings: () => [{ special: "open-settings" }],
  filemanager: () => [{ special: "open-filemanager" }],
  recyclebin: () => [{ special: "open-recyclebin" }],
  progress: () => [{ special: "open-progress" }],
  leaderboard: () => [{ special: "open-leaderboard" }],
  guide: () => [{ special: "open-help" }],
  securitydemo: () => [{ special: "open-securitydemo" }],

  ctf(shell, args) {
    const n = parseInt(args[1]);
    if (!n) return [{ special: "ctf-menu" }];
    if (!CTF_CHALLENGES[n - 1]) return err("Invalid challenge. Type 'ctf' for list.");
    return [{ special: "ctf-start", id: CTF_CHALLENGES[n - 1].id }];
  },

  usbscan: () => [{ special: "prompt", type: "usb", msg: "Enter USB device name (e.g. KINGSTON USB):" }],

  ransomware(shell, args) {
    const action = args[1]?.toLowerCase();
    if (action === "unlock") {
      shell.ransomwareLocked = false;
      return ok("System unlocked. Files restored (simulated).");
    }
    shell.ransomwareLocked = true;
    return out([
      "╔══════════════════════════════════════╗",
      "║   RANSOMWARE SIMULATION (EDUCATIONAL) ║",
      "╚══════════════════════════════════════╝",
      "Your files appear encrypted! (This is a safe demo)",
      "Unlock key: ransomware unlock",
      "Learn: Never pay real ransomware. Backup data!",
    ], "err");
  },

  firewall(shell, args) {
    if (!shell.firewallRules) shell.firewallRules = { allow: [80, 443], block: [23, 445] };
    const sub = args[1]?.toLowerCase();
    const port = parseInt(args[2]);
    if (sub === "allow" && port) {
      shell.firewallRules.allow.push(port);
      return ok(`Port ${port} allowed`);
    }
    if (sub === "block" && port) {
      shell.firewallRules.block.push(port);
      return ok(`Port ${port} blocked`);
    }
    return out([
      "═══ Firewall Rules ═══",
      `Allowed: ${[...new Set(shell.firewallRules.allow)].join(", ")}`,
      `Blocked: ${[...new Set(shell.firewallRules.block)].join(", ")}`,
      "Usage: firewall allow 8080 | firewall block 23",
    ]);
  },

  darkweb: () => [{ special: "prompt", type: "darkweb", msg: "Enter URL to check (.onion or suspicious link):" }],

  reportexport() {
    return [{ special: "report-export" }];
  },
};

export function processEmailScan(email) {
  const r = checkEmail(email);
  const lines = [`Email: ${email}`, r.valid ? `Domain: ${r.domain}` : "", ""];
  if (!r.valid) return out([...lines, ...r.threats.map((t) => `[ERR] ${t}`)], "err");
  if (!r.threats.length) lines.push("[OK] Email looks safe");
  else r.threats.forEach((t) => lines.push(`[WARN] ${t}`));
  return out(lines);
}

export function processPassCheck(pw) {
  const r = checkPassword(pw);
  const lines = [
    "═══ Password Analysis ═══",
    `Strength: ${r.label} (${r.score}/100)`,
    `Length: ${pw.length} characters`,
    "",
  ];
  if (r.issues.length) r.issues.forEach((i) => lines.push(`  - ${i}`));
  else lines.push("  All checks passed!");
  return out(lines, r.score >= 60 ? "ok" : "err");
}

export function processIpLookup(ip) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return err("Invalid IPv4 address");
  const r = fakeIpLookup(ip);
  return out([
    "═══ IP Lookup ═══",
    `IP       : ${r.ip}`,
    `Country  : ${r.country}`,
    `City     : ${r.city}`,
    `ISP      : ${r.isp}`,
    `Org      : ${r.org}`,
    `Coords   : ${r.lat}, ${r.lon}`,
    "(Simulated lookup for education)",
  ]);
}

export function processPortScan(ip) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip)) return err("Invalid IP");
  const hash = ip.split(".").reduce((a, b) => a + parseInt(b), 0);
  const ports = [22, 80, 443, 3306, 8080].filter((_, i) => (hash >> i) % 2 === 0);
  const lines = [`Scanning ${ip}...`, "", "PORT    STATE    SERVICE"];
  ports.forEach((p) => {
    const svc = { 22: "ssh", 80: "http", 443: "https", 3306: "mysql", 8080: "http-alt" }[p];
    lines.push(`${String(p).padEnd(8)}open     ${svc}`);
  });
  lines.push("", `Found ${ports.length} open ports (simulated)`);
  return out(lines);
}

export function processSqlTest(url) {
  const vulns = [];
  if (/('|"|;|--|union|select|drop|or\s+1=1)/i.test(url)) vulns.push("CRITICAL: SQL injection pattern in URL");
  if (/\?id=\d+'/.test(url)) vulns.push("CRITICAL: Unescaped quote in parameter");
  if (!vulns.length) vulns.push("OK: No obvious SQL injection patterns");
  return out(["═══ SQL Injection Test ═══", `URL: ${url}`, "", ...vulns.map((v) => `[${v.startsWith("OK") ? "OK" : "VULN"}] ${v}`)]);
}

export function processXssTest(input) {
  const vulns = [];
  if (/<script/i.test(input)) vulns.push("CRITICAL: Script tag detected");
  if (/javascript:/i.test(input)) vulns.push("HIGH: JavaScript URI");
  if (/on\w+\s*=/i.test(input)) vulns.push("HIGH: Inline event handler");
  if (/<iframe/i.test(input)) vulns.push("HIGH: Iframe injection");
  if (!vulns.length) vulns.push("OK: No XSS patterns detected");
  return out(["═══ XSS Detector ═══", ...vulns.map((v) => `[${v.startsWith("OK") ? "OK" : "WARN"}] ${v}`)]);
}

export function processUsbScan(name) {
  const threats = [];
  const lower = name.toLowerCase();
  if (/autorun|setup|install|keygen|crack/.test(lower)) threats.push("Suspicious autorun filename");
  if (/\.exe|\.bat|\.scr/.test(lower)) threats.push("Executable on removable media");
  if (lower.includes("unknown") || lower.includes("usb")) threats.push("Generic/unverified device name");
  const score = threats.length ? Math.max(20, 100 - threats.length * 25) : 95;
  return out([
    "═══ USB Scanner ═══",
    `Device: ${name}`,
    threats.length ? threats.map((t) => `[WARN] ${t}`) : ["[OK] No threats detected"],
    `Safety Score: ${score}/100`,
  ], score >= 70 ? "ok" : "err");
}

export function processDarkWeb(url) {
  const lines = ["═══ Dark Web Analyzer ═══", `URL: ${url}`];
  if (/\.onion/i.test(url)) {
    lines.push("[CRITICAL] .onion dark web address detected");
    lines.push("[WARN] Anonymous network — high risk");
    lines.push("Verdict: DANGEROUS — Do not access");
  } else if (/tor2web|darknet|hidden/.test(url)) {
    lines.push("[HIGH] Dark web gateway pattern");
  } else {
    lines.push("[OK] Not a known dark web URL pattern");
  }
  return out(lines);
}

export function getHangmanWord() {
  return HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
}

export async function runFeature(cmd, shell, args, rawLine) {
  const fn = featureCommands[cmd];
  if (!fn) return null;
  const result = await fn(shell, args, rawLine);
  return result;
}

export function featureCommandList() {
  return Object.keys(featureCommands);
}
