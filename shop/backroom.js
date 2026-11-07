/* X-Comix Crew Backroom — /shop/ add-on
   Petecastic Productions LLC · READ-ONLY BY DESIGN
   - Crew poster, dossier, sky shimmer, and lore poll are open to everyone.
   - The Founder #000 poster keeps the original holder gate: $DKORN, Founder #000, or $UFD, plus Demo Preview.
   - Never builds, signs, or sends a transaction. Never asks for a seed phrase or private key.
   - An optional check reads a PUBLIC address and asks public Solana RPC for balances.
   - Optional free signMessage (plain text, not a transaction) for the Lore Poll vote proof.
   - Works with Phantom, Solflare and Backpack (incl. hardware-wallet accounts used through those wallets),
     plus a "Paste any Solana public address (read-only)" box for any wallet.
   Zero dependencies. Drop in after dkorn-vip.js; exposes window.XCBACKROOM. */
(function () {
'use strict';
var DKORN = 'A1gRAicaLnYRmKQwRbQCaEEp6iYfu5q5X5gTFAPBeVk';       // Token-2022 (verified on-chain 2026-11-06)
var FOUNDER = '2gMmnUrxeRkZLA47NyKSGBs1aPFVSfEWruwyTKo7UUyH';     // Token-2022 1-of-1
var UFD = 'eL5fUxj2J4CiQsmW85k5FG9DvuQjjUoBHoQBi2Kpump';          // classic SPL — Duster Herd Guest Pass
var T22 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
var TOKENKEG = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';     // SPL Token program
var XCOMIX_NFTS = [FOUNDER];                                       // add future X-Comix 1-of-1 mints here
var CREATOR = '631dUrPhrXGXJJ38BQGubuCuj5s18HnpxssH8c1D8Q8C';
var SALUTE = 'Independent community crossover salute by Petecastic Productions LLC for $UFD (eL5fUx…pump) holders — not affiliated with, sponsored, or endorsed by UFD Holdings LLC or @BasementRon. Free comic & art perks only; zero financial or price promises.';
var SKY_LINE = '✨ Rainbow Stardust Sky Active — Good Attracts Good · Circuit 13 Salutes the Basement';
/* Vibe Station first: mint-filtered getTokenAccountsByOwner is HTTP 200 with ACAO *. publicnode and api.mainnet-beta return HTTP 403 on anonymous indexed lookups. */
var RPCS = ['https://public.rpc.solanavibestation.com', 'https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com'];
var INDEX_BLOCK = { 'https://solana-rpc.publicnode.com': 1, 'https://api.mainnet-beta.solana.com': 1 };
/* Permanent Irys/Arweave storage — uploaded Nov 6, 2026. gateway.irys.xyz serves now; arweave.net mirrors resolve once Irys seeds to Arweave. */
var IRYS = 'https://gateway.irys.xyz/', AR = 'https://arweave.net/';
var ARWEAVE = {
 card: { label: 'Founder #000 Card', id: 'FspqroSA4CeC5E9u4UVEZ4a96vZT9o9MCmgGxqnzr5FA', ar: '3QjAw6wuc9dri0AMcoQIsr-8egwX_M--G7k-q1c1iZ0' },
 pfp: { label: '1:1 PFP', id: 'JA7L7yr71HwUNJCubL95W7i1YZNgrPWR9933ovmPPw3Q', ar: '_uwP30E1VDsdk4KVyZShw-OpLRsymlb_mJOE4_YzILM' },
 sheet: { label: 'Turnaround Sheet', id: 'HVxic1sz2G8sqy9mxc7jXjKbiSBedborupmVKgDHwjws', ar: '9SZA0-0ANiSWA5Km1Tu5jrXKrCTZxxCSDHfyUPEqPgY' },
 logo: { label: '$DKORN Logo', id: '2xTVAk9GyqELyyopKmhgxS2Z7852F1opq4KT7GoCgaSq', ar: 'HRCUL5eqQ1zuUqXdlWmn7Oeq7Ylr2TpPapoYTQ0nLMY' },
 metadata: { label: 'Founder #000 Metadata JSON', id: 'E7usJT5d7djuQwvoWgU9BwHszXzGYdvCyQyJyEHDQZJu', ar: 'wu0xLRSKQ-136u0Ff88Q9LMdPZl-l6fmfzFRqYHuAyY' }
};
var LOCKS = [
 ['Vault 1 · 10-Year Book Saga Lock', 'ubsQ1M34RdLFwDgydiRRTctpvYKeYCF76weWk7QfUVa'],
 ['Vault 2 · 20-Year Legacy Vault (2046)', '7G65aFzB7eK31GTuhieZArHXmw8PNf8HrSfEZE91D3RL'],
 ['Vault 3 · 30-Year Legacy Vault (2056)', '9Y7mbo36s8KXEE5sfZriHbAcye54364GBwAZTn3Y31bh'],
 ['Vault 4 · 40-Year Legacy Vault (2066)', '5UF9En4LtRkGSeDFVdMWjGDnjaHhGKYh5jpUSWRs8Aiv'],
 ['Vault 5 · 100-Year Century Vault (2126)', 'C1UmdjhMgoBL7No8CvbinBuUckjWiBXHMp5qG5ZvaZqr']
];
var POLL = { id: 'S1-villain-01', q: 'Who should be the next X-Comix villain / cameo?', opts: ['The Static Broker', 'Hollow-File Archivist', 'Mars Relay Ghost', 'Open write-in (cameo)'] };
var BASE = (function () { try { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, '') : ''; } catch (e) { return ''; } })();

var st = { addr: null, via: null, dkorn: null, founder: null, ufd: null, nfts: [], demo: false, sky: false, err: null, loading: false };
function $(s, r) { return (r || document).querySelector(s); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function isAddr(a) { return typeof a === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a); }
function short(a) { return a ? a.slice(0, 4) + '…' + a.slice(-4) : ''; }
function fmt(n) { return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
function timeout(p, ms) { return Promise.race([p, new Promise(function (_, j) { setTimeout(function () { j(new Error('timeout')); }, ms); })]); }

function rpc(method, params) {
  if (window.DKVIP && typeof DKVIP.rpc === 'function') return DKVIP.rpc(method, params);
  var body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params }), i = 0, indexed = method === 'getTokenAccountsByOwner' || method === 'getProgramAccounts';
  function next() {
    while (i < RPCS.length && indexed && INDEX_BLOCK[RPCS[i]]) i++;
    if (i >= RPCS.length) return Promise.reject(new Error('Public Solana RPCs are busy. Try again in a minute.'));
    var url = RPCS[i++];
    return timeout(fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body }), 9000)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) { if (j.error) throw new Error(j.error.message || 'RPC error'); return j.result; })
      .catch(next);
  }
  return next();
}
function balanceOf(owner, mint, program) {
  if (window.DKVIP && typeof DKVIP.tokenBalance === 'function') return DKVIP.tokenBalance(owner, mint, program);
  return rpc('getTokenAccountsByOwner', [owner, { mint: mint }, { encoding: 'jsonParsed', commitment: 'confirmed' }])
    .then(function (r) {
      var t = 0; (r && r.value || []).forEach(function (a) {
        try {
          var acc = a.account, info = acc.data.parsed.info;
          if (program && acc.owner !== program) return;
          t += Number(info.tokenAmount.uiAmountString || 0);
        } catch (e) {}
      });
      return t;
    });
}

