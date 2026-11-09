/* Overmind's Rug Loom — Idle Arcade Simulator. 100% free parody browser game.
   Every number here is a fake arcade point saved in this browser. No wallet, no deposits, no transactions. */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var EMBED=document.body.classList.contains('embed');
var ART='../arcade/';
var CREW=[
 {id:'kilo',n:'Baby Kilo',t:'Static Fuzz Collector',img:ART+'cards/dk_kilo.jpg',c:15,p:.1,q:'Collects static fuzz from the crib. Do not wake him.'},
 {id:'dkorn',n:'Dkorn',t:'Spool Spinner',img:ART+'cards/dk_dkorn.jpg',c:100,p:1,q:'"You wake the baby, you eat the spool."'},
 {id:'bear',n:'Bear',t:'Tactical Lint Hound',img:ART+'art/bear_face.jpg',c:1100,p:8,q:'Sniffs out Golden Lint Bunnies (+3% bunny spawns each, max +60%).'},
 {id:'peter',n:'Peter',t:'Drop-Line Splicer',img:ART+'art/peter_face.jpg',c:12000,p:47,q:'Splices lint straight off the drop-line. Safety first.'},
 {id:'voltia',n:'Princess Voltia',t:'Arc Threader',img:ART+'cards/dk_voltia.jpg',c:130000,p:260,q:'Fiber-optic lasso threading. +1% Thread drip each.'},
 {id:'krampus',n:'Uncle Krampus',t:'3 AM Thermos Boiler',img:ART+'cards/dk_krampus.jpg',c:1.4e6,p:1400,q:'Steams lint fluffy with night-shift coffee.'},
 {id:'chart',n:'Hopium & Tape',t:'Chart Room Hype Desk',img:'',emo:'📺',c:2e7,p:7800,q:'Hopium yells rug puns. Tape reads the actual meter.'},
 {id:'marjorie',n:'Marjorie',t:'Fringe Inspector',img:ART+'art/marjorie_face.jpg',c:3.3e8,p:44000,q:'Measures every fringe. Writes everyone up. Production somehow goes up.'},
 {id:'overmind',n:'Overmind',t:'Cosmic Warp Weaver',img:ART+'art/overmind_head.jpg',c:5.1e9,p:260000,q:'Weaves lint across Dimensions 1–12. Smugly.'}
];
var UPG=[
 {id:'grip',n:'Pretzel Grip Gloves',d:'Tap power x2',c:100,k:'click',v:2},
 {id:'mustard',n:'Mustard Knuckles',d:'Tap power x2',c:2500,k:'click',v:2},
 {id:'steam',n:'Thermos Steam Crank',d:'Each tap also spins +2% of your Lint/sec',c:25000,k:'clickPct',v:.02},
 {id:'shuttle',n:'Fiber-Optic Shuttle',d:'All crew x2',c:60000,k:'crew',v:2},
 {id:'amber',n:'Amber Insulator Bobbins',d:'Each tap also spins +3% of your Lint/sec',c:8e5,k:'clickPct',v:.03},
 {id:'coil',n:'12:49 AM Arc Coil',d:'All crew x2',c:5e6,k:'crew',v:2},
 {id:'vat',n:'Golden Mustard Vat Lube',d:'All crew x2',c:2e8,k:'crew',v:2},
 {id:'pole',n:'Pole #A1gR-APBeVk Spindle',d:'All crew x2, taps x3',c:5e10,k:'both',v:2}
];
var RUGS=[
 {id:'mat',n:'Welcome Mat of Regret',d:'+5% Lint/sec per level',c:25},
 {id:'bath',n:'Bathmat of Bensalem',d:'+10% tap power per level',c:120},
 {id:'shag',n:'Shag Carpet of Sub-Station 13',d:'+5% Thread drip per level',c:600},
 {id:'paw',n:"Bear's Muddy Paw Runner",d:'+6% Golden Bunny spawns per level',c:3000},
 {id:'deli',n:"Sal's Oil-Drip Deli Runner",d:'+8% Lint/sec per level',c:15000},
 {id:'hoa',n:"Marjorie's HOA Measurement Rug",d:'+1h offline weaving cap per level',c:75000},
 {id:'faraday',n:"Princess Voltia's Faraday Throw Rug",d:'+8% Thread drip per level',c:375000},
 {id:'oriental',n:"Uncle Krampus's Coffee-Stained Oriental Rug",d:'+10% all crew per level',c:1.9e6},
 {id:'neon',n:'3 AM Valley Arcade Neon Carpet',d:'+15% Golden Bunny rewards per level',c:9.4e6},
 {id:'throne',n:"Overmind's Persian Throne Rug",d:'+15% everything per level',c:4.7e7}
];
var MAXLV=25;
var ACH=[
 ['spin1','First Spin','Tap the loom once',function(){return S.clicks>=1},1],
 ['spin500','Carpal Tunnel Vision','500 taps',function(){return S.clicks>=500},2],
 ['l1k','Lint Roller','1,000 Cable Lint spun (all time)',function(){return S.all>=1e3},1],
 ['l1m','Dryer Trap Legend','1M Cable Lint spun',function(){return S.all>=1e6},2],
 ['l1b','Lint Singularity','1B Cable Lint spun',function(){return S.all>=1e9},3],
 ['lock1','Read the Fine Print (Didn\'t)','Lock Lint in the Piggy Vault',function(){return S.locked>0},1],
 ['lock1m','Piggy Got Thicc','1M Lint locked in the vault',function(){return S.locked>=1e6},2],
 ['rug1','Interior Decorator','Weave your first rug',function(){return rugsOwned()>=1},1],
 ['rug5','Floor Is Lava (Covered)','Own 5 different rugs',function(){return rugsOwned()>=5},2],
 ['rug10','Wall-to-Wall Absurdity','Own all 10 rugs',function(){return rugsOwned()>=10},3],
 ['rugmax','Tassel Hassle','Any rug at level 10',function(){return S.rug.some(function(l){return l>=10})},2],
 ['bun1','Bunny Season','Catch a Golden Lint Bunny',function(){return S.bunnies>=1},1],
 ['bun25','Bunny Whisperer','Catch 25 Golden Lint Bunnies',function(){return S.bunnies>=25},2],
 ['crew50','Union Rep','Hire 50 crew total',function(){return crewTotal()>=50},2],
 ['crewall','The Whole Multiverse Shift','Hire every crew type',function(){return S.crew.every(function(n){return n>0})},3],
 ['combo','Static Cling','Reach a x2.0 tap combo',function(){return S.maxCombo>=50},1],
 ['prest','Rolled Up','Roll Up the Rugs once',function(){return S.rolls>=1},3],
 ['vip','Hard-Hat Drip','The loom wears the hard hat',function(){return true},1]
];
var TICK=[
 'HOPIUM: The Welcome Mat is going VERTICAL, folks!  TAPE: It\'s a mat. It\'s horizontal by design.',
 'HOPIUM: Thread count is UP four thousand percent!  TAPE: It went from one thread to forty.',
 'HOPIUM: Experts say this shag is the shag of the century!  TAPE: Experts are Bear. Bear is chewing it.',
 'HOPIUM: Breaking: Overmind promises the Piggy Vault is "totally legit."  TAPE: The pig is see-through. It\'s full of lint.',
 'HOPIUM: The Oriental Rug has never been more Oriental!  TAPE: Krampus spilled coffee on it again.',
 'HOPIUM: Tassels! Tassels as far as the eye can see!  TAPE: Marjorie says they\'re 0.2 inches out of code.',
 'HOPIUM: I\'m calling it: the Bathmat of Bensalem is the next big thing!  TAPE: It\'s damp, Hopium.',
 'MARJORIE: This runner is 4 feet 2 inches. The HOA allows 4 feet. You\'re getting a citation.',
 'OVERMIND: Your Lint is SAFE in my vault. Forever. In Dimensions 1–12. No take-backs.',
 'BABY KILO: *static fuzz giggle*   DKORN: Shhh. The grid can wait. The baby cannot.',
 'HOPIUM: Is this the floor? Because this rug just hit ROCK BOTTOM-LINE PERFECTION!  TAPE: Please stop.',
 'SAL: Who left an oil-drip runner in my deli? ...Oh. It\'s for the game. Carry on.',
 'TAPE: Reminder: Lint is fake. Thread is fake. The rugs are cartoons. Have a nice night.',
 'ZIB: hi from another timeline :)   OVERMIND: Get out of my loom.',
 'HOPIUM: Golden Lint Bunny spotted! Everyone CLICK!  TAPE: For once, he\'s right.'
];
/* ---------- state ---------- */
function fresh(){return {v:1,lint:0,all:0,run:0,locked:0,thread:0,threadAll:0,q:0,tassels:0,rolls:0,clicks:0,bunnies:0,maxCombo:0,crew:CREW.map(function(){return 0}),up:{},rug:RUGS.map(function(){return 0}),ach:{},auto:false,last:Date.now(),moth:0,started:Date.now()}}
var S=(window.XC&&XC.get('rugloom'))||fresh();
(function fix(){var f=fresh();for(var k in f)if(S[k]==null)S[k]=f[k];while(S.crew.length<CREW.length)S.crew.push(0);while(S.rug.length<RUGS.length)S.rug.push(0)})();
function save(){S.last=Date.now();if(window.XC)XC.set('rugloom',S)}
function rugsOwned(){return S.rug.filter(function(l){return l>0}).length}
function crewTotal(){return S.crew.reduce(function(a,b){return a+b},0)}
function lv(id){for(var i=0;i<RUGS.length;i++)if(RUGS[i].id===id)return S.rug[i];return 0}
/* ---------- economy ---------- */
var frenzy=0,frenzyT=0,combo=0,comboT=0;
function globalMult(){return (1+S.tassels*.05)*(1+lv('throne')*.15)}
function crewMult(i){var n=S.crew[i],m=1;[10,25,50,100,150,200,300].forEach(function(t){if(n>=t)m*=2});return m}
function crewUp(){var m=1;UPG.forEach(function(u){if(S.up[u.id]&&(u.k==='crew'||u.k==='both'))m*=u.v});return m}
function lps(){var t=0;for(var i=0;i<CREW.length;i++)t+=S.crew[i]*CREW[i].p*crewMult(i);
  t*=crewUp()*(1+lv('mat')*.05+lv('deli')*.08)*(1+lv('oriental')*.1)*globalMult();return t*(frenzy>0?7:1)}
