/* Dkorn VIP Pass: READ-ONLY public-address check + 10-Year Book Saga Lock proof badge.
   This file never asks a wallet to sign anything and never builds a transaction.
   It only reads a public address and asks public Solana RPC for balances. Everything is cosmetic. */
(function(){
'use strict';
var MINT='A1gRAicaLnYRmKQwRbQCaEEp6iYfu5q5X5gTFAPBeVk';
var T22='TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
var ESCROW='ubsQ1M34RdLFwDgydiRRTctpvYKeYCF76weWk7QfUVa';
var ESCROW_VAULT='9RGmTA3PVTAwWvzQZaCbfs4zJQ5qzJyDtm7XFTdfu7PR';
var LOCK_PROGRAM='LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn';
var LOCK_TX='euRKuzJnTVxaPU4SYRViW4WAb5oiiV4LcvKcJJyMuhu1bce281FeH2AoLNaXhMBtfjN3k9DPZjFY99gtqNKP2S9';
var LOCK_URL='https://lock.jup.ag/escrow/'+ESCROW;
var SERIAL='A1gR-APBeVk';
/* Public mainnet RPCs, tried in order. api.mainnet-beta.solana.com currently answers 403 to browser origins, so CORS-friendly public mirrors go first. */
var RPCS=['https://public.rpc.solanavibestation.com','https://solana-rpc.publicnode.com','https://api.mainnet-beta.solana.com'];
var ATA_PROGRAM='ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
var KEY='dkorn-vip';
function get(){try{if(window.XC)return XC.get(KEY);return JSON.parse(localStorage.getItem('xca-'+KEY))}catch(e){return null}}
function set(v){try{if(window.XC)XC.set(KEY,v);else localStorage.setItem('xca-'+KEY,JSON.stringify(v))}catch(e){}}
var subs=[];
function emit(){var s=get();document.documentElement.classList.toggle('dk-vip',!!(s&&s.verified));for(var i=0;i<subs.length;i++){try{subs[i](s)}catch(e){}}}
function isAddr(a){return typeof a==='string'&&/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(a)}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function short(a){return a?a.slice(0,4)+'…'+a.slice(-4):''}
function fmt(n){try{return Number(n).toLocaleString('en-US',{maximumFractionDigits:2})}catch(e){return String(n)}}
function withTimeout(p,ms){return new Promise(function(res,rej){var t=setTimeout(function(){rej(new Error('timeout'))},ms);p.then(function(v){clearTimeout(t);res(v)},function(e){clearTimeout(t);rej(e)})})}
var BAD={};
function rpc(method,params){
  var body=JSON.stringify({jsonrpc:'2.0',id:1,method:method,params:params});
  var i=0;
  function attempt(){
    while(i<RPCS.length&&BAD[RPCS[i]])i++;
    if(i>=RPCS.length){BAD={};return Promise.reject(new Error('All public RPC endpoints are busy right now (rate-limited). Try again in a minute.'))}
    var url=RPCS[i++];
    return withTimeout(fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:body}),9000)
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
      .then(function(j){if(j.error)throw new Error(j.error.message||'RPC error');return j.result})
      .catch(function(e){if(/HTTP 4|forbidden|token|plan/i.test(String(e&&e.message)))BAD[url]=1;return attempt()});
  }
  return attempt();
}
function dkornBalance(owner){
  return byIndex(owner).catch(function(){
    return ataFor(owner).then(function(ata){return rpc('getAccountInfo',[ata,{encoding:'jsonParsed'}])}).then(function(r){
      var v=r&&r.value,inf=v&&v.data&&v.data.parsed&&v.data.parsed.info;
      if(!v)return 0;if(!inf||inf.mint!==MINT||inf.owner!==owner)return 0;return Number(inf.tokenAmount.uiAmountString||0)});
  });
}
function byIndex(owner){
  return rpc('getTokenAccountsByOwner',[owner,{mint:MINT},{encoding:'jsonParsed'}]).then(function(res){
    var tot=0,list=(res&&res.value)||[];
    for(var k=0;k<list.length;k++){var a=list[k].account,inf=a&&a.data&&a.data.parsed&&a.data.parsed.info;
      if(inf&&inf.mint===MINT&&a.owner===T22)tot+=Number(inf.tokenAmount.uiAmountString||inf.tokenAmount.uiAmount||0)}
    return tot;
  });
}

