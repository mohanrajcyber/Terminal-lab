import { defaultCwd } from "./filesystem.js";
import { joinPath, cleanLinuxPath, cleanWindowsPath } from "./utils.js";

export function createShell() {
  return {
    mode: "linux",
    cwd: defaultCwd.linux,
    user: "student",
    hostname: "edushell",
    history: [],
    historyIndex: -1,
    loggedIn: null,
    aliases: {},
    env: {
      PATH: "/usr/bin:/bin",
      HOME: "/home/student",
      USER: "student",
    },
  };
}

export function setMode(shell, mode) {
  shell.mode = mode;
  shell.cwd = mode === "windows" ? defaultCwd.windows : defaultCwd.linux;
  shell.hostname = mode === "windows" ? "EDUSHELL-PC" : "edushell";
  if (mode === "windows") {
    shell.env = { USERPROFILE: "C:\\Users\\Student", USERNAME: "Student", OS: "Windows_NT" };
  } else {
    shell.env = { PATH: "/usr/bin:/bin", HOME: "/home/student", USER: "student" };
  }
}

export function getPrompt(shell) {
  if (shell.mode === "windows") {
    return `${shell.cwd}>`;
  }
  const short = shell.cwd === shell.env.HOME ? "~" : shell.cwd.replace(/^\/home\/student/, "~");
  return `${shell.user}@${shell.hostname}:${short}$ `;
}

export function resolvePath(cwd, input, mode) {
  if (!input) return cwd;
  if (mode === "linux") {
    return cleanLinuxPath(joinPath(cwd, input, "linux"));
  }
  return cleanWindowsPath(joinPath(cwd, input, "windows"));
}

export function addHistory(shell, cmd) {
  if (!cmd.trim()) return;
  if (shell.history[shell.history.length - 1] !== cmd) {
    shell.history.push(cmd);
  }
  shell.historyIndex = shell.history.length;
}

export function historyPrev(shell) {
  if (!shell.history.length) return "";
  shell.historyIndex = Math.max(0, shell.historyIndex - 1);
  return shell.history[shell.historyIndex];
}

export function historyNext(shell) {
  if (!shell.history.length) return "";
  shell.historyIndex = Math.min(shell.history.length, shell.historyIndex + 1);
  if (shell.historyIndex >= shell.history.length) return "";
  return shell.history[shell.historyIndex];
}
