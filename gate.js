// DDT Gate — failsafe mode (Railway outage)
// Collects email and name, passes through immediately
(function() {
  'use strict';
  const SESSION_KEY = 'ddt_gate_passed';
  if (sessionStorage.getItem(SESSION_KEY)) return;

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400&display=swap');
    #ddt-gate-overlay{position:fixed;inset:0;z-index:9999;background:#1A1915;display:flex;align-items:center;justify-content:center;font-family:'DM Sans',sans-serif;padding:24px;overflow:hidden}
    #ddt-gate-bg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;overflow:hidden}
    .g-ring{position:absolute;border-radius:50%}
    .g-ring:nth-child(1){width:560px;height:560px;border:1px solid rgba(201,169,110,.12);animation:gRot 18s linear infinite}
    .g-ring:nth-child(2){width:440px;height:440px;border:1px solid rgba(123,158,135,.1);animation:gRot 24s linear infinite reverse}
    .g-ring:nth-child(3){width:320px;height:320px;border:1px solid rgba(201,169,110,.07);animation:gRot 14s linear infinite}
    .g-bg-c{display:flex;flex-direction:column;align-items:center;gap:14px}
    .g-bg-ddt{font-family:'Cormorant Garamond',serif;font-size:120px;font-weight:300;color:rgba(201,169,110,.07);letter-spacing:.12em;line-height:1;user-select:none}
    .g-bg-thesis{font-family:'Cormorant Garamond',serif;font-size:18px;font-style:italic;color:rgba(240,237,230,.06);user-select:none}
    .g-bg-prims{position:absolute;top:12%;left:50%;transform:translateX(-50%);display:flex;gap:10px}
    .g-bg-prim{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:8px;padding:7px 13px;font-family:'DM Mono',monospace;font-size:10px;color:rgba(240,237,230,.15);white-space:nowrap}
    .g-bg-ips{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);display:inline-flex;align-items:center;gap:9px;background:rgba(255,255,255,.03);border:1px solid rgba(123,158,135,.15);border-radius:100px;padding:7px 16px;font-size:11px;color:rgba(240,237,230,.3);font-family:'DM Mono',monospace;white-space:nowrap}
    .g-ips-dot{width:7px;height:7px;border-radius:50%;background:#7B9E87;animation:gPulse 2s infinite;flex-shrink:0}
    #ddt-gate-modal{position:relative;z-index:2;background:rgba(26,25,21,.85);backdrop-filter:blur(24px);border:1px solid rgba(201,169,110,.18);border-radius:18px;padding:44px 40px;max-width:420px;width:100%;text-align:center;box-shadow:0 32px 80px rgba(0,0,0,.5);animation:gFade .5s .15s both}
    .g-logo{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:500;color:rgba(240,237,230,.9);margin-bottom:26px;letter-spacing:.02em}
    .g-logo span{color:#7B9E87}
    .g-eye{font-size:10px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#C9A96E;margin-bottom:10px}
    .g-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;line-height:1.2;color:rgba(240,237,230,.92);margin-bottom:10px}
    .g-title em{font-style:italic;color:#C9A96E}
    .g-sub{font-size:13px;font-weight:300;color:rgba(240,237,230,.4);line-height:1.7;margin-bottom:24px}
    #ddt-gate-modal input{width:100%;padding:12px 15px;border:1px solid rgba(255,255,255,.12);border-radius:10px;font-size:14px;font-family:'DM Sans',sans-serif;color:rgba(240,237,230,.9);background:rgba(255,255,255,.06);margin-bottom:9px;box-sizing:border-box;outline:none;transition:border-color .2s}
    #ddt-gate-modal input::placeholder{color:rgba(240,237,230,.25)}
    #ddt-gate-modal input:focus{border-color:#7B9E87}
    #ddt-gate-modal button{width:100%;padding:13px;background:#C9A96E;color:#1A1915;border:none;border-radius:100px;font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;margin-top:4px}
    #ddt-gate-modal button:hover{background:#A8843A}
    .g-err{font-size:12px;color:#C0392B;margin-top:6px;min-height:16px}
    .g-legal{font-size:11px;color:rgba(240,237,230,.2);margin-top:14px;line-height:1.6}
    .g-prov{font-family:'DM Mono',monospace;font-size:9px;color:rgba(201,169,110,.3);margin-top:12px;letter-spacing:.06em}
    @keyframes gRot{to{transform:rotate(360deg)}}
    @keyframes gPulse{0%,100%{opacity:1}50%{opacity:.4}}
    @keyframes gFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'ddt-gate-overlay';
  overlay.innerHTML = `
    <div id="ddt-gate-bg">
      <div class="g-ring"></div><div class="g-ring"></div><div class="g-ring"></div>
      <div class="g-bg-c">
        <div class="g-bg-ddt">DDT</div>
        <div class="g-bg-thesis">Provenance is not permission.</div>
      </div>
      <div class="g-bg-prims">
        <div class="g-bg-prim">Consent Receipt Object</div>
        <div class="g-bg-prim">Identity Permission State</div>
        <div class="g-bg-prim">Verification Receipt</div>
      </div>
      <div class="g-bg-ips"><div class="g-ips-dot"></div>IPS LIVE &nbsp;·&nbsp; AUTHORIZED</div>
    </div>
    <div id="ddt-gate-modal">
      <div class="g-logo">Digital Double <span>Technologies</span></div>
      <p class="g-eye">Private Preview</p>
      <h2 class="g-title">Identity, used with <em>permission.</em></h2>
      <p class="g-sub">Enter your details to continue.</p>
      <input type="email" id="g-email" placeholder="Your email address" autocomplete="email">
      <input type="text" id="g-name" placeholder="Your name">
      <button onclick="ddt_gate_go()">Continue</button>
      <p class="g-err" id="g-err"></p>
      <p class="g-legal">This is confidential pre-release material.</p>
      <p class="g-prov">This page carries a DDT Consent Receipt Object &nbsp;·&nbsp; 0bd66ac7</p>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => { const e = document.getElementById('g-email'); if(e) e.focus(); }, 300);
  overlay.addEventListener('keydown', e => { if(e.key==='Enter') ddt_gate_go(); });

  window.ddt_gate_go = function() {
    const email = (document.getElementById('g-email').value||'').trim();
    const name  = (document.getElementById('g-name').value||'').trim();
    const err   = document.getElementById('g-err');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.textContent='Please enter a valid email address.'; return; }
    if (!name) { err.textContent='Please enter your name.'; return; }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({email, name, ts: Date.now(), mode:'failsafe'}));
    // Best-effort log — never blocks entry
    try { fetch('https://ddt-core-production.up.railway.app/v1/gate/log', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,name,page:window.location.pathname,timestamp:new Date().toISOString(),user_agent:navigator.userAgent}),signal:AbortSignal.timeout(3000)}).catch(()=>{}); } catch(_){}
    const el = document.getElementById('ddt-gate-overlay');
    if(el){el.style.transition='opacity .4s';el.style.opacity='0';setTimeout(()=>el.remove(),400);}
  };
})();
