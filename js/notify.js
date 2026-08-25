/** Toast notification center */

let container = null;

function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.id = "notify-center";
    container.className = "notify-center";
    document.body.appendChild(container);
  }
  return container;
}

export function notify(title, message, type = "success", duration = 4500) {
  const el = document.createElement("div");
  el.className = `notify-toast notify-${type}`;
  const icon = { success: "✓", error: "✕", warning: "!", info: "ℹ" }[type] || "•";
  el.innerHTML = `
    <span class="notify-icon">${icon}</span>
    <div class="notify-body">
      <strong>${title}</strong>
      <span>${message}</span>
    </div>
    <button type="button" class="notify-close">×</button>
  `;

  const c = getContainer();
  c.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));

  const close = () => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  };

  el.querySelector(".notify-close").addEventListener("click", close);
  setTimeout(close, duration);
  return close;
}

let lastReport = "";

export function setLastReport(text) {
  lastReport = text;
}

export function getLastReport() {
  return lastReport;
}

export function exportReport(filename = "edushell-report.txt") {
  if (!lastReport) return false;
  const blob = new Blob([lastReport], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  return true;
}
