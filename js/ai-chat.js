/** EduBot — human-like offline AI tutor + optional Groq/Ollama API */

const SYSTEM_PROMPT = `You are EduBot, a friendly cyber security tutor on EduShell OS created by Mohan Raj.
Help college students learn Linux, Windows commands, and cyber security.
Reply in simple English. If student writes Tamil/Tanglish, reply mixing Tamil+English naturally.
Keep answers short (2-4 sentences). Suggest EduShell tools when relevant (webscan, ctf, quiz, etc).
Never give real hacking instructions. Educational simulation only.`;

const GREETINGS = ["hi", "hello", "hey", "vanakkam", "namaste", "good morning", "good evening", "start"];

const OFFLINE_PATTERNS = [
  { re: /vanakkam|namaste|hello|hi|hey|good (morning|evening|night)/i, replies: [
    "Vanakkam! 👋 Naan EduBot — unga cyber security learning assistant. Enna help venum?",
    "Hello! Welcome to EduShell OS. Linux, security tools, CTF — ellam kekunga!",
    "Hey! Ready to learn? Try `learn` or `cheatsheet` to start.",
  ]},
  { re: /who are you|what are you|your name|nee yaaru|edubot/i, replies: [
    "Naan EduBot! 🤖 EduShell OS-la cyber security tutor. Created by Mohan Raj — Cyber Security Analyst / AI·ML.",
    "I'm EduBot — your terminal learning buddy on EduShell OS. Ask me commands, security tips, anything!",
  ]},
  { re: /mohan|creator|made this|who made/i, replies: [
    "EduShell OS was created by **Mohan Raj** — Cyber Security Analyst / AI·ML. Professional educational platform for students! 🛡",
  ]},
  { re: /how (to|do)|epdi|yepdi|use|help me/i, replies: [
    "Sure! Click desktop icons or type commands in terminal. Press `?` for help guide. Try `learn` for tutorials!",
    "Desktop-la icon click pannunga, illana terminal-la command type pannunga. Example: `ls`, `webscan`, `quiz`",
  ]},
  { re: /linux|bash|command/i, replies: [
    "Linux basics: `ls` list files, `cd` change folder, `cat` read file, `mkdir` new folder. Type `learn linux` for full tutorial!",
    "Top Linux cmds: ls, cd, pwd, cat, mkdir, rm, grep. Try `practice ls` to practice!",
  ]},
  { re: /windows|cmd|dir/i, replies: [
    "Windows CMD: `dir` list, `cd` navigate, `type` read file, `md` mkdir. Switch mode: click Windows button or `mode windows`.",
  ]},
  { re: /security|hack|cyber|phishing|malware|virus/i, replies: [
    "Security tools ready! 🛡 Try `webscan` for websites, `msgcheck` for spam, `passcheck` for passwords. Security Demos icon-la phishing learn pannunga!",
    "Cyber security path: Security Demos → Web Hunter → CTF Lab → Quiz. Safe simulated environment — real hacking illa!",
  ]},
  { re: /ctf|flag|capture/i, replies: [
    "CTF Lab-la 6 challenges iruku! Type `ctf` to see list. First challenge: `cat secret.txt` to find hidden flag. Good luck! 🚩",
  ]},
  { re: /quiz|test|exam/i, replies: [
    "Quiz Game icon click pannunga or type `quiz`. 10 questions about Linux & Windows. Score leaderboard-la save aagum!",
  ]},
  { re: /game|snake|hangman|fun/i, replies: [
    "Fun games open in separate game window! 🎮 Try Snake, Hangman, Typing Test from desktop. Arrow keys use pannunga Snake-la.",
  ]},
  { re: /mobile|phone|android|iphone/i, replies: [
    "Mobile-la work aagum! 📱 Icons tap pannunga, terminal bottom-la open aagum. Landscape mode-la better experience.",
  ]},
  { re: /thank|nandri|thanks|super|good|nice|great/i, replies: [
    "Welcome! 😊 Keep learning — cyber security-la consistent practice important!",
    "Nandri! Progress tracker-la unga stats paakalam. My Progress icon try pannunga!",
  ]},
  { re: /bye|exit|see you|poiren|poren/i, replies: [
    "Bye! Type `exit` to leave chat. Happy learning! 🎓",
  ]},
];

