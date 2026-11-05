/* Red Horizon Tycoon — a 2000s-PC-style park tycoon on Mars (Aetheria, Echoes of the Red Horizon, Season 1 places & creatures).
   Plain ES2015-ish, no build step. Canvas + Windows-98 style HTML chrome. */
(function(){
'use strict';
var DEMO=!!window.RHT_DEMO, PROMO=/[?&]promo=1/.test(location.search);
// ---------- safe storage ----------
var store=(function(){var mem={},has=false;try{var k='__rht';window.localStorage.setItem(k,'1');window.localStorage.removeItem(k);has=true;}catch(e){has=false;}
 return{persistent:has,get:function(k){try{return has?window.localStorage.getItem(k):(mem.hasOwnProperty(k)?mem[k]:null);}catch(e){return mem.hasOwnProperty(k)?mem[k]:null;}},
 set:function(k,v){try{if(has)window.localStorage.setItem(k,v);else mem[k]=v;return true;}catch(e){mem[k]=v;return false;}},
 del:function(k){try{if(has)window.localStorage.removeItem(k);delete mem[k];}catch(e){}}};})();

// ---------- constants & utils ----------
var W=64,H=64,N=W*H,TW=32,TH=16,HU=5,DAY=60,MDAYS=16,YMONTHS=8,TPS=20;
function idx(x,y){return y*W+x;}
function inb(x,y){return x>=0&&y>=0&&x<W&&y<H;}
function rnd(a,b){return a+Math.random()*(b-a);}
function ri(a,b){return Math.floor(rnd(a,b+1));}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function fmt(v){var s=Math.round(Math.abs(v)).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');return (v<0?'-$':'$')+s;}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
var D4=[[1,0],[-1,0],[0,1],[0,-1]];

// ---------- content (Season 1 places / creatures; park buildings are game dressing) ----------
var DEFS=[
 // rides
 {id:'swing',n:'Low-G Sky Swing',k:'ride',cat:'rides',w:3,h:3,c:3500,up:70,pw:-3,p:3,ex:5.2,in:4.1,na:3.0,dur:300,cap:16,out:1,col:'#e0703a',b:'Chairs on long chains swing way out. Mars gravity does the rest.'},
 {id:'bumper',n:'Rover Bumper Cars',k:'ride',cat:'rides',w:3,h:3,c:2800,up:55,pw:-2,p:2,ex:4.0,in:2.2,na:1.2,dur:280,cap:10,col:'#3fa7d6',b:'Little rovers built from wreck wheels. Bonk your friends.'},
 {id:'spinner',n:'Dust Devil Spinner',k:'ride',cat:'rides',w:2,h:2,c:2400,up:45,pw:-2,p:2,ex:4.6,in:5.6,na:5.9,dur:240,cap:8,col:'#d9a441',b:'Spinning cups in a whirl of red dust. Not after tacos.'},
 {id:'wheel',n:'Olympus Wheel',k:'ride',cat:'rides',w:2,h:2,c:2600,up:40,pw:-2,p:2,ex:3.8,in:0.9,na:0.6,dur:360,cap:12,out:1,col:'#f2d24a',b:'A big gentle wheel. On a clear sol you can see the Fringe.'},
 {id:'thunder',n:'Thunderbug Track',k:'ride',cat:'rides',w:3,h:3,c:4800,up:85,pw:-4,p:4,ex:6.1,in:4.8,na:2.4,dur:320,cap:8,col:'#f0d24a',b:'Race little Thunderbug runners round a scrap circuit. Loud.'},
 {id:'glider',n:'Ridge Glider Launch',k:'ride',cat:'rides',w:2,h:2,c:3200,up:60,pw:-2,p:3,ex:5.8,in:3.8,na:2.0,dur:300,cap:4,out:1,col:'#7fd1e8',b:'Off the tower, out over the park. The best view on Mars.'},
 {id:'cavern',n:'Crystal Cavern Tour',k:'ride',cat:'rides',w:2,h:2,c:3800,up:55,pw:-2,p:3,ex:5.0,in:1.2,na:0.5,dur:380,cap:10,shel:1,col:'#8fe3ff',b:'Down into humming crystal. Sheltered from dust storms.'},
 {id:'stage',n:'Festival Dawn Stage',k:'ride',cat:'rides',w:2,h:2,c:1800,up:40,pw:-2,p:1,ex:3.2,in:0.3,na:0.1,dur:420,cap:20,col:'#d07ae0',b:'Music every night, Fringe style. We ride messy, we ride free.'},
 {id:'station',n:'Coaster Station',k:'coaster',cat:'coaster',w:1,h:1,c:800,up:90,pw:-3,p:4,ex:0,in:0,na:0,dur:400,cap:12,out:1,col:'#c43c3c',b:'Start of a roller coaster. Lay track from both sides and close the loop.'},
 // zoo
 {id:'pen_glow',n:'Glowhound Run',k:'exhibit',cat:'zoo',w:3,h:3,c:2200,up:60,pw:0,p:1,ex:4.4,in:0.4,na:0,dur:140,cap:24,an:'glow',cnt:4,col:'#5b8f3a',b:'Glowhounds: fur shifts color with mood. Teal means joy.'},
 {id:'pen_puff',n:'Shadowpuff Grove',k:'exhibit',cat:'zoo',w:3,h:3,c:2000,up:55,pw:0,p:1,ex:4.0,in:0.3,na:0,dur:140,cap:24,an:'puff',cnt:5,col:'#4a3c5c',b:'Shadowpuffs phase in and out of sight in glowing smoke.'},
 {id:'pen_flit',n:'Aero-flit Aviary',k:'exhibit',cat:'zoo',w:3,h:3,c:2600,up:60,pw:0,p:1,ex:4.8,in:0.5,na:0,dur:140,cap:24,an:'flit',cnt:7,col:'#5a4a3a',b:'Living fireworks. They spark and smell like ozone.'},
 {id:'pen_herd',n:'Machine-Herd Range',k:'exhibit',cat:'zoo',w:4,h:4,c:3400,up:75,pw:0,p:2,ex:5.2,in:0.6,na:0,dur:160,cap:30,an:'herd',cnt:4,col:'#7a6a4a',b:'Wild machine herds from the plains. Antlers of salvage.'},
 {id:'pen_lumos',n:'Lumos-kin Sanctuary',k:'exhibit',cat:'zoo',w:2,h:2,c:2400,up:55,pw:0,p:2,ex:5.0,in:0.2,na:0,dur:140,cap:18,an:'lumos',cnt:5,col:'#3c4a6a',b:'Little light creatures like Lumos. Keep them fed and they glow.'},
 // aquarium (needs polar ice nearby)
 {id:'aq_vore',n:'Aquavore Springs Dome',k:'exhibit',cat:'aqua',w:3,h:3,c:4200,up:80,pw:-2,p:2,ex:5.4,in:0.5,na:0,dur:160,cap:24,an:'vore',cnt:4,ice:1,shel:1,col:'#2b8fb3',b:'Gill-mech sentinels of the springs and jelly pools.'},
 {id:'aq_abyss',n:'Abyssal Deep Dome',k:'exhibit',cat:'aqua',w:3,h:3,c:5200,up:95,pw:-3,p:3,ex:6.2,in:1.5,na:0,dur:180,cap:24,an:'abyss',cnt:2,ice:1,shel:1,col:'#1a3f6b',b:'Deep rumblers in carapace plates. They grumble. Loudly.'},
 {id:'aq_jelly',n:'Aqua-Jelly Pool',k:'exhibit',cat:'aqua',w:2,h:2,c:2600,up:45,pw:-1,p:1,ex:4.2,in:0.2,na:0,dur:140,cap:18,an:'jelly',cnt:6,ice:1,shel:1,col:'#3fb3c9',b:'Glowing jelly pools guarded from the ice melt.'},
 {id:'aq_tidal',n:'Bay Beast Tank',k:'exhibit',cat:'aqua',w:3,h:3,c:5600,up:100,pw:-3,p:3,ex:6.6,in:1.0,na:0,dur:180,cap:24,an:'tidal',cnt:1,ice:1,shel:1,col:'#245c8f',b:'A Tidal, like Harlan\u2019s Bay Beast. Huge, curious, windy.'},
 // city
 {id:'hab',n:'Habitat Pods',k:'city',cat:'city',w:2,h:2,c:2500,up:30,pw:-2,o2:-1,rent:150,res:25,col:'#d8d2c4',b:'Settlers live here. Pays rent and brings locals to the park.'},
 {id:'vent',n:'Geothermal Vent',k:'city',cat:'city',w:2,h:2,c:2000,up:40,pw:12,col:'#7a4a33',b:'Taps the heat under the Fringe. +12 power.'},
 {id:'green',n:'Crystaberry Greenhouse',k:'city',cat:'city',w:2,h:2,c:1500,up:30,pw:-1,o2:8,col:'#5fbf8a',b:'Grows crystaberries and breathes for the park. +8 oxygen.'},
 {id:'mush',n:'Tunnel-Mush Farm',k:'city',cat:'city',w:1,h:1,c:500,up:10,pw:0,o2:3,col:'#9a7bb8',b:'Cheap air. Mush loves the dark. +3 oxygen.'},
 {id:'shelter',n:'Storm Shelter Dome',k:'city',cat:'city',w:2,h:2,c:1200,up:15,pw:-1,rad:4,col:'#e8a060',b:'Guests within 4 tiles shrug off dust storms.'},
 {id:'watch',n:'Fringe Watch Post',k:'city',cat:'city',w:1,h:1,c:900,up:35,pw:-1,rad:7,col:'#5a7ab8',b:'Stops Vex\u2019s Nullifiers within 7 tiles.'},
 // shops
 {id:'tacos',n:'Sunny\u2019s Void-Nectar Tacos',k:'shop',cat:'shops',w:1,h:1,c:450,up:25,pw:-1,p:4,fair:4,sell:'food',amt:70,col:'#f2b84b',sign:'T',b:'Sunny\u2019s famous. Everybody lines up.'},
 {id:'stew',n:'Tunnel Stew Pot',k:'shop',cat:'shops',w:1,h:1,c:350,up:20,pw:-1,p:3,fair:3,sell:'food',amt:55,col:'#c46a3a',sign:'S',b:'Geothermal Tunnel Stew. Warm and filling.'},
 {id:'chews',n:'Crystaberry Chews',k:'shop',cat:'shops',w:1,h:1,c:300,up:15,pw:0,p:2,fair:2,sell:'food',amt:30,col:'#e45a8c',sign:'C',b:'Snack cart. Little color-shift in the eyes.'},
 {id:'brew',n:'Void-Nectar Brew',k:'shop',cat:'shops',w:1,h:1,c:350,up:18,pw:-1,p:2,fair:2,sell:'drink',amt:60,col:'#8a5ad0',sign:'B',b:'A kick without the synth-caffeine crash.'},
 {id:'water',n:'Ice-Melt Water',k:'shop',cat:'shops',w:1,h:1,c:250,up:10,pw:0,p:1,fair:1,sell:'drink',amt:50,col:'#5ab8e0',sign:'W',b:'Polar ice, melted and cold.'},
 {id:'harlan',n:'Harlan\u2019s Trinkets',k:'shop',cat:'shops',w:1,h:1,c:500,up:25,pw:0,p:5,fair:5,sell:'souv',amt:0,col:'#b08a5a',sign:'H',b:'Scrap, trinkets and stories. Souvenirs make guests happy.'},
 {id:'kiosk',n:'Info & Dust Masks',k:'shop',cat:'shops',w:1,h:1,c:400,up:20,pw:0,p:3,fair:3,sell:'mask',amt:0,col:'#d0d0d0',sign:'i',b:'Maps and dust masks. Guests buy masks when a storm hits.'},
 {id:'wc',n:'Recycler Restroom',k:'shop',cat:'shops',w:1,h:1,c:400,up:20,pw:-1,p:0,fair:0,sell:'wc',amt:0,col:'#9aa6b0',sign:'WC',b:'Everybody has to go sometime.'},
 // scenery
 {id:'vines',n:'Red Vines',k:'scen',cat:'scen',w:1,h:1,c:40,up:0,beauty:2,col:'#3f8f5a',b:'Pretty. Guests nearby are happier.'},
 {id:'lantern',n:'Spark Lantern',k:'scen',cat:'scen',w:1,h:1,c:70,up:1,beauty:3,col:'#ffb347',b:'Warm light through the dust.'},
 {id:'crystal',n:'Crystal Cluster',k:'scen',cat:'scen',w:1,h:1,c:120,up:0,beauty:4,col:'#8fe3ff',b:'Hums faintly at 47.2 Hz.'},
 {id:'flyer',n:'Wright Flyer Statue',k:'scen',cat:'scen',w:1,h:1,c:150,up:0,beauty:5,col:'#c9c2b0',b:'A little biplane on a pedestal, like Aria\u2019s pendant.'},
 {id:'banner',n:'Festival Banner',k:'scen',cat:'scen',w:1,h:1,c:50,up:0,beauty:2,col:'#ff5a5a',b:'Festival colors on a pole.'},
 {id:'bench',n:'Bench',k:'scen',cat:'scen',w:1,h:1,c:60,up:0,beauty:1,seat:1,col:'#8a5a3a',b:'Tired guests sit and rest here (next to a path).'},
 {id:'bin',n:'Litter Bin',k:'scen',cat:'scen',w:1,h:1,c:45,up:0,beauty:0,bin:1,col:'#6a7a6a',b:'Guests drop wrappers here instead of on the path (3 tiles).'}
];
var DEF={};DEFS.forEach(function(d){DEF[d.id]=d;});
var CATS=[['rides','Rides'],['coaster','Coaster'],['zoo','Zoo'],['aqua','Aquarium'],['city','Colony'],['shops','Shops'],['scen','Scenery'],['land','Paths']];
var STAFF={
 handy:{n:'Scavenger (handyman)',w:50,col:'#3cb043',b:'Sweeps litter and sick off the paths.'},
 mech:{n:'Mechanic',w:80,col:'#3a6fd8',b:'Fixes broken rides.'},
 keeper:{n:'Creature Keeper',w:70,col:'#b08a3a',b:'Feeds zoo and aquarium creatures.'},
 ent:{n:'Lumos Costume Entertainer',w:55,col:'#ffd84a',b:'Wanders and cheers guests up.'},
 guard:{n:'Fringe Watch Guard',w:75,col:'#26306a',b:'Scares off Vex\u2019s Nullifiers nearby.'}
};
var COASTER_NAMES=['Red Horizon Racer','Chasm Screamer','Olympus Drop','Dust Devil Express','Veil Runner','Helix Diver','Ridge Rattler','Spark Streak'];
var NAMES=['Ada','Bo','Cass','Dax','Eli','Fen','Gia','Hal','Ivo','Juno','Kai','Lio','Mara','Nix','Oz','Pia','Quin','Rae','Sol','Tamsin','Ula','Vik','Wren','Xan','Yara','Zed','Odo','Mina','Tove','Remy','Bram','Cleo','Dara','Esme','Faro','Gus','Hira','Ines','Jory','Kit'];
var SNAMES=['Voss','Reyes','Okafor','Lind','Moreau','Tanaka','Quill','Barros','Hale','Ivers','Nakamura','Pryce','Sato','Varga','Wells','Ortiz','Kade','Rook'];
var SCEN=[
 {id:'fringe',n:'Elysium Fringe Fair',money:10000,loan:10000,maxLoan:30000,fee:8,seed:7,ice:1,storms:1,vex:1,
  goal:{guests:250,rating:600,years:2},
  b:'Lena wants the Fringe to have a real festival park. Have 250 guests in the park and a park rating of at least 600 by the end of Year 2.'},
 {id:'polar',n:'Polar Ice Shelf',money:15000,loan:10000,maxLoan:40000,fee:10,seed:21,ice:3,storms:1,vex:0.7,
  goal:{guests:350,exhibits:6,years:3},
  b:'Sira hung her polar gear up for good. Build a zoo and aquarium park on the ice: 6 creature exhibits and 350 guests by the end of Year 3.'},
 {id:'chasm',n:'Whispering Chasm Thrills',money:12000,loan:15000,maxLoan:40000,fee:10,seed:99,ice:1,storms:2,vex:1.6,rocks:2,
  goal:{coaster:6.5,value:40000,years:2},
  b:'Chasm storms, rocky ground and Vex\u2019s Nullifiers sneaking around. Build a coaster with excitement 6.5+ and a company value of $40,000 by the end of Year 2.'},
 {id:'sandbox',n:'Open Regolith (Sandbox)',money:250000,loan:0,maxLoan:0,fee:10,seed:3,ice:2,storms:1,vex:0.5,goal:null,
  b:'No goals and $250,000. Build the Mars park you always wanted.'}
];
var SCN={};SCEN.forEach(function(s){SCN[s.id]=s;});
var EX=W>>1, EY=H-1; // park entrance (on the bottom-left edge)

// ---------- state ----------
var S=null;
function blankFin(){return{adm:0,ride:0,food:0,shop:0,rent:0,build:0,upkeep:0,wages:0,interest:0};}
function newState(sid){
 var sc=SCN[sid]||SCEN[0];
 var s={v:1,scen:sc.id,money:sc.money,loan:sc.loan,maxLoan:sc.maxLoan,day:0,tick:0,rating:500,fee:sc.fee,open:true,
  terr:new Array(N),path:new Array(N),litter:new Array(N),occ:new Array(N),trk:new Array(N),
  objs:{},nid:1,guests:[],staff:[],gid:1,fin:{cur:blankFin(),hist:[]},msgs:[],storm:0,vexN:0,won:false,lost:false,
  totalGuests:0,turned:0,pathVer:1,coasterN:0,park:'Elysium Fringe Park'};
 for(var i=0;i<N;i++){s.path[i]=0;s.litter[i]=0;s.occ[i]=0;s.trk[i]=-1;}
 genMap(s,sc);
 return s;
}
function genMap(s,sc){
 var r=mulberry(sc.seed*977+13);
 // smooth value noise
 var G=9,g=[];for(var a=0;a<(G+1)*(G+1);a++)g.push(r());
 function noise(x,y){var fx=x/W*G,fy=y/H*G,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy;
  function v(i,j){return g[clamp(j,0,G)*(G+1)+clamp(i,0,G)];}
  var a1=v(ix,iy)*(1-tx)+v(ix+1,iy)*tx,a2=v(ix,iy+1)*(1-tx)+v(ix+1,iy+1)*tx;return a1*(1-ty)+a2*ty;}
 var x,y,i;
 for(y=0;y<H;y++)for(x=0;x<W;x++){var n=noise(x,y)+r()*0.12;s.terr[idx(x,y)]=n<0.42?0:(n<0.68?1:2);}
 function blob(cx,cy,rx,ry,t,rough){for(y=Math.floor(cy-ry-1);y<=cy+ry+1;y++)for(x=Math.floor(cx-rx-1);x<=cx+rx+1;x++){if(!inb(x,y))continue;
  var d=Math.pow((x-cx)/rx,2)+Math.pow((y-cy)/ry,2);if(d<1-(rough?r()*0.35:0))s.terr[idx(x,y)]=t;}}
 // craters: dark rim (2), floor (3)
 for(var c=0;c<9;c++){var cx=r()*W,cy=r()*(H-14),cr=2+r()*3.5;blob(cx,cy,cr+1,cr+1,1,false);blob(cx,cy,cr,cr,3,false);}
 // polar ice toward the top of the map
 for(c=0;c<3+sc.ice*3;c++){blob(4+r()*(W-8),r()*H*0.45,2+r()*4,2+r()*3,5,true);}
 // ridges & boulders (obstacles you can clear)
 var nr=(sc.rocks||1)*7;
 for(c=0;c<nr;c++){var rx=r()*W,ry=r()*(H-10),ang=r()*Math.PI,len=4+r()*9;for(var t=0;t<len;t++){var px=Math.round(rx+Math.cos(ang)*t),py=Math.round(ry+Math.sin(ang)*t);
  if(inb(px,py)&&r()<0.8)s.terr[idx(px,py)]=4;if(inb(px+1,py)&&r()<0.3)s.terr[idx(px+1,py)]=4;}}
 for(c=0;c<40*(sc.rocks||1);c++){x=Math.floor(r()*W);y=Math.floor(r()*H);if(s.terr[idx(x,y)]!==5)s.terr[idx(x,y)]=4;}
 // clear around the entrance
 for(y=H-12;y<H;y++)for(x=EX-8;x<=EX+8;x++)if(inb(x,y)&&(s.terr[idx(x,y)]===4||s.terr[idx(x,y)]===5))s.terr[idx(x,y)]=1;
 for(y=H-7;y<H;y++)s.path[idx(EX,y)]=1;
}
function objAt(x,y){if(!inb(x,y))return null;var id=S.occ[idx(x,y)];return id?S.objs[id]:null;}
function msg(t,kind){S.msgs.push({t:t,d:S.day,k:kind||''});if(S.msgs.length>60)S.msgs.shift();UI.ticker(t,kind);}
function spend(cat,v){S.money-=v;S.fin.cur[cat]=(S.fin.cur[cat]||0)+v;}
function earn(cat,v){S.money+=v;S.fin.cur[cat]=(S.fin.cur[cat]||0)+v;}
function dateStr(d){d=d===undefined?S.day:d;var m=Math.floor(d/MDAYS),y=Math.floor(m/YMONTHS);return 'Sol '+(d%MDAYS+1)+', Month '+(m%YMONTHS+1)+', Year '+(y+1);}

// ---------- building ----------
var cacheVer=0; // bumps when objects change (for fields/coverage)
function footprintOk(type,x,y){
 var d=DEF[type];var cost=d.c,rocks=0;
 if(!inb(x,y)||!inb(x+d.w-1,y+d.h-1))return{ok:false,why:'Off the edge of the map.'};
 for(var j=y;j<y+d.h;j++)for(var i=x;i<x+d.w;i++){var t=idx(i,j);
  if(S.occ[t])return{ok:false,why:'Something is already built here.'};
  if(S.path[t])return{ok:false,why:'There is a path in the way.'};
  if(S.trk[t]>=0)return{ok:false,why:'Coaster track is in the way.'};
  if(i===EX&&j===EY)return{ok:false,why:'That\u2019s the park entrance.'};
  if(S.terr[t]===4)rocks++;}
 if(d.ice){var near=false;for(j=y-2;j<y+d.h+2&&!near;j++)for(i=x-2;i<x+d.w+2;i++)if(inb(i,j)&&S.terr[idx(i,j)]===5){near=true;break;}
  if(!near)return{ok:false,why:'Aquarium domes need polar ice within 2 tiles (the pale blue ground).'};}
 cost+=rocks*40;
 return{ok:true,cost:cost,rocks:rocks};
}
function place(type,x,y,free){
 var d=DEF[type],f=footprintOk(type,x,y);
 if(!f.ok)return f;
 if(!free&&S.money<f.cost)return{ok:false,why:'Not enough money. You need '+fmt(f.cost)+'.'};
 var o={id:S.nid++,t:type,x:x,y:y,w:d.w,h:d.h,open:d.k!=='coaster',broken:false,rel:100,riders:0,q:0,cust:0,inc:0,minc:0,sold:0,price:d.p||0,built:S.day,welfare:100,cost:f.cost};
 if(d.k==='coaster'){o.cn=COASTER_NAMES[S.coasterN++%COASTER_NAMES.length];o.loop=null;o.ok=false;o.err='Lay track from both sides of the station and close the loop.';o.tp=0;o.tv=0;o.dwell=0;}
 for(var j=y;j<y+d.h;j++)for(var i=x;i<x+d.w;i++){var t=idx(i,j);S.occ[t]=o.id;if(S.terr[t]===4)S.terr[t]=1;}
 if(d.k==='coaster')S.trk[idx(x,y)]=0;
 S.objs[o.id]=o;if(!free)spend('build',f.cost);
 cacheVer++;Render.dirty=true;Sfx.play('build');
 if(d.k==='coaster')validateAll();
 return{ok:true,o:o,cost:f.cost};
}
function placePath(x,y,free){
 if(!inb(x,y))return{ok:false,why:'Off the map.'};var t=idx(x,y);
 if(S.path[t])return{ok:false,why:''};
 if(S.occ[t])return{ok:false,why:'Something is built here.'};
 if(S.trk[t]>=0&&S.trk[t]<2)return{ok:false,why:'Track is too low to walk under (raise it to 2+).'};
 var cost=12+(S.terr[t]===4?40:0);
 if(!free&&S.money<cost)return{ok:false,why:'Not enough money.'};
 if(S.terr[t]===4)S.terr[t]=1;
 S.path[t]=1;if(!free)spend('build',cost);S.pathVer++;Render.dirty=true;return{ok:true,cost:cost};
}
function placeTrack(x,y,h,free){
 if(!inb(x,y))return{ok:false,why:'Off the map.'};var t=idx(x,y);
 if(S.trk[t]>=0)return{ok:false,why:''};
 if(S.occ[t])return{ok:false,why:'Something is built here.'};
 if(S.path[t]&&h<2)return{ok:false,why:'Raise the track to height 2+ to cross over a path.'};
 if(x===EX&&y===EY)return{ok:false,why:'That\u2019s the entrance.'};
 var cost=45+h*5+(S.terr[t]===4?40:0);
 if(!free&&S.money<cost)return{ok:false,why:'Not enough money.'};
 if(S.terr[t]===4)S.terr[t]=1;
 S.trk[t]=h;if(!free)spend('build',cost);Render.dirty=true;
 if(!free)validateAll(true);
 return{ok:true,cost:cost};
}
function removeObj(o,refund){
 for(var j=o.y;j<o.y+o.h;j++)for(var i=o.x;i<o.x+o.w;i++)S.occ[idx(i,j)]=0;
 if(DEF[o.t].k==='coaster')S.trk[idx(o.x,o.y)]=-1;
 delete S.objs[o.id];
 S.guests.forEach(function(g){if(g.tgt===o.id){g.tgt=null;}if((g.st==='ride'||g.st==='queue')&&g.on===o.id){g.st='walk';g.on=0;}});
 S.staff.forEach(function(s){if(s.tgt===o.id)s.tgt=null;});
 if(refund){S.money+=Math.round(o.cost*0.4);S.fin.cur.build-=Math.round(o.cost*0.4);}
 cacheVer++;Render.dirty=true;
}
function bulldoze(x,y){
 if(!inb(x,y))return{ok:false,why:''};var t=idx(x,y);
 if(x===EX&&y===EY)return{ok:false,why:'You can\u2019t remove the park entrance.'};
 var o=objAt(x,y);
 if(o){removeObj(o,true);validateAll();Sfx.play('boom');return{ok:true,what:DEF[o.t].n};}
 if(S.trk[t]>=0){S.trk[t]=-1;Render.dirty=true;validateAll();Sfx.play('boom');return{ok:true,what:'track'};}
 if(S.path[t]){S.path[t]=0;S.litter[t]=0;S.pathVer++;Render.dirty=true;Sfx.play('boom');return{ok:true,what:'path'};}
 if(S.terr[t]===4){if(S.money<40)return{ok:false,why:'Clearing rocks costs $40.'};S.terr[t]=1;spend('build',40);Render.dirty=true;Sfx.play('boom');return{ok:true,what:'rocks'};}
 return{ok:false,why:''};
}

// ---------- coasters ----------
function trackNb(t){var x=t%W,y=(t/W)|0,out=[];for(var k=0;k<4;k++){var nx=x+D4[k][0],ny=y+D4[k][1];if(inb(nx,ny)&&S.trk[idx(nx,ny)]>=0)out.push(idx(nx,ny));}return out;}
var GRAV=0.0042;
function heightAt(c,p){var L=c.loop.length;p=((p%L)+L)%L;var i=Math.floor(p),f=p-i;return S.trk[c.loop[i]]*(1-f)+S.trk[c.loop[(i+1)%L]]*f;}
function trainStep(c){
 // returns true when train passes the station
 var L=c.loop.length;
 if(c.dwell>0){c.dwell--;if(c.dwell===0)c.tv=0.07;return false;}
 var h0=heightAt(c,c.tp),p2=c.tp+c.tv,h1=heightAt(c,p2);
 var v2=c.tv*c.tv+2*GRAV*(h0-h1);
 if(h1>h0&&v2<0.0036)c.tv=0.06; else c.tv=Math.sqrt(Math.max(v2,0.0036));
 c.tv=Math.min(c.tv*0.996,0.55);
 c.tp=p2;
 if(c.tp>=L){c.tp-=L;c.tp=0;c.dwell=45;c.tv=0;return true;}
 return false;
}
function validateCoaster(c){
 var st=idx(c.x,c.y);c.ok=false;c.loop=null;
 var nb=trackNb(st);
 if(nb.length<2){c.err='Lay track out of both sides of the station.';return false;}
 if(nb.length>2){c.err='Too many tracks touch the station. Only two sides may connect.';return false;}
 var loop=[st],prev=st,cur=nb[0],guard=0;
 while(cur!==st&&guard++<3000){
  var o=S.objs[S.occ[cur]];if(o&&o.id!==c.id){c.err='The track runs into another station.';return false;}
  loop.push(cur);var n=trackNb(cur);
  var xy=' (at '+(cur%W)+','+((cur/W)|0)+')';
  if(n.length<2){c.err='The track dead-ends'+xy+'. Keep building to close the loop.';return false;}
  if(n.length>2){c.err='The track touches itself side-by-side'+xy+'. Leave a gap between parallel track.';return false;}
  var nx=n[0]===prev?n[1]:n[0];prev=cur;cur=nx;
 }
 if(cur!==st){c.err='The loop isn\u2019t closed.';return false;}
 if(loop.length<8){c.err='Too short. A coaster needs at least 8 pieces.';return false;}
 for(var i=0;i<loop.length;i++){var a=S.trk[loop[i]],b=S.trk[loop[(i+1)%loop.length]];if(Math.abs(a-b)>3){c.err='Too steep at '+(loop[i]%W)+','+((loop[i]/W)|0)+'. Change height by 3 or less per piece.';return false;}}
 // orientation: ride the direction that starts uphill (lift hill) if any
 if(S.trk[loop[loop.length-1]]>S.trk[loop[1]]){loop=[loop[0]].concat(loop.slice(1).reverse());}
 c.loop=loop;
 // simulate one lap for stats
 var tmp={loop:loop,tp:0,tv:0.07,dwell:0},ticks=0,maxV=0,maxDrop=0,drops=0,turns=0,curDrop=0,air=0,lastDir=-1;
 for(i=0;i<loop.length;i++){var A=loop[i],B=loop[(i+1)%loop.length];var dir=(B-A);if(lastDir!==-1&&dir!==lastDir)turns++;lastDir=dir;
  var dh=S.trk[B]-S.trk[A];if(dh<0){curDrop-=dh;}else{if(curDrop>=2)drops++;maxDrop=Math.max(maxDrop,curDrop);curDrop=0;}}
 if(curDrop>=2)drops++;maxDrop=Math.max(maxDrop,curDrop);
 while(ticks<6000){var prevV=tmp.tv;if(trainStep(tmp))break;ticks++;maxV=Math.max(maxV,tmp.tv);if(tmp.tv-prevV>0.004)air++;}
 c.lap=ticks+45;
 var L=loop.length;
 c.ex=clamp(0.8+L*0.03+maxDrop*0.32+drops*0.45+turns*0.05+maxV*7+Math.min(air,40)*0.02,0,9.9);
 c.in=clamp(maxDrop*0.42+maxV*11+turns*0.1*maxV*5+drops*0.3,0,12);
 c.na=clamp(c.in*0.5+turns*0.04,0,10);
 c.maxV=maxV;c.maxDrop=maxDrop;c.len=L;c.turns=turns;
 if(!c.priced){c.price=Math.max(1,Math.round(c.ex*0.7+0.5));c.priced=true;}
 c.ok=true;c.err='';
 return true;
}
function validateAll(announce){
 for(var k in S.objs){var c=S.objs[k];if(DEF[c.t].k!=='coaster')continue;var was=c.ok;validateCoaster(c);
  if(c.ok&&!was){c.open=true;c.tp=0;c.tv=0.07;c.dwell=0;if(announce||!isDemo())msg('\u2714 '+c.cn+' is complete and open! Excitement '+c.ex.toFixed(1)+', intensity '+c.in.toFixed(1)+'.','good');}
  if(!c.ok){c.open=false;if(was)msg(c.cn+' is closed: the track loop was broken.','bad');}}
}

// ---------- path distance fields ----------
var fields={};
function access(o){
 var out=[];for(var j=o.y-1;j<=o.y+o.h;j++)for(var i=o.x-1;i<=o.x+o.w;i++){
  if(!inb(i,j))continue;var inside=i>=o.x&&i<o.x+o.w&&j>=o.y&&j<o.y+o.h;if(inside)continue;
  var corner=(i<o.x||i>=o.x+o.w)&&(j<o.y||j>=o.y+o.h);if(corner)continue;
  if(S.path[idx(i,j)])out.push(idx(i,j));}
 return out;
}
function field(key,targets){
 var f=fields[key];if(f&&f.v===S.pathVer&&f.c===cacheVer)return f.d;
 var d=new Int16Array(N);for(var i=0;i<N;i++)d[i]=-1;var q=[],h=0;
 targets.forEach(function(t){if(d[t]<0){d[t]=0;q.push(t);}});
 while(h<q.length){var t=q[h++],x=t%W,y=(t/W)|0;for(var k=0;k<4;k++){var nx=x+D4[k][0],ny=y+D4[k][1];if(!inb(nx,ny))continue;var n=idx(nx,ny);if(S.path[n]&&d[n]<0){d[n]=d[t]+1;q.push(n);}}}
 fields[key]={v:S.pathVer,c:cacheVer,d:d};return d;
}
function objField(o){return field('o'+o.id,access(o));}
function exitField(){return field('exit',[idx(EX,EY)]);}
function stepDown(fd,t){var x=t%W,y=(t/W)|0,best=[],dv=fd[t];for(var k=0;k<4;k++){var nx=x+D4[k][0],ny=y+D4[k][1];if(!inb(nx,ny))continue;var n=idx(nx,ny);if(fd[n]>=0&&fd[n]<dv)best.push(n);}return best.length?pick(best):-1;}

// ---------- utilities / coverage ----------
var cov={v:-1};
function utilities(){
 if(cov.v===cacheVer)return cov;
 var u={v:cacheVer,pwP:6,pwU:0,o2P:6,o2U:0,res:0,beauty:new Float32Array(N),bin:new Uint8Array(N),shel:new Uint8Array(N),watch:new Uint8Array(N)};
 var ids=Object.keys(S.objs).map(Number).sort(function(a,b){return a-b;});
 ids.forEach(function(id){var o=S.objs[id],d=DEF[o.t];if(d.pw>0)u.pwP+=d.pw;else if(d.pw<0)u.pwU-=d.pw;if(d.o2>0)u.o2P+=d.o2;else if(d.o2<0)u.o2U-=d.o2;if(d.res)u.res+=d.res;});
 var avail=u.pwP;
 ids.forEach(function(id){var o=S.objs[id],d=DEF[o.t];if(d.pw<0){if(avail>=-d.pw){o.pwr=true;avail+=d.pw;}else o.pwr=false;}else o.pwr=true;});
 function area(o,r,arr,val,add){var cx=o.x+(o.w-1)/2,cy=o.y+(o.h-1)/2;for(var j=Math.floor(cy-r);j<=Math.ceil(cy+r);j++)for(var i=Math.floor(cx-r);i<=Math.ceil(cx+r);i++){if(!inb(i,j))continue;if(Math.abs(i-cx)+Math.abs(j-cy)>r+0.5)continue;var t=idx(i,j);if(add)arr[t]+=val;else arr[t]=val;}}
 ids.forEach(function(id){var o=S.objs[id],d=DEF[o.t];
  if(d.beauty)area(o,2,u.beauty,d.beauty,true);
  if(d.k==='exhibit')area(o,2,u.beauty,1,true);
  if(d.bin)area(o,3,u.bin,1,false);
  if(o.t==='shelter')area(o,d.rad+0.5,u.shel,1,false);
  if(o.t==='watch')area(o,d.rad,u.watch,1,false);
  if(d.shel){for(var j=o.y-1;j<=o.y+o.h;j++)for(var i=o.x-1;i<=o.x+o.w;i++)if(inb(i,j))u.shel[idx(i,j)]=1;}
 });
 cov=u;return u;
}
function oname(o){var d=DEF[o.t];return d.k==='coaster'?o.cn:d.n;}
function rideEx(o){var d=DEF[o.t];return d.k==='coaster'?(o.ex||0):d.ex;}
function rideIn(o){var d=DEF[o.t];return d.k==='coaster'?(o.in||0):d.in;}
function rideNa(o){var d=DEF[o.t];return d.k==='coaster'?(o.na||0):d.na;}
function rideCap(o){var d=DEF[o.t];return d.cap||10;}
function fairPrice(o){var d=DEF[o.t];if(d.k==='shop')return d.fair;return Math.max(1,rideEx(o)*0.7+0.6);}
function isAttraction(o){var k=DEF[o.t].k;return k==='ride'||k==='exhibit'||(k==='coaster'&&o.ok);}

// ---------- guests ----------
var THINK_ANIMAL={glow:'The Glowhounds just turned teal. So cute!',puff:'A Shadowpuff vanished right in front of me!',flit:'Those Aero-flits are living fireworks!',herd:'That machine herd is incredible',lumos:'The Lumos-kin are glowing!',vore:'The Aquavores look like little submarines',abyss:'Did that Abyssal just grumble at me?',jelly:'The glowing jellies are so pretty',tidal:'That Bay Beast is HUGE'};
var ANIMAL_N={glow:'Glowhounds',puff:'Shadowpuffs',flit:'Aero-flits',herd:'machine herd',lumos:'Lumos-kin',vore:'Aquavores',abyss:'Abyssals',jelly:'jellies',tidal:'Bay Beast'};
var SHIRTS=['#e04040','#4060e0','#40c040','#e0c040','#c040c0','#40c0c0','#f08030','#ffffff','#303030','#a05030'];
function think(g,s,m){for(var i=0;i<g.th.length;i++){if(g.th[i].s===s&&S.day-g.th[i].d<2)return;}g.th.unshift({s:s,d:S.day,m:m||0});if(g.th.length>8)g.th.pop();}
function spawnGuest(){
 var cash=ri(20,90);
 if(cash<S.fee+3){S.turned++;return null;}
 var g={id:S.gid++,n:pick(NAMES)+' '+pick(SNAMES).charAt(0)+'.',x:EX,y:EY,fx:EX+0.5,fy:EY+0.5,nx:-1,ny:-1,px:-1,py:-1,st:'walk',tgt:null,on:0,tt:0,cool:10,
  cash:cash-S.fee,happy:ri(62,85),hunger:ri(5,35),thirst:ri(5,35),wc:ri(0,25),naus:0,energy:ri(80,100),th:[],mask:false,souv:false,trash:0,spent:S.fee,rides:0,done:{},
  imax:2.5+Math.random()*6.5,ntol:Math.random(),stay:DAY*ri(8,18),age:0,off:(Math.random()-0.5)*0.36,col:pick(SHIRTS),watch:false};
 earn('adm',S.fee);S.guests.push(g);S.totalGuests++;
 think(g,'I just got to '+S.park+'!',1);
 return g;
}
function relocate(g){
 for(var r=1;r<=3;r++)for(var j=g.y-r;j<=g.y+r;j++)for(var i=g.x-r;i<=g.x+r;i++){if(inb(i,j)&&S.path[idx(i,j)]){g.x=i;g.y=j;g.fx=i+0.5;g.fy=j+0.5;g.nx=-1;return true;}}
 if(g.type){g.x=EX;g.y=EY;g.fx=EX+0.5;g.fy=EY+0.5;g.nx=-1;return true;}
 g.st='gone';return false;
}
function wander(g,t){
 var x=t%W,y=(t/W)|0,opts=[],back=-1;
 for(var k=0;k<4;k++){var nx=x+D4[k][0],ny=y+D4[k][1];if(!inb(nx,ny))continue;var n=idx(nx,ny);if(!S.path[n])continue;if(nx===g.px&&ny===g.py){back=n;continue;}opts.push(n);}
 if(opts.length)return pick(opts);return back;
}
function goNearest(g,t,sell){
 var best=null,bd=1e9,pricey=null;
 for(var k in S.objs){var o=S.objs[k],d=DEF[o.t];if(d.sell!==sell||!o.open||o.broken)continue;if(d.pw<0&&!o.pwr)continue;
  var fd=objField(o);if(fd[t]<0)continue;if(g.cash<o.price){pricey=o;continue;}if(fd[t]<bd){bd=fd[t];best=o;}}
 if(best){g.tgt=best.id;return true;}
 if(pricey)think(g,'I can\u2019t afford '+oname(pricey),-1);
 return false;
}
function chooseTarget(g,t){
 if(g.wc>70){if(goNearest(g,t,'wc'))return;think(g,'I really need a restroom',-1);}
 if(g.thirst>62){if(goNearest(g,t,'drink'))return;think(g,'I\u2019m thirsty',-1);}
 if(g.hunger>62){if(goNearest(g,t,'food'))return;think(g,'I\u2019m hungry',-1);}
 if(S.storm>0&&!g.mask&&g.cash>=3){if(goNearest(g,t,'mask'))return;think(g,'This dust storm is awful',-1);}
 if(g.naus>55||g.energy<25){
  var x=t%W,y=(t/W)|0;for(var k=0;k<4;k++){var o=objAt(x+D4[k][0],y+D4[k][1]);if(o&&DEF[o.t].seat){g.st='sit';g.tt=220;think(g,'Nice to sit down for a bit',1);return;}}
  if(g.naus>55){think(g,'I feel sick',-1);return;}
 }
 var why=g.happy<22?'I want to go home':(g.energy<10?'I\u2019m tired':(g.cash<2?'I\u2019ve spent all my money':(g.age>g.stay?'What a day. Time to go home':(!S.open?'The park is closing':null))));
 if(why){think(g,why,g.happy<22?-1:0);g.tgt='exit';return;}
 var c=[],tot=0;
 for(var id in S.objs){var o2=S.objs[id],d=DEF[o2.t];
  var att=isAttraction(o2);
  if(!att&&!(d.sell==='souv'&&!g.souv&&g.cash>=o2.price+4))continue;
  if(!o2.open)continue;var fd=objField(o2);if(fd[t]<0)continue;
  var w=att?(rideEx(o2)+0.5)/(1+(g.done[o2.id]||0)*2.5):1.2;w*=1/(1+fd[t]/14);
  c.push([o2,w]);tot+=w;}
 if(!c.length)return;
 var r=Math.random()*tot,ch=c[0][0];for(var i=0;i<c.length;i++){r-=c[i][1];if(r<=0){ch=c[i][0];break;}}
 if(isAttraction(ch)){
  var nm=oname(ch);
  if(rideIn(ch)>g.imax+0.5){think(g,nm+' looks too intense for me!',-1);return;}
  if(ch.price>fairPrice(ch)*2.2+0.5){think(g,'I\u2019m not paying '+fmt(ch.price)+' to go on '+nm,-1);return;}
  if(DEF[ch.t].out&&S.storm>0&&Math.random()<0.6){think(g,'Not going on '+nm+' in this storm',-1);return;}
  if(g.cash<ch.price){think(g,'I can\u2019t afford '+nm,-1);return;}
 }
 g.tgt=ch.id;
}
function payFor(g,o,cat){var d=DEF[o.t];g.cash-=o.price;g.spent+=o.price;earn(cat,o.price);o.inc+=o.price;o.minc+=o.price;
 if(o.price>fairPrice(o)*1.6+0.5){g.happy-=4;think(g,oname(o)+' is way too expensive',-1);}
 else if(o.price>0&&o.price<=fairPrice(o)*0.6)think(g,oname(o)+' is really good value',1);}
function arrive(g,o){
 var d=DEF[o.t],nm=oname(o);g.tgt=null;
 if(!o.open){think(g,nm+' is closed',-1);g.cool=30;return;}
 if(o.broken){think(g,nm+' has broken down',-1);g.happy-=3;g.cool=30;return;}
 if(d.pw<0&&!o.pwr){think(g,nm+' has no power',-1);g.cool=30;return;}
 if(g.cash<o.price){think(g,'I can\u2019t afford '+nm,-1);g.cool=30;return;}
 if(d.k==='shop'){
  payFor(g,o,(d.sell==='food'||d.sell==='drink')?'food':'shop');o.sold++;
  if(d.sell==='food'){g.hunger=Math.max(0,g.hunger-d.amt);g.trash=ri(80,300);g.happy+=3;if(o.t==='tacos')think(g,'Sunny\u2019s tacos are the best!',1);if(o.t==='chews')g.happy+=2;}
  else if(d.sell==='drink'){g.thirst=Math.max(0,g.thirst-d.amt);g.wc+=20;g.trash=ri(60,200);g.happy+=2;}
  else if(d.sell==='souv'){g.souv=true;g.happy+=8;think(g,'I love my souvenir from Harlan\u2019s!',1);}
  else if(d.sell==='mask'){g.mask=true;think(g,'This dust mask is a lifesaver',1);}
  else if(d.sell==='wc'){g.wc=0;g.happy+=2;}
  g.happy=clamp(g.happy,0,100);g.cool=ri(30,80);return;
 }
 g.on=o.id;
 if(o.riders<rideCap(o))board(g,o);else{g.st='queue';g.tt=0;o.q++;}
}
function board(g,o){
 var d=DEF[o.t];payFor(g,o,'ride');o.riders++;o.cust++;g.st='ride';
 g.tt=d.k==='coaster'?(o.lap||400):d.dur;g.watch=d.k==='exhibit';
}
function finishRide(g){
 var o=S.objs[g.on];g.st='walk';g.on=0;g.watch=false;
 if(!o){relocate(g);return;}
 o.riders=Math.max(0,o.riders-1);
 var d=DEF[o.t],nm=oname(o),ex=rideEx(o),inn=rideIn(o),na=rideNa(o);
 g.done[o.id]=(g.done[o.id]||0)+1;g.rides++;
 var fun=ex*2.6-Math.max(0,inn-g.imax)*5;
 if(d.k==='exhibit'){fun*=0.4+0.6*o.welfare/100;if(o.welfare<40)think(g,'The '+ANIMAL_N[d.an]+' look unhappy',-1);else if(Math.random()<0.6)think(g,THINK_ANIMAL[d.an],1);}
 g.happy=clamp(g.happy+fun,0,100);g.energy-=3;
 g.naus=Math.min(100,g.naus+na*7*(1.3-g.ntol));
 if(d.k!=='exhibit'){if(ex>=6.5)think(g,nm+' was amazing!',1);else if(fun>9)think(g,nm+' was great',1);}
 if(inn>g.imax+1)think(g,nm+' was too intense!',-1);
 var acc=access(o),t=acc.length?pick(acc):idx(EX,EY);
 g.x=t%W;g.y=(t/W)|0;g.fx=g.x+0.5;g.fy=g.y+0.5;g.nx=-1;g.px=-1;g.cool=ri(10,40);
 if(g.naus>65){think(g,'I feel sick',-1);if(Math.random()<0.4){S.litter[t]=Math.min(6,S.litter[t]+2);g.happy-=4;g.naus-=30;}}
}
function dropLitter(g){var t=idx(g.x,g.y),U=utilities();if(U.bin[t])return;if(S.path[t])S.litter[t]=Math.min(6,S.litter[t]+1);}
function enterTile(g){
 var t=idx(g.x,g.y),U=utilities();
 if(S.litter[t]>=3&&Math.random()<0.2){think(g,'The paths here are disgusting',-1);g.happy-=0.6;}
 var b=U.beauty[t];if(b>0){g.happy=Math.min(100,g.happy+Math.min(b,8)*0.03);if(b>=5&&Math.random()<0.04)think(g,'The scenery here is lovely',1);}
}
function decide(g,t){
 if(g.tgt==='exit'){
  if(t===idx(EX,EY)){g.st='gone';return -1;}
  var ef=exitField();if(ef[t]>0)return stepDown(ef,t);
  return wander(g,t);
 }
 if(g.tgt){var o=S.objs[g.tgt];
  if(!o)g.tgt=null;
  else{var fd=objField(o);if(fd[t]===0){arrive(g,o);return -1;}if(fd[t]>0)return stepDown(fd,t);think(g,'I can\u2019t find '+oname(o),-1);g.tgt=null;g.cool=60;}
 }
 if(g.cool<=0){chooseTarget(g,t);g.cool=ri(25,70);if(g.st!=='walk'||g.tgt)return -1;}
 return wander(g,t);
}
function moveAgent(a,isStaff){
 if(a.cool>0)a.cool--;
 if(a.nx<0){
  var t=idx(a.x,a.y);
  if(!S.path[t]){relocate(a);return;}
  var nxt=isStaff?decideStaff(a,t):decide(a,t);
  if(nxt<0)return;
  a.px=a.x;a.py=a.y;a.nx=nxt%W;a.ny=(nxt/W)|0;
 }
 var tx=a.nx+0.5,ty=a.ny+0.5,dx=tx-a.fx,dy=ty-a.fy,dist=Math.abs(dx)+Math.abs(dy),sp=isStaff?0.08:(a.tgt==='exit'?0.085:0.07);
 if(S.storm>0)sp*=0.8;
 if(dist<=sp){a.fx=tx;a.fy=ty;a.x=a.nx;a.y=a.ny;a.nx=-1;if(!isStaff)enterTile(a);}
 else{a.fx+=dx/dist*sp;a.fy+=dy/dist*sp;}
}
function guestTick(g){
 g.age++;
 g.hunger=Math.min(100,g.hunger+0.075);g.thirst=Math.min(100,g.thirst+0.09);g.wc=Math.min(100,g.wc+0.05);g.energy=Math.max(0,g.energy-0.025);if(g.naus>0)g.naus=Math.max(0,g.naus-0.07);
 if(g.trash>0){g.trash--;if(g.trash===0)dropLitter(g);}
 if(g.st==='ride'){g.tt--;if(g.tt<=0)finishRide(g);return;}
 if(g.st==='queue'){var o=S.objs[g.on];
  if(!o||o.broken||!o.open){if(o)o.q=Math.max(0,o.q-1);g.st='walk';g.on=0;if(o)think(g,oname(o)+' has broken down',-1);return;}
  if(o.riders<rideCap(o)){o.q=Math.max(0,o.q-1);if(g.cash>=o.price)board(g,o);else{g.st='walk';g.on=0;}return;}
  g.tt++;if(g.tt>500){think(g,'I\u2019ve been queuing for '+oname(o)+' for ages',-1);g.happy-=6;o.q=Math.max(0,o.q-1);g.st='walk';g.on=0;}
  return;}
 if(g.st==='sit'){g.tt--;g.energy=Math.min(100,g.energy+0.4);g.naus=Math.max(0,g.naus-0.3);if(g.tt<=0)g.st='walk';return;}
 var t=idx(g.x,g.y),U=utilities(),dh=0;
 if(g.hunger>80)dh-=0.02;if(g.thirst>80)dh-=0.025;if(g.wc>85)dh-=0.03;if(g.naus>60)dh-=0.02;if(g.energy<15)dh-=0.015;
 if(S.storm>0&&!g.mask&&!U.shel[t]){dh-=0.035;if(Math.random()<0.002)think(g,'I can\u2019t breathe in this dust',-1);}
 if(S.o2def){dh-=0.015;if(Math.random()<0.001)think(g,'The air feels thin in here',-1);}
 g.happy=clamp(g.happy+dh,0,100);
 moveAgent(g,false);
}

// ---------- staff ----------
function hire(type,free){
 var d=STAFF[type];
 var s={id:S.gid++,type:type,n:pick(NAMES)+' '+pick(SNAMES),x:EX,y:EY,fx:EX+0.5,fy:EY+0.5,nx:-1,ny:-1,px:-1,py:-1,tgt:null,tt:0,st:'walk',route:null,cool:0,done:0};
 S.staff.push(s);if(!free)msg('Hired '+s.n+' ('+d.n+').');return s;
}
function bfsLitter(start,max){
 var prev={},q=[start],h=0,depth={};depth[start]=0;prev[start]=-1;
 while(h<q.length){var t=q[h++];if(S.litter[t]>0&&t!==start){var p=[];while(t!==start){p.unshift(t);t=prev[t];}return p;}
  if(depth[t]>=max)continue;var x=t%W,y=(t/W)|0;
  for(var k=0;k<4;k++){var nx=x+D4[k][0],ny=y+D4[k][1];if(!inb(nx,ny))continue;var n=idx(nx,ny);if(S.path[n]&&prev[n]===undefined){prev[n]=t;depth[n]=depth[t]+1;q.push(n);}}}
 return null;
}
function decideStaff(s,t){
 if(s.type==='handy'){
  if(S.litter[t]>0){S.litter[t]=0;s.done++;s.st='work';s.tt=10;return -1;}
  if((!s.route||!s.route.length)&&s.cool<=0){s.route=bfsLitter(t,24);s.cool=20;}
  if(s.route&&s.route.length){var n=s.route.shift();if(S.path[n])return n;s.route=null;}
  return wander(s,t);
 }
 if(s.type==='mech'||s.type==='keeper'){
  if(s.tgt){var o=S.objs[s.tgt];
   var need=o&&(s.type==='mech'?o.broken:o.welfare<95);
   if(!need){if(o){if(s.type==='mech')o.mech=0;else o.keeper=0;}s.tgt=null;}
   else{var fd=objField(o);if(fd[t]===0){s.st='work';s.tt=s.type==='mech'?110:60;return -1;}if(fd[t]>0)return stepDown(fd,t);
    if(s.type==='mech')o.mech=0;else o.keeper=0;s.tgt=null;}
  }
 }
 return wander(s,t);
}
function finishWork(s){
 var o=s.tgt?S.objs[s.tgt]:null;
 if(s.type==='mech'&&o){o.broken=false;o.rel=Math.min(100,o.rel+35);o.mech=0;s.done++;msg(oname(o)+' has been fixed by '+s.n+'.','good');s.tgt=null;}
 if(s.type==='keeper'&&o){o.welfare=100;o.keeper=0;s.done++;s.tgt=null;}
}
function staffTick(s){
 if(s.st==='work'){s.tt--;if(s.tt<=0){s.st='walk';finishWork(s);}return;}
 moveAgent(s,true);
}
function assignStaff(){
 ['mech','keeper'].forEach(function(type){
  for(var k in S.objs){var o=S.objs[k],d=DEF[o.t];
   var need=type==='mech'?(o.broken&&d.k!=='scen'):(d.k==='exhibit'&&o.welfare<70);
   var key=type==='mech'?'mech':'keeper';
   if(!need||o[key])continue;
   var fd=objField(o),best=null,bd=1e9;
   S.staff.forEach(function(s){if(s.type!==type||s.tgt||s.st==='work')return;var dd=fd[idx(s.x,s.y)];if(dd>=0&&dd<bd){bd=dd;best=s;}});
   if(best){best.tgt=o.id;best.route=null;o[key]=best.id;}
  }
 });
 // entertainers cheer guests nearby
 S.staff.forEach(function(s){if(s.type!=='ent')return;S.guests.forEach(function(g){if(g.st!=='walk')return;if(Math.abs(g.fx-s.fx)+Math.abs(g.fy-s.fy)<2.5){g.happy=Math.min(100,g.happy+2);if(Math.random()<0.1)think(g,'That Lumos costume made me smile!',1);}});});
}

// ---------- days / months ----------
function companyValue(){var v=S.money-S.loan;for(var k in S.objs)v+=S.objs[k].cost*0.7;for(var i=0;i<N;i++)if(S.trk[i]>=0)v+=30;return Math.round(v+S.guests.length*10);}
function parkValue(){var v=0;for(var k in S.objs)v+=S.objs[k].cost*0.7;for(var i=0;i<N;i++)if(S.trk[i]>=0)v+=30;return Math.round(v);}
function calcRating(){
 var n=S.guests.length,hap=0,nau=0,att=0,brk=0,sc=0,lit=0,U=utilities();
 S.guests.forEach(function(g){hap+=g.happy;nau+=g.naus;});
 for(var k in S.objs){var o=S.objs[k],d=DEF[o.t];if(isAttraction(o)&&o.open)att++;if(o.broken)brk++;if(d.k==='scen')sc++;}
 for(var i=0;i<N;i++)if(S.path[i])lit+=S.litter[i];
 var avg=n?hap/n:60;
 var r=120+avg*3.6+Math.min(220,att*16)+Math.min(80,sc*1.5)+Math.min(100,n/4)-Math.min(160,lit*1.2)-brk*30-(n&&nau/n>35?60:0)-(S.o2def?60:0)-(S.storm?20:0);
 S.rating=Math.round(clamp(S.rating+(r-S.rating)*0.3,0,999));
 S.avgHappy=Math.round(avg);S.lit=lit;
}
function vexEvent(){
 var sc=SCN[S.scen],n=S.guests.length;if(n<30||isDemo())return;
 if(Math.random()>0.035*sc.vex*Math.min(1.3,n/250))return;
 var cand=[];for(var k in S.objs){var o=S.objs[k],d=DEF[o.t];if(d.k==='ride'||d.k==='scen'||(d.k==='coaster'&&o.ok)||d.k==='shop')cand.push(o);}
 if(!cand.length)return;
 var o=pick(cand),d=DEF[o.t],cx=o.x+o.w/2,cy=o.y+o.h/2,U=utilities(),safe=U.watch[idx(Math.floor(cx),Math.floor(cy))];
 S.staff.forEach(function(s){if(s.type==='guard'&&Math.abs(s.fx-cx)+Math.abs(s.fy-cy)<8)safe=1;});
 if(safe){msg('Fringe Watch spotted Vex\u2019s Nullifiers near '+oname(o)+' and chased them off.','good');return;}
 S.vexN++;
 if(d.k==='scen'){removeObj(o,false);msg('\u26a0 Vex\u2019s Nullifiers smashed a '+d.n+'. Hire Fringe Watch guards or build watch posts.','bad');}
 else{o.broken=true;o.rel=Math.max(20,o.rel-20);msg('\u26a0 Vex\u2019s Nullifiers sabotaged '+oname(o)+'! It needs a mechanic.','bad');}
}
function newDay(){
 S.day++;var U=utilities(),sc=SCN[S.scen],mech=0;
 S.staff.forEach(function(s){spend('wages',STAFF[s.type].w/MDAYS);if(s.type==='mech')mech++;});
 if(S.loan>0)spend('interest',S.loan*0.10/YMONTHS/MDAYS);
 for(var k in S.objs){var o=S.objs[k],d=DEF[o.t];
  if(d.up)spend('upkeep',d.up/MDAYS);
  if(d.rent)earn('rent',d.rent/MDAYS);
  if(d.k==='exhibit')o.welfare=Math.max(0,o.welfare-9);
  if((d.k==='ride'||(d.k==='coaster'&&o.ok))&&o.open&&!o.broken){
   o.rel=Math.max(25,o.rel-(0.5+Math.random()*0.7));
   var ch=(100-o.rel)/1100*((S.storm>0&&d.out)?2.5:1);
   if(Math.random()<ch&&!isDemo()){o.broken=true;msg(oname(o)+' has broken down! '+(mech?'A mechanic is on the way.':'Hire a mechanic from the Staff window.'),'bad');}
  }
 }
 if(S.storm>0){S.storm--;if(S.storm===0)msg('The dust storm has passed. Clear skies over the Fringe.','good');}
 else if(S.day>8&&Math.random()<sc.storms/40&&!isDemo()){S.storm=ri(3,6);msg('\u26a0 A dust storm is rolling in off the Whispering Chasm! Guests want masks and shelter.','bad');}
 vexEvent();
 S.o2need=U.o2U+Math.ceil(S.guests.length/40);S.o2def=U.o2P<S.o2need;
 if(S.o2def&&S.day%4===0&&!isDemo())msg('Oxygen is running low for this many guests. Build greenhouses or mush farms.','bad');
 if(U.pwU>U.pwP&&S.day%4===0&&!isDemo())msg('Not enough power! Some rides and stalls are dark. Build a Geothermal Vent.','bad');
 calcRating();
 if(S.day%MDAYS===0)newMonth();
}
function newMonth(){
 S.fin.hist.unshift(S.fin.cur);if(S.fin.hist.length>6)S.fin.hist.pop();S.fin.cur=blankFin();
 for(var k in S.objs)S.objs[k].minc=0;
 checkGoal();
 if(!isDemo()){save('auto');}
}
function deadline(){var g=SCN[S.scen].goal;return g?g.years*YMONTHS*MDAYS:0;}
function goalStatus(){
 var g=SCN[S.scen].goal;if(!g)return null;var parts=[],n=S.guests.length;
 if(g.guests)parts.push({t:g.guests+' guests in the park',ok:n>=g.guests,now:n});
 if(g.rating)parts.push({t:'Park rating '+g.rating+'+',ok:S.rating>=g.rating,now:S.rating});
 if(g.exhibits){var e=0;for(var k in S.objs)if(DEF[S.objs[k].t].k==='exhibit')e++;parts.push({t:g.exhibits+' zoo/aquarium exhibits',ok:e>=g.exhibits,now:e});}
 if(g.coaster){var b=0;for(k in S.objs){var o=S.objs[k];if(DEF[o.t].k==='coaster'&&o.ok)b=Math.max(b,o.ex);}parts.push({t:'A coaster with excitement '+g.coaster+'+',ok:b>=g.coaster,now:b.toFixed(1)});}
 if(g.value)parts.push({t:'Company value '+fmt(g.value),ok:companyValue()>=g.value,now:fmt(companyValue())});
 return{parts:parts,all:parts.every(function(p){return p.ok;}),by:'end of Year '+g.years};
}
function checkGoal(){
 if(isDemo()||S.won||S.lost)return;var st=goalStatus();if(!st)return;
 if(st.all){S.won=true;msg('\u2605 Scenario complete! You beat '+SCN[S.scen].n+'.','good');UI.endDialog(true);}
 else if(S.day>=deadline()){S.lost=true;msg('Time\u2019s up on '+SCN[S.scen].n+'.','bad');UI.endDialog(false);}
}
function arrivals(){
 if(!S.open)return;
 var U=utilities(),app=0,att=0;
 for(var k in S.objs){var o=S.objs[k],d=DEF[o.t];
  if(isAttraction(o)&&o.open&&!o.broken&&!(d.pw<0&&!o.pwr)){app+=rideEx(o)*(d.k==='exhibit'?(0.4+0.6*o.welfare/100):1);att++;}
  else if(d.k==='shop')app+=0.4;}
 var want=(30+app*12+U.res)*(0.4+S.rating/800);
 var value=6+att*1.6,ff=S.fee<=value?1:Math.max(0.08,1-(S.fee-value)/value);
 want*=ff;if(S.storm)want*=0.5;want=Math.min(want,650);S.want=Math.round(want);
 var n=S.guests.length;
 if(n<want&&Math.random()<0.05+0.15*(1-n/want))spawnGuest();
}
function simTick(){
 S.tick++;
 arrivals();
 var gs=S.guests,i;
 for(i=0;i<gs.length;i++)guestTick(gs[i]);
 if(S.tick%20===0){var keep=[];for(i=0;i<gs.length;i++){var g=gs[i];if(g.st==='gone'){if(g===UI.selGuest)UI.selGuest=null;}else keep.push(g);}S.guests=keep;}
 for(i=0;i<S.staff.length;i++)staffTick(S.staff[i]);
 for(var k in S.objs){var o=S.objs[k];if(o.loop&&o.ok&&o.open&&!o.broken&&o.pwr!==false)trainStep(o);}
 if(S.tick%40===0)assignStaff();
 if(S.tick%DAY===0)newDay();
}
// ---------- save / load ----------
function save(slot){try{var s=JSON.stringify(S);var ok=store.set('rht-save-'+slot,s);store.set('rht-meta-'+slot,JSON.stringify({d:dateStr(),sc:SCN[S.scen].n,m:S.money,g:S.guests.length}));return ok;}catch(e){return false;}}
function saveMeta(slot){try{var m=store.get('rht-meta-'+slot);return m?JSON.parse(m):null;}catch(e){return null;}}
function load(slot){var raw=store.get('rht-save-'+slot);if(!raw)return false;try{var s=JSON.parse(raw);if(!s||s.v!==1||!s.terr||s.terr.length!==N)return false;setState(s);return true;}catch(e){return false;}}
function setState(s){S=s;fields={};cacheVer++;cov.v=-1;Render.dirty=true;if(UI.reset)UI.reset();}

// ---------- rendering ----------
var Render={dirty:true,grid:false};
var cv=null,ctx=null,bake=null,dpr=1,cw=800,ch=600,cam={x:0,y:300,z:2},animT=0;
var OX=H*16+8,OY=40;
function P(x,y,z){return[(x-y)*16,(x+y)*8-(z||0)];}
var shadeCache={};
function shade(hex,f){var k=hex+f;if(shadeCache[k])return shadeCache[k];var n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
 r=clamp(Math.round(r*f),0,255);g=clamp(Math.round(g*f),0,255);b=clamp(Math.round(b*f),0,255);return shadeCache[k]='rgb('+r+','+g+','+b+')';}
function poly(c,pts,fill,stroke,lw){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw||0.75;c.stroke();}}
function line(a,b,col,lw){ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.strokeStyle=col;ctx.lineWidth=lw||1;ctx.stroke();}
function circ(x,y,r,fill,stroke){ctx.beginPath();ctx.arc(x,y,Math.max(0.1,r),0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=0.75;ctx.stroke();}}
function ell(x,y,rx,ry,fill,stroke,lw){ctx.beginPath();ctx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,Math.PI*2);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||0.75;ctx.stroke();}}
var OUT='rgba(20,8,4,0.55)';
function box(x,y,w,h,z0,z1,col,topCol){
 poly(ctx,[P(x,y+h,z0),P(x+w,y+h,z0),P(x+w,y+h,z1),P(x,y+h,z1)],shade(col,0.78),OUT);
 poly(ctx,[P(x+w,y+h,z0),P(x+w,y,z0),P(x+w,y,z1),P(x+w,y+h,z1)],shade(col,0.6),OUT);
 poly(ctx,[P(x,y,z1),P(x+w,y,z1),P(x+w,y+h,z1),P(x,y+h,z1)],topCol||col,OUT);
}
function dome(cx,cy,r,hh,fill,stroke){ctx.beginPath();ctx.ellipse(cx,cy,r,r/2,0,0,Math.PI);ctx.ellipse(cx,cy,r,hh,0,Math.PI,Math.PI*2);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=0.75;ctx.stroke();}}
function hsh(x,y){var h=(x*374761393+y*668265263)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296;}
var TCOL=[['#b4552f','#b0522d','#ad502c'],['#a54b29','#a14928','#a84d2a'],['#97432a','#934127','#9a4528'],['#7e3820','#7a361f','#823a22'],['#6e3a2a','#6a3828','#723c2c'],['#d3e8ef','#cbe3ec','#d9edf3']];
function bakeTerrain(){
 if(!bake)bake=document.createElement('canvas');
 bake.width=(W+H)*16+16;bake.height=(W+H)*8+OY+40;
 var b=bake.getContext('2d');b.setTransform(1,0,0,1,0,0);b.clearRect(0,0,bake.width,bake.height);b.setTransform(1,0,0,1,OX,OY);
 // cliff sides of the plateau
 poly(b,[P(0,H),P(W,H),[P(W,H)[0],P(W,H)[1]+26],[P(0,H)[0],P(0,H)[1]+26]],'#5e2616');
 poly(b,[P(W,H),P(W,0),[P(W,0)[0],P(W,0)[1]+26],[P(W,H)[0],P(W,H)[1]+26]],'#47190e');
 b.strokeStyle='rgba(0,0,0,0.25)';b.lineWidth=1;for(var s=6;s<26;s+=6){b.beginPath();b.moveTo(P(0,H)[0],P(0,H)[1]+s);b.lineTo(P(W,H)[0],P(W,H)[1]+s);b.lineTo(P(W,0)[0],P(W,0)[1]+s);b.stroke();}
 for(var d=0;d<W+H-1;d++)for(var x=Math.max(0,d-H+1);x<=Math.min(W-1,d);x++){var y=d-x,t=idx(x,y),tr=S.terr[t],hv=hsh(x,y);
  var pts=[P(x,y),P(x+1,y),P(x+1,y+1),P(x,y+1)];
  poly(b,pts,TCOL[tr][Math.floor(hv*3)]);
  if(tr===3){b.strokeStyle='rgba(0,0,0,0.18)';b.lineWidth=1;b.beginPath();b.moveTo(pts[3][0],pts[3][1]);b.lineTo(pts[0][0],pts[0][1]);b.lineTo(pts[1][0],pts[1][1]);b.stroke();}
  if(tr===5){b.fillStyle='rgba(255,255,255,0.7)';if(hv>0.5)b.fillRect(pts[0][0]-3+hv*6,pts[0][1]+5,4,1);b.fillStyle='rgba(120,170,200,0.35)';if(hv<0.4)b.fillRect(pts[0][0]-6+hv*10,pts[0][1]+9,6,1);}
  if(tr<3&&hv>0.86){b.fillStyle='rgba(60,20,10,0.35)';b.fillRect(pts[0][0]-4+hv*8,pts[0][1]+6,2,1);}
  if(tr===4){var c=P(x+0.5,y+0.5);var n=1+Math.floor(hv*3);for(var k=0;k<n;k++){var ox=(hsh(x+k,y)-0.5)*14,oy=(hsh(x,y+k)-0.5)*6,r=3+hsh(x+k*3,y+k)*4;
    b.beginPath();b.ellipse(c[0]+ox,c[1]+oy-r*0.4,r,r*0.75,0,0,Math.PI*2);b.fillStyle='#5a2e22';b.fill();b.beginPath();b.ellipse(c[0]+ox-1,c[1]+oy-r*0.7,r*0.6,r*0.4,0,0,Math.PI*2);b.fillStyle='#8a4a33';b.fill();}}
  if(S.path[t]){var q=[P(x+0.04,y+0.04),P(x+0.96,y+0.04),P(x+0.96,y+0.96),P(x+0.04,y+0.96)];
   poly(b,pts,'#c9b597');
   b.strokeStyle='#7d6a52';b.lineWidth=1.5;b.beginPath();
   if(!(y>0&&S.path[idx(x,y-1)])){b.moveTo(q[0][0],q[0][1]);b.lineTo(q[1][0],q[1][1]);}
   if(!(x<W-1&&S.path[idx(x+1,y)])){b.moveTo(q[1][0],q[1][1]);b.lineTo(q[2][0],q[2][1]);}
   if(!(y<H-1&&S.path[idx(x,y+1)])){b.moveTo(q[2][0],q[2][1]);b.lineTo(q[3][0],q[3][1]);}
   if(!(x>0&&S.path[idx(x-1,y)])){b.moveTo(q[3][0],q[3][1]);b.lineTo(q[0][0],q[0][1]);}
   b.stroke();
   b.fillStyle='rgba(120,100,80,0.25)';if(hv>0.5)b.fillRect(pts[0][0]-2,pts[0][1]+6,4,1);
  }
  if(Render.grid){poly(b,pts,null,'rgba(0,0,0,0.16)',0.6);}
 }
 Render.dirty=false;
}
// --- object drawing ---
function fence(o,front){
 var x0=o.x+0.08,y0=o.y+0.08,x1=o.x+o.w-0.08,y1=o.y+o.h-0.08,segs=front?[[x0,y1,x1,y1],[x1,y1,x1,y0]]:[[x0,y0,x1,y0],[x0,y0,x0,y1]];
 segs.forEach(function(s){var n=Math.round(Math.abs(s[2]-s[0])+Math.abs(s[3]-s[1]))*2;
  line(P(s[0],s[1],7),P(s[2],s[3],7),'#3a2a1a',1.2);line(P(s[0],s[1],3.5),P(s[2],s[3],3.5),'#5a4028',1);
  for(var i=0;i<=n;i++){var f=i/n,x=s[0]+(s[2]-s[0])*f,y=s[1]+(s[3]-s[1])*f;line(P(x,y,0),P(x,y,8),'#2a1a0e',1.2);}});
}
function animalAt(an,p,t,j,inWater){
 var x=p[0],y=p[1];
 if(an==='glow'){var hue=[175,280,30,240,170][Math.floor((t*0.2+j)%5)];ctx.globalAlpha=0.35;circ(x,y-3,7,'hsl('+hue+',90%,60%)');ctx.globalAlpha=1;
  ell(x,y-3,4.5,2.4,'hsl('+hue+',80%,55%)',OUT);circ(x+4,y-5,1.8,'hsl('+hue+',80%,62%)');line([x-3,y-1],[x-3,y+1],'#222',1);line([x+2,y-1],[x+2,y+1],'#222',1);}
 else if(an==='puff'){var a=0.35+0.4*(0.5+0.5*Math.sin(t*1.3+j*2));ctx.globalAlpha=a;circ(x,y-5,4,'#2a2238');circ(x+3,y-7,3,'#3a2e4e');circ(x-3,y-6,3,'#241c30');ctx.globalAlpha=1;circ(x+1,y-6,0.9,'#7ff');circ(x-2,y-5,0.8,'#aff');}
 else if(an==='flit'){var z=10+8*Math.abs(Math.sin(t*2+j));ctx.globalAlpha=0.5;line([x,y-z],[x-Math.cos(t+j)*6,y-z+4],'#ffd060',1);ctx.globalAlpha=1;circ(x,y-z,1.8,j%2?'#fff3a0':'#ff9a40');line([x-3,y-z],[x+3,y-z],'#fff',0.6);line([x,y-z-3],[x,y-z+3],'#fff',0.6);}
 else if(an==='herd'){ctx.fillStyle='#8c939c';ctx.fillRect(x-5,y-7,9,4);ctx.fillStyle='#6a7078';ctx.fillRect(x+3,y-10,3,4);line([x+4,y-10],[x+2,y-14],'#c0c6cc',0.8);line([x+5,y-10],[x+7,y-14],'#c0c6cc',0.8);
  line([x-4,y-3],[x-4,y],'#333',1);line([x+2,y-3],[x+2,y],'#333',1);ctx.fillStyle='#4ef';ctx.fillRect(x+5,y-9,1,1);}
 else if(an==='lumos'){var z2=4+3*Math.sin(t*2+j);ctx.globalAlpha=0.35;circ(x,y-z2,6,'#ffe9a8');ctx.globalAlpha=1;circ(x,y-z2,2.2,'#fff6c8');}
 else if(an==='vore'){ell(x,y,5,2.6,'#3fbf7f',OUT);poly(ctx,[[x-5,y],[x-8,y-3],[x-8,y+3]],'#2f9f6f');circ(x+3,y-1,0.9,'#fff');}
 else if(an==='abyss'){ell(x,y,9,4.5,'#4a3426',OUT);for(var k=-1;k<=1;k++)line([x+k*3.5,y-4],[x+k*3.5,y+4],'#2a1a10',0.8);circ(x+7,y-1,1,'#f84');}
 else if(an==='jelly'){var bob=Math.sin(t*1.5+j)*3;ctx.globalAlpha=0.75;dome(x,y+bob,4,4,'#ff8ad8');ctx.globalAlpha=0.5;for(k=-2;k<=2;k+=2)line([x+k,y+bob],[x+k+Math.sin(t*3+k)*1,y+bob+6],'#ffb0e8',0.7);ctx.globalAlpha=1;}
 else if(an==='tidal'){ctx.beginPath();for(k=0;k<=12;k++){var px=x-18+k*3,py=y+Math.sin(t*1.2+k*0.6)*3;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.strokeStyle='#2c6fd0';ctx.lineWidth=4;ctx.stroke();ctx.strokeStyle='#7fb0ff';ctx.lineWidth=1;ctx.stroke();circ(x+18,y+Math.sin(t*1.2+7.2)*3,3,'#2c6fd0');}
}
function drawPen(o,d){
 var t=animT;
 poly(ctx,[P(o.x,o.y),P(o.x+o.w,o.y),P(o.x+o.w,o.y+o.h),P(o.x,o.y+o.h)],d.col,OUT);
 for(var k=0;k<o.w*o.h*2;k++){var hx=hsh(o.id+k,k*7),hy=hsh(k*3,o.id);var p=P(o.x+0.2+hx*(o.w-0.4),o.y+0.2+hy*(o.h-0.4));ctx.fillStyle=k%3?shade(d.col,1.25):shade(d.col,0.75);ctx.fillRect(p[0]-1,p[1]-2,2,2);}
 fence(o,false);
 var pts=[];for(var j=0;j<d.cnt;j++){var sp=0.6+0.5*((j*37)%10)/10;var ax=o.x+0.5+(o.w-1)*(0.5+0.45*Math.sin(t*0.31*sp+j*1.9+o.id)),ay=o.y+0.5+(o.h-1)*(0.5+0.45*Math.sin(t*0.23*sp+j*2.7+1+o.id));pts.push([ax,ay,j]);}
 pts.sort(function(a,b){return(a[0]+a[1])-(b[0]+b[1]);});
 var sad=o.welfare<40;pts.forEach(function(q){if(sad)ctx.globalAlpha=0.6;animalAt(d.an,P(q[0],q[1]),t*(sad?0.3:1),q[2]);ctx.globalAlpha=1;});
 fence(o,true);
}
function drawAqua(o,d){
 var t=animT,c=P(o.x+o.w/2,o.y+o.h/2),r=o.w*14;
 box(o.x+0.1,o.y+0.1,o.w-0.2,o.h-0.2,0,4,'#5a6a7a');
 var g=ctx.createLinearGradient(0,c[1]-r,0,c[1]);g.addColorStop(0,'rgba(120,210,240,0.55)');g.addColorStop(1,shade(d.col,1)+'');
 ctx.save();ctx.globalAlpha=0.85;dome(c[0],c[1]-4,r,r*0.8,g);ctx.restore();
 ctx.save();ctx.beginPath();ctx.ellipse(c[0],c[1]-4,r,r/2,0,0,Math.PI);ctx.ellipse(c[0],c[1]-4,r,r*0.8,0,Math.PI,Math.PI*2);ctx.clip();
 for(var j=0;j<d.cnt;j++){var a=t*0.35*(j%2?1:-1)+j*2.1,rr=r*(0.25+0.35*((j*13)%7)/7);animalAt(d.an,[c[0]+Math.cos(a)*rr,c[1]-8-r*0.2+Math.sin(a)*rr*0.35],t,j,true);}
 for(j=0;j<5;j++){var by=c[1]-4-((t*12+j*9)%(r*0.8));circ(c[0]-r*0.4+j*r*0.2,by,1,'rgba(255,255,255,0.6)');}
 ctx.restore();
 ctx.beginPath();ctx.ellipse(c[0],c[1]-4,r,r*0.8,0,Math.PI,Math.PI*2);ctx.strokeStyle='rgba(230,250,255,0.9)';ctx.lineWidth=1;ctx.stroke();
 ctx.beginPath();ctx.ellipse(c[0],c[1]-4,r*0.8,r*0.62,0,Math.PI*1.15,Math.PI*1.45);ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=2;ctx.stroke();
 for(var k=1;k<4;k++){ctx.beginPath();ctx.ellipse(c[0],c[1]-4,r*k/4,r*0.8,0,Math.PI,Math.PI*2);ctx.strokeStyle='rgba(200,240,255,0.25)';ctx.lineWidth=0.6;ctx.stroke();}
}
function drawShop(o,d){
 var x0=o.x+0.18,y0=o.y+0.18,w=0.64,z=11;
 box(x0,y0,w,w,0,z,'#e6dcc8');
 // counter windows
 poly(ctx,[P(x0+0.12,y0+w,3),P(x0+w-0.12,y0+w,3),P(x0+w-0.12,y0+w,8),P(x0+0.12,y0+w,8)],'#3a2a1a');
 poly(ctx,[P(x0+w,y0+w-0.12,3),P(x0+w,y0+0.12,3),P(x0+w,y0+0.12,8),P(x0+w,y0+w-0.12,8)],'#2a1e12');
 // striped awnings
 for(var k=0;k<4;k++){var f0=k/4,f1=(k+1)/4,col=k%2?'#fff':d.col;
  poly(ctx,[P(x0+w*f0,y0+w,z),P(x0+w*f1,y0+w,z),P(x0+w*f1,y0+w+0.16,z-4),P(x0+w*f0,y0+w+0.16,z-4)],col,OUT);
  poly(ctx,[P(x0+w,y0+w*(1-f0),z),P(x0+w,y0+w*(1-f1),z),P(x0+w+0.16,y0+w*(1-f1),z-4),P(x0+w+0.16,y0+w*(1-f0),z-4)],k%2?'#ddd':shade(d.col,0.8),OUT);}
 var c=P(o.x+0.5,o.y+0.5,z+6);
 ctx.fillStyle=o.pwr===false?'#555':d.col;ctx.fillRect(c[0]-6,c[1]-4,12,7);ctx.strokeStyle='#000';ctx.lineWidth=0.75;ctx.strokeRect(c[0]-6,c[1]-4,12,7);
 ctx.fillStyle='#000';ctx.font='bold 6px Tahoma,Verdana,sans-serif';ctx.textAlign='center';ctx.fillText(d.sign,c[0],c[1]+2);
}
function drawRide(o,d,run){
 var a=o._a||0,c=P(o.x+o.w/2,o.y+o.h/2),i,k;
 if(o.t==='swing'){
  box(o.x+0.25,o.y+0.25,2.5,2.5,0,3,'#7a7f88','#9aa0a8');
  var spd=run&&o.riders>0?1:0,R=spd?22:9,pts=[];
  for(i=0;i<8;i++){var an=a*1.6+i*Math.PI/4;pts.push([Math.cos(an),Math.sin(an),i]);}
  pts.sort(function(p,q){return p[1]-q[1];});
  var drawC=function(p){var px=c[0]+p[0]*R,py=c[1]-26+p[1]*R*0.5+(spd?0:10);line([c[0]+p[0]*6,c[1]-48+p[1]*3],[px,py],'#ccc',0.6);ctx.fillStyle=SHIRTS[p[2]];ctx.fillRect(px-2,py-1,4,3);};
  pts.filter(function(p){return p[1]<0;}).forEach(drawC);
  box(o.x+1.35,o.y+1.35,0.3,0.3,3,46,'#c0c4cc');ell(c[0],c[1]-48,10,5,d.col,OUT);ell(c[0],c[1]-50,6,3,'#ffd84a');
  pts.filter(function(p){return p[1]>=0;}).forEach(drawC);
 }else if(o.t==='bumper'){
  box(o.x+0.1,o.y+0.1,2.8,2.8,0,3,'#555c66','#2a2e35');
  for(i=0;i<6;i++){var u=1.4+1.1*Math.sin(a*0.9*(1+i*0.13)+i*2),v=1.4+1.1*Math.sin(a*1.1*(1+i*0.07)+i*3.1);if(!(run&&o.riders>0)){u=0.5+(i%3)*0.9;v=0.6+Math.floor(i/3)*1.6;}box(o.x+0.1+u-0.18,o.y+0.1+v-0.18,0.36,0.36,3,6,SHIRTS[i]);}
  var p0=P(o.x+0.1,o.y+0.1,3),p1=P(o.x+2.9,o.y+0.1,3),p2=P(o.x+2.9,o.y+2.9,3),p3=P(o.x+0.1,o.y+2.9,3);
  poly(ctx,[p0,p1,p2,p3],null,'#ffd84a',1);
  [p0,p1,p2,p3].forEach(function(p){line(p,[p[0],p[1]-14],'#888',1);});poly(ctx,[[p0[0],p0[1]-14],[p1[0],p1[1]-14],[p2[0],p2[1]-14],[p3[0],p3[1]-14]],'rgba(63,167,214,0.35)','#3fa7d6',0.8);
 }else if(o.t==='spinner'){
  ell(c[0],c[1]+1,26,13,'#5a3a22');ell(c[0],c[1]-1,26,13,'#8a5a32',OUT);
  if(run&&o.riders>0){ctx.globalAlpha=0.25;for(k=0;k<3;k++){ctx.beginPath();ctx.ellipse(c[0],c[1]-6-k*4,20-k*4,9-k*2,a*3+k,0,Math.PI*1.2);ctx.strokeStyle='#e8a060';ctx.lineWidth=2;ctx.stroke();}ctx.globalAlpha=1;}
  var cups=[];for(i=0;i<4;i++){var b=a*2.4+i*Math.PI/2;cups.push([Math.cos(b),Math.sin(b),i]);}
  cups.sort(function(p,q){return p[1]-q[1];}).forEach(function(p){var px=c[0]+p[0]*13,py=c[1]-3+p[1]*6.5;ctx.fillStyle=shade(d.col,0.75);ctx.fillRect(px-6,py-5,12,5);ell(px,py,6,3,shade(d.col,0.9));ell(px,py-5,6,3,d.col,OUT);ell(px,py-5,4,2,'#3a2010');});
 }else if(o.t==='wheel'){
  var hub=[c[0],c[1]-40],R2=30,ux=0.894,uy=0.447;
  line([c[0]-ux*16,c[1]-uy*16],hub,'#7a7f88',2);line([c[0]+ux*16,c[1]+uy*16],hub,'#7a7f88',2);
  box(o.x+0.2,o.y+0.2,1.6,1.6,0,2,'#666');
  ctx.beginPath();for(i=0;i<=32;i++){var th=i/32*Math.PI*2;var px2=hub[0]+ux*R2*Math.cos(th),py2=hub[1]+uy*R2*Math.cos(th)-R2*Math.sin(th);if(i===0)ctx.moveTo(px2,py2);else ctx.lineTo(px2,py2);}ctx.strokeStyle=d.col;ctx.lineWidth=2;ctx.stroke();
  var rot=a*0.35;for(i=0;i<8;i++){var th2=rot+i*Math.PI/4,gx=hub[0]+ux*R2*Math.cos(th2),gy=hub[1]+uy*R2*Math.cos(th2)-R2*Math.sin(th2);line(hub,[gx,gy],'#c9b26a',0.7);ctx.fillStyle=SHIRTS[i];ctx.fillRect(gx-2.5,gy,5,5);ctx.strokeStyle='#000';ctx.lineWidth=0.5;ctx.strokeRect(gx-2.5,gy,5,5);}
  circ(hub[0],hub[1],2.5,'#ffd84a',OUT);
 }else if(o.t==='thunder'){
  box(o.x+0.05,o.y+0.05,2.9,2.9,0,1,'#4a4a50','#3a3a40');
  ell(c[0],c[1]-1,34,17,null,'#1a1a1e',8);ell(c[0],c[1]-1,34,17,null,'#6a6a70',0.6);ell(c[0],c[1]-1,20,10,'#5a8a3a',OUT);
  var cars=[];for(i=0;i<4;i++){var b2=(run&&o.riders>0?a*1.4:0)+i*1.57+(i*0.3);cars.push([Math.cos(b2),Math.sin(b2),i]);}
  cars.sort(function(p,q){return p[1]-q[1];}).forEach(function(p){var px=c[0]+p[0]*34,py=c[1]-2+p[1]*17;ell(px,py,5,3,'#f0d24a',OUT);ell(px+1,py-2,3,1.6,'#2a2a2a');circ(px-3,py-1,0.8,'#fff');});
  box(o.x+0.15,o.y+0.15,0.6,0.6,1,10,'#8a6a4a');
 }else if(o.t==='glider'){
  box(o.x+0.1,o.y+0.1,1.8,1.8,0,2,'#6a6a6a');box(o.x+0.25,o.y+0.25,0.5,0.5,2,44,'#9aa6b0');
  var top=P(o.x+0.5,o.y+0.5,44);line(top,P(o.x+1.8,o.y+1.8,6),'#ddd',1.5);
  var gl=run&&o.riders>0?a*0.9:2.4,gx2=c[0]+Math.cos(gl)*30,gy2=c[1]-48+Math.sin(gl)*12;
  poly(ctx,[[gx2-9,gy2+2],[gx2+9,gy2+2],[gx2+1,gy2-3]],d.col,OUT);line([gx2,gy2-1],[gx2,gy2+5],'#333',1);
 }else if(o.t==='cavern'){
  dome(c[0],c[1]-1,30,22,'#6b4a3a',OUT);dome(c[0]-6,c[1]-6,14,12,'#7a5644');
  poly(ctx,[[c[0]+4,c[1]+8],[c[0]+12,c[1]+4],[c[0]+12,c[1]-6],[c[0]+4,c[1]-2]],'#140806');
  for(i=0;i<6;i++){var px3=c[0]-20+i*7,py3=c[1]-6-((i*5)%4)*3-hsh(i,o.id)*8,hh=8+hsh(o.id,i)*8,gw=0.6+0.4*Math.sin(animT*2+i);ctx.globalAlpha=0.5+0.5*gw;poly(ctx,[[px3-2,py3],[px3,py3-hh],[px3+2,py3]],'#8fe3ff','#d0f8ff',0.5);ctx.globalAlpha=1;}
 }else if(o.t==='stage'){
  box(o.x+0.1,o.y+0.1,1.8,1.8,0,6,'#4a3a5a','#5e4a70');box(o.x+0.1,o.y+0.1,1.8,0.25,6,28,'#2a2238');box(o.x+0.1,o.y+0.1,0.25,1.8,6,28,'#2a2238');
  box(o.x+0.05,o.y+0.05,1.9,1.9,28,30,d.col);
  for(i=0;i<5;i++){var lp=P(o.x+0.2+i*0.4,o.y+1.95,29);circ(lp[0],lp[1],1.6,(Math.floor(animT*4)+i)%2?'#ffef6a':'#ff4af0');}
  if(run&&o.riders>0){for(i=0;i<3;i++){var bp=P(o.x+0.6+i*0.4,o.y+0.8,6);ctx.fillStyle=SHIRTS[i+2];ctx.fillRect(bp[0]-1.5,bp[1]-7-Math.abs(Math.sin(animT*6+i))*2,3,6);}}
 }else if(o.t==='station'){
  box(o.x+0.05,o.y+0.05,0.9,0.9,0,4,'#8a8a8a','#a8a8a8');
  [[0.1,0.1],[0.9,0.1],[0.9,0.9],[0.1,0.9]].forEach(function(q){line(P(o.x+q[0],o.y+q[1],4),P(o.x+q[0],o.y+q[1],20),'#555',1.2);});
  poly(ctx,[P(o.x,o.y,21),P(o.x+1,o.y,21),P(o.x+1,o.y+1,21),P(o.x,o.y+1,21)],o.ok?d.col:'#888',OUT);
 }
}
function drawCity(o,d){
 var c=P(o.x+o.w/2,o.y+o.h/2),i;
 if(o.t==='hab'){box(o.x+0.1,o.y+0.1,1.8,1.8,0,3,'#8a8a8a');dome(P(o.x+0.65,o.y+0.65)[0],P(o.x+0.65,o.y+0.65)[1]-3,10,12,'#ece6d8',OUT);
  var p2=P(o.x+1.35,o.y+1.3);dome(p2[0],p2[1]-3,12,15,'#f4efe2',OUT);for(i=0;i<3;i++){ctx.fillStyle=(Math.floor(animT/3)+i)%3?'#ffd870':'#4a6a8a';ctx.fillRect(p2[0]-6+i*5,p2[1]-9,2,2);}
  line([p2[0],p2[1]-18],[p2[0],p2[1]-24],'#888',0.8);circ(p2[0],p2[1]-24,1,'#f44');}
 else if(o.t==='vent'){poly(ctx,[[c[0]-24,c[1]],[c[0]-7,c[1]-26],[c[0]+7,c[1]-26],[c[0]+24,c[1]],[c[0],c[1]+12]],'#6b3f2b',OUT);
  poly(ctx,[[c[0],c[1]+12],[c[0]+24,c[1]],[c[0]+7,c[1]-26],[c[0]+2,c[1]-24]],'#4e2c1e');ell(c[0],c[1]-26,7,3,'#ff8a3a',OUT);
  for(i=0;i<5;i++){var ph=(animT*0.8+i*0.2)%1;ctx.globalAlpha=0.5*(1-ph);circ(c[0]+Math.sin(ph*6+i)*4,c[1]-30-ph*40,4+ph*8,'#e8d8d0');}ctx.globalAlpha=1;
  line(P(o.x+1.9,o.y+1),P(o.x+2.4,o.y+1.2),'#333',1);}
 else if(o.t==='green'){box(o.x+0.15,o.y+0.15,1.7,1.7,0,2,'#6a5a4a');
  for(i=0;i<10;i++){var pp=P(o.x+0.35+hsh(i,o.id)*1.3,o.y+0.35+hsh(o.id,i)*1.3,2);circ(pp[0],pp[1]-3,2.5,i%3?'#3fa04a':'#e04a6a');}
  ctx.globalAlpha=0.45;box(o.x+0.15,o.y+0.15,1.7,1.7,2,18,'#9af0c0','#c0ffe0');ctx.globalAlpha=1;
  poly(ctx,[P(o.x+0.15,o.y+0.15,18),P(o.x+1.85,o.y+0.15,18),P(o.x+1.85,o.y+1.85,18),P(o.x+0.15,o.y+1.85,18)],null,'#e0fff0',0.8);}
 else if(o.t==='mush'){for(i=0;i<3;i++){var mp=P(o.x+0.3+i*0.22,o.y+0.65-i*0.2);line(mp,[mp[0],mp[1]-6-i*2],'#e8dcc8',2);ell(mp[0],mp[1]-7-i*2,5,2.5,'#9a5ab8',OUT);circ(mp[0]-1,mp[1]-8-i*2,0.8,'#fff');}}
 else if(o.t==='shelter'){ctx.globalAlpha=0.7;dome(c[0],c[1]-2,28,26,'#e8a060','#7a4a20');ctx.globalAlpha=1;for(i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(c[0],c[1]-2,Math.abs(i)*7+0.1,26,0,Math.PI,Math.PI*2);ctx.strokeStyle='rgba(120,70,30,0.5)';ctx.lineWidth=0.7;ctx.stroke();}
  poly(ctx,[[c[0]-4,c[1]+12],[c[0]+4,c[1]+12],[c[0]+4,c[1]+4],[c[0]-4,c[1]+4]],'#3a2010');}
 else if(o.t==='watch'){box(o.x+0.38,o.y+0.38,0.24,0.24,0,32,'#5a6a8a');box(o.x+0.2,o.y+0.2,0.6,0.6,32,40,'#3a4a6a');var lp=P(o.x+0.5,o.y+0.5,44);circ(lp[0],lp[1],2.2,Math.floor(animT*2)%2?'#6af':'#246');}
}
function drawScen(o,d){
 var c=P(o.x+0.5,o.y+0.5),i;
 if(o.t==='vines'){for(i=0;i<5;i++){var ox=(hsh(o.id,i)-0.5)*16,oy=(hsh(i,o.id)-0.5)*6;ctx.beginPath();ctx.moveTo(c[0]+ox,c[1]+oy);ctx.quadraticCurveTo(c[0]+ox+4,c[1]+oy-6,c[0]+ox,c[1]+oy-10-hsh(i,i)*6);ctx.strokeStyle=i%2?'#3f8f5a':'#b8304a';ctx.lineWidth=1.6;ctx.stroke();circ(c[0]+ox,c[1]+oy-10-hsh(i,i)*6,1.4,i%2?'#ff6a8a':'#7fdf7a');}}
 else if(o.t==='lantern'){line(c,[c[0],c[1]-16],'#3a2a1a',1.5);ctx.globalAlpha=0.3+0.1*Math.sin(animT*3+o.id);circ(c[0],c[1]-17,8,'#ffb347');ctx.globalAlpha=1;circ(c[0],c[1]-17,2.5,'#ffe9a0',OUT);}
 else if(o.t==='crystal'){var cs=[[-5,12],[0,20],[5,14],[2,9]];cs.forEach(function(q,j){var px=c[0]+q[0],gw=0.7+0.3*Math.sin(animT*2+j+o.id);ctx.globalAlpha=gw;poly(ctx,[[px-2.5,c[1]],[px,c[1]-q[1]],[px+2.5,c[1]]],j%2?'#8fe3ff':'#5ac8f0','#e0fbff',0.5);ctx.globalAlpha=1;});}
 else if(o.t==='flyer'){box(o.x+0.35,o.y+0.35,0.3,0.3,0,8,'#9a9080');var f=P(o.x+0.5,o.y+0.5,14);ctx.fillStyle='#e8e0c8';ctx.fillRect(f[0]-9,f[1]-3,18,2);ctx.fillRect(f[0]-9,f[1]+1,18,2);ctx.fillStyle='#8a7a5a';ctx.fillRect(f[0]-1,f[1]-3,2,6);line([f[0]-3,f[1]],[f[0]+11,f[1]],'#5a4a3a',1);line([f[0],f[1]+3],[f[0],f[1]+6],'#5a4a3a',1);}
 else if(o.t==='banner'){line(c,[c[0],c[1]-22],'#555',1.2);var wv=Math.sin(animT*3+o.id)*2;poly(ctx,[[c[0],c[1]-22],[c[0]+12,c[1]-20+wv],[c[0]+12,c[1]-13+wv],[c[0],c[1]-15]],o.id%2?'#ff5a5a':'#ffd84a',OUT);}
 else if(o.t==='bench'){box(o.x+0.25,o.y+0.38,0.5,0.24,2,4,'#8a5a3a');line(P(o.x+0.3,o.y+0.6,0),P(o.x+0.3,o.y+0.6,2),'#333',1);line(P(o.x+0.7,o.y+0.6,0),P(o.x+0.7,o.y+0.6,2),'#333',1);box(o.x+0.25,o.y+0.38,0.5,0.05,4,9,'#6a4028');}
 else if(o.t==='bin'){ctx.fillStyle='#5a6a5a';ctx.fillRect(c[0]-3,c[1]-9,6,9);ell(c[0],c[1]-9,3,1.5,'#7a8a7a',OUT);ell(c[0],c[1],3,1.5,'#4a5a4a');}
}
function drawObj(o){
 var d=DEF[o.t];
 if(d.k==='exhibit'){if(d.ice)drawAqua(o,d);else drawPen(o,d);}
 else if(d.k==='shop')drawShop(o,d);
 else if(d.k==='city')drawCity(o,d);
 else if(d.k==='scen')drawScen(o,d);
 else drawRide(o,d,o.open&&!o.broken&&o.pwr!==false);
 if(o.broken||o.pwr===false||(d.k!=='scen'&&d.k!=='city'&&!o.open)){var p=P(o.x+o.w/2,o.y+o.h/2,o.w*12+30);
  if(Math.floor(performance.now()/400)%2||!o.broken){ctx.fillStyle=o.broken?'#ff3020':(o.pwr===false?'#ffd020':'#888');ctx.beginPath();ctx.moveTo(p[0],p[1]-7);ctx.lineTo(p[0]+7,p[1]+5);ctx.lineTo(p[0]-7,p[1]+5);ctx.closePath();ctx.fill();ctx.strokeStyle='#000';ctx.lineWidth=0.8;ctx.stroke();
   ctx.fillStyle='#000';ctx.font='bold 8px Tahoma,sans-serif';ctx.textAlign='center';ctx.fillText(o.broken?'!':(o.pwr===false?'\u26a1':'x'),p[0],p[1]+4);}}
 if(UI.selObj===o){poly(ctx,[P(o.x,o.y),P(o.x+o.w,o.y),P(o.x+o.w,o.y+o.h),P(o.x,o.y+o.h)],null,'#ffff40',1.5);}
}
function drawTrack(t,x,y){
 var h=S.trk[t],z=h*HU+3,c=P(x+0.5,y+0.5,0),cz=P(x+0.5,y+0.5,z);
 if(h>0){line(c,cz,'#9aa0aa',1.6);line([c[0]-3,c[1]],[cz[0]-3,cz[1]+2],'#7a808a',0.7);}
 var nb=trackNb(t);
 if(!nb.length){ell(cz[0],cz[1],5,2.5,'#d8403a',OUT);return;}
 nb.forEach(function(n){var nx=n%W,ny=(n/W)|0,hm=(h+S.trk[n])/2*HU+3,m=P((x+nx)/2+0.5,(y+ny)/2+0.5,hm);
  line(cz,m,'#3a1010',4.5);line(cz,m,'#e04a3a',2.4);line(cz,m,'#ff9a8a',0.6);});
 ctx.fillStyle='#e8e0d0';ctx.fillRect(cz[0]-2,cz[1]-1,4,2);
}
function drawTrainCar(c,p,j){
 var L=c.loop.length;p=((p%L)+L)%L;var i=Math.floor(p),f=p-i,A=c.loop[i],B=c.loop[(i+1)%L];
 var ax=A%W+0.5,ay=((A/W)|0)+0.5,bx=B%W+0.5,by=((B/W)|0)+0.5,z=(S.trk[A]*(1-f)+S.trk[B]*f)*HU+6;
 var q=P(ax+(bx-ax)*f,ay+(by-ay)*f,z);
 ctx.fillStyle=j===0?'#ffd84a':'#ffb020';ctx.fillRect(q[0]-4,q[1]-3,8,5);ctx.strokeStyle='#000';ctx.lineWidth=0.7;ctx.strokeRect(q[0]-4,q[1]-3,8,5);
 if(c.riders>0){circ(q[0]-1.5,q[1]-4,1.3,'#f0c8a0');circ(q[0]+1.8,q[1]-4,1.3,'#d8a070');}
}
var SKIN=['#f0c8a0','#d8a070','#a06a40','#6a4028','#f8dcc0'];
function drawPerson(a,staff){
 var p=P(a.fx+(a.off||0),a.fy-(a.off||0),0);var x=Math.round(p[0]),y=Math.round(p[1]);
 if(staff&&a.type==='ent'){circ(x,y-5,4.5,'#ffd84a',OUT);circ(x-3,y-9,1.5,'#ffd84a',OUT);circ(x+3,y-9,1.5,'#ffd84a',OUT);circ(x-1.5,y-6,0.7,'#000');circ(x+1.5,y-6,0.7,'#000');return;}
 ctx.fillStyle='#2a2a30';ctx.fillRect(x-1.5,y-3,1,3);ctx.fillRect(x+0.5,y-3,1,3);
 ctx.fillStyle=staff?STAFF[a.type].col:a.col;ctx.fillRect(x-2,y-7,4,4);
 ctx.fillStyle=SKIN[(a.id||0)%5];ctx.fillRect(x-1.5,y-9.5,3,3);
 if(staff){ctx.fillStyle=STAFF[a.type].col;ctx.fillRect(x-2,y-10.5,4,1.5);}
 else if(a.mask){ctx.fillStyle='#ddd';ctx.fillRect(x-1.5,y-8,3,1);}
 if(UI.selGuest===a){ctx.beginPath();ctx.ellipse(x,y,6,3,0,0,Math.PI*2);ctx.strokeStyle='#ffff40';ctx.lineWidth=1.2;ctx.stroke();ctx.fillStyle='#ffff40';ctx.beginPath();ctx.moveTo(x-3,y-17);ctx.lineTo(x+3,y-17);ctx.lineTo(x,y-13);ctx.fill();}
}
var lastFrame=0;
function frame(now){
 var dtR=Math.min(0.1,(now-(lastFrame||now))/1000);lastFrame=now;
 if(Render.dirty)bakeTerrain();
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;
 ctx.fillStyle='#1a0905';ctx.fillRect(0,0,cv.width,cv.height);
 // starfield-ish sky dust
 var k=dpr*cam.z;ctx.setTransform(k,0,0,k,Math.round(cv.width/2-cam.x*k),Math.round(cv.height/2-cam.y*k));ctx.imageSmoothingEnabled=false;
 ctx.drawImage(bake,-OX,-OY);
 var hw=cv.width/2/k,hh=cv.height/2/k,vx0=cam.x-hw-80,vx1=cam.x+hw+80,vy0=cam.y-hh-40,vy1=cam.y+hh+120;
 var anchors={},bk={},i,o;
 for(var id in S.objs){o=S.objs[id];anchors[idx(o.x+o.w-1,o.y+o.h-1)]=o;var dk=DEF[o.k];var run=o.open&&!o.broken&&o.pwr!==false&&o.riders>0;if(run||DEF[o.t].k==='exhibit')o._a=(o._a||0)+dtR*Math.max(1,Game.speed);}
 animT+=dtR*(Game.speed||0.25);
 function add(t,v){(bk[t]||(bk[t]=[])).push(v);}
 for(i=0;i<S.guests.length;i++){var g=S.guests[i];if(g.st==='gone'||(g.st==='ride'&&!g.watch))continue;add(idx(clamp(Math.floor(g.fx),0,W-1),clamp(Math.floor(g.fy),0,H-1)),[0,g]);}
 for(i=0;i<S.staff.length;i++){var s=S.staff[i];add(idx(clamp(Math.floor(s.fx),0,W-1),clamp(Math.floor(s.fy),0,H-1)),[1,s]);}
 for(id in S.objs){o=S.objs[id];if(o.loop&&o.ok){for(var j=0;j<3;j++){var L=o.loop.length,pp=((o.tp-j*0.6)%L+L)%L;add(o.loop[Math.floor(pp)],[2,o,o.tp-j*0.6,j]);}}}
 for(var d=0;d<W+H-1;d++)for(var x=Math.max(0,d-H+1);x<=Math.min(W-1,d);x++){
  var y=d-x,cp=P(x+0.5,y+0.5);if(cp[0]<vx0||cp[0]>vx1||cp[1]<vy0||cp[1]>vy1)continue;var t=idx(x,y);
  if(S.litter[t]>0&&S.path[t]){for(var l=0;l<S.litter[t];l++){ctx.fillStyle=l%2?'#e8e8e8':'#7a9a3a';ctx.fillRect(cp[0]-6+hsh(x+l,y)*12,cp[1]-3+hsh(x,y+l)*6,2,1.5);}}
  if(x===EX&&y===EY)drawGate();
  if(anchors[t])drawObj(anchors[t]);
  if(S.trk[t]>=0)drawTrack(t,x,y);
  var B=bk[t];if(B)for(i=0;i<B.length;i++){var e=B[i];if(e[0]===2)drawTrainCar(e[1],e[2],e[3]);else drawPerson(e[1],e[0]===1);}
 }
 UI.drawGhost&&UI.drawGhost();
 ctx.setTransform(1,0,0,1,0,0);
 if(S.storm>0){ctx.fillStyle='rgba(170,70,30,0.30)';ctx.fillRect(0,0,cv.width,cv.height);ctx.strokeStyle='rgba(230,150,100,0.35)';ctx.lineWidth=1.5*dpr;var tt=now/1000;
  for(i=0;i<70;i++){var sx=((hsh(i,1)*cv.width+tt*(300+hsh(i,2)*300)*dpr)%(cv.width+100))-50,sy=hsh(i,3)*cv.height;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-30*dpr,sy+4*dpr);ctx.stroke();}}
}
function drawGate(){
 var a=P(EX+0.05,EY+0.5),b=P(EX+0.95,EY+0.5);
 [[EX-0.15,EY+0.2],[EX+1.15,EY+0.2]].forEach(function(q){box(q[0]-0.15,q[1],0.3,0.3,0,30,'#8a5a3a');});
 var l=P(EX-0.15,EY+0.35,30),r=P(EX+1.15,EY+0.35,30);
 poly(ctx,[[l[0]-4,l[1]-10],[r[0]+4,r[1]-10],[r[0]+4,r[1]+2],[l[0]-4,l[1]+2]],'#c43c3c',OUT,1);
 ctx.save();ctx.translate((l[0]+r[0])/2,(l[1]+r[1])/2-3);ctx.rotate(Math.atan2(r[1]-l[1],r[0]-l[0]));ctx.fillStyle='#ffd84a';ctx.font='bold 6px Tahoma,sans-serif';ctx.textAlign='center';ctx.fillText('ELYSIUM FRINGE',0,1);ctx.restore();
}
function screenToWorld(sx,sy){var wx=(sx-cw/2)/cam.z+cam.x,wy=(sy-ch/2)/cam.z+cam.y;return[(wx/16+wy/8)/2,(wy/8-wx/16)/2];}
function worldToScreen(x,y,z){var p=P(x,y,z);return[(p[0]-cam.x)*cam.z+cw/2,(p[1]-cam.y)*cam.z+ch/2];}
function clampCam(){cam.x=clamp(cam.x,-H*16,W*16);cam.y=clamp(cam.y,0,(W+H)*8);}
function centerOn(x,y){var p=P(x,y);cam.x=p[0];cam.y=p[1];clampCam();}