/* ---------- wallets (read-only) ---------- */
function providers() {
  var w = window, out = [];
  if (w.phantom && w.phantom.solana) out.push(['Phantom', w.phantom.solana]);
  if (w.solflare && w.solflare.connect) out.push(['Solflare', w.solflare]);
  if (w.backpack && w.backpack.connect) out.push(['Backpack', w.backpack.solana || w.backpack]);
  if (!out.length && w.solana && w.solana.connect) out.push(['Solana wallet', w.solana]);
  return out;
}
function pkOf(p, res) { var k = (res && res.publicKey) || p.publicKey; return k ? (k.toBase58 ? k.toBase58() : String(k)) : null; }
function connect(name) {
  var list = providers(), p = null;
  list.forEach(function (x) { if (!p && (!name || x[0] === name)) p = x; });
  if (!p) { st.err = 'No Solana browser wallet found. Paste any Solana public address below instead (read-only).'; render(); return Promise.resolve(); }
  st.err = null; st.loading = true; render();
  return Promise.resolve(p[1].connect()).then(function (res) {      // connect() only shares the public key — no signing
    var a = pkOf(p[1], res); if (!isAddr(a)) throw new Error('Wallet did not share a public address.');
    return lookup(a, p[0]);
  }).catch(function (e) { st.loading = false; st.err = (e && e.message) || 'Wallet connection cancelled.'; render(); });
}
function lookup(addr, via) {
  st.addr = addr; st.via = via; st.demo = false; st.loading = true; st.err = null; render();
  return Promise.all([balanceOf(addr, DKORN, T22), balanceOf(addr, FOUNDER, T22), balanceOf(addr, UFD, TOKENKEG)])
    .then(function (r) {
      st.dkorn = r[0]; st.founder = r[1]; st.ufd = r[2];
      st.nfts = XCOMIX_NFTS.filter(function (m) { return m === FOUNDER ? st.founder > 0 : false; });
      st.loading = false;
      try { localStorage.setItem('xcb-last', JSON.stringify({ addr: addr, via: via, at: Date.now() })); } catch (e) {}
      render();
    }).catch(function (e) { st.loading = false; st.err = e.message; render(); });
}
function isCircuit() { return (st.dkorn > 0) || (st.founder > 0) || st.nfts.length > 0; }
function isHolder() { return st.demo || isCircuit() || (st.ufd > 0); }

