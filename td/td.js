/* 12:49 Defense - X-COMIX tower defense. Plain ES5, fixed-step sim. */
(function(){
'use strict';
var D=TD_DATA,TW=D.TOWERS,EN=D.ENEMIES,MAPS=D.MAPS,MODS=D.MODS;
var W=800,H=500,T=50,COLS=16,ROWS=10,STEP=1/60;
var URL='https://petecastic.github.io/xcomix-memory/td/';
var EMBED=document.body.className.indexOf('embed')>=0;
var TBY={};for(var i=0;i<TW.length;i++)TBY[TW[i].id]=TW[i];
function $(id){return document.getElementById(id);}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function dist2(ax,ay,bx,by){var dx=ax-bx,dy=ay-by;return dx*dx+dy*dy;}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function mul32(a,b){return Math.imul?Math.imul(a,b):((((a>>>16)*b)<<16)+(a&65535)*b)|0;}
function hash(s){s=String(s);var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=mul32(h,16777619);}return h>>>0;}
function rng(seed){var a=seed>>>0||1;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=mul32(t^(t>>>15),t|1);t^=t+mul32(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
/* ---------- save ---------- */
var SK='xc_td_v1',S;
function load(){var s=null;try{s=JSON.parse(localStorage.getItem(SK));}catch(e){}s=s&&typeof s==='object'?s:{};s.xp=+s.xp||0;s.maps=s.maps||{};s.daily=s.daily||{};s.snd=!!s.snd;s.games=+s.games||0;return s;}
function save(){try{localStorage.setItem(SK,JSON.stringify(S));}catch(e){}}
S=load();
var LV=[0,250,550,900,1300,1750,2250,2800,3400,4050,4750,5500,6300,7200,8200,9300];
function level(xp){var l=0;for(var i=0;i<LV.length;i++)if(xp>=LV[i])l=i+1;return l;}
function unlocked(t){return level(S.xp)>=t.lv;}
function mapRec(id){return S.maps[id]||(S.maps[id]={stars:0,hard:0,endless:0});}
function mapOpen(i){return i===0||mapRec(MAPS[i-1].id).stars>0;}
function today(){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function dailyCfg(){var key=today(),r=rng(hash('td-daily-'+key)),mi=Math.floor(r()*MAPS.length),mod=MODS[Math.floor(r()*MODS.length)];
 var ids=[];for(var i=0;i<TW.length;i++)ids.push(TW[i].id);var pick=[];while(pick.length<5){var k=Math.floor(r()*ids.length);pick.push(ids.splice(k,1)[0]);}
 var det=['pete','marjorie','jimmy','stanley','dom','salt','lumos','rumple','wheel'],ok=false;for(i=0;i<pick.length;i++)if(det.indexOf(pick[i])>=0)ok=true;if(!ok)pick[4]='rumple';
 return {key:key,map:mi,mod:mod,towers:pick};}
/* ---------- audio (off by default) ---------- */
var AC=null;
function sfx(k){if(!S.snd)return;try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(!C)return;AC=new C();}
 var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime,f={pop:520,zap:900,boom:110,coin:1200,place:330,up:660,lose:140,win:784,honk:240,gulp:180}[k]||440;
 o.type=k==='zap'?'sawtooth':k==='boom'||k==='honk'?'square':'triangle';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(Math.max(60,f*(k==='win'||k==='up'||k==='coin'?1.5:0.55)),t+0.12);
 g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.0008,t+0.16);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+0.18);}catch(e){}}
/* ---------- images ---------- */
var IMG={},names=['peter','krampus','marjorie','tabby','jimmy','trashwheel','stanley','pixel','gus','dom','watt','pikaru','salt','lumos','bartender','rumple','tess','gully','kappa','pell','sucks','overmind','tank','bigsal','zib','bear'];
for(i=0;i<names.length;i++){(function(n){var im=new Image();im.src='img/'+n+'.png';IMG[n]=im;})(names[i]);}
function ok(im){return im&&im.complete&&im.naturalWidth>0;}
var G=null;
function pathGeom(p){var pts=[],len=0,seg=[];for(var i=0;i<p.length;i++)pts.push([p[i][0]*T+T/2,p[i][1]*T+T/2]);
 for(i=1;i<pts.length;i++){var l=Math.sqrt(dist2(pts[i][0],pts[i][1],pts[i-1][0],pts[i-1][1]));seg.push(l);len+=l;}return {pts:pts,seg:seg,len:len};}
function posAt(pg,d){d=clamp(d,0,pg.len);for(var i=0;i<pg.seg.length;i++){if(d<=pg.seg[i]||i===pg.seg.length-1){var a=pg.pts[i],b=pg.pts[i+1],f=pg.seg[i]?Math.min(1,d/pg.seg[i]):0;return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,dx:b[0]-a[0],dy:b[1]-a[1]};}d-=pg.seg[i];}return {x:0,y:0,dx:1,dy:0};}
function decoFor(m){var d=[];
 if(m.id==='mill'){d.push({k:'rows',c:0,r:0,w:16},{k:'clock',c:6,r:4},{k:'tree',c:1,r:5},{k:'tree',c:1,r:8},{k:'tree',c:11,r:5},{k:'tree',c:15,r:5},{k:'tree',c:6,r:9});}
 if(m.id==='river'){d.push({k:'rows',c:12,r:0,w:4},{k:'tree',c:1,r:1},{k:'tree',c:9,r:4},{k:'tree',c:14,r:3},{k:'tree',c:5,r:4});}
 if(m.id==='pike'){d.push({k:'booth',c:6,r:4},{k:'booth',c:10,r:4});}
 if(m.id==='ring'){d.push({k:'pod',c:15,r:3},{k:'pod',c:0,r:3},{k:'spire',c:4,r:6},{k:'spire',c:15,r:9},{k:'echo',c:10,r:6,w:3});}
 if(m.id==='el'){d.push({k:'spire',c:8,r:2},{k:'spire',c:13,r:8},{k:'spire',c:2,r:4},{k:'spire',c:14,r:2});}
 if(m.id==='overlap'){d.push({k:'portal',c:7,r:4},{k:'rows',c:0,r:9,w:7},{k:'echorows',c:12,r:0,w:4},{k:'spire',c:14,r:5},{k:'spire',c:10,r:6},{k:'tree',c:1,r:4},{k:'tree',c:5,r:3});}
 return d;}
function newGame(mi,mode,daily){
 var m=MAPS[mi],hard=mode==='hard',dc=daily||null,mod=dc?dc.mod.id:'';
 var g={mi:mi,map:m,mode:mode,hard:hard,daily:dc,mod:mod,cash:(hard?550:650)+mi*90,lives:hard?10:20,wave:0,N:mode==='endless'?Infinity:dc?12:hard?20:15,
  en:[],tw:[],pr:[],fx:[],tx:[],bub:[],queue:[],qt:0,t:0,speed:1,paused:false,over:false,auto:false,sel:null,place:null,ghost:null,rangeMult:1,
  storm:0,stormIn:0,mainCD:0,zibW:0,zib:null,zibDone:false,leaked:0,kills:0,bossOn:null,paths:[],grid:[],uid:1,waveActive:false,autoT:0};
 if(mod==='irreg'){g.cash*=2;g.lives=5;}
 g.maxLives=g.lives;
 for(var i=0;i<m.paths.length;i++)g.paths.push(pathGeom(m.paths[i]));
 for(var r=0;r<ROWS;r++){g.grid.push([]);for(var c=0;c<COLS;c++)g.grid[r].push(0);}
 for(i=0;i<m.paths.length;i++){var p=m.paths[i];for(var j=1;j<p.length;j++){var a=p[j-1],b=p[j],sx=b[0]>a[0]?1:b[0]<a[0]?-1:0,sy=b[1]>a[1]?1:b[1]<a[1]?-1:0,x=a[0],y=a[1];
   for(var n=0;n<40;n++){if(x>=0&&x<COLS&&y>=0&&y<ROWS)g.grid[y][x]=1;if(x===b[0]&&y===b[1])break;x+=sx;y+=sy;}}}
 g.deco=decoFor(m);
 for(i=0;i<g.deco.length;i++){var d=g.deco[i],big=(d.k==='clock'||d.k==='portal'),w=d.w||(big?2:1),h=big?2:1;
  if(d.k==='echo')continue;for(var yy=d.r;yy<d.r+h;yy++)for(var xx=d.c;xx<d.c+w;xx++)if(yy<ROWS&&xx<COLS&&g.grid[yy][xx]===0)g.grid[yy][xx]=2;}
 if(m.water)for(r=m.water;r<ROWS;r++)for(c=0;c<COLS;c++)if(g.grid[r][c]===0)g.grid[r][c]=2;
 if(m.block)for(i=0;i<m.block.length;i++){var bl=m.block[i];if(g.grid[bl[1]][bl[0]]===0)g.grid[bl[1]][bl[0]]=2;}
 var zr=rng(hash(m.id+mode+(dc?dc.key:'')));g.zibW=3+Math.floor(zr()*6);
 return g;}
function allowed(t){if(G&&G.daily)return G.daily.towers.indexOf(t.id)>=0;return unlocked(t);}
function costOf(c){return Math.round(c*(G&&G.mod==='bff'?0.8:1));}
/* ---------- waves ---------- */
function hpMult(w){var m=(1+(G.map.diff-1)*Math.min(1,0.3+w/12))*(1+0.055*(w-1));if(G.hard)m*=1.3;if(G.mod==='tmrw')m*=1.4;if(w>15)m*=Math.pow(1.09,w-15);return m;}
var BAL={b:20,e:1.5,c:20,dm:2.5,k:1.2,wb:1.35};
function buildWave(w){
 var m=G.map,r=rng(hash(m.id+'|'+w+'|'+G.mode)),out=[],t=0;
 var budget=BAL.b*Math.pow(w,BAL.e)+BAL.c;
 var avail=[],tot=0;for(var i=0;i<m.pool.length;i++)if(m.pool[i][1]<=w){avail.push(m.pool[i]);tot+=m.pool[i][2];}
 var N=G.N,isBoss=(w===N&&N!==Infinity)||(N===Infinity&&w%15===0),isMini=!isBoss&&w%5===0;
 var ng=1+(w>3?1:0)+(w>8?1:0)+(w>16?1:0);
 if(isBoss||isMini)budget*=0.6;
 for(var gI=0;gI<ng;gI++){var x=r()*tot,ty=avail[0][0];for(i=0;i<avail.length;i++){x-=avail[i][2];if(x<=0){ty=avail[i][0];break;}}
  var E=EN[ty],cnt=clamp(Math.round(budget/ng/E.hp),2,60),gap=Math.max(0.12,(18/E.spd)*Math.max(0.55,1-w*0.02));
  for(var k=0;k<cnt;k++)out.push({t:t+k*gap,ty:ty,p:Math.floor(r()*G.paths.length)});
  t+=cnt*gap*0.55+0.8;}
 if(isMini){var mt=(m.mini2&&w%10===0)?m.mini2:m.mini,mc=w>=15?2:1;if(N===Infinity)mc=1+Math.floor(w/10);for(k=0;k<mc;k++)out.push({t:1.5+k*2.5,ty:mt,p:k%G.paths.length});}
 if(isBoss){var bc=N===Infinity?Math.floor(w/15):1;for(k=0;k<bc;k++)out.push({t:2+k*6,ty:m.boss,p:k%G.paths.length});}
 out.sort(function(a,b){return a.t-b.t;});
 var fog=m.fog||(G.mod==='glitch'?0.25:0);if(fog&&w>=6)for(i=0;i<out.length;i++)if(!EN[out[i].ty].boss&&!EN[out[i].ty].mini&&r()<fog)out[i].camo=1;
 return out;}
function warnWave(){var ha=false,hc=false,ta=false,tc=false,i;for(i=0;i<G.queue.length;i++){var q=G.queue[i],E=EN[q.ty];if(E.air)ha=true;if(E.camo||q.camo)hc=true;}
 for(i=0;i<G.tw.length;i++){if(G.tw[i].s.air)ta=true;if(G.tw[i].s.detect)tc=true;}
 var m=[];if(ha&&!ta)m.push('Flyers incoming! Your crew can\u2019t hit the air.');if(hc&&!tc)m.push('Hidden enemies! Get detection (Bear Rides Along, Hiss, Flashlight...)');
 for(i=0;i<m.length;i++)text(W/2,H/2+10+i*24,m[i],'#ffd166',15);}
function startWave(){
 if(!G||G.over||G.wave>=G.N||G.queue.length)return;
 if(G.wave>0)payBonus();
 G.wave++;G.queue=buildWave(G.wave);G.qt=0;G.waveActive=true;G.autoT=0;warnWave();
 if(G.wave===G.zibW&&!G.zibDone){G.zib={x:-30,y:60+Math.random()*80,t:0};}
 ui.hud();}
