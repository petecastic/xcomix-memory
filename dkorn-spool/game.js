const $=XC.$,cv=$('#cv'),c=cv.getContext('2d'),W=720,H=420,A='../arcade/dkorn-art/';
const COLS=18,ROWS=10,TW=W/COLS,TH=(H-20)/ROWS;
const PATH=[[0,4],[2,4],[2,2],[5,2],[5,6],[9,6],[9,3],[12,3],[12,7],[15,7],[15,4],[17,4]];
const TOWERS=[
  {id:'spool',name:'Dkorn Spool',cost:50,range:2.2,rate:.7,dmg:12,col:'#C8A27A',desc:'Throws flat-flanged cable spools'},
  {id:'lasso',name:'Voltia Lasso',cost:70,range:2.6,rate:.55,dmg:8,col:'#2ee6ff',desc:'Cyan arc pull + chain stun'},
  {id:'steam',name:'Krampus Steam',cost:65,range:1.8,rate:.4,dmg:6,col:'#c48a3a',desc:'AoE thaw/slow + DoT'}
];
const ENEMY={
  splicer:{name:'Splicer Drone',hp:40,spd:55,r:10,col:'#88a',reward:8},
  raccoon:{name:'Raccoon Cart',hp:70,spd:38,r:12,col:'#a86',reward:12},
  mite:{name:'Static Mite',hp:25,spd:70,r:8,col:'#cf6',reward:6},
  ice:{name:'Ice-Line Crawler',hp:90,spd:32,r:13,col:'#9cf',reward:15,ice:true},
  boss_splicer:{name:'Splicer Alpha',hp:500,spd:28,r:18,col:'#668',reward:80,boss:true},
  boss_raccoon:{name:'Nest King',hp:700,spd:24,r:20,col:'#864',reward:100,boss:true},
  boss_ice:{name:'Ice-Storm Limb',hp:650,spd:22,r:20,col:'#adf',reward:90,boss:true,ice:true},
  boss_siren:{name:'Static Siren',hp:800,spd:26,r:18,col:'#eee',reward:110,boss:true},
  boss_phantom:{name:'Phantom Outage',hp:1200,spd:20,r:22,col:'#314',reward:150,boss:true},
  overmind:{name:'Overmind Outage Rig',hp:2000,spd:18,r:24,col:'#624',reward:250,boss:true}
};
function wavePlan(n){
  if(n===3)return[{k:'boss_splicer',n:1}];
  if(n===6)return[{k:'boss_raccoon',n:1},{k:'raccoon',n:4}];
  if(n===9)return[{k:'boss_ice',n:1},{k:'ice',n:5}];
  if(n===11)return[{k:'boss_siren',n:1},{k:'mite',n:8}];
  if(n===12)return[{k:'boss_phantom',n:1},{k:'splicer',n:6},{k:'ice',n:3}];
  if(n===13)return[{k:'overmind',n:1},{k:'splicer',n:10},{k:'raccoon',n:6}];
  const base=[
    [{k:'splicer',n:6}],
    [{k:'splicer',n:8},{k:'mite',n:4}],
    [{k:'raccoon',n:5},{k:'splicer',n:4}],
    [{k:'ice',n:4},{k:'mite',n:6}],
    [{k:'raccoon',n:6},{k:'ice',n:3},{k:'splicer',n:5}]
  ];
  const b=base[(n-1)%base.length];
  return b.map(x=>({k:x.k,n:x.n+Math.floor((n-1)/5)*2}));
}

const imgs={};['dkorn_face','voltia_face','krampus_face','kilo_face'].forEach(n=>{const i=new Image();i.src=A+n+'.jpg';imgs[n]=i});

let st,raf,last=0,sel=null,placeId=null,mode='norm',vipOn=false,paused=false;

function vipVerified(){try{const v=XC.get('dkorn-vip');return !!(v&&v.verified)||vipOn}catch(e){return vipOn}}
function refreshVip(){
  const ok=vipVerified();
  $('#vipTag').textContent=ok?'★ VIP / SECRET WAVE':'';
  $('#vipPill').textContent=ok?'VIP Skin ON':'VIP Skin / Toy Code';
}
function promptVip(){
  const code=window.prompt('Toy serial for VIP cosmetic + Secret Boss Wave:\nA1gR-APBeVk','');
  if(!code)return;
  if(code.trim().replace(/\s/g,'')==='A1gR-APBeVk'||code.trim().toUpperCase()==='A1GR-APBEVK'){
    vipOn=true;try{XC.set('dkorn-vip',{verified:true,skin:true,source:'toy-code',at:Date.now()})}catch(e){}
    refreshVip();XC.sfx(990,.2,'triangle');
  }else alert('Serial mismatch. Game fully playable without VIP!');
}

