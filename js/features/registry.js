/** Unified feature command registry for EduShell */

export const TOOL_CATEGORIES = [
  {
    id: "security",
    title: "Security Tools",
    icon: "🛡",
    tools: [
      { cmd: "webscan", title: "Web Hunter", desc: "Website vulnerability scan", mode: "linux", interactive: "web" },
      { cmd: "msgcheck", title: "Msg Guard", desc: "Spam & malicious msg check", mode: "windows", interactive: "msg" },
      { cmd: "hashcheck", title: "Hash Checker", desc: "SHA-256 hash generate/verify", mode: "any" },
      { cmd: "emailscan", title: "Email Scanner", desc: "Phishing email detector", mode: "any", interactive: "email" },
      { cmd: "passcheck", title: "Pass Shield", desc: "Password strength analyzer", mode: "any", interactive: "pass" },
      { cmd: "iplookup", title: "IP Lookup", desc: "IP location & ISP info", mode: "linux", interactive: "ip" },
      { cmd: "portscan", title: "Port Scanner", desc: "Scan open ports on IP", mode: "linux", interactive: "port" },
      { cmd: "sqltest", title: "SQL Tester", desc: "SQL injection URL test", mode: "linux", interactive: "sql" },
      { cmd: "xsstest", title: "XSS Detector", desc: "XSS attack pattern check", mode: "any", interactive: "xss" },
      { cmd: "filescan", title: "File Scanner", desc: "Suspicious file analysis", mode: "any" },
      { cmd: "usbscan", title: "USB Scanner", desc: "USB malware risk check", mode: "windows", interactive: "usb" },
      { cmd: "ransomware", title: "Ransomware Sim", desc: "Safe ransomware demo", mode: "any" },
      { cmd: "firewall", title: "Firewall", desc: "Allow/block ports", mode: "any" },
      { cmd: "darkweb", title: "Dark Web Check", desc: ".onion URL analyzer", mode: "linux", interactive: "darkweb" },
      { cmd: "reportexport", title: "Report Export", desc: "Download scan report", mode: "any" },
    ],
  },
  {
    id: "system",
    title: "System Apps",
    icon: "💻",
    tools: [
      { cmd: "settings", title: "Settings", desc: "Theme, wallpaper, user", mode: "any", app: "settings" },
      { cmd: "filemanager", title: "File Manager", desc: "GUI file browser", mode: "any", app: "filemanager" },
      { cmd: "recyclebin", title: "Recycle Bin", desc: "Restore deleted files", mode: "any", app: "recyclebin" },
    ],
  },
  {
    id: "learning",
    title: "Student Learning",
    icon: "📚",
    tools: [
      { cmd: "learn", title: "Learn OS", desc: "Linux/Windows tutorials", mode: "any" },
      { cmd: "flashcard", title: "Flashcards", desc: "Random command quiz", mode: "any" },
      { cmd: "daily", title: "Command of Day", desc: "Daily command + example", mode: "any" },
      { cmd: "cheatsheet", title: "Cheat Sheet", desc: "All commands reference", mode: "any" },
      { cmd: "practice", title: "Practice Mode", desc: "Guided command practice", mode: "any", interactive: "practice" },
      { cmd: "quiz", title: "Quiz Game", desc: "Terminal command quiz", mode: "any", interactive: "quiz" },
      { cmd: "ctf", title: "CTF Lab", desc: "Capture the flag challenges", mode: "any" },
      { cmd: "progress", title: "My Progress", desc: "Track your learning stats", mode: "any", app: "progress" },
      { cmd: "leaderboard", title: "Leaderboard", desc: "Top quiz & CTF scores", mode: "any", app: "leaderboard" },
      { cmd: "guide", title: "Help Guide", desc: "Shortcuts & how-to guide", mode: "any", app: "help" },
      { cmd: "securitydemo", title: "Security Demos", desc: "Phishing & dark web awareness", mode: "any", app: "securitydemo" },
    ],
  },
  {
    id: "fun",
    title: "Fun & Interactive",
    icon: "🎮",
    tools: [
      { cmd: "snake", title: "Snake", desc: "Classic snake game", mode: "any", interactive: "snake" },
      { cmd: "hangman", title: "Hangman", desc: "Word guessing game", mode: "any", interactive: "hangman" },
      { cmd: "typetest", title: "Typing Test", desc: "Typing speed test", mode: "any", interactive: "typetest" },
      { cmd: "fortune", title: "Fortune", desc: "Random quotes", mode: "any" },
      { cmd: "matrix", title: "Matrix Rain", desc: "Matrix animation", mode: "any", interactive: "matrix" },
      { cmd: "clock", title: "Live Clock", desc: "Real-time clock", mode: "any", interactive: "clock" },
      { cmd: "timer", title: "Timer", desc: "Countdown timer", mode: "any" },
    ],
  },
  {
    id: "utility",
    title: "Utility Tools",
    icon: "🔧",
    tools: [
      { cmd: "calc", title: "Calculator", desc: "Math calculations", mode: "any" },
      { cmd: "convert", title: "Converter", desc: "Unit conversion", mode: "any" },
      { cmd: "base64", title: "Base64", desc: "Encode/decode text", mode: "any" },
      { cmd: "json", title: "JSON Formatter", desc: "Pretty print JSON", mode: "any" },
      { cmd: "color", title: "Color Picker", desc: "Preview hex colors", mode: "any" },
      { cmd: "qr", title: "QR Code", desc: "ASCII QR generator", mode: "any" },
      { cmd: "todo", title: "Todo List", desc: "Task manager", mode: "any" },
      { cmd: "note", title: "Notes", desc: "Save notes locally", mode: "any" },
    ],
  },
  {
    id: "advanced",
    title: "Advanced",
    icon: "⚡",
    tools: [
      { cmd: "login", title: "Login", desc: "User authentication", mode: "any" },
      { cmd: "run", title: "Script Runner", desc: "Run .sh/.bat scripts", mode: "any" },
      { cmd: "alias", title: "Alias", desc: "Command shortcuts", mode: "any" },
      { cmd: "export", title: "Export Var", desc: "Environment variables", mode: "linux" },
      { cmd: "chat", title: "EduBot Chat", desc: "AI tutor — offline or API", mode: "any", interactive: "chat" },
      { cmd: "netmap", title: "Network Map", desc: "ASCII network diagram", mode: "linux" },
    ],
  },
];

export function getAllToolCommands() {
  return TOOL_CATEGORIES.flatMap((c) => c.tools.map((t) => t.cmd));
}

export function getToolByCmd(cmd) {
  for (const cat of TOOL_CATEGORIES) {
    const tool = cat.tools.find((t) => t.cmd === cmd);
    if (tool) return { ...tool, category: cat.id };
  }
  return null;
}

export function getInteractiveType(cmd) {
  const tool = getToolByCmd(cmd);
  return tool?.interactive || null;
}
