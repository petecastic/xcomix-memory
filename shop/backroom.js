/* X-Comix Holder VIP Backroom + Vault Verifier — /shop/ add-on
   Petecastic Productions LLC · READ-ONLY BY DESIGN
   - Never builds, signs, or sends a transaction. Never asks for a seed phrase or private key.
   - Only reads a PUBLIC address (wallet connect or pasted address) and asks public Solana RPC for balances.
   - Optional free signMessage (plain text, not a transaction) for the Lore Poll vote proof.
   - Works with Phantom, Solflare, Backpack (incl. Trezor/Ledger accounts imported into those wallets),
     and any Trezor Suite user via "Paste Public Address" (Suite is not a browser wallet).
   Zero dependencies. Drop in after dkorn-vip.js; exposes window.XCBACKROOM. */
(function () {
'use strict';
var DKORN = 'A1gRAicaLnYRmKQwRbQCaEEp6iYfu5q5X5gTFAPBeVk';       // Token-2022 (verified on-chain 2026-11-06)
var FOUNDER = '2gMmnUrxeRkZLA47NyKSGBs1aPFVSfEWruwyTKo7UUyH';     // Token-2022 1-of-1
var T22 = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
var TOKENKEG = 'TokenkegQfeZyiNwAJbNbGMPFXZTAMAhfwJ5MvYvA7vsBXm6';
var XCOMIX_NFTS = [FOUNDER];                                       // add future X-Comix 1-of-1 mints here
var CREATOR = '631dUrPhrXGXJJ38BQGubuCuj5s18HnpxssH8c1D8Q8C';
var RPCS = ['https://public.rpc.solanavibestation.com', 'https://solana-rpc.publicnode.com', 'https://api.mainnet-beta.solana.com'];
/* Permanent storage links. Fill ARWEAVE once the Irys upload is approved & done; until then the honest current host is shown. */
var ARWEAVE = { card: '', pfp: '', sheet: '', logo: '', metadata: '' };
var CURRENT = { card: 'https://files.catbox.moe/skx5jg.png', metadata: 'https://files.catbox.moe/2f5f31.json' };
var LOCKS = [
 ['Vault 1 · 10-Year Book Saga Lock', 'ubsQ1M34RdLFwDgydiRRTctpvYKeYCF76weWk7QfUVa'],
 ['Vault 2 · 20-Year Legacy Vault (2046)', '7G65aFzB7eK31GTuhieZArHXmw8PNf8HrSfEZE91D3RL'],
 ['Vault 3 · 30-Year Legacy Vault (2056)', '9Y7mbo36s8KXEE5sfZriHbAcye54364GBwAZTn3Y31bh'],
 ['Vault 4 · 40-Year Legacy Vault (2066)', '5UF9En4LtRkGSeDFVdMWjGDnjaHhGKYh5jpUSWRs8Aiv'],
 ['Vault 5 · 100-Year Century Vault (2126)', 'C1UmdjhMgoBL7No8CvbinBuUckjWiBXHMp5qG5ZvaZqr']
];
var POLL = { id: 'S1-villain-01', q: 'Who should be the next X-Comix villain / cameo?', opts: ['The Static Broker', 'Hollow-File Archivist', 'Mars Relay Ghost', 'Open write-in (cameo)'] };
/* Sealed Trezor Claim Codes: only SHA-256 hashes of codes ship to the browser, so codes can't be read from source.
   Real claim fulfilment (sending the NFT/collector pack) is done manually by Petecastic after review — never automatic. */
var CLAIM_HASHES = [];                                             // e.g. ['3f2a…'] — hex sha256 of 'XC-XXXX-XXXX'
var BASE = (function () { try { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/[^\/]*$/, '') : ''; } catch (e) { return ''; } })();

var st = { addr: null, via: null, dkorn: null, nfts: [], demo: false, err: null, loading: false };
function $(s, r) { return (r || document).querySelector(s); }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function isAddr(a) { return typeof a === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a); }
function short(a) { return a ? a.slice(0, 4) + '…' + a.slice(-4) : ''; }
function fmt(n) { return Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 }); }
function timeout(p, ms) { return Promise.race([p, new Promise(function (_, j) { setTimeout(function () { j(new Error('timeout')); }, ms); })]); }

