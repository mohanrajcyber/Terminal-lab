/** EduShell OS Boot Splash — 3s cinematic intro on every page load */

const BOOT_DURATION = 4000;
const PROGRESS_DURATION = 3800;

export function runBoot(onDone) {
  const splash = document.getElementById("boot-splash");
  if (!splash) {
    onDone?.();
    return;
  }

  const bar = splash.querySelector(".boot-progress-bar");
  const statusText = splash.querySelector(".boot-status-text");
  const percentEl = splash.querySelector(".boot-percent");

  const steps = [
    "Initializing kernel...",
    "Loading security modules...",
    "Mounting filesystem...",
    "Starting EduShell Desktop...",
    "Welcome, analyst!",
  ];

  let step = 0;
  const stepMs = BOOT_DURATION / steps.length;

  statusText.textContent = steps[0];

  const stepInterval = setInterval(() => {
    step++;
    if (step < steps.length) {
      statusText.textContent = steps[step];
      statusText.classList.remove("status-flash");
      void statusText.offsetWidth;
      statusText.classList.add("status-flash");
    }
  }, stepMs);

  // Smooth percent counter
  const start = performance.now();
  function tickPercent(now) {
    const pct = Math.min(100, Math.round(((now - start) / PROGRESS_DURATION) * 100));
    if (percentEl) percentEl.textContent = `${pct}%`;
    if (pct < 100) requestAnimationFrame(tickPercent);
  }
  requestAnimationFrame(tickPercent);

  // Progress bar fill
  requestAnimationFrame(() => {
    bar.style.transition = `width ${PROGRESS_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    bar.style.width = "100%";
  });

  // Fade out after 3 seconds
  setTimeout(() => {
    clearInterval(stepInterval);
    if (percentEl) percentEl.textContent = "100%";
    splash.classList.add("boot-hide");
    setTimeout(() => {
      splash.remove();
      onDone?.();
    }, 700);
  }, BOOT_DURATION);
}
