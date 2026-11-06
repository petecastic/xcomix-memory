/* Sub-Station 13 · 2126 Century Time-Capsule Clock & Lockup High Scores.
   Read-only: reads public Jupiter Lock escrow accounts via Solana RPC. Never signs, never builds transactions. */
(function(){
'use strict';
var MINT='A1gRAicaLnYRmKQwRbQCaEEp6iYfu5q5X5gTFAPBeVk',PROGRAM='LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn';
var DISC=[244,119,183,4,73,116,135,195],YEAR=31536000,MASTER_FALLBACK=4949607960; /* 2126-11-06T03:06:00Z */
var RPCS=['https://solana-rpc.publicnode.com','https://public.rpc.solanavibestation.com'];
var SITE='https://petecastic.github.io/xcomix-memory/vault-clock/';
var EMBED=document.body.classList.contains('embed');
var $=function(id){return document.getElementById(id)};
function lsGet(k){try{return JSON.parse(localStorage.getItem('xca-'+k))}catch(e){return null}}
function lsSet(k,v){try{localStorage.setItem('xca-'+k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function fmt(n,d){return Number(n).toLocaleString('en-US',{minimumFractionDigits:d==null?0:d,maximumFractionDigits:d==null?0:d})}
function short(k){return k.slice(0,4)+'…'+k.slice(-4)}
function pad(n,w){n=String(Math.max(0,Math.floor(n)));while(n.length<w)n='0'+n;return n}
function ini(s){return String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,3)}
/* base58 (no BigInt so older in-app browsers are fine) */
var A='123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function b58(bytes){var d=[0],i,j,c;for(i=0;i<bytes.length;i++){c=bytes[i];for(j=0;j<d.length;j++){c+=d[j]<<8;d[j]=c%58;c=(c/58)|0}while(c){d.push(c%58);c=(c/58)|0}}
 var s='';for(i=0;i<bytes.length&&bytes[i]===0;i++)s+='1';if(!(d.length===1&&d[0]===0))for(j=d.length-1;j>=0;j--)s+=A[d[j]];return s}
function b64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function u64(u,o){var lo=(u[o]|u[o+1]<<8|u[o+2]<<16)+u[o+3]*16777216,hi=(u[o+4]|u[o+5]<<8|u[o+6]<<16)+u[o+7]*16777216;return hi*4294967296+lo}
function parseEscrow(pubkey,acct){
  if(!acct)return{err:'Account not found on Solana mainnet.'};
  if(acct.owner!==PROGRAM)return{err:'Not a Jupiter Lock escrow (owner is '+short(acct.owner)+').'};
  var u=b64(acct.data[0]);
  if(u.length<208)return{err:'Account too small to be a VestingEscrow.'};
  for(var i=0;i<8;i++)if(u[i]!==DISC[i])return{err:'Not a VestingEscrow account.'};
  var mint=b58(u.subarray(40,72));
  if(mint!==MINT)return{err:'This lock holds a different token ('+short(mint)+'), not $DKORN.'};
  var cliff=u64(u,144),freq=u64(u,152),ca=u64(u,160),per=u64(u,168),n=u64(u,176),claimed=u64(u,184),start=u64(u,192),cx=u64(u,200);
  var total=(ca+per*n)/1e6;
  return{escrow:pubkey,recipient:b58(u.subarray(8,40)),creator:b58(u.subarray(72,104)),cancelMode:u[138],updateRecipientMode:u[137],
    cliffTime:cliff,frequency:freq,numberOfPeriod:n,vestingStartTime:start,finalUnlock:n>0?cliff+freq*n:cliff,
    totalCommitted:total,remainingLocked:Math.max(0,total-claimed/1e6),cancelled:cx>0,live:true};
}
function nextUnlock(L,now){if(!(L.numberOfPeriod>0)||!L.frequency)return L.cliffTime>now?L.cliffTime:null;
  if(L.cliffTime>now)return L.cliffTime;var k=Math.floor((now-L.cliffTime)/L.frequency)+1;return k<=L.numberOfPeriod?L.cliffTime+k*L.frequency:null}
function years(L,now){return Math.max(0,(L.finalUnlock-now)/YEAR)}
function score(L,now){var y=years(L,now);return Math.round(Math.sqrt(L.remainingLocked)*100*(1+Math.pow(y,1.35))*(L.cancelMode===0?2:1))}
function tier(L,now){var yr=new Date(L.finalUnlock*1000).getUTCFullYear(),y=years(L,now);
  if(yr>=2120||y>=90)return['🪐 2126 CENTURY TIME-LORD','t7'];if(yr>=2066)return['⚡ 2066 CIRCUIT IMMORTAL','t6'];if(yr>=2056)return['👑 2056 SUB-STATION LEGEND','t5'];if(yr>=2046)return['🛡️ 2046 IRON SPOOL KEEPER','t4'];
  if(yr>=2036)return['📚 10-BOOK SAGA GUARDIAN','t3'];if(y>=1)return['🔧 DROP-LINE APPRENTICE','t2'];return['🕹️ QUARTER IN THE SLOT','t1']}
/* calendar-true YY: whole UTC calendar years first, then days/hours/minutes/seconds */
function addY(t,y){var d=new Date(t*1000);d.setUTCFullYear(d.getUTCFullYear()+y);return d.getTime()/1000}
function parts(sec){sec=Math.max(0,Math.floor(sec));var t0=Math.floor(now()),T=t0+sec,y=Math.floor(sec/31557600);
  while(y>0&&addY(t0,y)>T)y--;while(addY(t0,y+1)<=T)y++;sec=T-addY(t0,y);var d=Math.floor(sec/86400);sec-=d*86400;var h=Math.floor(sec/3600);sec-=h*3600;var m=Math.floor(sec/60);return[y,d,h,m,sec-m*60]}
function clockStr(sec){var p=parts(sec);return pad(p[0],2)+':'+pad(p[1],3)+':'+pad(p[2],2)+':'+pad(p[3],2)+':'+pad(p[4],2)}
function utc(t){return new Date(t*1000).toISOString().replace('T',' ').slice(0,16)+' UTC'}
function now(){return Date.now()/1000}

/* ---------- RPC (read-only) ---------- */
function rpc(method,params){var i=0;
  function go(){if(i>=RPCS.length)return Promise.reject(new Error('All public Solana RPC mirrors are busy, try again in a minute.'));var url=RPCS[i++];
    return fetch(url,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:method,params:params})})
     .then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}).then(function(j){if(j.error)throw new Error(j.error.message||'rpc');return j.result}).catch(function(){return go()})}
  return go()}

