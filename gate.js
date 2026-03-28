// DDT Site Gate — shows once per session on entry
// Only load this from index.html
(function() {
  'use strict';

  const SESSION_KEY = 'ddt_gate_passed';
  const API = 'https://ddt-core-production.up.railway.app/v1/gate/log';

  if (sessionStorage.getItem(SESSION_KEY)) return;

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

    #ddt-gate-overlay {
      position: fixed; inset: 0; z-index: 9999;
      background: #1A1915;
      display: flex; align-items: center; justify-content: center;
      font-family: 'DM Sans', sans-serif;
      padding: 24px;
      overflow: hidden;
    }

    /* ── BACKGROUND VISUAL ── */
    #ddt-gate-bg {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none;
      overflow: hidden;
    }
    .g-bg-seal {
      width: min(560px, 90vw); height: min(560px, 90vw);
      border-radius: 50%;
      border: 1px solid rgba(201,169,110,.12);
      position: absolute;
      animation: gRotate 18s linear infinite;
    }
    .g-bg-seal:nth-child(2) {
      width: min(460px, 74vw); height: min(460px, 74vw);
      border-color: rgba(123,158,135,.1);
      animation-duration: 24s; animation-direction: reverse;
    }
    .g-bg-seal:nth-child(3) {
      width: min(360px, 58vw); height: min(360px, 58vw);
      border-color: rgba(201,169,110,.08);
      animation-duration: 14s;
    }
    .g-bg-center {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
    }
    .g-bg-ddt {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(64px, 12vw, 130px);
      font-weight: 300;
      color: rgba(201,169,110,.08);
      letter-spacing: .12em;
      line-height: 1;
      user-select: none;
    }
    .g-bg-thesis {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(14px, 1.8vw, 20px);
      font-weight: 300;
      font-style: italic;
      color: rgba(240,237,230,.07);
      letter-spacing: .04em;
      text-align: center;
      max-width: 480px;
      line-height: 1.5;
      user-select: none;
    }

    /* Live IPS pill floating in background */
    .g-bg-ips {
      position: absolute;
      bottom: 10%; left: 50%; transform: translateX(-50%);
      display: inline-flex; align-items: center; gap: 9px;
      background: rgba(255,255,255,.04);
      border: 1px solid rgba(123,158,135,.18);
      border-radius: 100px;
      padding: 8px 18px 8px 12px;
      font-size: 12px;
      color: rgba(240,237,230,.35);
      font-family: 'DM Mono', monospace;
      white-space: nowrap;
      pointer-events: none;
    }
    .g-bg-ips-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: #7B9E87;
      box-shadow: 0 0 0 3px rgba(123,158,135,.18);
      animation: gPulse 2s infinite;
      flex-shrink: 0;
    }

    /* Three primitives floating above */
    .g-bg-prims {
      position: absolute;
      top: 12%; left: 50%; transform: translateX(-50%);
      display: flex; gap: 10px;
      pointer-events: none;
    }
    .g-bg-prim {
      background: rgba(255,255,255,.03);
      border: 1px solid rgba(255,255,255,.06);
      border-radius: 8px;
      padding: 8px 14px;
      font-family: 'DM Mono', monospace;
      font-size: 10px;
      color: rgba(240,237,230,.2);
      white-space: nowrap;
    }

    /* ── MODAL ── */
    #ddt-gate-modal {
      position: relative; z-index: 2;
      background: rgba(26,25,21,.82);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(201,169,110,.18);
      border-radius: 18px;
      padding: 44px 40px;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.05);
    }
    #ddt-gate-modal .g-logo {
      font-family: 'Cormorant Garamond', serif;
      font-size: 17px; font-weight: 500;
      color: rgba(240,237,230,.9);
      margin-bottom: 28px;
      letter-spacing: .02em;
    }
    #ddt-gate-modal .g-logo span { color: #7B9E87; }
    #ddt-gate-modal .g-eyebrow {
      font-size: 10px; font-weight: 500;
      letter-spacing: .18em; text-transform: uppercase;
      color: #C9A96E; margin-bottom: 10px;
    }
    #ddt-gate-modal .g-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(22px, 3.2vw, 28px);
      font-weight: 300; line-height: 1.2;
      color: rgba(240,237,230,.92);
      margin-bottom: 10px;
    }
    #ddt-gate-modal .g-title em {
      font-style: italic; color: #C9A96E;
    }
    #ddt-gate-modal .g-sub {
      font-size: 13px; font-weight: 300;
      color: rgba(240,237,230,.4);
      line-height: 1.7; margin-bottom: 26px;
    }
    #ddt-gate-modal input {
      width: 100%; padding: 12px 16px;
      border: 1px solid rgba(255,255,255,.12);
      border-radius: 10px; font-size: 14px;
      font-family: 'DM Sans', sans-serif;
      color: rgba(240,237,230,.9);
      background: rgba(255,255,255,.06);
      margin-bottom: 9px;
      box-sizing: border-box;
      transition: border-color .2s;
      outline: none;
    }
    #ddt-gate-modal input::placeholder { color: rgba(240,237,230,.25); }
    #ddt-gate-modal input:focus { border-color: #7B9E87; }
    #ddt-gate-modal button {
      width: 100%; padding: 13px;
      background: #C9A96E; color: #1A1915;
      border: none; border-radius: 100px;
      font-size: 14px; font-weight: 600;
      font-family: 'DM Sans', sans-serif;
      cursor: pointer; transition: background .2s, transform .15s;
      margin-top: 4px;
    }
    #ddt-gate-modal button:hover {
      background: #A8843A; transform: translateY(-1px);
    }
    #ddt-gate-modal button:disabled {
      background: rgba(201,169,110,.3); cursor: default; transform: none;
    }
    #ddt-gate-modal .g-err {
      font-size: 12px; color: #C0392B;
      margin-top: 8px; min-height: 16px;
    }
    #ddt-gate-modal .g-legal {
      font-size: 11px; color: rgba(240,237,230,.25);
      margin-top: 16px; line-height: 1.6;
    }
    #ddt-gate-modal .g-provenance {
      font-family: 'DM Mono', monospace;
      font-size: 9px; color: rgba(201,169,110,.35);
      margin-top: 14px; letter-spacing: .06em;
    }

    @keyframes gRotate { to { transform: rotate(360deg); } }
    @keyframes gPulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 0 3px rgba(123,158,135,.18); }
      50% { opacity: .5; box-shadow: 0 0 0 6px rgba(123,158,135,.06); }
    }
    @keyframes gFadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    #ddt-gate-modal { animation: gFadeIn .5s .15s both; }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'ddt-gate-overlay';
  overlay.innerHTML = `
    <div id="ddt-gate-bg">
      <div class="g-bg-seal"></div>
      <div class="g-bg-seal"></div>
      <div class="g-bg-seal"></div>
      <div class="g-bg-center">
        <div class="g-bg-ddt">DDT</div>
        <div class="g-bg-thesis">Provenance is not permission.</div>
      </div>
      <div class="g-bg-prims">
        <div class="g-bg-prim">Consent Receipt Object</div>
        <div class="g-bg-prim">Identity Permission State</div>
        <div class="g-bg-prim">Verification Receipt</div>
      </div>
      <div class="g-bg-ips">
        <div class="g-bg-ips-dot"></div>
        <span>IPS LIVE &nbsp;·&nbsp; AUTHORIZED</span>
      </div>
    </div>

    <div id="ddt-gate-modal">
      <div class="g-logo">Digital Double <span>Technologies</span></div>
      <p class="g-eyebrow">Private Preview</p>
      <h2 class="g-title">Identity, used with <em>permission.</em></h2>
      <p class="g-sub">Enter your details to continue. Your access is logged as part of our consent infrastructure.</p>
      <input type="email" id="g-email" placeholder="Your email address" autocomplete="email">
      <input type="text"  id="g-name"  placeholder="Your name (optional)">
      <button id="g-submit" onclick="ddt_gate_submit()">Continue</button>
      <p class="g-err" id="g-err"></p>
      <p class="g-legal">This is confidential pre-release material. Your email is stored securely and used only for access audit purposes.</p>
      <p class="g-provenance">This page carries a DDT Consent Receipt Object &nbsp;·&nbsp; 0bd66ac7</p>
    </div>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => { const el = document.getElementById('g-email'); if (el) el.focus(); }, 400);

  overlay.addEventListener('keydown', e => { if (e.key === 'Enter') ddt_gate_submit(); });

  window.ddt_gate_submit = async function() {
    const email = (document.getElementById('g-email').value || '').trim();
    const name  = (document.getElementById('g-name').value  || '').trim();
    const err   = document.getElementById('g-err');
    const btn   = document.getElementById('g-submit');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.textContent = 'Please enter a valid email address.';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Logging access...';
    err.textContent = '';

    try {
      await fetch('https://ddt-core-production.up.railway.app/v1/gate/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, name: name || null,
          page: window.location.pathname,
          referrer: document.referrer || null,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
        }),
        signal: AbortSignal.timeout(4000),
      });
    } catch (_) {}

    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email, ts: Date.now() }));
    const el = document.getElementById('ddt-gate-overlay');
    if (el) {
      el.style.transition = 'opacity .5s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 500);
    }
  };
})();