function payBonus(){var b=Math.round((55+8*G.wave)*(1+0.1*(G.mi||0))*BAL.wb)*(G.mod==='tmrw'?2:1);for(var i=0;i<G.tw.length;i++)b+=G.tw[i].s.waveCash||0;G.cash+=b;text(W/2,H/2-40,'Wave '+G.wave+' bonus +'+cur()+b,'#ffe27a',16);}
function cur(){return G.map.cur==='$'?'$':'\u2726';}
function spawn(q){var E=EN[q.ty],w=G.wave,hm=E.boss?(G.hard?1.3:1)*(G.mod==='tmrw'?1.4:1)*(w>15?(1+(w-15)*0.09):1):hpMult(w);
 var spd=E.spd*(G.hard?1.1:1)*(G.mod==='honk'?1.2:1);
 var e={id:G.uid++,ty:q.ty,E:E,hp:E.hp*hm,max:E.hp*hm,spd:spd,armor:E.armor||0,air:!!E.air,camo:!!(E.camo||q.camo),boss:!!E.boss,mini:!!E.mini,p:q.p,d:q.d||0,x:0,y:0,dir:1,
  slowM:0,slowT:0,stun:0,seas:0,seasT:0,amp:0,ampT:0,mark:0,strip:0,shield:0,ling:0,lingD:0,tl:{},cd:3,flag:0,hit:0,ph:Math.random()*6,rev:false,ramp:0};
 var pp=posAt(G.paths[e.p],e.d);e.x=pp.x;e.y=pp.y;G.en.push(e);
 if(E.boss){G.bossOn=e;bubble(e.x,e.y-40,E.line,3);sfx('boom');}
 else if(E.mini)bubble(e.x,e.y-30,E.line,2.5);
 if(E.storm&&!G.storm&&!G.stormIn&&(G.map.cur!=='$'||G.map.id==='overlap'))G.stormIn=4;
 return e;}
function text(x,y,s,c,sz){G.tx.push({x:x,y:y,s:s,c:c||'#fff',sz:sz||12,t:0});}
function bubble(x,y,s,dur){if(G.bub.length>5)G.bub.shift();G.bub.push({x:clamp(x,60,W-60),y:clamp(y,30,H-10),s:s,t:0,d:dur||2.2});}
function fx(o){o.t=0;if(G.fx.length<200)G.fx.push(o);}
function statsOf(t){var b=TBY[t.id],s={};for(var k in b)if(typeof b[k]!=='object'&&typeof b[k]!=='function')s[k]=b[k];
 for(var p=0;p<2;p++)for(var i=0;i<t.lv[p];i++)b.paths[p].u[i].f(s);return s;}
function canHit(t,e){return !e.dead&&(!e.air||t.s.air)&&(!e.camo||t.s.detect||e.rev);}
function rangeOf(t){return t.s.range*(1+t.bRange)*G.rangeMult;}
function inRange(t,e,r){return dist2(t.x,t.y,e.x,e.y)<=r*r;}
function remain(e){return G.paths[e.p].len-e.d;}
function targets(t,r,n,mode){var c=[];for(var i=0;i<G.en.length;i++){var e=G.en[i];if(canHit(t,e)&&inRange(t,e,r))c.push(e);}
 mode=mode||t.mode;
 c.sort(mode==='strong'?function(a,b){return b.hp-a.hp;}:mode==='last'?function(a,b){return remain(b)-remain(a);}:mode==='close'?function(a,b){return dist2(t.x,t.y,a.x,a.y)-dist2(t.x,t.y,b.x,b.y);}:function(a,b){return remain(a)-remain(b);});
 return n?c.slice(0,n):c;}
function hit(e,dmg,t,o){if(e.dead||dmg<=0)return;o=o||{};
 dmg*=BAL.dm;var arm=Math.max(0,e.armor-e.strip-(o.ap||0)),d=Math.max(dmg*0.25,dmg-arm);
 var m=1+(e.seasT>0?e.seas:0)+(e.ampT>0?e.amp:0)+e.mark+(e.rev?e.ramp:0);
 if(t){if(e.boss&&t.s.bossMult)m*=t.s.bossMult;if(e.ty==='hound'&&t.s.houndMult)m*=t.s.houndMult;if(e.air&&t.s.airMult)m*=t.s.airMult;m*=1+t.bDmg;}
 d*=m;if(e.shield>0){var a=Math.min(e.shield,d);e.shield-=a;d-=a;}
 e.hp-=d;e.hit=0.08;if(t)t.dealt+=d;
 if(e.E.honk&&!e.flag&&e.hp<e.max*0.5){e.flag=1;e.spd*=1.35;text(e.x,e.y-14,'HONK!','#fff',13);sfx('honk');}
 if(e.ty==='kappa'&&!e.flag&&e.hp<e.max*0.5){e.flag=1;bubble(e.x,e.y-40,'...I dropped them.',2.5);for(var i=0;i<8;i++)spawn({ty:'snack',p:e.p,d:Math.max(0,e.d-6-i*9)});}
 if(e.ty==='crawler'){var q=Math.floor((1-e.hp/e.max)*4);if(q>e.flag&&q<4){e.flag=q;fx({k:'quake',x:e.x,y:e.y});for(i=0;i<6;i++)spawn({ty:'mite',p:e.p,d:Math.max(0,e.d-20-i*12)});}}
 if(e.hp<=0)kill(e,t);}
function kill(e,t,gulp){if(e.dead)return;e.dead=true;G.kills++;
 var cash=Math.round(e.E.r*BAL.k)+(t&&t.s.cashPerKill||0);G.cash+=cash;
 if(e.boss){bubble(e.x,e.y-40,e.E.out,3);sfx('win');if(G.bossOn===e)G.bossOn=null;text(e.x,e.y-60,'CALMED! +'+cur()+cash,'#ffe27a',16);}
 else if(t&&t.s.cashPerKill)text(e.x,e.y-10,'+'+cur()+cash,'#ffe27a',10);
 fx({k:gulp?'gulp':'poof',x:e.x,y:e.y,s:e.E.sz});sfx(gulp?'gulp':'pop');
 if(e.E.split)for(var i=0;i<e.E.splitN;i++){var c=spawn({ty:e.E.split,p:e.p,d:Math.max(0,e.d-i*10)});c.camo=e.camo;}}
function stun(e,s){if(e.boss)s*=0.35;e.stun=Math.max(e.stun,s);}
function slow(e,m,s){if(e.boss)m*=0.5;if(m>=e.slowM||e.slowT<=0){e.slowM=m;}e.slowT=Math.max(e.slowT,s);}
function shoot(t,e,type,dmg,o){o=o||{};var a=Math.atan2(e.y-t.y,e.x-t.x),sp=o.spd||520;
 G.pr.push({x:t.x,y:t.y-14,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,sp:sp,tg:e,dmg:dmg,t:t,type:type,pierce:o.pierce||1,hits:{},life:o.life||1.4,homing:o.homing!==false,rad:o.rad||8});}