function rpc(method, params) {
  if (window.DKVIP && typeof DKVIP.rpc === 'function') return DKVIP.rpc(method, params);
  var body = JSON.stringify({ jsonrpc: '2.0', id: 1, method: method, params: params }), i = 0;
  function next() {
    if (i >= RPCS.length) return Promise.reject(new Error('Public Solana RPCs are busy. Try again in a minute.'));
    var url = RPCS[i++];
    return timeout(fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body }), 9000)
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) { if (j.error) throw new Error(j.error.message || 'RPC error'); return j.result; })
      .catch(next);
  }
  return next();
}
function balanceOf(owner, mint) {
  return rpc('getTokenAccountsByOwner', [owner, { mint: mint }, { encoding: 'jsonParsed', commitment: 'confirmed' }])
    .then(function (r) { var t = 0; (r && r.value || []).forEach(function (a) { try { t += Number(a.account.data.parsed.info.tokenAmount.uiAmountString || 0); } catch (e) {} }); return t; });
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
  if (!p) { st.err = 'No Solana browser wallet found. Trezor Suite users: use "Paste Public Address" below.'; render(); return Promise.resolve(); }
  st.err = null; st.loading = true; render();
  return Promise.resolve(p[1].connect()).then(function (res) {      // connect() only shares the public key — no signing
    var a = pkOf(p[1], res); if (!isAddr(a)) throw new Error('Wallet did not share a public address.');
    return lookup(a, p[0]);
  }).catch(function (e) { st.loading = false; st.err = (e && e.message) || 'Wallet connection cancelled.'; render(); });
}
function lookup(addr, via) {
  st.addr = addr; st.via = via; st.demo = false; st.loading = true; st.err = null; render();
  return Promise.all([balanceOf(addr, DKORN)].concat(XCOMIX_NFTS.map(function (m) { return balanceOf(addr, m); })))
    .then(function (r) {
      st.dkorn = r[0]; st.nfts = XCOMIX_NFTS.filter(function (m, i) { return r[i + 1] > 0; }); st.loading = false;
      try { localStorage.setItem('xcb-last', JSON.stringify({ addr: addr, via: via, at: Date.now() })); } catch (e) {}
      render();
    }).catch(function (e) { st.loading = false; st.err = e.message; render(); });
}
function isHolder() { return st.demo || (st.dkorn > 0) || st.nfts.length > 0; }

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

/* ---------- Sealed Trezor claim code (client-side hash check only) ---------- */
function sha256hex(s) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }); }
function redeem(code) {
  var out = $('#xcbClaimOut'); code = String(code || '').trim().toUpperCase();
  if (!/^XC-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) { out.textContent = 'Codes look like XC-XXXX-XXXX (scratch-off on your Holo Claim Card).'; return; }
  if (!st.addr || st.demo) { out.textContent = 'Connect or paste YOUR OWN Trezor Solana receive address first (never a seed phrase).'; return; }
  if (!CLAIM_HASHES.length) { out.textContent = 'Sealed Trezor claims are not open yet. Keep your card — nothing is lost.'; return; }
  sha256hex(code).then(function (h) {
    out.innerHTML = CLAIM_HASHES.indexOf(h) >= 0
      ? '✅ Code recognized. Petecastic will review and send your 1-of-1 X-Comix art NFT to <b>' + esc(short(st.addr)) + '</b>. We will never DM you for a seed phrase.'
      : '❌ Code not recognized. Double-check the letters on your card.';
  });
}

