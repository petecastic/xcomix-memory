/* Midnight Lanes: Three Worlds — X-COMIX Arcade. (c) 2026 Petecastic Productions LLC. Free, no ads. */
(function(){
'use strict';
var D = ML_DATA, W = 960, H = 480, LEFT = 64, CW = 96, CH = 96, COLS = 9, ROWS = 5;
var EMBED = document.body.classList.contains('embed');
var $ = function(id){ return document.getElementById(id); };
var SK = 'mlanes_v1';
function load(){ var s=null; try{ s=JSON.parse(localStorage.getItem(SK)); }catch(e){} s=(s&&typeof s==='object')?s:{};
  s.prog=s.prog||{}; s.best=s.best||{}; if(typeof s.snd!=='boolean') s.snd=true; s.auto=!!s.auto; return s; }
function save(){ try{ localStorage.setItem(SK, JSON.stringify(S)); }catch(e){} }
var S = load();
(function(){ try{ if(/[?&]all=1/.test(location.search)){ D.worlds.forEach(function(w){ S.prog[w.id]=Math.max(S.prog[w.id]||0,6); }); } }catch(e){} })();

var IMG = {};
function img(n){ if(!IMG[n]){ var i=new Image(); i.src='art/'+n+'.jpg'; IMG[n]=i; } return IMG[n]; }
Object.keys(D.def).forEach(function(k){ img(D.def[k].img); });

var AC=null, MG=null;
function audioInit(){ try{ if(!AC){ var C=window.AudioContext||window.webkitAudioContext; if(!C) return; AC=new C(); MG=AC.createGain(); MG.gain.value=0.16; MG.connect(AC.destination);} if(AC.state==='suspended') AC.resume(); }catch(e){ AC=null; } }
function tone(f,d,type,vol,slide,delay){ if(!S.snd||!AC) return; try{ var t=AC.currentTime+(delay||0), o=AC.createOscillator(), g=AC.createGain(); o.type=type||'square'; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,slide),t+d); g.gain.setValueAtTime(vol||0.5,t); g.gain.exponentialRampToValueAtTime(0.001,t+d); o.connect(g); g.connect(MG); o.start(t); o.stop(t+d+0.02);}catch(e){} }
var lastShot=0;
function sfx(k){ if(!S.snd||!AC) return;
  if(k==='shoot'){ var n=Date.now(); if(n-lastShot<70) return; lastShot=n; tone(520,0.06,'square',0.12,300); }
  else if(k==='place'){ tone(330,0.08,'triangle',0.6,660); }
  else if(k==='collect'){ tone(880,0.07,'sine',0.5); tone(1320,0.09,'sine',0.4,null,0.06); }
  else if(k==='hit'){ tone(180,0.05,'square',0.15,120); }
  else if(k==='boom'){ tone(140,0.45,'sawtooth',0.7,40); tone(90,0.5,'square',0.4,30,0.03); }
  else if(k==='chomp'){ tone(220,0.12,'square',0.5,90); tone(160,0.12,'square',0.4,70,0.12); }
  else if(k==='wave'){ tone(440,0.25,'sawtooth',0.4); tone(440,0.25,'sawtooth',0.4,null,0.35); tone(660,0.4,'sawtooth',0.4,null,0.7); }
  else if(k==='sweep'){ tone(200,0.6,'sawtooth',0.35,600); }
  else if(k==='win'){ [523,659,784,1046].forEach(function(f,i){ tone(f,0.22,'square',0.35,null,i*0.13); }); }
  else if(k==='lose'){ [392,330,262,196].forEach(function(f,i){ tone(f,0.3,'triangle',0.45,null,i*0.2); }); }
  else if(k==='dig'){ tone(160,0.1,'triangle',0.5,90); }
  else if(k==='bell'){ tone(1568,0.8,'sine',0.5); tone(2093,0.8,'sine',0.3,null,0.02); }
  else if(k==='err'){ tone(120,0.1,'square',0.3); }
}

function show(id){ ['scrTitle','scrMap','scrGame','scrAlm','scrHelp'].forEach(function(s){ var e=$(s); if(e) e.style.display=(s===id)?'':'none'; });
  $('app').className = id==='scrGame' ? 'ingame' : ''; if(id!=='scrGame') running=false; }
function sndBtns(){ var b=document.querySelectorAll('.snd'); for(var i=0;i<b.length;i++){ b[i].innerHTML = S.snd ? '&#128266;' : '&#128263;'; } }
function bindTap(el, fn){ if(!el) return; var last=0; function h(e){ var n=Date.now(); if(n-last<400) return; last=n; e.stopPropagation(); fn(e); }
  el.addEventListener('pointerdown', h); el.addEventListener('touchstart', h, {passive:true}); el.addEventListener('click', h); }

function avail(w, st){ var list=w.defenders.slice(0,w.start); for(var i=0;i<Math.min(st,5);i++) list=list.concat(w.unlock[i]); return list; }
function renderMap(){
  var h='';
  D.worlds.forEach(function(w,wi){ var cl=S.prog[w.id]||0;
    h+='<div class="world w-'+w.id+'"><div class="wh"><img src="art/'+D.def[w.defenders[0]].img+'.jpg" alt=""><img src="art/'+D.def[w.defenders[1]].img+'.jpg" alt=""><img src="art/'+D.foe[w.boss].img+'.jpg" alt=""><div><b>World '+(wi+1)+': '+w.show+'</b><small>'+w.name+' &middot; '+w.cur+'</small></div></div><p class="wb">'+w.blurb+'</p><div class="stg">';
    for(var s=0;s<7;s++){ var lock = s===6 ? cl<6 : s>cl; var done = s<cl;
      var lab = s<5 ? (wi+1)+'-'+(s+1) : (s===5?'BOSS':'ENDLESS');
      h+='<button class="hb sb'+(s===5?' boss':'')+(s===6?' endl':'')+(done?' done':'')+'" data-w="'+wi+'" data-s="'+s+'"'+(lock?' disabled':'')+' title="'+w.stageNames[s]+'">'+(lock?'&#128274; ':'')+lab+(done?' &#10003;':'')+'<small>'+w.stageNames[s].replace('BOSS: ','')+(s===6&&S.best[w.id]?' &middot; best '+S.best[w.id]:'')+'</small></button>'; }
    h+='</div></div>'; });
  $('worlds').innerHTML=h;
  var b=$('worlds').querySelectorAll('.sb'); for(var i=0;i<b.length;i++){ (function(el){ bindTap(el,function(){ if(el.disabled) return; startStage(+el.getAttribute('data-w'), +el.getAttribute('data-s')); }); })(b[i]); }
}

var almW=0;
function renderAlm(){
  var w=D.worlds[almW], cl=S.prog[w.id]||0, h='<div class="atabs">';
  D.worlds.forEach(function(x,i){ h+='<button class="hb sm'+(i===almW?' go':'')+'" data-a="'+i+'">'+x.show+'</button>'; });
  h+='</div><h3>Defenders &middot; '+w.name+'</h3><div class="agrid">';
  var have=avail(w, cl);
  w.defenders.forEach(function(id){ var d=D.def[id], ok=have.indexOf(id)>=0 || cl>=5;
    var unl=''; if(!ok){ for(var i=0;i<5;i++) if(w.unlock[i].indexOf(id)>=0) unl='Unlocks after Stage '+(D.worlds.indexOf(w)+1)+'-'+(i+1); }
    h+='<div class="ae'+(ok?'':' lk')+'"><img src="art/'+d.img+'.jpg" alt="'+d.name+'"><div><b>'+d.name+'</b><i>'+d.role+'</i><span class="st">Cost '+d.cost+' '+w.curShort+' &middot; Recharge '+(d.cd>=40?'very slow':d.cd>=20?'slow':'fast')+(d.dmg?' &middot; Power '+d.dmg:'')+(d.hp>=1000&&d.hp<9999?' &middot; Toughness '+d.hp:'')+'</span><p>'+d.desc+'</p><q>'+d.line+'</q>'+(unl?'<em>'+unl+'</em>':'')+'</div></div>'; });
  h+='</div><h3>Raiders &middot; who\'s coming down the lanes</h3><div class="agrid">';
  w.enemies.forEach(function(id){ var f=D.foe[id];
    h+='<div class="ae foe"><canvas width="96" height="96" data-foe="'+id+'"></canvas>'+(f.img?'<img class="sm" src="art/'+f.img+'.jpg" alt="">':'')+'<div><b>'+f.name+(f.boss?' <span class="bt">BOSS</span>':'')+'</b><span class="st">Toughness '+(f.hp+(f.armor||0))+(f.armor?' (armor '+f.armor+')':'')+' &middot; Speed '+(f.spd>=30?'fast':f.spd>=17?'normal':'slow')+(f.fly?' &middot; flying':'')+'</span><p>'+f.desc+'</p></div></div>'; });
  h+='</div><p class="note">Another timeline, all in fun. Nobody gets hurt: raiders get shooed, swept, stuck or sent home. Crabs here are always LIVE BLUE crabs. No real brands.</p>';
  $('almBody').innerHTML=h;
  var c=$('almBody').querySelectorAll('canvas[data-foe]'); for(var i=0;i<c.length;i++){ var id=c[i].getAttribute('data-foe'), x=c[i].getContext('2d'), f=D.foe[id]; x.save(); x.translate(48,f.boss?62:52); var sc=f.boss?0.62:0.9; x.scale(sc,sc); drawFoe(x,{type:id,f:f,x:0,y:0,hp:1,armor:(f.armor||0),maxarmor:f.armor||0,anim:0.3,fl:0,slow:0,stun:0,stuck:0,jump:0},0,0); x.restore(); }
  var t=$('almBody').querySelectorAll('[data-a]'); for(i=0;i<t.length;i++){ (function(el){ bindTap(el,function(){ almW=+el.getAttribute('data-a'); renderAlm(); }); })(t[i]); }
}

/* ---------------- game state ---------------- */
var cv=$('cv'), ctx=cv.getContext('2d'), G=null, running=false, lastT=0, bgCanvas=null;
function rnd(a,b){ return a+Math.random()*(b-a); }
function ri(n){ return Math.floor(Math.random()*n); }
function cx(c){ return LEFT+c*CW+CW/2; }
function cy(r){ return r*CH+CH/2; }

function buildWaves(w, st){
  var waves=[], n, flags, pool=w.pool[Math.min(st,4)], sc=1+Math.min(st,4)*0.16;
  if(st<5){ n=6+st*2; flags= st<2 ? [n-1] : [Math.floor(n/2)-1, n-1]; }
  else { n=16; flags=[7,15]; }
  for(var i=0;i<n;i++){ var isF=flags.indexOf(i)>=0; var bud=Math.floor(1+i*0.36*sc); if(isF) bud=Math.floor(bud*1.8)+2;
    waves.push({list:compose(pool,bud,i), flag:isF}); }
  if(st===5) waves[n-1].list.push(w.boss);
  return {waves:waves, flags:flags};
}
function compose(pool,bud,i){ var out=[]; if(i===0) return [pool[0]];
  var guard=0; while(bud>0 && guard++<60){ var opts=pool.filter(function(k){ var c=D.foe[k].cost; return c<=bud && (c<4 || i>=3); });
    if(!opts.length) break; var k = Math.random()<0.4 ? opts[0] : opts[ri(opts.length)]; out.push(k); bud-=D.foe[k].cost; }
  return out; }
function endlessWave(w,i){ var pool=w.pool[4], bud=Math.floor(2+i*0.9+Math.pow(i,1.25)*0.15), flag=(i+1)%8===0; if(flag) bud=Math.floor(bud*2)+3;
  var l=compose(pool,bud,i+1); if((i+1)%16===0) l.push(w.boss); return {list:l, flag:flag}; }