// ---------- sound (off by default) ----------
var Sfx={on:false,ac:null,
 toggle:function(){this.on=!this.on;if(this.on&&!this.ac){try{var A=window.AudioContext||window.webkitAudioContext;this.ac=A?new A():null;}catch(e){this.ac=null;}}store.set('rht-sound',this.on?'1':'0');return this.on;},
 play:function(n){if(!this.on||!this.ac)return;try{var o=this.ac.createOscillator(),g=this.ac.createGain(),t=this.ac.currentTime;o.type='square';
  var f={build:[520,780],boom:[160,60],cash:[880,1320],bad:[300,200],click:[660,660]}[n]||[440,440];o.frequency.setValueAtTime(f[0],t);o.frequency.linearRampToValueAtTime(f[1],t+0.09);
  g.gain.setValueAtTime(0.05,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.15);o.connect(g);g.connect(this.ac.destination);o.start(t);o.stop(t+0.16);}catch(e){}}};

// ---------- game loop ----------
var Game={speed:1,acc:0,mode:'menu',keys:{},mouse:null,edge:true};
function isDemo(){return DEMO||Game.mode!=='play';}
function loop(now){
 var dt=Math.min(0.1,(now-(Game.last||now))/1000);Game.last=now;
 Game.acc+=dt*TPS*Game.speed;var n=0;while(Game.acc>=1&&n<240){simTick();Game.acc-=1;n++;}if(n>=240)Game.acc=0;
 var pan=500*dt/cam.z,K=Game.keys;
 if(K.ArrowLeft||K.a)cam.x-=pan;if(K.ArrowRight||K.d)cam.x+=pan;if(K.ArrowUp||K.w)cam.y-=pan;if(K.ArrowDown||K.s)cam.y+=pan;
 if(Game.mode==='play'&&Game.edge&&Game.mouse&&Game.mouse.inside&&Game.mouse.pt==='mouse'&&!Game.mouse.down){var m=Game.mouse,e=14;
  if(m.x<e)cam.x-=pan;if(m.x>cw-e)cam.x+=pan;if(m.y<e)cam.y-=pan;if(m.y>ch-e)cam.y+=pan;}
 if((Game.mode==='demo'&&!PROMO)||Game.mode==='menu'){var tt=now/1000;cam.x=Game.demoX+Math.sin(tt*0.06)*140;cam.y=Game.demoY+Math.sin(tt*0.045)*50;}
 clampCam();
 try{frame(now);}catch(err){if(!Game.errShown){Game.errShown=1;if(window.console)console.warn('render',err);}}
 window.requestAnimationFrame(loop);
}

