/** Windows Project — Spam / malicious message scanner */

const SPAM_WORDS = [
  "urgent", "act now", "click here", "free money", "winner", "lottery",
  "congratulations", "verify your account", "suspend", "password expired",
  "bank account", "wire transfer", "bitcoin", "crypto reward", "claim now",
  "limited offer", "nigerian prince", "inheritance", "tax refund",
];

const MALICIOUS_PATTERNS = [
  { re: /<script[\s>]/i, label: "Embedded script tag detected", severity: "critical" },
  { re: /javascript\s*:/i, label: "JavaScript URI scheme found", severity: "critical" },
  { re: /on(click|load|error|mouseover)\s*=/i, label: "Inline event handler detected", severity: "high" },
  { re: /eval\s*\(/i, label: "eval() function call detected", severity: "critical" },
  { re: /document\.cookie/i, label: "Cookie theft pattern detected", severity: "high" },
  { re: /base64/i, label: "Base64 encoded content (possible obfuscation)", severity: "medium" },
  { re: /\b(select|union|drop\s+table|insert\s+into)\b/i, label: "SQL injection pattern detected", severity: "high" },
  { re: /<iframe/i, label: "Hidden iframe detected", severity: "high" },
  { re: /powershell\s+-/i, label: "PowerShell execution command detected", severity: "critical" },
  { re: /cmd\.exe|wget\s+|curl\s+.*\|\s*sh/i, label: "Remote shell download pattern", severity: "critical" },
];

const URL_RE = /https?:\/\/[^\s<>"']+/gi;

function countMatches(text, list) {
  const lower = text.toLowerCase();
  return list.filter((w) => lower.includes(w));
}

export function scanMessage(text) {
  const lines = [];
  const threats = [];
  let score = 100;

  if (!text || !text.trim()) {
    return { lines: ["Error: Empty message. Paste a message to scan."], health: 0, status: "error" };
  }

  lines.push("╔══════════════════════════════════════════╗");
  lines.push("║     MSG GUARD — Message Security Scan    ║");
  lines.push("╚══════════════════════════════════════════╝");
  lines.push("");
  lines.push(`Scan time  : ${new Date().toLocaleString()}`);
  lines.push(`Msg length : ${text.length} characters`);
  lines.push("");

  // Spam check
  const spamHits = countMatches(text, SPAM_WORDS);
  if (spamHits.length) {
    threats.push({ type: "SPAM", msg: `Spam keywords found: ${spamHits.slice(0, 5).join(", ")}${spamHits.length > 5 ? "..." : ""}` });
    score -= spamHits.length * 8;
  }

  // URL check
  const urls = text.match(URL_RE) || [];
  if (urls.length) {
    lines.push(`[INFO] URLs detected: ${urls.length}`);
    urls.slice(0, 3).forEach((u) => {
      const suspicious = /\.(tk|ml|ga|cf|xyz|top|buzz|ru)\//i.test(u) || /bit\.ly|tinyurl|t\.co/i.test(u);
      if (suspicious) {
        threats.push({ type: "URL", msg: `Suspicious URL: ${u.slice(0, 60)}` });
        score -= 15;
      } else {
        lines.push(`  → ${u.slice(0, 70)}`);
      }
    });
  }

  // Malicious patterns
  for (const p of MALICIOUS_PATTERNS) {
    if (p.re.test(text)) {
      threats.push({ type: p.severity.toUpperCase(), msg: p.label });
      score -= p.severity === "critical" ? 25 : p.severity === "high" ? 15 : 8;
    }
  }

  // ALL CAPS ratio
  const letters = text.replace(/[^a-zA-Z]/g, "");
  const caps = text.replace(/[^A-Z]/g, "").length;
  if (letters.length > 20 && caps / letters.length > 0.6) {
    threats.push({ type: "SPAM", msg: "Excessive CAPS LOCK usage (shouting pattern)" });
    score -= 10;
  }

  // Exclamation overload
  const excl = (text.match(/!/g) || []).length;
  if (excl > 5) {
    threats.push({ type: "SPAM", msg: `Excessive exclamation marks (${excl})` });
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  lines.push("");
  lines.push("── Threat Analysis ──────────────────────");
  if (threats.length === 0) {
    lines.push("[OK]   No spam or malicious patterns detected");
  } else {
    threats.forEach((t) => lines.push(`[${t.type}] ${t.msg}`));
  }

  lines.push("");
  lines.push("── Health Report ─────────────────────────");
  let status, statusLabel;
  if (score >= 80) { status = "SAFE"; statusLabel = "Message appears safe"; }
  else if (score >= 50) { status = "WARNING"; statusLabel = "Suspicious — proceed with caution"; }
  else { status = "DANGER"; statusLabel = "Likely spam or malicious content"; }

  lines.push(`Health Score : ${score}/100`);
  lines.push(`Status       : ${status}`);
  lines.push(`Verdict      : ${statusLabel}`);
  lines.push("");
  lines.push("Scan complete. Type 'msgcheck' to scan another message.");

  return { lines, health: score, status };
}

/** Linux Project — Website vulnerability scanner */

function fakeIPv4(hostname) {
  let h = 0;
  for (let i = 0; i < hostname.length; i++) h = (h * 31 + hostname.charCodeAt(i)) >>> 0;
  return `${(h % 223) + 1}.${(h >> 8) % 256}.${(h >> 16) % 256}.${(h >> 24) % 256}`;
}

function fakeIPv6(hostname) {
  let h = 0;
  for (let i = 0; i < hostname.length; i++) h = (h * 17 + hostname.charCodeAt(i)) >>> 0;
  const p = (n) => (n % 65535).toString(16).padStart(4, "0");
  return `${p(h)}:${p(h >> 4)}:${p(h >> 8)}::${p(h >> 12)}`;
}

function normalizeUrl(input) {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  return url;
}

export function scanWebsite(input) {
  const lines = [];
  const vulns = [];
  let score = 100;

  if (!input || !input.trim()) {
    return { lines: ["Error: Empty URL. Enter a website link to scan."], health: 0, status: "error" };
  }

  let parsed;
  try {
    parsed = new URL(normalizeUrl(input));
  } catch {
    return { lines: ["Error: Invalid URL format. Example: https://example.com"], health: 0, status: "error" };
  }

  const host = parsed.hostname;
  const proto = parsed.protocol;
  const path = parsed.pathname;

  lines.push("╔══════════════════════════════════════════╗");
  lines.push("║    WEB HUNTER — Vulnerability Scanner    ║");
  lines.push("╚══════════════════════════════════════════╝");
  lines.push("");
  lines.push(`Target     : ${parsed.href}`);
  lines.push(`Scan time  : ${new Date().toLocaleString()}`);
  lines.push("");
  lines.push("── DNS & Network Info ────────────────────");
  lines.push(`Hostname   : ${host}`);
  lines.push(`IPv4       : ${fakeIPv4(host)}  (simulated)`);
  lines.push(`IPv6       : ${fakeIPv6(host)}  (simulated)`);
  lines.push(`Protocol   : ${proto.replace(":", "").toUpperCase()}`);
  lines.push(`Port       : ${parsed.port || (proto === "https:" ? "443" : "80")}`);
  lines.push(`Path       : ${path || "/"}`);

  // Protocol checks
  if (proto === "http:") {
    vulns.push({ sev: "HIGH", msg: "Site uses HTTP — data not encrypted (no SSL/TLS)" });
    score -= 20;
  } else {
    lines.push("[OK]   HTTPS enabled — traffic encrypted");
  }

  // Suspicious TLD
  const tld = host.split(".").pop();
  if (["tk", "ml", "ga", "cf", "xyz", "top", "buzz"].includes(tld)) {
    vulns.push({ sev: "MEDIUM", msg: `Suspicious TLD (.${tld}) — often used in phishing` });
    score -= 15;
  }

  // URL parameter vulns
  const params = parsed.search;
  if (params) {
    if (/[<>'"]/.test(params)) {
      vulns.push({ sev: "HIGH", msg: "XSS-prone characters in URL parameters" });
      score -= 18;
    }
    if (/('|"|;|--|union|select|drop|insert|or\s+1=1)/i.test(params)) {
      vulns.push({ sev: "CRITICAL", msg: "SQL injection pattern in URL parameters" });
      score -= 25;
    }
    if (/redirect=|url=|next=|goto=/i.test(params)) {
      vulns.push({ sev: "MEDIUM", msg: "Open redirect parameter detected" });
      score -= 12;
    }
  }

  // Path checks
  const riskyPaths = ["/admin", "/wp-admin", "/phpmyadmin", "/.env", "/.git", "/config", "/backup"];
  for (const rp of riskyPaths) {
    if (path.toLowerCase().includes(rp)) {
      vulns.push({ sev: "HIGH", msg: `Sensitive path exposed: ${rp}` });
      score -= 15;
    }
  }

  // IP as hostname
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    vulns.push({ sev: "MEDIUM", msg: "Direct IP access — no domain validation" });
    score -= 10;
  }

  // Long subdomain (phishing pattern)
  const parts = host.split(".");
  if (parts.length > 4) {
    vulns.push({ sev: "LOW", msg: "Unusually long subdomain chain (possible phishing)" });
    score -= 5;
  }

  // Simulated port scan
  lines.push("");
  lines.push("── Port Scan (simulated) ─────────────────");
  const openPorts = proto === "https:" ? ["80", "443"] : ["80"];
  if (path.includes("admin")) openPorts.push("8080");
  lines.push(`Open ports : ${openPorts.join(", ")}`);

  // Simulated header check
  lines.push("");
  lines.push("── Security Headers (simulated) ────────");
  const headers = [
    { name: "X-Frame-Options", ok: proto === "https:" },
    { name: "Content-Security-Policy", ok: false },
    { name: "Strict-Transport-Security", ok: proto === "https:" },
    { name: "X-Content-Type-Options", ok: true },
  ];
  headers.forEach((h) => {
    if (h.ok) lines.push(`[OK]   ${h.name}: present`);
    else {
      vulns.push({ sev: "LOW", msg: `Missing security header: ${h.name}` });
      lines.push(`[WARN] ${h.name}: missing`);
      score -= 5;
    }
  });

  score = Math.max(0, Math.min(100, score));

  lines.push("");
  lines.push("── Vulnerability Report ────────────────");
  if (vulns.length === 0) {
    lines.push("[OK]   No obvious vulnerabilities detected");
  } else {
    vulns.forEach((v) => lines.push(`[${v.sev}] ${v.msg}`));
  }

  lines.push("");
  lines.push("── Security Score ────────────────────────");
  let status, verdict;
  if (score >= 80) { status = "LOW RISK"; verdict = "Website looks relatively safe"; }
  else if (score >= 50) { status = "MEDIUM RISK"; verdict = "Some security issues found"; }
  else { status = "HIGH RISK"; verdict = "Multiple vulnerabilities detected"; }

  lines.push(`Score      : ${score}/100`);
  lines.push(`Risk Level : ${status}`);
  lines.push(`Verdict    : ${verdict}`);
  lines.push("");
  lines.push("Scan complete. Type 'webscan' to scan another site.");
  lines.push("Note: Simulated scan for education — not a real penetration test.");

  return { lines, health: score, status };
}

export const MSG_SCAN_STEPS = [
  "Initializing Msg Guard engine...",
  "Loading spam signature database...",
  "Analyzing message content...",
  "Checking for malicious patterns...",
  "Generating health report...",
];

export const WEB_SCAN_STEPS = [
  "Initializing Web Hunter scanner...",
  "Resolving DNS records...",
  "Probing IPv4 / IPv6 addresses...",
  "Running port scan...",
  "Checking security headers...",
  "Analyzing URL for vulnerabilities...",
  "Generating report...",
];
