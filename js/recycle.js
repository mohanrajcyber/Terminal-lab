/** Recycle Bin for deleted files */

const KEY = "edushell_recycle";

export function loadRecycle() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveRecycle(items) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToRecycle(name, content, mode, path) {
  const items = loadRecycle();
  items.push({
    id: Date.now(),
    name,
    content,
    mode,
    path,
    deletedAt: new Date().toISOString(),
  });
  saveRecycle(items);
  return items.length;
}

export function restoreItem(id) {
  const items = loadRecycle();
  const i = items.findIndex((x) => x.id === id);
  if (i < 0) return null;
  const [item] = items.splice(i, 1);
  saveRecycle(items);
  return item;
}

export function emptyRecycle() {
  saveRecycle([]);
}

export function listRecycleItems() {
  return loadRecycle();
}