function pathPixels(){
  return PATH.map(([cx,cy])=>({x:(cx+.5)*TW,y:(cy+.5)*TH+10}));
}
function onPath(cx,cy){
  for(let i=0;i<PATH.length-1;i++){
    const a=PATH[i],b=PATH[i+1];
    if(a[0]===b[0]&&cx===a[0]&&cy>=Math.min(a[1],b[1])&&cy<=Math.max(a[1],b[1]))return true;
    if(a[1]===b[1]&&cy===a[1]&&cx>=Math.min(a[0],b[0])&&cx<=Math.max(a[0],b[0]))return true;
  }
  return false;
}
function kiloEmoji(m){return m.mood==='sleep'?'😴':m.mood==='happy'?'😊':'😭'}
function updateMood(){
  const k=st.kilo;
  if(k.sleep>=65)k.mood='sleep';
  else if(k.happy>=50&&k.sleep>=30)k.mood='happy';
  else if(k.sleep<30||k.happy<35)k.mood='cry';
  else k.mood='happy';
}

function reset(){
  st={
    on:false,wave:0,lives:20,pretzels:120,coffee:3,quiet:true,
    towers:[],enemies:[],shots:[],fx:[],spawnQ:[],spawnT:0,waveActive:false,won:false,endless:mode==='end',
    kilo:{sleep:85,happy:70,mood:'sleep'},
    hushCD:0,steamCD:0,pressure:0,secretReady:false,cleared12:false
  };
  sel=null;placeId=null;buildShop();hud();
  $('#next').textContent='START ▶';
}

function buildShop(){
  const el=$('#shop');el.innerHTML='';
  TOWERS.forEach(t=>{
    const b=document.createElement('button');
    b.innerHTML=`${t.name}<small>${t.cost} 🥨</small>`;
    b.onclick=()=>{placeId=placeId===t.id?null:t.id;sel=null;[...el.children].forEach(x=>x.classList.remove('on'));if(placeId===t.id)b.classList.add('on');$('#selp').style.display='none'};
    el.appendChild(b);
  });
}

function startWave(){
  if(!st||st.waveActive)return;
  let n=st.wave+1;
  if(mode==='norm'&&n>12&&!(st.cleared12||vipVerified())){return}
  if(mode==='norm'&&n===13&&!(vipVerified()||st.cleared12)){n=13}
  if(mode==='norm'&&st.cleared12&&n===13){/* secret */}
  if(mode==='norm'&&n>13){win();return}
  if(mode==='end'&&n>12){/* endless scales */}
  st.wave=n;st.waveActive=true;
  let plan=wavePlan(Math.min(n,13));
  if(mode==='end'&&n>13){
    plan=[{k:'splicer',n:6+n},{k:'raccoon',n:3+n/2|0},{k:'mite',n:4+n/2|0}];
    if(n%5===0)plan.push({k:'boss_phantom',n:1});
  }
  if(st.kilo.mood==='cry'){st.pressure++;plan=plan.concat([{k:'mite',n:2+st.pressure}])}
  st.spawnQ=[];
  plan.forEach(p=>{for(let i=0;i<p.n;i++)st.spawnQ.push(p.k)});
  st.spawnT=.4;
  XC.sfx(440,.1);hud();
  $('#next').textContent=st.waveActive?'WAVE…':'NEXT ▶';
}

function spawnOne(k){
  const e=ENEMY[k];if(!e)return;
  const path=pathPixels();
  st.enemies.push({
    k,hp:e.hp*(1+(st.wave-1)*.06),max:e.hp*(1+(st.wave-1)*.06),spd:e.spd,r:e.r,col:e.col,
    reward:e.reward,boss:!!e.boss,ice:!!e.ice,pi:0,t:0,x:path[0].x,y:path[0].y,
    slow:0,stun:0,dot:0,dotT:0
  });
}