function tapPow(){var m=1,pct=0;UPG.forEach(function(u){if(!S.up[u.id])return;if(u.k==='click')m*=u.v;if(u.k==='clickPct')pct+=u.v;if(u.k==='both')m*=3});
  return (1*m+lps()*pct)*(1+lv('bath')*.1)*globalMult()*(1+Math.min(combo,50)/50)}
function dripRate(){return .0005*(1+S.crew[4]*.01)*(1+lv('shag')*.05+lv('faraday')*.08)*(1+lv('throne')*.15)*(1+S.tassels*.05)}
function tps(){return S.locked*dripRate()}
function crewCost(i,n){var c=0,b=CREW[i].c;for(var k=0;k<(n||1);k++)c+=Math.ceil(b*Math.pow(1.15,S.crew[i]+k));return c}
function rugCost(i){return Math.ceil(RUGS[i].c*Math.pow(1.75,S.rug[i]))}
function offlineCap(){return (8+lv('hoa'))*3600}
function bunnyEvery(){return 75/((1+Math.min(.6,S.crew[2]*.03))*(1+lv('paw')*.06))}
function tasselsPossible(){return Math.floor(Math.cbrt(S.all/1e8))}
function gain(n){S.lint+=n;S.all+=n;S.run+=n}
/* ---------- format ---------- */
var SUF=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc'];
function fmt(n){if(!isFinite(n))return '∞';if(n<1000)return n<10&&n%1?n.toFixed(1):String(Math.floor(n));var e=Math.min(SUF.length-1,Math.floor(Math.log10(n)/3));return (n/Math.pow(1000,e)).toFixed(2).replace(/\.?0+$/,'')+SUF[e]}
function fmtT(s){s=Math.floor(s);var h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+'h '+m+'m':m?m+'m '+(s%60)+'s':s+'s'}
function sfx(f,d,t,v){if(window.XC)XC.sfx(f,d||.05,t||'square',v||.04)}
/* ---------- canvas scene ---------- */
var cv=$('#cv'),g=cv.getContext('2d'),W=640,H=360;
var rc=$('#room'),rg=rc?rc.getContext('2d'):null;
var parts=[],floats=[],arcs=[],bunny=null,moths=[],nextBunny=25+Math.random()*30,wheelA=0,wheelV=0,t0=0,time=0;
var LOOM={x:210,y:190,r:92},PIG={x:485,y:210};
var crewImgs=CREW.map(function(c){if(!c.img)return null;var im=new Image();im.src=c.img;return im});
function stars(){var r=XC.rng(7),a=[];for(var i=0;i<60;i++)a.push([r()*W,r()*150,r()*1.5+.3]);return a}
var STARS=window.XC?stars():[];
function vip(){return window.DKVIP&&DKVIP.isVip()}
function drawBG(){
  var gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#090523');gr.addColorStop(.6,'#1d0b40');gr.addColorStop(1,'#120726');g.fillStyle=gr;g.fillRect(0,0,W,H);
  STARS.forEach(function(s){g.fillStyle='rgba(255,255,255,'+(.4+.4*Math.sin(time*2+s[0]))+')';g.fillRect(s[0],s[1],s[2],s[2])});
  // sub-station silhouettes + poles + lines
  g.fillStyle='#0c0620';for(var i=0;i<6;i++){var x=20+i*110;g.fillRect(x,230,60,70);g.fillRect(x+10,210,8,20);g.fillRect(x+40,214,8,16)}
  g.strokeStyle=vip()?'#ffd400':'#2ee6ff';g.lineWidth=1.5;g.globalAlpha=.55;
  for(i=0;i<3;i++){g.beginPath();g.moveTo(0,60+i*14);g.quadraticCurveTo(320,100+i*14+Math.sin(time+i)*3,640,60+i*14);g.stroke()}
  g.globalAlpha=1;g.fillStyle='#3b2410';g.fillRect(28,40,8,260);g.fillRect(604,40,8,260);g.fillRect(14,52,36,5);g.fillRect(590,52,36,5);
  // floor
  g.fillStyle='#160a2c';g.fillRect(0,300,W,60);g.strokeStyle='#ff2ee633';g.lineWidth=1;
  for(i=0;i<=16;i++){g.beginPath();g.moveTo(320+(i-8)*20,300);g.lineTo(320+(i-8)*90,360);g.stroke()}
  for(i=0;i<4;i++){g.beginPath();g.moveTo(0,300+i*i*5);g.lineTo(W,300+i*i*5);g.stroke()}
  // neon sign
  g.save();g.font='bold 22px Impact,Arial Black,sans-serif';g.textAlign='center';g.shadowColor='#ff2ee6';g.shadowBlur=14+4*Math.sin(time*5);g.fillStyle='#ffd1fb';
  g.fillText("OVERMIND'S RUG LOOM",320,30);g.font='bold 10px Courier New,monospace';g.shadowBlur=6;g.shadowColor='#2ee6ff';g.fillStyle='#bff';g.fillText('IDLE ARCADE SIMULATOR · ALL POINTS FAKE · STAGE: A1gR-APBeVk',320,45);g.restore();
}
function drawLoom(){
  var x=LOOM.x,y=LOOM.y,r=LOOM.r,col=vip()?'#ffd400':'#2ee6ff';
  // frame
  g.fillStyle='#5a3416';g.fillRect(x-r-24,y+r-8,2*r+48,16);g.fillRect(x-r-18,y-20,12,r+20);g.fillRect(x+r+6,y-20,12,r+20);
  g.fillStyle='#8a5a2b';g.fillRect(x-8,y-8,16,r+10);
  // glow
  g.save();g.shadowColor=col;g.shadowBlur=20+wheelV*2;g.strokeStyle=col;g.lineWidth=6;g.beginPath();g.arc(x,y,r,0,7);g.stroke();g.restore();
  g.strokeStyle='#ff2ee6';g.lineWidth=2;g.beginPath();g.arc(x,y,r-9,0,7);g.stroke();
  // spokes
  g.save();g.translate(x,y);g.rotate(wheelA);g.strokeStyle='#e8d1ff';g.lineWidth=3;
  for(var i=0;i<12;i++){g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(i*Math.PI/6)*(r-10),Math.sin(i*Math.PI/6)*(r-10));g.stroke()}
  // yarn wound on hub
  var yr=18+Math.min(26,Math.log10(1+S.lint)*3);g.fillStyle='#d9c27a';g.beginPath();g.arc(0,0,yr,0,7);g.fill();
  g.strokeStyle='#a8893d';g.lineWidth=1;for(i=0;i<6;i++){g.beginPath();g.arc(0,0,yr-i*3,i,i+2.4);g.stroke()}
  g.restore();
  g.fillStyle='#ffd400';g.beginPath();g.ellipse(x,y-r-14,26,14,0,Math.PI,0);g.fill();g.fillRect(x-32,y-r-15,64,5);
  // thread from wheel to spool
  g.strokeStyle='#d9c27a';g.lineWidth=2;g.beginPath();g.moveTo(x+r-4,y-10);g.quadraticCurveTo(x+r+40,y-60+Math.sin(time*4)*6,PIG.x-90,PIG.y-40);g.stroke();
  // tap hint
  if(S.clicks<12){g.save();g.font='bold 15px Impact,sans-serif';g.textAlign='center';g.fillStyle='rgba(255,255,255,'+(.6+.4*Math.sin(time*6))+')';g.strokeStyle='#000';g.lineWidth=4;g.strokeText('TAP THE LOOM!',x,y+r+34);g.fillText('TAP THE LOOM!',x,y+r+34);g.restore()}
}
function drawPig(){
  var x=PIG.x,y=PIG.y,fill=Math.min(1,Math.log10(1+S.locked)/12);
  // overmind toaster above
  var oy=y-118+Math.sin(time*1.6)*4;g.fillStyle='#c7ccd1';g.fillRect(x-30,oy,60,36);g.fillStyle='#121018';g.fillRect(x-22,oy+6,44,22);
  g.save();g.shadowColor='#b57bff';g.shadowBlur=12;g.fillStyle='#8a2be2';g.beginPath();g.arc(x,oy+17,6+Math.sin(time*3),0,7);g.fill();g.restore();
  g.fillStyle='#777';g.fillRect(x-14,oy-4,28,4);g.font='bold 9px Courier New';g.textAlign='center';g.fillStyle='#b57bff';g.fillText('OVERMIND',x,oy+48);
  // body (glass)
  g.save();g.beginPath();g.ellipse(x,y,92,66,0,0,7);g.clip();
  g.fillStyle='rgba(180,230,255,.12)';g.fillRect(x-92,y-66,184,132);
  var top=y+66-132*fill;var lg=g.createLinearGradient(0,top,0,y+66);lg.addColorStop(0,'#e8dca8');lg.addColorStop(1,'#9c8f6a');g.fillStyle=lg;
  g.beginPath();g.moveTo(x-92,y+66);for(var i=0;i<=20;i++)g.lineTo(x-92+i*9.2,top+Math.sin(time*2+i)*2.5);g.lineTo(x+92,y+66);g.fill();
  // fuzz
  g.fillStyle='rgba(255,255,255,.35)';for(i=0;i<14;i++){var fx=x-80+((i*37)%160),fy=top+10+((i*23)%Math.max(10,y+60-top));if(fy<y+62)g.fillRect(fx,fy,3,2)}
  g.restore();
  g.strokeStyle='rgba(200,240,255,.9)';g.lineWidth=3;g.beginPath();g.ellipse(x,y,92,66,0,0,7);g.stroke();
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=4;g.beginPath();g.ellipse(x-30,y-30,30,14,-.5,3.6,5.2);g.stroke();
  // snout, ears, legs, slot
  g.fillStyle='rgba(255,170,210,.55)';g.strokeStyle='rgba(200,240,255,.9)';g.lineWidth=2;
  g.beginPath();g.ellipse(x+92,y+4,14,18,0,0,7);g.fill();g.stroke();g.fillStyle='#4b2a3a';g.fillRect(x+88,y-2,3,6);g.fillRect(x+95,y-2,3,6);
  g.fillStyle='rgba(255,170,210,.55)';g.beginPath();g.moveTo(x+40,y-58);g.lineTo(x+58,y-84);g.lineTo(x+66,y-50);g.fill();g.stroke();
  g.beginPath();g.moveTo(x-10,y-64);g.lineTo(x+4,y-90);g.lineTo(x+18,y-62);g.fill();g.stroke();
  [[-55,1],[-20,0],[25,0],[60,1]].forEach(function(l){g.fillStyle='rgba(200,240,255,.35)';g.fillRect(x+l[0],y+56,16,24);g.strokeRect(x+l[0],y+56,16,24)});
  g.fillStyle='#000';g.fillRect(x-22,y-66,44,5);
  g.fillStyle='#fff';g.font='bold 11px Tahoma';g.textAlign='center';g.fillText('TOTALLY-LEGIT GLASS PIGGY VAULT',x,y+98);
  g.fillStyle='#ff9ad5';g.font='bold 8px Courier New';g.fillText('LOCKED FOREVER IN DIMENSIONS 1–12 · NO REFUNDS, ONLY RUGS',x,y+110);
  g.font='bold 13px Courier New';g.strokeStyle='#000';g.lineWidth=4;g.strokeText(fmt(S.locked)+' LINT LOCKED',x,y+6);g.fillStyle='#ffd400';g.fillText(fmt(S.locked)+' LINT LOCKED',x,y+6);
  // thread drips
  if(S.locked>0){for(i=0;i<3;i++){var ph=(time*0.8+i/3)%1;g.strokeStyle=['#ff2ee6','#2ee6ff','#ffd400'][i];g.lineWidth=2;g.beginPath();g.moveTo(x+104,y+16+ph*60);g.lineTo(x+104,y+26+ph*60);g.stroke()}
    g.fillStyle='#8a5a2b';g.fillRect(x+92,y+86,26,10);g.fillStyle='#ff2ee6';g.fillRect(x+95,y+80,20,7);}
}
function drawCrew(){
  var shown=[];for(var i=0;i<CREW.length;i++)if(S.crew[i])shown.push(i);
  var n=shown.length;if(!n)return;var sp=Math.min(52,300/n);
  shown.forEach(function(i,k){var x=205-(n-1)*sp/2+k*sp,y=330+Math.sin(time*3+k)*3,R=22;
    g.save();g.beginPath();g.arc(x,y,R,0,7);g.closePath();g.fillStyle='#2a1a4a';g.fill();g.clip();
    var im=crewImgs[i];if(im&&im.complete&&im.naturalWidth){var s=Math.max(2*R/im.naturalWidth,2*R/im.naturalHeight)*1.15;var w=im.naturalWidth*s,h=im.naturalHeight*s;g.drawImage(im,x-w/2,y-R-(i===1||i===0||i===4||i===5?h*.05:h*.12)+0,w,h)}
    else{g.font='26px sans-serif';g.textAlign='center';g.fillText(CREW[i].emo||'⭐',x,y+9)}
    g.restore();g.strokeStyle=vip()?'#ffd400':'#2ee6ff';g.lineWidth=2;g.beginPath();g.arc(x,y,R,0,7);g.stroke();
    g.fillStyle='#000';g.fillRect(x+8,y+10,26,13);g.fillStyle='#ffd400';g.font='bold 10px Courier New';g.textAlign='center';g.fillText('x'+S.crew[i],x+21,y+20);
  });
}
function drawBunny(b){var hop=Math.abs(Math.sin(b.t*9))*14;var x=b.x,y=b.y-hop;
  g.save();g.translate(x,y);if(b.vx<0)g.scale(-1,1);g.shadowColor='#ffd400';g.shadowBlur=18;g.fillStyle='#ffe066';
  g.beginPath();g.ellipse(0,0,18,13,0,0,7);g.fill();g.beginPath();g.arc(15,-8,9,0,7);g.fill();
  g.beginPath();g.ellipse(13,-24,3.5,11,-.2,0,7);g.fill();g.beginPath();g.ellipse(19,-23,3.5,11,.25,0,7);g.fill();
  g.shadowBlur=0;g.fillStyle='#fff';g.beginPath();g.arc(-17,-2,5,0,7);g.fill();g.fillStyle='#000';g.fillRect(18,-11,2.5,2.5);g.restore();}
