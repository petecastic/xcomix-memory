/* X-Comix Card & Merch Shop · living cards + Creator's Sky engine (read-only, no wallet, no payments) */
(function(){
'use strict';
var D=window.SHOP,$=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var SITE='https://petecastic.github.io/xcomix-memory/shop/';
var SOLSCAN='https://solscan.io/token/';
var PERKS="Owner Roll Call in Binder + 1 Director's Chair background prop cameo";
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function emph(s){return esc(s).replace(/\*([^*]+)\*/g,'<em>$1</em>')}
function ls(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k)||'null');localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}}

/* ---------------- Creator's Sky ---------------- */
var CONDS={rain:'Rain',snow:'Snow',storm:'Storm',clear:'Clear',cloudy:'Cloudy',fog:'Fog'};
var SKY={condition:'cloudy',is_day:true,temp_f_band:'',updated:'',ok:false};
var MODE='live',WX='cloudy',DAY=true;
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function loadSky(){
  return fetch('sky.json?d='+today(),{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
    if(!j||!CONDS[j.condition])throw 0;
    SKY={condition:j.condition,is_day:j.is_day!==false,temp_f_band:/^-?\d{1,3}s$/.test(j.temp_f_band||'')?j.temp_f_band:'',updated:/^\d{4}-\d{2}-\d{2}$/.test(j.updated||'')?j.updated:'',ok:true};
  }).catch(function(){SKY={condition:'cloudy',is_day:true,temp_f_band:'',updated:'',ok:false}}).then(apply);
}
function skyText(){return (CONDS[SKY.condition]||'Cloudy')+(SKY.is_day?'':' · Night')+(SKY.temp_f_band?' · '+SKY.temp_f_band+' °F':'')}
function apply(){
  if(MODE==='live'){WX=SKY.condition;DAY=SKY.is_day}
  else if(MODE==='day'){WX='clear';DAY=true}
  else if(MODE==='night'){WX='clear';DAY=false}
  else{WX=MODE;DAY=MODE==='storm'?false:SKY.is_day}
  document.body.setAttribute('data-wx',WX);document.body.setAttribute('data-day',DAY?'1':'0');
  var src=$('#wxSrc');
  if(src){src.textContent=MODE!=='live'?'PREVIEW':(SKY.ok?'LIVE':'OFFLINE · NEUTRAL SKY');src.className=SKY.ok||MODE!=='live'?'':'off'}
  var c=$('#wxCond');if(c)c.textContent=MODE==='live'?(CONDS[SKY.condition]+(SKY.is_day?'':' · Night')):({rain:'Rain',snow:'Snow',storm:'Storm',day:'Clear Day',night:'Night Shift'}[MODE]+' (preview)');
  var t=$('#wxTemp');if(t)t.textContent=SKY.temp_f_band?SKY.temp_f_band+' °F':'-- °F';
  var u=$('#wxUpd');if(u)u.textContent=SKY.updated?'updated '+SKY.updated:'updated --';
  $$('.skyhud').forEach(function(h){h.textContent='☁ CREATOR\u2019S SKY · '+(MODE==='live'?skyText():$('#wxCond').textContent)});
  parts=null;
  if(amb)amb.set(WX,DAY);
}
$('#modes')&&$('#modes').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;MODE=b.dataset.m;$$('#modes button').forEach(function(x){x.classList.toggle('on',x===b)});apply()});