function placeTower(cx,cy){
  if(!placeId||onPath(cx,cy))return;
  if(st.towers.some(t=>t.cx===cx&&t.cy===cy))return;
  const def=TOWERS.find(t=>t.id===placeId);if(!def)return;
  if(st.pretzels<def.cost){XC.sfx(120,.1,'sawtooth');return}
  st.pretzels-=def.cost;
  st.towers.push({id:def.id,cx,cy,x:(cx+.5)*TW,y:(cy+.5)*TH+10,tier:1,range:def.range,rate:def.rate,dmg:def.dmg,cd:0,col:def.col});
  XC.sfx(660,.06);placeId=null;[...$('#shop').children].forEach(x=>x.classList.remove('on'));hud();
}

function upgradeTower(t){
  if(t.tier>=3)return;
  const cost=40*t.tier;
  if(st.pretzels<cost)return;
  st.pretzels-=cost;t.tier++;t.range+=.25;t.dmg*=1.35;t.rate*=1.1;XC.sfx(880,.08,'triangle');hud();showSel(t);
}

function showSel(t){
  sel=t;const el=$('#selp');el.style.display='block';
  const def=TOWERS.find(x=>x.id===t.id);
  el.innerHTML=`<b>${def.name}</b> T${t.tier}<br>${def.desc}<br>
  <button class="hb" id="upBtn">Upgrade (${40*t.tier} 🥨)</button>
  <button class="hb" id="sellBtn">Sell</button>`;
  $('#upBtn').onclick=()=>upgradeTower(t);
  $('#sellBtn').onclick=()=>{st.pretzels+=Math.floor(def.cost*.6*t.tier);st.towers=st.towers.filter(x=>x!==t);sel=null;el.style.display='none';hud()};
}

function hush(kind){
  if(kind==='pretzel'){
    if(st.hushCD>0||st.pretzels<5)return;st.hushCD=8;st.pretzels-=5;
    st.kilo.sleep=Math.min(100,st.kilo.sleep+18);st.kilo.happy=Math.min(100,st.kilo.happy+8);
    XC.sfx(900,.12,'triangle');
  }else{
    if(st.steamCD>0||st.coffee<1)return;st.steamCD=10;st.coffee--;
    st.kilo.sleep=Math.min(100,st.kilo.sleep+22);
    st.enemies.forEach(e=>{e.slow=2.5;if(e.ice)e.hp-=20});
    XC.sfx(300,.2,'sawtooth');
  }
  updateMood();hud();
}