/* ---------- Lore poll: free signMessage (plain text, not a transaction) ---------- */
function vote(opt) {
  var p = (providers()[0] || [])[1];
  var msg = 'X-Comix Lore Poll ' + POLL.id + '\nVote: ' + opt + '\nWallet: ' + st.addr + '\nTime: ' + new Date().toISOString() + '\nThis is a free signature. It is not a transaction and moves no funds.';
  var rec = { poll: POLL.id, vote: opt, addr: st.addr, msg: msg, sig: null };
  if (!p || !p.signMessage || st.demo) { rec.sig = st.demo ? 'demo-preview' : 'unsigned (pasted address)'; save(rec); return; }
  Promise.resolve(p.signMessage(new TextEncoder().encode(msg), 'utf8')).then(function (r) {
    var s = r && (r.signature || r); rec.sig = b58(s instanceof Uint8Array ? s : new Uint8Array(s)); save(rec);
  }).catch(function () { st.err = 'Vote signature cancelled — nothing was sent.'; render(); });
}
function save(rec) { try { localStorage.setItem('xcb-vote-' + POLL.id, JSON.stringify(rec)); } catch (e) {} render(); }
function b58(bytes) {
  var A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', d = [0], i, j, c;
  for (i = 0; i < bytes.length; i++) { for (j = 0, c = bytes[i]; j < d.length; j++) { c += d[j] << 8; d[j] = c % 58; c = (c / 58) | 0; } while (c) { d.push(c % 58); c = (c / 58) | 0; } }
  var s = ''; for (i = 0; i < bytes.length && bytes[i] === 0; i++) s += '1';
  for (i = d.length - 1; i >= 0; i--) s += A[d[i]]; return s;
}