/* canvas particles */
var cv=$('#sky'),cx=cv.getContext('2d'),W=0,H=0,parts=null,t0=0,reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
function size(){var r=Math.min(window.devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*r;cv.height=H*r;cx.setTransform(r,0,0,r,0,0);parts=null}
addEventListener('resize',size);size();
function rnd(a,b){return a+Math.random()*(b-a)}
function make(){
  var n=Math.round((W*H)/(reduce?40000:9000)),p=[],i;
  if(WX==='rain'||WX==='storm'){for(i=0;i<n*(WX==='storm'?1.6:1.1);i++)p.push({x:rnd(0,W),y:rnd(0,H),l:rnd(10,22),v:rnd(9,15)})}
  else if(WX==='snow'){for(i=0;i<n*.8;i++)p.push({x:rnd(0,W),y:rnd(0,H),r:rnd(1,3.4),v:rnd(.4,1.4),w:rnd(0,6.28)})}
  else if(WX==='cloudy'||WX==='fog'){for(i=0;i<(WX==='fog'?9:7);i++)p.push({x:rnd(-200,W),y:WX==='fog'?rnd(H*.35,H):rnd(0,H*.45),rx:rnd(140,320),ry:rnd(30,70),v:rnd(.1,.35)})}
  else if(!DAY){for(i=0;i<n*.5;i++)p.push({x:rnd(0,W),y:rnd(0,H*.7),r:rnd(.4,1.5),ph:rnd(0,6.28)})}
  else{for(i=0;i<n*.25;i++)p.push({x:rnd(0,W),y:rnd(0,H),r:rnd(.8,2.2),v:rnd(.1,.4),ph:rnd(0,6.28)})}
  return p;
}
var bolt=null,nextBolt=0;
function frame(ts){
  requestAnimationFrame(frame);
  if(document.hidden)return;
  if(!parts)parts=make();
  var dt=Math.min(2,(ts-t0)/16.7||1);t0=ts;
  cx.clearRect(0,0,W,H);
  var i,q;
  if(WX==='rain'||WX==='storm'){
    cx.strokeStyle=WX==='storm'?'rgba(170,220,255,.55)':'rgba(190,220,255,.45)';cx.lineWidth=1.1;cx.beginPath();
    for(i=0;i<parts.length;i++){q=parts[i];cx.moveTo(q.x,q.y);cx.lineTo(q.x-q.l*.25,q.y+q.l);q.y+=q.v*dt*(reduce?.3:1);q.x-=q.v*.25*dt;if(q.y>H){q.y=-20;q.x=rnd(0,W+60)}}
    cx.stroke();
    if(WX==='storm'&&!reduce){
      if(ts>nextBolt){nextBolt=ts+rnd(2600,6500);bolt={pts:mkBolt(),life:1};var f=$('#flash');f.classList.remove('go');void f.offsetWidth;f.classList.add('go')}
      if(bolt&&bolt.life>0){cx.strokeStyle='rgba(46,230,255,'+bolt.life+')';cx.lineWidth=2.5;cx.shadowColor='#2ee6ff';cx.shadowBlur=18;cx.beginPath();bolt.pts.forEach(function(pt,j){j?cx.lineTo(pt[0],pt[1]):cx.moveTo(pt[0],pt[1])});cx.stroke();cx.shadowBlur=0;bolt.life-=.035*dt}
      cx.strokeStyle='rgba(46,230,255,.08)';cx.lineWidth=1;for(i=0;i<W;i+=48){cx.beginPath();cx.moveTo(i,H*.82);cx.lineTo(i+Math.sin(ts/600+i)*8,H);cx.stroke()}
    }
  }else if(WX==='snow'){
    cx.fillStyle='rgba(255,255,255,.85)';
    for(i=0;i<parts.length;i++){q=parts[i];cx.beginPath();cx.arc(q.x,q.y,q.r,0,6.283);cx.fill();q.y+=q.v*dt*(reduce?.4:1);q.w+=.02*dt;q.x+=Math.sin(q.w)*.5;if(q.y>H+4){q.y=-4;q.x=rnd(0,W)}}
  }else if(WX==='cloudy'||WX==='fog'){
    for(i=0;i<parts.length;i++){q=parts[i];var g=cx.createRadialGradient(q.x,q.y,0,q.x,q.y,q.rx);var a=WX==='fog'?(DAY?.32:.18):(DAY?.28:.12);g.addColorStop(0,'rgba(235,240,245,'+a+')');g.addColorStop(1,'rgba(235,240,245,0)');cx.fillStyle=g;cx.save();cx.translate(q.x,q.y);cx.scale(1,q.ry/q.rx);cx.translate(-q.x,-q.y);cx.beginPath();cx.arc(q.x,q.y,q.rx,0,6.283);cx.fill();cx.restore();q.x+=q.v*dt;if(q.x-q.rx>W)q.x=-q.rx}
  }else if(!DAY){
    for(i=0;i<parts.length;i++){q=parts[i];cx.fillStyle='rgba(255,250,230,'+(.35+.4*Math.sin(ts/700+q.ph))+')';cx.fillRect(q.x,q.y,q.r,q.r)}
    var lg=cx.createRadialGradient(W*.88,0,0,W*.88,0,Math.max(W,H)*.45);lg.addColorStop(0,'rgba(255,170,60,.22)');lg.addColorStop(1,'rgba(255,170,60,0)');cx.fillStyle=lg;cx.fillRect(0,0,W,H);
  }else{
    cx.save();cx.translate(W*.1,-40);cx.rotate(ts/40000);for(i=0;i<10;i++){cx.rotate(.628);cx.fillStyle='rgba(255,240,190,.06)';cx.beginPath();cx.moveTo(0,0);cx.lineTo(Math.max(W,H)*1.4,-60);cx.lineTo(Math.max(W,H)*1.4,60);cx.fill()}cx.restore();
    for(i=0;i<parts.length;i++){q=parts[i];cx.fillStyle='rgba(255,245,210,'+(.3+.3*Math.sin(ts/900+q.ph))+')';cx.beginPath();cx.arc(q.x,q.y,q.r,0,6.283);cx.fill();q.y-=q.v*dt;if(q.y<-4){q.y=H+4;q.x=rnd(0,W)}}
  }
}
function mkBolt(){var x=rnd(W*.15,W*.85),y=0,p=[[x,y]];while(y<H*.6){y+=rnd(20,50);x+=rnd(-30,30);p.push([x,y])}return p}
requestAnimationFrame(frame);

/* ambient sound (off until the visitor taps) */
var amb=null;
function Ambient(){
  var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;
  var ac=new A(),len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0),last=0;
  for(var i=0;i<len;i++){var w=Math.random()*2-1;last=(last+.02*w)/1.02;d[i]=last*3.5}
  var src=ac.createBufferSource();src.buffer=buf;src.loop=true;
  var f=ac.createBiquadFilter(),g=ac.createGain(),hum=ac.createOscillator(),hg=ac.createGain();
  hum.frequency.value=120;hg.gain.value=0;hum.connect(hg).connect(ac.destination);
  src.connect(f).connect(g).connect(ac.destination);g.gain.value=0;src.start();hum.start();
  return{ac:ac,set:function(wx,day){var p={rain:[1800,.5,'bandpass'],storm:[900,.7,'lowpass'],snow:[400,.15,'lowpass'],fog:[300,.12,'lowpass'],cloudy:[600,.12,'lowpass'],clear:[day?2500:250,day?.06:.08,'lowpass']}[wx]||[600,.1,'lowpass'];f.type=p[2];f.frequency.setTargetAtTime(p[0],ac.currentTime,.3);g.gain.setTargetAtTime(this.on?p[1]:0,ac.currentTime,.4);hg.gain.setTargetAtTime(this.on&&!day&&wx==='clear'?.012:0,ac.currentTime,.4)},on:false};
}
function toggleAmb(btn){
  if(!amb)amb=Ambient();if(!amb){btn.textContent='🔇 Sound unavailable';return}
  amb.on=!amb.on;if(amb.ac.state==='suspended')amb.ac.resume();amb.set(WX,DAY);
  $$('.ambbtn').forEach(function(b){b.textContent=amb.on?'🔊 Sky Ambience: ON':'🔈 Sky Ambience: OFF'});
}