function step(dt){
  if(!st||paused)return;
  st.hushCD=Math.max(0,st.hushCD-dt);st.steamCD=Math.max(0,st.steamCD-dt);
  if(st.waveActive&&st.spawnQ.length){
    st.spawnT-=dt;if(st.spawnT<=0){spawnOne(st.spawnQ.shift());st.spawnT=.45}
  }
  const path=pathPixels();
  // enemies
  for(const e of st.enemies){
    if(e.hp<=0)continue;
    if(e.stun>0){e.stun-=dt;continue}
    let spd=e.spd*(e.slow>0?.45:1);e.slow=Math.max(0,e.slow-dt);
    if(e.dotT>0){e.dotT-=dt;e.hp-=e.dot*dt}
    e.t+=spd*dt; // distance along segment roughly via speed
    // move along path
    const seglen=Math.hypot(path[Math.min(e.pi+1,path.length-1)].x-path[e.pi].x,path[Math.min(e.pi+1,path.length-1)].y-path[e.pi].y)||1;
    let rem=spd*dt;
    while(rem>0&&e.pi<path.length-1){
      const a=path[e.pi],b=path[e.pi+1];
      const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      const cur=Math.hypot(e.x-a.x,e.y-a.y);
      const left=len-cur;
      if(rem<left){e.x+=dx/len*rem;e.y+=dy/len*rem;rem=0}
      else{e.x=b.x;e.y=b.y;e.pi++;rem-=left}
    }
    if(e.pi>=path.length-1&&Math.hypot(e.x-path[path.length-1].x,e.y-path[path.length-1].y)<8){
      e.hp=-1;st.lives-=e.boss?5:1;
      st.kilo.sleep=Math.max(0,st.kilo.sleep-8);st.kilo.happy=Math.max(0,st.kilo.happy-5);
      XC.sfx(100,.2,'sawtooth');
      if(st.lives<=0){lose();return}
    }
  }
  // kill rewards
  st.enemies.forEach(e=>{
    if(e.hp<=0&&!e.paid){e.paid=true;st.pretzels+=e.reward;st.kilo.happy=Math.min(100,st.kilo.happy+(e.boss?10:1));
      if(st.quiet&&st.kilo.mood==='sleep')st.pretzels+=2}
  });
  st.enemies=st.enemies.filter(e=>e.hp>0);

  // towers fire
  const quietBonus=st.quiet&&st.kilo.mood==='sleep';
  for(const t of st.towers){
    t.cd-=dt;if(t.cd>0)continue;
    let target=null,bd=t.range*TW;
    for(const e of st.enemies){
      const d=Math.hypot(e.x-t.x,e.y-t.y);if(d<bd){bd=d;target=e}
    }
    if(!target)continue;
    t.cd=1/t.rate;
    const dmg=t.dmg*t.tier*(quietBonus?1.35:1)*(vipVerified()?1.1:1);
    if(t.id==='spool'){
      st.shots.push({x:t.x,y:t.y,tx:target.x,ty:target.y,target,dmg,k:'spool',t:.25});
      if(!quietBonus){st.kilo.sleep=Math.max(0,st.kilo.sleep-.35)} // loud burst
    }else if(t.id==='lasso'){
      target.stun=.55;target.hp-=dmg;
      // pull slightly back
      if(target.pi>0){target.x+=(path[target.pi].x-target.x)*.15;target.y+=(path[target.pi].y-target.y)*.15}
      st.fx.push({x:target.x,y:target.y,t:.3,col:'#2ee6ff'});
      XC.sfx(780,.04,'triangle');
    }else if(t.id==='steam'){
      for(const e of st.enemies){
        if(Math.hypot(e.x-t.x,e.y-t.y)<t.range*TW){e.slow=1.6;e.dot=dmg*.8;e.dotT=1.4;e.hp-=dmg*.4;if(e.ice)e.hp-=dmg*.5}
      }
      st.fx.push({x:t.x,y:t.y,t:.4,col:'#c48a3a',r:t.range*TW});
      XC.sfx(220,.08,'sawtooth');
    }
  }
  // shots
  for(const s of st.shots){
    s.t-=dt;const u=1-Math.max(0,s.t)/.25;
    s.x+=(s.tx-s.x)*.2;s.y+=(s.ty-s.y)*.2;
    if(s.t<=0){if(s.target&&s.target.hp>0){s.target.hp-=s.dmg;XC.sfx(320,.03)}s.dead=1}
  }
  st.shots=st.shots.filter(s=>!s.dead);
  st.fx=st.fx.filter(f=>(f.t-=dt)>0);

  // ambient kilo
  if(st.waveActive){
    if(!st.quiet)st.kilo.sleep=Math.max(0,st.kilo.sleep-3*dt);
    else if(st.kilo.mood!=='cry')st.kilo.sleep=Math.min(100,st.kilo.sleep+.5*dt);
  }
  updateMood();

  if(st.waveActive&&!st.spawnQ.length&&!st.enemies.length){
    st.waveActive=false;st.pretzels+=15+st.wave*2;st.coffee=Math.min(5,st.coffee+1);
    if(st.wave===12){st.cleared12=true;if(st.kilo.happy>=50){/* eligible win */} }
    if(mode==='norm'&&st.wave===12){
      if(st.kilo.happy>=50){
        if(vipVerified()||st.secretReady){$('#next').textContent='SECRET WAVE 13 ▶';st.secretReady=true}
        else {win();return}
      } else {lose('Kilo Happy under 50%');return}
    }
    if(mode==='norm'&&st.wave===13){win();return}
    $('#next').textContent='NEXT ▶';
  }
  hud();
}

function win(){
  st.on=false;st.won=true;
  const{best,rec}=XC.best('dkorn-spool',st.wave*1000+st.pretzels+st.lives*10);
  XC.over({img:A+'dkorn_family_arcade_hero.jpg',title:'GRID HELD!',
    stats:`Wave ${st.wave} cleared · Kilo ${kiloEmoji(st.kilo)} Happy ${Math.round(st.kilo.happy)}%<br>Pretzels left ${st.pretzels}`+(rec?' · NEW BEST!':''),
    text:`I held Sub-Station 13 through Wave ${st.wave} in Spool Toss TD — Kilo stayed happy on STAGE:A1gR-APBeVk. See you in another timeline.`,
    path:'dkorn-spool/',again:()=>{reset();bootTitle()}});
}
function lose(why){
  st.on=false;
  XC.over({img:A+'kilo_face.jpg',title:'OUTAGE!',
    stats:`Wave ${st.wave}`+(why?` · ${why}`:'')+`<br>Kilo ${kiloEmoji(st.kilo)} · Lives ${st.lives}`,
    text:`Spool Toss TD got me on wave ${st.wave} at Sub-Station 13. Can you keep Baby Kilo happy?`,
    path:'dkorn-spool/',again:()=>{reset();bootTitle()}});
}