function startStage(wi, st){
  audioInit(); $('dlg').className='';
  var w=D.worlds[wi], wv = st===6 ? {waves:[], flags:[]} : buildWaves(w,st);
  G={wi:wi, w:w, st:st, endless:st===6, energy: st>=5?150:50, grid:[], units:[], foes:[], projs:[], drops:[], fx:[], pending:[],
     sweep:[], waves:wv.waves, flags:wv.flags, wave:0, waveT:20, time:0, sel:null, cds:{}, over:false, won:false, speed:1, paused:false,
     skyT:3, avail: st>=5 ? w.defenders.slice() : avail(w,st), bannerT:0, endT:0, killed:0, hover:null, shake:0};
  for(var r=0;r<ROWS;r++){ G.grid.push([]); for(var c=0;c<COLS;c++) G.grid[r].push(null); G.sweep.push({st:'idle', x:LEFT-34, hitBoss:false}); }
  G.avail.forEach(function(id){ G.cds[id] = (D.def[id].cd>=30) ? D.def[id].cd*0.6 : 0; });
  buildBg(); buildPackets(); buildFlags();
  $('stName').textContent = w.show+' \u00b7 '+(st<5?(wi+1)+'-'+(st+1)+' ':'')+w.stageNames[st];
  document.body.setAttribute('data-world', w.id); $('spdBtn').textContent='1x';
  show('scrGame'); running=true; lastT=performance.now(); resize(); setTimeout(resize,50);
  banner(st===6 ? 'ENDLESS! How long can you hold?' : (st===5 ? 'BOSS NIGHT! Hold every lane!' : w.stageNames[st]+' \u2014 get ready!'), 3);
  requestAnimationFrame(loop);
}
function buildFlags(){ var h='<i id="wfill"></i>'; if(!G.endless){ G.flags.forEach(function(f){ h+='<b class="fl" style="left:'+((f+1)/G.waves.length*100)+'%">&#9873;</b>'; }); } else h+='<b class="fl" style="left:100%">&#9873;</b>'; $('wmeter').innerHTML=h; }

/* ---------------- packets ---------------- */
var pkEls={};
function buildPackets(){
  var h=''; G.avail.forEach(function(id,i){ var d=D.def[id];
    h+='<button class="pk" data-id="'+id+'" title="'+d.name+' \u2014 '+d.role+' ('+d.cost+')"><img src="art/'+d.img+'.jpg" alt=""><span class="pc">'+d.cost+'</span><i class="cdv"></i><b class="ky">'+(i+1)+'</b></button>'; });
  $('packets').innerHTML=h; pkEls={};
  var b=$('packets').querySelectorAll('.pk'); for(var i=0;i<b.length;i++){ (function(el){ var id=el.getAttribute('data-id'); pkEls[id]={el:el, cd:el.querySelector('.cdv'), st:''};
    el.addEventListener('pointerdown', function(e){ e.preventDefault(); pick(id); }); })(b[i]); }
  $('curName').textContent=G.w.curShort; $('energyIco').className='eico e-'+G.w.id;
}
function pick(id){ audioInit(); if(!G||G.over) return; if(G.sel===id){ G.sel=null; return; } var d=D.def[id];
  if(G.cds[id]>0 || G.energy<d.cost){ sfx('err'); return; } G.sel=id; sfx('dig'); }
function updPackets(){ if(!G) return; for(var id in pkEls){ var p=pkEls[id], d=D.def[id], cd=G.cds[id]||0;
    var st=(G.sel===id?'a':'')+(cd>0?'c':'')+(G.energy<d.cost?'p':'')+'|'+Math.ceil(cd/(d.cd||1)*40);
    if(st!==p.st){ p.st=st; p.el.className='pk'+(G.sel===id?' act':'')+(cd>0?' cool':'')+(G.energy<d.cost?' poor':''); p.cd.style.height=(cd>0? Math.min(100,cd/d.cd*100):0)+'%'; } }
  var sc='hb sm tool'+(G.sel==='shovel'?' go':''); if($('shovel').className!==sc) $('shovel').className=sc; $('energy').textContent=Math.floor(G.energy);
}

/* ---------------- placement ---------------- */
function cellAt(x,y){ var c=Math.floor((x-LEFT)/CW), r=Math.floor(y/CH); if(c<0||c>=COLS||r<0||r>=ROWS) return null; return {c:c,r:r}; }
function place(id,c,r){ var d=D.def[id]; if(G.grid[r][c]) return false;
  var u={id:id, d:d, c:c, r:r, x:cx(c), y:cy(r), hp:d.hp, maxhp:d.hp, t:0, fire:0, anim:rnd(0,3), born:G.time+Math.random(), hit:0};
  if(d.kind==='prod') u.t=rnd(4,6); if(d.kind==='shoot'||d.kind==='triple'||d.kind==='lob'||d.kind==='paddle') u.t=rnd(0.3,1.1);
  if(d.kind==='mine') u.arm=d.arm; if(d.kind==='trap') u.uses=d.uses; if(d.kind==='bomb_row'||d.kind==='bell') u.fuse=0.7;
  if(d.kind==='chomp') u.chew=0;
  G.grid[r][c]=u; G.units.push(u); G.energy-=d.cost; G.cds[id]=d.cd; sfx('place');
  puff(u.x,u.y+30,'#fff',8,60); return true; }
function removeUnit(u){ if(G.grid[u.r][u.c]===u) G.grid[u.r][u.c]=null; var i=G.units.indexOf(u); if(i>=0) G.units.splice(i,1); u.dead=true; }

function tap(x,y){
  if(!G||G.over||G.paused) return;
  for(var i=G.drops.length-1;i>=0;i--){ var dr=G.drops[i]; if(Math.abs(dr.x-x)<48 && Math.abs(dr.y-y)<48){ collect(dr); return; } }
  var cell=cellAt(x,y); if(!cell){ G.sel=null; return; }
  if(G.sel==='shovel'){ var u=G.grid[cell.r][cell.c]; if(u){ G.energy+=Math.floor(u.d.cost*0.25); removeUnit(u); puff(u.x,u.y+20,'#a87a4a',10,80); sfx('dig'); } G.sel=null; return; }
  if(G.sel){ var d=D.def[G.sel]; if(G.grid[cell.r][cell.c]){ sfx('err'); return; } if(G.energy<d.cost||G.cds[G.sel]>0){ G.sel=null; return; }
    place(G.sel,cell.c,cell.r); G.sel=null; return; }
}
function collect(dr){ var i=G.drops.indexOf(dr); if(i<0) return; G.drops.splice(i,1); G.energy+=dr.v; sfx('collect');
  G.fx.push({k:'text', x:dr.x, y:dr.y-10, t:0, life:0.9, s:'+'+dr.v, col:'#fff'}); }

/* ---------------- spawning ---------------- */
function spawnFoe(type,row,x){ var f=D.foe[type];
  var e={type:type, f:f, row:row, y:cy(row), x:x||W+rnd(20,60), hp:f.hp, maxhp:f.hp, armor:f.armor||0, maxarmor:f.armor||0, spd:f.spd*rnd(0.92,1.08),
    slow:0, stuck:0, stun:0, anim:rnd(0,6), fl:0, burrow:!!f.burrow, vaulted:false, hooked:false, bumped:false, boing:0, boss:!!f.boss, jump:0};
  if(e.boss){ e.swT=8; e.spT=6; if(!x) e.x=W+40; }
  G.foes.push(e); return e; }
function spawnWave(wv){
  var order=[0,1,2,3,4].sort(function(){ return Math.random()-0.5; });
  wv.list.forEach(function(type,i){ var boss=D.foe[type].boss, r = boss ? 2 : order[i%5]; if(i%5===4) order.sort(function(){ return Math.random()-0.5; });
    if(boss) bossIntro(type);
    G.pending.push({type:type,row:r,at:G.time+(boss?3:rnd(0, wv.flag?4:2.5)+i*0.3)}); });
}
function bossIntro(type){ var f=D.foe[type]; var el=$('bossIntro'); el.innerHTML='<div><img src="art/'+f.img+'.jpg" alt="">'+(f.img2?'<img src="art/'+f.img2+'.jpg" alt="">':'')+'</div><b>'+f.name+'</b><span>'+(f.desc.split('"')[1]||'')+'</span>';
  el.className='show'; setTimeout(function(){ el.className=''; }, 3400); sfx('wave'); }
function banner(s,t){ G.bannerT=t||2.5; var b=$('banner'); b.textContent=s; b.className='show'; }

/* ---------------- damage ---------------- */
function hurt(e,dmg,armMul){ if(e.dead) return; armMul=armMul||1; e.fl=0.12;
  if(e.armor>0){ var a=dmg*armMul; if(a>=e.armor){ dmg=(a-e.armor)/armMul; e.armor=0; puff(e.x,e.y-30,'#bbb',6,90); } else { e.armor-=a; dmg=0; } }
  e.hp-=dmg; if(e.hp<=0) kill(e,'shoo'); }
function kill(e,how){ if(e.dead) return; e.dead=true; G.killed++; var i=G.foes.indexOf(e); if(i>=0) G.foes.splice(i,1);
  puff(e.x,e.y,how==='stink'?'#7ccb3a':'#fff',e.boss?40:12,e.boss?220:110);
  G.fx.push({k:'text',x:e.x,y:e.y-36,t:0,life:0.8,s:e.boss?'DEFEATED!':(how==='sweep'?'SWEPT!':(how==='stink'?'PEE-YEW!':(how==='chomp'?'GULP!':'SHOO!'))),col:e.boss?'#ffcf3a':'#fff'});
  if(e.boss){ sfx('boom'); G.shake=0.6; G.pending=[]; for(var j=G.foes.length-1;j>=0;j--) kill(G.foes[j],'shoo'); } }
function puff(x,y,col,n,sp){ for(var i=0;i<n;i++){ var a=Math.random()*6.28, v=rnd(sp*0.3,sp); G.fx.push({k:'p',x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,t:0,life:rnd(0.35,0.7),col:col,r:rnd(3,7)}); } if(G.fx.length>500) G.fx.splice(0,G.fx.length-500); }
function targetable(e){ return !e.burrow && !e.dead; }
function frontFoe(r,x0,x1,filter){ var best=null; for(var i=0;i<G.foes.length;i++){ var e=G.foes[i]; if(e.row!==r||e.x<x0||e.x>x1) continue; if(filter&&!filter(e)) continue; if(!best||e.x<best.x) best=e; } return best; }