/* ---------- state ---------- */
var seed=[],custom=lsGet('capsules')||[],liveOk=0,liveTried=false,mine=lsGet('dkorn-capsule');
if(!Array.isArray(custom))custom=[];
function all(){var m={},out=[];seed.concat(custom).forEach(function(L){if(L&&L.escrow&&!m[L.escrow]){m[L.escrow]=1;out.push(L)}});return out}
function masterTarget(){var t=0;seed.forEach(function(L){if(L.label==='DKORN CREATOR'&&L.finalUnlock>t)t=L.finalUnlock});return t||MASTER_FALLBACK}

/* ---------- render ---------- */
function renderBoard(){
  var t=now(),list=all().filter(function(L){return !L.cancelled}).sort(function(a,b){return score(b,t)-score(a,t)});
  var h='<div class="row h"><div>RANK</div><div>INIT</div><div>CAPSULE PTS</div><div>VAULT</div><div>UNLOCKS IN · YY:DDD:HH:MM:SS</div></div>';
  list.forEach(function(L,i){var tr=tier(L,t),nx=nextUnlock(L,t),me=mine&&mine.escrow===L.escrow;
    h+='<div class="row'+(me?' me':'')+'"><div class="rk">#'+(i+1)+'</div><div class="ini">'+esc(ini(L.tag)||'???')+'</div>'+
     '<div class="pts">'+pad(score(L,t),9)+'<small>CAPSULE PTS</small></div>'+
     '<div class="info"><b>'+esc(L.name||'Time-Capsule')+'</b> <span class="v'+(L.live?'':' no')+'">'+(L.live?'● LIVE VERIFIED':(liveTried?'○ cached':'○ checking…'))+'</span>'+
     '<small>'+fmt(L.remainingLocked,2)+' DKORN still locked · '+(L.cancelMode===0?'non-cancelable (2× multiplier)':'cancelable')+' · '+esc(L.label||'COMMUNITY CAPSULE')+'</small>'+
     '<span class="badge '+tr[1]+'">'+tr[0]+'</span></div>'+
     '<div class="mini" data-t="'+L.finalUnlock+'">'+clockStr(L.finalUnlock-t)+'<small>final unlock '+utc(L.finalUnlock)+(nx&&nx!==L.finalUnlock?' · next '+utc(nx).slice(0,10):'')+'</small>'+
     '<a href="https://lock.jup.ag/escrow/'+L.escrow+'" target="_blank" rel="noopener">🔒 Proof: lock.jup.ag/escrow/'+short(L.escrow)+' ↗</a>'+
     (L.tx?' · <a href="https://solscan.io/tx/'+L.tx+'" target="_blank" rel="noopener">Tx ↗</a>':'')+'</div></div>'});
  $('board').innerHTML=h;
  var tot=0;seed.forEach(function(L){if(L.label==='DKORN CREATOR')tot+=L.remainingLocked});
  if($('tLocked'))$('tLocked').textContent=fmt(tot,2);
  if($('tCount'))$('tCount').textContent=list.length;
  if($('tVaults'))$('tVaults').textContent=seed.filter(function(L){return L.label==='DKORN CREATOR'}).length;
}
function tick(){var t=now(),T=masterTarget(),p=parts(T-t),ids=['cY','cD','cH','cM','cS'],w=[2,3,2,2,2];
  for(var i=0;i<5;i++){var e=$(ids[i]);if(e)e.textContent=pad(p[i],w[i])}
  var ms=document.querySelectorAll('.mini[data-t]');for(var j=0;j<ms.length;j++){var n=ms[j].firstChild;if(n&&n.nodeType===3)n.nodeValue=clockStr(+ms[j].getAttribute('data-t')-t)}
}
function setStatus(cls,txt){var s=$('status');if(s)s.innerHTML='<span class="led '+cls+'"></span>'+txt}