function draw(){
  const vip=vipVerified();
  c.fillStyle=vip?'#1a1408':'#132038';c.fillRect(0,0,W,H);
  // cul-de-sac grass + road
  for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
    const px=x*TW,py=y*TH+10;
    c.fillStyle=onPath(x,y)?(vip?'#3a3020':'#2a3348'):((x+y)%2?(vip?'#243018':'#1a2840'):(vip?'#1e2814':'#162236'));
    c.fillRect(px,py,TW-1,TH-1);
  }
  // substation box
  c.fillStyle='#333';c.fillRect(W-70,H/2-40,50,70);
  c.fillStyle='#2ee6ff';c.fillRect(W-60,H/2-30,8,8);c.fillRect(W-45,H/2-10,8,8);
  c.fillStyle='#ffd400';c.font='bold 9px monospace';c.fillText('SUB-13',W-66,H/2+40);
  // houses
  c.fillStyle='#4a3050';c.fillRect(20,20,50,30);c.fillStyle='#ff2e63';c.fillRect(20,16,50,8);
  c.fillStyle='#4a3050';c.fillRect(100,H-50,50,30);c.fillStyle='#2ee6ff';c.fillRect(100,H-54,50,8);

  // towers
  if(st)for(const t of st.towers){
    c.fillStyle=t.col;c.beginPath();c.arc(t.x,t.y,14,0,7);c.fill();
    c.strokeStyle='#000';c.lineWidth=2;c.stroke();
    // spool flanges for spool tower
    if(t.id==='spool'){c.fillStyle='#8B5A2B';c.fillRect(t.x-10,t.y-6,20,12);c.strokeStyle='#F2C230';c.strokeRect(t.x-11,t.y-7,22,14)}
    if(t.id==='lasso'){c.strokeStyle='#2ee6ff';c.beginPath();c.arc(t.x,t.y,10,0,4);c.stroke()}
    if(t.id==='steam'){c.fillStyle='#fff5';c.beginPath();c.arc(t.x,t.y-12,6,0,7);c.fill()}
    c.fillStyle='#fff';c.font='bold 10px monospace';c.textAlign='center';c.fillText('T'+t.tier,t.x,t.y+4);
    if(sel===t){c.strokeStyle='#ffd400';c.lineWidth=2;c.beginPath();c.arc(t.x,t.y,t.range*TW,0,7);c.stroke()}
  }
  // place preview
  if(placeId&&st){
    const def=TOWERS.find(t=>t.id===placeId);
    // handled on move via lastMX - skip if no hover stored
  }
  // enemies
  if(st)for(const e of st.enemies){
    c.fillStyle=e.col;c.beginPath();c.arc(e.x,e.y,e.r,0,7);c.fill();
    c.strokeStyle='#000';c.stroke();
    // hp bar
    c.fillStyle='#000';c.fillRect(e.x-12,e.y-e.r-8,24,4);
    c.fillStyle='#7dff5a';c.fillRect(e.x-12,e.y-e.r-8,24*(e.hp/e.max),4);
    if(e.boss){c.fillStyle='#ffd400';c.font='bold 9px monospace';c.textAlign='center';c.fillText('BOSS',e.x,e.y-e.r-10)}
  }
  // shots = flat spools
  if(st)for(const s of st.shots){
    c.fillStyle='#C8A27A';c.beginPath();c.ellipse(s.x,s.y,10,6,0,0,7);c.fill();
    c.strokeStyle='#5A3A22';c.lineWidth=2;c.stroke();
    c.fillStyle='#2ee6ff';c.beginPath();c.arc(s.x,s.y,3,0,7);c.fill();
  }
  if(st)for(const f of st.fx){
    c.globalAlpha=Math.max(0,f.t);
    c.strokeStyle=f.col;c.lineWidth=2;c.beginPath();c.arc(f.x,f.y,f.r||16,0,7);c.stroke();
    c.globalAlpha=1;
  }
  // kilo chip
  try{if(imgs.kilo_face.complete)c.drawImage(imgs.kilo_face,8,H-48,40,40)}catch(e){}
  if(st){c.font='20px serif';c.fillText(kiloEmoji(st.kilo),52,H-20)}
  c.fillStyle='#ffffff66';c.font='bold 10px monospace';c.textAlign='left';
  c.fillText('POLE #A1gR-APBeVk'+(vip?' ★ VIP':''),8,14);
  if(st&&!st.on&&!st.won){/* title covers */}
}

