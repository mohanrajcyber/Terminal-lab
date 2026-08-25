/** Shared helpers for path resolution and output formatting */

export function normalizeSlashes(p) {
  return p.replace(/\\/g, "/");
}

export function isWindowsPath(p) {
  return /^[a-zA-Z]:/.test(p) || p.includes("\\");
}

export function joinPath(base, segment, mode) {
  if (mode === "windows") {
    return joinWindowsPath(base, segment);
  }
  return joinLinuxPath(base, segment);
}

function joinLinuxPath(base, segment) {
  if (!segment || segment === ".") return base || "/";
  if (segment.startsWith("/")) return cleanLinuxPath(segment);

  const parts = (base || "/").split("/").filter(Boolean);
  for (const part of segment.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return "/" + parts.join("/");
}

function joinWindowsPath(base, segment) {
  if (!segment || segment === ".") return base || "C:\\";

  if (/^[a-zA-Z]:/.test(segment)) {
    return cleanWindowsPath(segment);
  }

  let drive = "C:";
  let parts = [];

  const winBase = base || "C:\\Users\\Student";
  const m = winBase.match(/^([a-zA-Z]:)(\\(.*))?$/);
  if (m) {
    drive = m[1];
    parts = (m[3] || "").split("\\").filter(Boolean);
  }

  for (const part of segment.split(/[\\/]/)) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }

  return parts.length ? `${drive}\\${parts.join("\\")}` : `${drive}\\`;
}

export function cleanLinuxPath(p) {
  const parts = normalizeSlashes(p).split("/").filter(Boolean);
  const stack = [];
  for (const part of parts) {
    if (part === "..") stack.pop();
    else if (part !== ".") stack.push(part);
  }
  return "/" + stack.join("/");
}

export function cleanWindowsPath(p) {
  const norm = p.replace(/\//g, "\\");
  const m = norm.match(/^([a-zA-Z]:)(\\(.*))?$/);
  if (!m) return "C:\\Users\\Student";

  const drive = m[1];
  const parts = (m[3] || "").split("\\").filter(Boolean);
  const stack = [];
  for (const part of parts) {
    if (part === "..") stack.pop();
    else if (part !== ".") stack.push(part);
  }
  return stack.length ? `${drive}\\${stack.join("\\")}` : `${drive}\\`;
}

export function parentPath(path, mode) {
  if (mode === "windows") {
    const cleaned = cleanWindowsPath(path);
    const idx = cleaned.lastIndexOf("\\");
    if (idx <= 2) return cleaned.slice(0, 3);
    return cleaned.slice(0, idx);
  }
  if (path === "/") return "/";
  const cleaned = cleanLinuxPath(path);
  const idx = cleaned.lastIndexOf("/");
  return idx <= 0 ? "/" : cleaned.slice(0, idx);
}

export function basename(path, mode) {
  if (mode === "windows") {
    const parts = path.split("\\").filter(Boolean);
    return parts[parts.length - 1] || "";
  }
  const parts = path.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function padRight(str, len) {
  return str.length >= len ? str : str + " ".repeat(len - str.length);
}

export function parseArgs(line) {
  const args = [];
  let cur = "";
  let inQuote = null;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuote) {
      if (ch === inQuote) inQuote = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") {
      inQuote = ch;
    } else if (ch === " ") {
      if (cur) {
        args.push(cur);
        cur = "";
      }
    } else {
      cur += ch;
    }
  }
  if (cur) args.push(cur);
  return args;
}

export function nowDate(mode) {
  const d = new Date();
  if (mode === "windows") {
    return d.toLocaleDateString("en-US");
  }
  return d.toString();
}

export function nowTime() {
  return new Date().toLocaleTimeString();
}

export function asciiBanner() {
  return `
 ███████╗██████╗ ██╗   ██╗███████╗██╗  ██╗███████╗██╗     ██╗
 ██╔════╝██╔══██╗██║   ██║██╔════╝██║  ██║██╔════╝██║     ██║
 █████╗  ██║  ██║██║   ██║███████╗███████║█████╗  ██║     ██║
 ██╔══╝  ██║  ██║██║   ██║╚════██║██╔══██║██╔══╝  ██║     ██║
 ███████╗██████╔╝╚██████╔╝███████║██║  ██║███████╗███████╗███████╗
 ╚══════╝╚═════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
  Browser Terminal Simulator — Linux & Windows commands
  Type 'help' to begin · 'mode windows' or 'mode linux' to switch`;
}
