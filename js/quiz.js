export const quizQuestions = [
  {
    q: "Which command lists files in Linux?",
    options: { a: "dir", b: "ls", c: "type" },
    answer: "b",
  },
  {
    q: "Which command lists files in Windows CMD?",
    options: { a: "dir", b: "ls", c: "cat" },
    answer: "a",
  },
  {
    q: "How do you clear the screen in Linux?",
    options: { a: "cls", b: "clean", c: "clear" },
    answer: "c",
  },
  {
    q: "How do you clear the screen in Windows?",
    options: { a: "clear", b: "cls", c: "reset" },
    answer: "b",
  },
  {
    q: "Which command shows file contents in Linux?",
    options: { a: "type", b: "cat", c: "read" },
    answer: "b",
  },
  {
    q: "Which command shows file contents in Windows?",
    options: { a: "cat", b: "print", c: "type" },
    answer: "c",
  },
  {
    q: "Which command creates a folder in Windows?",
    options: { a: "mkdir", b: "md", c: "both a and b" },
    answer: "c",
  },
  {
    q: "How do you switch from Linux to Windows mode in EduShell?",
    options: { a: "switch windows", b: "os windows", c: "mode windows" },
    answer: "c",
  },
  {
    q: "What does 'pwd' do in Linux?",
    options: { a: "Print working directory", b: "Password check", c: "Power down" },
    answer: "a",
  },
  {
    q: "Which command shows your username?",
    options: { a: "user", b: "whoami", c: "me" },
    answer: "b",
  },
];

export function formatQuestion(index) {
  const q = quizQuestions[index];
  if (!q) return null;

  const lines = [
    "══════════════════════════════════════",
    `  Question ${index + 1} of ${quizQuestions.length}`,
    "══════════════════════════════════════",
    q.q,
    "",
    `  a) ${q.options.a}`,
    `  b) ${q.options.b}`,
    `  c) ${q.options.c}`,
    "",
    "Type a, b, or c and press Enter (or 'quit' to exit quiz)",
  ];
  return lines;
}

export function checkQuizAnswer(index, choice) {
  const q = quizQuestions[index];
  if (!q) return false;
  return choice.toLowerCase() === q.answer;
}

export function getCorrectAnswer(index) {
  const q = quizQuestions[index];
  if (!q) return "";
  return `${q.answer}) ${q.options[q.answer]}`;
}

export function formatQuizResult(score, total) {
  const pct = Math.round((score / total) * 100);
  let grade = "Keep practicing!";
  if (pct === 100) grade = "Perfect! Terminal master!";
  else if (pct >= 80) grade = "Excellent work!";
  else if (pct >= 60) grade = "Good job!";
  else if (pct >= 40) grade = "Not bad — try again!";

  return [
    "",
    "══════════════════════════════════════",
    "           QUIZ COMPLETE",
    "══════════════════════════════════════",
    `  Score: ${score} / ${total}  (${pct}%)`,
    `  Grade: ${grade}`,
    "",
    "  Type 'quiz' to play again",
    "══════════════════════════════════════",
  ];
}
