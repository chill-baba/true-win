import http from 'http';
import https from 'https';
import { URL } from 'url';

const TARGET_ORIGIN = 'https://1win.in';
const TARGET_HOST = '1win.in';
const PORT = 3000;

// Catch any unhandled errors to keep proxy daemon alive 24/7
process.on('uncaughtException', (err) => {
  console.warn('[Proxy Warning] Uncaught exception safely handled:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('[Proxy Warning] Unhandled rejection safely handled:', reason);
});

const agent = new https.Agent({ keepAlive: true, rejectUnauthorized: false, timeout: 30000 });

const server = http.createServer((req, res) => {
  req.on('error', (err) => console.warn('[Client Req Error]', err.message));
  res.on('error', (err) => console.warn('[Client Res Error]', err.message));

  let reqUrl = req.url;
  if (reqUrl.includes('/translations/')) {
    reqUrl = reqUrl.replace(/en-IN\.json/g, 'en-001.json')
                   .replace(/hi-IN\.json/g, 'en-001.json')
                   .replace(/ru-RU\.json/g, 'en-001.json');
  }

  const targetUrl = new URL(reqUrl, TARGET_ORIGIN);

  const forwardHeaders = {
    ...req.headers,
    host: TARGET_HOST,
    referer: `${TARGET_ORIGIN}/`,
    'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'accept-language': 'en-001,en-US;q=0.9,en;q=0.8',
    'x-country': 'IN',
    'cf-ipcountry': 'IN'
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    forwardHeaders.origin = TARGET_ORIGIN;
  } else {
    delete forwardHeaders.origin;
  }

  delete forwardHeaders['accept-encoding'];

  const proxyReq = https.request(targetUrl, {
    method: req.method,
    headers: forwardHeaders,
    agent
  }, (proxyRes) => {
    proxyRes.on('error', (err) => console.warn('[Upstream Res Error]', err.message));

    res.statusCode = proxyRes.statusCode;

    const resHeaders = {};
    for (const [key, value] of Object.entries(proxyRes.headers)) {
      const lower = key.toLowerCase();
      if (lower === 'x-frame-options' || lower === 'content-security-policy' || lower === 'cross-origin-opener-policy') {
        continue;
      }

      if (lower === 'set-cookie') {
        const cookies = Array.isArray(value) ? value : [value];
        resHeaders['Set-Cookie'] = cookies.map(c =>
          c.replace(/;\s*Domain=[^;]+/gi, '')
           .replace(/;\s*Secure/gi, '')
           .replace(/;\s*SameSite=[^;]+/gi, '; SameSite=Lax')
        );
        continue;
      }

      resHeaders[key] = value;
    }

    resHeaders['Access-Control-Allow-Origin'] = '*';
    resHeaders['Access-Control-Allow-Credentials'] = 'true';
    resHeaders['Content-Security-Policy'] = "default-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' * data: blob:; style-src 'self' 'unsafe-inline' * data: blob:; img-src 'self' * data: blob:; font-src 'self' * data: blob:; connect-src 'self' * ws: wss:; frame-src 'self' *; media-src 'self' * data: blob:; object-src 'none';";

    const customCookies = [
      'lang=en-001; Path=/; SameSite=Lax',
      'locale=en-001; Path=/; SameSite=Lax',
      'localeId=2; Path=/; SameSite=Lax',
      'appLocaleId=2; Path=/; SameSite=Lax',
      'country=IN; Path=/; SameSite=Lax'
    ];
    if (resHeaders['Set-Cookie']) {
      resHeaders['Set-Cookie'].push(...customCookies);
    } else {
      resHeaders['Set-Cookie'] = customCookies;
    }

    const contentType = proxyRes.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html');

    if (isHtml) {
      delete resHeaders['content-length'];
      for (const [k, v] of Object.entries(resHeaders)) {
        res.setHeader(k, v);
      }

      let body = '';
      proxyRes.setEncoding('utf8');
      proxyRes.on('data', chunk => { body += chunk; });
      proxyRes.on('end', () => {
        body = body.replace(/lang="[^"]*"/, 'lang="en-001"');
        body = body.replace(/"appLocaleId":\s*\d+/, '"appLocaleId":2');
        body = body.replace(/"country":\s*"[^"]*"/, '"country":"IN"');

        const localeScript = `
<script>
  try {
    localStorage.setItem('lang', 'en-001');
    localStorage.setItem('locale', 'en-001');
    localStorage.setItem('localeId', '2');
    localStorage.setItem('appLocaleId', '2');
    localStorage.setItem('selected_locale', 'en-001');
    localStorage.setItem('language', 'en-001');
    localStorage.setItem('country', 'IN');
    sessionStorage.setItem('lang', 'en-001');
    sessionStorage.setItem('locale', 'en-001');
  } catch (e) {}
</script>
`;
        if (body.includes('<head>')) {
          body = body.replace('<head>', '<head>' + localeScript);
        } else {
          body = localeScript + body;
        }

        const authOverlay = `
<style>
  /* =====================================================
     PAGE-LOAD SKELETON OVERLAY
     Shows a full-screen shimmer until the page is ready.
     ===================================================== */
  #win-page-skeleton {
    position: fixed;
    inset: 0;
    z-index: 2147483647;
    background: #0f1015;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    pointer-events: all;
    transition: opacity 0.4s ease, visibility 0.4s ease;
  }
  #win-page-skeleton.win-skeleton-hidden {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }

  /* shimmer keyframe */
  @keyframes win-shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position:  800px 0; }
  }
  .win-sk-block {
    border-radius: 8px;
    background: linear-gradient(90deg, #1a1c24 25%, #252733 50%, #1a1c24 75%);
    background-size: 800px 100%;
    animation: win-shimmer 1.4s ease-in-out infinite;
  }

  /* skeleton top nav bar */
  #win-sk-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 20px;
    background: #141415;
    border-bottom: 1px solid #222;
    gap: 12px;
    flex-shrink: 0;
  }
  .win-sk-logo   { width: 90px;  height: 32px; border-radius: 8px; }
  .win-sk-nav-links { display: flex; gap: 10px; flex: 1; padding: 0 20px; }
  .win-sk-nav-link  { width: 70px; height: 20px; border-radius: 6px; }
  .win-sk-nav-btns  { display: flex; gap: 8px; }
  .win-sk-nav-btn   { width: 90px; height: 36px; border-radius: 10px; }

  /* skeleton hero */
  #win-sk-hero {
    height: 220px;
    margin: 16px 20px;
    border-radius: 16px;
    flex-shrink: 0;
  }

  /* skeleton content grid */
  #win-sk-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 12px;
    padding: 0 20px 20px;
    overflow: hidden;
  }
  .win-sk-card { height: 110px; border-radius: 12px; }

  @media (max-width: 600px) {
    .win-sk-nav-links { display: none; }
    .win-sk-nav-btn   { width: 70px; height: 32px; }
    #win-sk-hero      { height: 150px; margin: 10px 12px; }
    #win-sk-grid      { gap: 8px; padding: 0 12px 16px; }
    .win-sk-card      { height: 90px; }
  }

  /* =====================================================
     GAME-CARD LOGIN BUTTON SKELETON
     Shown while the button is being positioned.
     ===================================================== */
  .win-custom-game-login-btn.win-btn-skeleton {
    background: linear-gradient(90deg, #1a2a1a 25%, #2a3d2a 50%, #1a2a1a 75%) !important;
    background-size: 400px 100% !important;
    animation: win-shimmer 1.2s ease-in-out infinite !important;
    color: transparent !important;
    pointer-events: none !important;
    cursor: default !important;
  }
  .win-custom-game-login-btn {
    /* existing transition extended for skeleton→ready */
    transition: background 0.3s ease, color 0.3s ease, transform 0.12s ease !important;
  }

  #win-custom-topbar {
    position: absolute;
    top: 10px;
    right: 20px;
    z-index: 2147483646 !important;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 3px 6px;
    box-sizing: border-box;
    background: #141415 !important;
    border: none !important;
    border-radius: 12px;
    box-shadow: none !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    pointer-events: auto;
  }
  .win-top-btn {
    border: none !important;
    border-radius: 10px;
    height: 40px;
    padding: 0 22px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 0.15s ease;
    line-height: 1;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }
  .win-top-btn:active { transform: scale(0.97); }
  #win-top-login-btn {
    background: #232328 !important;
    color: #ffffff !important;
    border: none !important;
  }
  #win-top-login-btn:hover { background: #2f2f36 !important; }
  #win-top-register-btn {
    background: #00b843 !important;
    color: #ffffff !important;
    border: none !important;
  }
  #win-top-register-btn:hover {
    background: #02d45e !important;
  }

  @media (max-width: 1024px) {
    #win-custom-topbar {
      top: 8px;
      right: 14px;
      gap: 7px;
    }
    .win-top-btn {
      height: 38px;
      padding: 0 18px;
      font-size: 13.5px;
      border-radius: 9px;
    }
  }

  @media (max-width: 768px) {
    #win-custom-topbar {
      top: 7px;
      right: 10px;
      gap: 6px;
      padding: 2px 4px;
    }
    .win-top-btn {
      height: 36px;
      padding: 0 15px;
      font-size: 13px;
      border-radius: 8px;
    }
  }

  @media (max-width: 420px) {
    #win-custom-topbar {
      top: 6px;
      right: 6px;
      gap: 5px;
      padding: 2px 3px;
    }
    .win-top-btn {
      height: 34px;
      padding: 0 12px;
      font-size: 12px;
      border-radius: 7px;
    }
  }

  .win-custom-game-login-btn {
    position: fixed;
    z-index: 2147483640;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #00b843;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.01em;
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s ease, transform 0.12s ease;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .win-custom-game-login-btn:hover {
    background: #02d45e;
  }
  .win-custom-game-login-btn:active {
    transform: scale(0.98);
  }

  #win-bank-tab-overlay {
    position: fixed;
    inset: 0;
    z-index: 2147483647 !important;
    background: rgba(10, 10, 12, 0.78);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.22s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }
  #win-bank-tab-overlay.is-open {
    opacity: 1;
    pointer-events: auto;
  }
  #win-bank-tab-card {
    width: 100%;
    max-width: 460px;
    max-height: 92vh;
    overflow-y: auto;
    background: #141415 !important;
    border: none !important;
    border-radius: 20px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.85);
    color: #ffffff;
    transform: translateY(16px) scale(0.97);
    transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }
  #win-bank-tab-overlay.is-open #win-bank-tab-card {
    transform: translateY(0) scale(1);
  }
  @media (max-width: 520px) {
    #win-bank-tab-overlay {
      padding: 10px;
      align-items: flex-end;
    }
    #win-bank-tab-card {
      max-width: 100%;
      border-radius: 18px 18px 14px 14px;
    }
  }
  .win-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }
  .win-modal-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 16px;
    color: #fff;
  }
  .win-modal-brand-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #00c44d;
    box-shadow: 0 0 10px #00c44d;
  }
  .win-modal-close {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    border: none;
    background: rgba(255, 255, 255, 0.07);
    color: #a6adc8;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s, color 0.15s;
  }
  .win-modal-close:hover {
    background: rgba(255, 255, 255, 0.14);
    color: #fff;
  }
  .win-bank-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin: 16px 20px 0;
    padding: 4px;
    background: #0d0f18;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
  .win-bank-tab {
    border: none;
    background: transparent;
    color: #8c92a8;
    padding: 10px 12px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .win-bank-tab.is-active {
    background: #23273a;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }
  .win-modal-body {
    padding: 18px 20px 22px;
  }
  .win-subtabs {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }
  .win-subtab {
    flex: 1;
    padding: 8px;
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: #1b1f30;
    color: #9ba1b8;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .win-subtab.is-active {
    border-color: #0088cc;
    background: rgba(0, 136, 204, 0.15);
    color: #ffffff;
  }
  .win-field {
    margin-bottom: 12px;
  }
  .win-field label {
    display: block;
    font-size: 12px;
    color: #9ba1b8;
    margin-bottom: 6px;
    font-weight: 500;
  }
  .win-input-wrap {
    display: flex;
    align-items: center;
    background: #0e1019;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    padding: 0 12px;
    height: 44px;
    transition: border-color 0.15s;
  }
  .win-input-wrap:focus-within {
    border-color: #00c44d;
  }
  .win-prefix {
    color: #d1d5e6;
    font-size: 13.5px;
    font-weight: 600;
    padding-right: 10px;
    margin-right: 10px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    white-space: nowrap;
  }
  .win-input-wrap input,
  .win-input-wrap select {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 14px;
  }
  .win-input-wrap select option {
    background: #141724;
    color: #ffffff;
  }
  .win-eye-btn {
    background: none;
    border: none;
    color: #8c92a8;
    cursor: pointer;
    font-size: 12px;
    padding: 4px 6px;
  }
  .win-submit-btn {
    width: 100%;
    height: 46px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #00c44d 0%, #009f3c 100%);
    color: #ffffff;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    margin-top: 6px;
    box-shadow: 0 6px 20px rgba(0, 184, 67, 0.3);
    transition: transform 0.1s, filter 0.15s;
  }
  .win-submit-btn:hover { filter: brightness(1.06); }
  .win-submit-btn:active { transform: scale(0.985); }
  .win-promo-toggle {
    background: none;
    border: none;
    color: #38bdf8;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    margin-bottom: 10px;
  }
  .win-terms {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    color: #8c92a8;
    margin: 10px 0 12px;
  }
  .win-terms input {
    margin-top: 2px;
    accent-color: #00c44d;
  }
  .win-status-msg {
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 12.5px;
    display: none;
  }
  .win-status-msg.is-success {
    display: block;
    background: rgba(0, 196, 77, 0.14);
    border: 1px solid rgba(0, 196, 77, 0.35);
    color: #6ee7a0;
  }
  .win-status-msg.is-error {
    display: block;
    background: rgba(239, 68, 68, 0.14);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5;
  }
  .win-footer-switch {
    text-align: center;
    margin-top: 14px;
    font-size: 13px;
    color: #8c92a8;
  }
  .win-footer-switch button {
    background: none;
    border: none;
    color: #38bdf8;
    font-weight: 600;
    cursor: pointer;
    padding: 0 4px;
  }
</style>

<!-- PAGE LOAD SKELETON -->
<div id="win-page-skeleton" aria-hidden="true" role="presentation">
  <div id="win-sk-nav">
    <div class="win-sk-block win-sk-logo"></div>
    <div class="win-sk-nav-links">
      <div class="win-sk-block win-sk-nav-link"></div>
      <div class="win-sk-block win-sk-nav-link"></div>
      <div class="win-sk-block win-sk-nav-link"></div>
      <div class="win-sk-block win-sk-nav-link"></div>
    </div>
    <div class="win-sk-nav-btns">
      <div class="win-sk-block win-sk-nav-btn"></div>
      <div class="win-sk-block win-sk-nav-btn"></div>
    </div>
  </div>
  <div class="win-sk-block" id="win-sk-hero"></div>
  <div id="win-sk-grid">
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
    <div class="win-sk-block win-sk-card"></div>
  </div>
</div>

<div id="win-custom-topbar">
  <button type="button" id="win-top-login-btn" class="win-top-btn">Login</button>
  <button type="button" id="win-top-register-btn" class="win-top-btn">Register</button>
</div>

<div id="win-bank-tab-overlay" aria-hidden="true">
  <div id="win-bank-tab-card" role="dialog" aria-modal="true">
    <div class="win-modal-header">
      <div class="win-modal-brand">
        <span class="win-modal-brand-dot"></span>
        <span>Account Access</span>
      </div>
      <button type="button" class="win-modal-close" id="win-modal-close-btn" aria-label="Close">&times;</button>
    </div>

    <div class="win-bank-tabs">
      <button type="button" class="win-bank-tab is-active" data-bank-tab="login">Login</button>
      <button type="button" class="win-bank-tab" data-bank-tab="register">Register</button>
    </div>

    <div class="win-modal-body">
      <!-- LOGIN PANEL -->
      <form id="win-panel-login">
        <div class="win-subtabs">
          <button type="button" class="win-subtab is-active" data-login-mode="phone">Phone</button>
          <button type="button" class="win-subtab" data-login-mode="email">Email</button>
        </div>
        <div class="win-field" id="win-login-phone-wrap">
          <label for="win-login-phone">Phone Number</label>
          <div class="win-input-wrap">
            <span class="win-prefix">🇮🇳 +91</span>
            <input id="win-login-phone" type="tel" placeholder="98765 43210" autocomplete="tel" />
          </div>
        </div>
        <div class="win-field" id="win-login-email-wrap" style="display:none;">
          <label for="win-login-email">Email</label>
          <div class="win-input-wrap">
            <input id="win-login-email" type="email" placeholder="you@example.com" autocomplete="email" />
          </div>
        </div>
        <div class="win-field">
          <label for="win-login-pass">Password</label>
          <div class="win-input-wrap">
            <input id="win-login-pass" type="password" placeholder="Enter password" autocomplete="current-password" />
            <button type="button" class="win-eye-btn" data-toggle-pass="win-login-pass">Show</button>
          </div>
        </div>
        <button type="submit" class="win-submit-btn">Log In</button>
        <div id="win-login-status" class="win-status-msg"></div>
        <div class="win-footer-switch">
          Don&apos;t have an account? <button type="button" data-switch-tab="register">Register</button>
        </div>
      </form>

      <!-- REGISTER PANEL -->
      <form id="win-panel-register" style="display:none;">
        <div class="win-field">
          <label for="win-reg-currency">Currency</label>
          <div class="win-input-wrap">
            <select id="win-reg-currency">
              <option value="INR">🇮🇳 INR (₹) — Indian Rupee</option>
              <option value="USD">🇺🇸 USD ($) — US Dollar</option>
              <option value="EUR">🇪🇺 EUR (€) — Euro</option>
            </select>
          </div>
        </div>
        <div class="win-field">
          <label for="win-reg-phone">Phone Number</label>
          <div class="win-input-wrap">
            <span class="win-prefix">🇮🇳 +91</span>
            <input id="win-reg-phone" type="tel" placeholder="98765 43210" autocomplete="tel" />
          </div>
        </div>
        <div class="win-field">
          <label for="win-reg-email">Email</label>
          <div class="win-input-wrap">
            <input id="win-reg-email" type="email" placeholder="you@example.com" autocomplete="email" />
          </div>
        </div>
        <div class="win-field">
          <label for="win-reg-pass">Password</label>
          <div class="win-input-wrap">
            <input id="win-reg-pass" type="password" placeholder="Create password" autocomplete="new-password" />
            <button type="button" class="win-eye-btn" data-toggle-pass="win-reg-pass">Show</button>
          </div>
        </div>
        <button type="button" class="win-promo-toggle" id="win-promo-toggle">+ Add promo code</button>
        <div class="win-field" id="win-promo-wrap" style="display:none;">
          <div class="win-input-wrap">
            <input id="win-reg-promo" type="text" placeholder="Enter promo code" />
          </div>
        </div>
        <label class="win-terms">
          <input type="checkbox" id="win-reg-terms" checked />
          <span>I agree to the User Agreement and confirm I am 18+ years old.</span>
        </label>
        <button type="submit" class="win-submit-btn">Register</button>
        <div id="win-reg-status" class="win-status-msg"></div>
        <div class="win-footer-switch">
          Already have an account? <button type="button" data-switch-tab="login">Login</button>
        </div>
      </form>
    </div>
  </div>
</div>

<script>
(function() {
  function initWinAuthUI() {
    var overlay = document.getElementById('win-bank-tab-overlay');
    var topLoginBtn = document.getElementById('win-top-login-btn');
    var topRegBtn = document.getElementById('win-top-register-btn');
    var closeBtn = document.getElementById('win-modal-close-btn');
    var loginForm = document.getElementById('win-panel-login');
    var regForm = document.getElementById('win-panel-register');
    var bankTabs = document.querySelectorAll('[data-bank-tab]');
    var loginSubtabs = document.querySelectorAll('[data-login-mode]');
    var promoToggle = document.getElementById('win-promo-toggle');
    var promoWrap = document.getElementById('win-promo-wrap');
    if (!overlay || !topLoginBtn || !topRegBtn) return;

    var topBar = document.getElementById('win-custom-topbar');

    function isGameCardLoginBtn(el) {
      if (!el) return false;
      if (el.getAttribute('data-testid') === 'game-play-card-auth-button') return true;
      var rect = el.getBoundingClientRect();
      if (rect.top <= 120 || rect.width <= 0 || rect.height <= 0) return false;
      var txt = (el.textContent || '').trim().toLowerCase();
      if (txt !== 'log in' && txt !== 'login') return false;
      var parent = el.parentElement;
      for (var d = 0; d < 6 && parent; d++, parent = parent.parentElement) {
        var cls = (parent.className || '').toLowerCase();
        if (cls.indexOf('card') !== -1 || cls.indexOf('play') !== -1 || cls.indexOf('game') !== -1 || cls.indexOf('buttons') !== -1) return true;
      }
      return false;
    }

    function alignWithNativeAuth() {
      if (!topBar) return;
      var buttons = Array.from(document.querySelectorAll('button, a, div[role="button"]'));
      var nativeAuth = buttons.filter(function(el) {
        if (el.closest('#win-custom-topbar') || el.closest('#win-bank-tab-overlay')) return false;
        if (el.classList.contains('win-custom-game-login-btn')) return false;
        if (isGameCardLoginBtn(el)) return false;
        var rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.top > 160) return false;
        var txt = (el.textContent || '').trim().toLowerCase();
        return txt === 'log in' || txt === 'login' || txt === 'registration' || txt === 'register';
      });

      if (nativeAuth.length > 0) {
        var loginEl = nativeAuth.find(function(el) {
          var t = (el.textContent || '').trim().toLowerCase();
          return t === 'log in' || t === 'login';
        }) || nativeAuth[0];

        var regEl = nativeAuth.find(function(el) {
          var t = (el.textContent || '').trim().toLowerCase();
          return t === 'registration' || t === 'register';
        }) || nativeAuth[nativeAuth.length - 1];

        var lRect = loginEl.getBoundingClientRect();
        var rRect = regEl.getBoundingClientRect();
        var docTop = Math.min(lRect.top, rRect.top) + (window.pageYOffset || document.documentElement.scrollTop || 0);
        var maxRight = Math.max(lRect.right, rRect.right);
        var rDist = window.innerWidth - maxRight;

        if (docTop >= 0 && docTop < 160 && rDist >= 0 && rDist < window.innerWidth) {
          topBar.style.top = Math.max(2, Math.round(docTop)) + 'px';
          topBar.style.right = Math.max(2, Math.round(rDist)) + 'px';
        }

        nativeAuth.forEach(function(el) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
        });
      }
    }

    alignWithNativeAuth();
    window.addEventListener('resize', alignWithNativeAuth);
    try {
      var obs = new MutationObserver(alignWithNativeAuth);
      obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (e) {}

    var loginMode = 'phone';

    function switchBankTab(tab) {
      bankTabs.forEach(function(btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-bank-tab') === tab);
      });
      if (tab === 'login') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
      } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
      }
    }

    function openBankTab(tab) {
      switchBankTab(tab);
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }

    function closeBankTab() {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    topLoginBtn.addEventListener('click', function() { openBankTab('login'); });
    topRegBtn.addEventListener('click', function() { openBankTab('register'); });
    closeBtn.addEventListener('click', closeBankTab);

    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeBankTab();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeBankTab();
      }
    });

    bankTabs.forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchBankTab(btn.getAttribute('data-bank-tab'));
      });
    });

    document.querySelectorAll('[data-switch-tab]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        switchBankTab(btn.getAttribute('data-switch-tab'));
      });
    });

    loginSubtabs.forEach(function(btn) {
      btn.addEventListener('click', function() {
        loginMode = btn.getAttribute('data-login-mode');
        loginSubtabs.forEach(function(b) {
          b.classList.toggle('is-active', b === btn);
        });
        document.getElementById('win-login-phone-wrap').style.display = loginMode === 'phone' ? 'block' : 'none';
        document.getElementById('win-login-email-wrap').style.display = loginMode === 'email' ? 'block' : 'none';
      });
    });

    document.querySelectorAll('[data-toggle-pass]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var input = document.getElementById(btn.getAttribute('data-toggle-pass'));
        if (!input) return;
        var isPwd = input.type === 'password';
        input.type = isPwd ? 'text' : 'password';
        btn.textContent = isPwd ? 'Hide' : 'Show';
      });
    });

    if (promoToggle && promoWrap) {
      promoToggle.addEventListener('click', function() {
        var isHidden = promoWrap.style.display === 'none';
        promoWrap.style.display = isHidden ? 'block' : 'none';
        promoToggle.textContent = isHidden ? '- Hide promo code' : '+ Add promo code';
      });
    }

    function showStatus(elId, msg, isError) {
      var el = document.getElementById(elId);
      if (!el) return;
      el.textContent = msg;
      el.className = 'win-status-msg ' + (isError ? 'is-error' : 'is-success');
    }

    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var idVal = loginMode === 'phone'
        ? document.getElementById('win-login-phone').value.trim()
        : document.getElementById('win-login-email').value.trim();
      var passVal = document.getElementById('win-login-pass').value;
      if (!idVal || !passVal) {
        showStatus('win-login-status', 'Please enter your ' + loginMode + ' and password.', true);
        return;
      }
      showStatus('win-login-status', 'Signed in successfully on this page.', false);
    });

    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var phone = document.getElementById('win-reg-phone').value.trim();
      var email = document.getElementById('win-reg-email').value.trim();
      var pass = document.getElementById('win-reg-pass').value;
      var terms = document.getElementById('win-reg-terms').checked;
      if ((!phone && !email) || !pass) {
        showStatus('win-reg-status', 'Please enter phone or email and a password.', true);
        return;
      }
      if (!terms) {
        showStatus('win-reg-status', 'Please accept the User Agreement to continue.', true);
        return;
      }
      showStatus('win-reg-status', 'Registration completed in this page.', false);
    });

    function handleCustomGameLoginTrigger(e) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') {
        e.stopImmediatePropagation();
      }
      openBankTab('login');
    }

    function isExcludedButton(el) {
      if (!el) return true;
      if (el.id === 'win-top-login-btn' || el.id === 'win-top-register-btn') return true;
      if (el.closest('#win-custom-topbar') || el.closest('#win-bank-tab-overlay')) return true;
      if (el.classList.contains('win-custom-game-login-btn')) return true;
      return false;
    }

    var gameLoginOverlays = [];

    function findGameLoginTargets() {
      var targets = [];
      var seen = new Set();

      // Primary: data-testid selector used by 1win for all game types
      document.querySelectorAll('[data-testid="game-play-card-auth-button"]').forEach(function(el) {
        if (!isExcludedButton(el) && !seen.has(el)) {
          seen.add(el);
          targets.push(el);
        }
      });

      // Fallback: any login button in page body below the header (top > 120px)
      if (targets.length === 0) {
        Array.from(document.querySelectorAll('button, [role="button"]')).forEach(function(btn) {
          if (isExcludedButton(btn) || seen.has(btn)) return;
          var rect = btn.getBoundingClientRect();
          if (rect.top <= 120 || rect.width <= 0 || rect.height <= 0) return;
          var rawText = (btn.textContent || '').trim().toLowerCase();
          if (rawText === 'log in' || rawText === 'login') {
            seen.add(btn);
            targets.push(btn);
          }
        });
      }

      return targets;
    }

    function createCustomGameLoginBtn() {
      var customBtn = document.createElement('button');
      customBtn.type = 'button';
      customBtn.setAttribute('aria-label', 'Log in');
      customBtn.className = 'win-custom-game-login-btn win-btn-skeleton';
      customBtn.textContent = 'Log in';
      customBtn.addEventListener('click', handleCustomGameLoginTrigger);
      customBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          handleCustomGameLoginTrigger(e);
        }
      });
      return customBtn;
    }

    function syncGameLoginButtons() {
      var targets = findGameLoginTargets().filter(function(btn) {
        var r = btn.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });

      // Grow overlay pool as needed
      while (gameLoginOverlays.length < targets.length) {
        var overlayBtn = createCustomGameLoginBtn();
        document.body.appendChild(overlayBtn);
        gameLoginOverlays.push(overlayBtn);
      }

      for (var i = 0; i < gameLoginOverlays.length; i++) {
        var customBtn = gameLoginOverlays[i];
        if (i >= targets.length) {
          customBtn.style.display = 'none';
          continue;
        }

        var target = targets[i];
        // Intercept native button click without hiding it
        if (!target.dataset.winCustomBound) {
          target.dataset.winCustomBound = '1';
          target.addEventListener('click', handleCustomGameLoginTrigger, true);
        }

        var rect = target.getBoundingClientRect();
        var cs = window.getComputedStyle(target);
        // Try to read border-radius from the visual child (1win wraps in a <div class="base_view-...">)
        var viewChild = target.firstElementChild;
        var viewCs = viewChild ? window.getComputedStyle(viewChild) : cs;
        var radius = viewCs.borderRadius && viewCs.borderRadius !== '0px' ? viewCs.borderRadius : (cs.borderRadius && cs.borderRadius !== '0px' ? cs.borderRadius : '8px');

        customBtn.style.display = 'flex';
        customBtn.style.top = (rect.top + window.scrollY) + 'px';
        customBtn.style.left = (rect.left + window.scrollX) + 'px';
        customBtn.style.width = rect.width + 'px';
        customBtn.style.height = rect.height + 'px';
        customBtn.style.borderRadius = radius;
        customBtn.style.fontSize = viewCs.fontSize || cs.fontSize || '14px';
        customBtn.style.fontFamily = cs.fontFamily || 'inherit';
        // once the button is correctly positioned, remove the skeleton shimmer
        customBtn.classList.remove('win-btn-skeleton');

      }
    }

    syncGameLoginButtons();

    window.addEventListener('resize', syncGameLoginButtons);
    window.addEventListener('scroll', syncGameLoginButtons, true);

    var gameBtnObserver = new MutationObserver(function() {
      syncGameLoginButtons();
    });
    if (document.body) {
      gameBtnObserver.observe(document.body, { childList: true, subtree: true, attributes: true });
    }
    setInterval(syncGameLoginButtons, 300);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWinAuthUI);
  } else {
    initWinAuthUI();
  }

  /* ── Page-load skeleton dismiss ───────────────────────────────────── */
  (function() {
    var sk = document.getElementById('win-page-skeleton');
    if (!sk) return;

    function hideSkeleton() {
      sk.classList.add('win-skeleton-hidden');
      // fully remove from DOM after transition so it never blocks anything
      sk.addEventListener('transitionend', function() {
        if (sk.parentNode) sk.parentNode.removeChild(sk);
      }, { once: true });
    }

    // Hide as soon as the page is interactive (DOMContentLoaded),
    // then guarantee removal at window load.
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        // small delay so the first frame of real content paints first
        setTimeout(hideSkeleton, 120);
      });
    } else {
      setTimeout(hideSkeleton, 80);
    }

    // Absolute safety net – always gone within 6 s even if JS stalls
    setTimeout(hideSkeleton, 6000);
  })();
})();
</script>
`;

        if (body.includes('</body>')) {
          body = body.replace('</body>', authOverlay + '</body>');
        } else {
          body += authOverlay;
        }

        res.end(body);
      });
    } else {
      for (const [k, v] of Object.entries(resHeaders)) {
        res.setHeader(k, v);
      }
      proxyRes.pipe(res);
    }
  });

  proxyReq.on('error', (err) => {
    console.warn('Proxy Request Error:', err.message);
    if (!res.headersSent) {
      res.statusCode = 502;
      res.end('Bad Gateway: ' + err.message);
    }
  });

  req.pipe(proxyReq);
});

// WebSocket support with complete error guards
server.on('upgrade', (req, socket, _head) => {
  socket.on('error', (err) => console.warn('[WS Client Socket Error]', err.message));

  const targetUrl = new URL(req.url, TARGET_ORIGIN);
  const proxyReq = https.request(targetUrl, {
    method: req.method,
    headers: {
      ...req.headers,
      host: TARGET_HOST,
      origin: TARGET_ORIGIN,
      'accept-language': 'en-001,en-US;q=0.9,en;q=0.8',
      'x-country': 'IN'
    },
    agent
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    proxySocket.on('error', (err) => {
      console.warn('[WS Upstream Socket Error]', err.message);
      socket.destroy();
    });

    socket.write(`HTTP/1.1 101 Switching Protocols\r\n` +
      Object.entries(proxyRes.headers).map(([k, v]) => `${k}: ${v}`).join('\r\n') +
      '\r\n\r\n');
    if (proxyHead && proxyHead.length) socket.write(proxyHead);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', (err) => {
    console.warn('[WS ProxyReq Error]', err.message);
    socket.destroy();
  });

  proxyReq.end();
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Reverse Proxy] 1win.in (en-001 English, resilient) running on http://0.0.0.0:${PORT}`);
});