/* ---------------- update ---------------- */
function hasHonAdj(u){ for(var dr=-1;dr<=1;dr++) for(var dc=-1;dc<=1;dc++){ var r=u.r+dr,c=u.c+dc; if(r<0||r>=ROWS||c<0||c>=COLS||(dr===0&&dc===0)) continue; var o=G.grid[r][c]; if(o&&o.id==='hon') return true; } return false; }
function fire(u,row,kind,dmg,slow){ G.projs.push({x:u.x+26,y:cy(row)-14,row:row,vx:520,dmg:dmg,slow:slow||0,kind:kind,fire:false,lob:false}); u.fire=0.18; sfx('shoot'); }
function inRowFoe(u,r){ return frontFoe(r,u.x-10,W+30,targetable); }
function updUnit(u,dt){ var d=u.d, i; u.anim+=dt; if(u.fire>0) u.fire-=dt; if(u.hit>0) u.hit-=dt;
  switch(d.kind){
  case 'prod': u.t-=dt; if(u.t<=0){ u.t=d.rate+rnd(-1,2); u.fire=0.4; G.drops.push({x:u.x+rnd(-14,14),y:u.y-10,ty:u.y+rnd(6,22),vy:-220,v:25,life:10,t:0,pop:true}); } break;
  case 'shoot': case 'triple':
    u.t-=dt*(hasHonAdj(u)?d.buff||1.3:1); var rows = d.kind==='triple' ? [u.r-1,u.r,u.r+1] : [u.r], any=false;
    rows.forEach(function(r){ if(r>=0&&r<ROWS&&inRowFoe(u,r)) any=true; });
    if(any && u.t<=0){ u.t=d.rate; rows.forEach(function(r){ if(r<0||r>=ROWS) return; fire(u,r,d.proj,d.dmg,d.slow); }); if(d.shots===2) u.second=0.14; }
    if(u.second>0){ u.second-=dt; if(u.second<=0) fire(u,u.r,d.proj,d.dmg,d.slow); } break;
  case 'lob': u.t-=dt*(hasHonAdj(u)?1.3:1); var tg=frontFoe(u.r,u.x-10,W+10,function(e){ return !e.f.fly && !e.dead; });
    if(tg && u.t<=0){ u.t=d.rate; var spd=(tg.stun>0||tg.stuck>0||tg.eating)?0:tg.spd*(tg.slow>0?0.5:1); var tx=Math.max(u.x+30,tg.x-spd*1.0);
      G.projs.push({lob:true,sx:u.x,sy:u.y-24,tx:tx,ty:cy(u.r)-10,x:u.x,y:u.y-24,p:0,dur:1.0,row:u.r,dmg:d.dmg,splash:d.splash||0,slow:d.slow||0,kind:d.proj,target:tg}); u.fire=0.3; sfx('shoot'); } break;
  case 'chomp': if(u.chew>0){ u.chew-=dt; break; } var ch=frontFoe(u.r,u.x-20,u.x+CW*1.45,function(e){ return !e.f.fly && !e.burrow && !e.dead; });
    if(ch){ u.fire=0.45; sfx('chomp'); if(ch.boss){ hurt(ch,450); u.chew=8; } else { kill(ch,'chomp'); u.chew=d.chew; } } break;
  case 'mine': if(u.arm>0){ u.arm-=dt; if(u.arm<=0) puff(u.x,u.y+20,'#c9b48a',8,60); break; }
    var m=frontFoe(u.r,u.x-40,u.x+44,function(e){ return !e.f.fly && !e.dead; });
    if(m){ G.foes.slice().forEach(function(e){ if(e.row===u.r && Math.abs(e.x-u.x)<80 && !e.f.fly) hurt(e, e.boss?d.dmg*0.4:d.dmg); }); boom(u.x,u.y,'#9ad7ff'); G.fx.push({k:'text',x:u.x,y:u.y-40,t:0,life:1,s:'WHY TODAY?!',col:'#fff'}); removeUnit(u); } break;
  case 'trap': G.foes.forEach(function(e){ if(e.row===u.r && !e.f.fly && !e.boss && !e.burrow && Math.abs(e.x-u.x)<34 && !e['tr'+u.born]){ e['tr'+u.born]=1; e.stuck=d.stick; hurt(e,d.dmg); u.uses--; u.fire=0.3; } });
    if(u.uses<=0){ puff(u.x,u.y+20,'#f0e6b0',8,50); removeUnit(u); } break;
  case 'bomb_row': u.fuse-=dt; if(u.fuse<=0){ G.foes.slice().forEach(function(e){ if(e.row===u.r){ if(e.boss) hurt(e,d.dmg*0.5); else if(e.hp+e.armor<=d.dmg) kill(e,'stink'); else hurt(e,d.dmg); } });
      for(i=0;i<26;i++) G.fx.push({k:'cloud',x:LEFT+i*34+rnd(-10,10),y:cy(u.r)+rnd(-24,24),t:0,life:rnd(1.1,1.8),r:rnd(26,42)}); sfx('boom'); G.shake=0.35;
      G.fx.push({k:'text',x:u.x,y:u.y-44,t:0,life:1.4,s:'DON\'T PANIC!!',col:'#c8ff8a'}); removeUnit(u); } break;
  case 'bell': u.fuse-=dt; if(u.fuse<=0){ G.foes.slice().forEach(function(e){ if(Math.abs(e.row-u.r)<=1 && Math.abs(e.x-u.x)<CW*1.5){ hurt(e, e.boss?600:d.dmg); } else e.stun=Math.max(e.stun,d.stun); });
      G.fx.push({k:'ring',x:u.x,y:u.y,t:0,life:0.9,r:CW*1.6}); G.fx.push({k:'ring',x:u.x,y:u.y,t:0,life:1.4,r:W}); sfx('bell');
      G.fx.push({k:'text',x:u.x,y:u.y-44,t:0,life:1.4,s:'RIIING! Nya.',col:'#fff2a8'}); removeUnit(u); } break;
  case 'paddle': u.t-=dt; if(u.t<=0){ var near=function(e){ return Math.abs(e.row-u.r)<=1 && e.x>u.x-20 && e.x<u.x+CW*1.7 && targetable(e); };
      if(G.foes.some(near)){ u.t=d.rate; u.fire=0.5; G.foes.filter(near).forEach(function(e){ hurt(e,d.dmg,3); });
        for(var k=0;k<14;k++) G.fx.push({k:'p',x:u.x+rnd(10,CW*1.6),y:u.y+rnd(-CH,CH),vx:rnd(40,140),vy:rnd(-80,10),t:0,life:0.6,col:'#8fd3ff',r:rnd(3,6)}); sfx('hit'); } } break;
  }
}
function boom(x,y,col){ puff(x,y,col,26,200); G.fx.push({k:'ring',x:x,y:y,t:0,life:0.5,r:90}); sfx('boom'); G.shake=0.25; }

function blocker(e){
  var reach = e.boss?62:28;
  for(var c=COLS-1;c>=0;c--){ var u=G.grid[e.row][c]; if(!u||u.dead) continue; if(u.d.kind==='trap') continue; if(u.d.kind==='mine'&&u.arm<=0) continue;
    if(e.f.fly && u.d.kind!=='tall') continue;
    if(e.x-reach <= u.x+38 && e.x >= u.x-30) return u; }
  return null; }
function updFoe(e,dt){ e.anim+=dt; if(e.fl>0) e.fl-=dt; if(e.slow>0) e.slow-=dt; if(e.stuck>0) e.stuck-=dt; if(e.stun>0){ e.stun-=dt; return; }
  var sp=e.spd; if(e.type==='basket' && e.armor<=0) sp=18; if(e.slow>0) sp*=0.5; if(e.stuck>0) sp*=0.12;
  if(e.jump>0){ e.jump-=dt; e.x-=(96/0.6)*dt; return; }
  if(e.boing>0){ e.boing-=dt; e.x+=110*dt; return; }
  if(e.boss) updBoss(e,dt);
  if(e.burrow){ e.x-=sp*dt; if(e.x<(e.surfX||(e.surfX=LEFT+CW*rnd(3.2,4.6)))){ e.burrow=false; puff(e.x,e.y+20,'#8a6a3a',14,90); G.fx.push({k:'text',x:e.x,y:e.y-36,t:0,life:0.9,s:'"Go, go, go!"',col:'#fff'}); } }
  else {
    var u=blocker(e);
    if(u){
      if(e.f.vault && !e.vaulted){ e.vaulted=true; if(u.d.kind!=='tall'){ e.jump=0.6; puff(e.x,e.y,'#bff',8,70); return; } }
      if(e.f.hook && !e.hooked && u.d.kind!=='wall' && u.d.kind!=='tall'){ e.hooked=true; G.fx.push({k:'text',x:u.x,y:u.y-40,t:0,life:1,s:'YANK!',col:'#fff'}); puff(u.x,u.y,'#fff',10,90); removeUnit(u); return; }
      if(e.f.bump && e.armor>0 && !e.bumped){ e.bumped=true; u.hp-=e.f.bump; u.hit=0.2; puff(u.x,u.y,'#ffd',8,80); }
      e.eating=true; u.hp-=e.f.bite*dt*(e.stuck>0?0.3:1); u.hit=0.1; if(e.boss && Math.random()<dt*6) puff(u.x,u.y,'#ccc',2,60);
      if(u.d.boing){ u.bt=(u.bt||0)+dt; if(u.bt>2.6){ u.bt=0; e.boing=0.55; u.fire=0.3; G.fx.push({k:'text',x:u.x,y:u.y-40,t:0,life:0.7,s:'BOING!',col:'#ff7ab0'}); } }
      if(u.hp<=0){ puff(u.x,u.y,'#ddd',12,90); removeUnit(u); }
    } else { e.eating=false; e.x-=sp*dt; }
  }
  var sw=G.sweep[e.row]; if(e.x<LEFT+4){ if(sw.st==='idle'){ sw.st='go'; sfx('sweep'); banner(G.w.sweeper+'!',1.2); } else if(sw.st==='gone' && e.x<LEFT-36){ lose(); } }
}
function updBoss(e,dt){ e.swT-=dt; e.spT-=dt;
  if(e.swT<=0){ e.swT=rnd(7,10); var nr=e.row+(Math.random()<0.5?-1:1); if(nr<0) nr=1; if(nr>=ROWS) nr=ROWS-2; e.row=nr; G.fx.push({k:'text',x:e.x,y:cy(nr)-60,t:0,life:1,s:'LANE SWITCH!',col:'#ffcf3a'}); }
  e.y+=(cy(e.row)-e.y)*Math.min(1,dt*4);
  if(e.spT<=0){ e.spT=rnd(9,12); var m = G.w.id==='stink' ? ['dustmite','dustmite'] : (G.w.id==='oldbay' ? ['gull','crabpot'] : ['sodacan','sodacan']);
    m.forEach(function(k){ spawnFoe(k,ri(ROWS),Math.min(W+20,e.x+40)); }); G.fx.push({k:'text',x:e.x,y:e.y-74,t:0,life:1.2,s:G.w.id==='stink'?'"Kneel before the suction!"':(G.w.id==='oldbay'?'"Trust me, boys!"':'"Gwa-ha-ha!"'),col:'#fff'}); }
}
function updSweep(dt){ for(var r=0;r<ROWS;r++){ var s=G.sweep[r]; if(s.st!=='go') continue; s.x+=430*dt;
  G.foes.slice().forEach(function(e){ if(e.row===r && Math.abs(e.x-s.x)<40 && !e.burrow){ if(e.boss){ if(!s.hitBoss){ s.hitBoss=true; hurt(e,1500); G.shake=0.4; } } else kill(e,'sweep'); } });
  if(Math.random()<dt*30) G.fx.push({k:'p',x:s.x-30,y:cy(r)+rnd(10,30),vx:-60,vy:rnd(-40,0),t:0,life:0.4,col:G.w.id==='oldbay'?'#9ad7ff':'#fff',r:rnd(3,6)});
  if(s.x>W+60) s.st='gone'; } }
function updProj(dt){
  for(var i=G.projs.length-1;i>=0;i--){ var p=G.projs[i];
    if(p.lob){ p.p+=dt/p.dur; p.x=p.sx+(p.tx-p.sx)*p.p; p.y=p.sy+(p.ty-p.sy)*p.p - Math.sin(Math.PI*Math.min(1,p.p))*110;
      if(p.p>=1){ G.projs.splice(i,1); var land=false;
        G.foes.slice().forEach(function(e){ if(e.row!==p.row||e.f.fly) return; var dx=Math.abs(e.x-p.x); var hitR = p.splash||(e.boss?60:34);
          if(dx<hitR || (e===p.target && dx<70)){ if(e.f.umb){ G.fx.push({k:'text',x:e.x,y:e.y-50,t:0,life:0.6,s:'*bonk*',col:'#fff'}); land=true; return; } hurt(e,p.dmg); if(p.slow) e.slow=Math.max(e.slow,p.slow); land=true; } });
        puff(p.x,p.y,p.kind==='spice'?'#e8833a':(p.kind==='plum'?'#d64a7a':'#c98a3a'),p.splash?16:6,p.splash?120:60); if(land) sfx('hit'); }
      continue; }
    var ox=p.x; p.x+=p.vx*dt;
    if(!p.fire){ for(var c=0;c<COLS;c++){ var u=G.grid[p.row][c]; if(u&&u.d.kind==='torch'&&ox<u.x&&p.x>=u.x){ p.fire=true; p.dmg*=2; p.slow=0; u.fire=0.2; } } }
    var hit=null; for(var j=0;j<G.foes.length;j++){ var e=G.foes[j]; if(e.row!==p.row||!targetable(e)) continue; if(Math.abs(e.x-p.x)<(e.boss?46:20)){ hit=e; break; } }
    if(hit){ hurt(hit,p.dmg); if(p.slow) hit.slow=Math.max(hit.slow,p.slow); G.projs.splice(i,1); puff(p.x,p.y,p.fire?'#ff9a2a':'#fff',4,60); sfx('hit'); continue; }
    if(p.x>W+30) G.projs.splice(i,1); }
}
function updDrops(dt){ for(var i=G.drops.length-1;i>=0;i--){ var d=G.drops[i]; d.t+=dt;
  if(d.pop){ d.vy+=600*dt; d.y+=d.vy*dt; if(d.y>=d.ty&&d.vy>0){ d.y=d.ty; d.pop=false; d.vy=0; } }
  else if(d.y<d.ty) d.y=Math.min(d.ty,d.y+70*dt);
  else { d.life-=dt; if(S.auto && d.t>1.2){ collect(d); continue; } if(d.life<=0) G.drops.splice(i,1); } } }
function updFx(dt){ for(var i=G.fx.length-1;i>=0;i--){ var f=G.fx[i]; f.t+=dt; if(f.k==='p'){ f.x+=f.vx*dt; f.y+=f.vy*dt; f.vy+=200*dt; } if(f.t>=f.life) G.fx.splice(i,1); } }