/* ---- base58 + PDA (used only to compute a public token-account address; no keys involved) ---- */
var B58='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58dec(s){var n=BigInt(0);for(var i=0;i<s.length;i++){var k=B58.indexOf(s[i]);if(k<0)throw new Error('bad b58');n=n*BigInt(58)+BigInt(k)}var out=[];while(n>BigInt(0)){out.unshift(Number(n%BigInt(256)));n=n/BigInt(256)}for(i=0;i<s.length&&s[i]==='1';i++)out.unshift(0);while(out.length<32)out.unshift(0);return new Uint8Array(out)}
function b58enc(b){var n=BigInt(0);for(var i=0;i<b.length;i++)n=n*BigInt(256)+BigInt(b[i]);var s='';while(n>BigInt(0)){s=B58[Number(n%BigInt(58))]+s;n=n/BigInt(58)}for(i=0;i<b.length&&b[i]===0;i++)s='1'+s;return s}
function mpow(b,e,m){var r=BigInt(1);b%=m;while(e>BigInt(0)){if(e&BigInt(1))r=r*b%m;b=b*b%m;e>>=BigInt(1)}return r}
function onCurve(bytes){var P=(BigInt(1)<<BigInt(255))-BigInt(19);var y=BigInt(0);for(var i=31;i>=0;i--)y=(y<<BigInt(8))|BigInt(i===31?bytes[i]&127:bytes[i]);var sign=bytes[31]>>7;if(y>=P)return false;
  var d=(P-BigInt(121665))*mpow(BigInt(121666),P-BigInt(2),P)%P;var y2=y*y%P,u=(y2-BigInt(1)+P)%P,v=(d*y2+BigInt(1))%P;
  var v3=v*v%P*v%P,x=u*v3%P*mpow(u*v3%P*v3%P*v%P,(P-BigInt(5))/BigInt(8),P)%P;var vx2=v*x%P*x%P;
  if(vx2!==u&&vx2!==(P-u)%P)return false;if(vx2!==u)x=x*mpow(BigInt(2),(P-BigInt(1))/BigInt(4),P)%P;if(x===BigInt(0)&&sign===1)return false;return true}