function drawMoth(m){g.save();g.translate(m.x,m.y);var f=Math.sin(time*30+m.k)*.6+.8;g.fillStyle='#bdb8c9';g.beginPath();g.ellipse(-8*f,0,10*f,7,0,0,7);g.ellipse(8*f,0,10*f,7,0,0,7);g.fill();g.fillStyle='#555';g.fillRect(-2,-6,4,12);g.strokeStyle='#2ee6ff';g.beginPath();g.moveTo(-1,-6);g.lineTo(-5,-13);g.moveTo(1,-6);g.lineTo(5,-13);g.stroke();g.restore()}
function drawHUD(){
  // combo meter
  g.fillStyle='#000a';g.fillRect(8,58,150,16);g.fillStyle=combo>=50?'#ffd400':'#ff2ee6';g.fillRect(10,60,146*Math.min(1,combo/50),12);
  g.fillStyle='#fff';g.font='bold 10px Courier New';g.textAlign='left';g.fillText('TAP COMBO x'+(1+Math.min(combo,50)/50).toFixed(2),14,70);
  if(frenzy>0){g.fillStyle='#ffd400';g.font='bold 13px Impact';g.fillText('LINT FRENZY x7 · '+Math.ceil(frenzy)+'s',8,92)}
  g.textAlign='right';g.fillStyle='#bff';g.font='bold 11px Courier New';g.fillText(fmt(lps())+' lint/s · '+fmt(tps())+' thread/s',632,70);
}
function frame(ts){
  var dt=Math.min(.1,Math.max(0,(ts-(t0||ts))/1000));t0=ts;time+=dt;
  // economy
  var l=lps()*dt;if(l>0){if(S.auto){var a=l*.1;S.locked+=a;gain(l);S.lint-=a}else gain(l)}
  var th=tps()*dt;S.thread+=th;S.threadAll+=th;
  if(frenzy>0)frenzy-=dt;comboT-=dt;if(comboT<0&&combo>0){combo=Math.max(0,combo-dt*40)}
  wheelV=Math.max(.4,wheelV*Math.pow(.25,dt));wheelA+=wheelV*dt;
  nextBunny-=dt;if(!bunny&&nextBunny<=0){var left=Math.random()<.5;bunny={x:left?-30:W+30,y:250+Math.random()*40,vx:(left?1:-1)*(70+Math.random()*40),t:0,life:9};nextBunny=bunnyEvery()*(.7+Math.random()*.6)}
  if(bunny){bunny.t+=dt;bunny.x+=bunny.vx*dt;if(bunny.x<-50||bunny.x>W+50)bunny=null}
  moths.forEach(function(m){m.x+=m.vx*dt;m.y+=Math.sin(time*3+m.k)*40*dt});moths=moths.filter(function(m){return m.x>-40&&m.x<W+40});
  parts.forEach(function(p){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.l-=dt});parts=parts.filter(function(p){return p.l>0});
  floats.forEach(function(f){f.y-=40*dt;f.l-=dt});floats=floats.filter(function(f){return f.l>0});
  arcs.forEach(function(a){a.l-=dt});arcs=arcs.filter(function(a){return a.l>0});
  // draw
  drawBG();drawLoom();drawPig();drawCrew();
  arcs.forEach(function(a){g.strokeStyle=vip()?'#ffd400':'#7ff';g.lineWidth=2;g.globalAlpha=a.l*6;g.beginPath();g.moveTo(a.p[0][0],a.p[0][1]);for(var i=1;i<a.p.length;i++)g.lineTo(a.p[i][0],a.p[i][1]);g.stroke();g.globalAlpha=1});
  parts.forEach(function(p){g.fillStyle=p.c;g.globalAlpha=Math.min(1,p.l*2);g.fillRect(p.x,p.y,p.s,p.s);g.globalAlpha=1});
  if(bunny)drawBunny(bunny);moths.forEach(drawMoth);
  floats.forEach(function(f){g.font='bold '+(f.big?18:14)+'px Impact,sans-serif';g.textAlign='center';g.globalAlpha=Math.min(1,f.l*2);if(f.box){var tw=g.measureText(f.t).width;g.fillStyle='rgba(0,0,0,.75)';g.fillRect(f.x-tw/2-10,f.y-19,tw+20,26)}g.strokeStyle='#000';g.lineWidth=3;g.strokeText(f.t,f.x,f.y);g.fillStyle=f.c||'#fff';g.fillText(f.t,f.x,f.y);g.globalAlpha=1});
  drawHUD();
  if(rg&&(Math.floor(time*4)!==drawRoom.k)){drawRoom.k=Math.floor(time*4);drawRoom()}
  requestAnimationFrame(frame);
}
/* ---------- input on scene ---------- */
function canvasXY(e){var r=cv.getBoundingClientRect();return [(e.clientX-r.left)*W/r.width,(e.clientY-r.top)*H/r.height]}
function burst(x,y,n,cols){for(var i=0;i<n;i++){var a=Math.random()*7,s=60+Math.random()*160;parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,l:.6+Math.random()*.5,s:2+Math.random()*3,c:cols[i%cols.length]})}}
function zap(){var p=[],x=LOOM.x+(Math.random()-.5)*60,y=LOOM.y-LOOM.r;p.push([x,y]);for(var i=0;i<6;i++){x+=(Math.random()-.5)*30;y-=12;p.push([x,y])}arcs.push({p:p,l:.18})}
function onDown(e){
  e.preventDefault();var xy=canvasXY(e),x=xy[0],y=xy[1];
  if(bunny&&Math.abs(x-bunny.x)<34&&Math.abs(y-(bunny.y-8))<36){catchBunny();return}
  for(var i=0;i<moths.length;i++){var m=moths[i];if(Math.abs(x-m.x)<26&&Math.abs(y-m.y)<22){moths.splice(i,1);var th=Math.max(5,tps()*30);S.thread+=th;S.threadAll+=th;floats.push({x:m.x,y:m.y,t:'+'+fmt(th)+' THREAD',l:1.2,c:'#ff9ad5'});burst(m.x,m.y,10,['#bdb8c9','#2ee6ff']);sfx(990,.06,'triangle');return}}
  var now=performance.now();if(comboT>0)combo=Math.min(60,combo+1);comboT=.55;S.maxCombo=Math.max(S.maxCombo,combo);
  var p=tapPow();gain(p);S.clicks++;wheelV=Math.min(18,wheelV+2.2);
  floats.push({x:x+(Math.random()-.5)*20,y:y-10,t:'+'+fmt(p),l:.9,c:combo>=50?'#ffd400':'#fff'});
  burst(LOOM.x+(Math.random()-.5)*LOOM.r,LOOM.y+(Math.random()-.5)*LOOM.r,6,['#d9c27a','#fff','#2ee6ff','#ff2ee6']);if(Math.random()<.6)zap();
  sfx(300+Math.min(combo,50)*12,.04,'square',.03);
}
if(window.PointerEvent)cv.addEventListener('pointerdown',onDown);else{cv.addEventListener('touchstart',function(e){var t=e.changedTouches[0];onDown({preventDefault:function(){e.preventDefault()},clientX:t.clientX,clientY:t.clientY})},{passive:false});cv.addEventListener('mousedown',onDown)}
function catchBunny(){
  var b=bunny;bunny=null;S.bunnies++;S.q+=1;var mult=1+lv('neon')*.15,r=Math.random(),msg;
  if(r<.45){var n=Math.max(50,lps()*90+tapPow()*20)*mult;gain(n);msg='LINT BURST +'+fmt(n)}
  else if(r<.8){frenzy=20*mult;msg='LINT FRENZY x7!'}
  else{var th=Math.max(10,tps()*120)*mult;S.thread+=th;S.threadAll+=th;msg='THREAD SNAG +'+fmt(th)}
  floats.push({x:b.x,y:b.y-30,t:msg,l:1.8,c:'#ffd400',big:1});floats.push({x:b.x,y:b.y-8,t:'+1 ARCADE QUARTER',l:1.6,c:'#7dff8a'});
  burst(b.x,b.y,24,['#ffd400','#fff','#ffe066']);sfx(880,.08,'triangle',.06);setTimeout(function(){sfx(1320,.1,'triangle',.06)},80);rebuild();
}
/* ---------- rugs art ---------- */
function rugArt(c,i,w,h,level){
  c.save();var x=0,y=0;
  var fr=Math.max(3,Math.min(8,h*.08));// fringe
  c.strokeStyle='#f3e6c4';c.lineWidth=1;for(var k=0;k<w;k+=3){c.beginPath();c.moveTo(k,0);c.lineTo(k,fr);c.moveTo(k,h-fr);c.lineTo(k,h);c.stroke()}
  y=fr;h-=2*fr;c.beginPath();c.rect(0,y,w,h);c.clip();var R=function(col,a,b,cw,ch){c.fillStyle=col;c.fillRect(a,b,cw,ch)};
  switch(i){
  case 0: R('#9b6b3a',x,y,w,h);c.strokeStyle='#7a4f27';for(var k2=0;k2<w;k2+=4){c.beginPath();c.moveTo(k2,y);c.lineTo(k2+2,y+h);c.stroke()}
    c.fillStyle='#2b1a0c';c.font='bold '+Math.floor(h*.32)+'px Impact';c.textAlign='center';c.textBaseline='middle';c.fillText('WELCOME…ISH',w/2,y+h/2,w*.86);break;
  case 1: R('#6ec6ff',x,y,w,h);c.fillStyle='#9fdcff';for(k=0;k<60;k++)c.fillRect((k*37)%w,y+(k*53)%h,2,3);c.fillStyle='#fff';c.font='bold '+Math.floor(h*.26)+'px Tahoma';c.textAlign='center';c.textBaseline='middle';c.fillText('BENSALEM',w/2,y+h/2,w*.86);break;
  case 2: R('#e8731c',x,y,w,h);for(k=0;k<w*h/18;k++){c.fillStyle=['#ff9a3c','#c4540c','#ffb15c'][k%3];c.fillRect((k*13.7)%w,y+((k*7.3)%h),1.5,4)}break;
  case 3: R('#e9dcc0',x,y,w,h);c.fillStyle='#6b4a2b';for(k=0;k<7;k++){var px=w*.1+k*w*.13,py=y+h*(k%2?.32:.68),s=h*.08;c.beginPath();c.arc(px,py,s*1.4,0,7);c.fill();for(var t=0;t<4;t++){c.beginPath();c.arc(px-s*1.5+t*s,py-s*1.9,s*.6,0,7);c.fill()}}break;
  case 4: for(k=0;k<w;k+=h/4)for(t=0;t<4;t++){R(((k/(h/4)|0)+t)%2?'#d62828':'#fff',k,y+t*h/4,h/4+1,h/4+1)}c.fillStyle='rgba(40,25,0,.55)';[[.2,.4],[.55,.6],[.8,.3]].forEach(function(d){c.beginPath();c.ellipse(w*d[0],y+h*d[1],h*.18,h*.12,0,0,7);c.fill()});break;
  case 5: R('#b7d7a8',x,y,w,h);c.strokeStyle='#5b7f4b';c.lineWidth=1;for(k=0;k<w;k+=w/12){c.beginPath();c.moveTo(k,y);c.lineTo(k,y+(k%(w/6)<1?h*.3:h*.15));c.stroke()}c.strokeRect(2,y+2,w-4,h-4);c.fillStyle='#24421a';c.font='bold '+Math.floor(h*.2)+'px Courier New';c.textAlign='center';c.textBaseline='middle';c.fillText('MAX 4FT · CODE 12.49',w/2,y+h*.62,w*.9);break;
  case 6: R('#b06a2c',x,y,w,h);c.strokeStyle='#ffcf7a';c.lineWidth=1;for(k=-h;k<w;k+=6){c.beginPath();c.moveTo(k,y);c.lineTo(k+h,y+h);c.moveTo(k+h,y);c.lineTo(k,y+h);c.stroke()}c.fillStyle='#ffd400';c.beginPath();c.moveTo(w/2,y+h*.15);c.lineTo(w/2-h*.15,y+h*.55);c.lineTo(w/2+h*.02,y+h*.5);c.lineTo(w/2-h*.05,y+h*.85);c.lineTo(w/2+h*.18,y+h*.4);c.lineTo(w/2,y+h*.45);c.fill();break;
  case 7: R('#7a1422',x,y,w,h);c.strokeStyle='#e0b25a';c.lineWidth=Math.max(1,h*.05);c.strokeRect(h*.1,y+h*.1,w-h*.2,h*.8);c.fillStyle='#1f3b73';c.beginPath();c.moveTo(w/2,y+h*.18);c.lineTo(w/2+h*.5,y+h/2);c.lineTo(w/2,y+h*.82);c.lineTo(w/2-h*.5,y+h/2);c.fill();c.fillStyle='#e0b25a';c.beginPath();c.arc(w/2,y+h/2,h*.12,0,7);c.fill();
    c.fillStyle='rgba(70,40,10,.55)';c.beginPath();c.arc(w*.78,y+h*.35,h*.16,0,7);c.fill();c.strokeStyle='rgba(70,40,10,.6)';c.beginPath();c.arc(w*.22,y+h*.65,h*.13,0,7);c.stroke();break;
  case 8: R('#0b0b1a',x,y,w,h);var cols=['#ff2ee6','#2ee6ff','#ffd400','#7dff5a'];for(k=0;k<14;k++){c.strokeStyle=cols[k%4];c.lineWidth=1.5;var qx=(k*41)%w,qy=y+(k*29)%h;if(k%3===0){c.beginPath();c.arc(qx,qy,h*.08,0,7);c.stroke()}else if(k%3===1){c.beginPath();c.moveTo(qx,qy);c.lineTo(qx+h*.15,qy+h*.1);c.lineTo(qx,qy+h*.2);c.stroke()}else{c.strokeRect(qx,qy,h*.12,h*.12)}}break;
  case 9: R('#3a0f5c',x,y,w,h);c.strokeStyle='#f2c14e';c.lineWidth=Math.max(1,h*.04);c.strokeRect(h*.08,y+h*.08,w-h*.16,h*.84);c.strokeRect(h*.18,y+h*.18,w-h*.36,h*.64);
    c.fillStyle='#c7ccd1';c.beginPath();c.ellipse(w/2,y+h/2,h*.28,h*.22,0,0,7);c.fill();c.fillStyle='#8a2be2';c.beginPath();c.arc(w/2,y+h/2,h*.1,0,7);c.fill();c.fillStyle='#f2c14e';for(k=0;k<4;k++){c.beginPath();c.arc(k<2?h*.3:w-h*.3,y+(k%2?h*.3:h*.7),h*.06,0,7);c.fill()}break;
  }
  c.restore();
}
var rugThumb={};
function thumb(i){if(rugThumb[i])return rugThumb[i];var c=document.createElement('canvas');c.width=112;c.height=76;rugArt(c.getContext('2d'),i,112,76,1);return rugThumb[i]=c.toDataURL()}
function drawRoom(){
  var c=rg,w=rc.width,h=rc.height;
  // wall
  var wg=c.createLinearGradient(0,0,0,56);wg.addColorStop(0,'#3d2a5c');wg.addColorStop(1,'#2a1c42');c.fillStyle=wg;c.fillRect(0,0,w,56);
  c.fillStyle='#0a0620';c.fillRect(470,10,110,38);c.strokeStyle='#8a5a2b';c.lineWidth=4;c.strokeRect(470,10,110,38);c.fillStyle='#fff';for(var k=0;k<8;k++)c.fillRect(478+(k*13)%100,14+(k*7)%30,1.5,1.5);
  c.fillStyle='#ffd400';c.font='bold 8px Courier New';c.fillText('3 AM',540,44);
  c.fillStyle='#c7ccd1';c.fillRect(300,14,40,30);c.fillStyle='#8a2be2';c.beginPath();c.arc(320,29,5,0,7);c.fill();c.strokeStyle='#e0b25a';c.lineWidth=3;c.strokeRect(296,10,48,38);
  // floor planks
  c.fillStyle='#7a4f2a';c.fillRect(0,56,w,h-56);c.strokeStyle='#5e3b1e';c.lineWidth=1;for(var y=56;y<h;y+=12){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();for(var x=((y/12)%2)*40;x<w;x+=80){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+12);c.stroke()}}
  c.fillStyle='#5a2e1c';c.fillRect(0,52,w,6);
  // couch + lamp props
  c.fillStyle='#4a6fa5';c.fillRect(20,20,110,34);c.fillStyle='#3a5a8a';c.fillRect(14,30,14,26);c.fillRect(122,30,14,26);
  c.fillStyle='#ffd400';c.beginPath();c.moveTo(170,18);c.lineTo(190,18);c.lineTo(196,32);c.lineTo(164,32);c.fill();c.fillStyle='#333';c.fillRect(178,32,4,22);
  // rugs: 5 x 2 slots
  var sw=118,sh=60;
  for(var i=0;i<RUGS.length;i++){var col=i%5,row=(i/5)|0,bx=8+col*126,by=66+row*(sh+12);
    var L=S.rug[i];
    if(!L){c.setLineDash([4,4]);c.strokeStyle='rgba(255,255,255,.35)';c.strokeRect(bx+8,by+6,sw-16,sh-12);c.setLineDash([]);c.fillStyle='rgba(255,255,255,.45)';c.font='bold 9px Tahoma';c.textAlign='center';c.fillText(i===0||S.rug[i-1]?'EMPTY SPOT':'LOCKED',bx+sw/2,by+sh/2+3);c.textAlign='left';continue}
    var sc=.78+Math.min(L,MAXLV)/MAXLV*.22,rw=sw*sc,rh=sh*sc;
    c.save();c.translate(bx+(sw-rw)/2,by+(sh-rh)/2);c.fillStyle='rgba(0,0,0,.35)';c.fillRect(3,3,rw,rh);rugArt(c,i,rw,rh,L);c.restore();
    c.fillStyle='#000a';c.fillRect(bx+sw-34,by+sh-12,32,12);c.fillStyle='#ffd400';c.font='bold 9px Courier New';c.fillText('LV'+L,bx+sw-31,by+sh-3);
    if(L>=10){c.fillStyle='#ffd400';c.font='11px sans-serif';c.fillText('🏆',bx+4,by+12)}
  }
  // bear wandering if hired
  if(S.crew[2]){var bxp=(time*30)%(w+60)-30;c.font='20px sans-serif';c.fillText('🐕',bxp,h-6)}
}
/* ---------- panel ---------- */
var tab='crew';
var TABS=[['crew','Crew'],['vault','Piggy Vault'],['rugs','Rugs'],['trophy','Trophies'],['prest','Prestige']];
function tabsHTML(){$('#tabs').innerHTML=TABS.map(function(t){return '<button class="tab'+(t[0]===tab?' on':'')+'" data-t="'+t[0]+'">'+t[1]+'</button>'}).join('')}
function avatar(c){return c.img?'<img class="av" src="'+c.img+'" alt="">':'<span class="av">'+(c.emo||'⭐')+'</span>'}
function rebuild(){
  tabsHTML();var h='';
  if(tab==='crew'){
    h+='<h3>X-Comix Crew (auto-spinners)</h3>';
    var lockedShown=0;
    CREW.forEach(function(c,i){var shown=i===0||S.crew[i-1]>0||S.crew[i]>0||S.all>=c.c*.5;
      if(!shown){if(lockedShown++)return;h+='<div class="row locked"><span class="av">🔒</span><div class="nm"><b>Crew locked</b><small>Spin more lint to meet this crew member.</small></div></div>';return}
      h+='<div class="row" title="'+c.q.replace(/"/g,'&quot;')+'">'+avatar(c)+'<div class="nm"><b>'+c.n+'</b> · '+c.t+'<small>'+fmt(c.p*crewMult(i)*crewUp())+' lint/s each · '+c.q+'</small></div><span class="qty">'+S.crew[i]+'</span><div class="buy"><button class="btn go" data-hire="'+i+'" data-n="1">Hire '+fmt(crewCost(i,1))+'</button><button class="btn sm" data-hire="'+i+'" data-n="10">x10 '+fmt(crewCost(i,10))+'</button></div></div>'});
    h+='<h3>Loom Upgrades</h3>';
    var upShown=0;UPG.forEach(function(u){if(S.up[u.id]||(S.all<u.c*.3&&upShown>=1))return;upShown++;h+='<div class="row"><span class="av">🧶</span><div class="nm"><b>'+u.n+'</b><small>'+u.d+'</small></div><div class="buy"><button class="btn go" data-up="'+u.id+'">Buy '+fmt(u.c)+'</button></div></div>'});
    var got=UPG.filter(function(u){return S.up[u.id]}).map(function(u){return u.n});if(got.length)h+='<div class="note">Installed: '+got.join(', ')+'</div>';
  } else if(tab==='vault'){
    h+='<h3>Overmind\'s Totally-Legit Glass Piggy Vault</h3><div class="grid2"><div>Locked Lint<br><span class="vbig" id="vLocked">'+fmt(S.locked)+'</span></div><div>Woven Thread drip<br><span class="vbig" id="vTps">'+fmt(tps())+'/s</span></div></div>';
    h+='<p style="margin:6px 0">Lock fake Cable Lint in the cartoon pig. It drips <b>'+(dripRate()*100).toFixed(3)+'%</b> of the locked pile as Woven Thread every second, which you weave into rugs. <span class="fine" title="LOCKED FOREVER IN DIMENSIONS 1–12 — NO REFUNDS, ONLY RUGS. Overmind\'s lawyers are also toasters.">*Fine print</span></p>';
    h+='<div style="display:flex;gap:4px;flex-wrap:wrap"><button class="btn go" data-lock=".25">Lock 25%</button><button class="btn go" data-lock=".5">Lock 50%</button><button class="btn go" data-lock="1">Lock ALL</button><button class="btn'+(S.auto?' on':'')+'" id="autoBtn">Auto-lock 10% of crew spin: '+(S.auto?'ON':'OFF')+'</button></div>';
    h+='<div class="note"><b>OVERMIND:</b> "Locked Lint stays in my pig. Forever. In Dimensions 1–12. NO REFUNDS, ONLY RUGS." <span class="fine" title="The Glass Piggy Vault is a cartoon. Lint is fake. Thread is fake. The rugs are, tragically, real (in the game).">*Even finer print</span></div>';
    h+='<h3>🪙 Arcade Quarter Slot</h3><p style="margin:4px 0">Arcade Quarters: <b id="vQ">'+S.q+'</b>. Catch Golden Lint Bunnies and earn trophies to collect them.</p>';
    h+='<div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center"><button class="btn go" id="packBtn"'+(S.q<5?' disabled':'')+'>Trade 5 Quarters → 1 Card Binder Booster Pack</button><a href="../binder/" class="btn sm" style="text-decoration:none">Open Card Binder ↗</a></div>';
    h+='<p style="font-size:11px;margin:4px 0">Bonus packs waiting in your binder: <b>'+((window.XC&&XC.get('binder-packs'))|0)+'</b></p>';
  } else if(tab==='rugs'){
    h+='<h3>Weave Literal Cartoon Floor Rugs (costs Woven Thread)</h3>';
    RUGS.forEach(function(r,i){var open=i===0||S.rug[i-1]>0;var L=S.rug[i];
      h+='<div class="row'+(open?'':' locked')+'"><img class="rugimg" src="'+thumb(i)+'" alt=""><div class="nm"><b>'+r.n+'</b>'+(L?' · LV '+L:'')+'<small>'+r.d+(L?' (now +'+Math.round(L*parseFloat(r.d.match(/\d+/)[0]))+(i===5?'h':'%')+')':'')+'</small></div>'+
       (open?(L>=MAXLV?'<b>MAX</b>':'<div class="buy"><button class="btn go" data-rug="'+i+'">'+(L?'Upgrade':'Weave')+' '+fmt(rugCost(i))+'</button></div>'):'<small style="font-size:10px">Weave the rug above first</small>')+'</div>'});
  } else if(tab==='trophy'){
    h+='<h3>Trophies ('+Object.keys(S.ach).length+'/'+ACH.length+')</h3><div class="ach">'+ACH.map(function(a){return '<div class="'+(S.ach[a[0]]?'got':'')+'"><b>'+(S.ach[a[0]]?'🏆 ':'')+a[1]+'</b>'+a[2]+' · +'+a[4]+'🪙</div>'}).join('')+'</div>';
    h+='<h3>Stats</h3><table class="st"><tr><td>Cable Lint spun (all time)</td><td>'+fmt(S.all)+'</td></tr><tr><td>Woven Thread (all time)</td><td>'+fmt(S.threadAll)+'</td></tr><tr><td>Taps</td><td>'+fmt(S.clicks)+'</td></tr><tr><td>Golden Lint Bunnies</td><td>'+S.bunnies+'</td></tr><tr><td>Crew hired</td><td>'+crewTotal()+'</td></tr><tr><td>Rugs rolled up</td><td>'+S.rolls+'</td></tr><tr><td>Playing since</td><td>'+new Date(S.started).toLocaleDateString()+'</td></tr></table>';
  } else if(tab==='prest'){
    var pos=tasselsPossible(),gn=Math.max(0,pos-S.tassels);
    h+='<h3>✨ Roll Up the Rugs (Prestige)</h3><p>Roll up every rug, send the crew home, and the pig keeps its lint (forever, obviously). In exchange you earn <b>Golden Tassels</b>: each one is a permanent <b>+5%</b> to everything.</p>';
    h+='<p>Golden Tassels: <b>'+S.tassels+'</b> · available from this run: <b>'+gn+'</b><br><small>Tassels are based on all-time Cable Lint (1 at 100M, 2 at 800M, 3 at 2.7B…).</small></p><button class="btn go" id="rollBtn"'+(gn<1?' disabled':'')+'>Roll Up the Rugs for +'+gn+' Golden Tassel'+(gn===1?'':'s')+'</button>';
    h+='<h3>🪖 Hard hat</h3><p>The golden hard hat is on the loom for every player.</p>';
    if(vip()){var cd=Math.max(0,600-(Date.now()-(S.moth||0))/1000);h+='<button class="btn go" id="mothBtn"'+(cd>0?' disabled':'')+'>Summon the Hum Moths'+(cd>0?' ('+fmtT(cd)+')':'')+'</button><p style="font-size:11px">Static Siren\'s moth choir swarms the loom. Tap moths for Woven Thread before they flutter off.</p>'}
    else h+='<button class="btn" id="vipBtn2">🎟️ Insert VIP Pass (Read-Only Check)</button>';
    h+='<h3>Save</h3><p style="font-size:11px">Progress saves in this browser only. <button class="btn sm" id="resetBtn">Wipe save</button></p>';
  }
  $('#panel').innerHTML=h;refresh();
}
function refresh(){
  $('#hLint').textContent=fmt(S.lint);$('#hLps').textContent=fmt(lps());$('#hLock').textContent=fmt(S.locked);$('#hThr').textContent=fmt(S.thread);$('#hTps').textContent=fmt(tps());$('#hQ').textContent=S.q;
  $('#hTasC').style.display=S.tassels?'':'none';$('#hTas').textContent=S.tassels;
  var bs=document.querySelectorAll('#panel [data-hire]');for(var i=0;i<bs.length;i++){var k=+bs[i].getAttribute('data-hire'),n=+bs[i].getAttribute('data-n');bs[i].disabled=S.lint<crewCost(k,n)}
  bs=document.querySelectorAll('#panel [data-up]');for(i=0;i<bs.length;i++){var u=UPG.filter(function(x){return x.id===bs[i].getAttribute('data-up')})[0];bs[i].disabled=S.lint<u.c}
  bs=document.querySelectorAll('#panel [data-rug]');for(i=0;i<bs.length;i++){bs[i].disabled=S.thread<rugCost(+bs[i].getAttribute('data-rug'))}
  bs=document.querySelectorAll('#panel [data-lock]');for(i=0;i<bs.length;i++)bs[i].disabled=S.lint<1;
  var v=$('#vLocked');if(v){v.textContent=fmt(S.locked);$('#vTps').textContent=fmt(tps())+'/s'}
}
function checkAch(){var any=false;ACH.forEach(function(a){if(!S.ach[a[0]]&&a[3]()){S.ach[a[0]]=1;S.q+=a[4];any=true;toast('🏆 '+a[1]+' (+'+a[4]+' 🪙)')}});if(any&&tab==='trophy')rebuild()}
var TQ=[],tqBusy=false;function toast(t){TQ.push(t);if(!tqBusy)nextToast()}
function nextToast(){var t=TQ.shift();if(!t){tqBusy=false;return}tqBusy=true;floats.push({x:320,y:150,t:t,l:2.2,c:'#7dff8a',big:1,box:1});sfx(660,.08,'triangle');setTimeout(function(){sfx(990,.1,'triangle')},90);setTimeout(nextToast,900)}
$('#panel').addEventListener('click',function(e){
  var b=e.target.closest('button');if(!b||b.disabled)return;
  if(b.hasAttribute('data-hire')){var i=+b.getAttribute('data-hire'),n=+b.getAttribute('data-n'),c=crewCost(i,n);if(S.lint>=c){S.lint-=c;S.crew[i]+=n;sfx(520,.06);rebuild()}}
  else if(b.hasAttribute('data-up')){var u=UPG.filter(function(x){return x.id===b.getAttribute('data-up')})[0];if(S.lint>=u.c){S.lint-=u.c;S.up[u.id]=1;sfx(740,.08,'triangle');rebuild()}}
  else if(b.hasAttribute('data-rug')){var r=+b.getAttribute('data-rug'),rc2=rugCost(r);if(S.thread>=rc2){S.thread-=rc2;S.rug[r]++;sfx(392,.08,'triangle');setTimeout(function(){sfx(587,.1,'triangle')},70);toast((S.rug[r]===1?'Woven: ':'Upgraded: ')+RUGS[r].n);rebuild()}}
  else if(b.hasAttribute('data-lock')){var f=+b.getAttribute('data-lock'),amt=S.lint*f;S.lint-=amt;S.locked+=amt;floats.push({x:PIG.x,y:PIG.y-20,t:'+'+fmt(amt)+' LOCKED',l:1.4,c:'#ff9ad5',big:1});sfx(180,.12,'sawtooth');rebuild()}
  else if(b.id==='autoBtn'){S.auto=!S.auto;rebuild()}
  else if(b.id==='packBtn'){if(S.q>=5){S.q-=5;if(window.XC)XC.set('binder-packs',((XC.get('binder-packs'))|0)+1);toast('📦 Booster Pack sent to your Card Binder!');rebuild()}}
  else if(b.id==='rollBtn'){var gn=tasselsPossible()-S.tassels;if(gn>=1)confirmDlg('Roll Up the Rugs?','All crew, upgrades, rugs, Lint and Thread reset. The Piggy Vault empties too (Overmind "reallocates" it). You keep Trophies, Quarters and gain <b>+'+gn+' Golden Tassel'+(gn===1?'':'s')+'</b> (+5% everything each).',function(){var keep={tassels:S.tassels+gn,rolls:S.rolls+1,q:S.q,ach:S.ach,all:S.all,threadAll:S.threadAll,clicks:S.clicks,bunnies:S.bunnies,maxCombo:S.maxCombo,started:S.started,moth:S.moth};S=fresh();for(var k in keep)S[k]=keep[k];save();toast('✨ Rugs rolled up! +'+gn+' Golden Tassels');rebuild()})}
  else if(b.id==='vipBtn2'){if(window.DKVIP)DKVIP.open()}
  else if(b.id==='mothBtn'){S.moth=Date.now();for(var m=0;m<12;m++)moths.push({x:-30-m*45,y:90+Math.random()*170,vx:90+Math.random()*50,k:m*1.7});toast('SECRET BOSS WAVE: THE HUM MOTHS!');rebuild()}
  else if(b.id==='resetBtn'){confirmDlg('Wipe save?','This erases your Rug Loom progress in this browser.',function(){S=fresh();save();rebuild()})}
});
$('#tabs').addEventListener('click',function(e){var b=e.target.closest('[data-t]');if(b){tab=b.getAttribute('data-t');rebuild();sfx(440,.03)}});
/* ---------- dialogs ---------- */
function dlg(title,body,btns){$('#dT').textContent=title;$('#dB').innerHTML=body;var bb=$('#dBtns');bb.innerHTML='';btns.forEach(function(b){var e=document.createElement('button');e.className='btn'+(b.go?' go':'');e.textContent=b.t;e.onclick=function(){$('#ovl').classList.remove('show');if(b.f)b.f()};bb.appendChild(e)});$('#ovl').classList.add('show')}
function confirmDlg(t,b,f){dlg(t,b,[{t:'Cancel'},{t:'Do it',go:1,f:f}])}
function help(){dlg("How to play Overmind's Rug Loom",'<ol style="padding-left:18px;margin:0"><li><b>Tap the Neon Loom</b> to spin fake Cable Lint. Fast taps build a combo (up to x2).</li><li><b>Hire X-Comix crew</b> to spin Lint for you, even while you\'re away (up to 8 hours).</li><li><b>Lock Lint in the Glass Piggy Vault.</b> It never comes back out (NO REFUNDS, ONLY RUGS), but it drips Woven Thread every second.</li><li><b>Weave rugs</b> with Thread. Each rug gives a bonus and shows up in your Apartment Floor Showroom.</li><li><b>Catch Golden Lint Bunnies</b> for bursts, frenzies and Arcade Quarters. Trade 5 Quarters for a free Card Binder pack.</li><li><b>Roll Up the Rugs</b> later for permanent Golden Tassels.</li></ol><div class="note">100% free parody browser game. In-game points have zero cash/crypto value. No crypto deposits. Nothing to buy, ever.</div>',[{t:'Got it',go:1}])}
$('#mHelp')&&($('#mHelp').onclick=help);
$('#mNew')&&($('#mNew').onclick=function(){confirmDlg('New game?','Start over from zero? (Trophies reset too.)',function(){S=fresh();save();rebuild()})});
$('#mVip')&&($('#mVip').onclick=function(){if(window.DKVIP)DKVIP.open()});
var SHARE='https://x.com/intent/post?text='+encodeURIComponent("I'm weaving literal cartoon rugs in Overmind's Rug Loom, a free 2000s-style idle game in the X-COMIX arcade. All points are fake, the rugs are ridiculous: https://petecastic.github.io/xcomix-memory/rug-loom/ See you in another timeline.");
$('#mShare')&&($('#mShare').onclick=function(){window.open(SHARE,'_blank','noopener')});
var snd=$('#snd');function sndU(){if(snd)snd.innerHTML=window.XC&&XC.muted?'&#128263;':'&#128266;'}sndU();if(snd)snd.onclick=function(){XC.muted=!XC.muted;XC.set('muted',XC.muted);sndU();sfx(660)};
/* ---------- ticker ---------- */
var tk=$('#tick'),tkI=Math.floor(Math.random()*TICK.length),tkX=0,tkW=0;
function tickStep(dt){if(!tk)return;var box=tk.parentNode.clientWidth;if(!tkW){tk.textContent=TICK[tkI%TICK.length];tkI++;tkW=tk.scrollWidth;tkX=0}tkX+=70*dt;tk.style.transform='translateX('+(-tkX)+'px)';if(tkX>box+tkW+20)tkW=0}
var lastTk=0;function tkLoop(ts){tickStep(Math.min(.1,(ts-(lastTk||ts))/1000));lastTk=ts;requestAnimationFrame(tkLoop)}
/* ---------- offline + start ---------- */
function offline(){
  var away=Math.min(offlineCap(),Math.max(0,(Date.now()-(S.last||Date.now()))/1000));
  if(away<60)return;var l=lps()*away,th=S.locked*dripRate()*away;
  if(S.auto){S.locked+=l*.1;gain(l);S.lint-=l*.1}else gain(l);S.thread+=th;S.threadAll+=th;
  if(l>0||th>0)dlg('While you were away ('+fmtT(away)+')','<p>Your crew kept the loom buzzing.</p><table class="st"><tr><td>Cable Lint spun</td><td>+'+fmt(l)+'</td></tr><tr><td>Woven Thread dripped</td><td>+'+fmt(th)+'</td></tr></table><p style="font-size:11px">OVERMIND: "Your Lint is still safely in my pig. You\'re welcome."</p>',[{t:'Back to the loom',go:1}]);
}
var started=false;
function start(e){if(started)return;started=true;if(e&&e.preventDefault)e.preventDefault();var st=$('#start');if(st)st.parentNode.removeChild(st);sfx(523,.08,'triangle');offline();rebuild();if(!S.clicks&&!S.all)setTimeout(help,300)}
var stEl=$('#start');
if(stEl){if(window.PointerEvent)stEl.addEventListener('pointerdown',start);stEl.addEventListener('touchstart',start,{passive:false});stEl.addEventListener('click',start)}else start();
setInterval(function(){refresh();checkAch()},250);
setInterval(save,5000);
document.addEventListener('visibilitychange',function(){if(document.hidden)save();else{offline();rebuild()}});
window.addEventListener('pagehide',save);
if(window.DKVIP)DKVIP.onChange(function(){rebuild()});
rebuild();requestAnimationFrame(frame);requestAnimationFrame(tkLoop);
window.__loom={S:function(){return S},set:function(o){for(var k in o)S[k]=o[k];rebuild()},rebuild:rebuild,tab:function(t){tab=t;rebuild()},bunny:function(){nextBunny=0},start:start,lps:lps,tps:tps};
})();