function onProjHit(p,e){var t=p.t,s=t.s;
 if(p.type==='splitter'&&s.split){for(var i=0;i<s.split;i++){var a=i/s.split*Math.PI*2+0.3;G.pr.push({x:e.x,y:e.y,vx:Math.cos(a)*380,vy:Math.sin(a)*380,sp:380,tg:null,dmg:2+(s.splitDmg||0),t:t,type:'shard',pierce:s.splitPierce||1,hits:{},life:0.32,homing:false,rad:7,skip:e.id});}}
 if(p.type==='citation'){slow(e,s.slow,s.slowT);if(s.stripHit&&e.strip<3)e.strip++;if(s.amp){e.amp=s.amp;e.ampT=2.5;}}
 if(p.type==='pretzel'){if(s.pretzelSplash){var r2=s.pretzelSplash*s.pretzelSplash;for(var j=0;j<G.en.length;j++){var o=G.en[j];if(o!==e&&!o.dead&&(!o.camo||o.rev)&&dist2(o.x,o.y,e.x,e.y)<r2){hit(o,p.dmg*0.6,t);slow(o,0.3,1.5);}}slow(e,0.3,1.5);fx({k:'ring',x:e.x,y:e.y,r:s.pretzelSplash,c:'#f5c400'});}}
 if(p.type==='receipt'&&s.confuse&&Math.random()<s.confuse){stun(e,0.5);text(e.x,e.y-12,'\u2665','#ff7fb3',14);}
}
function towerUpdate(t,dt){var s=t.s,r=rangeOf(t),rate=(s.rate||1)*(1+t.bRate),list,i,e,n;
 if(t.off>0){t.off-=dt;t.beam=null;return;}
 t.cd-=dt;t.cd2-=dt;t.cd3-=dt;t.tick-=dt;
 switch(s.kind){
 case 'proj':case 'toll':
  if(s.kind==='toll'){for(i=0;i<G.en.length;i++){e=G.en[i];if(!e.dead&&!e.boss&&!e.tl[t.uid]&&inRange(t,e,r)){e.tl[t.uid]=1;G.cash+=s.toll;if(Math.random()<0.35)text(e.x,e.y-12,'+'+cur()+s.toll,'#7dffb0',10);}}
   if(s.no&&t.cd3<=0){list=targets(t,r,1,'strong');if(list.length){t.cd3=s.no;stun(list[0],2);bubble(t.x,t.y-50,'no.',1.2);}}}
  if(t.cd<=0){list=targets(t,r,s.multi||1);if(list.length){t.cd=1/rate;t.bob=0.08;for(i=0;i<list.length;i++)shoot(t,list[i],s.proj,s.dmg,{pierce:s.pierce,spd:s.proj==='citation'?420:520});}}
  if(s.freeze&&t.cd2<=0){list=targets(t,r);if(list.length){t.cd2=s.freeze;for(i=0;i<list.length;i++)stun(list[i],1.5);fx({k:'ring',x:t.x,y:t.y,r:r,c:'#bfe3ff'});bubble(t.x,t.y-50,'Cease and desist.',1.4);}}
  if(s.whip&&t.tick<=0){t.tick=0.25;list=targets(t,70);for(i=0;i<list.length;i++)hit(list[i],s.whip*0.25,t);if(list.length&&Math.random()<0.3)fx({k:'whip',x:t.x,y:t.y});}
  if(s.watt&&t.cd2<=0){list=targets(t,r);if(list.length){var wr=s.watt;if(s.wattPanic&&list.length>=3)wr*=3;t.cd2=1/(wr*(1+t.bRate));shoot(t,list[0],'bolt',s.wattDmg||2,{spd:640});}}
  break;
 case 'pulse':
  if(t.cd<=0&&t.rep<=0){list=targets(t,r);if(list.length){t.cd=1/rate;t.rep=(s.repeat||1);t.repT=0;}}
  if(t.rep>0){t.repT-=dt;if(t.repT<=0){t.rep--;t.repT=0.16;var last=t.rep===0&&s.lockout;list=targets(t,r);
    for(i=0;i<list.length;i++){e=list[i];hit(e,s.dmg+(last?10:0),t);if(last)stun(e,0.8);if(s.knock&&!e.boss&&!e.mini)e.d=Math.max(0,e.d-s.knock);if(s.strip)e.strip=Math.max(e.strip,s.strip);}
    fx({k:'ring',x:t.x,y:t.y+10,r:r,c:last?'#fff27a':'#ffd23a'});t.bob=0.15;}}
  if(s.pretzel&&t.cd2<=0){var all=[];for(i=0;i<G.en.length;i++){e=G.en[i];if(!e.dead&&(!e.camo||e.rev||s.detect)&&inRange(t,e,r*1.6))all.push(e);}
   all.sort(function(a,b){return remain(a)-remain(b);});if(all.length){t.cd2=1.2;shoot(t,all[0],'pretzel',s.pretzel,{spd:380});}}
  break;
 case 'melee':
  if(t.cd<=0){list=targets(t,r,s.multi||1);if(list.length){t.cd=1/rate;t.bob=0.12;for(i=0;i<list.length;i++){e=list[i];hit(e,s.dmg,t,{ap:s.ap});if(s.season){e.seas=Math.max(e.seas,s.season);e.seasT=3;}fx({k:'pinch',x:e.x,y:e.y});}}}
  if(s.seasonAura&&t.tick<=0){t.tick=0.5;list=targets(t,r);for(i=0;i<list.length;i++){list[i].seas=Math.max(list[i].seas,s.season||0.2);list[i].seasT=1.2;}}
  break;
 case 'aura':
  if(t.tick<=0){t.tick=0.25;list=targets(t,r);for(i=0;i<list.length;i++){e=list[i];hit(e,s.dmg*0.25,t);if(s.aslow)slow(e,s.aslow,0.35);if(s.linger){e.ling=3;e.lingD=s.linger;}}
   if(s.panic&&t.cd2<=0&&list.length>=6){t.cd2=5;for(i=0;i<list.length;i++)hit(list[i],s.panic,t);fx({k:'ring',x:t.x,y:t.y,r:r,c:'#9cff5a'});bubble(t.x,t.y-50,"Don't panic don't panic!",1.4);}}
  break;
 case 'chain':
  if(t.cd<=0){list=targets(t,r,1);if(list.length){t.cd=1/rate;t.zc=(t.zc||0)+1;var c0=list[0],done={},pts=[[t.x,t.y-18]];
   for(var c=0;c<(s.chains||3)&&c0;c++){done[c0.id]=1;pts.push([c0.x,c0.y]);hit(c0,s.dmg,t);if(s.stun4&&t.zc%4===0)stun(c0,s.stun4);
    var best=null,bd=95*95;for(i=0;i<G.en.length;i++){e=G.en[i];if(!done[e.id]&&canHit(t,e)){var dd=dist2(e.x,e.y,c0.x,c0.y);if(dd<bd){bd=dd;best=e;}}}c0=best;}
   fx({k:'zap',pts:pts});sfx('zap');}}
  break;
 case 'beam':
  list=targets(t,r,s.multi||1);t.beam=list;for(i=0;i<list.length;i++)hit(list[i],s.dmg*dt,t);
  if(s.aslow&&t.tick<=0){t.tick=0.3;var l2=targets(t,r);for(i=0;i<l2.length;i++)slow(l2[i],s.aslow,0.4);}
  break;
 case 'push':
  if(t.cd<=0){list=targets(t,r,s.pushN||1);if(list.length){t.cd=1/rate;for(i=0;i<list.length;i++){e=list[i];fx({k:'portal',x:e.x,y:e.y});e.d=Math.max(0,e.d-(e.boss||e.mini?s.push/4:s.push));if(s.jet)slow(e,0.3,2);hit(e,s.dmg,t);}if(Math.random()<0.2)bubble(t.x,t.y-50,TBY.tavern.lines[Math.floor(Math.random()*TBY.tavern.lines.length)],1.4);}}
  if(s.lastCall&&t.cd2<=0){list=targets(t,r);if(list.length>=3||(list.length&&list[0].boss)){t.cd2=12;for(i=0;i<list.length;i++){e=list[i];fx({k:'portal',x:e.x,y:e.y});e.d=Math.max(0,e.d-(e.boss?40:e.mini?80:250));}bubble(t.x,t.y-50,'Last call for liberty!',1.6);}}
  break;
 case 'snipe':
  if(t.cd<=0){list=targets(t,r,1,t.mode);if(list.length){t.cd=1/rate;t.sc=(t.sc||0)+1;e=list[0];var crit=s.crit&&t.sc%3===0;var dm=s.dmg*(crit?s.crit:1);
   fx({k:'tracer',x:t.x,y:t.y-24,x2:e.x,y2:e.y,crit:crit});if(crit)text(e.x,e.y-16,'one more thing...','#ffe9b0',10);if(s.mark)e.mark=Math.max(e.mark,s.mark);hit(e,dm,t);if(s.stun)stun(e,s.stun);}}
  break;
 case 'support':
  if(t.cd<=0){list=targets(t,60,1);if(list.length){t.cd=1/rate;hit(list[0],s.dmg,t);t.bob=0.12;}}
  if(t.tick<=0){t.tick=0.25;if(s.aslow||s.grill){list=targets(t,r);for(i=0;i<list.length;i++){if(s.aslow)slow(list[i],s.aslow,0.35);if(s.grill)hit(list[i],s.grill*0.25,t);}}}
  break;
 case 'gulp':
  if(t.cd<=0){list=targets(t,r);n=0;for(i=0;i<list.length&&n<(s.gulpN||1);i++){e=list[i];if(e.boss||e.mini)continue;if(e.hp<=s.gulp){kill(e,t,true);n++;text(e.x,e.y-12,'*GULP*','#fff',12);}}
   if(!n&&s.gulpBoss){for(i=0;i<list.length;i++)if(list[i].boss||list[i].mini){hit(list[i],s.gulpBoss,t);text(list[i].x,list[i].y-30,'*GULP*','#fff',14);n=1;break;}}
   if(!n&&list.length){e=list[0];hit(e,Math.max(s.dmg||0,6),t);n=1;}
   if(n){t.cd=s.gulpEvery;t.bob=0.2;}}
  break;}
}
function step(dt){if(!G||G.over)return;G.t+=dt;
 if(G.queue.length){G.qt+=dt;while(G.queue.length&&G.queue[0].t<=G.qt)spawn(G.queue.shift());}
 if(G.stormIn>0){G.stormIn-=dt;if(G.stormIn<=0){G.stormIn=0;G.storm=10;bubble(W/2,60,'DUST STORM! Tower range -20%',2.5);}}
 if(G.storm>0)G.storm-=dt;
 G.rangeMult=(G.storm>0?0.8:1)*(G.mod==='storm'?0.85:1);
 if(G.mainCD>0)G.mainCD-=dt;
 var i,j,t,e,o;
 for(i=0;i<G.tw.length;i++){t=G.tw[i];t.bRate=0;t.bDmg=0;t.bRange=0;}
 for(i=0;i<G.en.length;i++){G.en[i].rev=false;G.en[i].ramp=0;}
 for(i=0;i<G.tw.length;i++){var a=G.tw[i],s=a.s;if(a.off>0)continue;
  if(s.buffRate||s.buffDmg||s.buffRange){var br=s.kind==='proj'&&s.reveal?s.reveal:s.range;for(j=0;j<G.tw.length;j++){t=G.tw[j];if(t===a)continue;if(dist2(a.x,a.y,t.x,t.y)<=br*br){t.bRate=Math.max(t.bRate,s.buffRate||0);t.bDmg=Math.max(t.bDmg,s.buffDmg||0);t.bRange=Math.max(t.bRange,s.buffRange||0);}}}
  if(s.reveal){for(j=0;j<G.en.length;j++){e=G.en[j];if(dist2(a.x,a.y,e.x,e.y)<=s.reveal*s.reveal){e.rev=true;if(s.revealAmp)e.ramp=Math.max(e.ramp,s.revealAmp);}}}}
 for(i=0;i<G.en.length;i++){e=G.en[i];if(e.dead)continue;
  if(e.seasT>0)e.seasT-=dt;if(e.ampT>0)e.ampT-=dt;if(e.slowT>0)e.slowT-=dt;else e.slowM=0;if(e.hit>0)e.hit-=dt;
  if(e.ling>0){e.ling-=dt;hit(e,e.lingD*dt,null);if(e.dead)continue;}
  var v=e.spd*(1-e.slowM);if(e.ty==='sucks'&&e.hp<e.max*0.25){v*=0.6;if(!e.flag){e.flag=1;bubble(e.x,e.y-40,'Low... battery...',2);}}
  if(e.stun>0){e.stun-=dt;v=0;}
  e.d+=v*dt;var pg=G.paths[e.p];
  if(e.d>=pg.len){e.dead=true;var lost=e.boss?20:(e.E.life||1);G.lives-=lost;G.leaked+=lost;G.leakBy=G.leakBy||{};G.leakBy[e.ty]=(G.leakBy[e.ty]||0)+lost;text(clamp(e.x,30,W-30),clamp(e.y,20,H-20),'-'+lost+' \u2665','#ff6b6b',14);sfx('lose');if(G.bossOn===e)G.bossOn=null;continue;}
  var pp=posAt(pg,e.d);e.x=pp.x;e.y=pp.y;e.dir=pp.dx<0?-1:pp.dx>0?1:e.dir;
  if(e.boss){e.cd-=dt;
   if(e.ty==='gully'&&e.cd<=0){e.cd=6;var stl=Math.min(Math.floor(G.cash),8+G.wave);G.cash-=stl;if(stl)bubble(e.x,e.y-40,'Trust me. (-'+cur()+stl+')',1.6);}
   if(e.ty==='pell'&&e.cd<=0){e.cd=7;var n=0;for(j=0;j<G.tw.length;j++){t=G.tw[j];if(dist2(t.x,t.y,e.x,e.y)<130*130){t.off=3;n++;}}fx({k:'ring',x:e.x,y:e.y,r:130,c:'#ff5a5a'});if(n)bubble(e.x,e.y-40,'Per the audit, this station is closed.',1.6);}
   if(e.ty==='sucks'){for(j=0;j<G.en.length;j++){o=G.en[j];if(o.ty==='mite'&&!o.dead&&dist2(o.x,o.y,e.x,e.y)<70*70){o.dead=true;e.hp=Math.min(e.max,e.hp+e.max*0.02);text(e.x,e.y-36,'*SLURP*','#c9a7ff',11);}}}
   if(e.ty==='overmind'&&e.cd<=0){e.cd=6;for(j=0;j<G.en.length;j++){o=G.en[j];if(o!==e&&!o.dead&&dist2(o.x,o.y,e.x,e.y)<140*140)o.shield=Math.min(120,o.max*0.3);}fx({k:'ring',x:e.x,y:e.y,r:140,c:'#b07cff'});if(Math.random()<0.5)bubble(e.x,e.y-44,'Harmony Score adjusted.',1.4);}}
 }
 for(i=0;i<G.tw.length;i++){t=G.tw[i];towerUpdate(t,dt);if(t.bob>0)t.bob-=dt;}
 for(i=G.pr.length-1;i>=0;i--){var p=G.pr[i];p.life-=dt;
  if(p.homing&&p.tg&&!p.tg.dead){var ang=Math.atan2(p.tg.y-p.y,p.tg.x-p.x);p.vx=Math.cos(ang)*p.sp;p.vy=Math.sin(ang)*p.sp;}
  p.x+=p.vx*dt;p.y+=p.vy*dt;var gone=p.life<=0||p.x<-20||p.x>W+20||p.y<-20||p.y>H+20;
  if(!gone){for(j=0;j<G.en.length;j++){e=G.en[j];if(e.dead||p.hits[e.id]||e.id===p.skip)continue;if(e.air&&!p.t.s.air)continue;if(e.camo&&!e.rev&&!p.t.s.detect&&p.tg!==e)continue;
    var rr=p.rad+e.E.sz*0.8;if(dist2(p.x,p.y,e.x,e.y)<rr*rr){p.hits[e.id]=1;hit(e,p.dmg,p.t);onProjHit(p,e);p.pierce--;p.homing=false;if(p.pierce<=0){gone=true;break;}}}}
  if(gone)G.pr.splice(i,1);}
 for(i=G.en.length-1;i>=0;i--)if(G.en[i].dead)G.en.splice(i,1);
 for(i=G.fx.length-1;i>=0;i--){G.fx[i].t+=dt;if(G.fx[i].t>0.6)G.fx.splice(i,1);}
 for(i=G.tx.length-1;i>=0;i--){G.tx[i].t+=dt;G.tx[i].y-=18*dt;if(G.tx[i].t>1.1)G.tx.splice(i,1);}
 for(i=G.bub.length-1;i>=0;i--){G.bub[i].t+=dt;if(G.bub[i].t>G.bub[i].d)G.bub.splice(i,1);}
 if(G.zib){G.zib.t+=dt;G.zib.x+=55*dt;if(G.zib.x>W+40){G.zib=null;G.zibDone=true;}}
 if(G.lives<=0){G.lives=0;endGame(false);return;}
 if(G.waveActive&&!G.queue.length&&!G.en.length){G.waveActive=false;
  if(G.wave>=G.N){payBonus();endGame(true);return;}
  if(G.auto)G.autoT=1.2;ui.hud();}
 if(G.autoT>0){G.autoT-=dt;if(G.autoT<=0&&!G.waveActive)startWave();}
}
function tileFree(c,r){return c>=0&&r>=0&&c<COLS&&r<ROWS&&G.grid[r][c]===0;}
function place(id,c,r){var b=TBY[id];if(!b||!allowed(b)||!tileFree(c,r))return null;var cost=costOf(b.cost);if(G.cash<cost)return null;
 G.cash-=cost;var t={uid:G.uid++,id:id,c:c,r:r,x:c*T+T/2,y:r*T+T/2,lv:[0,0],spent:cost,cd:0.2,cd2:0,cd3:0,tick:0,dealt:0,mode:b.kind==='snipe'?'strong':'first',bRate:0,bDmg:0,bRange:0,off:0,bob:0,rep:0,repT:0};
 t.s=statsOf(t);G.tw.push(t);G.grid[r][c]=3;bubble(t.x,t.y-48,b.line,1.8);sfx('place');ui.hud();return t;}
function canUp(t,p){var l=t.lv[p],o=t.lv[1-p];return l<3&&!(l+1===3&&o===3)&&!(l+1>=3&&o>=3);}
function upCost(t,p){return costOf(TBY[t.id].paths[p].u[t.lv[p]].c);}
function upgrade(t,p){if(!canUp(t,p))return false;var c=upCost(t,p);if(G.cash<c)return false;
 var nm=TBY[t.id].paths[p].u[t.lv[p]].n;
 G.cash-=c;t.spent+=c;t.lv[p]++;t.s=statsOf(t);var L=TBY[t.id].lines;bubble(t.x,t.y-48,L[Math.floor(Math.random()*L.length)],1.6);text(t.x,t.y-60,nm,'#9df',11);sfx('up');ui.hud();ui.sel();return true;}
function sellVal(t){return Math.floor(t.spent*(G.mod==='bff'?0.5:G.hard?0.6:0.75));}
function sell(t){G.cash+=sellVal(t);G.grid[t.r][t.c]=0;G.tw.splice(G.tw.indexOf(t),1);if(G.sel===t)G.sel=null;fx({k:'poof',x:t.x,y:t.y,s:14});sfx('coin');ui.hud();ui.sel();}
function throwMain(){if(G.mainCD>0)return;var has=false;for(var i=0;i<G.tw.length;i++)if(G.tw[i].s.main)has=true;if(!has)return;
 G.mainCD=40;for(i=0;i<G.en.length;i++)stun(G.en[i],2.5);fx({k:'flash'});bubble(W/2,70,"Throwin' the main. Everybody hold on.",2.2);sfx('boom');}