/* ---------- live verification of every board lock (one batched call) ---------- */
function verifyAll(){
  var list=all(),keys=list.map(function(L){return L.escrow});if(!keys.length)return;
  setStatus('','CONTACTING SOLANA MAINNET…');
  rpc('getMultipleAccounts',[keys,{encoding:'base64'}]).then(function(r){
    liveTried=true;liveOk=0;var v=(r&&r.value)||[];
    list.forEach(function(L,i){var p=parseEscrow(L.escrow,v[i]);if(p.err){L.live=false;L.liveErr=p.err;return}
      for(var k in p)L[k]=p[k];if(seed.indexOf(L)>=0&&L.label==='DKORN CREATOR')liveOk++});
    var cr=seed.filter(function(L){return L.label==='DKORN CREATOR'}).length;
    setStatus(liveOk===cr?'on':'off',liveOk+'/'+cr+' CREATOR VAULTS VERIFIED LIVE ON SOLANA MAINNET · owner = Jupiter Lock program · mint = $DKORN');
    lsSet('capsules',custom);renderBoard();
  }).catch(function(e){liveTried=true;setStatus('off','LIVE CHECK UNAVAILABLE ('+esc(e.message)+') · showing last synced on-chain snapshot');renderBoard()});
}

/* ---------- paste-your-capsule ---------- */
function keyFrom(s){var m=String(s||'').match(/[1-9A-HJ-NP-Za-km-z]{32,44}/g);return m?m[m.length-1]:null}
function msg(cls,t){var m=$('vMsg');m.className='msg '+cls;m.innerHTML=t}
function shareURL(L){return SITE+'?lock='+L.escrow+'&tag='+encodeURIComponent(ini(L.tag))}
function intent(L){var t=now(),tr=tier(L,t);
  var text='My $DKORN Time-Capsule scored '+fmt(score(L,t))+' CAPSULE PTS on the Sub-Station 13 2126 Century Clock! '+tr[0]+' · unlocks in '+clockStr(L.finalUnlock-t)+' (YY:DDD:HH:MM:SS). Arcade bragging rights only @PeteCastic '+shareURL(L)+' See you in another timeline.';
  return 'https://x.com/intent/post?text='+encodeURIComponent(text)}