/* ---------- UI ---------- */
var CSS = '.xcb-ovl{position:fixed;inset:0;z-index:60;background:#05040ce6;display:none;align-items:flex-start;justify-content:center;padding:14px;overflow:auto}.xcb-ovl.show{display:flex}' +
 '.xcb{max-width:760px;width:100%;background:#120d22;border:2px solid #ffcc33;border-radius:16px;color:#f4ecff;font:15px/1.45 system-ui,sans-serif;padding:18px;position:relative;box-shadow:0 0 40px #ffcc3355}' +
 '.xcb h2{margin:0 0 4px;color:#ffcc33;font-size:22px}.xcb h3{margin:16px 0 6px;color:#7ef3ff;font-size:16px}.xcb small,.xcb .m{color:#b8a9d9}' +
 '.xcb button,.xcb .b{background:#2a1f4a;color:#fff;border:1px solid #7ef3ff;border-radius:999px;padding:7px 13px;margin:3px;cursor:pointer;font:inherit;text-decoration:none;display:inline-block}' +
 '.xcb button.g{border-color:#ffcc33;color:#ffcc33}.xcb input{background:#0b0816;color:#fff;border:1px solid #6a5aa8;border-radius:8px;padding:7px;width:min(100%,380px);font:inherit}' +
 '.xcb .x{position:absolute;top:8px;right:10px}.xcb .card{background:#1b1433;border-radius:12px;padding:10px 12px;margin:8px 0}.xcb .lock{filter:blur(3px);pointer-events:none;user-select:none}' +
 '.xcb .err{color:#ff8a8a}.xcb .ok{color:#8affc1}.xcb ul{margin:4px 0;padding-left:18px}' +
 '.xcb .badge{display:block;margin:8px 0 4px;padding:8px 10px;border-radius:10px;border:2px solid #000;font-weight:800;letter-spacing:.2px;line-height:1.3}' +
 '.xcb .badge.guest{background:linear-gradient(115deg,#ffe6fb,#e7fff4 38%,#d9ecff 68%,#fff3c4);color:#24143a}' +
 '.xcb .badge.dual{background:linear-gradient(115deg,#ffd400,#7ef3ff 46%,#e7c6ff);color:#140c22}' +
 '.xcb .salute{font-size:12.5px;line-height:1.45;color:#f6e9ff;background:#241838;border:1px dashed #e7b6ff;border-radius:10px;padding:8px 10px;margin:8px 0}' +
 '.xcb .skyline{margin-top:8px;padding:8px 10px;border-radius:10px;background:#1a1030;border:1px solid #e7b6ff;color:#ffe9ff}';
