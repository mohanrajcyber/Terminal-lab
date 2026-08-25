import { TOOL_CATEGORIES } from "./features/registry.js";
import { getToolIcon, CATEGORY_COLORS } from "./icons.js";

export function buildDesktop(desktopEl, onToolClick, settings = {}) {
  desktopEl.innerHTML = "";

  const searchWrap = document.createElement("div");
  searchWrap.className = "desktop-search-wrap";
  searchWrap.innerHTML = `<input type="text" class="desktop-search" placeholder="🔍 Search tools on desktop..." />`;
  desktopEl.appendChild(searchWrap);

  const grid = document.createElement("div");
  grid.className = "desktop-grid";
  desktopEl.appendChild(grid);

  const search = searchWrap.querySelector(".desktop-search");
  const favs = settings.favorites || [];
  let iconIndex = 0;

  function launchTool(tool, btn) {
    grid.querySelectorAll(".desktop-icon").forEach((i) => i.classList.remove("selected", "launching"));
    if (btn) {
      btn.classList.add("selected", "launching");
      setTimeout(() => btn.classList.remove("launching"), 400);
    }
    onToolClick(tool);
  }

  function renderIcon(tool, catId, icons) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `desktop-icon cat-${catId} ${tool.mode}`;
    btn.dataset.cmd = tool.cmd;
    btn.style.setProperty("--icon-i", iconIndex++);
    btn.innerHTML = `
      <span class="icon-box"><span class="icon-shine"></span>${getToolIcon(tool.cmd, catId)}</span>
      <span class="icon-name">${tool.title}</span>
    `;
    btn.title = `${tool.desc}\nClick to run · Right-click to favorite`;
    btn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); launchTool({ ...tool, category: catId }, btn); });
    btn.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      onToolClick({ ...tool, action: "favorite" });
    });
    icons.appendChild(btn);
  }

  function render(filter = "") {
    grid.innerHTML = "";
    iconIndex = 0;
    const q = filter.toLowerCase();

    if (favs.length && !q) {
      const favTools = [];
      TOOL_CATEGORIES.forEach((cat) => {
        cat.tools.forEach((t) => { if (favs.includes(t.cmd)) favTools.push({ ...t, catId: cat.id }); });
      });
      if (favTools.length) {
        const section = document.createElement("div");
        section.className = "desktop-folder favorites-folder";
        section.style.setProperty("--folder-i", grid.children.length);
        section.innerHTML = `<div class="folder-label" style="--fc:#ffd43b"><span class="folder-icon">⭐</span><span>Favorites</span></div>`;
        const icons = document.createElement("div");
        icons.className = "folder-icons";
        favTools.forEach((t) => renderIcon(t, t.catId, icons));
        section.appendChild(icons);
        grid.appendChild(section);
      }
    }

    TOOL_CATEGORIES.forEach((cat) => {
      const tools = cat.tools.filter(
        (t) => !q || t.title.toLowerCase().includes(q) || t.cmd.includes(q) || t.desc.toLowerCase().includes(q)
      );
      if (!tools.length) return;

      const section = document.createElement("div");
      section.className = "desktop-folder";
      section.style.setProperty("--folder-i", grid.children.length);
      section.innerHTML = `
        <div class="folder-label" style="--fc:${CATEGORY_COLORS[cat.id]}">
          <span class="folder-icon">${cat.icon}</span>
          <span>${cat.title}</span>
        </div>
      `;

      const icons = document.createElement("div");
      icons.className = "folder-icons";

      tools.forEach((tool) => renderIcon(tool, cat.id, icons));

      section.appendChild(icons);
      grid.appendChild(section);
    });
  }

  search.addEventListener("input", () => render(search.value));
  search.addEventListener("click", (e) => e.stopPropagation());
  render();
}

export function updateTaskbarClock(el) {
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