function step(dt){
  G.time+=dt; if(G.shake>0) G.shake-=dt;
  if(G.bannerT>0){ G.bannerT-=dt; if(G.bannerT<=0) $('banner').className=''; }
  for(var k in G.cds) if(G.cds[k]>0) G.cds[k]=Math.max(0,G.cds[k]-dt);
  if(G.sel&&G.sel!=='shovel'&&(G.energy<D.def[G.sel].cost)) G.sel=null;
  G.skyT-=dt; if(G.skyT<=0){ G.skyT=rnd(8,10.5); G.drops.push({x:rnd(LEFT+40,W-80),y:-20,ty:rnd(60,H-50),v:25,life:9.5,t:0}); }
  if(!G.over){ var total=G.endless?Infinity:G.waves.length;
    if(G.wave<total){ G.waveT-=dt; if(G.foes.length===0&&!G.pending.length&&G.wave>0&&G.waveT>7) G.waveT=7;
      var nextIsFlag = G.endless ? ((G.wave+1)%8===0) : G.waves[G.wave].flag;
      if(nextIsFlag && G.waveT<=4 && !G.warned){ G.warned=true; banner(G.wave===total-1?'FINAL WAVE!':'A HUGE WAVE IS APPROACHING!',3); sfx('wave'); }
      if(G.waveT<=0){ var wv = G.endless ? endlessWave(G.w,G.wave) : G.waves[G.wave]; spawnWave(wv);
        G.wave++; G.warned=false; G.waveT = Math.max(13, 25 - G.wave*0.6) + (wv.flag?6:0); }
    } else if(G.foes.length===0 && !G.pending.length){ G.endT+=dt; if(G.endT>1.4) win(); }
  }
  for(var i=G.pending.length-1;i>=0;i--){ var p=G.pending[i]; if(G.time>=p.at){ spawnFoe(p.type,p.row); G.pending.splice(i,1); } }
  G.units.slice().forEach(function(u){ if(!u.dead) updUnit(u,dt); });
  G.foes.slice().forEach(function(e){ if(!e.dead) updFoe(e,dt); });
  updSweep(dt); updProj(dt); updDrops(dt); updFx(dt);
}
function waveFrac(){ if(G.endless) return ((G.wave%8)/8); return G.wave/G.waves.length; }

/* ---------------- end states ---------------- */
function win(){ if(G.over) return; G.over=true; G.won=true; sfx('win'); var w=G.w, prev=S.prog[w.id]||0;
  if(G.st<6 && G.st+1>prev) S.prog[w.id]=G.st+1; save();
  var unl = (G.st<5 && G.st>=prev) ? w.unlock[G.st] : [];
  var h='<div class="vic"><h2>'+(w.id==='stink'?'6:00 AM \u2014 STAGE CLEAR!':'STAGE CLEAR!')+'</h2>'+
    w.win.map(function(x){ return '<div class="say"><img src="art/'+x.img+'.jpg" alt=""><div><b>'+x.who+'</b><q>'+x.say+'</q></div></div>'; }).join('');
  if(unl.length) h+='<div class="unl"><b>NEW DEFENDER'+(unl.length>1?'S':'')+' UNLOCKED!</b>'+unl.map(function(id){ var d=D.def[id]; return '<div class="say"><img src="art/'+d.img+'.jpg" alt=""><div><b>'+d.name+'</b><i>'+d.role+'</i><q>'+d.line+'</q></div></div>'; }).join('')+'</div>';
  else if(G.st<4 && G.st>=prev) h+='<p class="hint">New raiders ahead. Check the Almanac.</p>';
  if(G.st===4) h+='<p class="hint">The BOSS stage is open!</p>'; if(G.st===5) h+='<p class="hint">ENDLESS mode unlocked for '+w.show+'!</p>';
  h+='</div>'; var wi=G.wi, st=G.st;
  dlg(h, [['NEXT &#9654;', st<6?function(){ startStage(wi,st+1); }:null,'go'],['MAP',function(){ toMap(); }],['SHARE ON X',function(){ share(); },'x']]); }
function lose(){ if(G.over) return; G.over=true; sfx('lose'); var w=G.w, l=w.lose, h, wi=G.wi, st=G.st;
  if(G.endless){ var b=S.best[w.id]||0; var held=Math.max(0,G.wave-1); if(held>b){ S.best[w.id]=held; save(); }
    h='<div class="vic"><h2>ENDLESS OVER</h2><p class="big">You held '+held+' waves'+(held>b?' \u2014 NEW BEST!':' (best '+b+')')+'</p>'; G.held=held; }
  else h='<div class="vic lost"><h2>THEY GOT THROUGH!</h2>';
  h+='<div class="say"><img src="art/'+l.img+'.jpg" alt=""><div><b>'+l.who+'</b><q>'+l.say+'</q></div></div></div>';
  dlg(h,[['TRY AGAIN',function(){ startStage(wi,st); },'go'],['MAP',function(){ toMap(); }],['SHARE ON X',function(){ share(); },'x']]); }
function dlg(html, btns){ $('dlgB').innerHTML=html; var bb=$('dlgBtns'); bb.innerHTML='';
  btns.forEach(function(b){ if(!b[1]) return; var el=document.createElement('button'); el.className='hb big '+(b[2]||''); el.innerHTML=b[0]; bindTap(el,function(){ $('dlg').className=''; b[1](); }); bb.appendChild(el); });
  $('dlg').className='show'; }
function toMap(){ $('dlg').className=''; renderMap(); show('scrMap'); }
function share(){ var url='https://petecastic.github.io/xcomix-memory/lanes/';
  var t = G&&G.endless&&G.over ? 'I held '+(G.held||0)+' waves of Endless in Midnight Lanes ('+G.w.show+')! ' : (G&&G.won ? 'Cleared '+G.w.stageNames[G.st]+' in Midnight Lanes: Three Worlds ('+G.w.show+')! ' : 'Midnight Lanes: Three Worlds, a free 5-lane defense game with Stink Patrol, the Bay Dust Boys and Onigiri Squad! ');
  var u='https://x.com/intent/post?text='+encodeURIComponent(t+'Free, no ads: '+url+' See you in another timeline.');
  var o=null; try{ o=window.open(u,'_blank'); }catch(e){} if(!o) location.href=u; }

/* ---------------- loop ---------------- */
function loop(now){ if(!running) return; var dt=Math.min(0.05,Math.max(0,(now-lastT)/1000)); lastT=now;
  if(G && !G.paused && !G.over){ for(var i=0;i<G.speed;i++) step(dt); } else if(G&&G.over){ updFx(dt); }
  render(); updPackets(); updHud(); requestAnimationFrame(loop); }
function updHud(){ var f=waveFrac(); var wf=$('wfill'); if(wf) wf.style.width=(f*100)+'%';
  var w=G.w, m0={stink:0,oldbay:18*60,onigiri:14*60+30}[w.id], m1={stink:360,oldbay:20*60+19,onigiri:21*60}[w.id];
  var ct; if(G.endless) ct='WAVE '+G.wave; else { var mins=Math.floor(m0+(m1-m0)*f), hh=Math.floor(mins/60)%24, mm=mins%60, ap=hh>=12?'PM':'AM', h12=hh%12||12; ct=h12+':'+(mm<10?'0':'')+mm+' '+ap; }
  if($('clock').textContent!==ct) $('clock').textContent=ct; }

/* ---------------- background ---------------- */
function buildBg(){ bgCanvas=document.createElement('canvas'); bgCanvas.width=W; bgCanvas.height=H; var g=bgCanvas.getContext('2d'), w=G.w, r, c, i, k;
  if(w.id==='stink'){
    g.fillStyle='#0d1230'; g.fillRect(0,0,W,H);
    for(r=0;r<ROWS;r++) for(c=0;c<COLS;c++){ g.fillStyle=((r+c)%2)?'#24306a':'#1d285a'; g.fillRect(LEFT+c*CW,r*CH,CW,CH); g.strokeStyle='rgba(150,180,255,0.10)'; g.lineWidth=1; g.strokeRect(LEFT+c*CW+0.5,r*CH+0.5,CW-1,CH-1);
      g.fillStyle='rgba(255,255,255,0.05)'; g.beginPath(); g.ellipse(LEFT+c*CW+30,r*CH+24,18,6,-0.4,0,6.28); g.fill(); }
    g.fillStyle='#141a40'; g.fillRect(0,0,LEFT,H); g.fillStyle='#2b356e'; for(r=0;r<ROWS;r++){ g.fillRect(6,r*CH+8,LEFT-14,CH-16); }
    g.fillStyle='rgba(124,203,58,0.06)'; g.fillRect(LEFT,0,W-LEFT,H);
    g.fillStyle='rgba(0,0,0,0.25)'; g.fillRect(W-30,0,30,H);
    g.strokeStyle='rgba(230,220,190,0.07)'; g.lineWidth=6; g.beginPath(); for(i=0;i<14;i++){ g.moveTo(560+i*22,120); g.lineTo(560+i*22,170+Math.sin(i/13*3.14)*30); } g.stroke();
    g.fillStyle='rgba(255,255,200,0.05)'; g.beginPath(); g.moveTo(LEFT,0); g.lineTo(LEFT+260,0); g.lineTo(LEFT+120,H); g.lineTo(LEFT-40,H); g.fill();
  } else if(w.id==='oldbay'){
    g.fillStyle='#173a5c'; g.fillRect(0,0,W,H);
    for(r=0;r<ROWS;r++){ for(k=0;k<4;k++){ g.fillStyle=(k%2)?'#7d5636':'#8c6340'; g.fillRect(LEFT,r*CH+6+k*21,W-LEFT,20); g.fillStyle='rgba(0,0,0,0.18)'; g.fillRect(LEFT,r*CH+25+k*21,W-LEFT,2); }
      for(c=0;c<=COLS;c++){ g.fillStyle='#4a2f1a'; g.fillRect(LEFT+c*CW-4,r*CH+6,8,84); g.fillStyle='#2a1a0e'; g.beginPath(); g.arc(LEFT+c*CW,r*CH+20,2.5,0,6.28); g.arc(LEFT+c*CW,r*CH+76,2.5,0,6.28); g.fill(); }
      g.fillStyle='#1d4a74'; g.fillRect(LEFT,r*CH+90,W-LEFT,6); g.fillStyle='rgba(255,255,255,0.2)'; for(i=0;i<8;i++) g.fillRect(LEFT+rnd(0,W-LEFT),r*CH+91,14,1.5); }
    g.fillStyle='#244b78'; g.fillRect(0,0,LEFT,H); g.fillStyle='rgba(255,255,255,0.15)'; for(i=0;i<24;i++){ g.fillRect(rnd(0,LEFT),rnd(0,H),10,2); }
    g.fillStyle='rgba(255,140,60,0.10)'; g.fillRect(LEFT,0,W-LEFT,H);
  } else {
    g.fillStyle='#ffeef3'; g.fillRect(0,0,W,H);
    for(r=0;r<ROWS;r++) for(c=0;c<COLS;c++){ g.fillStyle=((r+c)%2)?'#ffe0ea':'#fff6f9'; g.fillRect(LEFT+c*CW,r*CH,CW,CH); }
    g.strokeStyle='rgba(231,169,189,0.7)'; g.lineWidth=1; for(r=0;r<=ROWS;r++){ g.beginPath(); g.moveTo(LEFT,r*CH); g.lineTo(W,r*CH); g.stroke(); }
    g.fillStyle='#ffb3c9'; g.fillRect(0,0,LEFT,H); for(r=0;r<ROWS;r++){ g.fillStyle='#fff'; g.fillRect(8,r*CH+10,LEFT-16,CH-20); g.fillStyle='#ffd1de'; g.fillRect(12,r*CH+16,LEFT-24,8); g.fillRect(12,r*CH+40,LEFT-24,8); g.fillRect(12,r*CH+64,LEFT-24,8); }
    for(i=0;i<46;i++){ g.fillStyle='rgba(255,140,185,'+rnd(0.15,0.4)+')'; g.beginPath(); g.ellipse(rnd(LEFT,W),rnd(0,H),4,2.5,rnd(0,3),0,6.28); g.fill(); }
  }
}

