/** In-memory dual filesystem for Linux and Windows paths */

const linuxFS = {
  type: "dir",
  children: {
    home: {
      type: "dir",
      children: {
        student: {
          type: "dir",
          children: {
            documents: {
              type: "dir",
              children: {
                "readme.txt": { type: "file", content: "Welcome to EduShell!\nType help for commands.", size: 48 },
                "notes.md": { type: "file", content: "# Class Notes\n- Linux: ls, cd, cat\n- Windows: dir, cd, type", size: 64 },
              },
            },
            projects: {
              type: "dir",
              children: {
                "hello.sh": { type: "file", content: "#!/bin/bash\necho Hello World", size: 32 },
                "app.js": { type: "file", content: "console.log('EduShell rocks!');", size: 35 },
              },
            },
            downloads: {
              type: "dir",
              children: {
                "sample.zip": { type: "file", content: "[binary data]", size: 2048 },
              },
            },
            ".bashrc": { type: "file", content: "export PS1='student@edushell:\\\\w$ '", size: 40 },
            "secret.txt": { type: "file", content: "CLASSIFIED FILE\n\nYour flag: EDU{hidden_flag_2024}\n\nHint: This file is hidden in plain sight!", size: 72 },
          },
        },
      },
    },
    etc: {
      type: "dir",
      children: {
        hostname: { type: "file", content: "edushell-linux", size: 14 },
        "os-release": { type: "file", content: 'NAME="EduShell Linux"\nVERSION="1.0"', size: 40 },
      },
    },
    usr: {
      type: "dir",
      children: {
        bin: { type: "dir", children: {} },
      },
    },
    tmp: { type: "dir", children: {} },
  },
};

const windowsFS = {
  type: "dir",
  children: {
    "C:": {
      type: "dir",
      children: {
        Users: {
          type: "dir",
          children: {
            Student: {
              type: "dir",
              children: {
                Documents: {
                  type: "dir",
                  children: {
                    "readme.txt": { type: "file", content: "Welcome to EduShell Windows mode!\r\nType help for commands.", size: 52 },
                    "notes.txt": { type: "file", content: "Windows CMD commands work here.", size: 35 },
                  },
                },
                Desktop: {
                  type: "dir",
                  children: {
                    "shortcut.lnk": { type: "file", content: "[shortcut]", size: 512 },
                  },
                },
                Downloads: {
                  type: "dir",
                  children: {
                    "setup.exe": { type: "file", content: "[binary]", size: 4096 },
                  },
                },
                Projects: {
                  type: "dir",
                  children: {
                    "hello.bat": { type: "file", content: "@echo off\r\necho Hello from Windows!", size: 38 },
                    "app.js": { type: "file", content: "console.log('Windows mode');", size: 30 },
                  },
                },
              },
            },
          },
        },
        Windows: {
          type: "dir",
          children: {
            System32: { type: "dir", children: {} },
          },
        },
        "Program Files": {
          type: "dir",
          children: {
            EduShell: { type: "dir", children: {} },
          },
        },
      },
    },
  },
};

function linuxParts(path) {
  return path.replace(/^\/+/, "").split("/").filter(Boolean);
}

function windowsParts(path) {
  const m = path.match(/^([a-zA-Z]:)\\?(.*)$/);
  if (!m) return [];
  const rest = m[2] ? m[2].split("\\").filter(Boolean) : [];
  return [m[1], ...rest];
}

function getLinuxNode(path, createDirs = false) {
  if (path === "/") return { node: linuxFS, parent: null, name: "" };
  const parts = linuxParts(path);
  let node = linuxFS;
  let parent = null;
  let name = "";

  for (let i = 0; i < parts.length; i++) {
    name = parts[i];
    if (!node.children || !node.children[name]) {
      if (createDirs && i < parts.length - 1) {
        node.children[name] = { type: "dir", children: {} };
      } else if (createDirs && i === parts.length - 1) {
        return { node: null, parent: node, name };
      } else {
        return { node: null, parent: node, name };
      }
    }
    parent = node;
    node = node.children[name];
  }
  return { node, parent, name };
}

