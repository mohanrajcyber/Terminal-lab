/** Settings — theme, wallpaper, username, favorites, sound */

const KEY = "edushell_settings";

export const WALLPAPERS = {
  default: "linear-gradient(135deg, #0f2027 0%, #203a43 40%, #2c5364 100%)",
  ocean: "linear-gradient(160deg, #0c1445 0%, #1a5276 50%, #0984e3 100%)",
  purple: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #533483 100%)",
  matrix: "linear-gradient(180deg, #0d0d0d 0%, #001a00 50%, #003300 100%)",
  sunset: "linear-gradient(135deg, #2c003e 0%, #8e2de2 40%, #ff6a00 100%)",
  cyber: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
};

export const THEMES = ["dark", "light", "hacker"];

const defaults = {
  theme: "dark",
  wallpaper: "default",
  username: "student",
  sound: true,
  favorites: [],
  aiMode: "offline",
  groqApiKey: "",
  ollamaUrl: "http://localhost:11434",
};

export function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function applySettings(s, shell) {
  document.body.dataset.theme = s.theme;
  const wp = document.querySelector(".desktop-wallpaper");
  if (wp) wp.style.background = WALLPAPERS[s.wallpaper] || WALLPAPERS.default;
  if (shell) {
    shell.user = s.username;
    if (shell.env) shell.env.USER = s.username;
  }
  return s;
}

export function toggleFavorite(cmd, settings) {
  const favs = settings.favorites || [];
  const i = favs.indexOf(cmd);
  if (i >= 0) favs.splice(i, 1);
  else favs.push(cmd);
  settings.favorites = favs;
  saveSettings(settings);
  return favs;
}