function showResult(L){var t=now(),tr=tier(L,t);
  $('vResult').innerHTML='<div class="crt"><div class="clab">CAPSULE '+esc(ini(L.tag))+' · '+short(L.escrow)+'</div>'+
   '<div class="master" style="margin:4px 0"><div class="u"><div class="d" style="font-size:clamp(22px,6vw,46px)" id="rClock" data-t="'+L.finalUnlock+'">'+clockStr(L.finalUnlock-t)+'</div><div class="l">YY : DDD : HH : MM : SS</div></div></div>'+
   '<div class="target">'+pad(score(L,t),9)+' CAPSULE PTS · <span class="badge '+tr[1]+'">'+tr[0]+'</span></div>'+
   '<div class="status" style="color:#bff">'+fmt(L.remainingLocked,2)+' DKORN locked · '+(L.cancelMode===0?'non-cancelable':'cancelable')+' · final unlock '+utc(L.finalUnlock)+'</div></div>'+
   '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><a class="b pink" target="_blank" rel="noopener" href="'+intent(L)+'">🐦 Flex My Capsule Score to @PeteCastic on X</a>'+
   '<button class="b cy" id="cpShare">🔗 Copy share link</button><a class="b" target="_blank" rel="noopener" href="https://lock.jup.ag/escrow/'+L.escrow+'">🔒 Proof on lock.jup.ag ↗</a></div>';
  var c=$('cpShare');if(c)c.onclick=function(){copy(shareURL(L),c)}}
function verifyPaste(raw,tag,quiet){
  var k=keyFrom(raw);tag=ini(tag);
  if(!k){msg('bad','Paste a lock.jup.ag/escrow/… link or an escrow address.');return}
  if(tag.length!==3){msg('bad','Enter 3 initials (A–Z, 0–9) for the high-score table.');return}
  msg('warn','<span class="led"></span>Reading escrow '+short(k)+' from Solana mainnet (read-only)…');
  rpc('getAccountInfo',[k,{encoding:'base64'}]).then(function(r){
    var p=parseEscrow(k,r&&r.value);if(p.err){msg('bad','✖ '+esc(p.err));return}
    if(p.cancelled){msg('bad','✖ This lock was cancelled, so it is no longer a time-capsule.');return}
    var ex=null;all().forEach(function(L){if(L.escrow===k)ex=L});
    var L=ex||{name:'Fan Time-Capsule',label:'COMMUNITY CAPSULE'};for(var q in p)L[q]=p[q];
    if(ex&&ex.label==='DKORN CREATOR'){msg('ok','✔ VERIFIED LIVE · this is one of the creator vaults ('+esc(ex.name)+'), already on the board. Lock your own capsule to earn the Foil Badge.');showResult(ex);renderBoard();return}
    L.tag=tag;
    if(!ex){custom.push(L)}lsSet('capsules',custom);
    var t=now();mine={escrow:k,tag:ini(L.tag),score:score(L,t),rank:tier(L,t)[0],finalUnlock:L.finalUnlock,ts:Date.now()};lsSet('dkorn-capsule',mine);
    if(window.DKVIP&&DKVIP.refresh)DKVIP.refresh();document.documentElement.classList.add('dk-capsule');
    msg('ok','✔ VERIFIED LIVE · owner = Jupiter Lock program · mint = $DKORN · 2066 Time-Traveler Foil Badge unlocked for Rug Loom & Binder!');
    try{if(history.replaceState)history.replaceState(null,'','?lock='+k+'&tag='+ini(L.tag))}catch(e){}
    showResult(L);renderBoard();
  }).catch(function(e){msg('bad','✖ '+esc(e.message))});
}
function copy(text,btn){function done(){var o=btn.textContent;btn.textContent='✔ Copied';setTimeout(function(){btn.textContent=o},1400)}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done,fb);return}}catch(e){}fb();
  function fb(){var ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(ta);done()}}

/* ---------- boot ---------- */
function boot(data){seed=(data&&data.locks)||[];renderBoard();tick();setInterval(tick,1000);setInterval(renderBoard,60000);verifyAll();
  var q={};location.search.replace(/^\?/,'').split('&').forEach(function(kv){var a=kv.split('=');if(a[0])q[a[0]]=decodeURIComponent(a[1]||'')});
  if(!EMBED&&q.lock){$('vKey').value=q.lock;$('vTag').value=ini(q.tag)||'';if(ini(q.tag).length===3)verifyPaste(q.lock,q.tag)}}
if(!EMBED){
  $('vGo').addEventListener('click',function(){verifyPaste($('vKey').value,$('vTag').value)});
  $('vTag').addEventListener('keydown',function(e){if(e.key==='Enter')verifyPaste($('vKey').value,$('vTag').value)});
  var cb=$('cpCA');if(cb)cb.addEventListener('click',function(){copy(MINT,cb)});
  if(mine&&mine.escrow)msg('ok','⏳ Your 2066 Time-Traveler Foil Badge is active ('+esc(mine.tag)+' · '+short(mine.escrow)+'). Paste another capsule any time.');
}
fetch('locks.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(boot).catch(function(){boot({locks:[]})});
})();