const FALLBACK_REPLIES = [
  "Interesting question! Try `cheatsheet` for all commands, or `guide` for help. Specific-a kekunga — naan help pannuren!",
  "Hmm, let me suggest: type `learn` for tutorials, or ask about Linux, security, CTF, quiz!",
  "Good thinking! 🧠 EduShell-la 40+ tools iruku. Enna area learn panna want — commands, security, games?",
  "Naan offline mode-la irukken — clear-a kekunga! Example: 'how to use webscan?' or 'linux commands'",
];

let conversationHistory = [];

export function resetChatHistory() {
  conversationHistory = [];
}

export function getChatHistory() {
  return conversationHistory;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function offlineReply(message) {
  const msg = message.toLowerCase().trim();

  for (const p of OFFLINE_PATTERNS) {
    if (p.re.test(msg)) return pick(p.replies);
  }

  // Command-like input
  if (/^(ls|cd|dir|cat|help|webscan|quiz|ctf|snake)/i.test(msg)) {
    return `Type \`${msg.split(/\s+/)[0]}\` directly in terminal (exit chat first with 'exit'). I can explain — ask "how to use ${msg.split(/\s+/)[0]}"!`;
  }

  // Question mark
  if (msg.includes("?")) {
    return pick([
      "Good question! Check Help Guide (press `?`) or Security Demos for detailed lessons.",
      "Adha pathi `learn` command try pannunga — step by step tutorial kudukum!",
    ]);
  }

  return pick(FALLBACK_REPLIES);
}

async function groqReply(message, apiKey, username) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT + ` Student name: ${username}.` },
    ...conversationHistory.slice(-8),
    { role: "user", content: message },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      max_tokens: 280,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Groq error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || offlineReply(message);
}

async function ollamaReply(message, baseUrl, username) {
  const url = (baseUrl || "http://localhost:11434").replace(/\/$/, "");
  const messages = [
    { role: "system", content: SYSTEM_PROMPT + ` Student: ${username}.` },
    ...conversationHistory.slice(-8),
    { role: "user", content: message },
  ];

  const res = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3.2",
      messages,
      stream: false,
    }),
  });

  if (!res.ok) throw new Error(`Ollama not running at ${url}`);
  const data = await res.json();
  return data.message?.content?.trim() || offlineReply(message);
}

/** Main entry — returns { text, mode, error? } */
export async function getAiReply(message, settings) {
  const userMsg = message.trim();
  if (!userMsg) return { text: "Type something — naan listen pannuren! 😊", mode: "offline" };

  conversationHistory.push({ role: "user", content: userMsg });

  const mode = settings.aiMode || "offline";
  const username = settings.username || "student";

  try {
    let text;
    let usedMode = "offline";

    if (mode === "groq" && settings.groqApiKey?.trim()) {
      text = await groqReply(userMsg, settings.groqApiKey.trim(), username);
      usedMode = "groq";
    } else if (mode === "ollama") {
      text = await ollamaReply(userMsg, settings.ollamaUrl, username);
      usedMode = "ollama";
    } else {
      // Small delay feels more human
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));
      text = offlineReply(userMsg);
      usedMode = "offline";
    }

    conversationHistory.push({ role: "assistant", content: text });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    return { text, mode: usedMode };
  } catch (err) {
    const fallback = offlineReply(userMsg) +
      (mode !== "offline" ? `\n[API fallback — ${err.message}. Settings-la AI mode check pannunga]` : "");
    conversationHistory.push({ role: "assistant", content: fallback });
    return { text: fallback, mode: "offline", error: err.message };
  }
}

export function getChatWelcome(username) {
  return [
    "╔══════════════════════════════════════╗",
    "║   EduBot — AI Learning Assistant     ║",
    "╚══════════════════════════════════════╝",
    "",
    `Vanakkam ${username}! 👋 Naan EduBot — human-like tutor.`,
    "Offline mode default — API key Settings-la add pannalam (optional).",
    "",
    "Try asking:",
    "  • how to use linux commands?",
    "  • webscan epdi use pannanum?",
    "  • CTF lab help",
    "  • cyber security tips",
    "",
    "Type 'exit' to leave chat · Ctrl+C to cancel",
  ];
}

export const AI_MODES = [
  { id: "offline", label: "Offline (default — no API key needed)" },
  { id: "groq", label: "Groq API (free tier — key in Settings)" },
  { id: "ollama", label: "Ollama local (localhost:11434)" },
];
