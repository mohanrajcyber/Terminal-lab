import {
  listDir, readFile, writeFile, mkdir, remove, touch, copy, move, tree, exists, isDir,
} from "../filesystem.js";
import { resolvePath, setMode } from "../shell.js";
import {
  formatSize, padRight, nowDate, nowTime, basename, parentPath,
} from "../utils.js";
import { runFeature, featureCommandList } from "../features/commands.js";

function out(lines, type = "out") {
  return lines.map((l) => ({ text: l, type }));
}

function err(msg) {
  return [{ text: msg, type: "err" }];
}

function abs(shell, p) {
  return resolvePath(shell.cwd, p, shell.mode);
}

export const linuxCommands = {
  help() {
    return out([
      "EduShell Linux Commands:",
      "  help          Show this help",
      "  clear         Clear screen",
      "  echo [text]   Print text",
      "  pwd           Print working directory",
      "  cd [dir]      Change directory",
      "  ls [-la] [dir] List directory",
      "  cat [file]    Show file contents",
      "  touch [file]  Create empty file",
      "  mkdir [dir]   Create directory",
      "  rm [-r] file  Remove file/directory",
      "  cp src dest   Copy file",
      "  mv src dest   Move/rename file",
      "  tree [dir]    Directory tree",
      "  grep pat file Search in file",
      "  head/tail file First/last lines",
      "  whoami        Current user",
      "  date          Date & time",
      "  uname [-a]    System info",
      "  hostname      Machine name",
      "  history       Command history",
      "  mode linux|windows  Switch shell mode",
      "  exit          Close message",
    ]);
  },

  clear() {
    return [{ special: "clear" }];
  },

  echo(args) {
    return out([args.slice(1).join(" ")]);
  },

  pwd(shell) {
    return out([shell.cwd]);
  },

  cd(shell, args) {
    const target = args[1];
    if (!target || target === "~") {
      shell.cwd = shell.env.HOME;
      return [];
    }
    if (target === "-") {
      return err("cd: OLDPWD not set");
    }
    const path = abs(shell, target);
    if (!exists(path, "linux")) return err(`cd: ${target}: No such file or directory`);
    if (!isDir(path, "linux")) return err(`cd: ${target}: Not a directory`);
    shell.cwd = path;
    return [];
  },

  ls(shell, args) {
    const flags = args.filter((a, i) => i > 0 && a.startsWith("-")).join("");
    const pathArg = args.slice(1).find((a) => !a.startsWith("-"));
    const path = pathArg ? abs(shell, pathArg) : shell.cwd;
    const r = listDir(path, "linux");
    if (r.error) return err(r.error);

    let entries = r.entries;
    if (!flags.includes("a")) {
      entries = entries.filter((e) => !e.name.startsWith("."));
    }

    if (flags.includes("l")) {
      const lines = entries.map((e) => {
        const perm = e.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
        const size = e.type === "dir" ? 4096 : e.size;
        const name = e.type === "dir" ? e.name + "/" : e.name;
        return `${perm}  1 student student ${padRight(String(size), 8)} Jan  1 12:00 ${name}`;
      });
      if (!lines.length) return out(["total 0"]);
      return out([`total ${entries.length}`, ...lines]);
    }

    const names = entries.map((e) => (e.type === "dir" ? e.name + "/" : e.name));
    return out([names.join("  ") || ""]);
  },

  cat(shell, args) {
    if (args.length < 2) return err("cat: missing file operand");
    const lines = [];
    for (let i = 1; i < args.length; i++) {
      const path = abs(shell, args[i]);
      const r = readFile(path, "linux");
      if (r.error) return err(`cat: ${args[i]}: ${r.error}`);
      lines.push(r.content);
    }
    return out(lines);
  },

  touch(shell, args) {
    if (args.length < 2) return err("touch: missing file operand");
    for (let i = 1; i < args.length; i++) {
      const path = abs(shell, args[i]);
      const r = touch(path, "linux");
      if (r.error) return err(`touch: ${r.error}`);
    }
    return [];
  },

  mkdir(shell, args) {
    const recursive = args.includes("-p");
    const names = args.filter((a) => !a.startsWith("-"));
    if (names.length < 2) return err("mkdir: missing operand");
    for (let i = 1; i < names.length; i++) {
      const path = abs(shell, names[i]);
      const r = mkdir(path, "linux");
      if (r.error && !(recursive && r.error.includes("Already exists"))) {
        return err(`mkdir: ${r.error}`);
      }
    }
    return [];
  },

  rm(shell, args) {
    const recursive = args.includes("-r") || args.includes("-rf") || args.includes("-R");
    const names = args.filter((a) => !a.startsWith("-"));
    if (names.length < 2) return err("rm: missing operand");
    for (let i = 1; i < names.length; i++) {
      const path = abs(shell, names[i]);
      const r = remove(path, "linux", recursive);
      if (r.error) return err(`rm: ${r.error}`);
    }
    return [];
  },

  cp(shell, args) {
    if (args.length < 3) return err("cp: missing file operand");
    const src = abs(shell, args[1]);
    const dest = abs(shell, args[2]);
    const r = copy(src, dest, "linux");
    if (r.error) return err(`cp: ${r.error}`);
    return [];
  },

  mv(shell, args) {
    if (args.length < 3) return err("mv: missing file operand");
    const src = abs(shell, args[1]);
    const dest = abs(shell, args[2]);
    const r = move(src, dest, "linux");
    if (r.error) return err(`mv: ${r.error}`);
    return [];
  },

  tree(shell, args) {
    const path = args[1] ? abs(shell, args[1]) : shell.cwd;
    const base = basename(path, "linux") || path;
    const lines = tree(path, "linux");
    return out([base + "/", ...lines]);
  },

  grep(shell, args) {
    if (args.length < 3) return err("grep: missing pattern or file");
    const pattern = args[1];
    const path = abs(shell, args[2]);
    const r = readFile(path, "linux");
    if (r.error) return err(`grep: ${r.error}`);
    const re = new RegExp(pattern, "i");
    const matches = r.content.split("\n").filter((l) => re.test(l));
    return out(matches.length ? matches : []);
  },

  head(shell, args) {
    if (args.length < 2) return err("head: missing file operand");
    const path = abs(shell, args[1]);
    const r = readFile(path, "linux");
    if (r.error) return err(`head: ${r.error}`);
    return out(r.content.split("\n").slice(0, 10));
  },

  tail(shell, args) {
    if (args.length < 2) return err("tail: missing file operand");
    const path = abs(shell, args[1]);
    const r = readFile(path, "linux");
    if (r.error) return err(`tail: ${r.error}`);
    const lines = r.content.split("\n");
    return out(lines.slice(Math.max(0, lines.length - 10)));
  },

  whoami(shell) {
    return out([shell.user]);
  },

  date() {
    return out([nowDate("linux")]);
  },

  uname(args) {
    if (args.includes("-a")) {
      return out(["Linux edushell 6.1.0-edushell #1 SMP x86_64 GNU/Linux"]);
    }
    return out(["Linux"]);
  },

  hostname(shell) {
    return out([shell.hostname]);
  },

  history(shell) {
    return out(shell.history.map((c, i) => `  ${i + 1}  ${c}`));
  },

  mode(shell, args) {
    const m = (args[1] || "").toLowerCase();
    if (m === "windows" || m === "win" || m === "cmd") {
      setMode(shell, "windows");
      return out([`Switched to Windows CMD mode.`, `Type 'help' for Windows commands.`], "ok");
    }
    if (m === "linux" || m === "bash") {
      setMode(shell, "linux");
      return out([`Switched to Linux bash mode.`], "ok");
    }
    return err("mode: usage: mode linux|windows");
  },

  exit() {
    return out(["Goodbye! Refresh page to restart."], "info");
  },

  nano() {
    return out(["GNU nano 7.0 (simulated) — use 'echo text > file' to write files"], "info");
  },

  vim() {
    return out(["VIM - Vi IMproved (simulated) — use 'echo text > file' to write files"], "info");
  },

  bash(shell, args, line) {
    const m = line.match(/^(\w+)\s*>\s*(.+)$/);
    if (m) {
      const [, cmd, file] = m;
      if (cmd === "echo") {
        const text = line.match(/^echo\s+(.+?)\s*>/)[1].replace(/^["']|["']$/g, "");
        const path = abs(shell, file.trim());
        writeFile(path, "linux", text);
        return [];
      }
    }
    return null;
  },
};

export async function runLinux(shell, args, rawLine) {
  const cmd = args[0]?.toLowerCase();
  if (!cmd) return [];

  const redirect = linuxCommands.bash(shell, args, rawLine);
  if (redirect) return redirect;

  const builtins = { ll: "ls", dir: "ls", cls: "clear", type: "cat", del: "rm", rename: "mv" };
  let resolved = builtins[cmd] || cmd;
  if (shell.aliases?.[cmd]) {
    const parts = shell.aliases[cmd].split(" ");
    resolved = parts[0];
    args = [resolved, ...parts.slice(1), ...args.slice(1)];
  }

  if (resolved === "ls" && cmd === "ll") {
    return linuxCommands.ls(shell, ["ls", "-l", ...args.slice(1)]);
  }

  const featureResult = await runFeature(resolved, shell, args, rawLine);
  if (featureResult !== null) return featureResult;

  const fn = linuxCommands[resolved];
  if (!fn) return err(`${cmd}: command not found`);
  return fn(shell, args, rawLine);
}

export function linuxCommandList() {
  return [...Object.keys(linuxCommands).filter((k) => k !== "bash"), ...featureCommandList()];
}
