/** EduBot — human-like tutor · replies in English OR Tamil based on user language */

const SYSTEM_PROMPT = `You are EduBot, a friendly cyber security tutor on EduShell OS created by Mohan Raj.
Help college students with Linux, Windows, cyber security doubts and questions.
IMPORTANT: Reply in the SAME language the student uses.
- If student writes in English → reply fully in clear English.
- If student writes in Tamil or Tanglish → reply in Tamil+English mix naturally.
Keep answers helpful, 2-5 sentences. Suggest EduShell tools when relevant.
Educational simulation only — never give real hacking steps.`;

const OFFLINE_PATTERNS = [
  {
    re: /vanakkam|namaste|hello+|hlo+|helo+|hi+|hey+|yo+|sup|good (morning|evening|night)/i,
    en: [
      "Hello! 👋 I'm EduBot, your cyber security learning assistant. Ask me any doubt in English or Tamil!",
      "Hey! Welcome to EduShell OS. Try `learn`, `quiz`, or ask me anything about Linux & security!",
    ],
    ta: [
      "Vanakkam! 👋 Naan EduBot — unga cyber security learning assistant. English or Tamil-la doubt kekunga!",
      "Hello! EduShell OS-ku welcome. `learn`, `quiz` try pannunga — enna doubt-um kelunga!",
    ],
  },
  {
    re: /who are you|what are you|your name|nee yaaru|edubot/i,
    en: [
      "I'm EduBot — your AI tutor on EduShell OS, created for students by Mohan Raj (Cyber Security Analyst / AI·ML). Ask me commands, security, or any study doubt!",
    ],
    ta: [
      "Naan EduBot! 🤖 EduShell OS cyber security tutor. Mohan Raj create pannaru — Cyber Security Analyst / AI·ML. Doubt ellam kelunga!",
    ],
  },
  {
    re: /mohan|creator|made this|who made|who created/i,
    en: [
      "EduShell OS was created by Mohan Raj — Cyber Security Analyst / AI·ML. A professional learning platform for college students! 🛡",
    ],
    ta: [
      "EduShell OS-a Mohan Raj create pannaru — Cyber Security Analyst / AI·ML. College students-ku professional learning platform! 🛡",
    ],
  },
  {
    re: /what is linux|what's linux|explain linux|linux enna|linux meaning/i,
    en: [
      "Linux is an open-source operating system used on servers, cloud, and Android. In EduShell, type `learn linux` for tutorials. Key commands: ls, cd, cat, mkdir, pwd.",
    ],
    ta: [
      "Linux oru open-source operating system — servers, cloud-la romba use aagum. EduShell-la `learn linux` type pannunga. Commands: ls, cd, cat, mkdir.",
    ],
  },
  {
    re: /what is terminal|what is command|what is bash|what is cmd/i,
    en: [
      "A terminal is a text interface to control the computer using commands. Linux uses bash; Windows uses CMD. In EduShell, click the terminal window and type commands like `ls` or `dir`.",
    ],
    ta: [
      "Terminal na text-la computer control panna use pannra interface. Linux-la bash, Windows-la CMD. EduShell terminal-la `ls` or `dir` type pannunga.",
    ],
  },
  {
    re: /what is cyber|what is security|what is hacking|cyber security/i,
    en: [
      "Cyber security protects computers, networks, and data from attacks. In EduShell you can safely learn with Web Hunter, Msg Guard, CTF Lab, and Security Demos — all simulated, no real hacking.",
    ],
    ta: [
      "Cyber security na computers, networks, data-a attacks-la irundhu protect pannradhu. EduShell-la Web Hunter, CTF, Security Demos safe-a learn pannalam!",
    ],
  },
  {
    re: /what is phishing|phishing enna|explain phishing/i,
    en: [
      "Phishing is a fake email or message tricking you to click malicious links or share passwords. Never click suspicious links! Try Security Demos → Phishing tab, or use `msgcheck` to scan messages.",
    ],
    ta: [
      "Phishing na fake email/message — password kekum, malicious link click panna vaikum. Suspicious link click pannadheenga! Security Demos → Phishing paakunga.",
    ],
  },
  {
    re: /what is firewall|firewall enna/i,
    en: [
      "A firewall controls network traffic — it allows or blocks ports. In EduShell type `firewall` to see rules, or `firewall block 23` to block a port (simulated).",
    ],
    ta: [
      "Firewall na network traffic control pannum — ports allow/block. EduShell-la `firewall` type pannunga, `firewall block 445` try pannunga.",
    ],
  },
  {
    re: /what is ctf|ctf enna|capture the flag/i,
    en: [
      "CTF (Capture The Flag) is a security challenge game — you find hidden flags by solving puzzles. Type `ctf` in EduShell for 6 educational challenges!",
    ],
    ta: [
      "CTF (Capture The Flag) security challenge game — flags find pannanum. EduShell-la `ctf` type pannunga — 6 challenges iruku!",
    ],
  },
  {
    re: /difference between linux|linux vs windows|linux and windows/i,
    en: [
      "Linux uses bash (ls, cat, pwd); Windows uses CMD (dir, type, cd). EduShell supports both! Switch with `mode linux` or `mode windows` buttons on the terminal.",
    ],
    ta: [
      "Linux-la bash (ls, cat), Windows-la CMD (dir, type). EduShell-la rendum iruku! `mode linux` or `mode windows` use pannunga.",
    ],
  },
  {
    re: /how (to|do).*linux|linux command|learn linux/i,
    en: [
      "Start with: `ls` (list files), `cd folder` (go inside), `cat file.txt` (read file), `mkdir name` (new folder). Type `learn linux` for full tutorial or `cheatsheet` for all commands!",
    ],
    ta: [
      "Start: `ls` (files list), `cd` (folder open), `cat` (file read), `mkdir` (new folder). `learn linux` full tutorial kudukum!",
    ],
  },
  {
    re: /how (to|do).*windows|windows command/i,
    en: [
      "Windows CMD basics: `dir` (list), `cd Documents` (navigate), `type file.txt` (read), `md folder` (create). Click Windows button or type `mode windows`.",
    ],
    ta: [
      "Windows: `dir` (list), `cd` (navigate), `type` (read file), `md` (folder create). Windows button click pannunga.",
    ],
  },
  {
    re: /how (to|do).*webscan|scan website|website scan/i,
    en: [
      "Click Web Hunter icon on desktop, or type `webscan` in terminal. Enter a URL like https://example.com — EduShell simulates a security scan and gives a score!",
    ],
    ta: [
      "Web Hunter icon click pannunga, illana `webscan` type pannunga. URL enter pannunga — security scan score kudukum!",
    ],
  },
  {
    re: /how (to|do)|help me|epdi|yepdi|eppadi|use pannanum|use panrathu/i,
    en: [
      "Click desktop icons or type commands in the terminal. Press `?` for keyboard help. Try `learn`, `cheatsheet`, or ask me a specific question!",
    ],
    ta: [
      "Desktop icon click pannunga illana terminal-la command type pannunga. `?` help-ku. Specific-a kelunga — naan help pannuren!",
    ],
  },
  {
    re: /linux|bash/i,
    en: ["Linux basics: `ls`, `cd`, `pwd`, `cat`, `mkdir`, `rm`, `grep`. Type `learn linux` or `practice ls` to practice!"],
    ta: ["Linux: `ls`, `cd`, `pwd`, `cat`, `mkdir`. `learn linux` type pannunga tutorial-ku!"],
  },
  {
    re: /windows|cmd|dir/i,
    en: ["Windows CMD: `dir`, `cd`, `type`, `md`, `copy`. Switch with `mode windows`."],
    ta: ["Windows: `dir`, `cd`, `type`, `md`. `mode windows` use pannunga."],
  },
  {
    re: /security|hack|malware|virus|ransomware/i,
    en: [
      "Try: `webscan` (websites), `msgcheck` (messages), `passcheck` (passwords), `usbscan` (USB risk). Security Demos icon has phishing & dark web lessons!",
    ],
    ta: [
      "`webscan`, `msgcheck`, `passcheck` try pannunga. Security Demos icon-la phishing lessons iruku!",
    ],
  },
  {
    re: /password|passcheck|strong password/i,
    en: [
      "A strong password has 12+ characters, mix of upper/lower/numbers/symbols. Never reuse passwords! Type `passcheck yourpassword` to analyze strength (simulated).",
    ],
    ta: [
      "Strong password: 12+ chars, upper/lower/numbers mix. Reuse pannadheenga! `passcheck` use pannunga strength check pannanum.",
    ],
  },
  {
    re: /quiz|test|exam/i,
    en: ["Type `quiz` or click Quiz Game icon — 10 questions on Linux & Windows. Score saves to Leaderboard!"],
    ta: ["`quiz` type pannunga — 10 questions. Score Leaderboard-la save aagum!"],
  },
  {
    re: /ctf|flag/i,
    en: ["Type `ctf` for 6 challenges. First tip: `cat secret.txt` finds a hidden flag. Submit with the flag text!"],
    ta: ["`ctf` type pannunga — 6 challenges. First: `cat secret.txt` flag kandupidikalam!"],
  },
  {
    re: /game|snake|hangman/i,
    en: ["Fun games open in a separate window! Click Snake or Hangman on desktop. Use arrow keys for Snake."],
    ta: ["Games separate window-la open aagum! Snake, Hangman desktop-la click pannunga."],
  },
  {
    re: /mobile|phone/i,
    en: ["EduShell works on mobile! Tap icons, terminal opens at bottom. Rotate to landscape for more space."],
    ta: ["Mobile-la work aagum! Icons tap pannunga. Landscape mode better."],
  },
  {
    re: /safe|legal|real hack/i,
    en: [
      "EduShell is 100% safe and educational — everything is simulated in your browser. No real hacking, no damage to any system. Perfect for learning!",
    ],
    ta: [
      "EduShell 100% safe — ellam browser-la simulated. Real hacking illa, learning-ku perfect!",
    ],
  },
  {
    re: /thank|nandri|thanks/i,
    en: ["You're welcome! 😊 Keep practicing — check My Progress to track your level."],
    ta: ["Welcome! 😊 My Progress icon-la stats paakalam!"],
  },
  {
    re: /bye|goodbye|see you|poiren/i,
    en: ["Goodbye! Happy learning! Type `chat` anytime to talk again. 🎓"],
    ta: ["Paarkalam! `chat` type pannunga again pesanum na! 🎓"],
  },
];