function starsFor(){var f=G.lives/G.maxLives;return f>=0.9?3:f>=0.5?2:1;}
function endGame(win){if(G.over)return;G.over=true;S.games++;
 var cleared=win?G.wave:Math.max(0,G.wave-1),xp=0,stars=0,rec=mapRec(G.map.id),l0=level(S.xp);
 if(G.mode==='endless'){xp=cleared*15;if(cleared>rec.endless)rec.endless=cleared;}
 else if(G.daily){xp=cleared*12;var dr=S.daily[G.daily.key]||{w:0,stars:0};if(win){stars=starsFor();xp+=dr.stars?50:200;}dr.w=Math.max(dr.w,cleared);dr.stars=Math.max(dr.stars,stars);S.daily[G.daily.key]=dr;}
 else{xp=cleared*12;if(win){stars=starsFor();xp+=stars*60+(G.mi+1)*30;if(G.hard){xp=Math.round(xp*1.5)+150;rec.hard=1;}if(stars>rec.stars)rec.stars=stars;}}
 S.xp+=xp;save();var unl=[],l1=level(S.xp);for(var i=0;i<TW.length;i++)if(TW[i].lv>l0&&TW[i].lv<=l1)unl.push(TW[i]);
 G.result={win:win,stars:stars,cleared:cleared,xp:xp};
 ui.result(win,stars,cleared,xp,unl);}
var cv,ctx,bg=null,bgKey='',K=1;
function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function strokePath(c,pts,dy){c.beginPath();for(var k=0;k<pts.length;k++){if(k)c.lineTo(pts[k][0],pts[k][1]+dy);else c.moveTo(pts[k][0],pts[k][1]+dy);}c.stroke();}
function drawBG(c,g){var m=g.map,th=m.theme,r=rng(hash(m.id+'bg')),i,x,y,k;
 var ground={earth:'#78b357',river:'#7cb35a',pike:'#8c9198',mars:'#c4673a',night:'#4f2436',overlap:'#78b357'}[th];
 c.fillStyle=ground;c.fillRect(0,0,W,H);
 if(th==='overlap'){c.fillStyle='#c4673a';c.fillRect(400,0,400,H);}
 for(y=0;y<ROWS;y++)for(x=0;x<COLS;x++){if((x+y)%2){c.fillStyle='rgba(0,0,0,0.035)';c.fillRect(x*T,y*T,T,T);}}
 for(i=0;i<160;i++){x=r()*W;y=r()*H;var mars=th==='mars'||th==='night'||(th==='overlap'&&x>400);
  c.fillStyle=mars?(th==='night'?'rgba(255,120,160,0.08)':'rgba(90,30,10,0.18)'):th==='pike'?'rgba(255,255,255,0.08)':'rgba(30,80,20,0.18)';
  c.beginPath();c.arc(x,y,mars?1+r()*3:1+r()*1.5,0,7);c.fill();}
 if(th==='mars'||th==='night'||th==='overlap'){for(i=0;i<7;i++){x=(th==='overlap'?430:20)+r()*(th==='overlap'?350:760);y=20+r()*460;var cr=6+r()*14;c.strokeStyle='rgba(60,15,5,0.25)';c.lineWidth=2;c.beginPath();c.arc(x,y,cr,0,7);c.stroke();c.fillStyle='rgba(255,200,160,0.12)';c.beginPath();c.arc(x-1,y-1,cr*0.7,0,7);c.fill();}}
 if(th==='night'){for(i=0;i<5;i++){c.fillStyle='rgba(255,95,168,0.12)';c.beginPath();c.arc(r()*W,r()*H,30+r()*30,0,7);c.fill();}
  c.strokeStyle='#8a8f99';c.lineWidth=3;c.beginPath();c.moveTo(0,3.5*T);c.lineTo(W,3.5*T);c.moveTo(0,3.5*T+8);c.lineTo(W,3.5*T+8);c.stroke();c.fillStyle='#6a6f79';for(x=10;x<W;x+=60)c.fillRect(x,3.5*T-2,6,12);}
 if(th==='pike'){c.strokeStyle='rgba(255,255,255,0.35)';c.lineWidth=2;c.setLineDash([14,12]);for(y=75;y<H;y+=100){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}c.setLineDash([]);c.fillStyle='#5f9a48';c.fillRect(0,0,W,12);c.fillRect(0,H-12,W,12);}
 if(m.water){var wy=m.water*T;var wg=c.createLinearGradient(0,wy,0,H);wg.addColorStop(0,'#3d8fc4');wg.addColorStop(1,'#1f5f93');c.fillStyle='#d9c690';c.fillRect(0,wy-8,W,10);c.fillStyle=wg;c.fillRect(0,wy,W,H-wy);
  c.strokeStyle='rgba(255,255,255,0.35)';c.lineWidth=2;for(i=0;i<22;i++){x=r()*W;y=wy+12+r()*(H-wy-18);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+8,y-4,x+16,y);c.stroke();}}
 var road={earth:'#55565c',overlap:'#55565c',river:'#b48a5a',pike:'#4b4e54',night:'#2e2238',mars:'#8a8f99'}[th],edge={earth:'#c9c2b3',overlap:'#c9c2b3',river:'#7d5a35',pike:'#f2d24b',night:'#ff5fa8',mars:'#596170'}[th];
 for(var pi=0;pi<g.paths.length;pi++){var pts=g.paths[pi].pts;c.lineJoin='round';c.lineCap='square';
  c.strokeStyle='rgba(0,0,0,0.25)';c.lineWidth=48;strokePath(c,pts,3);c.strokeStyle=edge;c.lineWidth=46;strokePath(c,pts,0);c.strokeStyle=road;c.lineWidth=38;strokePath(c,pts,0);}
 for(pi=0;pi<g.paths.length;pi++){pts=g.paths[pi].pts;c.strokeStyle=th==='river'?'rgba(120,80,40,0.35)':th==='mars'?'rgba(255,255,255,0.3)':th==='night'?'rgba(255,95,168,0.4)':'rgba(255,214,90,0.75)';c.lineWidth=2;c.setLineDash(th==='river'?[3,9]:[10,10]);strokePath(c,pts,0);c.setLineDash([]);}
 if(m.id==='river'){c.fillStyle='#6d7680';c.fillRect(11*T-1,m.water*T-12,5,H);c.fillRect(12*T-4,m.water*T-12,5,H);c.strokeStyle='#4b525a';c.lineWidth=2;for(y=m.water*T-10;y<H;y+=14){c.beginPath();c.moveTo(11*T+2,y);c.lineTo(12*T-2,y+14);c.moveTo(12*T-2,y);c.lineTo(11*T+2,y+14);c.stroke();}}
 if(th==='overlap'){c.save();c.strokeStyle='rgba(120,210,255,0.9)';c.lineWidth=4;c.shadowColor='#7fd4ff';c.shadowBlur=14;c.beginPath();c.moveTo(400,0);for(y=0;y<=H;y+=25)c.lineTo(400+((y/25)%2?9:-9),y);c.stroke();c.restore();}
 for(i=0;i<g.deco.length;i++)drawDeco(c,g.deco[i]);
 if(m.id!=='overlap')for(pi=0;pi<g.paths.length;pi++){var e=g.paths[pi].pts[g.paths[pi].pts.length-1];drawCrack(c,clamp(e[0],20,W-20),clamp(e[1],20,H-20));}
}
function drawCrack(c,x,y){c.save();var g=c.createRadialGradient(x,y,2,x,y,30);g.addColorStop(0,'rgba(255,255,255,0.95)');g.addColorStop(0.35,'rgba(120,210,255,0.8)');g.addColorStop(0.7,'rgba(255,120,60,0.5)');g.addColorStop(1,'rgba(255,120,60,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,30,0,7);c.fill();
 c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(x-4,y-22);c.lineTo(x+3,y-8);c.lineTo(x-3,y+2);c.lineTo(x+4,y+12);c.lineTo(x-2,y+22);c.stroke();c.restore();}
function house(c,x,y,w,h,col,echo){c.save();if(echo){c.globalAlpha=0.55;c.shadowColor='#7fd4ff';c.shadowBlur=10;col='#5aa9e6';}
 c.fillStyle=col;c.fillRect(x,y,w,h);c.fillStyle=echo?'#bfe6ff':'#3a2a24';c.fillRect(x-1,y-4,w+2,5);
 c.fillStyle=echo?'rgba(220,245,255,0.9)':'#f4e7c5';c.fillRect(x+5,y+6,w*0.3,h*0.28);c.fillRect(x+w*0.6,y+6,w*0.3,h*0.28);
 c.fillStyle=echo?'rgba(220,245,255,0.7)':'#2d3b55';c.fillRect(x+w*0.38,y+h*0.52,w*0.24,h*0.48);c.fillStyle=echo?'rgba(255,255,255,0.6)':'#d9d2c4';c.fillRect(x+w*0.3,y+h-4,w*0.4,4);c.restore();}
function drawDeco(c,d){var x=d.c*T,y=d.r*T,i;
 if(d.k==='rows'||d.k==='echorows'){var cols=['#a0473a','#8f3f35','#b45a45','#94503f','#a86a52'];for(i=0;i<d.w;i++)house(c,x+i*T+2,y+6,T-4,T-8,cols[i%5],d.k==='echorows');}
 if(d.k==='tree'){c.fillStyle='rgba(0,0,0,0.2)';c.beginPath();c.ellipse(x+27,y+36,18,8,0,0,7);c.fill();c.fillStyle='#3f7a2f';c.beginPath();c.arc(x+25,y+22,17,0,7);c.fill();c.fillStyle='#5a9a3d';c.beginPath();c.arc(x+20,y+17,10,0,7);c.fill();}
 if(d.k==='clock'){c.fillStyle='rgba(0,0,0,0.25)';c.fillRect(x+18,y+14,76,84);c.fillStyle='#9a4a38';c.fillRect(x+14,y+8,72,88);c.fillStyle='#7a372a';for(i=0;i<6;i++)c.fillRect(x+14,y+16+i*14,72,2);c.fillStyle='#4a2a20';c.beginPath();c.moveTo(x+8,y+10);c.lineTo(x+50,y-14);c.lineTo(x+92,y+10);c.fill();clockFace(c,x+50,y+44,22,'12:49');}
 if(d.k==='portal'){var g=c.createRadialGradient(x+50,y+50,4,x+50,y+50,52);g.addColorStop(0,'#fff');g.addColorStop(0.4,'rgba(120,210,255,0.9)');g.addColorStop(0.75,'rgba(255,110,60,0.6)');g.addColorStop(1,'rgba(255,110,60,0)');c.fillStyle=g;c.beginPath();c.arc(x+50,y+50,52,0,7);c.fill();clockFace(c,x+50,y+50,22,'12:49');}
 if(d.k==='booth'){c.fillStyle='rgba(0,0,0,0.25)';c.fillRect(x+10,y+8,36,92);c.fillStyle='#e8e2d2';c.fillRect(x+6,y+2,36,94);c.fillStyle='#2e9e6b';c.fillRect(x+6,y+2,36,12);c.fillStyle='#8fd0ff';c.fillRect(x+11,y+22,26,20);c.fillStyle='#fff';c.font='bold 9px Arial';c.textAlign='center';c.fillText('TOLL',x+24,y+11);c.fillStyle='#f2d24b';for(i=0;i<5;i++)c.fillRect(x+6,y+60+i*7,36,3);}
 if(d.k==='pod'){c.fillStyle='rgba(0,0,0,0.25)';c.beginPath();c.ellipse(x+27,y+38,22,8,0,0,7);c.fill();var pg=c.createLinearGradient(x,y,x,y+40);pg.addColorStop(0,'#f2f4f8');pg.addColorStop(1,'#a9b1bd');c.fillStyle=pg;c.beginPath();c.arc(x+25,y+30,21,Math.PI,0);c.fill();c.fillRect(x+4,y+30,42,8);c.fillStyle='#7fd4ff';c.fillRect(x+18,y+18,14,7);}
 if(d.k==='spire'){c.fillStyle='rgba(0,0,0,0.25)';c.beginPath();c.ellipse(x+27,y+44,18,6,0,0,7);c.fill();var cs=['#ff4a5a','#d81e3a','#ff8a8a'],hs=[26,40,22];for(i=0;i<3;i++){c.fillStyle=cs[i];c.beginPath();var bx=x+8+i*12;c.moveTo(bx,y+44);c.lineTo(bx+7,y+44-hs[i]);c.lineTo(bx+14,y+44);c.fill();}}
 if(d.k==='echo'){for(i=0;i<d.w;i++)house(c,x+i*T+3,y+6,T-6,T*1.7,'#5aa9e6',true);c.fillStyle='rgba(225,245,255,0.95)';c.font='bold 10px Arial';c.textAlign='center';c.fillText('ECHO: OLD PHILLY',x+d.w*T/2,y+T*2-2);}
}
function clockFace(c,x,y,r,label){c.fillStyle='#f6f1e1';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.strokeStyle='#2a1a12';c.lineWidth=2.5;c.stroke();
 c.lineWidth=2;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.sin(0.4276)*r*0.5,y-Math.cos(0.4276)*r*0.5);c.moveTo(x,y);c.lineTo(x+Math.sin(5.131)*r*0.78,y-Math.cos(5.131)*r*0.78);c.stroke();c.fillStyle='#2a1a12';c.font='bold '+Math.round(r*0.4)+'px Arial';c.textAlign='center';c.fillText(label,x,y+r*0.66);}