/* ---------------- sprite helpers ---------------- */
var OL='#14101e';
function E(g,x,y,rx,ry,fill,st,lw){ g.beginPath(); g.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,6.283); if(fill){ g.fillStyle=fill; g.fill(); } if(st!==false){ g.lineWidth=lw||3; g.strokeStyle=OL; g.stroke(); } }
function RR(g,x,y,w,h,r,fill,st){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); if(fill){ g.fillStyle=fill; g.fill(); } if(st!==false){ g.lineWidth=3; g.strokeStyle=OL; g.stroke(); } }
function L(g,pts,col,lw){ g.beginPath(); g.moveTo(pts[0],pts[1]); for(var i=2;i<pts.length;i+=2) g.lineTo(pts[i],pts[i+1]); g.strokeStyle=col||OL; g.lineWidth=lw||3; g.lineCap='round'; g.lineJoin='round'; g.stroke(); }
function eye(g,x,y,r,px,py,iris){ E(g,x,y,r,r*1.1,'#fff',true,2); E(g,x+(px||0)*r*0.35,y+(py||0)*r*0.35,r*0.5,r*0.55,iris||'#111',false); E(g,x+(px||0)*r*0.35-r*0.18,y+(py||0)*r*0.35-r*0.22,r*0.16,r*0.16,'#fff',false); }
function shadow(g,x,y,w){ g.fillStyle='rgba(0,0,0,0.25)'; g.beginPath(); g.ellipse(x,y,w,w*0.28,0,0,6.283); g.fill(); }
function heart(g,x,y,s,c){ g.beginPath(); g.moveTo(x,y+s*0.8); g.bezierCurveTo(x-s*1.4,y-s*0.2,x-s*0.6,y-s*1.2,x,y-s*0.4); g.bezierCurveTo(x+s*0.6,y-s*1.2,x+s*1.4,y-s*0.2,x,y+s*0.8); g.fillStyle=c; g.fill(); }
function ant(g,o,t){ var s=o.s||1; g.save(); g.scale(s,s); var b=Math.sin(t*4)*1.5;
  L(g,[-8,22,-14,34],OL,3); L(g,[6,22,12,34],OL,3);
  E(g,10,10+b,14,12,'#2a2230'); E(g,-4,0+b,11,13,'#2a2230');
  if(o.crumbs){ g.fillStyle='#c9a46a'; [[8,6],[13,13],[2,10],[-6,-2],[-2,5]].forEach(function(p){ g.beginPath(); g.arc(p[0],p[1]+b,2.2,0,6.28); g.fill(); }); }
  if(o.band){ g.fillStyle='#a8253a'; g.beginPath(); g.moveTo(-14,-6+b); g.lineTo(6,-4+b); g.lineTo(-2,6+b); g.closePath(); g.fill(); }
  if(o.scarf){ E(g,-4,-8+b,11,4,'#7b3fa0',true,2); }
  E(g,-6,-20+b,15,14,'#2a2230');
  g.save(); g.beginPath(); g.ellipse(-6,-26+b,15,11,0,Math.PI,0); g.closePath(); g.clip(); for(var i=0;i<5;i++){ g.fillStyle=i%2?'#151515':'#f2f2f2'; g.fillRect(-22,-38+b+i*4.5,32,4.5); } g.restore();
  g.beginPath(); g.ellipse(-6,-26+b,15,11,0,Math.PI,0); g.lineWidth=2.5; g.strokeStyle=OL; g.stroke();
  L(g,[-12,-36+b,-18,-46+b],OL,2); L(g,[0,-36+b,6,-46+b],OL,2);
  if(o.glasses){ RR(g,-19,-22+b,12,7,3,'#111',false); RR(g,-5,-22+b,12,7,3,'#111',false); L(g,[-7,-19+b,-5,-19+b],'#111',2); }
  else { var jx=o.jit?Math.sin(t*40)*0.8:0; eye(g,-12+jx,-17+b,5,-0.6,0); eye(g,0+jx,-17+b,5,-0.6,0); }
  if(o.cigar){ L(g,[-14,-10+b,-24,-8+b],'#8a5a2a',3); E(g,-25,-8+b,1.5,1.5,'#ff6a2a',false); }
  L(g,[-8,2+b,-22,4+b],OL,3); if(o.item) o.item(g,-24,4+b);
  g.restore(); }
function dino(g,t,o){ var b=Math.sin(t*2)*1.5, i;
  if(o.tri){ L(g,[-14,30,-14,10],'#e8d9b5',6); L(g,[14,30,14,10],'#e8d9b5',6); E(g,0,6+b,24,14,'#e8d9b5'); for(i=-2;i<=2;i++) L(g,[i*7,-6+b,i*7,18+b],'#b8a27a',2);
    L(g,[-28,-22+b,-40,-28+b],'#e8d9b5',5); L(g,[-20,-30+b,-30,-44+b],'#e8d9b5',5); L(g,[-26,-12+b,-40,-12+b],'#e8d9b5',4);
    E(g,4,-22+b,20,18,'#e8d9b5'); E(g,-10,-16+b,20,16,'#e8d9b5');
    for(i=0;i<9;i++){ E(g,-30+i*7,4+b+Math.sin(i+t*3)*3,6,5,'#ff3fa4',false); }
    RR(g,-24,-22+b,12,7,3,'#ff7ac3',false); RR(g,-10,-22+b,12,7,3,'#ff7ac3',false); E(g,-18,-19+b,3,2.5,'#7cff7c',false); E(g,-4,-19+b,3,2.5,'#7cff7c',false);
  } else {
    L(g,[-4,32,-6,10],'#e8d9b5',6); L(g,[12,32,10,10],'#e8d9b5',6); L(g,[18,0,36,14+b],'#e8d9b5',6); E(g,4,0+b,18,14,'#e8d9b5'); for(i=-1;i<=2;i++) L(g,[i*7,-10+b,i*7+2,12+b],'#b8a27a',2);
    L(g,[-10,2+b,-16,8+b],'#e8d9b5',3);
    E(g,-6,-12+b,14,4,'#7b3fa0',true,2);
    var open=o.open||0; g.save(); g.translate(-12,-26+b); E(g,0,0,22,14,'#e8d9b5'); g.save(); g.rotate(open*0.6); RR(g,-26,6,26,8,3,'#e8d9b5'); g.restore();
    E(g,6,-4,5,5,'#f2a900',true,2); E(g,6,-4,2,2,'#111',false); for(var k=0;k<5;k++){ g.fillStyle='#fff'; g.beginPath(); g.moveTo(-20+k*4,6); g.lineTo(-18+k*4,11); g.lineTo(-16+k*4,6); g.fill(); }
    if(o.cheek){ E(g,-6,4,10,8,'#e8d9b5'); } g.restore(); }
}
/* LIVE BLUE CRABS ONLY — never cooked red */
function crab(g,t,o){ var b=Math.sin(t*3)*1.2, sh=o.shell||'#2d6fb5', s=o.s||1, i; g.save(); g.scale(s,s);
  for(i=0;i<3;i++){ L(g,[-16,16+b,-28-i*3,26+i*3],OL,3); L(g,[16,16+b,28+i*3,26+i*3],OL,3); }
  var snap=o.snap||0;
  L(g,[-20,6+b,-28,2+b],OL,4); L(g,[20,6+b,28,2+b],OL,4);
  E(g,-32,0+b,11,8,o.claw||'#4a90d9'); E(g,32,0+b,11,8,o.claw||'#4a90d9'); if(o.tips){ E(g,-40,-2+b,4,4,o.tips,false); E(g,40,-2+b,4,4,o.tips,false); }
  L(g,[-38,-4+b-snap*5,-44,-9+b-snap*5],OL,3); L(g,[38,-4+b-snap*5,44,-9+b-snap*5],OL,3);
  g.beginPath(); g.moveTo(-30,8+b); g.quadraticCurveTo(-26,-8+b,0,-8+b); g.quadraticCurveTo(26,-8+b,30,8+b); g.quadraticCurveTo(20,26+b,0,26+b); g.quadraticCurveTo(-20,26+b,-30,8+b); g.closePath();
  g.fillStyle=sh; g.fill(); g.lineWidth=3; g.strokeStyle=OL; g.stroke(); L(g,[-30,8+b,-38,4+b],OL,3); L(g,[30,8+b,38,4+b],OL,3);
  g.fillStyle='rgba(255,255,255,0.25)'; g.beginPath(); g.ellipse(-6,0+b,14,4,-0.2,0,6.28); g.fill();
  E(g,0,22+b,14,4,'#ede9d0',false);
  if(o.spice){ g.fillStyle='#e8833a'; for(var k=0;k<14;k++){ g.beginPath(); g.arc(-22+((k*37)%44),-2+b+((k*13)%20),2.4,0,6.28); g.fill(); } }
  L(g,[-8,-6+b,-10,-18+b],OL,3); L(g,[8,-6+b,10,-18+b],OL,3); eye(g,-10,-20+b,6,-0.4,0.2,o.iris); eye(g,10,-20+b,6,-0.4,0.2,o.iris);
  if(o.lash){ L(g,[-16,-26+b,-19,-30+b],OL,2); L(g,[-12,-28+b,-13,-32+b],OL,2); L(g,[16,-26+b,19,-30+b],OL,2); }
  if(o.brow){ L(g,[-16,-28+b,-4,-24+b],OL,3.5); L(g,[16,-28+b,4,-24+b],OL,3.5); }
  if(o.mouth) L(g,[-6,12+b,0,10+b,6,12+b],OL,2.5);
  if(o.hoops){ g.strokeStyle='#e5b80b'; g.lineWidth=2; g.beginPath(); g.arc(-18,-12+b,3,0,6.28); g.stroke(); g.beginPath(); g.arc(18,-12+b,3,0,6.28); g.stroke(); }
  g.restore(); }

