import { TOOL_CATEGORIES } from "./features/registry.js";

export function buildToolPanel(container, onToolClick) {
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "panel-top";
  header.innerHTML = `
    <div class="panel-brand">EduShell OS</div>
    <div class="panel-sub">Click tool → runs in terminal</div>
  `;
  container.appendChild(header);

  const search = document.createElement("input");
  search.type = "text";
  search.className = "tool-search";
  search.placeholder = "Search tools...";
  container.appendChild(search);

  const list = document.createElement("div");
  list.className = "tools-list";
  container.appendChild(list);

  function render(filter = "") {
    list.innerHTML = "";
    const q = filter.toLowerCase();
    TOOL_CATEGORIES.forEach((cat) => {
      const tools = cat.tools.filter(
        (t) => !q || t.title.toLowerCase().includes(q) || t.cmd.includes(q) || t.desc.toLowerCase().includes(q)
      );
      if (!tools.length) return;

      const section = document.createElement("div");
      section.className = "tool-category";
      section.innerHTML = `<button type="button" class="cat-toggle open">${cat.icon} ${cat.title} <span>${tools.length}</span></button>`;

      const grid = document.createElement("div");
      grid.className = "tool-grid";

      tools.forEach((tool) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `tool-chip ${tool.mode === "windows" ? "win" : tool.mode === "linux" ? "lin" : "any"}`;
        btn.dataset.cmd = tool.cmd;
        btn.innerHTML = `
          <span class="chip-title">${tool.title}</span>
          <span class="chip-cmd">${tool.cmd}</span>
        `;
        btn.title = tool.desc;
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          onToolClick(tool);
        });
        grid.appendChild(btn);
      });

      section.appendChild(grid);
      const toggle = section.querySelector(".cat-toggle");
      toggle.addEventListener("click", () => {
        toggle.classList.toggle("open");
        grid.classList.toggle("collapsed");
      });
      list.appendChild(section);
    });
  }

  search.addEventListener("input", () => render(search.value));
  render();
}