function enemyDraw(c,e){var E=e.E,s=E.sz,x=e.x,y=e.y,b=Math.sin(G.t*10+e.ph)*1.5,i,k;c.save();
 if(e.camo&&!e.rev)c.globalAlpha=0.38;
 if(e.air){c.fillStyle='rgba(0,0,0,0.18)';c.beginPath();c.ellipse(x,y+s,s*0.8,s*0.3,0,0,7);c.fill();y-=10;}
 else{c.fillStyle='rgba(0,0,0,0.2)';c.beginPath();c.ellipse(x,y+s*0.6,s*0.9,s*0.35,0,0,7);c.fill();}
 var im=E.img&&IMG[E.img];
 if(im&&ok(im)){var h=s*2.4,w=h*im.naturalWidth/im.naturalHeight;c.translate(x,y+s*0.7+b*0.5);if(e.dir<0&&e.ty!=='overmind'&&e.ty!=='sucks')c.scale(-1,1);
  if(e.ty==='overmind'){c.shadowColor='#b07cff';c.shadowBlur=18;}if(e.hit>0)c.globalAlpha*=0.75;c.drawImage(im,-w/2,-h,w,h);c.restore();drawBars(c,e,x,y-s*1.8);return;}
 c.translate(x,y);if(e.dir<0)c.scale(-1,1);
 switch(e.ty){
 case 'ant':case 'twitch':case 'loaded':k=s/9;c.fillStyle='#1d1d22';c.strokeStyle='#1d1d22';c.lineWidth=1.5*k;for(i=-1;i<=1;i++){c.beginPath();c.moveTo(i*4*k,0);c.lineTo(i*5*k+Math.sin(G.t*20+i+e.ph)*2,7*k);c.stroke();}
  c.beginPath();c.ellipse(-7*k,b*0.3,5*k,4*k,0,0,7);c.fill();c.beginPath();c.ellipse(0,0,3.5*k,3*k,0,0,7);c.fill();c.beginPath();c.arc(6*k,-2*k+b*0.3,4*k,0,7);c.fill();
  c.fillStyle='#fff';c.beginPath();c.arc(7.5*k,-3*k,1.4*k,0,7);c.fill();
  if(e.ty==='twitch'){c.fillStyle='#d93030';c.fillRect(3*k,-6.5*k,6*k,2*k);}
  if(e.ty==='loaded'){c.fillStyle='#e8b04a';c.fillRect(-12*k,-14*k,16*k,6*k);c.fillStyle='#7a3b1a';c.fillRect(-12*k,-14*k,16*k,2*k);c.fillStyle='#c9302c';c.fillRect(-9*k,-10*k,10*k,2*k);}
  else{c.fillStyle='#ffb020';c.beginPath();c.arc(-2*k,-7*k+b*0.4,2.6*k,0,7);c.fill();}
  break;
 case 'goose':c.fillStyle='#8c7a62';c.beginPath();c.ellipse(-2,2,s,s*0.62,0,0,7);c.fill();c.fillStyle='#6d5d48';c.beginPath();c.ellipse(-4,0,s*0.7,s*0.38,0,0,7);c.fill();
  c.strokeStyle='#1d1d1d';c.lineWidth=4;c.beginPath();c.moveTo(s*0.5,-2);c.quadraticCurveTo(s*0.8,-s*0.9,s*0.9,-s*1.1+b);c.stroke();c.fillStyle='#1d1d1d';c.beginPath();c.arc(s*0.95,-s*1.15+b,4,0,7);c.fill();c.fillStyle='#fff';c.fillRect(s*0.8,-s*1.05+b,5,3);c.fillStyle='#333';c.fillRect(s*1.1,-s*1.2+b,5,2.5);
  c.strokeStyle='#2a2a2a';c.lineWidth=2;c.beginPath();c.moveTo(-3,s*0.5);c.lineTo(-3+Math.sin(G.t*14)*3,s);c.moveTo(3,s*0.5);c.lineTo(3-Math.sin(G.t*14)*3,s);c.stroke();break;
 case 'gull':var fl=Math.sin(G.t*14+e.ph)*0.6;c.fillStyle='#fff';c.beginPath();c.ellipse(0,0,s*0.9,s*0.45,0,0,7);c.fill();c.fillStyle='#9aa3ad';c.beginPath();c.moveTo(-3,-2);c.lineTo(-s*0.6,-s*(0.9+fl));c.lineTo(s*0.4,-2);c.fill();c.beginPath();c.moveTo(-3,2);c.lineTo(-s*0.5,s*(0.6-fl*0.5));c.lineTo(s*0.3,2);c.fill();
  c.fillStyle='#f2c230';c.beginPath();c.moveTo(s*0.85,-2);c.lineTo(s*1.3,0);c.lineTo(s*0.85,2);c.fill();c.fillStyle='#222';c.beginPath();c.arc(s*0.6,-2,1.5,0,7);c.fill();break;
 case 'snack':c.fillStyle=e.id%2?'#ff7fb3':'#7fc4ff';roundRect(c,-6,-9+b,12,15,2);c.fill();c.fillStyle='#fff';c.fillRect(-4,-5+b,8,5);c.strokeStyle='#333';c.lineWidth=1.5;c.beginPath();c.moveTo(-3,6);c.lineTo(-4,10);c.moveTo(3,6);c.lineTo(4,10);c.stroke();break;
 case 'mite':c.fillStyle='#ff7a2a';c.beginPath();for(i=0;i<8;i++){var a=i/8*Math.PI*2,rr=i%2?s*0.6:s;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr+b*0.3);}c.closePath();c.fill();c.fillStyle='#4a1505';c.beginPath();c.arc(0,b*0.3,s*0.45,0,7);c.fill();c.fillStyle='#ffd27a';c.fillRect(1,-2,2,2);break;
 case 'puff':case 'minipuff':var pg=c.createRadialGradient(-s*0.3,-s*0.3,1,0,0,s);pg.addColorStop(0,'#fff0fb');pg.addColorStop(1,'rgba(240,140,200,0.85)');c.fillStyle=pg;c.beginPath();c.arc(0,b,s,0,7);c.fill();c.fillStyle='#5a2a4a';c.beginPath();c.arc(-s*0.3,b-1,1.6,0,7);c.arc(s*0.3,b-1,1.6,0,7);c.fill();break;
 case 'runner':c.strokeStyle='rgba(200,240,255,0.95)';c.lineWidth=1.8;var lg=Math.sin(G.t*22+e.ph)*5;c.beginPath();c.moveTo(-5,0);c.lineTo(-7-lg,s);c.moveTo(-3,0);c.lineTo(-1+lg,s);c.moveTo(5,0);c.lineTo(3+lg,s);c.moveTo(7,0);c.lineTo(9-lg,s);c.stroke();
  c.fillStyle='#d9a066';c.beginPath();c.ellipse(0,-2,s*0.75,s*0.4,0,0,7);c.fill();c.beginPath();c.moveTo(6,-4);c.lineTo(12,-12);c.lineTo(15,-10);c.lineTo(10,-2);c.fill();c.strokeStyle='#e8f6ff';c.beginPath();c.moveTo(12,-12);c.lineTo(10,-18);c.moveTo(13,-12);c.lineTo(15,-18);c.stroke();break;
 case 'emoth':var fw=Math.abs(Math.sin(G.t*18+e.ph));c.fillStyle='rgba(140,210,255,0.75)';c.beginPath();c.ellipse(-4,-2,s*0.9,s*0.6*fw+2,-0.5,0,7);c.fill();c.beginPath();c.ellipse(-4,2,s*0.7,s*0.45*fw+2,0.5,0,7);c.fill();c.fillStyle='#2b3a55';c.beginPath();c.ellipse(1,0,5,2.5,0,0,7);c.fill();break;
 case 'hound':c.fillStyle='#111018';c.beginPath();c.moveTo(-s,-2);c.lineTo(-s*0.4,-s*0.6);c.lineTo(s*0.5,-s*0.55);c.lineTo(s*0.8,-s*1.0);c.lineTo(s*1.1,-s*0.5);c.lineTo(s*1.2,-s*0.1);c.lineTo(s*0.6,s*0.1);c.lineTo(s*0.5,s*0.7);c.lineTo(s*0.2,s*0.2);c.lineTo(-s*0.5,s*0.2);c.lineTo(-s*0.7,s*0.7);c.lineTo(-s*0.9,0);c.closePath();c.fill();
  c.strokeStyle='rgba(176,124,255,0.7)';c.lineWidth=1;c.stroke();c.fillStyle='#b07cff';c.beginPath();c.arc(s*0.85,-s*0.45,1.8,0,7);c.fill();break;
 case 'crawler':c.fillStyle='#6b4a3a';c.beginPath();c.ellipse(0,0,s*1.3,s*0.7,0,0,7);c.fill();c.fillStyle='#8a6450';for(i=-2;i<=2;i++){c.beginPath();c.ellipse(i*s*0.45,-s*0.1+Math.sin(G.t*6+i)*1.5,s*0.3,s*0.55,0,0,7);c.fill();}
  c.fillStyle='#ffb36a';c.beginPath();c.arc(s*1.15,-s*0.1,3,0,7);c.arc(s*1.15,s*0.2,3,0,7);c.fill();c.fillStyle='#ff4a5a';c.beginPath();c.moveTo(-s*0.3,-s*0.6);c.lineTo(-s*0.15,-s*1.1);c.lineTo(0,-s*0.6);c.fill();c.beginPath();c.moveTo(s*0.2,-s*0.6);c.lineTo(s*0.35,-s*1.25);c.lineTo(s*0.5,-s*0.6);c.fill();break;
 default:c.fillStyle='#888';c.beginPath();c.arc(0,0,s,0,7);c.fill();}
 c.restore();
 var ay=e.y-(e.air?10:0);
 if(e.shield>0){c.strokeStyle='rgba(176,124,255,0.85)';c.lineWidth=2;c.beginPath();c.arc(e.x,ay,s+4,0,7);c.stroke();}
 if(e.seasT>0){c.fillStyle='rgba(214,120,40,0.85)';for(var q=0;q<3;q++)c.fillRect(e.x-6+q*5,ay-s-6+Math.sin(G.t*8+q)*2,2,2);}
 if(e.stun>0){c.fillStyle='#fff27a';c.font='bold 10px Arial';c.textAlign='center';c.fillText('\u2605',e.x+Math.sin(G.t*9)*6,ay-s-6);}
 drawBars(c,e,e.x,ay-s-8);}