function hud(){
  if(!st)return;
  $('#pr').textContent=Math.floor(st.pretzels);$('#cf').textContent=st.coffee;
  $('#kilo').textContent=kiloEmoji(st.kilo);$('#kh').textContent=Math.round(st.kilo.happy);
  $('#wv').textContent=st.wave;$('#lv').textContent=st.lives;
  $('#quiet').textContent='QUIET MODE: '+(st.quiet?'ON':'OFF');
  $('#quiet').classList.toggle('go',st.quiet);
}

let hover={x:0,y:0};
function canvasPos(e){
  const r=cv.getBoundingClientRect();
  const pt=e.touches?e.touches[0]:e;
  return{x:(pt.clientX-r.left)/r.width*W,y:(pt.clientY-r.top)/r.height*H};
}
function onDown(e){
  e.preventDefault();if(!st)return;
  const p=canvasPos(e);hover=p;
  const cx=Math.floor(p.x/TW),cy=Math.floor((p.y-10)/TH);
  if(placeId){placeTower(cx,cy);return}
  const t=st.towers.find(t=>Math.hypot(t.x-p.x,t.y-p.y)<18);
  if(t)showSel(t);else{$('#selp').style.display='none';sel=null}
}
cv.addEventListener('pointerdown',onDown);
cv.addEventListener('pointermove',e=>{hover=canvasPos(e)});
if(!window.PointerEvent){cv.addEventListener('touchstart',onDown,{passive:false})}

$('#next').onclick=()=>{if(!st.on){st.on=true}startWave()};
$('#quiet').onclick=()=>{st.quiet=!st.quiet;hud()};
$('#pretzelBtn').onclick=()=>hush('pretzel');
$('#coffeeBtn').onclick=()=>hush('coffee');
$('#mNorm').onclick=()=>{mode='norm';$('#mNorm').classList.add('on');$('#mEnd').classList.remove('on');reset()};
$('#mEnd').onclick=()=>{mode='end';$('#mEnd').classList.add('on');$('#mNorm').classList.remove('on');reset()};
$('#vipPill').onclick=e=>{e.stopPropagation();promptVip()};

function loop(now){
  if(!last)last=now;const dt=Math.min(0.05,(now-last)/1000);last=now;
  if(st&&st.on)step(dt);
  draw();
  // place range preview
  if(placeId&&st){
    const def=TOWERS.find(t=>t.id===placeId);
    const cx=Math.floor(hover.x/TW),cy=Math.floor((hover.y-10)/TH);
    if(cx>=0&&cy>=0&&cx<COLS&&cy<ROWS){
      const x=(cx+.5)*TW,y=(cy+.5)*TH+10;
      c.globalAlpha=.35;c.fillStyle=onPath(cx,cy)?'#ff2e63':def.col;
      c.beginPath();c.arc(x,y,def.range*TW,0,7);c.fill();c.globalAlpha=1;
    }
  }
  raf=requestAnimationFrame(loop);
}

function bootTitle(){
  const stage=$('#stage');
  let ov=stage.querySelector('.titleov');if(ov)ov.remove();
  XC.muteBtn();
  const t=document.createElement('div');t.className='titleov';
  t.innerHTML=`<div class="tbox"><img src="${A}dkorn_face.jpg" alt=""><h2>SPOOL TOSS TD</h2>
  <p>Place Spool / Lasso / Steam towers along the cul-de-sac. Quiet Mode + Baby Kilo meter. Clear Wave 12 with Kilo Happy ≥ 50%.</p>
  <p style="color:#2ee6ff;font-size:11px">Flat cable spools only · STAGE: A1gR-APBeVk</p>
  <div class="ctp">TAP TO START</div></div>`;
  stage.appendChild(t);
  const go=e=>{if(e.target.closest('button'))return;e.preventDefault();t.remove();st.on=true;last=0};
  t.addEventListener('pointerdown',go);t.addEventListener('click',go);
}

refreshVip();reset();bootTitle();requestAnimationFrame(loop);