function drawDef(g,u,x,y,t){ var id=u.id, f=u.fire>0?1:0, i; g.save(); g.translate(x,y);
  if(u.hit>0) g.globalAlpha=0.85;
  if(id!=='doris'&&id!=='softshell') shadow(g,0,34,28);
  switch(id){
  case 'crumbs': ant(g,{crumbs:1,item:function(g,x,y){ E(g,x,y-(f?6:0),7,5,'#ffb52a',true,2); }},t); break;
  case 'lefty': g.translate(f?3:0,0); ant(g,{glasses:1,item:function(g,x,y){ L(g,[x,y,x-6,y-10],'#8a5a2a',3); L(g,[x,y,x-6,y+8],'#8a5a2a',3); }},t); break;
  case 'twitch': g.translate(f?3:0,0); ant(g,{scarf:1,jit:1,item:function(g,x,y){ RR(g,x-6,y-4,10,8,2,'#e5a823',true); }},t); break;
  case 'bigsal': ant(g,{s:1.2,band:1,item:function(g,x,y){ RR(g,x-10,y-8-(f?10:0),18,9,2,'#e5a823',true); }},t); break;
  case 'trixie': dino(g,t,{tri:1}); if(u.hp<u.maxhp*0.6){ L(g,[-14,-22,-6,-12,-12,-4],'#6a5a3a',2); } if(u.hp<u.maxhp*0.3){ L(g,[4,0,10,10,6,18],'#6a5a3a',2); } break;
  case 'rexanne': dino(g,t,{open:f?1:(u.chew>0?0.1:0.2+Math.sin(t*2)*0.1),cheek:u.chew>0}); if(u.chew>0){ g.fillStyle='#fff'; g.font='bold 12px Trebuchet MS, sans-serif'; g.fillText('munch',-30,-48+Math.sin(t*6)*2); } break;
  case 'stanley': var sh=u.fuse!==undefined?Math.sin(t*60)*3:0; g.translate(sh,0);
    g.save(); g.rotate(Math.sin(t*2)*0.05); E(g,18,-2,14,28,'#1a1a1a'); L(g,[18,-28,22,22],'#f5f5f5',5); g.restore();
    E(g,0,12,18,20,'#1f2d4f'); E(g,0,-14,17,15,'#1a1a1a'); L(g,[0,-28,0,-16],'#f5f5f5',4);
    RR(g,-15,-34,30,9,3,'#1f2d4f'); E(g,0,-31,4,3,'#d4a62a',false); eye(g,-6,-14,6,0,0,'#3e2b1e'); eye(g,7,-14,6,0,0,'#3e2b1e'); E(g,0,-6,3,2,'#f29bb0',false);
    E(g,-4,10,3,3,'#d4a62a',false); L(g,[-16,8,-26,0],OL,3); RR(g,-32,-6,9,8,2,'#d0d0d0',true);
    if(u.fuse!==undefined){ for(i=0;i<4;i++) E(g,rnd(-30,30),rnd(-30,20),rnd(8,16),rnd(8,14),'rgba(124,203,58,0.5)',false); } break;
  case 'gary': var fl=Math.sin(t*14)*6; E(g,-20,-6,14,10+fl*0.3,'#a6879e'); E(g,20,-6,14,10+fl*0.3,'#a6879e'); E(g,0,6,20,24,'#8b8693');
    for(i=0;i<6;i++){ E(g,-12+i*5,-14+(i%2)*3,3,3,'#a09aa8',false); } E(g,0,-6,18,5,'#7b3fa0',true,2);
    L(g,[-6,-28,-12,-42],OL,2); L(g,[6,-28,12,-42],OL,2); E(g,-12,-43,3,3,'#a09aa8',true,1.5); E(g,12,-43,3,3,'#a09aa8',true,1.5);
    heart(g,-7,-16,6,'#ff4f7a'); heart(g,7,-16,6,'#ff4f7a'); break;
  case 'doris': g.fillStyle='rgba(240,230,170,0.75)'; g.beginPath(); g.ellipse(4,24,40,13,0,0,6.28); g.fill(); g.strokeStyle='rgba(180,160,90,0.8)'; g.lineWidth=2; g.stroke();
    for(i=0;i<(u.uses||0);i++) E(g,-16+i*14,24,3,2,'#fff',false);
    g.translate(-22,-4); g.scale(0.62,0.62); E(g,0,10,16,22,'#6b4a2a'); E(g,0,6,18,14,'#8c5c9e'); E(g,0,-16,13,12,'#7a5434'); L(g,[-4,-26,-14,-46],OL,2); L(g,[4,-26,14,-46],OL,2);
    E(g,-5,-16,4,3,'#fff',true,1.5); E(g,5,-16,4,3,'#fff',true,1.5); L(g,[-9,-19,-1,-18],OL,2); L(g,[9,-19,1,-18],OL,2); L(g,[20,0,20,36],'#c0c0c0',3); L(g,[30,0,30,36],'#c0c0c0',3); L(g,[20,0,30,0],'#c0c0c0',3); E(g,20,38,4,4,'#c8e64a',false); E(g,30,38,4,4,'#c8e64a',false); break;
  case 'lilsook': crab(g,t,{s:0.85,shell:'#3b5fc4',claw:'#6a5acd',tips:'#d7263d',lash:1,hoops:1,mouth:1}); break;
  case 'bigjimmy': g.translate(f?-3:0,0); crab(g,t,{s:1.12,shell:'#2d6fb5',claw:'#4a90d9',brow:1,snap:f}); g.scale(1.12,1.12);
    g.beginPath(); g.ellipse(0,-30,15,9,0,Math.PI,0); g.closePath(); g.fillStyle='#f26a21'; g.fill(); g.lineWidth=2.5; g.strokeStyle=OL; g.stroke();
    RR(g,-20,-31,16,5,2,'#1a1a1a'); g.fillStyle='#1a1a1a'; g.font='bold 11px Arial, sans-serif'; g.fillText('B',-4,-30); break;
  case 'softshell': if(u.arm>0){ E(g,0,26,24,8,'#7a5a3a',false); L(g,[-6,22,-8,12],OL,2); L(g,[6,22,8,12],OL,2); eye(g,-8,10,5,0,0.5); eye(g,8,10,5,0,0.5); }
    else { crab(g,t,{s:0.8,shell:'#9ab4d4',claw:'#b6c8e0',mouth:1}); E(g,0,-2,24,9,'#f2f2f2',true,2); if(Math.sin(t*8)>0){ g.fillStyle='#ffcf3a'; g.font='bold 18px Impact, sans-serif'; g.fillText('!',-3,-34); } } break;
  case 'oldbay': crab(g,t,{shell:'#2e5fa8',claw:'#4a80c9',spice:1,iris:'#f2c230'}); RR(g,-12,-46,24,18,3,'#2e5fa8'); RR(g,-12,-41,24,7,0,'#f2c230',false); g.fillStyle='#a8253a'; g.font='bold 6px Arial, sans-serif'; g.fillText('SPICE',-10,-35.5);
    if(f){ for(i=0;i<5;i++) E(g,rnd(-20,20),rnd(-56,-34),5,5,'rgba(232,131,58,0.6)',false); } break;
  case 'hon': E(g,0,-26,13,13,'#f0c8a8'); E(g,0,-50,15,18,'#151515'); E(g,10,-62,6,4,'#ff5aa5'); RR(g,-11,-30,9,6,3,'#ff6aa8',false); RR(g,2,-30,9,6,3,'#ff6aa8',false);
    E(g,-6,-27,2,2,'#111',false); E(g,6,-27,2,2,'#111',false); E(g,0,-18,4,2,'#d43a6a',false); E(g,-14,-20,2.5,2.5,'#e5b80b',false); E(g,14,-20,2.5,2.5,'#e5b80b',false);
    RR(g,-38,-6,76,40,4,'#c47a4a'); RR(g,-40,-10,80,8,3,'#f26aa8'); g.fillStyle='#fff'; g.font='bold 12px Trebuchet MS, sans-serif'; g.fillText("HON'S",-18,18);
    E(g,26,-14,9,4,'#e8b060',true,2); if(u.hp<u.maxhp*0.5) L(g,[-20,4,-10,16,-16,28],'#5a3a1a',2); break;
  case 'wheel': RR(g,-30,-34,50,62,6,'#6c7a88'); g.save(); g.translate(24,6); g.rotate(t*(f?6:1.6)); for(i=0;i<6;i++){ g.rotate(1.047); RR(g,-3,-30,6,24,2,'#3a4a5a',true); } E(g,0,0,9,9,'#556',true); g.restore();
    RR(g,-26,6,42,18,3,'#2a2f36'); g.fillStyle='#4fae6a'; g.fillRect(-22,10,8,10); g.fillStyle='#8fd3ff'; g.fillRect(-10,12,6,8); g.fillStyle='#e8c84a'; g.fillRect(0,10,7,10);
    eye(g,-16,-16,10,Math.sin(t*1.3),Math.cos(t*1.7)); eye(g,6,-16,10,Math.cos(t*1.1),Math.sin(t*1.9)); break;
  case 'tamago': var sq=f?1.08:1; E(g,0,6,26*sq,30/sq,'#fffdf5'); E(g,0,2,14,14,'#ffc21a',true,2); E(g,-5,-1,2,2.5,'#111',false); E(g,5,-1,2,2.5,'#111',false); L(g,[-4,6,0,9,4,6],OL,2);
    E(g,-11,6,3.5,2,'#ff9aa2',false); E(g,11,6,3.5,2,'#ff9aa2',false); L(g,[-24,10,-32,4+(f?-8:0)],OL,3); L(g,[24,10,32,4+(f?-8:0)],OL,3); break;
  case 'pikaru': g.translate(f?3:0,0); E(g,18,16,18,8,'#9b683a'); L(g,[6,16,30,16],'#4a3020',3); E(g,0,10,18,22,'#9b683a'); E(g,0,12,10,12,'#e8c8a0',false); E(g,0,-16,18,16,'#9b683a'); E(g,0,-14,13,7,'#4a3020',false);
    eye(g,-6,-15,5,0.4,0); eye(g,6,-15,5,0.4,0); E(g,0,-6,3,2,'#111',false); E(g,-14,-28,5,6,'#4a3020'); E(g,14,-28,5,6,'#4a3020'); E(g,4,-34,10,5,'#6bbf59'); L(g,[4,-38,4,-30],'#3a7a2a',1.5);
    if(Math.sin(t*9)>0.3||f){ L(g,[24,-20,30,-26,26,-28,34,-36],'#ffe45c',2.5); L(g,[-24,-10,-30,-16,-26,-18,-34,-24],'#ffe45c',2.5); } break;
  case 'mochi': var sq2=1+Math.sin(t*3)*0.04+(f?0.14:0); E(g,0,4,30*sq2,40/sq2,'#f7a8c4'); g.fillStyle='rgba(255,255,255,0.45)'; g.beginPath(); g.ellipse(-10,-14,8,5,-0.5,0,6.28); g.fill();
    E(g,-8,-2,3,3.5,'#111',false); E(g,8,-2,3,3.5,'#111',false); L(g,[-4,6,0,9,4,6],OL,2); E(g,-15,6,4,2.5,'#ff7fa8',false); E(g,15,6,4,2.5,'#ff7fa8',false); if(u.hp<u.maxhp*0.5){ L(g,[-12,-8,-5,-6],OL,2); L(g,[12,-8,5,-6],OL,2); } break;
  case 'umebo': L(g,[-22,10,-34,-14-(f?10:0)],'#a8742a',5);
    g.beginPath(); g.moveTo(0,-34); g.quadraticCurveTo(30,8,26,26); g.lineTo(-26,26); g.quadraticCurveTo(-30,8,0,-34); g.closePath(); g.fillStyle='#fafaf5'; g.fill(); g.lineWidth=3; g.strokeStyle=OL; g.stroke();
    RR(g,-16,8,32,20,3,'#1e2822'); RR(g,-20,-16,40,8,3,'#d7263d'); L(g,[20,-12,32,-4+Math.sin(t*5)*3],'#d7263d',4); g.fillStyle='#ffcf3a'; g.font='bold 10px Arial, sans-serif'; g.fillText('\u2605',-4,-8);
    E(g,-6,-2,2,2.5,'#111',false); E(g,6,-2,2,2.5,'#111',false); L(g,[-3,3,3,3],OL,2); break;
  case 'wasabi': for(i=0;i<3;i++){ var st=(t*0.8+i*0.33)%1; E(g,-10+i*10,-36-st*16,4+st*4,4+st*4,'rgba(255,255,255,'+(0.6-st*0.6)+')',false); }
    g.beginPath(); g.moveTo(-28,28); g.quadraticCurveTo(-30,-6,-14,-14); g.quadraticCurveTo(-8,-34,4,-30); g.quadraticCurveTo(16,-30,16,-16); g.quadraticCurveTo(32,-6,28,28); g.closePath(); g.fillStyle=f?'#b4ef6a':'#7daa3c'; g.fill(); g.lineWidth=3; g.strokeStyle=OL; g.stroke();
    L(g,[-12,-8,-4,-5],OL,2.5); L(g,[12,-8,4,-5],OL,2.5); E(g,-7,-1,2,2,'#111',false); E(g,7,-1,2,2,'#111',false); L(g,[-4,6,4,6],OL,2); L(g,[-18,12,16,14],OL,3); L(g,[18,12,-14,16],OL,3);
    if(f){ E(g,30,-10,10,8,'rgba(255,140,40,0.7)',false); } break;
  case 'dango': L(g,[0,40,0,-44],'#c8a46a',4); [['#9bcb68',18],['#f5f2ea',-2],['#f7a8c4',-22]].forEach(function(c,k){ var bb=Math.sin(t*4+k)*2; E(g,0,c[1]+bb,15,12,c[0]); E(g,-5,c[1]-1+bb,1.8,2,'#111',false); E(g,5,c[1]-1+bb,1.8,2,'#111',false); L(g,[-3,c[1]+4+bb,0,c[1]+6+bb,3,c[1]+4+bb],OL,1.6); }); break;
  case 'neko': var sh2=u.fuse!==undefined?Math.sin(t*30)*0.3:0; L(g,[-18,14,-30,-14],'#a8742a',3); E(g,0,12,20,22,'#fff'); E(g,0,-14,18,16,'#fff'); E(g,-13,-26,5,6,'#fff',true,2); E(g,13,-26,5,6,'#fff',true,2); RR(g,-14,-36,28,10,4,'#4caf50');
    L(g,[-8,-14,-3,-14],OL,2); L(g,[3,-14,8,-14],OL,2); E(g,0,-8,2,1.5,'#f29bb0',false); RR(g,-14,-2,28,6,3,'#d7263d'); E(g,0,4,5,5,'#f2c230',true,2);
    g.save(); g.translate(20,-6); g.rotate(-0.4+Math.sin(t*3)*0.3+sh2); E(g,0,-8,6,10,'#fff'); g.restore(); break;
  }
  g.restore();
  if(u.d && u.d.kind!=='trap'&&u.d.kind!=='bomb_row'&&u.d.kind!=='bell'&&u.hp<u.maxhp&&u.maxhp<9999){ var w=40,fr=Math.max(0,u.hp/u.maxhp); g.fillStyle='rgba(0,0,0,0.5)'; g.fillRect(x-w/2,y+38,w,4); g.fillStyle=fr>0.5?'#6f6':fr>0.25?'#fd4':'#f55'; g.fillRect(x-w/2,y+38,w*fr,4); }
}

function human(g,t,o){ var w=Math.sin(t*5)*4; L(g,[-6,18,-6+w,34],'#2a2a3a',5); L(g,[6,18,6-w,34],'#2a2a3a',5);
  RR(g,-14,-12,28,32,8,o.coat); E(g,0,-22,12,12,'#f0c8a0'); g.beginPath(); g.ellipse(0,-28,13,8,0,Math.PI,0); g.closePath(); g.fillStyle=o.hat; g.fill(); g.lineWidth=2.5; g.strokeStyle=OL; g.stroke();
  E(g,-4,-21,1.8,2,'#111',false); E(g,4,-21,1.8,2,'#111',false); L(g,[-4,-15,4,-16],OL,2); }
