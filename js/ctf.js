/** CTF Challenge Mode — educational capture-the-flag */

export const CTF_CHALLENGES = [
  {
    id: "flag-file",
    title: "Hidden Flag File",
    desc: "Find the secret flag hidden in the filesystem",
    hint: "Try: cat /home/student/secret.txt or ls -la",
    flag: "EDU{hidden_flag_2024}",
    answer: "EDU{hidden_flag_2024}",
    points: 20,
  },
  {
    id: "base64-decode",
    title: "Base64 Decoder",
    desc: "Decode this: RURVe2Jhc2U2NF9mbGFnfQ==",
    hint: "Use command: base64 decode RURVe2Jhc2U2NF9mbGFnfQ==",
    flag: "EDU{base64_flag}",
    answer: "EDU{base64_flag}",
    points: 20,
  },
  {
    id: "phishing-spot",
    title: "Phishing Detective",
    desc: "Which email is phishing? A) bank@secure-login.tk B) support@google.com",
    hint: "Look for suspicious domain (.tk) and urgency tricks",
    flag: "EDU{phishing_A}",
    answer: "a",
    points: 15,
  },
  {
    id: "firewall-block",
    title: "Firewall Defender",
    desc: "Block the dangerous port used by SMB exploits (445)",
    hint: "Run: firewall block 445",
    flag: "EDU{firewall_445}",
    answer: "firewall",
    checkCmd: (line) => /firewall\s+block\s+445/i.test(line),
    points: 15,
  },
  {
    id: "hash-verify",
    title: "Hash Master",
    desc: "Run hashcheck on the word 'cyber' to learn hashing",
    hint: "Type: hashcheck cyber",
    flag: "EDU{hash_master}",
    answer: "hashcheck",
    checkCmd: (line) => /^hashcheck\s+cyber/i.test(line.trim()),
    points: 20,
  },
  {
    id: "linux-master",
    title: "Linux Navigator",
    desc: "Navigate to /etc and list files. What command lists files?",
    hint: "cd /etc then ls",
    flag: "EDU{ls_master}",
    answer: "ls",
    points: 10,
  },
];

let ctfState = null;

export function getCtfState() {
  return ctfState;
}

export function startCtf(challengeId) {
  const ch = CTF_CHALLENGES.find((c) => c.id === challengeId);
  if (!ch) return null;
  ctfState = { ...ch, attempts: 0 };
  return ctfState;
}

export function startCtfMenu() {
  ctfState = { menu: true };
  return ctfState;
}

export function checkCtfAnswer(input, rawLine = "") {
  if (!ctfState || ctfState.menu) return null;
  ctfState.attempts++;
  const ans = input.trim().toLowerCase();
  const expected = ctfState.answer.toLowerCase();

  if (ctfState.checkCmd && ctfState.checkCmd(rawLine)) {
    return { correct: true, flag: ctfState.flag, points: ctfState.points };
  }
  if (ctfState.flexible && ans.length >= 4 && expected.startsWith(ans.slice(0, 4))) {
    return { correct: true, flag: ctfState.flag, points: ctfState.points };
  }
  if (ans === expected || ans === ctfState.flag.toLowerCase()) {
    return { correct: true, flag: ctfState.flag, points: ctfState.points };
  }
  if (ctfState.attempts >= 3) {
    return { correct: false, hint: ctfState.hint, showHint: true };
  }
  return { correct: false };
}

export function clearCtf() {
  ctfState = null;
}

export function formatCtfMenu(completed = []) {
  const lines = [
    "╔══════════════════════════════════════╗",
    "║         CTF CHALLENGE LAB            ║",
    "╚══════════════════════════════════════╝",
    "",
    "Type 'ctf <number>' to start a challenge",
    "Submit flag with: flag EDU{your_flag}",
    "",
  ];
  CTF_CHALLENGES.forEach((c, i) => {
    const done = completed.includes(c.id) ? " ✓" : "";
    lines.push(`  ${i + 1}. ${c.title}${done} (${c.points} pts)`);
    lines.push(`     ${c.desc}`);
  });
  lines.push("", `Progress: ${completed.length}/${CTF_CHALLENGES.length} flags captured`);
  return lines;
}
