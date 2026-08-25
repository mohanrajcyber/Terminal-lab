/** Phishing & Dark Web educational demos — interactive, works offline */

export function getPhishingDemoHTML() {
  return `
    <div class="demo-section">
      <h3>📧 Phishing Email Demo</h3>
      <p class="demo-intro">Click on suspicious parts of this fake email to learn what to watch for.</p>
      <div class="phish-email" id="phish-email">
        <div class="phish-header">From: <span class="phish-spot" data-tip="Suspicious! Real banks use their domain, not .tk">security@bank-alert.tk</span></div>
        <div class="phish-subject">Subject: <span class="phish-spot" data-tip="Urgency trick — scammers pressure you to act fast">URGENT: Your account will be CLOSED in 24 hours!</span></div>
        <div class="phish-body">
          <p>Dear Customer,</p>
          <p>We detected unusual activity. Verify immediately:</p>
          <p><span class="phish-spot phish-link" data-tip="Never click! URL doesn't match real bank domain">http://bank-secure-login.tk/verify</span></p>
          <p><span class="phish-spot" data-tip="Legitimate companies never ask for passwords via email">Enter your password and OTP here.</span></p>
          <p>— Bank Security Team</p>
        </div>
      </div>
      <div id="phish-tip" class="demo-tip">👆 Click highlighted areas to learn</div>
      <ul class="demo-checklist">
        <li>✓ Check sender domain carefully</li>
        <li>✓ Never click suspicious links</li>
        <li>✓ Use Msg Guard tool to scan messages</li>
        <li>✓ When in doubt — don't click, report it</li>
      </ul>
    </div>
  `;
}

export function getDarkWebDemoHTML() {
  return `
    <div class="demo-section">
      <h3>🌐 Dark Web Awareness Demo</h3>
      <p class="demo-intro">Educational simulation — understand risks without accessing real dark web.</p>
      <div class="darkweb-steps">
        <div class="dw-step active" data-step="1">
          <span class="dw-num">1</span>
          <div>
            <strong>Surface Web</strong>
            <p>Google, YouTube — indexed by search engines. Safe when used wisely.</p>
          </div>
        </div>
        <div class="dw-step" data-step="2">
          <span class="dw-num">2</span>
          <div>
            <strong>Deep Web</strong>
            <p>Hospital records, bank portals — not indexed but legal &amp; password protected.</p>
          </div>
        </div>
        <div class="dw-step" data-step="3">
          <span class="dw-num">3</span>
          <div>
            <strong>Dark Web (.onion)</strong>
            <p>Requires Tor. Contains illegal markets, malware, stolen data. <span class="warn">Never visit!</span></p>
          </div>
        </div>
      </div>
      <div class="darkweb-visual">
        <div class="dw-layer dw-surface">Surface Web 🌍</div>
        <div class="dw-layer dw-deep">Deep Web 🔒</div>
        <div class="dw-layer dw-dark">Dark Web ⚠️</div>
      </div>
      <button type="button" class="app-btn" id="dw-next">Next Step →</button>
      <ul class="demo-checklist">
        <li>✓ Dark web ≠ cool hacking — it's mostly crime</li>
        <li>✓ Use Dark Web Check tool for URL analysis (simulated)</li>
        <li>✓ Report suspicious .onion links to authorities</li>
      </ul>
    </div>
  `;
}

export function getVideoDemoHTML() {
  return `
    <div class="demo-section">
      <h3>🎬 Security Awareness Scenarios</h3>
      <div class="demo-video-cards">
        <div class="demo-card" data-scenario="usb">
          <div class="demo-play">▶</div>
          <strong>USB Drop Attack</strong>
          <p>Found a USB? Never plug it in! Could contain malware.</p>
          <div class="demo-scenario hidden" id="sc-usb">
            <p>🎬 Scenario: Someone leaves a USB labeled "Salary Data" in parking lot.</p>
            <p>❌ Wrong: Plug into computer → ransomware installs</p>
            <p>✓ Right: Hand to IT security → scan in isolated lab</p>
            <p>Try: <code>usbscan</code> tool in EduShell!</p>
          </div>
        </div>
        <div class="demo-card" data-scenario="ransom">
          <div class="demo-play">▶</div>
          <strong>Ransomware Attack</strong>
          <p>Files encrypted? Don't pay — restore from backup.</p>
          <div class="demo-scenario hidden" id="sc-ransom">
            <p>🎬 Scenario: Popup says "Pay 0.5 BTC to decrypt files"</p>
            <p>❌ Wrong: Pay ransom — no guarantee of recovery</p>
            <p>✓ Right: Disconnect network, restore backup, report</p>
            <p>Try: <code>ransomware</code> sim in EduShell!</p>
          </div>
        </div>
        <div class="demo-card" data-scenario="social">
          <div class="demo-play">▶</div>
          <strong>Social Engineering</strong>
          <p>Caller claims to be IT support asking for password.</p>
          <div class="demo-scenario hidden" id="sc-social">
            <p>🎬 Scenario: "Hi, IT here. We need your password to fix your account."</p>
            <p>❌ Wrong: Share password over phone</p>
            <p>✓ Right: Hang up, call official IT number yourself</p>
            <p>Try: <code>msgcheck</code> and <code>passcheck</code> tools!</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initPhishingDemo(container) {
  container.querySelectorAll(".phish-spot").forEach((el) => {
    el.addEventListener("click", () => {
      const tip = container.querySelector("#phish-tip");
      if (tip) {
        tip.textContent = "💡 " + el.dataset.tip;
        tip.classList.add("show");
      }
      el.classList.add("revealed");
    });
  });
}

export function initDarkWebDemo(container) {
  let step = 1;
  const steps = container.querySelectorAll(".dw-step");
  const btn = container.querySelector("#dw-next");
  btn?.addEventListener("click", () => {
    step = step >= 3 ? 1 : step + 1;
    steps.forEach((s) => s.classList.toggle("active", parseInt(s.dataset.step) === step));
    btn.textContent = step >= 3 ? "Restart Demo ↺" : "Next Step →";
  });
}

export function initVideoDemos(container) {
  container.querySelectorAll(".demo-card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = "sc-" + card.dataset.scenario;
      const sc = container.querySelector("#" + id);
      if (sc) {
        sc.classList.toggle("hidden");
        card.classList.toggle("playing");
      }
    });
  });
}
