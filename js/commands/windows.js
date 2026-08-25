import {
  listDir, readFile, writeFile, mkdir, remove, touch, copy, move, tree, exists, isDir,
} from "../filesystem.js";
import { resolvePath, setMode } from "../shell.js";
import { nowDate, nowTime, parentPath, joinPath } from "../utils.js";
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

export const windowsCommands = {
  help() {
    return out([
      "EduShell Windows CMD Commands:",
      "  help              Show this help",
      "  cls               Clear screen",
      "  echo [text]       Print text",
      "  cd [dir]          Change directory",
      "  dir [path]        List directory",
      "  type [file]       Show file contents",
      "  md [dir]          Create directory",
      "  mkdir [dir]       Create directory",
      "  rd [/s] [dir]     Remove directory",
      "  rmdir [/s] [dir]  Remove directory",
      "  del [file]        Delete file",
      "  copy src dest     Copy file",
      "  move src dest     Move file",
      "  ren old new       Rename file",
      "  tree [path]       Directory tree",
      "  date              Show/set date",
      "  time              Show time",
      "  ver               Windows version",
      "  whoami            Current user",
      "  hostname          Computer name",
      "  ipconfig          Network config (simulated)",
      "  systeminfo        System info (simulated)",
      "  ping [host]       Ping host (simulated)",
      "  history           Command history",
      "  mode linux|windows Switch shell mode",
      "  exit              Close message",
    ]);
  },

  cls() {
    return [{ special: "clear" }];
  },

  clear() {
    return [{ special: "clear" }];
  },

  echo(args) {
    return out([args.slice(1).join(" ")]);
  },

  cd(shell, args) {
    const target = args[1];
    if (!target) return out([shell.cwd]);
    if (target === "\\" || target === "/") {
      shell.cwd = "C:\\";
      return [];
    }
    if (target === "..") {
      const p = shell.cwd;
      const idx = p.lastIndexOf("\\");
      shell.cwd = idx <= 2 ? p.slice(0, 3) : p.slice(0, idx);
      return [];
    }
    const path = abs(shell, target);
    if (!exists(path, "windows")) return err(`The system cannot find the path specified.`);
    if (!isDir(path, "windows")) return err(`The directory name is invalid.`);
    shell.cwd = path;
    return [];
  },

  dir(shell, args) {
    const path = args[1] ? abs(shell, args[1]) : shell.cwd;
    const r = listDir(path, "windows");
    if (r.error) return err(r.error);

    const vol = shell.cwd.slice(0, 2);
    const lines = [
      ` Volume in drive ${vol.charAt(0)} is EDUSHELL`,
      ` Volume Serial Number is A1B2-C3D4`,
      "",
      ` Directory of ${path}`,
      "",
    ];

    let totalFiles = 0;
    let totalDirs = 0;
    let totalSize = 0;

    r.entries.forEach((e) => {
      const dt = "08/25/2026  11:00 AM";
      if (e.type === "dir") {
        lines.push(`${dt}    <DIR>          ${e.name}`);
        totalDirs++;
      } else {
        lines.push(`${dt}            ${String(e.size).padStart(10)} ${e.name}`);
        totalFiles++;
        totalSize += e.size;
      }
    });

    lines.push(
      "",
      `              ${totalFiles} File(s)  ${totalSize} bytes`,
      `              ${totalDirs} Dir(s)   1,048,576 bytes free`
    );
    return out(lines);
  },

  type(shell, args) {
    if (args.length < 2) return err("The syntax of the command is incorrect.");
    const path = abs(shell, args[1]);
    const r = readFile(path, "windows");
    if (r.error) return err(`The system cannot find the file specified.`);
    return out(r.content.split(/\r?\n/));
  },

  md(shell, args) {
    return windowsCommands.mkdir(shell, args);
  },

  mkdir(shell, args) {
    if (args.length < 2) return err("The syntax of the command is incorrect.");
    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith("/")) continue;
      const path = abs(shell, args[i]);
      const r = mkdir(path, "windows");
      if (r.error) return err(r.error);
    }
    return [];
  },

  rd(shell, args) {
    return windowsCommands.rmdir(shell, args);
  },

  rmdir(shell, args) {
    const recursive = args.some((a) => a.toLowerCase() === "/s" || a.toLowerCase() === "/q");
    const names = args.filter((a) => !a.startsWith("/"));
    if (names.length < 2) return err("The syntax of the command is incorrect.");
    for (let i = 1; i < names.length; i++) {
      const path = abs(shell, names[i]);
      const r = remove(path, "windows", recursive);
      if (r.error) return err(r.error);
    }
    return [];
  },

  del(shell, args) {
    if (args.length < 2) return err("The syntax of the command is incorrect.");
    for (let i = 1; i < args.length; i++) {
      if (args[i].startsWith("/")) continue;
      const path = abs(shell, args[i]);
      const r = remove(path, "windows", false);
      if (r.error) return err(`Could Not Find ${args[i]}`);
    }
    return [];
  },

  copy(shell, args) {
    if (args.length < 3) return err("The syntax of the command is incorrect.");
    const src = abs(shell, args[1]);
    const dest = abs(shell, args[2]);
    const r = copy(src, dest, "windows");
    if (r.error) return err(`The system cannot find the file specified.`);
    return out(["        1 file(s) copied."]);
  },

  move(shell, args) {
    if (args.length < 3) return err("The syntax of the command is incorrect.");
    const src = abs(shell, args[1]);
    const dest = abs(shell, args[2]);
    const r = move(src, dest, "windows");
    if (r.error) return err(r.error);
    return out(["        1 file(s) moved."]);
  },

  ren(shell, args) {
    if (args.length < 3) return err("The syntax of the command is incorrect.");
    const src = abs(shell, args[1]);
    const dest = joinPath(parentPath(src, "windows"), args[2], "windows");
    const r = move(src, dest, "windows");
    if (r.error) return err(r.error);
    return [];
  },

  rename(shell, args) {
    return windowsCommands.ren(shell, args);
  },

  tree(shell, args) {
    const path = args[1] ? abs(shell, args[1]) : shell.cwd;
    const lines = [`Folder PATH listing for volume EDUSHELL`, `Volume serial number is A1B2-C3D4`, path];
    const t = tree(path, "windows");
    return out([...lines, ...t]);
  },

  date() {
    return out([`The current date is: ${nowDate("windows")}`]);
  },

  time() {
    return out([`The current time is: ${nowTime()}`]);
  },

  ver() {
    return out([
      "",
      "Microsoft Windows [Version 10.0.26200.0000]",
      "(c) EduShell Corporation. All rights reserved.",
    ]);
  },

  whoami(shell) {
    return out([`${shell.env.USERNAME || "Student"}`]);
  },

  hostname(shell) {
    return out([shell.hostname]);
  },

  ipconfig() {
    return out([
      "",
      "Windows IP Configuration",
      "",
      "Ethernet adapter Ethernet:",
      "",
      "   Connection-specific DNS Suffix  . : local",
      "   IPv4 Address. . . . . . . . . . . : 192.168.1.100",
      "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
      "   Default Gateway . . . . . . . . . : 192.168.1.1",
    ]);
  },

  systeminfo() {
    return out([
      "",
      "Host Name:                 EDUSHELL-PC",
      "OS Name:                   Microsoft Windows 11 Pro",
      "OS Version:                10.0.26200 N/A Build 26200",
      "System Manufacturer:       EduShell Virtual",
      "System Type:               x64-based PC",
      "Processor(s):              1 Processor(s) Installed.",
      "Total Physical Memory:     16,384 MB",
    ]);
  },

  ping(args) {
    const host = args[1] || "127.0.0.1";
    return out([
      "",
      `Pinging ${host} with 32 bytes of data:`,
      `Reply from ${host}: bytes=32 time<1ms TTL=128`,
      `Reply from ${host}: bytes=32 time<1ms TTL=128`,
      `Reply from ${host}: bytes=32 time<1ms TTL=128`,
      `Reply from ${host}: bytes=32 time<1ms TTL=128`,
      "",
      `Ping statistics for ${host}:`,
      "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),",
    ]);
  },

  history(shell) {
    return out(shell.history.map((c, i) => `  ${i + 1}  ${c}`));
  },

  mode(shell, args) {
    const m = (args[1] || "").toLowerCase();
    if (m === "linux" || m === "bash") {
      setMode(shell, "linux");
      return out([`Switched to Linux bash mode.`, `Type 'help' for Linux commands.`], "ok");
    }
    if (m === "windows" || m === "win" || m === "cmd") {
      setMode(shell, "windows");
      return out([`Switched to Windows CMD mode.`], "ok");
    }
    return err("mode: usage: mode linux|windows");
  },

  exit() {
    return out(["Goodbye! Refresh page to restart."], "info");
  },

  ls(shell, args) {
    return windowsCommands.dir(shell, args);
  },

  pwd(shell) {
    return out([shell.cwd]);
  },

  cat(shell, args) {
    return windowsCommands.type(shell, args);
  },

  rm(shell, args) {
    return windowsCommands.del(shell, args);
  },
};

export async function runWindows(shell, args, rawLine) {
  const cmd = args[0]?.toLowerCase();
  if (!cmd) return [];

  const redirect = rawLine.match(/^echo\s+(.+?)\s*>\s*(.+)$/i);
  if (redirect) {
    const text = redirect[1].replace(/^["']|["']$/g, "");
    const path = abs(shell, redirect[2].trim());
    writeFile(path, "windows", text);
    return [];
  }

  let resolved = cmd;
  if (shell.aliases?.[cmd]) {
    const parts = shell.aliases[cmd].split(" ");
    resolved = parts[0];
    args = [resolved, ...parts.slice(1), ...args.slice(1)];
  }

  const featureResult = await runFeature(resolved, shell, args, rawLine);
  if (featureResult !== null) return featureResult;

  const fn = windowsCommands[resolved];
  if (!fn) {
    return err(`'${cmd}' is not recognized as an internal or external command,\noperable program or batch file.`);
  }
  return fn(shell, args, rawLine);
}

export function windowsCommandList() {
  return [...Object.keys(windowsCommands), ...featureCommandList()];
}