/* ---------- UI ---------- */
var CSS = '.xcb-ovl{position:fixed;inset:0;z-index:60;background:#05040ce6;display:none;align-items:flex-start;justify-content:center;padding:14px;overflow:auto}.xcb-ovl.show{display:flex}' +
 '.xcb{max-width:760px;width:100%;background:#120d22;border:2px solid #ffcc33;border-radius:16px;color:#f4ecff;font:15px/1.45 system-ui,sans-serif;padding:18px;position:relative;box-shadow:0 0 40px #ffcc3355}' +
 '.xcb h2{margin:0 0 4px;color:#ffcc33;font-size:22px}.xcb h3{margin:16px 0 6px;color:#7ef3ff;font-size:16px}.xcb small,.xcb .m{color:#b8a9d9}' +
 '.xcb button,.xcb .b{background:#2a1f4a;color:#fff;border:1px solid #7ef3ff;border-radius:999px;padding:7px 13px;margin:3px;cursor:pointer;font:inherit;text-decoration:none;display:inline-block}' +
 '.xcb button.g{border-color:#ffcc33;color:#ffcc33}.xcb input{background:#0b0816;color:#fff;border:1px solid #6a5aa8;border-radius:8px;padding:7px;width:min(100%,380px);font:inherit}' +
 '.xcb .x{position:absolute;top:8px;right:10px}.xcb .card{background:#1b1433;border-radius:12px;padding:10px 12px;margin:8px 0}.xcb .lock{filter:blur(3px);pointer-events:none;user-select:none}' +
 '.xcb .xcb-trezor{border:1px solid #ffcc33;background:linear-gradient(135deg,#1b1433,#2a1d10)}.xcb .xcb-gold{color:#ffcc33}.xcb .xcb-tz-hero{display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:start}@media(max-width:520px){.xcb .xcb-tz-hero{grid-template-columns:1fr}}' +
 '.xcb .xcb-tz-box{border:2px solid #ffcc33;border-radius:10px;padding:10px 6px;text-align:center;background:radial-gradient(circle at 30% 20%,#ffe58a33,#120d22 70%);box-shadow:0 0 18px #ffcc3355;font-size:11px;line-height:1.3}.xcb .xcb-tz-box b{display:block;color:#ffcc33;font-size:15px}.xcb .xcb-tz-box i{display:block;color:#7ef3ff;margin-bottom:6px}.xcb .xcb-tz-box span{display:block;font-weight:700}.xcb .xcb-tz-box em{display:block;color:#ffcc33;margin-top:6px;font-style:normal}.xcb .xcb-steps{margin:6px 0;padding-left:20px}' +
 '.xcb .err{color:#ff8a8a}.xcb .ok{color:#8affc1}.xcb ul{margin:4px 0;padding-left:18px}';
