/** Premium SVG icons for desktop tools */

const GRADIENTS = {
  security: ["#ff6b6b", "#c92a2a"],
  learning: ["#4dabf7", "#1864ab"],
  fun: ["#b197fc", "#7950f2"],
  utility: ["#ffd43b", "#e67700"],
  advanced: ["#69db7c", "#2b8a3e"],
  system: ["#58a6ff", "#1f6feb"],
};

function svgWrap(category, inner) {
  const [c1, c2] = GRADIENTS[category] || GRADIENTS.learning;
  const id = `g-${category}-${Math.random().toString(36).slice(2, 6)}`;
  return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" class="icon-svg">
    <defs>
      <linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.35"/></filter>
    </defs>
    <rect width="48" height="48" rx="12" fill="url(#${id})" filter="url(#shadow)"/>
    ${inner}
  </svg>`;
}

const PATHS = {
  webscan: '<circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="2"/><ellipse cx="24" cy="24" rx="10" ry="4" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.7"/><line x1="14" y1="24" x2="34" y2="24" stroke="#fff" stroke-width="1.5" opacity="0.7"/>',
  msgcheck: '<path d="M14 16h20v14H14z" fill="none" stroke="#fff" stroke-width="2" rx="2"/><path d="M18 20h12M18 24h8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
  hashcheck: '<text x="24" y="30" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold" font-family="monospace">#</text>',
  emailscan: '<path d="M12 18l12 8 12-8v14H12z" fill="none" stroke="#fff" stroke-width="2"/><path d="M12 18l12 8 12-8" stroke="#fff" stroke-width="1.5"/>',
  passcheck: '<rect x="16" y="22" width="16" height="12" rx="2" fill="none" stroke="#fff" stroke-width="2"/><path d="M20 22v-4a4 4 0 018 0v4" fill="none" stroke="#fff" stroke-width="2"/>',
  iplookup: '<circle cx="24" cy="22" r="6" fill="none" stroke="#fff" stroke-width="2"/><path d="M24 28v6M18 34h12" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  portscan: '<rect x="14" y="14" width="20" height="16" rx="2" fill="none" stroke="#fff" stroke-width="2"/><circle cx="20" cy="22" r="2" fill="#fff"/><circle cx="28" cy="22" r="2" fill="#fff"/>',
  sqltest: '<ellipse cx="24" cy="20" rx="10" ry="5" fill="none" stroke="#fff" stroke-width="2"/><path d="M14 20v8c0 3 4 5 10 5s10-2 10-5v-8" fill="none" stroke="#fff" stroke-width="2"/>',
  xsstest: '<path d="M24 14l-8 14h16z" fill="none" stroke="#fff" stroke-width="2"/><line x1="24" y1="20" x2="24" y2="24" stroke="#fff" stroke-width="2"/><circle cx="24" cy="26" r="1" fill="#fff"/>',
  filescan: '<path d="M18 14h8l6 6v16H18z" fill="none" stroke="#fff" stroke-width="2"/><path d="M26 14v6h6" fill="none" stroke="#fff" stroke-width="1.5"/>',
  learn: '<path d="M14 18l10-6 10 6-10 6z" fill="none" stroke="#fff" stroke-width="2"/><path d="M14 18v10l10 6 10-6V18" fill="none" stroke="#fff" stroke-width="1.5"/>',
  flashcard: '<rect x="16" y="16" width="16" height="20" rx="2" fill="none" stroke="#fff" stroke-width="2"/><line x1="20" y1="22" x2="28" y2="22" stroke="#fff" stroke-width="1.5"/>',
  daily: '<rect x="14" y="16" width="20" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2"/><line x1="14" y1="22" x2="34" y2="22" stroke="#fff" stroke-width="1.5"/><line x1="20" y1="12" x2="20" y2="18" stroke="#fff" stroke-width="2"/><line x1="28" y1="12" x2="28" y2="18" stroke="#fff" stroke-width="2"/>',
  cheatsheet: '<rect x="16" y="14" width="16" height="22" rx="2" fill="none" stroke="#fff" stroke-width="2"/><line x1="20" y1="20" x2="28" y2="20" stroke="#fff" stroke-width="1.5"/><line x1="20" y1="25" x2="28" y2="25" stroke="#fff" stroke-width="1.5"/><line x1="20" y1="30" x2="26" y2="30" stroke="#fff" stroke-width="1.5"/>',
  practice: '<path d="M16 32l8-16 8 16" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="34" r="2" fill="#fff"/>',
  quiz: '<circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="2"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">?</text>',
  snake: '<path d="M14 28c0-6 4-10 10-10s10 4 10 10" fill="none" stroke="#fff" stroke-width="2"/><circle cx="30" cy="20" r="2" fill="#fff"/>',
  hangman: '<circle cx="24" cy="18" r="4" fill="none" stroke="#fff" stroke-width="2"/><line x1="24" y1="22" x2="24" y2="30" stroke="#fff" stroke-width="2"/><line x1="20" y1="26" x2="28" y2="26" stroke="#fff" stroke-width="2"/>',
  typetest: '<rect x="14" y="20" width="20" height="10" rx="2" fill="none" stroke="#fff" stroke-width="2"/><rect x="16" y="22" width="3" height="6" fill="#fff"/><rect x="21" y="22" width="3" height="6" fill="#fff" opacity="0.6"/>',
  fortune: '<path d="M24 14c-6 0-10 4-10 8s4 8 10 8 10-4 10-8-4-8-10-8z" fill="none" stroke="#fff" stroke-width="2"/><path d="M18 30c2 3 10 3 12 0" fill="none" stroke="#fff" stroke-width="1.5"/>',
  matrix: '<text x="24" y="22" text-anchor="middle" fill="#0f0" font-size="10" font-family="monospace">01</text><text x="24" y="32" text-anchor="middle" fill="#0f0" font-size="10" font-family="monospace">10</text>',
  clock: '<circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="2"/><line x1="24" y1="24" x2="24" y2="18" stroke="#fff" stroke-width="2"/><line x1="24" y1="24" x2="28" y2="24" stroke="#fff" stroke-width="1.5"/>',
  timer: '<circle cx="24" cy="26" r="8" fill="none" stroke="#fff" stroke-width="2"/><line x1="24" y1="14" x2="24" y2="18" stroke="#fff" stroke-width="2"/><path d="M24 26l4-4" stroke="#fff" stroke-width="1.5"/>',
  calc: '<rect x="14" y="14" width="20" height="22" rx="3" fill="none" stroke="#fff" stroke-width="2"/><rect x="17" y="17" width="14" height="6" rx="1" fill="#fff" opacity="0.3"/>',
  convert: '<path d="M16 24h12M26 20l4 4-4 4M32 24H20M22 20l-4 4 4 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
  base64: '<text x="24" y="28" text-anchor="middle" fill="#fff" font-size="9" font-family="monospace">b64</text>',
  json: '<text x="24" y="28" text-anchor="middle" fill="#fff" font-size="11" font-family="monospace">{ }</text>',
  color: '<circle cx="24" cy="24" r="8" fill="#ff6b6b" stroke="#fff" stroke-width="1.5"/><circle cx="20" cy="20" r="3" fill="#ffd43b"/><circle cx="28" cy="20" r="3" fill="#4dabf7"/>',
  qr: '<rect x="16" y="16" width="6" height="6" fill="#fff"/><rect x="26" y="16" width="6" height="6" fill="#fff"/><rect x="16" y="26" width="6" height="6" fill="#fff"/><rect x="26" y="26" width="4" height="4" fill="#fff"/>',
  todo: '<rect x="14" y="16" width="20" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2"/><path d="M18 22l3 3 6-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
  note: '<path d="M16 14h12l4 4v18H16z" fill="none" stroke="#fff" stroke-width="2"/><line x1="20" y1="24" x2="28" y2="24" stroke="#fff" stroke-width="1.5"/>',
  login: '<circle cx="24" cy="20" r="5" fill="none" stroke="#fff" stroke-width="2"/><path d="M14 36c0-6 4-10 10-10s10 4 10 10" fill="none" stroke="#fff" stroke-width="2"/>',
  run: '<polygon points="20,16 20,32 34,24" fill="#fff"/>',
  alias: '<path d="M18 24h8M26 20l4 4-4 4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>',
  export: '<path d="M24 16v12M20 24l4 4 4-4" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><line x1="16" y1="32" x2="32" y2="32" stroke="#fff" stroke-width="2"/>',
  chat: '<path d="M14 18h20v10H20l-4 4v-4h-2z" fill="none" stroke="#fff" stroke-width="2"/>',
  netmap: '<circle cx="24" cy="16" r="4" fill="#fff"/><circle cx="14" cy="32" r="3" fill="#fff" opacity="0.7"/><circle cx="34" cy="32" r="3" fill="#fff" opacity="0.7"/><line x1="24" y1="20" x2="14" y2="29" stroke="#fff" stroke-width="1.5"/><line x1="24" y1="20" x2="34" y2="29" stroke="#fff" stroke-width="1.5"/>',
  usbscan: '<rect x="18" y="14" width="12" height="20" rx="2" fill="none" stroke="#fff" stroke-width="2"/><rect x="22" y="10" width="4" height="4" fill="#fff"/>',
  ransomware: '<rect x="16" y="20" width="16" height="12" rx="2" fill="none" stroke="#fff" stroke-width="2"/><path d="M20 20v-4a4 4 0 018 0v4" fill="none" stroke="#fff" stroke-width="2"/><text x="24" y="30" text-anchor="middle" fill="#fff" font-size="8">!</text>',
  firewall: '<rect x="14" y="16" width="20" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2"/><path d="M18 22h12M18 26h8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
  darkweb: '<circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="2"/><path d="M14 24c0-5 4-9 10-9s10 4 10 9" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.6"/>',
  reportexport: '<path d="M18 14h8l6 6v16H18z" fill="none" stroke="#fff" stroke-width="2"/><path d="M26 14v6h6M22 28h4" stroke="#fff" stroke-width="1.5"/>',
  settings: '<circle cx="24" cy="24" r="8" fill="none" stroke="#fff" stroke-width="2"/><circle cx="24" cy="24" r="3" fill="#fff"/><line x1="24" y1="14" x2="24" y2="16" stroke="#fff" stroke-width="2"/><line x1="24" y1="32" x2="24" y2="34" stroke="#fff" stroke-width="2"/>',
  filemanager: '<path d="M14 20h8l2 2h10v12H14z" fill="none" stroke="#fff" stroke-width="2"/><line x1="18" y1="26" x2="30" y2="26" stroke="#fff" stroke-width="1.5"/>',
  recyclebin: '<path d="M16 18h16l-2 14H18z" fill="none" stroke="#fff" stroke-width="2"/><line x1="20" y1="18" x2="20" y2="14" stroke="#fff" stroke-width="2"/><line x1="28" y1="18" x2="28" y2="14" stroke="#fff" stroke-width="2"/>',
  ctf: '<text x="24" y="30" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">CTF</text>',
  progress: '<rect x="14" y="28" width="20" height="4" rx="1" fill="#fff" opacity="0.4"/><rect x="14" y="28" width="14" height="4" rx="1" fill="#fff"/>',
  missions: '<path d="M24 12l4 8 9 1-6 6 2 9-9-5-9 5 2-9-6-6 9-1z" fill="none" stroke="#fff" stroke-width="2"/>',
  badges: '<circle cx="24" cy="28" r="10" fill="none" stroke="#fff" stroke-width="2"/><text x="24" y="32" text-anchor="middle" fill="#ffd43b" font-size="12">★</text>',
  leaderboard: '<rect x="14" y="16" width="20" height="18" rx="2" fill="none" stroke="#fff" stroke-width="2"/><text x="24" y="28" text-anchor="middle" fill="#ffd43b" font-size="10">1</text>',
  guide: '<circle cx="24" cy="24" r="10" fill="none" stroke="#fff" stroke-width="2"/><text x="24" y="29" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">?</text>',
  securitydemo: '<rect x="12" y="18" width="24" height="16" rx="2" fill="none" stroke="#fff" stroke-width="2"/><polygon points="24,22 24,22" fill="#fff"/><polygon points="20,30 24,24 28,30" fill="#fff"/>',
};

export function getToolIcon(cmd, category) {
  const path = PATHS[cmd] || '<circle cx="24" cy="24" r="8" fill="#fff" opacity="0.5"/>';
  return svgWrap(category, path);
}

export const CATEGORY_COLORS = {
  security: "#f85149",
  learning: "#58a6ff",
  fun: "#a371f7",
  utility: "#d29922",
  advanced: "#3fb950",
  system: "#58a6ff",
};