function drawFoe(g,e,x,y,s){ var t=e.anim||0, f=e.f||D.foe[e.type], i; g.save(); g.translate(x,y); if(s) g.scale(s,s);
  if(e.fl>0) g.globalAlpha=0.7;
  var bob=(e.eating?Math.sin(t*14)*2:Math.sin(t*6)*1.5);
  if(!f.fly && !e.burrow) shadow(g,0,34,e.boss?60:24);
  switch(e.type){
  case 'dustmite': L(g,[-14,22,-18,34],OL,3); L(g,[0,24,0,34],OL,3); L(g,[14,22,18,34],OL,3); E(g,0,10+bob,22,18,'#9aa0a8'); E(g,-8,6+bob,7,7,'#d93025',true,2); E(g,-8,6+bob,3,3,'#ffd',false);
    L(g,[4,-8+bob,10,-22+bob],OL,2); E(g,10,-23+bob,3,3,'#f55',false); E(g,-26,28,6,4,'rgba(200,200,200,0.5)',false); break;
  case 'mopdrone': L(g,[-12,24,-14,34],OL,3); L(g,[12,24,14,34],OL,3); E(g,0,10+bob,22,18,'#7d8794'); E(g,-8,8+bob,7,7,'#d93025',true,2);
    if(e.armor>0){ for(i=-4;i<=4;i++) L(g,[i*4,-10+bob,i*6,8+bob],'#d8d0b8',4); E(g,0,-12+bob,12,6,'#c8bea0'); L(g,[0,-18+bob,0,-36+bob],'#8a5a2a',4); } break;
  case 'bufferbot': L(g,[-14,22,-14,34],OL,4); L(g,[14,22,14,34],OL,4); RR(g,-22,-14+bob,44,38,6,'#5a6a7c'); if(e.armor>0){ RR(g,-26,-18+bob,52,14,4,'#3e4a58'); RR(g,-26,8+bob,52,10,3,'#3e4a58'); if(e.armor<e.maxarmor*0.5) L(g,[-10,-16+bob,0,-6+bob],'#ddd',2); }
    E(g,-30,16,10,14,'#2f3a46'); E(g,-30,16,4,6,'#888',false); E(g,-6,-2+bob,6,6,'#d93025',true,2); E(g,8,-2+bob,6,6,'#d93025',true,2); break;
  case 'tunneler': if(e.burrow){ E(g,0,26,26,10,'#6a4a2a'); for(i=0;i<5;i++) E(g,-20+i*10,22,5,4,'#8a6a3a',false); L(g,[-4,18,-8,4],OL,2); L(g,[4,18,8,4],OL,2); }
    else { g.translate(0,4); ant(g,{cigar:1,item:function(g,x,y){ E(g,x,y,8,9,'#6a8a3a',true,2); }},t); } break;
  case 'sirsucks': var sp=t*2; E(g,26,-8+bob,40,26,'#5c2b8c'); E(g,0,10,58,30,'#1f1f24'); E(g,0,4,52,22,'#2b2b33',false); g.save(); g.beginPath(); g.ellipse(0,4,50,20,0,0,6.28); g.clip(); for(i=0;i<6;i++){ var a=sp+i; L(g,[Math.cos(a)*50,4+Math.sin(a)*20,Math.cos(a+0.3)*30,4+Math.sin(a+0.3)*12],'#3a3a44',2); } g.restore();
    g.fillStyle='rgba(255,40,30,0.25)'; g.beginPath(); g.arc(-14,2,22,0,6.28); g.fill(); E(g,-14,2,13,10,'#e0201b',true,2); E(g,-14,2,6,5,'#ffcf3a',false);
    g.beginPath(); g.moveTo(-18,-14); g.lineTo(-14,-30); g.lineTo(-6,-20); g.lineTo(2,-34); g.lineTo(10,-20); g.lineTo(18,-30); g.lineTo(22,-14); g.closePath(); g.fillStyle='#d4a62a'; g.fill(); g.lineWidth=2.5; g.strokeStyle=OL; g.stroke();
    for(i=0;i<3;i++) E(g,-64-i*10+Math.sin(t*8+i)*3,26-i*3,6-i,4,'rgba(200,200,200,0.4)',false); break;
  case 'deckhand': human(g,t,{coat:'#e8732a',hat:'#1e3a6a'}); for(i=0;i<5;i++){ L(g,[-26+i*5,-6,-30+i*5,16],'#d8c890',1.5); L(g,[-30,-4+i*5,-10,-4+i*5],'#d8c890',1.5); } break;
  case 'boathook': human(g,t,{coat:'#3a7a5a',hat:'#8a1a1a'}); L(g,[10,0,-44,-10],'#8a5a2a',4); L(g,[-44,-10,-48,-2,-42,4],'#9a9a9a',3); break;
  case 'gull': var fy=Math.sin(t*10)*10; g.translate(0,-26+Math.sin(t*2)*4); E(g,0,0,22,12,'#f4f4f4'); L(g,[4,-4,22,-14-fy,36,-6-fy],'#9aa4b0',6); L(g,[-2,-4,-14,-16-fy,-24,-10-fy],'#9aa4b0',6);
    E(g,-20,-6,10,9,'#f4f4f4'); L(g,[-28,-6,-40,-2,-28,-1],'#f2c230',3); L(g,[-24,-10,-18,-9],OL,2.5); E(g,-21,-7,1.5,1.5,'#111',false); g.strokeStyle='#e5b80b'; g.lineWidth=2; g.beginPath(); g.arc(-12,0,6,0.3,2.8); g.stroke(); break;
  case 'crabpot': L(g,[-14,24,-16,34],OL,3); L(g,[14,24,16,34],OL,3);
    if(e.armor>0){ RR(g,-26,-22+bob,52,48,4,'rgba(80,110,90,0.35)'); for(i=-18;i<=18;i+=9){ L(g,[i,-22+bob,i,26+bob],'#4a6a58',2); } for(i=-14;i<=24;i+=9){ L(g,[-26,i+bob,26,i+bob],'#4a6a58',2); } E(g,0,-32+bob,8,10,'#ff9a2a'); eye(g,-8,-4+bob,5,-0.5,0); eye(g,6,-4+bob,5,-0.5,0); if(e.armor<e.maxarmor*0.5) L(g,[-10,-10+bob,4,6+bob],'#222',3); }
    else { E(g,0,6,16,18,'#7d8794'); eye(g,-6,2,5,-0.5,0); } break;
  case 'dredge': RR(g,-62,0,124,34,8,'#4a5a6a'); RR(g,-56,-6,112,10,3,'#c8c0a8'); g.fillStyle='#fff'; g.font='bold 10px Arial, sans-serif'; g.fillText('DOTTIE',-20,24);
    L(g,[30,-6,30,-60,-20,-80],'#555',6); var dg=Math.sin(t*1.5)*8; L(g,[-20,-80,-30,-50+dg],'#333',2); RR(g,-44,-50+dg,28,20,4,'#6a6a6a');
    g.save(); g.translate(0,-18); human(g,t*0.3,{coat:'#f2c230',hat:'#f2f2f2'}); g.restore();
    g.save(); g.translate(30,-66); g.scale(0.75,0.75); E(g,0,0,18,10,'#f4f4f4'); E(g,-14,-6,8,8,'#f4f4f4'); L(g,[-20,-6,-30,-3],'#f2c230',3); L(g,[-17,-9,-12,-8],OL,2); g.strokeStyle='#e5b80b'; g.lineWidth=2; g.beginPath(); g.arc(-8,2,5,0.2,2.8); g.stroke(); g.restore(); break;
  case 'imp': L(g,[-8,20,-10,34],OL,3); L(g,[8,20,10,34],OL,3); E(g,0,8+bob,16,16,'#8a5ad0'); E(g,0,-12+bob,15,13,'#9b6ae0'); L(g,[-10,-22+bob,-14,-32+bob],'#f2c230',3); L(g,[10,-22+bob,14,-32+bob],'#f2c230',3);
    E(g,-5,-13+bob,3,3.5,'#fff',true,1.5); E(g,5,-13+bob,3,3.5,'#fff',true,1.5); L(g,[-6,-5+bob,0,-2+bob,6,-5+bob],OL,2); RR(g,-32,-2+bob,16,20,3,'#ffcf3a'); g.fillStyle='#d7263d'; g.fillRect(-30,4+bob,12,4); break;
  case 'basket': if(e.armor>0){ var rot=t*8; E(g,-18,30,7,7,'#333'); E(g,18,30,7,7,'#333'); L(g,[-18+Math.cos(rot)*6,30+Math.sin(rot)*6,-18,30],'#888',2); L(g,[18+Math.cos(rot)*6,30+Math.sin(rot)*6,18,30],'#888',2);
      E(g,0,-18,13,11,'#9b6ae0'); E(g,-4,-19,2.5,3,'#fff',false); E(g,4,-19,2.5,3,'#fff',false); L(g,[-8,-28,-10,-36],'#f2c230',3); L(g,[8,-28,10,-36],'#f2c230',3);
      RR(g,-28,-10,56,34,4,'#e8503a'); for(i=-20;i<=20;i+=8) L(g,[i,-6,i,20],'#ffb0a0',2); L(g,[-24,-10,-14,-28,14,-28,24,-10],'#c83a2a',3); if(e.armor<e.maxarmor*0.5) L(g,[-14,-6,0,12],'#222',3); }
    else { g.restore(); var tt=e.type; e.type='imp'; drawFoe(g,e,x,y,s); e.type=tt; return; } break;
  case 'umbrella': var hop=Math.abs(Math.sin(t*5))*10; g.translate(0,-hop); L(g,[0,10,0,30],'#a8742a',4); E(g,0,32,6,3,'#f0c8a0');
    g.beginPath(); g.moveTo(0,-38); g.lineTo(-30,10); g.quadraticCurveTo(0,4,30,10); g.closePath(); g.fillStyle='#e85a8a'; g.fill(); g.lineWidth=3; g.strokeStyle=OL; g.stroke();
    L(g,[0,-38,-10,8],'#ffd0e0',2); L(g,[0,-38,10,8],'#ffd0e0',2); eye(g,0,-12,8,-0.5,0.2); L(g,[-4,0,0,10,4,0],'#d7263d',3); break;
  case 'sodacan': var jy = e.jump>0 ? -Math.sin((0.6-e.jump)/0.6*Math.PI)*60 : 0; g.translate(0,jy); L(g,[-8,24,-10,34],OL,3); L(g,[8,24,10,34],OL,3);
    RR(g,-14,-26,28,52,6,'#2ab0b0'); RR(g,-14,-8,28,12,0,'#fff',false); g.fillStyle='#d7263d'; g.font='bold 9px Arial, sans-serif'; g.fillText('FIZZ',-11,1); E(g,0,-26,14,4,'#c0c8c8');
    E(g,-5,-16,3,3.5,'#fff',true,1.5); E(g,5,-16,3,3.5,'#fff',true,1.5); L(g,[-4,12,4,12],OL,2); if(e.jump>0){ for(i=0;i<4;i++) E(g,rnd(-10,10),rnd(26,46),3,3,'rgba(200,255,255,0.7)',false); } break;
  case 'kappamech': var st2=Math.sin(t*3)*3; L(g,[-30,20,-36,38],'#4a5a4a',10); L(g,[30,20,36,38],'#4a5a4a',10); RR(g,-48,-20,96,48,10,'#6b8a6a'); RR(g,-40,-10,80,8,3,'#d7263d',false);
    L(g,[-48,-4,-72,8+st2],'#4a5a4a',8); L(g,[-72,8+st2,-82,0+st2],OL,4); L(g,[-72,8+st2,-80,16+st2],OL,4);
    E(g,0,-42,28,24,'rgba(180,230,255,0.45)'); g.save(); g.translate(0,-40); E(g,0,4,16,14,'#5fa544'); E(g,0,-10,12,4,'#8ad0f0'); L(g,[-11,-9,11,-9],'#3a6a2a',2); E(g,-5,2,2.5,3,'#111',false); E(g,5,2,2.5,3,'#111',false);
    g.beginPath(); g.moveTo(-6,8); g.lineTo(0,15); g.lineTo(6,8); g.closePath(); g.fillStyle='#f2c230'; g.fill(); g.lineWidth=1.5; g.strokeStyle=OL; g.stroke(); RR(g,-14,14,28,5,2,'#7b3fa0'); g.restore();
    RR(g,26,-10,18,22,3,'#ffcf3a'); g.fillStyle='#d7263d'; g.fillRect(28,-4,14,4); break;
  default: E(g,0,0,20,20,'#888');
  }
  if(e.slow>0 && !e.boss){ g.globalAlpha=0.3; E(g,0,8,24,26,G&&G.w.id==='onigiri'?'#d64a7a':'#ff7ab0',false); }
  if(e.stuck>0){ g.globalAlpha=0.7; E(g,0,32,26,7,'#f0e6b0',false); }
  g.restore();
  if(e.stun>0){ for(var k=0;k<3;k++){ var a2=t*4+k*2.1; g.fillStyle='#ffe45c'; g.font='14px Arial, sans-serif'; g.fillText('\u2605',x+Math.cos(a2)*18-6,y-44+Math.sin(a2)*5); } }
  if(e.boss && G && G.foes.indexOf(e)>=0){ var bw=120; g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(x-bw/2,y-70,bw,9); g.fillStyle='#ff4a5a'; g.fillRect(x-bw/2,y-70,bw*Math.max(0,e.hp/e.maxhp),9); g.lineWidth=1; g.strokeStyle='#000'; g.strokeRect(x-bw/2,y-70,bw,9); }
}