function ataFor(owner){
  if(!(window.crypto&&crypto.subtle&&typeof BigInt==='function'))return Promise.reject(new Error('no crypto'));
  var seeds=[b58dec(owner),b58dec(T22),b58dec(MINT)],prog=b58dec(ATA_PROGRAM),tag=new TextEncoder().encode('ProgramDerivedAddress');
  function tryBump(bump){if(bump<0)return Promise.reject(new Error('no bump'));
    var buf=new Uint8Array(32*3+1+32+tag.length),o=0;seeds.forEach(function(s){buf.set(s,o);o+=32});buf[o++]=bump;buf.set(prog,o);o+=32;buf.set(tag,o);
    return crypto.subtle.digest('SHA-256',buf).then(function(h){h=new Uint8Array(h);return onCurve(h)?tryBump(bump-1):b58enc(h)})}
  return tryBump(255);
}
var proof=null,proofP=null;
function checkLock(){
  if(proofP)return proofP;
  proofP=Promise.all([rpc('getAccountInfo',[ESCROW,{encoding:'base64',dataSlice:{offset:0,length:0}}]),rpc('getAccountInfo',[ESCROW_VAULT,{encoding:'jsonParsed'}]).catch(function(){return null})])
   .then(function(r){var v=r[0]&&r[0].value;var pv=r[1]&&r[1].value&&r[1].value.data&&r[1].value.data.parsed&&r[1].value.data.parsed.info;var bal=pv&&pv.mint===MINT?Number(pv.tokenAmount.uiAmountString):null;
     proof={ok:!!(v&&v.owner===LOCK_PROGRAM),vault:bal};return proof})
   .catch(function(e){proof={ok:false,err:String(e.message||e)};proofP=null;return proof});
  return proofP;
}
/* ---------- UI ---------- */
var drawer=null;
function save(mode,address,balance){var s={verified:true,mode:mode,address:address||'',balance:balance||0,skin:true,ts:Date.now()};set(s);emit();return s}
function msg(t,cls){var m=drawer&&drawer.querySelector('.dkv-msg');if(m){m.className='dkv-msg '+(cls||'');m.innerHTML=t}}
function verifyAddress(addr,mode){
  addr=(addr||'').trim();
  if(!isAddr(addr)){msg('That doesn\'t look like a Solana public address (32–44 letters/numbers).','bad');return}
  msg('Reading public balance… <span class="dkv-spin"></span>');
  dkornBalance(addr).then(function(b){
    if(b>0){save(mode,addr,b);msg('✔ VIP PASS ACCEPTED for '+esc(short(addr))+'. Golden Hard-Hat HUD on. Read-only check — tokens never leave your wallet.','ok');render()}
    else msg('No $DKORN found at '+esc(short(addr))+'. No problem — every game stays 100% free. Try the collector serial for the cosmetic preview.','warn');
  },function(e){msg(esc(e.message||e),'bad')});
}
function connectPhantom(){
  var p=(window.phantom&&window.phantom.solana)||window.solana;
  if(!p||!p.connect){msg('No Phantom extension found in this browser. Paste any public address below instead — it works inside the X app too.','warn');return}
  msg('Asking Phantom for your public key only… <span class="dkv-spin"></span>');
  Promise.resolve(p.connect()).then(function(r){
    var pk=(r&&r.publicKey)||p.publicKey; var a=pk&&pk.toString();
    verifyAddress(a,'wallet');
  },function(){msg('Connection cancelled. Nothing was shared.','warn')});
}
function lockHTML(){
  var st=proof?(proof.ok?'<b class="dkv-led on"></b>ON-CHAIN ESCROW VERIFIED'+(proof.vault!=null?' · vault holds '+fmt(proof.vault)+' DKORN':''):'<b class="dkv-led off"></b>Live check unavailable (public RPC busy)'):'<b class="dkv-led wait"></b>Checking Solana mainnet…';
  return '<div class="dkv-lock"><div class="dkv-lt">🔒 Real Anti-Rug Proof: 26,000,000 DKORN Locked 2026–2036 (10-Year Book Saga)</div>'+
   '<div class="dkv-ls">'+st+'</div>'+
   '<div class="dkv-lx">Jupiter Lock · non-cancelable · 2,600,000 unlock per year, one per Book (1–10)<br>Escrow <code>'+short(ESCROW)+'</code> · <a href="'+LOCK_URL+'" target="_blank" rel="noopener">View on Jupiter Lock ↗</a> · <a href="https://solscan.io/tx/'+LOCK_TX+'" target="_blank" rel="noopener">Tx ↗</a></div></div>';
}
function render(){
  if(!drawer)return;var s=get();
  drawer.querySelector('.dkv-state').innerHTML=s&&s.verified?
   '<div class="dkv-pass">🪖 VIP PASS ACTIVE <small>'+(s.mode==='serial'?'collector serial preview':esc(short(s.address))+' · '+fmt(s.balance)+' DKORN (read-only)')+'</small></div><ul class="dkv-perks"><li>Golden Hard-Hat / Cyan Arc HUD skin</li><li>Secret Boss Wave unlocked</li><li>VIP Quarter Slot badge</li></ul><button class="dkv-b ghost" data-a="off">Remove pass from this browser</button>':
   '<div class="dkv-pass off">NO PASS INSERTED <small>Everything is free and fully playable without one.</small></div>';
  drawer.querySelector('.dkv-lockwrap').innerHTML=lockHTML();
}
function open(){
  if(!drawer){
    drawer=document.createElement('div');drawer.className='dkv-ovl';
    drawer.innerHTML='<div class="dkv-box" role="dialog" aria-label="VIP Pass"><div class="dkv-tb"><span>🎟️ Insert VIP Pass (Read-Only Check)</span><button class="dkv-x" data-a="close" aria-label="Close">✕</button></div><div class="dkv-bd">'+
     '<div class="dkv-note">Read-only check — tokens never leave your wallet. We only read a <b>public</b> address. Nothing is signed, sent, deposited or approved. The pass is purely cosmetic.</div>'+
     '<div class="dkv-state"></div>'+
     '<div class="dkv-h">1 · Phantom (public key only)</div><button class="dkv-b" data-a="phantom">Connect Phantom (Read-Only Pubkey)</button>'+
     '<div class="dkv-h">2 · Or paste any public Solana address</div><div class="dkv-row"><input class="dkv-in" id="dkvAddr" placeholder="Public wallet address" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="dkv-b" data-a="addr">Check</button></div>'+
     '<div class="dkv-h">3 · Or enter the collector serial</div><div class="dkv-row"><input class="dkv-in" id="dkvSer" placeholder="STAGE serial on any card" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="dkv-b" data-a="serial">Preview</button></div>'+
     '<div class="dkv-msg"></div><div class="dkv-lockwrap"></div>'+
     '<div class="dkv-fine">Dkorn™ · © 2026 Petecastic Productions LLC · Fan arcade &amp; comic collectible fun, not financial advice</div></div></div>';
    document.body.appendChild(drawer);
    drawer.addEventListener('click',function(e){
      if(e.target===drawer){close();return}
      var b=e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a');
      if(a==='close')close();
      else if(a==='phantom')connectPhantom();
      else if(a==='addr')verifyAddress(drawer.querySelector('#dkvAddr').value,'address');
      else if(a==='serial'){var v=drawer.querySelector('#dkvSer').value.trim().toUpperCase().replace(/^STAGE:?\s*/,'').replace(/^POLE\s*#?/,'');
        if(v===SERIAL.toUpperCase()){save('serial','',0);msg('✔ Collector serial accepted. Cosmetic VIP HUD preview is on.','ok');render()}else msg('Serial not recognized. Look for the STAGE stamp printed on every card.','warn')}
      else if(a==='off'){set(null);emit();render();msg('Pass removed.','')}
    });
  }
  drawer.classList.add('show');render();checkLock().then(render);
}
function close(){if(drawer)drawer.classList.remove('show')}
function badge(el){
  if(!el)return;
  var paint=function(){el.innerHTML='<a class="dkv-badge'+(proof&&proof.ok?' ok':'')+'" href="'+LOCK_URL+'" target="_blank" rel="noopener" title="Real Anti-Rug Proof: 26,000,000 DKORN Locked 2026–2036 (10-Year Book Saga)"><b class="dkv-led '+(proof?(proof.ok?'on':'off'):'wait')+'"></b>10-Year Saga Lock Proof<small>'+(proof&&proof.ok?'ON-CHAIN ESCROW VERIFIED':'26M DKORN · 2026–2036')+'</small></a>'};
  paint();checkLock().then(paint);
}
window.DKVIP={open:open,close:close,badge:badge,status:get,isVip:function(){var s=get();return !!(s&&s.verified)},onChange:function(f){subs.push(f)},checkLock:checkLock,
  MINT:MINT,ESCROW:ESCROW,LOCK_URL:LOCK_URL,SERIAL:SERIAL};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',emit);else emit();
})();