const FALLBACK_EN = [
  "Good question! I can help with Linux, Windows, cyber security, CTF, and EduShell tools. Can you be more specific?",
  "I'm here to help! Try asking: 'What is Linux?', 'How to use webscan?', or 'Explain phishing'.",
  "Ask me anything about commands, security, or EduShell features. Or type `cheatsheet` for all commands!",
  "Not sure about that — but try `learn`, `guide` (press ?), or ask about a specific topic!",
];

const FALLBACK_TA = [
  "Nalla question! Linux, Windows, security, CTF pathi kelunga. Specific-a solunga!",
  "Naan help pannuren! 'Linux enna?', 'webscan epdi use pannanum?' maathiri kelunga.",
  "Commands, security, EduShell features pathi kelunga. `cheatsheet` ellam commands-ku!",
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

/** Detect if user writes in Tamil/Tanglish vs English */
export function detectLanguage(text) {
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  if (/\b(enna|epdi|eppadi|yean|edhuku|vanakkam|nandri|iruka|pannanum|venum|sollu|sollunga|pathi|seekirame|nalla|romba|illa|aama|illai)\b/i.test(text)) return "ta";
  return "en";
}

function pickReply(pattern, lang) {
  if (lang === "ta" && pattern.ta?.length) return pick(pattern.ta);
  if (pattern.en?.length) return pick(pattern.en);
  return pick(pattern.ta || pattern.en || []);
}

function offlineReply(message) {
  const msg = message.trim();
  const lang = detectLanguage(msg);
  const lower = msg.toLowerCase();

  for (const p of OFFLINE_PATTERNS) {
    if (p.re.test(lower)) return pickReply(p, lang);
  }

  if (/^(ls|cd|dir|cat|help|webscan|quiz|ctf|snake)/i.test(lower)) {
    const cmd = lower.split(/\s+/)[0];
    return lang === "ta"
      ? `\`${cmd}\` type pannunga run aagum. "${cmd} epdi use pannanum?" nu kelunga!`
      : `Type \`${cmd}\` to run it. Ask me "how to use ${cmd}?" for help!`;
  }

  if (isQuestion(msg)) {
    return lang === "ta"
      ? pick([
          "Nalla doubt! Specific-a topic solunga — Linux, security, CTF, tools. `learn` tutorial-ku!",
          "Adha pathi detailed-a explain pannuren — topic clear-a kelunga. Example: 'phishing enna?'",
        ])
      : pick([
          "Great question! Please specify the topic — Linux, security, CTF, or tools. Try `learn` for tutorials!",
          "I'd love to help! Ask clearly like: 'What is phishing?' or 'How to use webscan?'",
        ]);
  }

  return pick(lang === "ta" ? FALLBACK_TA : FALLBACK_EN);
}

function isQuestion(text) {
  const t = text.trim();
  return (
    /\?\s*$/.test(t) ||
    /^(what|why|how|when|where|who|can|could|should|is|are|do|does|will|would|explain|tell me|describe|help|doubt|please|anyone|someone)/i.test(t) ||
    /^(enna|epdi|eppadi|yean|edhuku|yaar|enga|eppo)/i.test(t)
  );
}

const GREETING_ONLY = /^(hi+|hlo+|helo+|hello+|hey+|yo+|sup+|vanakkam|namaste|good\s*(morning|evening|night)|how\s*are\s*you|what'?s\s*up|whatsup|enna|epdi\s*iruka|thanks|thank\s*you|nandri|bye|goodbye|ok|okay|nice|cool)[\s!?.,]*$/i;

const KNOWN_CMDS = new Set([
  "help", "clear", "cls", "ls", "cd", "dir", "cat", "type", "run", "chat", "quiz", "ctf",
  "webscan", "msgcheck", "mode", "learn", "snake", "exit", "pwd", "mkdir", "rm", "cp", "mv",
  "grep", "history", "whoami", "date", "hashcheck", "passcheck", "guide", "cheatsheet",
  "emailscan", "iplookup", "portscan", "filescan", "usbscan", "firewall", "darkweb",
]);

/** Route human messages & questions to EduBot (not shell) */
export function isCasualMessage(line) {
  const t = line.trim();
  if (!t) return false;
  const first = t.split(/\s+/)[0].toLowerCase();
  if (KNOWN_CMDS.has(first) && !isQuestion(t) && !GREETING_ONLY.test(t)) return false;
  if (GREETING_ONLY.test(t)) return true;
  if (isQuestion(t)) return true;
  if (/[\u0B80-\u0BFF]/.test(t)) return true;
  if (t.length <= 200) {
    for (const p of OFFLINE_PATTERNS) {
      if (p.re.test(t.toLowerCase())) return true;
    }
  }
  return false;
}

function systemPromptFor(userMsg, username) {
  const lang = detectLanguage(userMsg);
  const langRule = lang === "en"
    ? "Reply ONLY in English."
    : "Reply in Tamil+English mix (Tanglish).";
  return `${SYSTEM_PROMPT}\n${langRule}\nStudent name: ${username}.`;
}

async function groqReply(message, apiKey, username) {
  const messages = [
    { role: "system", content: systemPromptFor(message, username) },
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
      max_tokens: 320,
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
    { role: "system", content: systemPromptFor(message, username) },
    ...conversationHistory.slice(-8),
    { role: "user", content: message },
  ];

  const res = await fetch(`${url}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "llama3.2", messages, stream: false }),
  });

  if (!res.ok) throw new Error(`Ollama not running at ${url}`);
  const data = await res.json();
  return data.message?.content?.trim() || offlineReply(message);
}

/** Main entry — returns { text, mode } */
export async function getAiReply(message, settings) {
  const userMsg = message.trim();
  const lang = detectLanguage(userMsg);
  if (!userMsg) {
    return {
      text: lang === "ta" ? "Enna kelunga — naan ready! 😊" : "Ask me anything — I'm ready to help! 😊",
      mode: "offline",
    };
  }

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
      await new Promise((r) => setTimeout(r, 350 + Math.random() * 500));
      text = offlineReply(userMsg);
      usedMode = "offline";
    }

    conversationHistory.push({ role: "assistant", content: text });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    return { text, mode: usedMode };
  } catch (err) {
    const fallback = offlineReply(userMsg) +
      (mode !== "offline" ? `\n[Offline fallback — ${err.message}]` : "");
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
    `Hello ${username}! 👋 Ask doubts in English OR Tamil.`,
    "",
    "English examples:",
    "  • What is Linux?",
    "  • How to use webscan?",
    "  • Explain phishing",
    "  • What is cyber security?",
    "",
    "Tamil examples:",
    "  • Linux enna?",
    "  • webscan epdi use pannanum?",
    "  • phishing enna?",
    "",
    "Type 'exit' to leave · Ctrl+C to cancel",
  ];
}

export const AI_MODES = [
  { id: "offline", label: "Offline (default — no API key needed)" },
  { id: "groq", label: "Groq API (free tier — key in Settings)" },
  { id: "ollama", label: "Ollama local (localhost:11434)" },
];