function drawBars(c,e,x,y){if(e.boss)return;if(e.hp>=e.max&&!e.mini)return;var w=e.mini?40:22;c.fillStyle='rgba(0,0,0,0.6)';c.fillRect(x-w/2-1,y-1,w+2,5);c.fillStyle=e.mini?'#ff9a3a':'#6be36b';c.fillRect(x-w/2,y,w*clamp(e.hp/e.max,0,1),3);}
var TH={wheel:40,gus:42,jimmy:38,pikaru:36,salt:34,lumos:44,tavern:46,tess:46};
function towerDraw(c,t){var b=TBY[t.id],x=t.x,y=t.y,im=IMG[b.img],sel=G.sel===t,i;
 c.fillStyle='rgba(0,0,0,0.25)';c.beginPath();c.ellipse(x,y+15,20,7,0,0,7);c.fill();
 c.fillStyle=b.col;c.beginPath();c.ellipse(x,y+13,19,7,0,0,7);c.fill();c.strokeStyle=sel?'#fff':'rgba(0,0,0,0.35)';c.lineWidth=sel?2.5:1.5;c.stroke();
 var hop=t.bob>0?-4:0,side=b.img2||t.s.bear||t.s.watt;
 if(t.off>0)c.globalAlpha=0.45;
 if(ok(im)){var h=TH[t.id]||48,w=h*im.naturalWidth/im.naturalHeight;if(t.id==='lumos'){c.shadowColor='#bfe6ff';c.shadowBlur=14;}c.drawImage(im,x-w/2+(side?-6:0),y+16-h+hop,w,h);c.shadowBlur=0;}
 if(b.img2&&ok(IMG[b.img2])){var i2=IMG[b.img2],h2=t.id==='gus'?30:24,w2=h2*i2.naturalWidth/i2.naturalHeight;c.drawImage(i2,x+2,y+18-h2+hop*0.5,w2,h2);}
 if(t.s.bear&&ok(IMG.bear)){var bh=24,bw=bh*IMG.bear.naturalWidth/IMG.bear.naturalHeight;c.drawImage(IMG.bear,x+3,y+18-bh,bw,bh);}
 if(t.s.watt&&ok(IMG.watt)){var wh=22,ww=wh*IMG.watt.naturalWidth/IMG.watt.naturalHeight;c.drawImage(IMG.watt,x+4,y+18-wh,ww,wh);}
 c.globalAlpha=1;
 for(var p=0;p<2;p++)for(i=0;i<t.lv[p];i++){c.fillStyle=p?'#59d6ff':'#ffd23a';c.beginPath();c.arc(x-15+i*6+p*18,y+21,2.4,0,7);c.fill();c.strokeStyle='rgba(0,0,0,0.5)';c.lineWidth=0.8;c.stroke();}
 if(t.off>0){c.fillStyle='#ff5a5a';c.font='bold 9px Arial';c.textAlign='center';c.fillText('AUDITED',x,y-34);}
 if(t.beam&&t.beam.length)for(i=0;i<t.beam.length;i++){var e=t.beam[i];c.save();c.strokeStyle='rgba(210,245,255,0.85)';c.shadowColor='#8fd3ff';c.shadowBlur=10;c.lineWidth=3+Math.sin(G.t*30);c.beginPath();c.moveTo(x,y-22);c.lineTo(e.x,e.y-(e.air?10:0));c.stroke();c.restore();}
}
function projDraw(c,p){c.save();c.translate(p.x,p.y);var a=Math.atan2(p.vy,p.vx);
 switch(p.type){case 'splitter':c.rotate(G.t*12);c.fillStyle='#c9ced6';c.fillRect(-4,-2,8,4);c.fillRect(-2,-5,4,10);c.fillStyle='#e0a23a';c.fillRect(-1.5,-1.5,3,3);break;
 case 'shard':c.fillStyle='#e6ecf5';c.fillRect(-2,-2,4,4);break;
 case 'citation':c.rotate(a);c.fillStyle='#fffbe6';c.fillRect(-6,-4,12,8);c.fillStyle='#d33';c.fillRect(-5,-3,6,1.5);c.fillStyle='#999';c.fillRect(-5,0,9,1);break;
 case 'pretzel':c.rotate(G.t*8);c.strokeStyle='#a8662a';c.lineWidth=3;c.beginPath();c.arc(-3,0,4,0,7);c.stroke();c.beginPath();c.arc(3,0,4,0,7);c.stroke();c.fillStyle='#f5c400';c.fillRect(-1,-5,2,3);break;
 case 'receipt':c.rotate(a);c.fillStyle='#fff';c.fillRect(-5,-3,10,6);c.fillStyle='#ff5fa8';c.font='8px Arial';c.textAlign='center';c.fillText('\u2665',0,3);break;
 case 'wrench':c.rotate(G.t*14);c.fillStyle='#9aa3ad';c.fillRect(-7,-1.5,14,3);c.beginPath();c.arc(7,0,3.5,0,7);c.fill();break;
 case 'crystal':c.rotate(a);c.fillStyle='#f4f7ff';c.beginPath();c.moveTo(7,0);c.lineTo(0,-4);c.lineTo(-6,0);c.lineTo(0,4);c.closePath();c.fill();c.strokeStyle='#8fd3ff';c.lineWidth=1;c.stroke();break;
 case 'bolt':c.fillStyle='#7dff6b';c.beginPath();c.arc(0,0,3,0,7);c.fill();break;
 default:c.fillStyle='#fff';c.beginPath();c.arc(0,0,3,0,7);c.fill();}
 c.restore();}
function fxDraw(c,f){var k=f.t/0.6,i;c.save();
 switch(f.k){case 'ring':c.globalAlpha=1-k;c.strokeStyle=f.c;c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,f.r*(0.3+0.7*k),0,7);c.stroke();break;
 case 'poof':c.globalAlpha=1-k;c.fillStyle='#f4efe6';for(i=0;i<5;i++){var a=i*1.26;c.beginPath();c.arc(f.x+Math.cos(a)*f.s*k*1.3,f.y+Math.sin(a)*f.s*k*1.3,f.s*0.45*(1-k*0.5),0,7);c.fill();}break;
 case 'gulp':c.globalAlpha=1-k;c.strokeStyle='#59d6ff';c.lineWidth=2;c.beginPath();c.arc(f.x,f.y,8+k*14,0,7);c.stroke();break;
 case 'zap':if(f.t>0.15)break;c.strokeStyle='#fff27a';c.lineWidth=2.5;c.beginPath();for(i=0;i<f.pts.length;i++){var px=f.pts[i][0]+(i?Math.sin(f.t*90+i)*3:0),py=f.pts[i][1]+(i?Math.cos(f.t*80+i)*3:0);if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.stroke();break;
 case 'tracer':if(f.t>0.12)break;c.strokeStyle=f.crit?'#ffe27a':'rgba(255,255,255,0.9)';c.lineWidth=f.crit?3:1.5;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.x2,f.y2);c.stroke();break;
 case 'pinch':c.globalAlpha=1-k;c.strokeStyle='#ffef9a';c.lineWidth=2;c.beginPath();c.moveTo(f.x-6,f.y-6);c.lineTo(f.x+6,f.y+6);c.moveTo(f.x+6,f.y-6);c.lineTo(f.x-6,f.y+6);c.stroke();break;
 case 'whip':c.globalAlpha=1-k;c.strokeStyle='#ff9a3a';c.lineWidth=2;c.beginPath();c.arc(f.x,f.y,40+k*25,-1,1.2);c.stroke();break;
 case 'portal':c.globalAlpha=1-k;c.strokeStyle='#59d6ff';c.lineWidth=3;c.beginPath();c.ellipse(f.x,f.y,14*(1-k*0.5),20*(1-k*0.5),0,0,7);c.stroke();c.strokeStyle='#ff9a3a';c.beginPath();c.ellipse(f.x,f.y,9,14,0,0,7);c.stroke();break;
 case 'quake':c.globalAlpha=1-k;c.strokeStyle='#5a3a2a';c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,20+k*60,0,7);c.stroke();break;
 case 'flash':c.globalAlpha=(1-k)*0.6;c.fillStyle='#fff8c0';c.fillRect(0,0,W,H);break;}
 c.restore();}