function getWindowsNode(path, createDirs = false) {
  const parts = windowsParts(path);
  if (!parts.length) return { node: null, parent: null, name: "" };

  let node = windowsFS;
  let parent = null;
  let name = "";

  for (let i = 0; i < parts.length; i++) {
    name = parts[i];
    if (!node.children || !node.children[name]) {
      if (createDirs && i < parts.length - 1) {
        node.children[name] = { type: "dir", children: {} };
      } else if (createDirs && i === parts.length - 1) {
        return { node: null, parent: node, name };
      } else {
        return { node: null, parent: node, name };
      }
    }
    parent = node;
    node = node.children[name];
  }
  return { node, parent, name };
}

export function resolveNode(path, mode, createParent = false) {
  return mode === "windows" ? getWindowsNode(path, createParent) : getLinuxNode(path, createParent);
}

export function listDir(path, mode) {
  const { node } = resolveNode(path, mode);
  if (!node) return { error: `No such file or directory: ${path}` };
  if (node.type !== "dir") return { error: `Not a directory: ${path}` };
  const entries = Object.entries(node.children || {}).map(([name, n]) => ({
    name,
    type: n.type,
    size: n.type === "file" ? (n.size || (n.content?.length ?? 0)) : 0,
  }));
  return { entries };
}

export function readFile(path, mode) {
  const { node } = resolveNode(path, mode);
  if (!node) return { error: `No such file: ${path}` };
  if (node.type !== "file") return { error: `Is a directory: ${path}` };
  return { content: node.content || "" };
}

export function writeFile(path, mode, content) {
  const { node, parent, name } = resolveNode(path, mode, true);
  if (!parent) return { error: `Cannot write: ${path}` };
  if (node && node.type === "dir") return { error: `Is a directory: ${path}` };
  parent.children[name] = { type: "file", content, size: content.length };
  return { ok: true };
}

export function mkdir(path, mode) {
  const { node, parent, name } = resolveNode(path, mode, true);
  if (node) return { error: `Already exists: ${path}` };
  if (!parent) return { error: `Cannot create: ${path}` };
  parent.children[name] = { type: "dir", children: {} };
  return { ok: true };
}

export function remove(path, mode, recursive = false) {
  const { node, parent, name } = resolveNode(path, mode);
  if (!node) return { error: `No such file or directory: ${path}` };
  if (node.type === "dir" && Object.keys(node.children || {}).length && !recursive) {
    return { error: `Directory not empty: ${path}` };
  }
  if (!parent) return { error: `Cannot remove: ${path}` };
  delete parent.children[name];
  return { ok: true };
}

export function touch(path, mode) {
  const { node, parent, name } = resolveNode(path, mode, true);
  if (!parent) return { error: `Cannot touch: ${path}` };
  if (node && node.type === "dir") return { error: `Is a directory: ${path}` };
  if (!node) {
    parent.children[name] = { type: "file", content: "", size: 0 };
  }
  return { ok: true };
}

export function copy(src, dest, mode) {
  const srcN = resolveNode(src, mode);
  if (!srcN.node || srcN.node.type !== "file") return { error: `Source not found: ${src}` };
  return writeFile(dest, mode, srcN.node.content || "");
}

export function move(src, dest, mode) {
  const r = copy(src, dest, mode);
  if (r.error) return r;
  return remove(src, mode, true);
}

export function exists(path, mode) {
  const { node } = resolveNode(path, mode);
  return !!node;
}

export function isDir(path, mode) {
  const { node } = resolveNode(path, mode);
  return node?.type === "dir";
}

export function tree(path, mode, prefix = "", lines = []) {
  const { node } = resolveNode(path, mode);
  if (!node || node.type !== "dir") return lines;

  const entries = Object.keys(node.children || {}).sort();
  entries.forEach((name, i) => {
    const last = i === entries.length - 1;
    const connector = last ? "└── " : "├── ";
    const child = node.children[name];
    lines.push(`${prefix}${connector}${name}${child.type === "dir" ? "/" : ""}`);
    if (child.type === "dir") {
      const childPath =
        mode === "windows"
          ? (path.endsWith("\\") ? path + name : `${path}\\${name}`)
          : `${path}/${name}`.replace("//", "/");
      tree(childPath, mode, prefix + (last ? "    " : "│   "), lines);
    }
  });
  return lines;
}

export const defaultCwd = {
  linux: "/home/student",
  windows: "C:\\Users\\Student",
};