// ---------- demo park (title screen, X card, promo) ----------
function buildDemo(){
 setState(newState('sandbox'));
 var x,y;
 for(y=24;y<=34;y++)for(x=18;x<=46;x++){if(Math.pow((x-33)/13,2)+Math.pow((y-29.5)/3.6,2)<1)S.terr[idx(x,y)]=5;else if(S.terr[idx(x,y)]===5)S.terr[idx(x,y)]=1;}
 for(y=35;y<H;y++)for(x=16;x<=58;x++)if(S.terr[idx(x,y)]===4||S.terr[idx(x,y)]===5)S.terr[idx(x,y)]=hsh(x,y)>0.5?0:1;
 for(y=26;y<35;y++)for(x=16;x<=58;x++)if(S.terr[idx(x,y)]===4)S.terr[idx(x,y)]=5;
 function hp(x0,x1,yy){for(var i=x0;i<=x1;i++)placePath(i,yy,true);}function vp(xx,y0,y1){for(var j=y0;j<=y1;j++)placePath(xx,j,true);}
 vp(32,36,63);hp(22,44,55);hp(20,44,46);vp(22,46,55);vp(44,46,55);hp(24,40,36);
 var L=[['swing',23,56],['bumper',27,56],['wheel',33,57],['spinner',36,56],['thunder',39,56],['kiosk',31,57],['chews',31,59],['wc',33,59],['tacos',31,61],['brew',33,61],['flyer',34,61],
  ['pen_glow',23,47],['pen_flit',27,47],['pen_herd',23,50],['pen_puff',28,52],['pen_lumos',20,48],['glider',20,51],['harlan',31,49],['stew',31,44],['water',31,52],
  ['hab',36,47],['vent',39,47],['shelter',33,47],['watch',43,47],['stage',33,52],['green',36,50],['hab',39,50],['bench',31,54],['bin',33,54],['bench',43,50],['bench',21,50],['bin',21,47],
  ['cavern',36,37],['aq_vore',25,33],['aq_jelly',29,34],['aq_abyss',34,33],['aq_tidal',38,33],['crystal',31,37],['crystal',33,37],['station',45,50],
  ['lantern',31,62],['lantern',33,62],['lantern',31,56],['lantern',33,56],['banner',43,54],['banner',21,54],['lantern',43,45],['lantern',23,45],['vent',41,52],['green',41,43],['mush',38,44],['lantern',33,45],['vines',35,45],['vines',36,45]];
 L.unshift(['vent',41,39],['vent',18,57],['vent',18,40],['vent',27,39]);
 L.forEach(function(q){var r=place(q[0],q[1],q[2],true);if(!r.ok&&window.RHT_DEBUG)console.log('demo place fail',q,r.why);});
 var T=[[45,49,1],[45,48,2],[45,47,3],[45,46,4],[45,45,5],[45,44,6],[45,43,7],[45,42,8],[45,41,8],[45,40,8],[45,39,8],[45,38,8],
  [46,38,7],[47,38,5],[48,38,2],[49,38,0],[50,38,0],[51,38,1],[52,38,3],[53,38,5],[54,38,5],[55,38,3],[56,38,2],
  [56,39,1],[56,40,0],[56,41,1],[56,42,3],[56,43,4],[56,44,2],[56,45,0],[56,46,0],[56,47,1],[56,48,2],[56,49,2],[56,50,1],[56,51,0],[56,52,0]];
 for(x=55;x>=45;x--)T.push([x,52,0]);T.push([45,51,0]);
 T.forEach(function(q){placeTrack(q[0],q[1],q[2],true);});
 var sc=['crystal','vines','lantern','crystal','vines','banner'];
 for(var k=0;k<22;k++){var px=47+Math.floor(hsh(k,5)*8),py=40+Math.floor(hsh(9,k)*11);place(sc[k%sc.length],px,py,true);}
 for(k=0;k<26;k++){px=18+Math.floor(hsh(k,77)*38);py=36+Math.floor(hsh(31,k)*27);var fo=footprintOk('vines',px,py);if(fo.ok&&!access({x:px,y:py,w:1,h:1}).length)place(k%3?'vines':'crystal',px,py,true);}
 validateAll();
 ['handy','handy','mech','keeper','keeper','ent','guard'].forEach(function(t){hire(t,true);});
 S.rating=760;S.money=48250;S.fee=10;
 return S;
}
function warm(n){for(var i=0;i<n;i++)simTick();}