/* ---------------- Shelf 1: Series 1 holo cards ---------------- */
var FILTERS=[['all','All 29'],['night','Night Shift'],['action','Action / Sci-Fi'],['critters','Critters & Dogs'],['mystery','Mystery & Lore'],['comedy','Comedy & Slice-of-Life'],['wish','★ My Wishlist']];
var FIL='all',Q='';
function wish(){return ls('xcs-wish')||[]}
function isWish(n){return wish().indexOf(n)>=0}
function toggleWish(n){var w=wish(),i=w.indexOf(n);i>=0?w.splice(i,1):w.push(n);ls('xcs-wish',w);$$('.star[data-n="'+n+'"]').forEach(function(b){b.classList.toggle('on',i<0);b.textContent=i<0?'★ Wishlisted':'☆ Wishlist'});if(FIL==='wish')renderCards()}
function shareURL(c){var t='Flipping Series 1 card #'+c.num+' '+c.name+' ('+c.show+') in the X-Comix Card & Merch Shop. Free to browse, free daily pack @PeteCastic';return 'https://x.com/intent/post?text='+encodeURIComponent(t+' '+SITE+'?card='+c.num)}
function cardFace(c,big){
  return '<div class="hc'+(big?' big':'')+'" data-n="'+c.n+'" tabindex="0" role="button" aria-label="'+esc(c.name)+' card. Tap to flip"><div class="tilt"><div class="inner">'+
   '<div class="face front"><img src="'+c.front+'" alt="'+esc(c.name+' · '+c.title)+'" '+(big?'':'loading="lazy" ')+'width="540" height="675"><div class="foil"></div><div class="wx"></div><span class="num">#'+c.num+'</span><span class="flipme">↻</span><div class="skyhud"></div></div>'+
   '<div class="face back"><div class="bimg"><img src="'+c.back+'" alt="'+esc(c.name)+' character sheet" loading="lazy"></div>'+
    '<div class="bname">'+esc(c.name)+'<small>'+esc(c.show)+'</small></div>'+
    '<div class="stats">'+c.stats.map(function(s){return '<div class="st"><span>'+esc(s[0])+'</span><i><b style="width:'+s[1]+'%"></b></i><span>'+s[1]+'</span></div>'}).join('')+'</div>'+
    '<div class="bq">'+esc(c.quote)+'</div>'+(displayOnly(c)?'<div class="perks"><b>DISPLAY ONLY</b>Not for sale.</div>':'<div class="perks"><b>COLLECTOR PERKS</b>'+esc(PERKS)+'</div>')+'<div class="foil"></div><div class="wx"></div></div>'+
  '</div></div></div>';
}
function displayOnly(c){return c&&c.id==='pete-castic-bear'}
function statusHTML(c){
  if(displayOnly(c)) return '<div class="status">Not for sale. Display only.</div>';
  return '<div class="status">SERIES 1 WAVE 1</div>';
}
function actsHTML(c){
  var extra=displayOnly(c)?'':'<button class="ab star'+(isWish(c.n)?' on':'')+'" data-n="'+c.n+'">'+(isWish(c.n)?'★ Wishlisted':'☆ Wishlist')+'</button>';
  return '<div class="acts"><button class="ab flipbtn" data-n="'+c.n+'">Flip Card ↻</button><button class="ab insbtn" data-n="'+c.n+'">🔍 Inspect</button>'+
   extra+
   '<a class="ab" href="'+shareURL(c)+'" target="_blank" rel="noopener">𝕏 Share</a></div>';
}
function renderFilters(){var f=$('#fpills');f.innerHTML=FILTERS.map(function(x){return '<button data-f="'+x[0]+'" class="'+(x[0]===FIL?'on ':'')+(x[0]==='genesis'?'gen':'')+'">'+esc(x[1])+'</button>'}).join('');}
function renderCards(){
  var q=Q.toLowerCase(),list=D.cards.filter(function(c){
    if(FIL==='wish'&&!isWish(c.n))return false;
    if(FIL!=='all'&&FIL!=='wish'&&c.groups.indexOf(FIL)<0)return false;
    return !q||(c.name+' '+c.title+' '+c.show+' '+c.quote+' '+c.cat+' '+c.num).toLowerCase().indexOf(q)>=0;
  });
  $('#cards').innerHTML=list.map(function(c){return '<div class="slot">'+cardFace(c)+statusHTML(c)+actsHTML(c)+'</div>'}).join('');
  $('#empty').hidden=list.length>0;apply();
}
$('#fpills').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;FIL=b.dataset.f;renderFilters();renderCards()});
$('#q').addEventListener('input',function(e){Q=e.target.value;renderCards()});