function css() { if ($('#xcbCss')) return; var s = document.createElement('style'); s.id = 'xcbCss'; s.textContent = CSS; document.head.appendChild(s); }
function ensure() {
  css(); var o = $('#xcbOv'); if (o) return o;
  o = document.createElement('div'); o.className = 'xcb-ovl'; o.id = 'xcbOv'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', 'Holder VIP Backroom');
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
  else if (a === 'paste') { var v = ($('#xcbAddr').value || '').trim(); if (isAddr(v)) lookup(v, 'Pasted address (Trezor Suite / any wallet)'); else { st.err = 'That is not a Solana public address. NEVER paste a seed phrase anywhere.'; render(); } }
  else if (a === 'demo') { st.demo = !st.demo; render(); }
  else if (a === 'vote') vote(t.getAttribute('data-o'));
  else if (a === 'claim') redeem($('#xcbCode').value);
  else if (a === 'forget') { st = { addr: null, via: null, dkorn: null, nfts: [], demo: false, err: null, loading: false }; try { localStorage.removeItem('xcb-last'); } catch (x) {} render(); }
}
function link(u, t) { return '<a class="b" href="' + esc(u) + '" target="_blank" rel="noopener">' + t + '</a>'; }
function render() {
  var box = $('#xcbBox'); if (!box) return;
  var h = '<button class="x" data-a="close" aria-label="Close">✕</button><h2>🔐 Holder VIP Backroom</h2>' +
    '<small>Read-only. This page never asks you to sign a transaction, never moves funds, and never asks for a seed phrase. Holding is not an investment — everything here is free comic & lore perks.</small>';
  h += '<div class="card"><b>1 · Show a public address</b><br>';
  var pv = providers();
  pv.forEach(function (p) { h += '<button data-a="connect" data-w="' + esc(p[0]) + '">🔌 Connect ' + esc(p[0]) + ' (Read-Only)</button>'; });
  if (!pv.length) h += '<span class="m">No browser wallet detected. </span>';
  h += '<br><input id="xcbAddr" placeholder="…or paste your Solana PUBLIC address (Trezor Suite → Receive)" autocomplete="off" spellcheck="false"> <button data-a="paste">Check</button>' +
    ' <button data-a="demo" class="g">' + (st.demo ? '👁️ Exit Demo Preview' : '👁️ Demo Preview') + '</button>';
  if (st.loading) h += '<div class="m">Reading public Solana mainnet…</div>';
  if (st.err) h += '<div class="err">' + esc(st.err) + '</div>';
  if (st.addr && !st.demo) {
    h += '<div class="' + (isHolder() ? 'ok' : 'm') + '">Wallet ' + esc(short(st.addr)) + ' via ' + esc(st.via) + ' · $DKORN: <b>' + fmt(st.dkorn) + '</b> · X-Comix cards: <b>' + st.nfts.length + '</b>' +
      (st.nfts.indexOf(FOUNDER) >= 0 ? ' · 🏆 Founder #000 holder' : '') + (isHolder() ? ' · ✅ Backroom unlocked' : ' · Not a holder yet — free perks still below') + '</div> <button data-a="forget">Forget</button>';
  }
  if (st.demo) h += '<div class="m">Demo Preview: showing the backroom as a holder would see it. No wallet read.</div>';
  h += '</div>';
  var lock = isHolder() ? '' : ' lock';
  h += '<div class="card' + lock + '"><h3>🖼️ Printable Posters (hi-res)</h3>' +
    link(BASE + 'assets/backroom/poster-founder-000.png', 'Founder #000 Poster') + link(BASE + 'assets/backroom/poster-dkorn-crew.jpg', 'Dkorn Crew Poster') +
    '<h3>📁 Season 1 Director’s Cut Dossier</h3>' + link(BASE + 'assets/backroom/answering-line-dkorn-s1-dossier.pdf', 'The Answering Line × Dkorn — S1 Lore Dossier') +
    '<h3>🚀 Mars Game Cosmetic Unlock Pass (preview)</h3><div class="m">Cosmetic skins & lore codex only — no gameplay advantage, no token rewards, no yield.</div></div>';
  h += '<div class="card' + lock + '"><h3>🗳️ Holder Lore Poll — ' + esc(POLL.q) + '</h3><div class="m">Free signature (plain text). Not a transaction. Moves no funds.</div>';
  var mine = null; try { mine = JSON.parse(localStorage.getItem('xcb-vote-' + POLL.id)); } catch (e) {}
  POLL.opts.forEach(function (o) { h += '<button data-a="vote" data-o="' + esc(o) + '">' + (mine && mine.vote === o ? '✅ ' : '') + esc(o) + '</button>'; });
  if (mine) h += '<div class="m">Your vote: ' + esc(mine.vote) + ' · proof: ' + esc(String(mine.sig).slice(0, 24)) + '…</div>';
  h += '</div>';
  h += '<div class="card"><h3>⛓️ On-Chain Vault & Permanent Storage Proof</h3><ul>';
  LOCKS.forEach(function (l) { h += '<li>' + esc(l[0]) + ' — ' + link('https://lock.jup.ag/escrow/' + l[1], 'Jupiter Lock') + link('https://solscan.io/account/' + l[1], 'Solscan') + '</li>'; });
  h += '</ul>Founder #000: ' + link('https://solscan.io/token/' + FOUNDER, 'Solscan mint') +
    (ARWEAVE.card ? link(ARWEAVE.card, 'Permanent Arweave card') + link(ARWEAVE.metadata, 'Permanent metadata') : link(CURRENT.card, 'Card art (current host)') + ' <span class="m">Arweave permanent copy: pending approval</span>') +
    '<br>$DKORN: ' + link('https://solscan.io/token/' + DKORN, 'Solscan') + ' <span class="m">Creator wallet ' + esc(short(CREATOR)) + '</span></div>';
  h += '<div class="card xcb-trezor"><h3>📦 Sealed Trezor Vault Edition (Preview)</h3>' +
    '<div class="xcb-tz-hero"><div class="xcb-tz-box" aria-hidden="true"><b>X-COMIX</b><i>VAULT EDITION</i><span>FACTORY-SEALED<br>TREZOR SAFE 3</span><em>+ GOLDEN HOLO CLAIM CARD</em></div>' +
    '<div><b class="xcb-gold">100% Factory-Sealed Trezor Safe 3 + Scratch-Off Golden Claim Card — we never touch your seed phrase.</b>' +
    '<ol class="xcb-steps"><li>Check the Trezor packaging is sealed and untouched.</li><li>Set it up yourself in official Trezor Suite — <b>you</b> create your own recovery words. Nobody else ever sees them.</li>' +
    '<li>In Suite: add a Solana account → Receive → copy your <b>public</b> address and paste it above.</li><li>Scratch your Golden Holo Claim Card and enter the code below.</li>' +
    '<li>Petecastic reviews the claim and sends your 1-of-1 X-Comix art NFT to your own Trezor address.</li></ol>' +
    '<div class="m">Giveaways: No Purchase Necessary — buying or holding anything never improves your odds; Official Rules posted per giveaway. Bundles are a physical collectible + comic art, not an investment. ' +
    'We will never ask for your seed phrase, PIN or passphrase. Trezor is a trademark of Trezor Company s.r.o.; X-Comix is not affiliated with or endorsed by Trezor.</div>' +
    link(BASE + 'assets/backroom/answering-line-dkorn-s1-dossier.pdf', '📄 How Claim Cards Work (Dossier p.3)') + '</div></div>' +
    '<h3>🎁 Redeem Sealed Trezor Claim Code</h3>' +
    '<input id="xcbCode" placeholder="XC-XXXX-XXXX" autocomplete="off"> <button data-a="claim" class="g">Redeem</button><div id="xcbClaimOut" class="m"></div></div>';
  box.innerHTML = h;
}
function open() { ensure().classList.add('show'); document.body.style.overflow = 'hidden'; render();
  if (!st.addr) { try { var l = JSON.parse(localStorage.getItem('xcb-last')); if (l && isAddr(l.addr)) lookup(l.addr, l.via); } catch (e) {} }
  var p = (providers()[0] || [])[1];                                   // silent reconnect only if user already trusted this site
  if (!st.addr && p && p.connect) { try { Promise.resolve(p.connect({ onlyIfTrusted: true })).then(function (r) { var a = pkOf(p, r); if (isAddr(a)) lookup(a, providers()[0][0]); }).catch(function () {}); } catch (e) {} }
}
function close() { var o = $('#xcbOv'); if (o) o.classList.remove('show'); document.body.style.overflow = ''; }
function mountButton(sel) {
  var host = document.querySelector(sel || '.tbtns'); if (!host || $('#xcbBtn')) return;
  var b = document.createElement('button'); b.className = 'pill gold'; b.id = 'xcbBtn'; b.type = 'button'; b.textContent = '🔐 Holder Backroom (Read-Only)';
  b.onclick = open; host.insertBefore(b, host.children[1] || null);
}
window.XCBACKROOM = { open: open, close: close, lookup: lookup, mountButton: mountButton, state: function () { return st; }, MINTS: { DKORN: DKORN, FOUNDER: FOUNDER, T22: T22, TOKENKEG: TOKENKEG }, ARWEAVE: ARWEAVE, CLAIM_HASHES: CLAIM_HASHES };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { mountButton(); }); else mountButton();
})();