// ---------- UI (Windows-98 era chrome) ----------
var UI={selGuest:null,selObj:null,tool:null,trackH:0,hover:null,wins:{},z:20,confirm:0,buildCat:'rides'};
var $=function(id){return document.getElementById(id);};
UI.ticker=function(t,kind){var el=$('tick');if(!el)return;el.textContent=t;el.className='tick '+(kind||'');el.style.animation='none';void el.offsetWidth;el.style.animation='';if(kind==='bad')Sfx.play('bad');};
UI.reset=function(){UI.selGuest=null;UI.selObj=null;for(var k in UI.wins){if(k==='obj'||k==='guest')closeWin(k);}};
function bar(v,col){v=clamp(Math.round(v),0,100);return '<span class="bar"><i style="width:'+v+'%;background:'+(col||'#0a246a')+'"></i></span>';}
function lvl(v){return v<2?'Low':v<4?'Medium':v<6?'High':v<8?'Very high':'Extreme';}
function openWin(id,title,render,opt){
 opt=opt||{};var w=UI.wins[id],host=$('wins');if(!host)return;
 if(!w){var el=document.createElement('div');el.className='win';el.dataset.id=id;
  el.innerHTML='<div class="tb"><span></span><button class="x" data-a="close" title="Close">\u00d7</button></div><div class="bd"></div>';
  host.appendChild(el);var n=Object.keys(UI.wins).length;
  var ww=Math.min(opt.w||300,window.innerWidth-8);el.style.width=ww+'px';
  var left=opt.x!==undefined?opt.x:Math.min(window.innerWidth-ww-4,12+n*22),top=opt.y!==undefined?opt.y:(64+n*18);
  el.style.left=Math.max(4,left)+'px';el.style.top=Math.max(4,Math.min(top,window.innerHeight-120))+'px';
  w={el:el,id:id};UI.wins[id]=w;dragWin(el);
 }
 w.render=render;w.title=title;w.live=!!opt.live;front(w);refreshWin(w);return w;
}
function front(w){w.el.style.zIndex=++UI.z;}
function refreshWin(w){var html='';try{html=w.render();}catch(e){html='<p>\u2014</p>';}if(html!==w.last){w.el.querySelector('.bd').innerHTML=html;w.last=html;}
 var t=typeof w.title==='function'?w.title():w.title;var sp=w.el.querySelector('.tb span');if(sp.textContent!==t)sp.textContent=t;}