/* tilt + flip (delegated, works for shelf + inspector) */
function tilt(e){var h=e.target.closest&&e.target.closest('.hc');if(!h)return;var r=h.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;if(x<0||x>1||y<0||y>1)return;
  h.style.setProperty('--ry',((x-.5)*22).toFixed(1)+'deg');h.style.setProperty('--rx',((.5-y)*18).toFixed(1)+'deg');h.style.setProperty('--mx',(x*100).toFixed(0)+'%');h.style.setProperty('--my',(y*100).toFixed(0)+'%');h.classList.add('tilting')}
function untilt(e){var h=e.target.closest&&e.target.closest('.hc');if(!h)return;h.style.setProperty('--rx','0deg');h.style.setProperty('--ry','0deg');h.classList.remove('tilting')}
document.addEventListener('pointermove',tilt,{passive:true});
document.addEventListener('pointerout',function(e){if(e.target.closest&&e.target.closest('.hc')&&!(e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('.hc')===e.target.closest('.hc')))untilt(e)});
function flip(n,scope){$$('.hc[data-n="'+n+'"]',scope).forEach(function(h){h.classList.toggle('flipped')})}
document.addEventListener('click',function(e){
  var t=e.target;
  var fb=t.closest('.flipbtn');if(fb){flip(fb.dataset.n,fb.closest('.slot')||fb.closest('.ins'));return}
  var ib=t.closest('.insbtn');if(ib){openIns(+ib.dataset.n);return}
  var sb=t.closest('.star');if(sb){toggleWish(+sb.dataset.n);return}
  var h=t.closest('.hc');if(h){h.classList.toggle('flipped');return}
  var ab=t.closest('.ambbtn');if(ab){toggleAmb(ab);return}
});
document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){closeAll();return}
  if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('hc')){e.preventDefault();e.target.classList.toggle('flipped')}
  if(e.key==='Enter'&&e.target.classList&&(e.target.classList.contains('relic')||e.target.classList.contains('mcard'))){e.target.click()}
});

/* inspector */
var CUR=0,NFT=false;
function openIns(n){
  CUR=n;var c=D.cards[n],b=$('#insBox');
  if(displayOnly(c)) NFT=false;
  b.className='ovbox ins'+(NFT?' nft':'');
  var ownBtn=displayOnly(c)?'':'<button class="ab star'+(isWish(c.n)?' on':'')+'" data-n="'+c.n+'">'+(isWish(c.n)?'★ Wishlisted':'☆ Wishlist on My Device')+'</button>';
  var nftTog=displayOnly(c)?'':'<label class="tog"><input type="checkbox" id="nftTog"'+(NFT?' checked':'')+'><span>Standalone Living HTML NFT (<code>animation_url</code>) Preview</span></label>';
  b.innerHTML='<button class="x" aria-label="Close">✕</button>'+
   '<div class="stage"><div class="nftframe"><div class="nfthead"><i></i> Living card preview · animation_url</div></div><div class="slotbig">'+cardFace(c,true)+'</div><div class="nftframe nftfoot">'+(displayOnly(c)?'Not for sale. Display only. The portrait can show the public Creator\u2019s Sky. Nothing to sign.':('This is how the standalone living HTML card would render: it reads the same public Creator\u2019s Sky file every copy reads, so every copy of #'+c.num+' shares one sky together. Display only. Nothing to sign.<code>animation_url → '+SITE+'?card='+c.num+'&amp;living=1</code>'))+'</div></div>'+
   '<div class="side"><h3>#'+c.num+' '+esc(c.name)+'</h3><div class="ttl">'+esc(c.title)+'</div>'+statusHTML(c)+
   '<div class="q">'+esc(c.quote)+'</div><div class="meta">Show: <b>'+esc(c.show)+'</b> · Category: '+esc(c.cat)+'<br>'+c.stats.map(function(s){return esc(s[0])+' '+s[1]}).join(' / ')+'</div>'+
   (displayOnly(c)?'':'<div class="perk">🎬 Collector Perks: '+esc(PERKS)+'</div>')+
   nftTog+
   '<div class="row"><button class="ab flipbtn" data-n="'+c.n+'">Flip Card ↻</button>'+ownBtn+'<a class="ab" href="'+shareURL(c)+'" target="_blank" rel="noopener">𝕏 Share Card</a><button class="ab ambbtn">'+(amb&&amb.on?'🔊 Sky Ambience: ON':'🔈 Sky Ambience: OFF')+'</button></div>'+
   '<div class="meta">Sky right now: <b class="skynow"></b>. Try the sky pills: the card reacts live.</div>'+
   '<div class="nav2"><button class="ab" id="insPrev">◀ Prev</button><button class="ab" id="insNext">Next ▶</button></div></div>';
  var hs=$('.slotbig',b);hs.insertBefore($('.nftframe',b),hs.firstChild);
  $('#insOv').classList.add('show');document.body.style.overflow='hidden';apply();updNow();
  if($('#nftTog')) $('#nftTog').onchange=function(e){NFT=e.target.checked;b.classList.toggle('nft',NFT)};
  $('#insPrev').onclick=function(){openIns((CUR+28)%29)};$('#insNext').onclick=function(){openIns((CUR+1)%29)};
  $('.x',b).onclick=closeAll;
}
function updNow(){$$('.skynow').forEach(function(s){s.textContent=MODE==='live'?skyText():$('#wxCond').textContent})}
var _apply=apply;apply=function(){_apply();updNow()};

