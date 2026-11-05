/* Domino & Pickle's Hoagie Stand - an old-school idle tycoon. X-COMIX MULTIVERSE.
   Plain ES5/ES2015 for old browsers. No ads, no gems, no energy. */
(function(){
'use strict';
var URL_GAME='https://petecastic.github.io/xcomix-memory/hoagie/';
var EMBED=document.body.className.indexOf('embed')>=0;
var KEY='xca-hoagie-v1';
var DAYLEN=40;            /* game-seconds the stand is open */
var W=640,H=360,GROUND=318,STANDX=360;

/* ---------- safe storage + audio ---------- */
function lsGet(k){try{var v=window.localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function lsSet(k,v){try{window.localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function lsDel(k){try{window.localStorage.removeItem(k);}catch(e){}}
var AC=null,soundOn=false;
function tone(f,d,type,vol,slide){
  if(!soundOn)return;
  try{
    if(!AC){var A=window.AudioContext||window.webkitAudioContext;if(!A)return;AC=new A();}
    if(AC.state==='suspended'&&AC.resume)AC.resume();
    var o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;d=d||0.08;
    o.type=type||'square';o.frequency.setValueAtTime(f,t);
    if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
    g.gain.setValueAtTime(vol||0.04,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+0.03);
  }catch(e){}
}
var SFX={
  coin:function(){tone(988,0.06,'square',0.03);setTimeout(function(){tone(1319,0.09,'square',0.03);},55);},
  buy:function(){tone(523,0.05,'triangle',0.05);},
  no:function(){tone(196,0.12,'sawtooth',0.03,150);},
  yip:function(){tone(1200,0.07,'square',0.03,1700);},
  boof:function(){tone(140,0.22,'triangle',0.08,90);},
  ding:function(){tone(1760,0.25,'sine',0.05);},
  fan:function(){[523,659,784,1047].forEach(function(f,i){setTimeout(function(){tone(f,0.12,'square',0.035);},i*90);});}
};

/* ---------- images (drawImage only, never read pixels) ---------- */
var IMG={},IMGN=['domino_stand','domino_sit','domino_sit2','domino_head','domino_walk','pickle_sit','pickle_sit2','pickle_happy','pickle_grin','pickle_walk','grizz_sit','grizz_nap','meatball','meatball_whistle','mittens','rocco','waffles','waffles_wave','turbo','biscuit'];
IMGN.forEach(function(n){var i=new Image();i.src='img/'+n+'.png';IMG[n]=i;});
['bg_dogpark','bg_petstore','bg_donut','bg_deli','squeaker'].forEach(function(n){var i=new Image();i.src='img/'+n+'.jpg';IMG[n]=i;});
function ok(i){return i&&i.complete&&i.naturalWidth>0;}

/* ---------- data ---------- */
var ING=[
 {k:'roll',n:'Hoagie rolls',e:'\uD83E\uDD56',u:'roll',packs:[[10,2.5],[25,5.5],[60,12]]},
 {k:'meat',n:'Salami & ham',e:'\uD83E\uDD69',u:'slice',packs:[[30,3.6],[80,8.8],[200,20]]},
 {k:'cheese',n:'Provolone',e:'\uD83E\uDDC0',u:'slice',packs:[[30,3],[80,7.2],[200,16]]},
 {k:'pep',n:'Peppers',e:'\uD83C\uDF36\uFE0F',u:'scoop',packs:[[20,1.2],[60,3]]},
 {k:'pick',n:'Pickles',e:'\uD83E\uDD52',u:'spear',packs:[[20,1.4],[60,3.4]]}
];
var REC=[{k:'meat',n:'Meat',min:1,max:5},{k:'cheese',n:'Cheese',min:1,max:4},{k:'pep',n:'Peppers',min:0,max:3},{k:'pick',n:'Pickles',min:0,max:3}];
var BASEIDEAL={meat:3,cheese:2,pep:1,pick:2};
var WX={
 sunny:{n:'Sunny',i:'\u2600\uFE0F',tr:1,pm:1,id:{}},
 hot:{n:'Hot',i:'\uD83D\uDD25',tr:1.15,pm:1,id:{meat:-1,pick:1}},
 cloudy:{n:'Cloudy',i:'\u2601\uFE0F',tr:0.85,pm:1,id:{}},
 rain:{n:'Rain',i:'\u2614',tr:0.55,pm:1.05,id:{cheese:1}},
 storm:{n:'Storm',i:'\u26A1',tr:0.32,pm:1.1,id:{meat:1,cheese:1,pick:-1}},
 snow:{n:'Snow',i:'\u2744\uFE0F',tr:0.6,pm:1.15,id:{meat:1,pep:1,pick:-1}}
};
var WXW=[['sunny',30],['hot',12],['cloudy',22],['rain',18],['storm',6],['snow',12]];
var LOC=[
 {n:'Dog Park',bg:'bg_dogpark',cost:0,rent:0,tr:24,pm:1.0,d:'Agility course, splash fountain, one famous mud puddle.'},
 {n:'Pet Store',bg:'bg_petstore',cost:220,rent:4,tr:34,pm:1.1,d:'Treat bins and a whole wall of tennis balls. Busy afternoons.'},
 {n:'Donut Shop Corner',bg:'bg_donut',cost:750,rent:10,tr:46,pm:1.2,d:"Sgt. Meatball's beat. He cannot resist the cooling rack."},
 {n:'Corner Deli Counter',bg:'bg_deli',cost:2200,rent:25,tr:62,pm:1.4,d:'Hanging salamis, a meat slicer and the giant pickle jar.'}
];
var UPS=[
 {id:'s1',g:'Stand',n:'Card Table + Umbrella',c:35,d:'Two more spots in line. Rain hurts less.'},
 {id:'s2',g:'Stand',n:'The Red Wagon Cart',c:140,req:'s1',d:'Roll it right up to the crowd: +20% foot traffic.'},
 {id:'s3',g:'Stand',n:'Hoagie Kiosk',c:550,req:'s2',d:'A real counter with an awning: +25% serving speed, +20% traffic.'},
 {id:'g1',g:'Sign',n:'Chalk Hoagie Doodle',c:15,d:'A hoagie drawn on a board. No words needed: +12% traffic.'},
 {id:'g2',g:'Sign',n:'Painted Hoagie Board',c:110,req:'g1',d:'Big, bright and wordless: +20% traffic.'},
 {id:'g3',g:'Sign',n:'Giant Foam Hoagie',c:480,req:'g2',d:'You can see it from the Dog Park: +30% traffic.'},
 {id:'bell',g:'Kitchen',n:'Counter Bell',c:50,d:'Ding! Customers wait in a longer line.'},
 {id:'cooler',g:'Kitchen',n:'Cooler',c:70,d:"Half the leftover rolls survive the night. The lid never quite shuts."},
 {id:'chalk',g:'Kitchen',n:'War Room Chalkboard',c:90,d:"Domino's plan: unlocks AUTO idle mode and the Shopping List button."},
 {id:'slicer',g:'Kitchen',n:'Meat Slicer',c:180,d:'+20% serving speed and better hoagies.'},
 {id:'nest',g:'Kitchen',n:"Pickle's Bed Stash",c:260,req:'chalk',d:'Offline earnings bank up to 8 hours instead of 2.'},
 {id:'wagon2',g:'Kitchen',n:'Night-Shift Plan',c:900,req:'nest',d:'Offline earnings run at +20% efficiency.'}
];
var HELP=[
 {id:'grizz',n:'Grizz',img:'grizz_sit',c:30,w:3,d:'Big, kind, food-motivated. +35% serving speed. Works for the end crust.'},
 {id:'rocco',n:'Rocco',img:'rocco',c:60,w:5,d:'The trash-alley fence. Supplies cost 20% less; bottle-cap customers pay +5%.'},
 {id:'turbo',n:'Turbo & Biscuit',img:'turbo',c:120,w:8,d:'Tube transit, always on schedule. +18% traffic from commuters.'}
];
var VIPS=[
 {img:'meatball',h:62,p:1.1},{img:'mittens',h:52,p:1.0},{img:'rocco',h:58,p:0.9,caps:1},
 {img:'waffles',h:62,p:1.6},{img:'turbo',h:42,p:1.0},{img:'biscuit',h:30,p:0.95}
];
var PAL=[['#c8873a','#7a4a1c'],['#f1e6d0','#8f7b5a'],['#3b3b3b','#151515'],['#a65e2e','#5b2f12'],['#e3c27a','#9c7a34'],['#9aa0a6','#4f555b'],['#ffffff','#9b9b9b'],['#7b5a3c','#3d2a1a']];

/* ---------- state ---------- */
var S=null;
function fresh(keepSq,lifeAll){
  return {v:1,day:1,money:20,rep:2.5,inv:{roll:0,meat:0,cheese:0,pep:0,pick:0},price:3.5,
    rec:{meat:3,cheese:2,pep:1,pick:2},up:{},loc:0,hire:{},wx:'sunny',fore:'sunny',hist:[],
    life:0,lifeAll:lifeAll||0,sq:keepSq||0,best:0,auto:false,speed:1,last:Date.now(),crumbs:0,
    spent:0,grizzDeal:false,started:false};
}
function load(){var s=lsGet(KEY);if(!s||s.v!==1)return null;var f=fresh();for(var k in f){if(!(k in s))s[k]=f[k];}return s;}
function save(){if(!S)return;S.last=Date.now();lsSet(KEY,S);}

/* ---------- helpers ---------- */
function $(id){return document.getElementById(id);}
function money(v){var n=Math.abs(v),s=n>=100000?Math.round(n).toLocaleString('en-US'):n.toFixed(2);return (v<0?'-':'')+s;}
function rnd(a,b){return a+Math.random()*(b-a);}
function pickW(list){var t=0,i;for(i=0;i<list.length;i++)t+=list[i][1];var r=Math.random()*t;for(i=0;i<list.length;i++){r-=list[i][1];if(r<=0)return list[i][0];}return list[0][0];}
function has(id){return !!S.up[id];}
function hired(id){return !!S.hire[id];}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

function trafficMult(){
  var m=1;if(has('g1'))m*=1.12;if(has('g2'))m*=1.2;if(has('g3'))m*=1.3;
  if(has('s2'))m*=1.2;if(has('s3'))m*=1.2;if(hired('turbo'))m*=1.18;
  return m*(1+0.1*S.sq);
}
function serveTime(){var m=1;if(hired('grizz'))m+=0.35;if(has('slicer'))m+=0.2;if(has('s3'))m+=0.25;if(day&&day.fast)m+=0.1;return 1.15/m;}
function maxQueue(){return 4+(has('s1')?2:0)+(has('bell')?3:0);}
function ideal(wk){var w=WX[wk],o={};REC.forEach(function(r){o[r.k]=clamp(BASEIDEAL[r.k]+(w.id[r.k]||0),r.min,r.max);});return o;}
function taste(wk){var id=ideal(wk),d=0;REC.forEach(function(r){d+=Math.abs(S.rec[r.k]-id[r.k]);});var t=1-0.14*d;if(has('slicer'))t+=0.08;return clamp(t,0.05,1.08);}
function unitCost(){var c=0;ING.forEach(function(g){var p=g.packs[0];var per=p[1]/p[0];var q=g.k==='roll'?1:S.rec[g.k];c+=per*q;});return c*(hired('rocco')?0.8:1);}
function canMake(){if(S.inv.roll<1)return false;for(var i=0;i<REC.length;i++){if(S.inv[REC[i].k]<S.rec[REC[i].k])return false;}return true;}
function makeable(){var n=S.inv.roll;REC.forEach(function(r){if(S.rec[r.k]>0)n=Math.min(n,Math.floor(S.inv[r.k]/S.rec[r.k]));});return n;}
function wages(){var w=0;HELP.forEach(function(h){if(hired(h.id))w+=h.w;});return w;}
function expectTraffic(wk){var l=LOC[S.loc];var rain=(wk==='rain'||wk==='storm')&&has('s1')?1.3:1;return l.tr*WX[wk].tr*rain*trafficMult()*(0.7+S.rep*0.12);}
function capacity(){return Math.floor(DAYLEN/serveTime())+maxQueue();}

/* ---------- canvas ---------- */
var cv=$('cv'),cx=cv.getContext('2d');
var day=null;          /* live day sim */
var custs=[],floats=[],parts=[],sfxTxt=[];
var iris=0,phase='prep';   /* prep | open | iris | report */
var pickleMood=0,pickleT=0,clockT=0,autoT=0;

function newDay(){
  var wk=S.wx,base=expectTraffic(wk)*rnd(0.9,1.1);
  var n=Math.round(base*(S.today&&S.today.trM||1));
  n=clamp(n,3,170);
  var times=[],i;
  for(i=0;i<n;i++){var u=(Math.random()+Math.random()+Math.random())/3;times.push(u*DAYLEN*(S.today&&S.today.late?0.8:1)+(S.today&&S.today.late?DAYLEN*0.2:0));}
  if(S.today&&S.today.rush){for(i=0;i<12;i++)times.push(DAYLEN*0.5+rnd(-1.5,1.5));}
  times.sort(function(a,b){return a-b;});
  day={t:0,times:times,ti:0,sold:0,rev:0,lostP:0,lostS:0,lostL:0,serving:null,serveT:0,queue:[],tst:taste(wk),fast:S.today&&S.today.fast,wk:wk,repStart:S.rep,
       rent:LOC[S.loc].rent,wage:wages(),spent:S.spent||0,extra:S.today&&S.today.extra||0};
  custs=[];floats=[];
}
function spawn(){
  var vip=Math.random()<0.16?VIPS[Math.floor(Math.random()*VIPS.length)]:null;
  if(vip&&vip.img==='rocco'&&hired('rocco'))vip=null;
  if(vip&&(vip.img==='turbo'||vip.img==='biscuit')&&hired('turbo'))vip=null;
  var dir=Math.random()<0.5?1:-1;
  var w=3.25*LOC[S.loc].pm*WX[day.wk].pm*(0.6+0.6*day.tst)*(0.85+S.rep*0.06)*rnd(0.72,1.38)*(vip?vip.p:1);
  custs.push({x:dir>0?-40:W+40,dir:dir,spd:rnd(55,85),vip:vip,pal:PAL[Math.floor(Math.random()*PAL.length)],sz:rnd(0.85,1.2),
    st:'walk',dec:false,w:w,b:null,bt:0,ph:Math.random()*6,caps:vip&&vip.caps});
}
function bubble(c,txt,col){c.b=txt;c.bc=col||'#fff';c.bt=1.6;}
function flo(x,y,t,col){floats.push({x:x,y:y,t:t,c:col||'#ffe24a',a:1.2});}
function word(t,x,y,col){sfxTxt.push({t:t,x:x,y:y,c:col||'#ffd84a',a:1.1});}

function step(dt){
  clockT+=dt;pickleT-=dt;if(pickleT<0){pickleMood=0;}
  parts.forEach(function(p){p.y+=p.vy*dt;p.x+=p.vx*dt;if(p.y>H){p.y=-5;p.x=Math.random()*W;}});
  floats=floats.filter(function(f){f.y-=28*dt;f.a-=dt*0.8;return f.a>0;});
  sfxTxt=sfxTxt.filter(function(f){f.a-=dt*0.9;f.y-=8*dt;return f.a>0;});
  if(phase==='iris'){iris+=dt;if(iris>1.6){phase='report';showReport();}return;}
  if(phase==='prep'||phase==='report'){
    if(S.auto&&has('chalk')){autoT+=dt;if(autoT>(phase==='prep'?1.2:2.6)){autoT=0;if(phase==='report'){closeDlg();nextDay();}else{shoppingList(true);openStand();}}}
    return;
  }
  if(phase!=='open')return;
  day.t+=dt;
  while(day.ti<day.times.length&&day.times[day.ti]<=day.t){spawn();day.ti++;}
  var sx=STANDX;
  custs.forEach(function(c){
    c.ph+=dt*10;if(c.bt>0)c.bt-=dt;
    var lt=(c.st==='queue')?0:-24;if(c.ly===undefined)c.ly=lt;c.ly+=(lt-c.ly)*Math.min(1,dt*6);
    if(c.st==='walk'||c.st==='leave'){
      c.x+=c.dir*c.spd*dt;
      if(c.st==='walk'&&!c.dec&&Math.abs(c.x-sx)<110){c.dec=true;decide(c);}
    }else if(c.st==='queue'){
      var idx=day.queue.indexOf(c),tx=sx-78-idx*42;
      if(Math.abs(c.x-tx)>2){c.dir=c.x<tx?1:-1;c.x+=c.dir*Math.min(Math.max(c.spd,130)*dt,Math.abs(c.x-tx));}
      else{c.dir=1;}
      c.wait=(c.wait||0)+dt;
      var pat=(has('bell')?14:9);
      if(c.wait>pat&&idx>0){day.queue.splice(idx,1);c.st='leave';c.dir=1;day.lostL++;bubble(c,'...');}
    }
  });
  custs=custs.filter(function(c){return c.x>-80&&c.x<W+80;});
  /* serving */
  if(day.serving){day.serveT-=dt;if(day.serveT<=0){sell(day.serving);day.serving=null;}}
  else if(day.queue.length&&Math.abs(day.queue[0].x-(sx-78))<30){day.serving=day.queue[0];day.serveT=serveTime();}
  if(day.t>DAYLEN&&!day.queue.length&&!day.serving&&(custs.every(function(c){return c.st==='leave'||c.dec;})||day.t>DAYLEN+8)){endDay();}
}
function decide(c){
  if(!canMake()){bubble(c,'SOLD OUT','#fbb');day.lostS++;S.rep=Math.max(0,S.rep-0.012);return;}
  if(S.price>c.w){bubble(c,'$$$','#fdd');day.lostP++;S.rep=Math.max(0,S.rep-0.002);
    if(Math.random()<0.25){pickleMood=2;pickleT=1.2;word('SCRRATCH!',STANDX+40,GROUND-110,'#ff8a8a');SFX.no();}return;}
  if(day.queue.length>=maxQueue()){bubble(c,'...');day.lostL++;return;}
  c.st='queue';day.queue.push(c);bubble(c,'\u2665','#fff');
}
function sell(c){
  var i=day.queue.indexOf(c);if(i>=0)day.queue.splice(i,1);
  c.st='leave';c.dir=1;c.spd=Math.max(c.spd,70);
  if(!canMake()){bubble(c,'SOLD OUT','#fbb');day.lostS++;return;}
  S.inv.roll--;REC.forEach(function(r){S.inv[r.k]-=S.rec[r.k];});
  var p=S.price*(c.caps&&hired('rocco')?1.05:1);
  S.money+=p;day.rev+=p;day.sold++;S.life+=p;S.lifeAll+=p;
  var t=day.tst,val=S.price<c.w*0.75;
  S.rep=clamp(S.rep+(t-0.6)*0.012+(val?0.004:0),0,5);
  bubble(c,t>0.8?'YUM!':t>0.55?'\u263A':'meh',t>0.8?'#dfd':'#fff');
  flo(STANDX-20,GROUND-120,'+$'+p.toFixed(2));SFX.coin();
  if(Math.random()<0.12){pickleMood=1;pickleT=1;word('YIP!',STANDX+55,GROUND-120);SFX.yip();}
}
function endDay(){
  phase='iris';iris=0;
  var cost=day.spent+day.rent+day.wage;
  S.money-=day.rent+day.wage;
  var profit=day.rev-cost;
  var tossed=has('cooler')?Math.ceil(S.inv.roll*0.5):S.inv.roll;S.inv.roll-=tossed;
  var rec={d:S.day,wx:day.wk,loc:S.loc,sold:day.sold,rev:day.rev,spent:day.spent,rent:day.rent,wage:day.wage,profit:profit,lp:day.lostP,ls:day.lostS,ll:day.lostL,toss:tossed,rep:S.rep-day.repStart,price:S.price,tst:day.tst};
  S.hist.push(rec);if(S.hist.length>30)S.hist.shift();
  if(profit>S.best)S.best=profit;
  S.spent=0;S.today=null;
  day.rec=rec;
  if(S.money<1&&makeable()===0){S.money+=10;rec.bail=true;}
  save();refresh();
}
function nextDay(){
  S.day++;S.wx=Math.random()<0.8?S.fore:pickW(WXW);S.fore=pickW(WXW);
  phase='prep';day=null;custs=[];autoT=0;
  setWeatherParts();
  var ev=rollEvent();
  save();refresh();renderPanel();
  if(ev&&!(S.auto&&has('chalk')))showEvent(ev);
  else if(ev)toast(ev);
}
function openStand(){
  if(phase!=='prep')return;
  if(!canMake()){
    if(has('chalk')){shoppingList(true);}
    if(!canMake()){msg('Nothing to sell','<p>You need at least one full hoagie: a roll plus the meat, cheese, peppers and pickles in your recipe.</p><p>Open the <b>Supplies</b> tab and buy some ingredients.</p>',[['OK',function(){closeDlg();setTab('sup');}]]);return;}
  }
  S.started=true;newDay();phase='open';SFX.ding();refresh();
}

/* ---------- events (overnight, from the D&P cartoons) ---------- */
var EVENTS=[
 {id:'snack',w:10,img:'pickle_grin',sfx:'MUNCH!',t:'The Midnight Snack Job',
  ok:function(){return S.inv.meat+S.inv.cheese>12;},
  run:function(){var m=Math.floor(S.inv.meat*0.25),c=Math.floor(S.inv.cheese*0.25);S.inv.meat-=m;S.inv.cheese-=c;S.crumbs++;
   return ['Somebody raided the cooler overnight. All that\'s left is an empty wrapper and a crumb trail that ends at Pickle\'s bed.','-'+m+' meat, -'+c+' cheese'];}},
 {id:'drawer',w:7,img:'pickle_sit2',sfx:'STUCK!',t:'Wedged in the Cheese Drawer',
  run:function(){S.today.late=true;S.today.trM=(S.today.trM||1)*0.85;return ['Pickle went in after the provolone and got wedged in the cheese drawer. Domino gets him out, but the stand opens late.','Shorter day today'];}},
 {id:'jar',w:6,img:'pickle_happy',sfx:'?!',t:'The Giant Pickle Jar',
  run:function(){var b=S.loc===3?1.5:1.3;S.today.trM=(S.today.trM||1)*b;return ['Pickle is sure the giant pickle jar is his twin. The stare-down draws a crowd.','+'+Math.round((b-1)*100)+'% customers today'];}},
 {id:'grizz',w:7,img:'grizz_sit',sfx:'*whine*',t:'Grizz Smells Hoagie',
  run:function(){if(hired('grizz')){if(S.inv.roll>0)S.inv.roll--;S.today.fast=true;return ['Grizz parks himself by the counter, nose first, and gets the end crust. He works extra hard all day.','-1 roll, faster service today'];}
   S.grizzDeal=true;return ['Grizz wanders over, nose first, following the smell. He would work for crusts.','Hire Grizz at half price (Helpers tab)'];}},
 {id:'couch',w:6,img:'grizz_nap',sfx:'SQUEAK!',t:'The Couch Crack',
  run:function(){var v=Math.round((4+S.day*0.6)*(1+0.1*S.sq)*100)/100;S.money+=v;return ['Something squeaked in the couch crack. Out came a lost remote, three tennis balls, a hoagie crust and some loose change.','+$'+v.toFixed(2)];}},
 {id:'toy',w:5,img:'pickle_walk',sfx:'POOF!',t:'Whatever Goes In Comes Out Different',
  ok:function(){return S.inv.pep>3;},
  run:function(){var p=S.inv.pep;S.inv.pep=0;S.inv.pick+=p;return ['Pickle dropped the peppers in the toy chest. Whatever goes in comes out different. They came out as pickles.',p+' peppers became '+p+' pickles'];}},
 {id:'rocco',w:6,img:'rocco',sfx:'CLINK!',t:"Rocco's Bottle-Cap Market",
  run:function(){var k=hired('rocco')?2:1;S.inv.pick+=15*k;S.inv.roll+=6*k;return ['Rocco rolls in from the trash alley with a trade: a sack of bottle caps for supplies. Somehow everybody wins.','+'+(15*k)+' pickles, +'+(6*k)+' rolls'];}},
 {id:'meatball',w:6,img:'meatball_whistle',sfx:'TWEET!',t:"Sgt. Meatball's Inspection",
  run:function(){
   if(S.loc===2)return ['Mittens tattled, so Sgt. Meatball came to inspect. Then he spotted the donut cooling rack and forgot the whole thing.','No fine'];
   if(has('cooler')){S.money+=S.price*3;return ['Mittens tattled, so Sgt. Meatball came to inspect. The cooler passes the sniff test. He buys three hoagies on his way out.','+$'+(S.price*3).toFixed(2)];}
   var f=Math.min(5,Math.max(0,S.money));S.money-=f;return ['Mittens tattled, so Sgt. Meatball came to inspect. Crumbs everywhere and no cooler. Tweet!','-$'+f.toFixed(2)+' fine (a Cooler would pass inspection)'];}},
 {id:'waffles',w:4,img:'waffles_wave',sfx:'SNIP!',t:'Mayor Waffles Cuts a Ribbon',
  ok:function(){return S.day>3;},
  run:function(){S.rep=clamp(S.rep+0.3,0,5);S.today.trM=(S.today.trM||1)*1.2;return ['Mayor Waffles holds a ribbon-cutting at the stand and takes credit for the whole idea. Great for business anyway.','+reputation, +20% customers today'];}},
 {id:'turbo',w:4,img:'turbo',sfx:'TOOT!',t:'The Tube Runs on Time',
  run:function(){S.today.rush=true;return ['Turbo blows the whistle. The noon tube is right on schedule, and a whole carload heads for the stand.','Lunch rush at midday'];}},
 {id:'mud',w:5,img:'domino_walk',sfx:'SPLOOSH!',t:'The Mud Puddle',
  ok:function(){return S.loc===0&&S.inv.roll>4;},
  run:function(){var r=Math.ceil(S.inv.roll*0.4);S.inv.roll-=r;return ['The dog park mud puddle gets somebody every time. Today it got a box of rolls.','-'+r+' rolls'];}},
 {id:'stair',w:4,img:'domino_sit2',sfx:'CREAK!',t:'The Squeaky Stair',
  run:function(){S.today.trM=(S.today.trM||1)*1.1;return ["Domino's dawn supply run hit the squeaky stair. Now everybody is up early, so the stand opens early.",'+10% customers today'];}},
 {id:'pick',w:4,img:'pickle_grin',sfx:'CRUNCH!',t:'Pickle Ate a Pickle',
  ok:function(){return S.inv.pick>5;},
  run:function(){S.inv.pick-=5;return ['It was bound to happen.','-5 pickles'];}}
];
function rollEvent(){
  S.today={};
  if(S.day<3||Math.random()>0.45)return null;
  var pool=EVENTS.filter(function(e){return !e.ok||e.ok();});
  var e=pickW(pool.map(function(x){return [x,x.w];}));
  var r=e.run();
  return {e:e,txt:r[0],fx:r[1]};
}
function showEvent(ev){
  SFX.boof();
  msg(ev.e.t,'<img class="pic" src="img/'+ev.e.img+'.png" alt=""><div class="sfx">'+esc(ev.e.sfx)+'</div><p>'+esc(ev.txt)+'</p><div class="note"><b>'+esc(ev.fx)+'</b></div>',[['OK',function(){closeDlg();refresh();}]]);
}
var toastQ=null;
function toast(ev){toastQ={t:ev.e.t+': '+ev.fx,a:4};}

/* ---------- drawing ---------- */
function cover(img){var r=Math.max(W/img.naturalWidth,H/img.naturalHeight),w=img.naturalWidth*r,h=img.naturalHeight*r;cx.drawImage(img,(W-w)/2,(H-h)/2,w,h);}
function spr(n,x,yb,h,flip){var i=IMG[n];if(!ok(i))return 0;var w=i.naturalWidth*h/i.naturalHeight;cx.save();if(flip){cx.translate(x,0);cx.scale(-1,1);cx.drawImage(i,-w/2,yb-h,w,h);}else cx.drawImage(i,x-w/2,yb-h,w,h);cx.restore();return w;}
function rect(c,x,y,w,h){cx.fillStyle=c;cx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function setWeatherParts(){
  parts=[];var wk=phase==='open'&&day?day.wk:S.wx,n=0,vy=0,vx=0;
  if(wk==='rain'){n=70;vy=420;vx=-60;}else if(wk==='storm'){n=120;vy=560;vx=-140;}else if(wk==='snow'){n=60;vy=40;vx=10;}
  for(var i=0;i<n;i++)parts.push({x:Math.random()*W,y:Math.random()*H,vy:vy*rnd(0.8,1.2),vx:vx,s:wk==='snow'?rnd(1.5,3):1});
}
function drawHoagie(x,y,s){ /* little pixel hoagie */
  s=s||1;rect('#c98a3d',x-14*s,y-6*s,28*s,8*s);rect('#e2a858',x-13*s,y-8*s,26*s,3*s);
  rect('#d83a3a',x-12*s,y-3*s,24*s,2*s);rect('#ffd34a',x-11*s,y-1*s,22*s,1.5*s);rect('#5aa83a',x-12*s,y+0.5*s,24*s,1.5*s);
}
function drawStand(){
  var x=STANDX,g=GROUND;
  /* sign left of stand */
  if(has('g3')){rect('#5a3a1a',x-150,g-150,4,150);drawHoagie(x-148,g-152,2.4);}
  if(has('g2')){rect('#6b4520',x-120,g-70,46,40);rect('#fff4d6',x-117,g-67,40,34);drawHoagie(x-97,g-48,1.2);rect('#6b4520',x-102,g-30,4,30);}
  else if(has('g1')){rect('#6b4520',x-122,g-52,4,52);rect('#6b4520',x-86,g-52,4,52);rect('#2f3b33',x-120,g-58,36,30);drawHoagie(x-102,g-42,0.9);}
  /* Domino behind the counter */
  var bob=Math.sin(clockT*2)*1.5;
  spr(phase==='open'&&day&&day.serving?'domino_stand':'domino_sit',x,g-28+bob,112);
  if(has('s3')){ /* kiosk */
    rect('#6d3f1c',x-70,g-150,6,150);rect('#6d3f1c',x+64,g-150,6,150);
    for(var i=0;i<7;i++)rect(i%2?'#f4f4f4':'#2e8b57',x-78+i*22.3,g-160,22.3,18);
    rect('#8b5a2b',x-72,g-62,144,62);rect('#a8743d',x-76,g-66,152,8);rect('#6d3f1c',x-60,g-50,120,4);
  }else if(has('s2')){ /* red wagon */
    rect('#c62828',x-66,g-48,132,30);rect('#e53935',x-66,g-48,132,6);rect('#8e1b1b',x-66,g-22,132,4);
    [x-46,x+46].forEach(function(wx){cx.fillStyle='#222';cx.beginPath();cx.arc(wx,g-10,11,0,7);cx.fill();cx.fillStyle='#aaa';cx.beginPath();cx.arc(wx,g-10,4,0,7);cx.fill();});
    rect('#444',x+66,g-40,26,3);
    if(has('s1')){rect('#6d3f1c',x+52,g-150,4,104);for(var j=0;j<5;j++){cx.fillStyle=j%2?'#fff':'#e53935';cx.beginPath();cx.moveTo(x+54,g-160);cx.lineTo(x+54-60+j*24,g-128);cx.lineTo(x+54-36+j*24,g-128);cx.fill();}}
  }else if(has('s1')){ /* card table + umbrella */
    rect('#3c6e8f',x-62,g-50,124,8);rect('#2a4d64',x-56,g-42,4,42);rect('#2a4d64',x+52,g-42,4,42);
    rect('#f0e6c8',x-60,g-42,120,22);
    rect('#6d3f1c',x+40,g-150,4,100);for(var k=0;k<5;k++){cx.fillStyle=k%2?'#fff':'#2e8b57';cx.beginPath();cx.moveTo(x+42,g-162);cx.lineTo(x+42-60+k*24,g-128);cx.lineTo(x+42-36+k*24,g-128);cx.fill();}
  }else{ /* crate */
    rect('#9c6b30',x-48,g-46,96,46);rect('#b9843f',x-48,g-46,96,6);rect('#7a5222',x-48,g-26,96,3);rect('#7a5222',x-48,g-8,96,3);rect('#7a5222',x-44,g-46,4,46);rect('#7a5222',x+40,g-46,4,46);
  }
  /* stock on counter */
  var top=has('s3')?g-66:has('s2')?g-48:has('s1')?g-50:g-46;
  var m=Math.min(6,makeable());for(var q=0;q<m;q++)drawHoagie(x-40+q*13,top-2-(q%2)*5,0.55);
  /* Pickle on the counter */
  var pn=pickleMood===1?'pickle_happy':pickleMood===2?'pickle_grin':'pickle_sit';
  spr(pn,x+44,top+4+(pickleMood===1?-Math.abs(Math.sin(clockT*12))*6:0),68);
  if(hired('grizz'))spr(phase==='open'?'grizz_sit':'grizz_nap',x+128,g+4,phase==='open'?104:70);
  if(hired('rocco'))spr('rocco',x-200,g+2,66);
  if(hired('turbo')){spr('turbo',x+196,g+2,46);spr('biscuit',x+226,g+2,30);}
}
function drawDog(c){
  var s=c.sz*(c.ly<-12?1.0:1.2),x=c.x,y=GROUND+(c.ly||0),b=c.pal,mv=!(c.st==='queue'&&Math.abs(c.dir)<1),leg=mv?Math.sin(c.ph)*3:0,d=c.dir,wag=Math.sin(c.ph*(mv?0.8:1.6))*3;
  cx.save();cx.translate(Math.round(x),y);if(d<0)cx.scale(-1,1);cx.scale(s,s);
  cx.fillStyle='rgba(0,0,0,.25)';cx.beginPath();cx.ellipse(0,0,19,3.5,0,0,6.283);cx.fill();
  /* legs */
  rect(b[1],-13,-13,5,13+leg/2);rect(b[1],8,-13,5,13-leg/2);rect(b[0],-7,-13,5,13-leg/2);rect(b[0],3,-13,5,13+leg/2);
  /* tail */
  cx.strokeStyle=b[1];cx.lineWidth=4;cx.lineCap='round';cx.beginPath();cx.moveTo(-15,-24);cx.quadraticCurveTo(-24,-30,-21+wag,-40);cx.stroke();
  /* body */
  cx.fillStyle=b[0];cx.strokeStyle='#2a1a0a';cx.lineWidth=1.5;
  cx.beginPath();cx.ellipse(0,-21,17,9,0,0,6.283);cx.fill();cx.stroke();
  cx.fillStyle=b[2]||'#f2e6d0';cx.beginPath();cx.ellipse(3,-16,10,4,0,0,6.283);cx.fill();
  /* head */
  cx.fillStyle=b[0];cx.beginPath();cx.ellipse(17,-34,9,8,0,0,6.283);cx.fill();cx.stroke();
  cx.beginPath();cx.ellipse(25,-31,6,4.5,0,0,6.283);cx.fill();cx.stroke();
  rect('#111',29,-34,3,3);
  cx.fillStyle=b[1];cx.beginPath();cx.ellipse(13,-35,3.5,7,0.35,0,6.283);cx.fill();
  rect('#111',19,-37,2.5,2.5);
  rect('#c0392b',13,-28,7,2.5);
  cx.restore();
}
function drawCust(c){
  if(c.vip){var h=c.vip.h*(c.ly<-12?0.85:1);spr(c.vip.img,c.x,GROUND+2+(c.ly||0)+(c.st==='queue'?0:-Math.abs(Math.sin(c.ph*0.5))*2),h,c.dir<0);}
  else drawDog(c);
  if(c.b&&c.bt>0){
    cx.font='bold 12px Tahoma,Verdana,sans-serif';var tw=cx.measureText(c.b).width+10,bx=c.x-tw/2,by=GROUND+(c.ly||0)-(c.vip?c.vip.h:52*c.sz)-24;
    cx.globalAlpha=Math.min(1,c.bt*2);rect('#000',bx-1,by-1,tw+2,18);rect(c.bc,bx,by,tw,16);rect(c.bc,c.x-2,by+16,4,4);
    cx.fillStyle='#000';cx.textAlign='center';cx.fillText(c.b,c.x,by+12);cx.globalAlpha=1;cx.textAlign='left';
  }
}
function comic(t,x,y,size,col,a){cx.save();cx.globalAlpha=clamp(a,0,1);cx.font='bold '+size+'px Impact,"Arial Black",sans-serif';cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='#3a1a00';cx.strokeText(t,x,y);cx.fillStyle=col;cx.fillText(t,x,y);cx.restore();}
function draw(){
  var bg=IMG[LOC[S.loc].bg];
  if(ok(bg))cover(bg);else rect('#4a7a3a',0,0,W,H);
  var wk=phase==='open'&&day?day.wk:S.wx;
  if(wk==='cloudy')rect('rgba(90,100,120,.25)',0,0,W,H);
  if(wk==='rain')rect('rgba(40,60,100,.32)',0,0,W,H);
  if(wk==='storm'){rect('rgba(20,20,50,.45)',0,0,W,H);if(Math.sin(clockT*1.7)>0.995)rect('rgba(255,255,255,.5)',0,0,W,H);}
  if(wk==='snow')rect('rgba(220,230,255,.22)',0,0,W,H);
  if(wk==='hot')rect('rgba(255,170,40,.13)',0,0,W,H);
  rect('rgba(0,0,0,.18)',0,GROUND-4,W,H-GROUND+4);
  custs.forEach(function(c){if(c.ly<-12)drawCust(c);});
  drawStand();
  custs.forEach(function(c){if(!(c.ly<-12))drawCust(c);});
  cx.fillStyle=wk==='snow'?'#fff':'rgba(200,220,255,.7)';
  parts.forEach(function(p){if(wk==='snow'){cx.fillRect(p.x,p.y,p.s,p.s);}else cx.fillRect(p.x,p.y,1,7);});
  floats.forEach(function(f){comic(f.t,f.x,f.y,18,f.c,f.a);});
  sfxTxt.forEach(function(f){comic(f.t,f.x,f.y,26,f.c,f.a);});
  /* top-left status */
  cx.font='bold 13px Tahoma,Verdana,sans-serif';
  if(phase==='open'&&day){
    var p=clamp(day.t/DAYLEN,0,1);rect('#000',8,8,164,14);rect('#ffd84a',10,10,160*p,10);
    cx.fillStyle='#fff';cx.fillText(day.t<DAYLEN?'OPEN':'CLOSING',178,20);
    cx.fillText('Sold '+day.sold+'   Left '+makeable(),8,38);
  }else if(phase==='prep'){
    rect('rgba(0,0,0,.55)',0,H-26,W,26);cx.fillStyle='#fff';cx.fillText('Day '+S.day+' at the '+LOC[S.loc].n+'  \u2022  can make '+makeable()+' hoagies  \u2022  price $'+S.price.toFixed(2),10,H-9);
  }
  if(toastQ&&toastQ.a>0){rect('rgba(0,0,80,.8)',0,0,W,22);cx.fillStyle='#fff';cx.fillText(toastQ.t,8,15);}
  if(phase==='iris'||phase==='report'){
    var r=phase==='report'?0:Math.max(0,1-iris/1.1)*700;
    var px=STANDX+44,py=GROUND-110;
    cx.fillStyle='#000';cx.beginPath();cx.rect(0,0,W,H);cx.arc(px,py,Math.max(r,0.1),0,Math.PI*2,true);cx.fill('evenodd');
    if(r<60){comic('*wink*',px,py-20,22,'#ffd84a',1);}
    if(phase==='report'||iris>1.1)comic('*boof*',W/2,H/2+60,30,'#ffd84a',1);
  }
}

/* ---------- loop: fixed step, frame-rate independent ---------- */
var acc=0,lastT=0,STEP=1/60,running=false;
function frame(ts){
  if(!lastT)lastT=ts;var d=(ts-lastT)/1000;lastT=ts;if(d>0.25)d=0.25;if(d<0)d=0;
  acc+=d*(phase==='open'?S.speed:1);
  var n=0;while(acc>=STEP&&n<40){step(STEP);acc-=STEP;n++;}
  if(n>=40)acc=0;
  if(toastQ){toastQ.a-=d;if(toastQ.a<=0)toastQ=null;}
  draw();hudTick();
  window.requestAnimationFrame(frame);
}
var saveTick=0;
function hudTick(){saveTick++;if(saveTick%300===0)save();if(saveTick%10===0)refreshHud();}

/* ---------- UI ---------- */
var tab='sup';
var TABS=[['sup','Supplies'],['rec','Recipe'],['up','Upgrades'],['loc','Location'],['help','Helpers'],['stats','Report'],['sq','Squeaker']];
function setTab(t){tab=t;renderTabs();renderPanel();}
function renderTabs(){var h='';TABS.forEach(function(t){h+='<button class="tab'+(t[0]===tab?' on':'')+'" data-t="'+t[0]+'">'+t[1]+'</button>';});$('tabs').innerHTML=h;}
function stars(r){var f=Math.round(r);return '\u2605\u2605\u2605\u2605\u2605'.slice(0,f)+'\u2606\u2606\u2606\u2606\u2606'.slice(0,5-f);}
function refreshHud(){
  $('hDay').textContent=S.day;$('hMoney').textContent=money(S.money);$('hRep').textContent=stars(S.rep);
  var wk=phase==='open'&&day?day.wk:S.wx;$('hWx').textContent=WX[wk].i+' '+WX[wk].n+' \u2192 '+WX[S.fore].i;
  $('hSq').textContent=S.sq?'\uD83E\uDDB4 x'+S.sq:'';$('hSqC').style.display=S.sq?'':'none';
}
function refresh(){
  refreshHud();
  var go=$('go');go.disabled=phase!=='prep';go.innerHTML=phase==='open'?'SELLING...':phase==='prep'?'OPEN STAND &#9654;':'DAY DONE';
  $('spd').textContent=S.speed+'x';
  var a=$('auto');a.style.display=has('chalk')?'':'none';a.textContent='AUTO: '+(S.auto?'ON':'OFF');a.className='btn'+(S.auto?' on':'');
  if(phase!=='open')renderPanel();
}
function panelSup(){
  var dis=hired('rocco')?0.8:1,h='<h3>Supplies</h3>';
  if(phase==='open')h+='<div class="note">You can restock mid-day too.</div>';
  ING.forEach(function(g){
    h+='<div class="row"><span class="em">'+g.e+'</span><span class="nm"><b>'+g.n+'</b><small>have <span class="qty">'+S.inv[g.k]+'</span> '+g.u+'s'+(g.k==='roll'?' (go stale overnight)':'')+'</small></span><span>';
    g.packs.forEach(function(p,i){var c=p[1]*dis;h+='<button class="btn sm" data-buy="'+g.k+':'+i+'"'+(S.money<c?' disabled':'')+'>'+p[0]+' $'+c.toFixed(2)+'</button> ';});
    h+='</span></div>';
  });
  h+='<div class="note">Enough for <b>'+makeable()+'</b> hoagies. Each one costs about <b>$'+unitCost().toFixed(2)+'</b>. Expect about <b>'+Math.round(expectTraffic(S.wx))+'</b> passers-by today ('+WX[S.wx].n+').</div>';
  if(has('chalk'))h+='<button class="btn" id="slist">Domino\'s Shopping List (auto-buy for today)</button>';
  else h+='<div class="note">Buy the <b>War Room Chalkboard</b> upgrade to unlock auto-buy and idle mode.</div>';
  return h;
}
function panelRec(){
  var wk=S.wx,id=ideal(wk),h='<h3>Price</h3>';
  h+='<div class="row"><span class="nm"><b>Price per hoagie</b><small>Cost to make: $'+unitCost().toFixed(2)+'</small></span><span class="step"><button class="btn sm" data-pr="-0.25">&minus;</button><b>$'+S.price.toFixed(2)+'</b><button class="btn sm" data-pr="0.25">+</button></span></div>';
  h+='<h3 style="margin-top:8px">Recipe (per hoagie)</h3>';
  REC.forEach(function(r){h+='<div class="row"><span class="nm"><b>'+r.n+'</b></span><span class="step"><button class="btn sm" data-rc="'+r.k+':-1">&minus;</button><b>'+S.rec[r.k]+'</b><button class="btn sm" data-rc="'+r.k+':1">+</button></span></div>';});
  var t=taste(wk);
  h+='<div class="chalk">War room chalkboard<br>Today: '+WX[wk].i+' '+WX[wk].n+' \u2022 Tomorrow: '+WX[S.fore].i+' '+WX[S.fore].n+'<br>Taste score: '+Math.round(Math.min(1,t)*100)+'%'+(t>0.95?' \u2714':'')+'<br>'+chalkHint(wk,id)+'</div>';
  h+='<div class="note">Every hoagie is a hoagie. Hot days want lighter, pickle-heavy hoagies. Cold days want more meat.</div>';
  return h;
}
function chalkHint(wk,id){
  var o=[];REC.forEach(function(r){var d=id[r.k]-S.rec[r.k];if(d>0)o.push('more '+r.n.toLowerCase());if(d<0)o.push('less '+r.n.toLowerCase());});
  return o.length?'Hint: '+o.join(', '):'Recipe looks perfect for today.';
}
function upRow(u){
  var own=has(u.id),lock=u.req&&!has(u.req);
  return '<div class="row"><span class="nm"><b>'+u.n+'</b><small>'+u.d+'</small></span>'+(own?'<span class="qty pos">OWNED</span>':lock?'<span class="qty" style="color:#666">LOCKED</span>':'<button class="btn sm" data-up="'+u.id+'"'+(S.money<u.c?' disabled':'')+'>$'+u.c+'</button>')+'</div>';
}
function panelUp(){var h='',g='';UPS.forEach(function(u){if(u.g!==g){g=u.g;h+='<h3'+(h?' style="margin-top:8px"':'')+'>'+g+'</h3>';}h+=upRow(u);});return h;}
function panelLoc(){
  var h='<h3>Location</h3>';
  LOC.forEach(function(l,i){
    var here=S.loc===i,owned=(S.locs||{})[i]||i===0;
    h+='<div class="row"><img src="img/'+l.bg+'.jpg" alt=""><span class="nm"><b>'+l.n+'</b><small>'+l.d+'<br>Foot traffic '+l.tr+' \u2022 rent $'+l.rent+'/day</small></span>'+
     (here?'<span class="qty pos">HERE</span>':owned?'<button class="btn sm" data-mv="'+i+'">Move</button>':'<button class="btn sm" data-loc="'+i+'"'+(S.money<l.cost||(i>0&&!((S.locs||{})[i-1]||i-1===0))?' disabled':'')+'>$'+l.cost+'</button>')+'</div>';
  });
  if(phase==='open')h+='<div class="note">You can move once the day is done.</div>';
  return h;
}
function panelHelp(){
  var h='<h3>Helpers</h3>';
  HELP.forEach(function(x){var c=x.id==='grizz'&&S.grizzDeal?Math.round(x.c/2):x.c;
    h+='<div class="row"><img src="img/'+x.img+'.png" alt=""><span class="nm"><b>'+x.n+'</b><small>'+x.d+' Wage $'+x.w+'/day.</small></span>'+
    (hired(x.id)?'<button class="btn sm" data-fire="'+x.id+'">Let go</button>':'<button class="btn sm" data-hire="'+x.id+'"'+(S.money<c?' disabled':'')+'>Hire $'+c+'</button>')+'</div>';});
  h+='<div class="note">Helpers also raise offline earnings. Domino runs the plan. Pickle is in charge of chaos and is not for hire.</div>';
  return h;
}
function panelStats(){
  var h='<h3>Daily report</h3><table class="rep"><tr><th>Day</th><th>Wx</th><th>Sold</th><th>Sales</th><th>Profit</th></tr>';
  S.hist.slice(-8).reverse().forEach(function(r){h+='<tr><td>'+r.d+'</td><td>'+WX[r.wx].i+'</td><td>'+r.sold+'</td><td>$'+money(r.rev)+'</td><td class="'+(r.profit>=0?'pos':'neg')+'">$'+money(r.profit)+'</td></tr>';});
  if(!S.hist.length)h+='<tr><td colspan="5">No days yet. Open the stand!</td></tr>';
  h+='</table><div class="note">Lifetime sales <b>$'+money(S.life)+'</b> \u2022 best day <b>$'+money(S.best)+'</b> \u2022 crumb trails followed <b>'+S.crumbs+'</b></div>';
  h+='<a class="btn" target="_blank" rel="noopener" href="'+shareURL()+'">Share my stand on X</a> ';
  h+='<button class="btn" id="howto">How to Play</button>';
  return h;
}
function sqGain(){return Math.max(0,Math.floor(Math.sqrt(S.lifeAll/5000))-S.sq);}
function panelSq(){
  var g=sqGain();
  var h='<h3>The Golden Squeaker</h3><img class="pic" style="display:block;margin:0 auto 6px;max-width:100%;max-height:120px" src="img/squeaker.jpg" alt="">';
  h+='<p>Hide the till in the couch crack and start a brand-new stand. Every Golden Squeaker gives <b>+10% customers forever</b>.</p>';
  h+='<div class="note">Squeakers: <b>'+S.sq+'</b> \u2022 all-time sales $'+money(S.lifeAll)+'<br>Ready to claim: <b>'+g+'</b> (the first comes at $5,000 all-time)</div>';
  h+='<button class="btn" id="prest"'+(g<1||phase==='open'?' disabled':'')+'>Start over with +'+g+' Squeaker'+(g===1?'':'s')+'</button>';
  return h;
}
function renderPanel(){
  var f={sup:panelSup,rec:panelRec,up:panelUp,loc:panelLoc,help:panelHelp,stats:panelStats,sq:panelSq}[tab];
  var p=$('panel'),st=p.scrollTop;p.innerHTML=f();p.scrollTop=st;
}
function buy(k,i){
  var g=ING.filter(function(x){return x.k===k;})[0],p=g.packs[i],c=p[1]*(hired('rocco')?0.8:1);
  if(S.money+1e-9<c)return false;S.money-=c;S.inv[k]+=p[0];
  if(phase==='open'&&day)day.spent+=c;else S.spent=(S.spent||0)+c;
  return true;
}
function shoppingList(silent){
  var exp=Math.min(Math.round(expectTraffic(S.wx)*0.9*(S.today&&S.today.trM||1)),capacity());
  var need={roll:exp-S.inv.roll};REC.forEach(function(r){need[r.k]=exp*S.rec[r.k]-S.inv[r.k];});
  var guard=0,bought=0;
  ['roll','meat','cheese','pep','pick'].forEach(function(k){
    var g=ING.filter(function(x){return x.k===k;})[0];
    while(need[k]>0&&guard++<200){
      var i=g.packs.length-1;while(i>0&&g.packs[i][0]>need[k]*1.15)i--;
      if(!buy(k,i)){if(i>0&&buy(k,0)){need[k]-=g.packs[0][0];bought++;continue;}break;}
      need[k]-=g.packs[i][0];bought++;
    }
  });
  if(!silent){SFX.buy();refresh();}
  return bought;
}
function shareURL(){
  var last=S.hist.length?S.hist[S.hist.length-1]:null;
  var t='Domino and Pickle\'s hoagie stand is open in Pawsington Falls.';
  if(last)t='My Domino and Pickle hoagie stand made $'+money(S.life)+' by Day '+S.day+(S.crumbs?', and the crumb trail led to Pickle\'s bed '+S.crumbs+(S.crumbs===1?' time':' times'):'')+'.';
  t+='\n\nPlay free: '+URL_GAME+'\n\nSee you in another timeline.';
  return 'https://x.com/intent/post?text='+encodeURIComponent(t);
}
function msg(title,body,btns){
  $('dT').textContent=title;$('dB').innerHTML=body;var b=$('dBtns');b.innerHTML='';
  (btns||[['OK',closeDlg]]).forEach(function(x){var e=document.createElement('button');e.className='btn';e.textContent=x[0];e.addEventListener('click',x[1]);b.appendChild(e);});
  $('ovl').className='ovl show';
}
function closeDlg(){$('ovl').className='ovl';}
function showReport(){
  var r=day.rec;SFX.boof();
  var b='<img class="pic" src="img/domino_head.png" alt=""><table class="rep">'+
   '<tr><td>Hoagies sold</td><td>'+r.sold+'</td></tr><tr><td>Sales</td><td>$'+money(r.rev)+'</td></tr>'+
   '<tr><td>Supplies bought</td><td>-$'+money(r.spent)+'</td></tr>'+(r.rent?'<tr><td>Rent</td><td>-$'+money(r.rent)+'</td></tr>':'')+(r.wage?'<tr><td>Helper wages</td><td>-$'+money(r.wage)+'</td></tr>':'')+
   '<tr><th>Profit</th><th class="'+(r.profit>=0?'pos':'neg')+'">$'+money(r.profit)+'</th></tr></table>';
  var lost=[];if(r.lp)lost.push(r.lp+' said too pricey');if(r.ls)lost.push(r.ls+' found you sold out');if(r.ll)lost.push(r.ll+' skipped the line');
  b+='<div class="note">'+(lost.length?'Missed: '+lost.join(', ')+'.':'Nobody walked away!')+(r.toss?' '+r.toss+' stale rolls went to the birds.':'')+' Reputation '+(r.rep>=0?'+':'')+r.rep.toFixed(2)+'.'+(r.bail?' Domino found $10 in the couch crack to keep you going.':'')+'</div>';
  if(S.auto&&has('chalk'))b+='<div style="font-size:11px">AUTO is on: next day starts by itself.</div>';
  msg('Day '+r.d+' report: '+WX[r.wx].i+' '+WX[r.wx].n,b,[['Next Day \u25B6',function(){closeDlg();nextDay();}]]);
}
function howTo(){
  msg('How to Play','<p><b>1.</b> Buy rolls, meat, cheese, peppers and pickles in <b>Supplies</b>.<br><b>2.</b> Set your <b>Price</b> and <b>Recipe</b>, and check the weather on the chalkboard.<br><b>3.</b> Press <b>OPEN STAND</b>. Customers decide on price and taste.<br><b>4.</b> Rolls go stale overnight, so don\'t overbuy.<br><b>5.</b> Spend profits on upgrades, helpers and better locations.<br><b>6.</b> The War Room Chalkboard unlocks <b>AUTO</b>: the stand runs itself, and earns while you are away.<br><b>7.</b> At $5,000 all-time, claim a <b>Golden Squeaker</b> and start over stronger.</p>');
}

/* ---------- offline earnings ---------- */
var awaySecs=0;
function offline(){
  if(!S.started||S.hist.length<1)return;
  var secs=awaySecs;awaySecs=0;if(secs<60)return;
  var cap=(has('nest')?8:2)*3600,used=Math.min(secs,cap);
  var recent=S.hist.slice(-5),avg=0;recent.forEach(function(r){avg+=Math.max(0,r.profit);});avg/=recent.length;
  var eff=0.1+0.05*Object.keys(S.hire).filter(function(k){return S.hire[k];}).length+(S.auto&&has('chalk')?0.1:0)+(has('wagon2')?0.2:0);
  var perSec=avg/(DAYLEN+8),earn=Math.round(perSec*used*eff*100)/100;
  if(earn<0.01)return;
  S.money+=earn;S.life+=earn;S.lifeAll+=earn;save();
  var hrs=Math.floor(used/3600),mins=Math.floor(used%3600/60);
  msg('While you were away','<img class="pic" src="img/grizz_nap.png" alt=""><p>You were gone <b>'+(hrs?hrs+'h ':'')+mins+'m</b>'+(secs>cap?' (the stash box holds '+(cap/3600)+'h)':'')+'. The crew kept the stand going at '+Math.round(eff*100)+'% speed.</p><div class="sfx">+$'+money(earn)+'</div>',[['Collect',function(){SFX.fan();closeDlg();refresh();}]]);
}

/* ---------- input ---------- */
function onPanel(e){
  var t=e.target;while(t&&t!==this&&!t.getAttribute('data-buy')&&!t.getAttribute('data-pr')&&!t.getAttribute('data-rc')&&!t.getAttribute('data-up')&&!t.getAttribute('data-loc')&&!t.getAttribute('data-mv')&&!t.getAttribute('data-hire')&&!t.getAttribute('data-fire')&&!t.id)t=t.parentNode;
  if(!t||t===this||t.disabled)return;
  var a;
  if((a=t.getAttribute('data-buy'))){var p=a.split(':');if(buy(p[0],+p[1]))SFX.buy();}
  else if((a=t.getAttribute('data-pr'))){S.price=clamp(Math.round((S.price+parseFloat(a))*100)/100,0.25,25);}
  else if((a=t.getAttribute('data-rc'))){var q=a.split(':'),r=REC.filter(function(x){return x.k===q[0];})[0];S.rec[q[0]]=clamp(S.rec[q[0]]+(+q[1]),r.min,r.max);if(day&&phase==='open')day.tst=taste(day.wk);}
  else if((a=t.getAttribute('data-up'))){var u=UPS.filter(function(x){return x.id===a;})[0];if(S.money>=u.c&&!has(u.id)){S.money-=u.c;S.up[u.id]=1;SFX.fan();}}
  else if((a=t.getAttribute('data-loc'))){var i=+a,l=LOC[i];if(phase!=='open'&&S.money>=l.cost){S.money-=l.cost;S.locs=S.locs||{};S.locs[i]=1;S.loc=i;SFX.fan();}}
  else if((a=t.getAttribute('data-mv'))){if(phase!=='open')S.loc=+a;}
  else if((a=t.getAttribute('data-hire'))){var h=HELP.filter(function(x){return x.id===a;})[0],c=a==='grizz'&&S.grizzDeal?Math.round(h.c/2):h.c;if(S.money>=c){S.money-=c;S.hire[a]=1;SFX.fan();}}
  else if((a=t.getAttribute('data-fire'))){delete S.hire[a];}
  else if(t.id==='slist'){shoppingList(false);}
  else if(t.id==='howto'){howTo();}
  else if(t.id==='prest'){prestige();}
  save();refreshHud();renderPanel();refresh();
}
function prestige(){
  var g=sqGain();if(g<1)return;
  msg('Claim the Golden Squeaker?','<img class="pic" src="img/squeaker.jpg" alt=""><p>Your money, stock, upgrades, helpers and locations reset. You keep <b>'+(S.sq+g)+' Golden Squeaker'+(S.sq+g===1?'':'s')+'</b>: +'+((S.sq+g)*10)+'% customers forever.</p>',
   [['Claim it',function(){var n=fresh(S.sq+g,S.lifeAll);n.started=true;n.speed=S.speed;S=n;phase='prep';day=null;custs=[];save();closeDlg();SFX.fan();refresh();renderPanel();}],['Not yet',closeDlg]]);
}

var started=false;
function begin(e){
  if(started)return;started=true;
  if(e&&e.preventDefault&&e.type==='touchstart')e.preventDefault();
  $('start').className='hide';
  if(!S.started&&!S.hist.length)howTo();else offline();
}
function init(){
  S=load()||fresh();
  awaySecs=Math.max(0,(Date.now()-(S.last||Date.now()))/1000);
  if(!S.wx||!WX[S.wx])S.wx='sunny';if(!WX[S.fore])S.fore='sunny';
  phase='prep';S.today=S.today||{};
  setWeatherParts();renderTabs();refresh();renderPanel();
  $('tabs').addEventListener('click',function(e){var t=e.target.getAttribute('data-t');if(t)setTab(t);});
  $('panel').addEventListener('click',onPanel);
  $('go').addEventListener('click',function(){openStand();renderPanel();});
  $('spd').addEventListener('click',function(){S.speed=S.speed===1?2:S.speed===2?4:1;refresh();});
  $('auto').addEventListener('click',function(){S.auto=!S.auto;autoT=0;save();refresh();});
  $('snd').addEventListener('click',function(){soundOn=!soundOn;$('snd').innerHTML=soundOn?'&#128264;':'&#128263;';if(soundOn)SFX.ding();});
  if($('mNew'))$('mNew').addEventListener('click',function(){msg('New Game?','<p>Start over from Day 1? Golden Squeakers are kept.</p>',[['Start over',function(){var n=fresh(S.sq,S.lifeAll);S=n;phase='prep';day=null;custs=[];save();closeDlg();refresh();renderPanel();}],['Cancel',closeDlg]]);});
  if($('mHelp'))$('mHelp').addEventListener('click',howTo);
  if($('mShare'))$('mShare').addEventListener('click',function(){window.open(shareURL(),'_blank');});
  var st=$('start');
  ['pointerdown','touchstart','mousedown','keydown'].forEach(function(ev){(ev==='keydown'?document:st).addEventListener(ev,begin,ev==='touchstart'?{passive:false}:false);});
  document.addEventListener('visibilitychange',function(){if(document.hidden)save();});
  window.addEventListener('pagehide',save);
  window.requestAnimationFrame(frame);
  window.__hoagie={S:function(){return S;},phase:function(){return phase;},open:openStand,next:function(){closeDlg();nextDay();},list:shoppingList,ff:function(){if(day)day.t=DAYLEN+9;},save:save};
}
init();
})();