function closeWin(id){var w=UI.wins[id];if(!w)return;w.el.parentNode&&w.el.parentNode.removeChild(w.el);delete UI.wins[id];if(id==='guest')UI.selGuest=null;if(id==='obj')UI.selObj=null;if(id==='build')setTool(null);}
function dragWin(el){var tb=el.querySelector('.tb'),st=null;
 tb.addEventListener('pointerdown',function(e){if(e.target.closest('button'))return;st={x:e.clientX,y:e.clientY,l:el.offsetLeft,t:el.offsetTop,id:e.pointerId};try{tb.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
 tb.addEventListener('pointermove',function(e){if(!st||e.pointerId!==st.id)return;el.style.left=clamp(st.l+e.clientX-st.x,-el.offsetWidth+60,window.innerWidth-60)+'px';el.style.top=clamp(st.t+e.clientY-st.y,0,window.innerHeight-30)+'px';});
 var end=function(){st=null;};tb.addEventListener('pointerup',end);tb.addEventListener('pointercancel',end);
 el.addEventListener('pointerdown',function(){var w=UI.wins[el.dataset.id];if(w)front(w);UI.ptrDown=true;});
}
function setTool(t){UI.tool=t;if(cv)cv.style.cursor=t?(t.k==='bull'?'not-allowed':'crosshair'):'default';var tip=$('tip');if(tip&&!t)tip.style.display='none';if(UI.wins.build)refreshWin(UI.wins.build);}
// ---- windows ----
function buildWin(cat){
 UI.buildCat=cat||UI.buildCat;
 openWin('build',function(){return 'Construction \u2014 '+CATS.filter(function(c){return c[0]===UI.buildCat;})[0][1];},function(){
  var c=UI.buildCat,h='<div class="tabs">'+CATS.map(function(q){return '<button class="'+(q[0]===c?'on':'')+'" data-a="tab" data-v="'+q[0]+'">'+q[1]+'</button>';}).join('')+'</div><div class="list">';
  var sel=UI.tool;
  if(c==='land'){
   h+=item('path','Regolith Path','$12 / tile','Guests only walk on paths. Click or drag to lay them.','#c9b597',sel&&sel.k==='path');
   h+=item('bull','Bulldozer','refund 40%','Remove buildings, track and paths. Also clears rocks ($40).','#d0402a',sel&&sel.k==='bull');
  }else{
   if(c==='coaster')h+='<div class="note">1. Put a <b>Coaster Station</b> next to a path.<br>2. Pick <b>Track</b>, click tiles out of <i>both</i> sides of the station.<br>3. Raise the height to build a lift hill, then drop it fast.<br>4. Close the loop back into the station. It opens by itself.</div>';
   DEFS.forEach(function(d){if(d.cat!==c)return;h+=item(d.id,d.n,fmt(d.c),d.w+'\u00d7'+d.h+(d.pw<0?' \u00b7 \u26a1'+(-d.pw):'')+(d.pw>0?' \u00b7 +'+d.pw+' power':'')+(d.o2>0?' \u00b7 +'+d.o2+' O\u2082':'')+(d.ice?' \u00b7 near ice':'')+' \u2014 '+d.b,d.col,sel&&sel.k==='obj'&&sel.id===d.id);});
   if(c==='coaster'){
    h+=item('track','Coaster Track','$45+ / piece','Click tiles to lay track at the height below. Steps of up to 3 per piece.','#e04a3a',sel&&sel.k==='track');
    h+='<div class="row">Track height: <button data-a="th" data-v="-1">\u25bc</button> <b class="big">'+UI.trackH+'</b> <button data-a="th" data-v="1">\u25b2</button> <small>(0\u201312, keys [ and ])</small></div>';
    var any=false;for(var k in S.objs){var o=S.objs[k];if(DEF[o.t].k!=='coaster')continue;any=true;
     h+='<div class="cst"><b>'+esc(o.cn)+'</b> '+(o.ok?'<span class="ok">\u2714 '+(o.open?'Open':'Closed')+'</span> Excitement '+o.ex.toFixed(1)+' \u00b7 Intensity '+o.in.toFixed(1)+' \u00b7 '+o.len+' pieces':'<span class="no">\u2716 '+esc(o.err)+'</span>')+' <button data-a="locate" data-v="'+o.id+'">Locate</button> <button data-a="info" data-v="'+o.id+'">Info</button></div>';}
    if(!any)h+='<div class="cst">No coasters yet.</div>';
   }
  }
  return h+'</div>';
 },{w:360,x:8,y:62,live:true});
}
function item(id,name,cost,desc,col,on){return '<button class="item'+(on?' on':'')+'" data-a="tool" data-v="'+id+'"><span class="sw" style="background:'+col+'"></span><b>'+esc(name)+'</b><em>'+cost+'</em><small>'+esc(desc)+'</small></button>';}
function objWin(o){
 UI.selObj=o;UI.confirm=0;
 openWin('obj',function(){var x=S.objs[o.id];return x?oname(x):'Gone';},function(){
  var x=S.objs[o.id];if(!x)return '<p>This was demolished.</p>';var d=DEF[x.t],h='';
  var st=x.broken?'<span class="no">Broken down</span>'+(x.mech?' \u2014 mechanic on the way':''):(x.pwr===false?'<span class="no">No power</span>':(d.k==='coaster'&&!x.ok?'<span class="no">Incomplete</span>':(x.open?'<span class="ok">Open</span>':'Closed')));
  if(d.k==='ride'||d.k==='coaster'||d.k==='exhibit'){
   h+='<div class="row">Status: <b>'+st+'</b></div>';
   h+='<div class="row"><button data-a="setopen" data-v="'+x.id+',1"'+(x.open?' class="on"':'')+'>Open</button> <button data-a="setopen" data-v="'+x.id+',0"'+(!x.open?' class="on"':'')+'>Close</button></div>';
   if(d.k==='coaster'&&!x.ok)h+='<div class="note">'+esc(x.err)+'</div>';
   h+='<div class="row">Price: <button data-a="price" data-v="'+x.id+',-1">\u2212</button> <b class="big">'+fmt(x.price)+'</b> <button data-a="price" data-v="'+x.id+',1">+</button> <small>guests think about '+fmt(Math.round(fairPrice(x)))+' is fair</small></div>';
   if(d.k!=='exhibit'||rideIn(x)>0)h+='<table class="kv"><tr><td>Excitement</td><td>'+rideEx(x).toFixed(2)+' ('+lvl(rideEx(x))+')</td></tr><tr><td>Intensity</td><td>'+rideIn(x).toFixed(2)+' ('+lvl(rideIn(x))+')</td></tr><tr><td>Nausea</td><td>'+rideNa(x).toFixed(2)+' ('+lvl(rideNa(x))+')</td></tr></table>';
   if(d.k==='coaster'&&x.ok)h+='<table class="kv"><tr><td>Length</td><td>'+x.len+' pieces</td></tr><tr><td>Biggest drop</td><td>'+x.maxDrop+' levels</td></tr><tr><td>Top speed</td><td>'+Math.round(x.maxV*260)+' km/h</td></tr></table>';
   if(d.k==='exhibit')h+='<div class="row">'+ANIMAL_N[d.an]+' welfare '+bar(x.welfare,x.welfare<40?'#c00':'#080')+' '+Math.round(x.welfare)+'%</div><div class="row"><small>'+(x.keeper?'A keeper is coming to feed them.':(S.staff.some(function(s){return s.type==='keeper';})?'Keepers feed them when they get hungry.':'<span class="no">Hire a Creature Keeper or they get sad.</span>'))+'</small></div>';
   h+='<table class="kv"><tr><td>On it now / in line</td><td>'+x.riders+' / '+x.q+'</td></tr><tr><td>Total customers</td><td>'+x.cust+'</td></tr><tr><td>Income this month</td><td>'+fmt(x.minc)+'</td></tr>'+(d.k!=='exhibit'?'<tr><td>Reliability</td><td>'+Math.round(x.rel)+'%</td></tr>':'')+'</table>';
  }else if(d.k==='shop'){
   h+='<div class="row">Status: <b>'+st+'</b></div><div class="row"><button data-a="setopen" data-v="'+x.id+',1"'+(x.open?' class="on"':'')+'>Open</button> <button data-a="setopen" data-v="'+x.id+',0"'+(!x.open?' class="on"':'')+'>Close</button></div>';
   if(d.sell!=='wc')h+='<div class="row">Price: <button data-a="price" data-v="'+x.id+',-1">\u2212</button> <b class="big">'+fmt(x.price)+'</b> <button data-a="price" data-v="'+x.id+',1">+</button> <small>fair is about '+fmt(d.fair)+'</small></div>';
   h+='<table class="kv"><tr><td>Sold</td><td>'+x.sold+'</td></tr><tr><td>Income this month</td><td>'+fmt(x.minc)+'</td></tr></table>';
  }else if(d.k==='city'){
   h+='<table class="kv">'+(d.pw?'<tr><td>Power</td><td>'+(d.pw>0?'+':'')+d.pw+'</td></tr>':'')+(d.o2?'<tr><td>Oxygen</td><td>'+(d.o2>0?'+':'')+d.o2+'</td></tr>':'')+(d.rent?'<tr><td>Rent</td><td>'+fmt(d.rent)+' / month</td></tr><tr><td>Brings locals</td><td>+'+d.res+' guest demand</td></tr>':'')+(d.rad?'<tr><td>Range</td><td>'+d.rad+' tiles</td></tr>':'')+'<tr><td>Upkeep</td><td>'+fmt(d.up)+' / month</td></tr></table>';
  }
  h+='<p class="blurb">'+esc(d.b)+'</p>';
  h+='<div class="row"><button data-a="locate" data-v="'+x.id+'">Locate</button> <button data-a="demolish" data-v="'+x.id+'">'+(UI.confirm===x.id?'Click again to demolish':'Demolish (+'+fmt(Math.round(x.cost*0.4))+')')+'</button></div>';
  return h;
 },{w:300,x:window.innerWidth-312,y:62,live:true});
}
function guestStatus(g){if(g.st==='ride'){var o=S.objs[g.on];return o?(g.watch?'Watching ':'On ')+oname(o):'Riding';}if(g.st==='queue'){o=S.objs[g.on];return 'Queuing for '+(o?oname(o):'a ride');}if(g.st==='sit')return 'Sitting on a bench';if(g.tgt==='exit')return 'Leaving the park';if(g.tgt&&S.objs[g.tgt])return 'Heading to '+oname(S.objs[g.tgt]);return 'Walking around';}
function guestWin(g){
 UI.selGuest=g;
 openWin('guest',function(){return g.n;},function(){
  if(g.st==='gone')return '<p>'+esc(g.n)+' has left the park.</p>';
  var h='<div class="row"><b>'+esc(guestStatus(g))+'</b></div><div class="thoughts">'+g.th.map(function(t){return '<div class="'+(t.m>0?'ok':t.m<0?'no':'')+'">\u201c'+esc(t.s)+'\u201d</div>';}).join('')+'</div>';
  h+='<table class="kv"><tr><td>Happiness</td><td>'+bar(g.happy,g.happy<30?'#c00':'#080')+'</td></tr><tr><td>Energy</td><td>'+bar(g.energy)+'</td></tr><tr><td>Hunger</td><td>'+bar(g.hunger,'#a60')+'</td></tr><tr><td>Thirst</td><td>'+bar(g.thirst,'#06a')+'</td></tr><tr><td>Nausea</td><td>'+bar(g.naus,'#6a0')+'</td></tr><tr><td>Toilet</td><td>'+bar(g.wc,'#880')+'</td></tr>';
  h+='<tr><td>Cash</td><td>'+fmt(g.cash)+' (spent '+fmt(g.spent)+')</td></tr><tr><td>Rides taken</td><td>'+g.rides+'</td></tr><tr><td>Likes intensity up to</td><td>'+g.imax.toFixed(1)+'</td></tr><tr><td>Carrying</td><td>'+([g.mask?'dust mask':'',g.souv?'Harlan\u2019s souvenir':'',g.trash?'wrapper':''].filter(Boolean).join(', ')||'nothing')+'</td></tr></table>';
  return h+'<div class="row"><button data-a="gloc">Locate</button></div>';
 },{w:290,x:window.innerWidth-302,y:62,live:true});
}
function guestsWin(){
 openWin('guests','Guests',function(){
  var n=S.guests.length,cnt={};S.guests.forEach(function(g){if(g.th[0]){var s=g.th[0].s.replace(/^I just got to .*/,'I just got to the park!');cnt[s]=(cnt[s]||0)+1;}});
  var top=Object.keys(cnt).sort(function(a,b){return cnt[b]-cnt[a];}).slice(0,9);
  var h='<table class="kv"><tr><td>In the park now</td><td>'+n+'</td></tr><tr><td>Total visitors</td><td>'+S.totalGuests+'</td></tr><tr><td>Average happiness</td><td>'+bar(S.avgHappy||0,'#080')+'</td></tr><tr><td>Park can draw about</td><td>'+(S.want||0)+'</td></tr><tr><td>Turned away (too poor for the fee)</td><td>'+S.turned+'</td></tr></table>';
  h+='<div class="sub">What guests are thinking</div><div class="thoughts">'+(top.map(function(s){return '<div>'+cnt[s]+' \u00d7 \u201c'+esc(s)+'\u201d</div>';}).join('')||'<div>Nobody here yet.</div>')+'</div>';
  h+='<div class="sub">Some guests (click to follow)</div><div class="glist">'+S.guests.slice(-14).reverse().map(function(g){return '<button data-a="pickg" data-v="'+g.id+'">'+esc(g.n)+' \u2014 '+Math.round(g.happy)+'%</button>';}).join('')+'</div>';
  return h;
 },{w:330,live:true});
}
function staffWin(){
 openWin('staff','Staff',function(){
  var h='<div class="sub">Hire</div>';Object.keys(STAFF).forEach(function(t){var d=STAFF[t];h+='<button class="item" data-a="hire" data-v="'+t+'"><span class="sw" style="background:'+d.col+'"></span><b>'+d.n+'</b><em>'+fmt(d.w)+'/mo</em><small>'+esc(d.b)+'</small></button>';});
  h+='<div class="sub">Your staff ('+S.staff.length+')</div><div class="glist">';
  S.staff.forEach(function(s){h+='<div class="srow"><span class="sw" style="background:'+STAFF[s.type].col+'"></span>'+esc(s.n)+' <small>'+STAFF[s.type].n.split(' (')[0]+' \u00b7 '+(s.st==='work'?'working':s.tgt?'on a job':'patrolling')+' \u00b7 jobs '+s.done+'</small> <button data-a="sloc" data-v="'+s.id+'">Locate</button><button data-a="fire" data-v="'+s.id+'">Fire</button></div>';});
  return h+'</div>';
 },{w:360,live:true});
}
function finWin(){
 openWin('fin','Finances',function(){
  var cols=[S.fin.cur].concat(S.fin.hist.slice(0,3)),m=Math.floor(S.day/MDAYS);
  var head=cols.map(function(c,i){var mm=m-i;return '<th>'+(i===0?'This month':'M'+(mm%YMONTHS+1)+' Y'+(Math.floor(mm/YMONTHS)+1))+'</th>';}).join('');
  var rows=[['adm','Park admissions',1],['ride','Ride tickets',1],['food','Food & drink',1],['shop','Shops',1],['rent','Habitat rent',1],['build','Construction',-1],['upkeep','Upkeep',-1],['wages','Staff wages',-1],['interest','Loan interest',-1]];
  var h='<table class="fin"><tr><th></th>'+head+'</tr>';
  rows.forEach(function(r){h+='<tr><td>'+r[1]+'</td>'+cols.map(function(c){var v=(c[r[0]]||0)*r[2];return '<td class="'+(v<0?'neg':'')+'">'+(v?fmt(v):'')+'</td>';}).join('')+'</tr>';});
  h+='<tr class="tot"><td>Profit</td>'+cols.map(function(c){var v=c.adm+c.ride+c.food+c.shop+c.rent-c.build-c.upkeep-c.wages-c.interest;return '<td class="'+(v<0?'neg':'')+'">'+fmt(v)+'</td>';}).join('')+'</tr></table>';
  h+='<table class="kv"><tr><td>Cash</td><td><b>'+fmt(S.money)+'</b></td></tr><tr><td>Loan (10%/yr)</td><td><button data-a="loan" data-v="-1000">\u2212$1,000</button> <b>'+fmt(S.loan)+'</b> <button data-a="loan" data-v="1000">+$1,000</button></td></tr><tr><td>Max loan</td><td>'+fmt(S.maxLoan)+'</td></tr><tr><td>Park value</td><td>'+fmt(parkValue())+'</td></tr><tr><td>Company value</td><td>'+fmt(companyValue())+'</td></tr></table>';
  return h;
 },{w:440,live:true});
}
function parkWin(){
 openWin('park','Park \u2014 '+S.park,function(){
  var U=utilities(),gs=goalStatus();
  var h='<div class="row"><button data-a="popen" data-v="1"'+(S.open?' class="on"':'')+'>Park open</button> <button data-a="popen" data-v="0"'+(!S.open?' class="on"':'')+'>Closed</button></div>';
  h+='<div class="row">Entry fee: <button data-a="fee" data-v="-1">\u2212</button> <b class="big">'+fmt(S.fee)+'</b> <button data-a="fee" data-v="1">+</button></div>';
  h+='<table class="kv"><tr><td>Park rating</td><td>'+bar(S.rating/10,S.rating<400?'#c00':'#080')+' <b>'+S.rating+'</b></td></tr><tr><td>Guests</td><td>'+S.guests.length+'</td></tr><tr><td>Average happiness</td><td>'+(S.avgHappy||0)+'%</td></tr><tr><td>Litter on paths</td><td>'+(S.lit||0)+'</td></tr>';
  h+='<tr><td>Power</td><td>'+U.pwP+' made / '+U.pwU+' used'+(U.pwU>U.pwP?' <span class="no">SHORT</span>':'')+'</td></tr><tr><td>Oxygen</td><td>'+U.o2P+' made / '+(S.o2need||0)+' needed'+(S.o2def?' <span class="no">LOW</span>':'')+'</td></tr><tr><td>Weather</td><td>'+(S.storm?'<span class="no">Dust storm ('+S.storm+' sols)</span>':'Clear')+'</td></tr><tr><td>Vex incidents</td><td>'+S.vexN+'</td></tr></table>';
  h+='<div class="sub">Scenario: '+esc(SCN[S.scen].n)+'</div>';
  if(gs){h+='<p class="blurb">'+esc(SCN[S.scen].b)+'</p><ul class="goal">'+gs.parts.map(function(p){return '<li class="'+(p.ok?'ok':'')+'">'+(p.ok?'\u2714 ':'\u2610 ')+esc(p.t)+' <small>(now: '+p.now+')</small></li>';}).join('')+'</ul><div class="row"><small>Deadline: '+gs.by+' \u00b7 today is '+dateStr()+(S.won?' \u00b7 <b class="ok">WON!</b>':'')+(S.lost?' \u00b7 <b class="no">time up</b>':'')+'</small></div>';}
  else h+='<p class="blurb">Sandbox. No goals, just build.</p>';
  return h;
 },{w:340,live:true});
}
function newsWin(){openWin('news','Messages',function(){return '<div class="thoughts news">'+S.msgs.slice().reverse().map(function(m){return '<div class="'+(m.k==='good'?'ok':m.k==='bad'?'no':'')+'"><small>'+dateStr(m.d)+'</small> '+esc(m.t)+'</div>';}).join('')+'</div>';},{w:380,live:true});}
function fileWin(){
 openWin('file','File & Options',function(){
  var h='<div class="row"><button data-a="menu">New game\u2026</button></div><div class="sub">Save / load</div>';
  if(!store.persistent)h+='<div class="note">Saving is switched off in this browser (private mode or an in-app browser). Open the game in your normal browser to keep saves.</div>';
  ['1','2','3','auto'].forEach(function(s){var m=saveMeta(s);h+='<div class="srow"><b>'+(s==='auto'?'Autosave':'Slot '+s)+'</b> <small>'+(m?esc(m.sc)+' \u00b7 '+esc(m.d)+' \u00b7 '+m.g+' guests':'empty')+'</small> '+(s!=='auto'?'<button data-a="save" data-v="'+s+'">Save</button>':'')+(m?'<button data-a="load" data-v="'+s+'">Load</button>':'')+'</div>';});
  h+='<div class="sub">Options</div><div class="row"><button data-a="sound" class="'+(Sfx.on?'on':'')+'">Sound: '+(Sfx.on?'On':'Off')+'</button> <button data-a="grid" class="'+(Render.grid?'on':'')+'">Grid: '+(Render.grid?'On':'Off')+'</button> <button data-a="edge" class="'+(Game.edge?'on':'')+'">Edge scroll: '+(Game.edge?'On':'Off')+'</button></div>';
  return h;
 },{w:360});
}
function helpWin(){
 openWin('help','How to play',function(){return '<div class="help"><p><b>Red Horizon Tycoon</b> \u2014 build a theme park on Mars in Aetheria, the world of <i>Echoes of the Red Horizon</i>.</p>'+
  '<p><b>Build:</b> pick a menu up top (Rides, Coaster, Zoo, Aquarium, Colony, Shops, Scenery, Paths), choose something, click the map. Right-click or Esc to stop building.</p>'+
  '<p><b>Paths:</b> guests only walk on paths. Every ride, stall and exhibit must touch one.</p>'+
  '<p><b>Coasters:</b> place a Station by a path, lay Track out of both sides, raise it for a lift hill, drop it, and close the loop.</p>'+
  '<p><b>Keep guests happy:</b> food, drinks, restrooms, benches, bins, scenery. Hire Scavengers to sweep, Mechanics to fix, Keepers to feed creatures, Fringe Watch to stop Vex.</p>'+
  '<p><b>Mars stuff:</b> rides need power (Geothermal Vents). Big crowds need oxygen (Greenhouses, Mush Farms). Aquarium domes need polar ice nearby. Dust storms: sell masks, build Shelter Domes.</p>'+
  '<p><b>Controls:</b> drag or arrow keys/WASD to scroll \u00b7 mouse wheel or +/\u2212 to zoom \u00b7 move the mouse to the edge to scroll \u00b7 Space pause \u00b7 1\u20134 speed \u00b7 [ ] track height \u00b7 G grid \u00b7 B bulldozer \u00b7 click a guest to read their thoughts. On touch: tap to build or inspect, drag to scroll (two fingers while building).</p></div>';},{w:420});
}
function menuWin(){
 Game.mode='menu';document.body.classList.add('inmenu');
 for(var k in UI.wins)if(k!=='menu')closeWin(k);
 var sel=UI.menuSel||'fringe';
 openWin('menu','Red Horizon Tycoon',function(){
  var h='<div class="logo"><span>RED HORIZON</span><b>TYCOON</b><i>A park on Mars \u00b7 from the world of <u>Echoes of the Red Horizon</u></i></div>';
  h+='<div class="sub">Choose a scenario</div><div class="scen">'+SCEN.map(function(s){return '<button data-a="msel" data-v="'+s.id+'" class="'+(s.id===(UI.menuSel||'fringe')?'on':'')+'"><b>'+esc(s.n)+'</b><small>'+esc(s.b)+'</small></button>';}).join('')+'</div>';
  h+='<div class="row c"><button class="go" data-a="start">\u25b6 Start new park</button>';
  var am=saveMeta('auto');if(am)h+=' <button data-a="load" data-v="auto">Continue ('+esc(am.d)+')</button>';
  ['1','2','3'].forEach(function(s){var m=saveMeta(s);if(m)h+=' <button data-a="load" data-v="'+s+'">Load slot '+s+'</button>';});
  h+=' <button data-a="help">How to play</button></div><div class="row c"><small>Free \u00b7 no download \u00b7 no ads \u00b7 by @MrPetecastic \u00b7 sound is off (turn on in File)</small></div>';
  return h;
 },{w:520,x:Math.max(4,(window.innerWidth-520)/2),y:Math.max(8,window.innerHeight*0.12)});
 var mw=UI.wins.menu;if(mw)mw.el.querySelector('.x').style.display='none';
}
UI.endDialog=function(won){
 Game.speed=0;
 openWin('end',won?'Scenario complete!':'Scenario over',function(){var gs=goalStatus();return '<div class="end '+(won?'won':'')+'"><b>'+(won?'\u2605 You did it! \u2605':'Time\u2019s up')+'</b><p>'+esc(SCN[S.scen].n)+'</p><ul class="goal">'+gs.parts.map(function(p){return '<li class="'+(p.ok?'ok':'')+'">'+(p.ok?'\u2714 ':'\u2716 ')+esc(p.t)+'</li>';}).join('')+'</ul><p>You can keep playing this park as long as you like.</p><div class="row c"><button data-a="close">Keep playing</button> <button data-a="menu">New game</button> <button data-a="share">Brag on X</button></div></div>';},{w:340,x:Math.max(4,(window.innerWidth-340)/2),y:120});
};
function startGame(sid){
 closeWin('menu');setState(newState(sid));Game.mode='play';Game.speed=1;document.body.classList.remove('inmenu');
 cam.z=window.innerWidth<700?1:2;centerOn(EX,EY-8);
 msg('Welcome to '+SCN[sid].n+'. '+(SCN[sid].goal?'Open the Park window (flag) to see your goal.':'Sandbox: build anything.'),'good');
 msg('Tip: guests only walk on paths. Start by laying paths from the entrance, then add a ride and a food stall.');
 if(window.innerWidth>700)buildWin('rides');
 updateSpeedBtns();
}
function share(){
 var text='I\u2019m building a theme park on Mars in Red Horizon Tycoon. Coasters, Glowhounds, an Aquavore dome, dust storms and Vex. Free, 2000s PC style, right from X. #RedHorizonTycoon #XCOMIX';
 var url='https://petecastic.github.io/xcomix-memory/tycoon/';
 var href='https://x.com/intent/post?text='+encodeURIComponent(text)+'&url='+encodeURIComponent(url);
 var w=null;try{w=window.open(href,'_blank');}catch(e){}if(!w)location.href=href;
}
// ---- actions ----
var ACT={
 close:function(v,wid){closeWin(wid);if(wid==='end'&&Game.mode==='play'&&!Game.speed){Game.speed=1;updateSpeedBtns();}},
 tab:function(v){UI.buildCat=v;setTool(null);refreshWin(UI.wins.build);},
 tool:function(v){var t=v==='path'?{k:'path'}:v==='bull'?{k:'bull'}:v==='track'?{k:'track'}:{k:'obj',id:v};
  var cur=UI.tool;if(cur&&cur.k===t.k&&cur.id===t.id)setTool(null);else setTool(t);Sfx.play('click');},
 th:function(v){UI.trackH=clamp(UI.trackH+Number(v),0,12);refreshWin(UI.wins.build);},
 price:function(v){var a=v.split(','),o=S.objs[a[0]];if(!o)return;o.price=clamp(o.price+Number(a[1]),0,30);},
 setopen:function(v){var a=v.split(','),o=S.objs[a[0]];if(!o)return;if(a[1]==='1'&&DEF[o.t].k==='coaster'&&!o.ok){UI.ticker(o.cn+' isn\u2019t finished yet.','bad');return;}o.open=a[1]==='1';},
 demolish:function(v){var o=S.objs[v];if(!o)return;if(UI.confirm!==o.id){UI.confirm=o.id;return;}removeObj(o,true);validateAll();closeWin('obj');Sfx.play('boom');},
 locate:function(v){var o=S.objs[v];if(o)centerOn(o.x+o.w/2,o.y+o.h/2);},
 info:function(v){var o=S.objs[v];if(o)objWin(o);},
 gloc:function(){if(UI.selGuest)centerOn(UI.selGuest.fx,UI.selGuest.fy);},
 pickg:function(v){var g=S.guests.filter(function(x){return String(x.id)===v;})[0];if(g){guestWin(g);centerOn(g.fx,g.fy);}},
 hire:function(v){hire(v);},
 fire:function(v){S.staff=S.staff.filter(function(s){if(String(s.id)===v){if(s.tgt&&S.objs[s.tgt]){S.objs[s.tgt].mech=0;S.objs[s.tgt].keeper=0;}return false;}return true;});},
 sloc:function(v){var s=S.staff.filter(function(x){return String(x.id)===v;})[0];if(s)centerOn(s.fx,s.fy);},
 loan:function(v){v=Number(v);if(v>0){var a=Math.min(v,S.maxLoan-S.loan);if(a<=0){UI.ticker('You can\u2019t borrow any more.','bad');return;}S.loan+=a;S.money+=a;}else{var p=Math.min(-v,S.loan);if(S.money<p){UI.ticker('Not enough cash to pay that back.','bad');return;}S.loan-=p;S.money-=p;}},
 fee:function(v){S.fee=clamp(S.fee+Number(v),0,60);},
 popen:function(v){S.open=v==='1';msg(S.open?'The park is open!':'The park is closed. Guests will head home.');},
 save:function(v){var ok=save(v);UI.ticker(ok?'Saved to slot '+v+'.':'Couldn\u2019t save in this browser (storage is off).',ok?'good':'bad');refreshWin(UI.wins.file);},
 load:function(v){if(load(v)){closeWin('menu');Game.mode='play';Game.speed=1;document.body.classList.remove('inmenu');for(var k in UI.wins)closeWin(k);centerOn(EX,EY-12);msg('Loaded. '+dateStr(),'good');updateSpeedBtns();}else UI.ticker('That save couldn\u2019t be loaded.','bad');},
 menu:function(){closeWin('end');menuWin();Game.demoState=null;bootDemoBG();},
 msel:function(v){UI.menuSel=v;refreshWin(UI.wins.menu);},
 start:function(){startGame(UI.menuSel||'fringe');},
 help:function(){helpWin();},
 sound:function(){Sfx.toggle();refreshWin(UI.wins.file);},
 grid:function(){Render.grid=!Render.grid;Render.dirty=true;refreshWin(UI.wins.file);},
 edge:function(){Game.edge=!Game.edge;refreshWin(UI.wins.file);},
 share:function(){share();}
};
function bootDemoBG(){buildDemo();warm(900);Game.demoX=P(37,48)[0];Game.demoY=P(37,48)[1];centerOn(37,48);cam.z=window.innerWidth<700?1:2;}
// ---- toolbar ----
var ICONS={
 file:'kkkkkkkkk.|kbwwwwwbk.|kbwwwwwbkk|kbwwwwwbbk|kbbbbbbbbk|kbbbbbbbbk|kbssssbbbk|kbskksbbbk|kbskksbbbk|kkkkkkkkkk',
 pause:'..........|.kkk..kkk.|.kss..kss.|.kss..kss.|.kss..kss.|.kss..kss.|.kss..kss.|.kss..kss.|.kkk..kkk.|..........',
 rides:'...kkkk...|..k.ry.k..|.k..kk..k.|.kbkkkkgk.|.k..kk..k.|..k.pk.k..|...kkkk...|...k..k...|..k....k..|.kkkkkkkk.',
 coaster:'..........|.rr.......|r..r....r.|r...r..r.r|.....rr...|..........|.k...k..k.|.k...k..k.|.k...k..k.|kkkkkkkkkk',
 zoo:'..........|.c......c.|.cc....cc.|.cccccccc.|.ckcccckc.|.cccccccc.|..cckkcc..|...cccc...|..c....c..|..........',
 aqua:'...kkkk...|..kccccck.|.kcccccck.|kccyycccck|kcyyyyccck|kccyycccck|kccccccbck|kcccbcccck|kkkkkkkkkk|ssssssssss',
 city:'....kk....|...kwwk...|..kwwwwk..|.kwwwwwwk.|kwwwbbwwwk|kwwwbbwwwk|kwwwwwwwwk|kkkkkkkkkk|nnnnnnnnnn|..........',
 shops:'kkkkkkkkkk|rwrwrwrwrw|rwrwrwrwrw|.kyyyyyyk.|.kyyyyyyk.|.kk....kk.|.kk....kk.|.kkkkkkkk.|.k......k.|.kkkkkkkk.',
 scen:'....g.....|...ggg....|..ggggg...|.ggrgggg..|..ggggg...|.gggggrg..|ggrggggg..|....n.....|....n.....|...nnn....',
 land:'..........|....kk....|...kyyk...|..kyyyyk..|.kyyyyyyk.|kyyyyyyyyk|.kyyyyyyk.|..kyyyyk..|...kyyk...|....kk....',
 bull:'..........|.yyyyy....|.ykkky....|.yyyyyyy..|.yyyyyyyk.|.yyyyyyyks|..........|.kkkkkkk..|k.k.k.k.k.|.kkkkkkk..',
 staff:'...bbbb...|..bbbbbb..|...oooo...|...oooo...|..gggggg..|.gggggggg.|.g.gggg.g.|...gggg...|...k..k...|..kk..kk..',
 guests:'..oo...oo.|..oo...oo.|.rrrr.bbbb|.rrrr.bbbb|.rrrr.bbbb|..kk...kk.|..kk...kk.|..........|..........|..........',
 fin:'...kkkk...|..kyyyyk..|.kyykkyyk.|.kyykyyyk.|.kyyykkyk.|.kyyyykyk.|.kykkkyyk.|.kyyyyyyk.|..kyyyyk..|...kkkk...',
 park:'.k........|.krrrrr...|.krrrrrr..|.krrrrr...|.k........|.k........|.k........|.k........|.k........|kkk.......',
 news:'kkkkkkkkkk|kwwwwwwwwk|kwkkkkwwwk|kwkkkkwssk|kwwwwwwwwk|kwssssssswk|kwssssssssk|kwwwwwwwwk|kkkkkkkkkk|..........',
 help:'..kkkkk...|.kbbbbbk..|kbbwwwbbk.|kbbbbwbbk.|.kbbwwbk..|..kbwbbk..|..kbbbbk..|..kbwbbk..|...kkkk...|..........',
 share:'..........|......k...|......kk..|kkkkkkkkk.|kwwwwwwkkk|kwwwwwwkk.|kwk...k...|kwk.......|kkkkkkk...|..........'
};
var PAL={k:'#000',r:'#d02020',y:'#f0d020',g:'#20a040',b:'#2050d0',w:'#ffffff',o:'#f0a060',c:'#30c8d8',p:'#9040c0',n:'#7a4a20',s:'#909090'};
function iconURL(name){var rows=ICONS[name].split('|'),c=document.createElement('canvas');c.width=10;c.height=10;var x=c.getContext('2d');
 rows.forEach(function(r,j){for(var i=0;i<10&&i<r.length;i++){var ch=r.charAt(i);if(PAL[ch]){x.fillStyle=PAL[ch];x.fillRect(i,j,1,1);}}});return c.toDataURL();}
var TB=[['file','File','file'],['pause','Pause','pause'],['s1','1\u00d7',null],['s2','2\u00d7',null],['s4','4\u00d7',null],['s8','8\u00d7',null],['zo','Zoom \u2212',null],['zi','Zoom +',null],['|'],
 ['b-rides','Rides','rides'],['b-coaster','Coaster','coaster'],['b-zoo','Zoo','zoo'],['b-aqua','Aquarium','aqua'],['b-city','Colony','city'],['b-shops','Shops','shops'],['b-scen','Scenery','scen'],['b-land','Paths','land'],['bull','Bulldoze','bull'],['|'],
 ['staff','Staff','staff'],['guests','Guests','guests'],['fin','Money','fin'],['park','Park','park'],['news','News','news'],['help','Help','help'],['share','Post','share']];
function buildToolbar(){var tb=$('toolbar');if(!tb)return;
 tb.innerHTML=TB.map(function(b){if(b[0]==='|')return '<span class="sep"></span>';return '<button data-t="'+b[0]+'" title="'+b[1]+'">'+(b[2]?'<img alt="" src="'+iconURL(b[2])+'">':'<span class="tx">'+b[1].split(' ').pop()+'</span>')+'<small>'+b[1].replace('Zoom ','Zoom')+'</small></button>';}).join('');
 tb.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var t=b.getAttribute('data-t');Sfx.play('click');
  if(t==='file')fileWin();else if(t==='pause'){Game.speed=Game.speed?0:(Game.prevSpeed||1);if(Game.speed)Game.prevSpeed=Game.speed;}
  else if(t.charAt(0)==='s'&&t.length===2){Game.speed=Number(t.charAt(1));Game.prevSpeed=Game.speed;}
  else if(t==='zi')zoomStep(1);else if(t==='zo')zoomStep(-1);
  else if(t.indexOf('b-')===0)buildWin(t.slice(2));
  else if(t==='bull'){buildWin('land');setTool({k:'bull'});}
  else if(t==='staff')staffWin();else if(t==='guests')guestsWin();else if(t==='fin')finWin();else if(t==='park')parkWin();else if(t==='news')newsWin();else if(t==='help')helpWin();else if(t==='share')share();
  updateSpeedBtns();});
}
function updateSpeedBtns(){var tb=$('toolbar');if(!tb)return;['s1','s2','s4','s8'].forEach(function(s){var b=tb.querySelector('[data-t="'+s+'"]');if(b)b.classList.toggle('on',Game.speed===Number(s.charAt(1)));});var p=tb.querySelector('[data-t="pause"]');if(p)p.classList.toggle('on',Game.speed===0);}
var ZOOMS=[0.5,1,2,3];
function zoomStep(dir,sx,sy){var i=ZOOMS.indexOf(cam.z);if(i<0)i=1;var ni=clamp(i+dir,0,ZOOMS.length-1);if(ni===i)return;
 if(sx===undefined){sx=cw/2;sy=ch/2;}var bx=(sx-cw/2)/cam.z+cam.x,by=(sy-ch/2)/cam.z+cam.y;cam.z=ZOOMS[ni];cam.x=bx-(sx-cw/2)/cam.z;cam.y=by-(sy-ch/2)/cam.z;clampCam();}
// ---- status bar ----
function updateStatus(){
 var el=$('status');if(!el||Game.mode!=='play')return;var U=utilities();
 var set=function(id,h){var e=$(id);if(e&&e.innerHTML!==h)e.innerHTML=h;};
 set('st-money','<b class="'+(S.money<0?'no':'')+'">'+fmt(S.money)+'</b>');set('st-guests',S.guests.length+(S.guests.length===1?' guest':' guests'));
 set('st-rating','Rating '+S.rating+' '+bar(S.rating/10,S.rating<400?'#c00':'#080'));set('st-date',dateStr());
 set('st-wx',S.storm?'<b class="no">DUST STORM</b>':'Clear skies');
 set('st-pw','\u26a1'+U.pwP+'/'+U.pwU+(U.pwU>U.pwP?' <b class="no">!</b>':''));set('st-o2','O\u2082 '+U.o2P+'/'+(S.o2need||U.o2U));
 for(var k in UI.wins){var w=UI.wins[k];if(w.live&&!UI.ptrDown)refreshWin(w);}
}
// ---- pointer & keys on the map ----
var ptrs={},drag=null,pinch=null;
function tileAt(sx,sy){var w=screenToWorld(sx,sy);return[Math.floor(w[0]),Math.floor(w[1])];}
function toolAnchor(t,tx,ty){if(t&&t.k==='obj'){var d=DEF[t.id];return[tx-((d.w-1)>>1),ty-((d.h-1)>>1)];}return[tx,ty];}
var lastTip='';
function floatText(sx,sy,t,col){var host=$('fx');if(!host)return;var e=document.createElement('div');e.className='ftxt';e.textContent=t;e.style.left=sx+'px';e.style.top=sy+'px';e.style.color=col||'#ffd84a';host.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);},1100);}
function applyTool(sx,sy,isDrag){
 var t=UI.tool;if(!t)return;var tt=tileAt(sx,sy),r=null;if(!inb(tt[0],tt[1]))return;
 if(isDrag&&drag&&drag.lastTile&&drag.lastTile[0]===tt[0]&&drag.lastTile[1]===tt[1])return;if(drag)drag.lastTile=tt;
 if(t.k==='path')r=placePath(tt[0],tt[1]);else if(t.k==='track')r=placeTrack(tt[0],tt[1],UI.trackH);else if(t.k==='bull')r=bulldoze(tt[0],tt[1]);
 else{if(isDrag&&DEF[t.id].k!=='scen')return;var a=toolAnchor(t,tt[0],tt[1]);r=place(t.id,a[0],a[1]);}
 if(r&&r.ok){if(r.cost)floatText(sx,sy-10,'-'+fmt(r.cost));if(r.what)floatText(sx,sy-10,'Removed '+r.what,'#fff');if(UI.wins.build)refreshWin(UI.wins.build);}
 else if(r&&r.why&&!isDrag){UI.ticker(r.why,'bad');floatText(sx,sy-10,r.why.split('.')[0],'#ff8070');}
}
function pickAt(sx,sy){
 var best=null,bd=12;
 S.guests.concat(S.staff).forEach(function(g){if(g.st==='gone'||(g.st==='ride'&&!g.watch))return;var p=worldToScreen(g.fx+(g.off||0),g.fy-(g.off||0),5);var dd=Math.abs(p[0]-sx)+Math.abs(p[1]-sy);if(dd<bd*Math.max(1,cam.z/1.5)){bd=dd;best=g;}});
 if(best){if(best.type){UI.ticker(best.n+' \u2014 '+STAFF[best.type].n+' ('+(best.st==='work'?'working':best.tgt?'on a job':'patrolling')+', '+best.done+' jobs done)');staffWin();}else guestWin(best);return;}
 for(var z=0;z<=60;z+=6){var t=tileAt(sx,sy+z*cam.z);if(!inb(t[0],t[1]))continue;var o=objAt(t[0],t[1]);if(o){objWin(o);return;}
  if(z===0&&S.trk[idx(t[0],t[1])]>=0){var cst=null;for(var k in S.objs){var c=S.objs[k];if(c.loop&&c.loop.indexOf(idx(t[0],t[1]))>=0)cst=c;}if(cst){objWin(cst);return;}buildWin('coaster');return;}}
 UI.selObj=null;closeWin('obj');
}
UI.drawGhost=function(){
 var h=UI.hover,t=UI.tool;if(!h||!t||Game.mode!=='play')return;
 var tiles=[],ok=true;
 if(t.k==='obj'){var d=DEF[t.id],a=toolAnchor(t,h[0],h[1]),f=footprintOk(t.id,a[0],a[1]);ok=f.ok&&S.money>=f.cost;for(var j=0;j<d.h;j++)for(var i=0;i<d.w;i++)tiles.push([a[0]+i,a[1]+j]);}
 else tiles.push(h);
 tiles.forEach(function(q){poly(ctx,[P(q[0],q[1]),P(q[0]+1,q[1]),P(q[0]+1,q[1]+1),P(q[0],q[1]+1)],t.k==='bull'?'rgba(255,80,40,0.35)':(ok?'rgba(90,255,90,0.35)':'rgba(255,60,60,0.4)'),t.k==='bull'?'#ff6040':(ok?'#7f7':'#f66'),1);});
 if(t.k==='track'){var c=P(h[0]+0.5,h[1]+0.5),cz=P(h[0]+0.5,h[1]+0.5,UI.trackH*HU+3);line(c,cz,'#fff',1);ell(cz[0],cz[1],6,3,'rgba(224,74,58,0.8)','#fff');ctx.fillStyle='#fff';ctx.font='bold 7px Tahoma,sans-serif';ctx.textAlign='center';ctx.fillText(String(UI.trackH),cz[0],cz[1]-5);}
};
function tipFor(sx,sy){var tip=$('tip');if(!tip)return;var t=UI.tool;if(!t||Game.mode!=='play'||!UI.hover){tip.style.display='none';return;}
 var s='';if(t.k==='obj'){var d=DEF[t.id],a=toolAnchor(t,UI.hover[0],UI.hover[1]),f=footprintOk(t.id,a[0],a[1]);s=d.n+' \u2014 '+(f.ok?fmt(f.cost):f.why);}
 else if(t.k==='path')s='Path $12';else if(t.k==='track')s='Track, height '+UI.trackH;else s='Bulldozer';
 if(s!==lastTip){tip.textContent=s;lastTip=s;}tip.style.display='block';tip.style.left=(sx+16)+'px';tip.style.top=(sy+18)+'px';}