function drawDrop(g,d){ var a=d.life<2?(Math.sin(d.t*20)>0?0.4:1):1, k; g.save(); g.globalAlpha=a; g.translate(d.x,d.y); var s=1+Math.sin(d.t*4)*0.06; g.scale(s,s);
  g.fillStyle='rgba(255,255,255,0.22)'; g.beginPath(); g.arc(0,0,27,0,6.28); g.fill();
  if(G.w.id==='stink'){ for(k=0;k<5;k++){ var an=k*1.256+d.t; E(g,Math.cos(an)*9,Math.sin(an)*9,9,7,'#ffb52a',true,2); } E(g,0,0,8,8,'#ffd25a',true,2); }
  else if(G.w.id==='oldbay'){ g.beginPath(); g.moveTo(0,16); for(k=0;k<=6;k++){ var an2=Math.PI+k*Math.PI/6; g.lineTo(Math.cos(an2)*18,Math.sin(an2)*18+6); } g.closePath(); g.fillStyle='#ffe6f0'; g.fill(); g.lineWidth=2.5; g.strokeStyle=OL; g.stroke();
    for(k=1;k<6;k++){ var an3=Math.PI+k*Math.PI/6; L(g,[0,14,Math.cos(an3)*16,Math.sin(an3)*16+6],'#e0a0c0',1.5); } E(g,0,-2,5,5,'#fff',false); }
  else { g.beginPath(); for(k=0;k<10;k++){ var r=k%2?8:19, an4=-Math.PI/2+k*Math.PI/5; g.lineTo(Math.cos(an4)*r,Math.sin(an4)*r); } g.closePath(); g.fillStyle='#ff8ab8'; g.fill(); g.lineWidth=2.5; g.strokeStyle=OL; g.stroke(); E(g,0,1,6,5,'#fff',false); }
  g.restore(); }
function drawProj(g,p){ g.save(); g.translate(p.x,p.y); var k=p.kind, i;
  if(p.fire){ E(g,-8,0,16,8,'rgba(255,150,40,0.6)',false); }
  if(k==='acorn'){ E(g,0,0,7,8,'#9a6a3a',true,2); RR(g,-7,-9,14,5,2,'#5a3a1a',false); }
  else if(k==='bolt'||k==='bolt2'){ var s2=k==='bolt2'?1.3:1; RR(g,-8*s2,-3*s2,16*s2,6*s2,2,'#b8bcc4',true); E(g,8*s2,0,4*s2,5*s2,'#8a8e96',true,1.5); }
  else if(k==='heart'){ heart(g,0,0,9,'#ff4f7a'); }
  else if(k==='spark'){ L(g,[-10,0,-4,-5,2,3,9,-2],'#ffe45c',3); E(g,0,0,5,5,'#fff8b0',false); }
  else if(k==='dango'){ E(g,-8,0,5,5,'#9bcb68',true,1.5); E(g,0,0,5,5,'#f5f2ea',true,1.5); E(g,8,0,5,5,'#f7a8c4',true,1.5); }
  else if(k==='candy'){ g.rotate(p.p*8); RR(g,-11,-5,22,10,2,'#e5a823',true); g.fillStyle='#7a3a1a'; g.fillRect(-5,-5,10,10); }
  else if(k==='spice'){ g.rotate(p.p*6); E(g,0,0,12,11,'#e8833a',true,2); g.fillStyle='#a8452a'; for(i=0;i<5;i++){ g.beginPath(); g.arc(Math.cos(i)*6,Math.sin(i*2)*5,2,0,6.28); g.fill(); } }
  else if(k==='plum'){ E(g,0,0,9,9,'#d64a7a',true,2); L(g,[0,-8,3,-12],'#3a7a2a',2); }
  if(p.fire){ g.globalAlpha=0.8; E(g,2,0,6,6,'#ff7a1a',false); }
  g.restore(); }
function drawSweeper(g,s,r){ var y=cy(r); g.save(); g.translate(s.x,y+8);
  if(G.w.id==='stink'){ RR(g,-22,-8,40,26,5,'#c8c8d0'); E(g,-4,20,22,6,'#7a7a8a'); L(g,[12,-6,24,-32],'#555',4); RR(g,18,-38,14,8,3,'#e5a823'); E(g,-4,20,14,3,'rgba(255,255,255,0.5)',false); }
  else if(G.w.id==='oldbay'){ E(g,0,4,18,22,'#8a5a2a'); L(g,[-17,-6,17,-6],'#3a3a3a',3); L(g,[-17,14,17,14],'#3a3a3a',3); g.fillStyle='rgba(143,211,255,0.7)'; g.beginPath(); g.ellipse(-18,22,14,5,0,0,6.28); g.fill(); }
  else { RR(g,-24,-4,44,24,5,'#ff7aa8'); RR(g,-20,-14,36,12,4,'#2a2a2a'); E(g,-10,-8,4,3,'#fff',false); E(g,0,-8,4,3,'#ff5a5a',false); E(g,10,-8,4,3,'#9bcb68',false); E(g,-14,22,6,6,'#555'); E(g,12,22,6,6,'#555'); }
  g.restore(); }
function render(){ if(!G) return; var g=ctx; g.save(); if(G.shake>0) g.translate(rnd(-5,5)*G.shake*3, rnd(-5,5)*G.shake*3);
  g.drawImage(bgCanvas,0,0);
  if(G.hover && G.sel && !G.over){ var c=cellAt(G.hover.x,G.hover.y); if(c){ var ok = G.sel==='shovel' ? !!G.grid[c.r][c.c] : !G.grid[c.r][c.c];
      g.fillStyle= ok ? 'rgba(255,255,255,0.18)':'rgba(255,60,60,0.18)'; g.fillRect(LEFT+c.c*CW,c.r*CH,CW,CH);
      if(ok && G.sel!=='shovel'){ g.globalAlpha=0.45; drawDef(g,{id:G.sel,d:D.def[G.sel],hp:1,maxhp:1,fire:0,arm:0,uses:D.def[G.sel].uses},cx(c.c),cy(c.r),G.time); g.globalAlpha=1; } } }
  else if(G.sel && !G.over && G.sel!=='shovel'){ g.fillStyle='rgba(255,255,255,0.06)'; for(var rr=0;rr<ROWS;rr++) for(var cc=0;cc<COLS;cc++) if(!G.grid[rr][cc]) g.fillRect(LEFT+cc*CW+4,rr*CH+4,CW-8,CH-8); }
  for(var r=0;r<ROWS;r++){ var s=G.sweep[r]; if(s.st!=='gone') drawSweeper(g,s,r);
    for(var c2=0;c2<COLS;c2++){ var u=G.grid[r][c2]; if(u) drawDef(g,u,u.x,u.y,u.anim); }
    G.foes.filter(function(e){ return Math.round((e.y-CH/2)/CH)===r && !e.f.fly; }).sort(function(a,b){ return b.x-a.x; }).forEach(function(e){ drawFoe(g,e,e.x,e.y); }); }
  G.foes.forEach(function(e){ if(e.f.fly) drawFoe(g,e,e.x,e.y); });
  G.projs.forEach(function(p){ drawProj(g,p); });
  G.fx.forEach(function(f){ var a=1-f.t/f.life;
    if(f.k==='p'){ g.globalAlpha=a; E(g,f.x,f.y,f.r,f.r,f.col,false); }
    else if(f.k==='cloud'){ g.globalAlpha=a*0.75; E(g,f.x,f.y,f.r*(1+f.t),f.r*0.8*(1+f.t),'#7ccb3a',false); }
    else if(f.k==='ring'){ g.globalAlpha=a; g.beginPath(); g.arc(f.x,f.y,Math.max(1,f.r*(f.t/f.life)),0,6.28); g.lineWidth=6; g.strokeStyle='#fff2a8'; g.stroke(); }
    else if(f.k==='text'){ g.globalAlpha=Math.min(1,a*2); g.font='bold 18px Impact, "Arial Black", sans-serif'; g.textAlign='center'; g.lineWidth=4; g.strokeStyle='#000'; g.strokeText(f.s,f.x,f.y-f.t*30); g.fillStyle=f.col; g.fillText(f.s,f.x,f.y-f.t*30); g.textAlign='left'; }
    g.globalAlpha=1; });
  G.drops.forEach(function(d){ drawDrop(g,d); });
  if(G.paused){ g.fillStyle='rgba(0,0,0,0.5)'; g.fillRect(0,0,W,H); g.fillStyle='#fff'; g.font='bold 44px Impact, "Arial Black", sans-serif'; g.textAlign='center'; g.fillText('PAUSED',W/2,H/2); g.font='16px Trebuchet MS, sans-serif'; g.fillText('tap \u275A\u275A to keep going',W/2,H/2+30); g.textAlign='left'; }
  g.restore(); }

/* ---------------- input ---------------- */
function toLogical(e){ var r=cv.getBoundingClientRect(); return {x:(e.clientX-r.left)/r.width*W, y:(e.clientY-r.top)/r.height*H}; }
cv.addEventListener('pointerdown', function(e){ e.preventDefault(); audioInit(); var p=toLogical(e); tap(p.x,p.y); if(G) G.hover = (e.pointerType==='mouse') ? p : null; });
cv.addEventListener('pointermove', function(e){ if(!G||e.pointerType!=='mouse') return; G.hover=toLogical(e); });
cv.addEventListener('pointerleave', function(){ if(G) G.hover=null; });
document.addEventListener('keydown', function(e){ if(!G||!running) return; var k=e.key;
  if(k>='1'&&k<='9'){ var id=G.avail[+k-1]; if(id) pick(id); } else if(k==='s'||k==='S'){ G.sel=G.sel==='shovel'?null:'shovel'; } else if(k==='p'||k==='P'||k===' '){ e.preventDefault(); if(!G.over) G.paused=!G.paused; } else if(k==='Escape'){ G.sel=null; } });
function resize(){ var st=$('stage'); if(!st) return; var avW=st.clientWidth||W; var used=$('hud').offsetHeight+$('packets').offsetHeight+(EMBED?4:($('foot')?$('foot').offsetHeight+16:60));
  var w=Math.min(avW, (window.innerHeight-used)*2); if(w<avW*0.6) w=avW; cv.style.width=w+'px'; cv.style.height=(w/2)+'px'; }
window.addEventListener('resize', resize);

/* ---------------- buttons ---------------- */
var started=false;
function go(){ if(started) return; started=true; audioInit(); renderMap(); show('scrMap'); }
bindTap($('scrTitle'), go);
bindTap($('toAlm'), function(){ renderAlm(); show('scrAlm'); }); bindTap($('toHelp'), function(){ show('scrHelp'); });
var backs=document.querySelectorAll('.back'), i; for(i=0;i<backs.length;i++) bindTap(backs[i], function(){ renderMap(); show('scrMap'); });
var sb=document.querySelectorAll('.snd'); for(i=0;i<sb.length;i++) bindTap(sb[i], function(){ S.snd=!S.snd; save(); sndBtns(); audioInit(); sfx('collect'); });
bindTap($('shovel'), function(){ if(G) G.sel = G.sel==='shovel'?null:'shovel'; });
bindTap($('pauseBtn'), function(){ if(G&&!G.over) G.paused=!G.paused; });
bindTap($('spdBtn'), function(){ if(!G) return; G.speed=G.speed===1?2:1; $('spdBtn').textContent=G.speed+'x'; });
bindTap($('autoBtn'), function(){ S.auto=!S.auto; save(); $('autoBtn').className='hb sm'+(S.auto?' on':''); });
bindTap($('menuBtn'), function(){ if(!G||G.over) return; G.paused=true; var wi=G.wi, st=G.st; dlg('<div class="vic"><h2>PAUSED</h2><p>'+G.w.show+' &middot; '+G.w.stageNames[G.st]+'</p></div>',[['RESUME',function(){ G.paused=false; },'go'],['RESTART',function(){ startStage(wi,st); }],['MAP',function(){ toMap(); }]]); });
$('autoBtn').className='hb sm'+(S.auto?' on':''); sndBtns();
window.ML = { start:startStage, state:function(){ return G; }, place:function(id,c,r){ if(G){ G.energy+=D.def[id].cost; G.cds[id]=0; return place(id,c,r);} }, spawn:function(t,r,x){ return G&&spawnFoe(t,r,x); }, map:function(){ go(); }, step:function(dt,n){ for(var i=0;i<(n||1);i++){ if(G&&!G.over) step(dt); } return G; }, placeReal:function(id,c,r){ return place(id,c,r); }, collectAll:function(){ G.drops.slice().forEach(collect); }, alm:function(w){ almW=w||0; renderAlm(); show('scrAlm'); } };
})();