function css() { if ($('#xcbCss')) return; var s = document.createElement('style'); s.id = 'xcbCss'; s.textContent = CSS; document.head.appendChild(s); }
function ensure() {
  css(); var o = $('#xcbOv'); if (o) return o;
  o = document.createElement('div'); o.className = 'xcb-ovl'; o.id = 'xcbOv'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Crew Backroom');
  o.innerHTML = '<div class="xcb" id="xcbBox"></div>'; document.body.appendChild(o);
  o.addEventListener('click', function (e) { if (e.target === o) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  o.addEventListener('click', onClick);
  return o;
}
function onClick(e) {
  var t = e.target.closest('[data-a]'); if (!t) return; var a = t.getAttribute('data-a');
  if (a === 'close') close();
  else if (a === 'connect') connect(t.getAttribute('data-w'));
  else if (a === 'paste') { var v = ($('#xcbAddr').value || '').trim(); if (isAddr(v)) lookup(v, 'Pasted public address (read-only)'); else { st.err = 'That is not a Solana public address. NEVER paste a seed phrase anywhere.'; render(); } }
  else if (a === 'demo') { st.demo = !st.demo; render(); }
  else if (a === 'sky') { st.sky = !st.sky; render(); }
  else if (a === 'vote') vote(t.getAttribute('data-o'));
  else if (a === 'forget') { st = { addr: null, via: null, dkorn: null, founder: null, ufd: null, nfts: [], demo: false, sky: false, err: null, loading: false }; try { localStorage.removeItem('xcb-last'); } catch (x) {} render(); }
}
function link(u, t) { return '<a class="b" href="' + esc(u) + '" target="_blank" rel="noopener">' + t + '</a>'; }
function syncSky() {
  ensureSky();
  var on = !!st.sky;
  document.documentElement.classList.toggle('ufd-stardust', on);
  var banner = $('#ufdSkyBanner');
  if (banner) banner.hidden = !on;
}
function ensureSky() {
  if (!$('#ufdSky')) {
    var sky = document.createElement('div');
    sky.id = 'ufdSky';
    sky.setAttribute('aria-hidden', 'true');
    sky.innerHTML = '<div class="aurora a1"></div><div class="aurora a2"></div><div class="dust"></div><div class="dust b"></div>';
    document.body.insertBefore(sky, document.body.firstChild);
  }
  if ($('#ufdSkyBanner')) return;
  var b = document.createElement('div');
  b.id = 'ufdSkyBanner';
  b.className = 'stardust-banner';
  b.setAttribute('role', 'status');
  b.hidden = true;
  b.textContent = SKY_LINE;
  var wrap = document.querySelector('.wrap'), top = document.querySelector('.top');
  if (wrap && top && top.parentNode === wrap) wrap.insertBefore(b, top.nextSibling);
  else if (wrap) wrap.insertBefore(b, wrap.firstChild);
  else document.body.appendChild(b);
}
function render() {
  var box = $('#xcbBox'); if (!box) return;
  var h = '<button class="x" data-a="close" aria-label="Close">✕</button><h2>Crew Backroom</h2>' +
    '<small>The crew poster, the Season 1 dossier, the sky shimmer, and the lore poll are open to everyone. The Founder #000 poster keeps its holder gate. The address check is optional and read-only. This page never asks you to sign a transaction, never moves funds, and never asks for a seed phrase.</small>';
  h += '<div class="card"><b>1 · Show a public address</b><br>';
  var pv = providers();
  pv.forEach(function (p) { h += '<button data-a="connect" data-w="' + esc(p[0]) + '">🔌 Connect ' + esc(p[0]) + ' (Read-Only)</button>'; });
  if (!pv.length) h += '<span class="m">No browser wallet detected. </span>';
  h += '<br><input id="xcbAddr" placeholder="Paste any Solana public address (read-only)" autocomplete="off" spellcheck="false"> <button data-a="paste">Check</button>' +
    ' <button data-a="demo" class="g">' + (st.demo ? '👁️ Exit Demo Preview' : '👁️ Demo Preview') + '</button>';
  if (st.loading) h += '<div class="m">Reading public Solana mainnet ($DKORN, Founder #000, $UFD)…</div>';
  if (st.err) h += '<div class="err">' + esc(st.err) + '</div>';
  if (st.addr && !st.demo) {
    var circuit = isCircuit(), herd = st.ufd > 0;
    h += '<div class="' + (isHolder() ? 'ok' : 'm') + '">Address ' + esc(short(st.addr)) + ' via ' + esc(st.via) +
      ' · $DKORN: <b>' + fmt(st.dkorn) + '</b> · Founder #000: <b>' + fmt(st.founder) + '</b> · $UFD: <b>' + fmt(st.ufd) + '</b>' +
      (circuit ? ' · 🏆 Circuit 13' : '') + (isHolder() ? ' · ✅ Founder #000 poster unlocked' : ' · Not a holder yet — $DKORN, Founder #000, or $UFD unlocks the Founder #000 poster') + '</div>';
    if (circuit && herd) h += '<div class="badge dual">⚡ DUAL ALLIANCE: CIRCUIT 13 × DUSTER HERD</div><div class="m">$DKORN <b>' + fmt(st.dkorn) + '</b> · Founder #000 <b>' + fmt(st.founder) + '</b> · $UFD <b>' + fmt(st.ufd) + '</b></div>';
    else if (herd) h += '<div class="badge guest">✨ DUSTER HERD GUEST PASS · ' + fmt(st.ufd) + ' $UFD</div>';
    h += ' <button data-a="forget">Forget</button>';
  }
  if (st.demo) h += '<div class="m">Demo Preview: showing the backroom as a holder would see it. No wallet read. Rainbow Stardust Sky can be toggled here.</div>';
  h += '</div>';
  var founderLock = isHolder() ? '' : ' lock';
  h += '<div class="card' + founderLock + '"><h3>🖼️ Founder #000 Poster</h3>' +
    link(BASE + 'assets/backroom/poster-founder-000.png', 'Founder #000 Poster') + '</div>';
  h += '<div class="card"><b>✨ Rainbow Stardust Sky</b><br><span class="m">Switch the shimmer off or on. It does not catch clicks.</span><br>' +
    '<button data-a="sky" class="g" aria-pressed="' + (st.sky ? 'true' : 'false') + '">' + (st.sky ? '✨ Rainbow Stardust Sky: ON' : '✨ Rainbow Stardust Sky: OFF') + '</button>';
  if (st.sky) h += '<div class="skyline">' + SKY_LINE + '</div>';
  h += '</div>';
  h += '<div class="card salute">' + esc(SALUTE) + '</div>';
  h += '<div class="card"><h3>🖼️ Printable Posters (hi-res)</h3>' +
    link(BASE + 'assets/backroom/poster-dkorn-crew.jpg', 'Dkorn Crew Poster') +
    '<h3>📁 Season 1 Director’s Cut Dossier</h3>' + link(BASE + 'assets/backroom/answering-line-dkorn-s1-dossier.pdf', 'The Answering Line × Dkorn — S1 Lore Dossier') +
    '<div class="m">Open to everyone.</div>' +
    '<h3>🚀 Mars Game Cosmetic Unlock Pass (preview)</h3><div class="m">Cosmetic skins & lore codex only — no gameplay advantage, no token rewards, no yield.</div></div>';
  h += '<div class="card"><h3>🗳️ Lore Poll — ' + esc(POLL.q) + '</h3><div class="m">Free signature (plain text). Not a transaction. Moves no funds.</div>';
  var mine = null; try { mine = JSON.parse(localStorage.getItem('xcb-vote-' + POLL.id)); } catch (e) {}
  POLL.opts.forEach(function (o) { h += '<button data-a="vote" data-o="' + esc(o) + '">' + (mine && mine.vote === o ? '✅ ' : '') + esc(o) + '</button>'; });
  if (mine) h += '<div class="m">Your vote: ' + esc(mine.vote) + ' · proof: ' + esc(String(mine.sig).slice(0, 24)) + '…</div>';
  h += '</div>';
  h += '<div class="card"><h3>⛓️ On-Chain Vault &amp; Permanent Arweave Proof</h3><ul>';
  LOCKS.forEach(function (l) { h += '<li>' + esc(l[0]) + ' — ' + link('https://solscan.io/account/' + l[1], 'Solscan') + '</li>'; });
  h += '</ul>Founder #000: ' + link('https://solscan.io/token/' + FOUNDER, 'Solscan mint') +
    '<br><b>Permanent Irys / Arweave storage</b> <span class="m">(paid once, stored permanently)</span><ul>' +
    Object.keys(ARWEAVE).map(function (k) { var a = ARWEAVE[k]; return '<li>' + esc(a.label) + ' — ' + link(IRYS + a.id, 'Irys gateway') + link(AR + a.ar, 'arweave.net mirror') + '</li>'; }).join('') + '</ul>' +
    '<br>$UFD: ' + link('https://solscan.io/token/' + UFD, 'Solscan') + ' <span class="m">Duster Herd Guest Pass · classic SPL Token</span>' +
    '<br>$DKORN: ' + link('https://solscan.io/token/' + DKORN, 'Solscan') + ' <span class="m">Creator wallet ' + esc(short(CREATOR)) + '</span></div>';
  box.innerHTML = h;
  syncSky();
}
function open() { ensure().classList.add('show'); document.body.style.overflow = 'hidden'; render();
  if (!st.addr) { try { var l = JSON.parse(localStorage.getItem('xcb-last')); if (l && isAddr(l.addr)) lookup(l.addr, l.via); } catch (e) {} }
  var p = (providers()[0] || [])[1];                                   // silent reconnect only if user already trusted this site
  if (!st.addr && p && p.connect) { try { Promise.resolve(p.connect({ onlyIfTrusted: true })).then(function (r) { var a = pkOf(p, r); if (isAddr(a)) lookup(a, providers()[0][0]); }).catch(function () {}); } catch (e) {} }
}
function close() { var o = $('#xcbOv'); if (o) o.classList.remove('show'); document.body.style.overflow = ''; }
function mountButton(sel) {
  var host = document.querySelector(sel || '.tbtns'); if (!host || $('#xcbBtn')) return;
  var b = document.createElement('button'); b.className = 'pill gold'; b.id = 'xcbBtn'; b.type = 'button'; b.textContent = '✨ Crew Backroom';
  b.onclick = open; host.insertBefore(b, host.children[1] || null);
}
window.XCBACKROOM = { open: open, close: close, lookup: lookup, mountButton: mountButton, state: function () { return st; }, setSky: function (on) { st.sky = !!on; syncSky(); render(); }, MINTS: { DKORN: DKORN, FOUNDER: FOUNDER, UFD: UFD, T22: T22, TOKENKEG: TOKENKEG }, SALUTE: SALUTE, ARWEAVE: ARWEAVE };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountButton(); }); else mountButton();
})();