/* ---------------- Shelf 2: Words Win relics ---------------- */
function markHTML(r){
  switch(r.sk){
    case 'coldharrow':return '<span class="stamp">UNLICENSED</span>';
    case 'stilse':return '<span class="blind" style="color:#14181c22">ST. ILSE<br>LONG WARD</span>';
    case 'ashledger':return '<span class="blind">ASH<br>OFFICE</span>';
    case 'skerrow':return '<span class="stamp" style="color:#1e3a5a;border-color:#1e3a5a">BOARD OF WELLS</span>';
    case 'payenv':return '<span class="wax">FOUR<br>MARKS</span>';
    case 'hepzibah':return '<span class="wax" style="background:radial-gradient(circle at 35% 30%,#3f6a70,#2F4A4F 60%,#1b2b2e)">PLAIN</span>';
    case 'tallow':return '<span class="blind">WICK<br>ROW</span>';
    case 'switchtag':return '<span class="blind" style="color:#1a130033">LOOP</span>';
    case 'loopdust':return '<span class="stamp" style="color:#4a2a8a;border-color:#4a2a8a">LOOP</span>';
    case 'workorder':return '<span class="stamp" style="color:#5c4a28;border-color:#5c4a28">DO NOT FEED</span>';
    case 'mapedge':return '<span class="stamp" style="color:#3a6b3a;border-color:#3a6b3a">BELIEVE GROUND</span>';
    case 'emptytag':return '<span class="stamp" style="color:#b3262f;border-color:#b3262f;background:#ffd23a33">OPEN SEAM</span>';
    case 'exitnight':return '<span class="stamp" style="color:#6b3cff;border-color:#6b3cff">HOLD</span>';
    case 'ringpress':return '<span class="wax" style="background:radial-gradient(circle at 35% 30%,#ffe066,#c9a24e 55%,#6a4a10);color:#1a1000">12:49</span>';
    case 'leftovers':return '<span class="stamp" style="color:#6b3cff;border-color:#6b3cff">LET \u2019EM LOOK</span>';
    case 'bristolclock':return '<span class="wax" style="background:radial-gradient(circle at 35% 30%,#ffe066,#c9a24e 55%,#3a4a6a);color:#1a1814">12:49</span>';
    case 'marswheat':return '<span class="stamp" style="color:#1a0a08;border-color:#1a0a08;background:#7ad0ff55">2387</span>';
    case 'wildslate':return '<span class="stamp" style="color:#8B1E1E;border-color:#8B1E1E">REMARKABLE</span>';
    case 'orderslip':return '<span class="coin">$4.09</span>';
    case 'wokcard':return '<span class="stamp" style="color:#8B1E1E;border-color:#8B1E1E">MORE GARLIC</span>';
    case 'yakionigiri':return '<span class="stamp" style="color:#c87828;border-color:#c87828">THE RICE HELD</span>';
    case 'torncard':return '<span class="stamp askrosa">ASK ROSA</span>';
    case 'pierogi':return '<span class="stamp" style="color:#2a5a9a;border-color:#2a5a9a">3 AM</span>';
    case 'roastpork':return '<span class="stamp" style="color:#8B1E1E;border-color:#8B1E1E">USUAL</span>';
    case 'marswheats':return '<span class="stamp" style="color:#2a5a2a;border-color:#2a5a2a;background:#c8e8c855">MARS WHEATS</span>';
    case 'hollowmill':return '<span class="stamp" style="color:#8B1E1E;border-color:#8B1E1E">HALLOWEEN ONLY</span>';
    case 'saturday':return '<span class="wax" style="background:radial-gradient(circle at 35% 30%,#ffe066,#c9a24e 55%,#6b3cff);color:#1a1000">THRESHOLD</span>';
    case 'billiard':return '<span class="eightball" aria-hidden="true"><i>8</i></span>';
    case 'aetheria':return '<span class="stamp" style="color:#7ad0ff;border-color:#7ad0ff;background:#c45a9a44">47.2 Hz</span>';
    case 'hfsunday':return '<span class="stamp" style="color:#8B1E1E;border-color:#8B1E1E">SUNDAYS</span>';
    case 'velloria':return '<span class="stamp" style="color:#c9a24e;border-color:#c9a24e;background:#4a2a6a33">16 PAGES</span>';
    case 'bananaodyssey':return '<span class="stamp" style="color:#2a5a2a;border-color:#2a5a2a;background:#fff3">WATCH THE PEEL</span>';
    case 'americanredpie':return '<span class="stamp" style="color:#1a3a6e;border-color:#1a3a6e;background:#c4282d33">AMERICAN RED PIE</span>';
    case 'tatteredcarrotcake':return '<span class="stamp" style="color:#5a7a3a;border-color:#5a7a3a;background:#d44a2a33">THREE LAYERS</span>';
    case 'parmesangelato':return '<span class="stamp" style="color:#3a5a2a;border-color:#3a5a2a;background:#c9a22733">PARMESAN GELATO</span>';
    case 'fringepactkitchen':return '<span class="stamp" style="color:#c45a9a;border-color:#c45a9a;background:#6ec8ff33">FRINGE PACT KITCHEN</span>';
    case 'tunnelstew':return '<span class="stamp" style="color:#5a8aaa;border-color:#5a8aaa;background:#e07a3a33">TUNNEL STEW</span>';
    case 'nectarbrew':return '<span class="stamp" style="color:#a05ad0;border-color:#a05ad0;background:#5eb0ff33">NECTAR BREW</span>';
    case 'linemanmultiverse':return '<span class="stamp" style="color:#ffd24a;border-color:#ffd24a;background:#ff3d9a33">LINEMAN MULTIVERSE</span>';
    case 'invisiblearteries':return '<span class="stamp" style="color:#2a4a6a;border-color:#2a4a6a;background:#c45a1a33">INVISIBLE ARTERIES</span>';
    case 'answeringline1':return '<span class="stamp" style="color:#c4a45a;border-color:#c4a45a;background:#8a9bb833">ANSWERING LINE I</span>';
    case 'answeringline2':return '<span class="stamp" style="color:#a4844a;border-color:#a4844a;background:#6a7a9833">ANSWERING LINE II</span>';
    case 'beards1812':return '<span class="stamp" style="color:#8B1E1E;border-color:#8B1E1E;background:#5a3a1a22">1812 WHISKERS</span>';
    case 'redhorizonch1':return '<span class="stamp" style="color:#2a1010;border-color:#2a1010;background:#7ad0ff55">RED HORIZON CH. 1</span>';
  }return r.mark?'<span class="stamp">'+esc(r.mark)+'</span>':'';
}
function hasTag(r,t){return (r.tags||[]).indexOf(t)>=0||r.collection===t}
function isKitchen(r){return hasTag(r,'kitchen')||r.collection==='kitchen'||r.collection==='mrpete_recipes'||!!r.recipe}
function isArticle(r){return r.collection==='mrpete_articles'||r.collection==='press'||r.collection==='mrpete_press'||hasTag(r,'press')}
function isFringeKitchen(r){return r.collection==='mrpete_recipes'||(hasTag(r,'kitchen')&&hasTag(r,'echoes')&&r.no!=='36')}
function edLabel(r){
  if(isFringeKitchen(r))return '1-OF-1 ECHOES LORE RECIPE · IN-UNIVERSE FRINGE KITCHEN · RELIC No. '+r.no;
  if(isKitchen(r)&&r.recipe)return '1-OF-1 RECIPE RELIC · COOK AT HOME · RELIC No. '+r.no;
  if(r.collection==='mrpete_articles')return '1-OF-1 @MRPETECASTIC NATIVE X ARTICLE · RELIC No. '+r.no;
  if(r.collection==='mrpete_press')return '1-OF-1 @MRPETECASTIC STORY CLIPPING · RELIC No. '+r.no;
  if(r.collection==='press')return '1-OF-1 @PETECASTIC X ARTICLE · RELIC No. '+r.no;
  if(hasTag(r,'echoes')||r.collection==='echoes')return '1-OF-1 LITERARY MANUSCRIPT RELIC · ANSWERING LINE ARCHIVE · RELIC No. '+r.no;
  return '1-OF-1 LITERARY MANUSCRIPT RELIC · HOLLOW DESK ARCHIVE · RELIC No. '+r.no;
}
function badgeHTML(r){
  if(isFringeKitchen(r))return '<span class="rbadge kitchen fringe">ECHOES LORE RECIPE · IN-UNIVERSE FRINGE KITCHEN</span>';
  if(isKitchen(r)&&r.recipe)return '<span class="rbadge kitchen">RECIPE RELIC · COOK AT HOME</span>';
  if(r.collection==='mrpete_articles')return '<span class="rbadge mrpete article">𝕏 @MRPETECASTIC · NATIVE X ARTICLE</span>';
  if(r.collection==='mrpete_press')return '<span class="rbadge mrpete">𝕏 @MRPETECASTIC · STORY CLIPPING</span>';
  if(r.collection==='press')return '<span class="rbadge press">𝕏 @PETECASTIC · X ARTICLE</span>';
  if(hasTag(r,'echoes')||r.collection==='echoes')return '<span class="rbadge echoes">ECHOES OF THE HORIZON</span>';
  return '<span class="rbadge hollow">HOLLOW FILES</span>';
}
function relicFace(r){
  var cls='relic p-'+r.sk+(isKitchen(r)?' recipe':'')+(isArticle(r)?' press':'');
  return '<button class="'+cls+'" data-r="'+r.no+'" data-c="'+esc(r.collection||'')+'" aria-label="Read relic '+r.no+': '+esc(r.title)+'">'+
   (r.sk==='switchtag'||r.sk==='emptytag'?'<span class="relgrom grommet"></span>':'')+(r.sk==='hepzibah'?'<span class="tea"></span>':'')+
   (r.sk==='torncard'?'<span class="tear" aria-hidden="true"></span><span class="tape" aria-hidden="true"></span>':'')+
   (r.sk==='orderslip'?'<span class="sugardust" aria-hidden="true"></span>':'')+
   (r.sk==='wokcard'?'<span class="fwooomp" aria-hidden="true">FWOOOMP</span>':'')+
   (r.sk==='pierogi'||r.sk==='roastpork'?'<span class="indexrule" aria-hidden="true"></span>':'')+
   (r.sk==='americanredpie'?'<span class="lattice" aria-hidden="true"></span>':'')+
   (r.sk==='parmesangelato'?'<span class="playdiagram" aria-hidden="true"></span>':'')+
   badgeHTML(r)+
   '<span class="ed">'+edLabel(r)+'</span>'+(r.sk==='tallow'?'<span class="label">NOT AIRED <span>not aired</span></span>':'')+
   '<h3>\u201C'+esc(r.title)+'\u201D</h3><span class="src">'+esc(r.src)+' — '+esc(r.where)+'</span>'+
   '<span class="body">'+r.paras.map(function(p){return '<p>'+emph(p)+'</p>'}).join('')+'</span>'+
   '<span class="read">'+(r.recipe?'OPEN THE FULL RECIPE ▸':'OPEN THE ARCHIVAL READER ▸')+'</span><span class="mk">'+markHTML(r)+'</span></button>';
}
var RFIL='all';
function rCount(tag){return D.relics.filter(function(r){return tag==='all'||hasTag(r,tag)}).length}
function buildRFilters(){
  return [
    ['all','All '+rCount('all')],
    ['mrpete','@MrPetecastic ('+rCount('mrpete')+')'],
    ['kitchen','Recipe Box ('+rCount('kitchen')+')'],
    ['press','X Articles & Press ('+rCount('press')+')'],
    ['echoes','Echoes of the Horizon ('+rCount('echoes')+')'],
    ['hollow','Hollow Files ('+rCount('hollow')+')']
  ];
}
function renderRFilters(){var f=$('#rpills');if(!f)return;f.innerHTML=buildRFilters().map(function(x){return '<button data-rf="'+x[0]+'" class="'+(x[0]===RFIL?'on ':'')+(x[0]==='mrpete'?'mrpete':'')+'">'+esc(x[1])+'</button>'}).join('')}
function matchRFil(r){
  if(RFIL==='all')return true;
  return hasTag(r,RFIL);
}
function renderRelics(){
  var list=D.relics.filter(matchRFil);
  $('#relics').innerHTML=list.map(relicFace).join('');
  var e=$('#rempty');if(e)e.hidden=list.length>0;
}
renderRFilters();renderRelics();
$('#rpills')&&$('#rpills').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;RFIL=b.dataset.rf;renderRFilters();renderRelics()});
$('#relics').addEventListener('click',function(e){var b=e.target.closest('.relic');if(b)openReader(b.dataset.r)});
function recipeBlock(r){
  var rec=r.recipe;if(!rec)return '';
  return '<div class="recipebox"><div class="rh">'+(isFringeKitchen(r)?'🌌 ECHOES LORE RECIPE · IN-UNIVERSE FRINGE KITCHEN':'🍳 FULL COOK-AT-HOME RECIPE')+'</div><div class="ryield">'+esc(rec.yield)+'</div>'+
   '<div class="rsec"><b>INGREDIENTS</b><ul>'+rec.ingredients.map(function(i){return '<li>'+esc(i)+'</li>'}).join('')+'</ul></div>'+
   '<div class="rsec"><b>STEPS</b><ol>'+rec.steps.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ol></div>'+
   (rec.note?'<div class="rnote">'+esc(rec.note)+'</div>':'')+
   '<div class="bearbox"><b>🐾 Bear\u2019s Dog-Safe Bite</b><p>'+esc(rec.bear)+'</p></div>'+
   '<div class="rtools"><button class="ab" id="copyRec">🖨️ Print / Copy Recipe</button></div></div>';
}
function recipePlain(rec){
  return [rec.name,rec.yield,'','INGREDIENTS'].concat(rec.ingredients.map(function(i){return '• '+i})).concat(['','STEPS']).concat(rec.steps.map(function(s,i){return (i+1)+'. '+s})).concat(rec.note?['','NOTE',rec.note]:[]).concat(['','BEAR\'S DOG-SAFE BITE',rec.bear,'','(From the X-Comix Card & Merch Shop · petecastic.github.io/xcomix-memory/shop/)']).join('\n');
}
function openReader(no){
  var r=D.relics.filter(function(x){return x.no===no})[0];if(!r)return;var b=$('#readBox');
  b.className='ovbox reader relic p-'+r.sk+(r.recipe?' hasrecipe':'');b.style.aspectRatio='auto';b.style.cursor='default';
  var xbtn=r.x_url?'<a class="ab sol" href="'+esc(r.x_url)+'" target="_blank" rel="noopener">𝕏 Read Original on X ↗</a>':'';
  b.innerHTML='<div class="wx"></div><button class="x" aria-label="Close">✕</button>'+(r.sk==='switchtag'||r.sk==='emptytag'?'<span class="relgrom grommet"></span>':'')+
   (r.sk==='torncard'?'<span class="tear" aria-hidden="true"></span><span class="tape" aria-hidden="true"></span>':'')+
   badgeHTML(r)+
   '<span class="ed">'+edLabel(r)+'</span>'+(r.sk==='tallow'?'<span class="label">NOT AIRED <span>not aired</span></span>':'')+
   '<h3>\u201C'+esc(r.title)+'\u201D</h3><span class="src">'+esc(r.sub)+'</span>'+
   '<div class="body">'+r.paras.map(function(p){return '<p>'+emph(p)+'</p>'}).join('')+'</div>'+
   recipeBlock(r)+
   '<div class="prov"><b>PROVENANCE</b><br>'+esc(r.src)+' — '+esc(r.where)+' · '+r.words+' words, verbatim<br><b>PAPER STOCK</b><br>'+esc(r.paper)+'<br><b>EDITION</b><br>One of one. Pure literary'+(r.recipe?' / recipe':'')+(isArticle(r)?' / press':'')+' collectible: the typeset passage is the card face.</div>'+
   '<div class="rtools"><button class="ab ambbtn">'+(amb&&amb.on?'🔊 Sky Ambience: ON':'🔈 Sky Ambience: OFF')+'</button><span class="ab" style="cursor:default">Mood: <span class="skynow"></span></span>'+xbtn+'</div>';
  $('#readOv').classList.add('show');document.body.style.overflow='hidden';$('.x',b).onclick=closeAll;
  var cb=$('#copyRec');if(cb&&r.recipe){cb.onclick=function(){var txt=recipePlain(r.recipe);
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(function(){cb.textContent='\u2714 Copied \u2014 paste into Notes / print';setTimeout(function(){cb.textContent='🖨️ Print / Copy Recipe'},2200)}).catch(function(){window.prompt('Copy recipe:',txt)});
    else window.prompt('Copy recipe:',txt)}}
  apply();
}

