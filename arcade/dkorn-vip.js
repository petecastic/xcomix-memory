/* Dkorn VIP Pass: READ-ONLY public-address check + 10-Year Book Saga Lock proof badge.
   This file never asks a wallet to sign anything and never builds a transaction.
   It only reads a public address and asks public Solana RPC for balances. Everything is cosmetic. */
(function(){
'use strict';
var MINT='A1gRAicaLnYRmKQwRbQCaEEp6iYfu5q5X5gTFAPBeVk';
var FOUNDER='2gMmnUrxeRkZLA47NyKSGBs1aPFVSfEWruwyTKo7UUyH';
var UFD='eL5fUxj2J4CiQsmW85k5FG9DvuQjjUoBHoQBi2Kpump';
var T22='TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb';
var TOKENKEG='TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
var SALUTE='Independent community crossover salute by Petecastic Productions LLC for $UFD (eL5fUx…pump) holders — not affiliated with, sponsored, or endorsed by UFD Holdings LLC or @BasementRon. Free comic & art perks only; zero financial or price promises.';
var ESCROW='ubsQ1M34RdLFwDgydiRRTctpvYKeYCF76weWk7QfUVa';
var ESCROW_VAULT='9RGmTA3PVTAwWvzQZaCbfs4zJQ5qzJyDtm7XFTdfu7PR';
var LOCK_PROGRAM='LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn';
var LOCK_TX='euRKuzJnTVxaPU4SYRViW4WAb5oiiV4LcvKcJJyMuhu1bce281FeH2AoLNaXhMBtfjN3k9DPZjFY99gtqNKP2S9';
/* All five finalized, non-cancelable Jupiter Locks (LOCK_RECEIPT.md). Facts only. */
var LOCKS=[
 {n:'Vault 1 · 10-Year Book Saga Lock',when:'2027–2036 · 2.6M per year, Books 1–10',amt:26000000,esc:ESCROW,tx:LOCK_TX},
 {n:'Vault 2 · 20-Year Legacy Vault',when:'Unlocks 2046',amt:18925456.434061,esc:'7G65aFzB7eK31GTuhieZArHXmw8PNf8HrSfEZE91D3RL',tx:'Q3VfaVxRFhaRh7EQ8iPKxRE6uZbu3ghiSBEeX5Qkf5pBrxGfuuhuwyizz1RZ4EP3iUScVRKPabgbUB5Vc3PUgXj'},
 {n:'Vault 3 · 30-Year Legacy Vault',when:'Unlocks 2056',amt:18925456.434061,esc:'9Y7mbo36s8KXEE5sfZriHbAcye54364GBwAZTn3Y31bh',tx:'vicLMyHd43Bek9p2Dp7WuFFfXMjndUEZMRGE5p6g6Wtg8EgcrGQtxzwDpCw23mjeQdLDQdj6JLdFr8HPomS357x'},
 {n:'Vault 4 · 40-Year Legacy Vault',when:'Unlocks 2066',amt:18925456.434062,esc:'5UF9En4LtRkGSeDFVdMWjGDnjaHhGKYh5jpUSWRs8Aiv',tx:'5g3xySboWTTGEi472ZhJGroer66ukwhjDqKJNRBV8fFjoWv1rxcWDvxqV5dh4GrQDrZjP8wEYw9XhrT6s1GKHwLg'},
 {n:'Vault 5 · 100-Year Century Vault (2126)',when:'Unlocks Nov 5, 2126',amt:420069,esc:'C1UmdjhMgoBL7No8CvbinBuUckjWiBXHMp5qG5ZvaZqr',tx:'62YNTcME12edRbg1WVCRaU7Y1HSuMYkESX7doYp54Tv83LscshmY45Zfnxsc9HNzLurnTaM2NbBeLrYG3fbAqJye'}
];
var LOCK_TOTAL='83,196,438.30',LOCK_THRU='2126';
var SERIAL='A1gR-APBeVk';
/* Public mainnet RPCs. Solana Vibe Station is primary: mint-filtered getTokenAccountsByOwner
   returns HTTP 200 with Access-Control-Allow-Origin: *. publicnode and api.mainnet-beta.solana.com
   return HTTP 403 on anonymous indexed getTokenAccountsByOwner, so those hosts are skipped for indexed calls.
   Non-indexed reads (getAccountInfo / getMultipleAccounts) may still try every host. */
var RPCS=['https://public.rpc.solanavibestation.com','https://solana-rpc.publicnode.com','https://api.mainnet-beta.solana.com'];
var INDEXED={getTokenAccountsByOwner:1,getProgramAccounts:1};
var INDEX_BLOCK={'https://solana-rpc.publicnode.com':1,'https://api.mainnet-beta.solana.com':1};
var BASE=(function(){try{var sc=document.currentScript&&document.currentScript.src;return sc?sc.replace(/arcade\/dkorn-vip\.js.*$/,''):''}catch(e){return ''}})();
var CLOCK_URL=BASE+'vault-clock/';
var ATA_PROGRAM='ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
var KEY='dkorn-vip';
function get(){try{if(window.XC)return XC.get(KEY);return JSON.parse(localStorage.getItem('xca-'+KEY))}catch(e){return null}}
function set(v){try{if(window.XC)XC.set(KEY,v);else localStorage.setItem('xca-'+KEY,JSON.stringify(v))}catch(e){}}
var subs=[];
function emit(){var s=get();document.documentElement.classList.toggle('dk-vip',!!(s&&s.verified));try{var c=window.XC?XC.get('dkorn-capsule'):JSON.parse(localStorage.getItem('xca-dkorn-capsule'));document.documentElement.classList.toggle('dk-capsule',!!(c&&c.escrow))}catch(e){}for(var i=0;i<subs.length;i++){try{subs[i](s)}catch(e){}}}
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
    while(i<RPCS.length&&(BAD[RPCS[i]+'|'+method]||(INDEXED[method]&&INDEX_BLOCK[RPCS[i]])))i++;
    if(i>=RPCS.length){BAD={};return Promise.reject(new Error('All public RPC endpoints are busy right now (rate-limited). Try again in a minute.'))}
    var url=RPCS[i++];
    return withTimeout(fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:body}),9000)
      .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})
      .then(function(j){if(j.error)throw new Error(j.error.message||'RPC error');return j.result})
      .catch(function(e){if(/HTTP 4|forbidden|token|plan/i.test(String(e&&e.message)))BAD[url+'|'+method]=1;return attempt()});
  }
  return attempt();
}
function dkornBalance(owner){return tokenBalance(owner,MINT,T22)}
function tokenBalance(owner,mint,programId){
  return byMint(owner,mint,programId).catch(function(){
    return ataForProgram(owner,mint,programId).then(function(ata){return rpc('getAccountInfo',[ata,{encoding:'jsonParsed',commitment:'confirmed'}])}).then(function(r){
      var v=r&&r.value,inf=v&&v.data&&v.data.parsed&&v.data.parsed.info;
      if(!v)return 0;if(!inf||inf.mint!==mint||inf.owner!==owner)return 0;
      if(programId&&v.owner&&v.owner!==programId)return 0;
      return Number(inf.tokenAmount.uiAmountString||0)});
  });
}
function byMint(owner,mint,programId){
  return rpc('getTokenAccountsByOwner',[owner,{mint:mint},{encoding:'jsonParsed',commitment:'confirmed'}]).then(function(res){
    var tot=0,list=(res&&res.value)||[];
    for(var k=0;k<list.length;k++){var a=list[k].account,inf=a&&a.data&&a.data.parsed&&a.data.parsed.info;
      if(inf&&inf.mint===mint&&(!programId||a.owner===programId))tot+=Number(inf.tokenAmount.uiAmountString||inf.tokenAmount.uiAmount||0)}
    return tot;
  });
}
function holderBalances(owner){
  return Promise.all([tokenBalance(owner,MINT,T22),tokenBalance(owner,FOUNDER,T22),tokenBalance(owner,UFD,TOKENKEG)])
    .then(function(r){return {dkorn:r[0],founder:r[1],ufd:r[2]}});
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
function ataFor(owner){return ataForProgram(owner,MINT,T22)}
function ataForProgram(owner,mint,programId){
  if(!(window.crypto&&crypto.subtle&&typeof BigInt==='function'))return Promise.reject(new Error('no crypto'));
  var seeds=[b58dec(owner),b58dec(programId),b58dec(mint)],prog=b58dec(ATA_PROGRAM),tag=new TextEncoder().encode('ProgramDerivedAddress');
  function tryBump(bump){if(bump<0)return Promise.reject(new Error('no bump'));
    var buf=new Uint8Array(32*3+1+32+tag.length),o=0;seeds.forEach(function(s){buf.set(s,o);o+=32});buf[o++]=bump;buf.set(prog,o);o+=32;buf.set(tag,o);
    return crypto.subtle.digest('SHA-256',buf).then(function(h){h=new Uint8Array(h);return onCurve(h)?tryBump(bump-1):b58enc(h)})}
  return tryBump(255);
}
var proof=null,proofP=null;
function checkLock(){
  if(proofP)return proofP;
  proofP=Promise.all(LOCKS.map(function(L,i){return i===0?Promise.resolve(ESCROW_VAULT):ataFor(L.esc).catch(function(){return null})}))
   .then(function(atas){
     var keys=LOCKS.map(function(L){return L.esc});atas.forEach(function(a){if(a)keys.push(a)});
     return rpc('getMultipleAccounts',[keys,{encoding:'jsonParsed'}]).then(function(r){
       var v=(r&&r.value)||[],each=[],tot=0,all=true,k=LOCKS.length;
       LOCKS.forEach(function(L,i){var e=v[i],bal=null;if(atas[i]){var a=v[k++],inf=a&&a.data&&a.data.parsed&&a.data.parsed.info;bal=inf&&inf.mint===MINT?Number(inf.tokenAmount.uiAmountString):null}
         if(bal==null)all=false;else tot+=bal;each.push({ok:!!(e&&e.owner===LOCK_PROGRAM),vault:bal})});
       var ok=each.filter(function(x){return x.ok}).length;proof={ok:ok===LOCKS.length,n:ok,each:each,vault:all?tot:null};if(!ok)proofP=null;return proof});
   }).catch(function(e){proof={ok:false,n:0,err:String(e.message||e)};proofP=null;return proof});
  return proofP;
}
function capsule(){try{return window.XC?XC.get('dkorn-capsule'):JSON.parse(localStorage.getItem('xca-dkorn-capsule'))}catch(e){return null}}
/* ---------- UI ---------- */
var drawer=null;
function save(mode,address,balance){
  var dk=0,fd=0,uf=0;
  if(balance&&typeof balance==='object'){dk=Number(balance.dkorn)||0;fd=Number(balance.founder)||0;uf=Number(balance.ufd)||0}
  else dk=Number(balance)||0;
  var s={verified:true,mode:mode,address:address||'',balance:dk,dkorn:dk,founder:fd,ufd:uf,skin:true,ts:Date.now()};
  set(s);emit();return s;
}
function tierHTML(s){
  if(!s||!s.verified)return '';
  if(s.mode==='serial')return '<div class="dkv-pass">🪖 VIP PASS ACTIVE <small>collector serial preview</small></div>';
  var dk=Number(s.dkorn!=null?s.dkorn:(s.balance||0)),fd=Number(s.founder||0),uf=Number(s.ufd||0);
  var circuit=dk>0||fd>0,herd=uf>0,head,sub,cls='';
  if(circuit&&herd){head='⚡ DUAL ALLIANCE: CIRCUIT 13 × DUSTER HERD';sub='$DKORN '+fmt(dk)+' · Founder #000 '+fmt(fd)+' · $UFD '+fmt(uf);cls=' dual'}
  else if(herd){head='✨ DUSTER HERD GUEST PASS · '+fmt(uf)+' $UFD';sub=esc(short(s.address))+' · read-only public balance';cls=' herd'}
  else{head='🪖 VIP PASS ACTIVE';sub=esc(short(s.address))+' · '+fmt(dk)+' $DKORN'+(fd>0?' · Founder #000 '+fmt(fd):'')+' (read-only)';}
  return '<div class="dkv-pass'+cls+'">'+head+'<small>'+sub+'</small></div>';
}
function msg(t,cls){var m=drawer&&drawer.querySelector('.dkv-msg');if(m){m.className='dkv-msg '+(cls||'');m.innerHTML=t}}
function verifyAddress(addr,mode){
  addr=(addr||'').trim();
  if(!isAddr(addr)){msg('That doesn\'t look like a Solana public address (32–44 letters/numbers).','bad');return}
  msg('Reading public balances ($DKORN, Founder #000, $UFD)… <span class="dkv-spin"></span>');
  holderBalances(addr).then(function(b){
    if(b.dkorn>0||b.founder>0||b.ufd>0){save(mode,addr,b);msg('✔ Read-only check recorded for '+esc(short(addr))+'. Tokens never leave your wallet.','ok');render()}
    else msg('No $DKORN, Founder #000, or $UFD found at '+esc(short(addr))+'. Every game stays fully playable.','warn');
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
function render(){
  if(!drawer)return;var s=get();
  drawer.querySelector('.dkv-state').innerHTML=s&&s.verified?
   tierHTML(s)+'<button class="dkv-b ghost" data-a="off">Remove pass from this browser</button>':
   '<div class="dkv-pass off">NO PASS INSERTED <small>Every game stays fully playable.</small></div>';
  var wrap=drawer.querySelector('.dkv-lockwrap');if(wrap)wrap.innerHTML='';
}
function open(){
  if(!drawer){
    drawer=document.createElement('div');drawer.className='dkv-ovl';
    drawer.innerHTML='<div class="dkv-box" role="dialog" aria-label="VIP Pass"><div class="dkv-tb"><span>🎟️ Insert VIP Pass (Read-Only Check)</span><button class="dkv-x" data-a="close" aria-label="Close">✕</button></div><div class="dkv-bd">'+
     '<div class="dkv-note">Read-only check — tokens never leave your wallet. Nothing is signed, sent, deposited or approved, and a seed phrase is never requested.</div>'+
     '<div class="dkv-salute">'+SALUTE+'</div>'+
     '<div class="dkv-state"></div>'+
     '<div class="dkv-h">1 · Phantom (public key only)</div><button class="dkv-b" data-a="phantom">Connect Phantom (Read-Only Pubkey)</button>'+
     '<div class="dkv-h">2 · Or paste any public Solana address</div><div class="dkv-row"><input class="dkv-in" id="dkvAddr" placeholder="Public wallet address" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="dkv-b" data-a="addr">Check</button></div>'+
     '<div class="dkv-h">3 · Or enter the collector serial</div><div class="dkv-row"><input class="dkv-in" id="dkvSer" placeholder="STAGE serial on any card" autocomplete="off" autocapitalize="characters" spellcheck="false"><button class="dkv-b" data-a="serial">Preview</button></div>'+
     '<div class="dkv-msg"></div><div class="dkv-lockwrap"></div>'+
     '<div class="dkv-fine">Dkorn™ · © 2026 Petecastic Productions LLC · Fan arcade &amp; comic collectible fun, not financial advice. <a href="https://solscan.io/token/'+UFD+'" target="_blank" rel="noopener">$UFD on Solscan</a></div></div></div>';
    document.body.appendChild(drawer);
    drawer.addEventListener('click',function(e){
      if(e.target===drawer){close();return}
      var b=e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a');
      if(a==='close')close();
      else if(a==='phantom')connectPhantom();
      else if(a==='addr')verifyAddress(drawer.querySelector('#dkvAddr').value,'address');
      else if(a==='serial'){var v=drawer.querySelector('#dkvSer').value.trim().toUpperCase().replace(/^STAGE:?\s*/,'').replace(/^POLE\s*#?/,'');
        if(v===SERIAL.toUpperCase()){save('serial','',0);msg('✔ Collector serial accepted.','ok');render()}else msg('Serial not recognized. Look for the STAGE stamp printed on every card.','warn')}
      else if(a==='off'){set(null);emit();render();msg('Pass removed.','')}
    });
  }
  drawer.classList.add('show');render();
}
function close(){if(drawer)drawer.classList.remove('show')}
function badge(el){
  if(!el)return;
  el.innerHTML='';
}
window.DKVIP={open:open,close:close,badge:badge,status:get,isVip:function(){var s=get();return !!(s&&s.verified)},onChange:function(f){subs.push(f)},checkLock:checkLock,LOCKS:LOCKS,capsule:capsule,CLOCK_URL:CLOCK_URL,rpc:rpc,refresh:emit,
  MINT:MINT,FOUNDER:FOUNDER,UFD:UFD,T22:T22,TOKENKEG:TOKENKEG,tokenBalance:tokenBalance,holderBalances:holderBalances,ESCROW:ESCROW,SERIAL:SERIAL,SALUTE:SALUTE};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',emit);else emit();
})();