function bindInput(){
 cv.addEventListener('contextmenu',function(e){e.preventDefault();});
 cv.addEventListener('pointerdown',function(e){if(Game.mode!=='play')return;try{cv.setPointerCapture(e.pointerId);}catch(_){}
  ptrs[e.pointerId]={x:e.clientX,y:e.clientY};var n=Object.keys(ptrs).length;Game.mouse=Game.mouse||{};Game.mouse.down=true;
  if(n===1)drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,moved:false,btn:e.button,paint:false,lastTile:null};
  else if(n===2){if(drag)drag.multi=true;var k=Object.keys(ptrs),a=ptrs[k[0]],b=ptrs[k[1]];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),mx:(a.x+b.x)/2,my:(a.y+b.y)/2};}
  e.preventDefault();});
 cv.addEventListener('pointermove',function(e){
  var r=cv.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;
  Game.mouse=Game.mouse||{};Game.mouse.x=sx;Game.mouse.y=sy;Game.mouse.inside=true;Game.mouse.pt=e.pointerType;
  UI.hover=tileAt(sx,sy);if(!inb(UI.hover[0],UI.hover[1]))UI.hover=null;tipFor(sx,sy);
  if(!ptrs[e.pointerId])return;ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
  var ks=Object.keys(ptrs);
  if(ks.length>=2&&pinch){var a=ptrs[ks[0]],b=ptrs[ks[1]],d=Math.hypot(a.x-b.x,a.y-b.y),mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
   cam.x-=(mx-pinch.mx)/cam.z;cam.y-=(my-pinch.my)/cam.z;pinch.mx=mx;pinch.my=my;
   if(d/pinch.d>1.35){zoomStep(1,mx-r.left,my-r.top);pinch.d=d;}else if(d/pinch.d<0.74){zoomStep(-1,mx-r.left,my-r.top);pinch.d=d;}return;}
  if(!drag||drag.id!==e.pointerId)return;
  var dx=e.clientX-drag.lx,dy=e.clientY-drag.ly;
  if(!drag.moved&&Math.abs(e.clientX-drag.sx)+Math.abs(e.clientY-drag.sy)>6){drag.moved=true;
   var t=UI.tool;drag.paint=!!t&&drag.btn===0&&!drag.multi&&(t.k==='path'||t.k==='track'||t.k==='bull'||(t.k==='obj'&&DEF[t.id].k==='scen'));
   if(drag.paint)applyTool(drag.sx-r.left,drag.sy-r.top,true);}
  if(drag.moved){if(drag.paint)applyTool(sx,sy,true);else{cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam();}}
  drag.lx=e.clientX;drag.ly=e.clientY;});
 var up=function(e){var r=cv.getBoundingClientRect(),sx=e.clientX-r.left,sy=e.clientY-r.top;
  if(drag&&drag.id===e.pointerId&&!drag.moved&&!drag.multi&&e.type==='pointerup'){
   if(drag.btn===2){if(UI.tool)setTool(null);}
   else if(UI.tool)applyTool(sx,sy,false);else pickAt(sx,sy);}
  delete ptrs[e.pointerId];if(!Object.keys(ptrs).length){drag=null;pinch=null;if(Game.mouse)Game.mouse.down=false;}};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 cv.addEventListener('pointerleave',function(){if(Game.mouse)Game.mouse.inside=false;UI.hover=null;var tip=$('tip');if(tip)tip.style.display='none';});
 cv.addEventListener('wheel',function(e){if(Game.mode!=='play')return;e.preventDefault();var r=cv.getBoundingClientRect();zoomStep(e.deltaY<0?1:-1,e.clientX-r.left,e.clientY-r.top);},{passive:false});
 var wins=$('wins');
 if(wins){wins.addEventListener('click',function(e){var b=e.target.closest('[data-a]');if(!b)return;var we=b.closest('.win'),wid=we?we.dataset.id:null,a=b.getAttribute('data-a');
   if(ACT[a]){ACT[a](b.getAttribute('data-v'),wid,b);Sfx.play('click');}UI.ptrDown=false;if(wid&&UI.wins[wid])refreshWin(UI.wins[wid]);updateSpeedBtns();});
  document.addEventListener('pointerup',function(){setTimeout(function(){UI.ptrDown=false;},0);});}
 window.addEventListener('keydown',function(e){if(Game.mode!=='play')return;var k=e.key;if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  if(k.length===1)k=k.toLowerCase();
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d'].indexOf(k)>=0){Game.keys[k]=true;e.preventDefault();}
  else if(k==='+'||k==='=')zoomStep(1);else if(k==='-'||k==='_')zoomStep(-1);
  else if(k===' '){Game.speed=Game.speed?0:(Game.prevSpeed||1);e.preventDefault();updateSpeedBtns();}
  else if(k==='1'||k==='2'||k==='3'||k==='4'){Game.speed=[1,2,4,8][Number(k)-1];Game.prevSpeed=Game.speed;updateSpeedBtns();}
  else if(k==='Escape'){if(UI.tool)setTool(null);else{var top=null,z=-1;for(var id in UI.wins){var w=UI.wins[id];if(id!=='menu'&&Number(w.el.style.zIndex)>z){z=Number(w.el.style.zIndex);top=id;}}if(top)closeWin(top);}}
  else if(k==='g'){Render.grid=!Render.grid;Render.dirty=true;}
  else if(k==='b'){buildWin('land');setTool({k:'bull'});}
  else if(k==='['){UI.trackH=clamp(UI.trackH-1,0,12);if(UI.wins.build)refreshWin(UI.wins.build);}
  else if(k===']'){UI.trackH=clamp(UI.trackH+1,0,12);if(UI.wins.build)refreshWin(UI.wins.build);}});
 window.addEventListener('keyup',function(e){var k=e.key;if(k.length===1)k=k.toLowerCase();Game.keys[k]=false;});
 window.addEventListener('blur',function(){Game.keys={};});
}
function resize(){if(!cv)return;dpr=Math.min(2,window.devicePixelRatio||1);cw=cv.clientWidth||window.innerWidth;ch=cv.clientHeight||window.innerHeight;cv.width=Math.round(cw*dpr);cv.height=Math.round(ch*dpr);}
// ---------- boot ----------
function boot(){
 cv=$('cv');if(!cv)return;ctx=cv.getContext('2d');resize();window.addEventListener('resize',resize);
 if(store.get('rht-sound')==='1'){/* sound stays off until the player turns it on this session */}
 if(DEMO||PROMO){Game.mode='demo';buildDemo();warm(DEMO?700:1400);Game.speed=1;cam.z=PROMO?2:1;var f=PROMO?[38,47]:[36,50];Game.demoX=P(f[0],f[1])[0];Game.demoY=P(f[0],f[1])[1];centerOn(f[0],f[1]);
  if(PROMO){document.body.classList.add('promo');document.body.classList.remove('inmenu');resize();Game.speed=0;Game.demoX=P(38,47)[0];Game.demoY=P(38,47)[1];}}
 else{buildToolbar();bindInput();bootDemoBG();menuWin();setInterval(updateStatus,250);
  var tick=$('tick');if(tick)tick.addEventListener('click',newsWin);}
 window.requestAnimationFrame(loop);
}
window.RHT={get S(){return S;},w2s:worldToScreen,footprintOk:footprintOk,DEF:DEF,place:place,placePath:placePath,placeTrack:placeTrack,validateAll:validateAll,warm:warm,startGame:startGame,hire:hire,centerOn:centerOn,cam:cam,Game:Game,UI:UI,
 objWin:objWin,guestWin:guestWin,finWin:finWin,parkWin:parkWin,staffWin:staffWin,guestsWin:guestsWin,buildWin:buildWin,newsWin:newsWin,save:save,load:load,closeWin:closeWin,P:P,setTool:setTool,zoomStep:zoomStep,dateStr:dateStr};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