/* ---------------- Shelf 3: motion cards ---------------- */
$('#motion').innerHTML=D.motion.map(function(m){
  return '<div class="mcard" role="button" tabindex="0" data-m="'+m.id+'"><span class="ed1">1-OF-1 GOLD HOLO</span><div class="scr"><video autoplay loop muted playsinline preload="metadata" poster="assets/motion/'+m.id+'.jpg" src="assets/motion/'+m.id+'.mp4"></video><div class="holo"></div></div>'+
   '<div class="mt"><small>'+esc(m.kind)+'</small><b>'+esc(m.show)+' — \u201C'+esc(m.title)+'\u201D</b><em>'+esc(m.ed)+' · '+esc(m.note)+'</em></div></div>';
}).join('');
$$('#motion video').forEach(function(v){v.muted=true;var p=v.play();if(p&&p.catch)p.catch(function(){})});
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){var v=en.target;if(en.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.15});$$('#motion video').forEach(function(v){io.observe(v)})}
$('#motion').addEventListener('click',function(e){var c=e.target.closest('.mcard');if(!c)return;var m=D.motion.filter(function(x){return x.id===c.dataset.m})[0],b=$('#thBox');
  b.innerHTML='<button class="x" aria-label="Close">✕</button><video controls autoplay loop muted playsinline poster="assets/motion/'+m.id+'.jpg" src="assets/motion/'+m.id+'.mp4"></video><div class="mt"><small>'+esc(m.kind)+' · '+esc(m.ed)+'</small><b>'+esc(m.show)+' — \u201C'+esc(m.title)+'\u201D</b></div>';
  $('#thOv').classList.add('show');document.body.style.overflow='hidden';$('.x',b).onclick=closeAll;});

/* overlays */
function closeAll(){$$('.ovl.show').forEach(function(o){o.classList.remove('show');var v=$('video',o);if(v)v.pause();if(o.id==='thOv')o.querySelector('.ovbox').innerHTML=''});document.body.style.overflow=''}
$$('.ovl').forEach(function(o){o.addEventListener('click',function(e){if(e.target===o)closeAll()})});

/* VIP + escrow proof badge (read-only) */
try{if(window.DKVIP){DKVIP.badge($('#lockBadge'));$('#vipBtn').onclick=function(){DKVIP.open()}}}catch(e){}

/* boot */
renderFilters();renderCards();apply();loadSky();setInterval(loadSky,30*60*1000);
var qs=new URLSearchParams(location.search),qc=qs.get('card'),qr=qs.get('relic');
if(qc!==null&&/^\d{1,3}$/.test(qc)&&+qc<29){if(qs.get('living')==='1')NFT=true;openIns(+qc)}
else if(qr&&/^\d{2}$/.test(qr))openReader(qr);
})();