function render(){if(!ctx)return;var g=G,c=ctx,i;
 if(!g){c.setTransform(1,0,0,1,0,0);c.fillStyle='#1b2233';c.fillRect(0,0,cv.width,cv.height);return;}
 var key=g.map.id+'|'+K;if(bgKey!==key||!bg){bg=document.createElement('canvas');bg.width=Math.round(W*K);bg.height=Math.round(H*K);var bc=bg.getContext('2d');bc.setTransform(K,0,0,K,0,0);drawBG(bc,g);bgKey=key;}
 c.setTransform(1,0,0,1,0,0);c.drawImage(bg,0,0);c.setTransform(K,0,0,K,0,0);
 if(g.place){var pb=TBY[g.place];c.fillStyle='rgba(255,255,255,0.08)';for(var r=0;r<ROWS;r++)for(var cc=0;cc<COLS;cc++)if(g.grid[r][cc]===0)c.fillRect(cc*T+3,r*T+3,T-6,T-6);
  if(g.ghost){var gx=g.ghost.c*T+T/2,gy=g.ghost.r*T+T/2,okT=tileFree(g.ghost.c,g.ghost.r)&&g.cash>=costOf(pb.cost),rr=pb.range>500?40:pb.range*g.rangeMult;
   c.fillStyle=okT?'rgba(255,255,255,0.14)':'rgba(255,60,60,0.18)';c.strokeStyle=okT?'rgba(255,255,255,0.8)':'rgba(255,90,90,0.9)';c.lineWidth=2;c.beginPath();c.arc(gx,gy,rr,0,7);c.fill();c.stroke();
   var gi=IMG[pb.img];if(ok(gi)){c.globalAlpha=0.7;var gh=TH[pb.id]||48,gw=gh*gi.naturalWidth/gi.naturalHeight;c.drawImage(gi,gx-gw/2,gy+16-gh,gw,gh);c.globalAlpha=1;}
   if(g.ghostTouch){c.font='bold 12px Arial';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#000';var gm=okT?'tap again to place':(g.cash<costOf(pb.cost)?'not enough cash':'can\'t build here');c.strokeText(gm,gx,clamp(gy-40,14,H));c.fillStyle='#fff';c.fillText(gm,gx,clamp(gy-40,14,H));}}}
 if(g.sel){var st=g.sel,sr=st.s.range>500?0:rangeOf(st);if(sr){c.fillStyle='rgba(255,255,255,0.1)';c.strokeStyle='rgba(255,255,255,0.75)';c.setLineDash([6,5]);c.lineWidth=1.5;c.beginPath();c.arc(st.x,st.y,sr,0,7);c.fill();c.stroke();c.setLineDash([]);}
  if(st.s.reveal){c.strokeStyle='rgba(185,198,255,0.7)';c.lineWidth=1.5;c.beginPath();c.arc(st.x,st.y,st.s.reveal,0,7);c.stroke();}}
 for(i=0;i<g.tw.length;i++){var t=g.tw[i];if(t.off>0)continue;if(t.s.kind==='aura'){var ar=rangeOf(t),cg=c.createRadialGradient(t.x,t.y,4,t.x,t.y,ar);cg.addColorStop(0,'rgba(140,220,60,0.32)');cg.addColorStop(1,'rgba(140,220,60,0.04)');c.fillStyle=cg;c.beginPath();c.arc(t.x,t.y,ar,0,7);c.fill();}
  if(t.s.kind==='support'&&t.s.grill){c.fillStyle='rgba(200,200,200,0.12)';c.beginPath();c.arc(t.x,t.y,rangeOf(t),0,7);c.fill();}}
 var objs=[];for(i=0;i<g.en.length;i++)objs.push([g.en[i].y+(g.en[i].air?40:0),0,g.en[i]]);for(i=0;i<g.tw.length;i++)objs.push([g.tw[i].y+12,1,g.tw[i]]);
 objs.sort(function(a,b){return a[0]-b[0];});
 for(i=0;i<objs.length;i++){if(objs[i][1])towerDraw(c,objs[i][2]);else enemyDraw(c,objs[i][2]);}
 for(i=0;i<g.pr.length;i++)projDraw(c,g.pr[i]);
 for(i=0;i<g.fx.length;i++)fxDraw(c,g.fx[i]);
 if(g.map.fog){for(i=0;i<5;i++){var fx0=((g.t*12+i*190)%(W+300))-150,fy=60+i*90,fg=c.createRadialGradient(fx0,fy,10,fx0,fy,150);fg.addColorStop(0,'rgba(240,244,248,0.3)');fg.addColorStop(1,'rgba(240,244,248,0)');c.fillStyle=fg;c.fillRect(fx0-150,fy-150,300,300);}}
 if(g.storm>0||g.mod==='storm'){c.fillStyle='rgba(200,110,60,'+(g.storm>0?0.22:0.1)+')';c.fillRect(0,0,W,H);c.fillStyle='rgba(255,200,150,0.5)';for(i=0;i<40;i++){var sx=(i*97+g.t*(220+i*3))%W,sy=(i*53+g.t*30)%H;c.fillRect(sx,sy,8,1.5);}}
 if(g.map.theme==='night'){c.fillStyle='rgba(20,0,40,0.1)';c.fillRect(0,0,W,H);}
 if(g.zib&&ok(IMG.zib)){var zi=IMG.zib,zh=44,zw=zh*zi.naturalWidth/zi.naturalHeight,zy=g.zib.y+Math.sin(g.t*4)*5;c.fillStyle='rgba(255,255,255,0.25)';c.beginPath();c.arc(g.zib.x,zy,26,0,7);c.fill();c.drawImage(zi,g.zib.x-zw/2,zy-zh/2,zw,zh);c.fillStyle='#fff';c.font='bold 10px Arial';c.textAlign='center';c.fillText('tap me!',g.zib.x,zy+32);}
 c.textAlign='center';for(i=0;i<g.tx.length;i++){var tx=g.tx[i];c.globalAlpha=clamp(1-(tx.t-0.6)/0.5,0,1);c.font='bold '+tx.sz+'px "Trebuchet MS",Arial';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,0.7)';c.strokeText(tx.s,tx.x,tx.y);c.fillStyle=tx.c;c.fillText(tx.s,tx.x,tx.y);}c.globalAlpha=1;
 c.font='bold 12px "Trebuchet MS",Arial';
 for(i=0;i<g.bub.length;i++){var bb=g.bub[i],s=bb.s.length>58?bb.s.slice(0,56)+'...':bb.s,bw=c.measureText(s).width+16,bx=clamp(bb.x-bw/2,4,W-bw-4),by=bb.y-24,tx0=clamp(bb.x,bx+10,bx+bw-10);c.globalAlpha=clamp((bb.d-bb.t)*4,0,1);
  c.fillStyle='#fff';roundRect(c,bx,by,bw,21,8);c.fill();c.strokeStyle='#222';c.lineWidth=1.5;c.stroke();c.beginPath();c.moveTo(tx0-5,by+20);c.lineTo(tx0,by+28);c.lineTo(tx0+5,by+20);c.closePath();c.fill();c.fillStyle='#222';c.fillText(s,bx+bw/2,by+15);}c.globalAlpha=1;
 if(g.bossOn&&!g.bossOn.dead){var be=g.bossOn,bw2=300;c.fillStyle='rgba(0,0,0,0.65)';roundRect(c,W/2-bw2/2-6,6,bw2+12,28,6);c.fill();c.fillStyle='#3a1a1a';c.fillRect(W/2-bw2/2,21,bw2,8);c.fillStyle='#ff5a5a';c.fillRect(W/2-bw2/2,21,bw2*clamp(be.hp/be.max,0,1),8);if(be.shield>0){c.fillStyle='#b07cff';c.fillRect(W/2-bw2/2,21,bw2*clamp(be.shield/be.max,0,1),3);}c.fillStyle='#fff';c.font='bold 11px Arial';c.fillText(be.E.n.toUpperCase(),W/2,18);}
 if(g.storm>0){c.fillStyle='#ffd9b0';c.font='bold 12px Arial';c.textAlign='left';c.fillText('DUST STORM '+Math.ceil(g.storm)+'s',8,H-8);c.textAlign='center';}
 if(g.paused&&!g.over){c.fillStyle='rgba(0,0,0,0.45)';c.fillRect(0,0,W,H);c.fillStyle='#fff';c.font='bold 34px "Trebuchet MS",Arial';c.fillText('PAUSED',W/2,H/2);}
 if(g.wave===0&&!g.place&&!g.tw.length){c.font='bold 15px "Trebuchet MS",Arial';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,0.75)';var hm=EMBED?'Pick a tower below, tap a tile':'Pick a tower below, then tap a green tile. Hit START when ready.';c.strokeText(hm,W/2,H-20);c.fillStyle='#fff';c.fillText(hm,W/2,H-20);}
}
var acc=0,last=-1;
function frame(ts){requestAnimationFrame(frame);var now=ts||0,dt=last<0?0:Math.min(0.1,(now-last)/1000);last=now;
 if(G&&!G.paused&&!G.over){acc+=dt*G.speed;var n=0;while(acc>=STEP&&n<36){step(STEP);acc-=STEP;n++;}if(n>=36)acc=0;}
 render();if(G)ui.tick();}
var ui={},SHORT={pete:'Pete',krampus:'Krampus',marjorie:'Marjorie',jimmy:'Big Jimmy',gus:'Gus & Pixel',stanley:'Stanley',pikaru:'Pikaru',dom:'Dom',salt:'Salt',lumos:'Lumos',tavern:'Tavern',rumple:'Lt. Rumple',tess:'Big Tess',wheel:'Trash Wheel'};
function tile(ev){var rc=cv.getBoundingClientRect(),p=ev.touches&&ev.touches[0]?ev.touches[0]:ev.changedTouches&&ev.changedTouches[0]?ev.changedTouches[0]:ev;var x=(p.clientX-rc.left)/rc.width*W,y=(p.clientY-rc.top)/rc.height*H;return {x:x,y:y,c:Math.floor(x/T),r:Math.floor(y/T)};}
function onDown(ev){if(!G||G.over)return;var p=tile(ev),touch=ev.pointerType?ev.pointerType!=='mouse':!!ev.touches;if(ev.cancelable)ev.preventDefault();
 if(G.zib&&dist2(p.x,p.y,G.zib.x,G.zib.y)<36*36){G.cash+=150;bubble(G.zib.x,G.zib.y+10,"Hi again! ...You don't remember me, do you?",3);text(G.zib.x,G.zib.y,'+'+cur()+'150','#ffe27a',16);G.zib=null;G.zibDone=true;sfx('coin');ui.hud();return;}
 if(G.place){if(touch&&!(G.ghost&&G.ghost.c===p.c&&G.ghost.r===p.r)){G.ghost={c:p.c,r:p.r};G.ghostTouch=true;return;}
  var t=place(G.place,p.c,p.r);if(t){if(!ev.shiftKey){G.place=null;G.ghost=null;}G.sel=null;ui.shop();ui.sel();}else if(!touch){G.place=null;G.ghost=null;ui.shop();}return;}
 var hitT=null;for(var i=0;i<G.tw.length;i++)if(G.tw[i].c===p.c&&G.tw[i].r===p.r)hitT=G.tw[i];
 G.sel=hitT;ui.sel();}
function onMove(ev){if(!G||!G.place||(ev.pointerType&&ev.pointerType!=='mouse'))return;var p=tile(ev);G.ghost={c:p.c,r:p.r};G.ghostTouch=false;}
function layout(){var app=$('app');if(!app||!cv)return;var vw=Math.min(window.innerWidth||800,(document.documentElement&&document.documentElement.clientWidth)||9999,(screen&&screen.width)||9999),vh=window.innerHeight||600,hud=$('hud'),bar=$('bar'),it=$('introTxt');
 var hudH=hud?hud.offsetHeight:34,barH=bar?bar.offsetHeight:96,extra=EMBED?0:(it?it.offsetHeight:0)+12;
 var w=Math.min(vw,880),mh=w*H/W;if(mh+hudH+barH+extra>vh){mh=Math.max(120,vh-hudH-barH-extra);w=Math.min(vw,mh*W/H);}
 w=Math.floor(w);app.style.width=w+'px';var h=Math.floor(w*H/W);$('stage').style.height=h+'px';
 var dpr=Math.min(window.devicePixelRatio||1,2),nk=w*dpr/W;if(Math.abs(nk-K)>0.001||cv.width!==Math.round(W*nk)){K=nk;cv.width=Math.round(W*K);cv.height=Math.round(H*K);bgKey='';}cv.style.width=w+'px';cv.style.height=h+'px';}
function showScr(id){var s=['scrTitle','scrMaps','scrGame','scrRoster','scrHelp'];for(var i=0;i<s.length;i++){var el=$(s[i]);if(el)el.style.display=s[i]===id?'':'none';}
 $('app').className=id==='scrGame'?'ingame':'';if(id!=='scrGame')$('app').style.width='';if(id==='scrGame')layout();}
ui.hud=function(){if(!G)return;$('hLives').textContent=G.lives;$('hCash').textContent=cur()+Math.floor(G.cash);$('hWave').textContent=G.wave+(G.N===Infinity?'':'/'+G.N);
 var nb=$('next'),can=!G.queue.length&&G.wave<G.N&&!G.over;nb.disabled=!can;nb.innerHTML=G.wave===0?'START &#9654;':G.waveActive?'NEXT &#9654;&#9654;<small>call early</small>':'NEXT WAVE &#9654;';
 $('spd').textContent=G.speed+'x';$('auto').className='hb'+(G.auto?' on':'');
 var hasMain=false;for(var i=0;i<G.tw.length;i++)if(G.tw[i].s.main)hasMain=true;$('mainBtn').style.display=hasMain?'':'none';
 ui.shopState();};
ui.tick=function(){var c=$('hCash'),v=cur()+Math.floor(G.cash);if(c.textContent!==v){c.textContent=v;ui.shopState();if(G.sel)ui.selState();}
 var l=String(G.lives);if($('hLives').textContent!==l)$('hLives').textContent=l;
 var mb=$('mainBtn');if(mb.style.display!=='none'){var tx=G.mainCD>0?'MAIN '+Math.ceil(G.mainCD)+'s':'THROW MAIN';if(mb.textContent!==tx)mb.textContent=tx;mb.disabled=G.mainCD>0;}
 var nb=$('next'),can=!G.queue.length&&G.wave<G.N&&!G.over;if(nb.disabled===can)ui.hud();};
ui.shop=function(){var h='';for(var i=0;i<TW.length;i++){var t=TW[i],al=allowed(t);if(G.daily&&!al)continue;
  h+='<button class="tb'+(al?'':' lock')+'" data-id="'+t.id+'" title="'+esc(t.n+' ('+t.show+'): '+t.about)+'"><img src="img/'+t.img+'.png" alt=""><span class="nm">'+esc(SHORT[t.id]||t.n)+'</span><span class="cs">'+(al?cur()+costOf(t.cost):'&#128274; Lv '+t.lv)+'</span></button>';}
 $('shop').innerHTML=h;ui.shopState();};
ui.shopState=function(){var b=$('shop').getElementsByTagName('button');for(var i=0;i<b.length;i++){var t=TBY[b[i].getAttribute('data-id')];if(!allowed(t))continue;b[i].className='tb'+(G.cash<costOf(t.cost)?' poor':'')+(G.place===t.id?' act':'');}};
ui.sel=function(){var t=G&&G.sel,p=$('selp');if(!t){p.style.display="none";$("shop").style.display="";layout();return;}$('shop').style.display='none';p.style.display='';
 var b=TBY[t.id],h='<div class="sh"><img src="img/'+b.img+'.png" alt=""><div class="si"><b>'+esc(b.n)+'</b><small>'+esc(b.show)+'</small><span class="row"><button class="hb sm" id="sTgt" title="Targeting">&#127919; '+t.mode.toUpperCase()+'</button><button class="hb sm red" id="sSell">SELL '+cur()+sellVal(t)+'</button><button class="hb sm" id="sX">&#10005;</button></span></div></div>';
 for(var pI=0;pI<2;pI++){var P=b.paths[pI],l=t.lv[pI],u=P.u[l],pips='';for(var k=0;k<3;k++)pips+='<i class="'+(k<l?'on':'')+'"></i>';
  h+='<div class="up '+(pI?'b':'a')+'"><div class="pn"><span class="pips">'+pips+'</span>'+esc(P.n)+'</div>';
  if(u&&canUp(t,pI))h+='<button class="ub" data-p="'+pI+'"><b>'+esc(u.n)+' <em>'+cur()+costOf(u.c)+'</em></b><span>'+esc(u.d)+'</span></button>';
  else h+='<div class="ub done">'+(l>=3?'MAXED OUT':'Locked: only one path can reach tier 3')+'</div>';h+='</div>';}
 p.innerHTML=h;ui.selState();layout();};
ui.selState=function(){var t=G.sel;if(!t)return;var b=$('selp').getElementsByTagName('button');for(var i=0;i<b.length;i++){var pp=b[i].getAttribute('data-p');if(pp===null)continue;b[i].disabled=G.cash<upCost(t,+pp);}};
ui.result=function(win,stars,cleared,xp,unl){var m=G.map,h='',st='',i;for(i=0;i<3;i++)st+='<span class="'+(i<stars?'on':'')+'">&#9733;</span>';
 var title=G.mode==='endless'?'ENDLESS: '+cleared+' WAVES':win?'CRACK HELD!':'SIGNAL LOST';
 h+='<div class="rt '+(win?'w':'l')+'">'+title+'</div>';if(win&&G.mode!=='endless')h+='<div class="bigstars">'+st+'</div>';
 h+='<p>'+esc(m.n)+(G.hard?' (Hard)':'')+(G.daily?' &middot; Daily: '+esc(G.daily.mod.n):'')+'<br>Waves cleared: '+cleared+' &middot; Lives left: '+G.lives+'/'+G.maxLives+'</p>';
 h+='<p class="xp">+'+xp+' XP &middot; Level '+level(S.xp)+'</p>';
 for(i=0;i<unl.length;i++)h+='<div class="unl"><img src="img/'+unl[i].img+'.png" alt=""><span>NEW TOWER: <b>'+esc(unl[i].n)+'</b><br><small>'+esc(unl[i].show)+'</small></span></div>';
 if(win&&!G.hard&&!G.daily&&G.mode!=='endless'&&G.mi<MAPS.length-1)h+='<p class="hint">Unlocked: '+esc(MAPS[G.mi+1].n)+', plus Hard and Endless here.</p>';
 if(!win&&G.mode!=='endless')h+='<p class="hint">'+esc(['Tip: hidden enemies need a tower that can see them (Salt, Lumos, Rumple, or the right upgrade).','Tip: Krampus hits everything near him, but nothing that flies.','Tip: Big Tess makes every tower near her faster.','Tip: you can call the next wave early once the current one is fully out.','Tip: Gus & Pixel pay you for every enemy that passes. Build them early.'][G.wave%5])+'</p>';
 h+='<div class="btns">';if(win&&G.mi<MAPS.length-1&&!G.daily&&G.mode==='normal')h+='<button class="hb big go" id="rNext">NEXT MAP &#9654;</button>';
 h+='<button class="hb big" id="rRetry">RETRY</button><button class="hb big" id="rMaps">MAPS</button><a class="hb big x" id="rShare" target="_blank" rel="noopener" href="'+esc(shareURL(win,stars,cleared))+'">SHARE ON X</a></div>';
 $('dlgB').innerHTML=h;$('dlg').style.display='flex';
 var lastG={mi:G.mi,mode:G.mode,daily:G.daily};
 tap($('rRetry'),function(){$('dlg').style.display='none';go(lastG.mi,lastG.mode,lastG.daily);});
 tap($('rMaps'),function(){$('dlg').style.display='none';maps();});
 if($('rNext'))tap($('rNext'),function(){$('dlg').style.display='none';go(lastG.mi+1,'normal');});
 sfx(win?'win':'lose');};
function shareText(win,stars,cleared){var m=G.map;
 if(G.mode==='endless')return 'I lasted '+cleared+' waves of Endless on '+m.n+' in 12:49 Defense, the X-COMIX tower defense. Pete, Krampus, Marjorie and the whole multiverse holding the crack. Beat it: '+URL+' See you in another timeline.';
 if(G.daily)return 'Today\'s 12:49 Defense daily ('+G.daily.mod.n+' on '+m.n+'): '+(win?'crack held, '+stars+'/3 stars':'signal lost at wave '+(cleared+1))+'. Same towers, same waves for everyone: '+URL+' See you in another timeline.';
 if(win)return 'I held the 12:49 crack on '+m.n+(G.hard?' on HARD':'')+' ('+stars+'/3 stars) in 12:49 Defense, the X-COMIX tower defense. Big Jimmy, Pikaru, Lt. Rumple and the gang vs. geese, Cinder Mites and worse: '+URL+' See you in another timeline.';
 return 'The geese got through on '+m.n+' at wave '+(cleared+1)+' in 12:49 Defense, the X-COMIX tower defense. Earth on Mars, the whole multiverse on the towers. Your turn: '+URL+' See you in another timeline.';}
function shareURL(win,stars,cleared){return 'https://x.com/intent/post?text='+encodeURIComponent(shareText(win,stars,cleared));}
function go(mi,mode,daily){$('dlg').style.display='none';G=newGame(mi,mode,daily);acc=0;
 $('mapName').textContent=G.map.n+(G.hard?' \u2620 HARD':G.mode==='endless'?' \u221e ENDLESS':G.daily?' \u2600 DAILY':'');
 if($('introTxt'))$('introTxt').textContent=G.daily?'DAILY \u00b7 '+G.daily.mod.n+': '+G.daily.mod.d+' \u00b7 '+G.map.intro:G.map.intro;
 $('pause').innerHTML='&#10074;&#10074;';showScr('scrGame');ui.shop();ui.sel();ui.hud();layout();
 bubble(W/2,H/2,G.daily?'DAILY: '+G.daily.mod.n+'. '+G.daily.mod.d:G.map.n+'. '+G.map.place,3.5);try{window.scrollTo(0,0);}catch(e){}}
function stars3(n){var s='';for(var k=0;k<3;k++)s+='<span class="'+(k<n?'on':'')+'">&#9733;</span>';return s;}
function maps(){G=null;try{$('dlg').style.display='none';}catch(e){}showScr('scrMaps');var l=level(S.xp),nx=LV[l],pv=LV[l-1]||0,i;
 $('lvl').textContent=l;$('xpb').style.width=(nx===undefined?100:clamp((S.xp-pv)/(nx-pv)*100,0,100))+'%';$('xpt').textContent=S.xp+' XP'+(nx!==undefined?' / '+nx:'');
 var nu=null;for(i=0;i<TW.length;i++)if(TW[i].lv>l&&(!nu||TW[i].lv<nu.lv))nu=TW[i];
 $('nextUnl').innerHTML=nu?'Next tower at Lv '+nu.lv+': <b>'+esc(nu.n)+'</b> ('+esc(nu.show)+')':'Every tower unlocked. Go for Hard and Endless.';
 var h='';for(i=0;i<MAPS.length;i++){var m=MAPS[i],rec=mapRec(m.id),open=mapOpen(i);
  h+='<div class="mc'+(open?'':' locked')+'"><canvas class="thumb" data-i="'+i+'" width="160" height="100"></canvas><div class="mi"><b>'+(i+1)+'. '+esc(m.n)+'</b><small>'+esc(m.place)+'</small><div class="st">'+stars3(rec.stars)+(rec.hard?' <em title="Hard cleared">&#9760;</em>':'')+(rec.endless?' <em title="Best endless">&#8734;'+rec.endless+'</em>':'')+'</div></div>';
  h+='<div class="mb">'+(open?'<button class="hb go" data-go="'+i+'" data-m="normal">PLAY</button><button class="hb" data-go="'+i+'" data-m="hard"'+(rec.stars?'':' disabled title="Clear it first"')+'>HARD</button><button class="hb" data-go="'+i+'" data-m="endless"'+(rec.stars?'':' disabled title="Clear it first"')+'>ENDLESS</button>':'<span class="lk">&#128274; Clear '+esc(MAPS[i-1].n)+'</span>')+'</div></div>';}
 $('mapList').innerHTML=h;
 var th=$('mapList').getElementsByTagName('canvas');for(i=0;i<th.length;i++){var mi=+th[i].getAttribute('data-i'),gg=newGame(mi,'normal'),tc=th[i].getContext('2d');tc.setTransform(160/W,0,0,100/H,0,0);drawBG(tc,gg);}
 var dc=dailyCfg(),dr=S.daily[dc.key],tw='';for(i=0;i<dc.towers.length;i++)tw+='<img src="img/'+TBY[dc.towers[i]].img+'.png" alt="" title="'+esc(TBY[dc.towers[i]].n)+'">';
 $('daily').innerHTML='<div class="dh">&#9728; DAILY CHALLENGE <small>'+String(dc.key).replace(/(\d{4})(\d\d)(\d\d)/,'$1-$2-$3')+'</small></div><div class="dd"><b>'+esc(MAPS[dc.map].n)+'</b> &middot; <b>'+esc(dc.mod.n)+'</b>: '+esc(dc.mod.d)+' 12 waves with 5 borrowed towers (locked ones included):<div class="dt">'+tw+'</div></div><div class="mb"><button class="hb go" id="dGo">PLAY DAILY</button>'+(dr?'<span class="db">Today: '+(dr.stars?stars3(dr.stars):'best wave '+dr.w)+'</span>':'')+'</div>';
 tap($('dGo'),function(){go(dc.map,'normal',dc);});}
function roster(){showScr('scrRoster');var h='',l=level(S.xp),i;for(i=0;i<TW.length;i++){var t=TW[i],o=l>=t.lv;
  h+='<div class="rc'+(o?'':' locked')+'"><img src="img/'+t.img+'.png" alt=""><div><b>'+esc(t.n)+'</b> <small>'+esc(t.show)+' &middot; '+(o?cur0(t):'unlocks at Lv '+t.lv)+'</small><p>'+esc(t.about)+'</p><p class="q">&ldquo;'+esc(t.line)+'&rdquo;</p><p class="pp"><span class="a">'+esc(t.paths[0].n)+':</span> '+t.paths[0].u.map(function(u){return esc(u.n);}).join(' &rarr; ')+'<br><span class="b">'+esc(t.paths[1].n)+':</span> '+t.paths[1].u.map(function(u){return esc(u.n);}).join(' &rarr; ')+'</p></div></div>';}
 var en='';for(var k in EN){var E=EN[k];if(k==='minipuff')continue;en+='<div class="ec">'+(E.img?'<img src="img/'+E.img+'.png" alt="">':'<canvas class="eico" data-k="'+k+'" width="48" height="48"></canvas>')+'<div><b>'+esc(E.n)+'</b>'+(E.boss?' <em>BOSS</em>':E.mini?' <em>MINI-BOSS</em>':'')+'<p>'+esc(E.d)+'</p></div></div>';}
 $('rosterList').innerHTML=h;$('enemyList').innerHTML=en;
 var ic=$('enemyList').getElementsByTagName('canvas'),sv=G;G={t:0.3,sel:null};for(i=0;i<ic.length;i++){var k2=ic[i].getAttribute('data-k'),ec=ic[i].getContext('2d'),E2=EN[k2];var sc=Math.min(1.6,16/E2.sz);ec.setTransform(sc,0,0,sc,24-24*sc,24-24*sc+4);
  enemyDraw(ec,{E:E2,ty:k2,x:24,y:24,hp:1,max:1,air:!!E2.air,camo:false,rev:true,dir:1,ph:0,shield:0,seasT:0,stun:0,id:1,hit:0,mini:false,boss:false});}G=sv;}
function cur0(t){return '$'+t.cost;}
function tap(el,fn){if(!el)return;var done=0;function h(e){var n=Date.now();if(n-done<450)return;done=n;if(e&&e.cancelable&&e.type==='touchstart')e.preventDefault();fn(e);}
 if(window.PointerEvent)el.addEventListener('pointerdown',function(e){if(e.button>0)return;h(e);});else{el.addEventListener('touchstart',h,{passive:false});el.addEventListener('mousedown',h);}
 el.addEventListener('click',h);}
function boot(){cv=$('cv');ctx=cv.getContext('2d');
 if(window.PointerEvent){cv.addEventListener('pointerdown',onDown);cv.addEventListener('pointermove',onMove);}else{cv.addEventListener('touchstart',onDown,{passive:false});cv.addEventListener('mousedown',onDown);cv.addEventListener('mousemove',onMove);}
 cv.addEventListener('contextmenu',function(e){e.preventDefault();if(G){G.place=null;G.ghost=null;G.sel=null;ui.sel();ui.shop();}});
 document.addEventListener('keydown',function(e){if(!G||G.over)return;var k=e.key;if(k==='Escape'){G.place=null;G.ghost=null;G.sel=null;ui.sel();ui.shop();}else if(k===' '){e.preventDefault();if(!$('next').disabled)startWave();}else if(k==='p'||k==='P'){G.paused=!G.paused;}
  else if(k>='1'&&k<='9'){var al=[];for(var i=0;i<TW.length;i++)if(allowed(TW[i]))al.push(TW[i]);var t=al[+k-1];if(t){G.place=t.id;G.sel=null;ui.sel();ui.shop();}}});
 $('shop').addEventListener('click',function(e){var b=e.target;while(b&&b!==this&&!(b.getAttribute&&b.getAttribute('data-id')))b=b.parentNode;if(!b||b===this||!G)return;var t=TBY[b.getAttribute('data-id')];
  if(!allowed(t)){bubble(W/2,H/2,t.n+' unlocks at level '+t.lv+'.',2);return;}
  G.place=G.place===t.id?null:t.id;G.ghost=null;G.sel=null;ui.sel();ui.shop();if(G.place)bubble(W/2,H-24,t.n+': '+t.about,3);});
 $('selp').addEventListener('click',function(e){var b=e.target;while(b&&b!==this&&b.tagName!=='BUTTON')b=b.parentNode;if(!b||b===this||!G||!G.sel)return;
  var pp=b.getAttribute('data-p');if(pp!==null){upgrade(G.sel,+pp);return;}
  if(b.id==='sSell')sell(G.sel);else if(b.id==='sX'){G.sel=null;ui.sel();}else if(b.id==='sTgt'){var ms=['first','last','strong','close'];G.sel.mode=ms[(ms.indexOf(G.sel.mode)+1)%4];ui.sel();}});
 tap($('next'),function(){if(G&&!$('next').disabled)startWave();});
 tap($('spd'),function(){if(!G)return;G.speed=G.speed===1?2:G.speed===2?3:1;ui.hud();});
 tap($('auto'),function(){if(!G)return;G.auto=!G.auto;if(G.auto&&!G.waveActive&&G.wave>0)G.autoT=1.2;ui.hud();});
 tap($('pause'),function(){if(!G)return;G.paused=!G.paused;$('pause').innerHTML=G.paused?'&#9654;':'&#10074;&#10074;';});
 tap($('mainBtn'),function(){if(G)throwMain();});
 tap($('menuBtn'),function(){if(!G||G.over)return;G.paused=true;$('dlgB').innerHTML='<div class="rt">PAUSED</div><p>'+esc(G.map.n)+' &middot; wave '+G.wave+'</p><div class="btns"><button class="hb big go" id="pRes">RESUME</button><button class="hb big" id="pRe">RESTART</button><button class="hb big" id="pQ">QUIT TO MAPS</button></div>';$('dlg').style.display='flex';
  tap($('pRes'),function(){$('dlg').style.display='none';G.paused=false;$('pause').innerHTML='&#10074;&#10074;';});tap($('pRe'),function(){go(G.mi,G.mode,G.daily);});tap($('pQ'),function(){$('dlg').style.display='none';maps();});});
 var sb=document.getElementsByClassName('snd'),i;function sndUI(){for(var j=0;j<sb.length;j++){sb[j].innerHTML=S.snd?'&#128266;':'&#128263;';sb[j].title=S.snd?'Sound on':'Sound off';}}sndUI();
 for(i=0;i<sb.length;i++)tap(sb[i],function(){S.snd=!S.snd;save();sndUI();if(S.snd)sfx('coin');});
 var started=false;function start(){if(started)return;started=true;maps();}
 tap($('startBtn'),start);tap($('scrTitle'),start);
 tap($('toRoster'),roster);tap($('toHelp'),function(){showScr('scrHelp');});
 var bk=document.getElementsByClassName('back');for(i=0;i<bk.length;i++)tap(bk[i],maps);
 $('mapList').addEventListener('click',function(e){var b=e.target;if(!b.getAttribute||b.getAttribute('data-go')===null||b.disabled)return;go(+b.getAttribute('data-go'),b.getAttribute('data-m'));});
 window.addEventListener('resize',function(){if(G)layout();});
 showScr('scrTitle');requestAnimationFrame(frame);}
window.__td={get G(){return G;},get S(){return S;},go:go,maps:maps,place:place,upgrade:upgrade,wave:function(){startWave();},
 sim:function(sec){var n=Math.round(sec/STEP);for(var i=0;i<n&&G&&!G.over;i++)step(STEP);},sell:sell,main:throwMain,free:function(c,r){return tileFree(c,r);},canUp:canUp,
 lvl:function(){return level(S.xp);},reset:function(){S={xp:0,maps:{},daily:{},snd:false,games:0};save();},setxp:function(x){S.xp=x;save();},buildWave:function(w){return buildWave(w);},daily:dailyCfg,share:shareText,bal:BAL};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
