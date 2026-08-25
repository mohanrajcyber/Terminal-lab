/** System sounds via Web Audio API */

let enabled = true;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function tone(freq, duration, type = "sine", vol = 0.08) {
  if (!enabled) return;
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.stop(c.currentTime + duration);
  } catch { /* silent */ }
}

export const sounds = {
  click: () => tone(800, 0.05, "sine", 0.04),
  success: () => { tone(523, 0.1); setTimeout(() => tone(659, 0.15), 80); },
  error: () => tone(200, 0.2, "square", 0.06),
  notify: () => tone(440, 0.08),
  boot: () => { tone(330, 0.15); setTimeout(() => tone(440, 0.2), 120); },
};

export function setSoundEnabled(v) {
  enabled = v;
}

export function isSoundEnabled() {
  return enabled;
}
