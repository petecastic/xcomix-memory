const $=XC.$,cv=$('#cv'),c=cv.getContext('2d'),W=400,H=360,A='../arcade/dkorn-art/';
const imgs={};['dkorn_face','voltia_face','krampus_face','kilo_face','boss_phantom_outage'].forEach(n=>{const i=new Image();i.src=A+n+'.jpg';imgs[n]=i});
let st,raf,last=0,keys={},vipOn=false,hold=false;

function vipVerified(){return false}
function refreshVip(){
  const tag=$('#vipTag'); if(tag) tag.textContent='';
  const pill=$('#vipPill'); if(pill) pill.remove();
}

function setPlayer(p){
  if(!st?.on)return;
  // phase gates soft: can switch anytime for tag-team, but recommended player highlighted
  st.player=p;
  [...document.querySelectorAll('#chips button')].forEach(b=>b.classList.toggle('on',+b.dataset.p===p));
  hudPlayers();
  if(p===3)$('#quip').innerHTML='<b>3P KRAMPUS</b> active — bucket-truck steam!';
  else if(p===2)$('#quip').innerHTML='<b>2P VOLTIA</b> — aim cyan prism nodes.';
  else $('#quip').innerHTML='<b>1P DKORN</b> — climb & spool-bridge.';
}
function hudPlayers(){
  ['p1','p2','p3'].forEach((id,i)=>{
    const el=$('#'+id);el.classList.toggle('pactive',st&&st.player===i+1);
  });
}

function reset(){
  st={
    on:true,phase:1,player:1,hp:3,t:0,
    // phase 1 climb
    y:H-50,vy:0,climb:0,bridges:[],gaps:[0.35,0.55,0.75],bridged:{},arcs:[],
    // phase 2 prisms
    nodes:[{a:0.4,locked:false},{a:1.2,locked:false},{a:2.1,locked:false},{a:3.4,locked:false}],
    cores:[{lit:false},{lit:false},{lit:false}],
    aim:0,beamOn:false,
    // phase 3 boss
    boss:100,bucket:0,steam:0,spoolCD:0,lassoCD:0,
    // phase 4 encore
    encore:false,shadow:100,
    msg:'',msgT:0,won:false
  };
  setPlayer(1);
  $('#quip').textContent='Phase 1: climb Storm-Head lattice. Tap/Space to spool-bridge gaps. Dodge arc surges.';
  $('#ph').textContent='1';
}

function msg(t,s){st.msg=t;st.msgT=s||1.5}

function step(dt){
  if(!st?.on)return;
  st.t+=dt;st.msgT=Math.max(0,st.msgT-dt);
  st.spoolCD=Math.max(0,st.spoolCD-dt);st.lassoCD=Math.max(0,st.lassoCD-dt);st.steam=Math.max(0,st.steam-dt);

  if(st.phase===1)stepP1(dt);
  else if(st.phase===2)stepP2(dt);
  else if(st.phase===3)stepP3(dt);
  else if(st.phase===4)stepP4(dt);
  hud();
}

function stepP1(dt){
  // auto climb
  const target=Math.min(1,st.climb+dt*.06);
  // arc hazards
  if(Math.random()<dt*1.2)st.arcs.push({y:H-40-st.climb*(H-80)-30-Math.random()*40,x:80+Math.random()*240,t:1.2});
  for(const a of st.arcs){a.t-=dt}
  st.arcs=st.arcs.filter(a=>a.t>0);

  // gaps need bridges
  const prog=st.climb;
  for(const g of st.gaps){
    if(prog>g-.02&&prog<g+.02&&!st.bridged[g]){
      // stuck until bridge
      if(!(keys[' ']||hold||keys.Space)){/* waiting */}
    }
  }
  let blocked=false;
  for(const g of st.gaps){
    if(!st.bridged[g]&&prog>=g-.005){blocked=true;st.climb=g-.005;msg('Gap! Tap to toss a flat spool bridge',1)}
  }
  if(!blocked)st.climb=Math.min(1,st.climb+dt*(st.player===1?0.08:0.045));

  // hit by arc
  const py=H-40-st.climb*(H-80);
  for(const a of st.arcs){
    if(Math.abs(a.y-py)<18&&Math.abs(a.x-200)<50&&a.t>0.3&&a.t<1){
      a.t=0;hurt();break;
    }
  }
  if(st.climb>=1){st.phase=2;st.player=2;setPlayer(2);msg('Phase 2 — Voltia prism time!',2);$('#ph').textContent='2';
    $('#quip').textContent='Rotate prisms (drag/←→) and tap to fire cyan arc into Frozen Fuse-Cores.';XC.sfx(880,.2,'triangle')}
}

function bridge(){
  if(st.phase!==1)return;
  for(const g of st.gaps){
    if(!st.bridged[g]&&Math.abs(st.climb-g)<.06){
      st.bridged[g]=true;st.bridges.push(g);XC.sfx(500,.1);msg('Spool bridge locked!',1);return;
    }
  }
  // if near any gap
  for(const g of st.gaps){
    if(!st.bridged[g]&&st.climb>g-.1&&st.climb<g+.05){
      st.bridged[g]=true;st.bridges.push(g);XC.sfx(500,.1);msg('Spool bridge locked!',1);return;
    }
  }
}

function stepP2(dt){
  // rotate aim
  if(keys.ArrowLeft||keys.a)st.aim-=1.8*dt;
  if(keys.ArrowRight||keys.d)st.aim+=1.8*dt;
  // auto-nudge nodes slightly when player 2
  if(st.player===2&&hold){
    // fire beam
    fireBeam();
  }
  // check win
  if(st.cores.every(c=>c.lit)){
    st.phase=3;st.player=3;setPlayer(3);msg('Phase 3 — 3P KRAMPUS + family!',2);$('#ph').textContent='3';
    $('#quip').innerHTML='<b>3P KRAMPUS</b> elevates the bucket-truck. Tap steam / spool / lasso. Switch 1/2/3!';
    XC.sfx(990,.25,'triangle');
  }
}

function fireBeam(){
  if(st.phase!==2)return;
  // lock nearest node to aim
  let best=null,bd=1;
  st.nodes.forEach((n,i)=>{const d=Math.abs(((n.a-st.aim+Math.PI)%(Math.PI*2))-Math.PI);if(d<bd){bd=d;best=i}});
  if(best==null||bd>0.35)return;
  st.nodes[best].locked=true;
  // light a core if enough nodes aligned (every locked node lights one)
  const lit=st.nodes.filter(n=>n.locked).length;
  for(let i=0;i<Math.min(3,lit);i++)st.cores[i].lit=true;
  XC.sfx(700+lit*80,.08,'triangle');
  msg('Prism locked! Fuse-Core '+(Math.min(3,lit))+'/3',1);
}

function stepP3(dt){
  // bucket elevates
  if(st.player===3)st.bucket=Math.min(1,st.bucket+dt*.15);
  else st.bucket=Math.min(1,st.bucket+dt*.05);
  // boss weak when steamed
  if(st.steam>0)st.boss=Math.max(0,st.boss-12*dt);
  // ambient
  if(Math.random()<dt*.4){/* spark */}
  if(st.boss<=0){
    st.phase=4;st.encore=true;st.shadow=100;st.player=1;setPlayer(1);
    msg('Shadow Outage!',2.5);$('#ph').textContent='4';
    $('#quip').textContent='Phase 4: finish the Shadow Outage with the whole family!';
    XC.sfx(200,.4,'sawtooth');
  }
  // boss counterattack
  if(Math.random()<dt*.35 && st.steam<=0){
    if(Math.random()<.3)hurt();
  }
}

function stepP4(dt){
  st.shadow=Math.max(0,st.shadow-8*dt*(st.player?1:1));
  if(hold||keys[' ']||keys.Space)st.shadow=Math.max(0,st.shadow-25*dt);
  if(st.shadow<=0)win();
  if(Math.random()<dt*.4)hurt();
}

function hurt(){
  st.hp--;XC.sfx(120,.25,'sawtooth');msg('Arc surge!',.8);
  if(st.hp<=0){st.on=false;lose()}
}

function action(){
  if(!st?.on)return;
  if(st.phase===1)bridge();
  else if(st.phase===2)fireBeam();
  else if(st.phase===3){
    if(st.player===3){st.steam=1.6;XC.sfx(250,.15,'sawtooth');msg('Coffee steam blast!',.8)}
    else if(st.player===1&&st.spoolCD<=0){st.spoolCD=.4;st.boss=Math.max(0,st.boss-4);XC.sfx(360,.05);msg('Flat spool toss!',.5)}
    else if(st.player===2&&st.lassoCD<=0){st.lassoCD=.5;st.boss=Math.max(0,st.boss-3);st.steam=Math.max(st.steam,.4);XC.sfx(780,.06,'triangle');msg('Lasso core!',.5)}
  }
}

function win(){
  st.on=false;st.won=true;
  const{best,rec}=XC.best('dkorn-rescue',(4-st.hp)*1000+Math.floor(st.t*10));
  XC.over({
    img:A+'dkorn_family_arcade_hero.jpg',
    title:'STORM-HEAD CLEARED!',
    stats:`Pole #CIRCUIT-13 · Phase ${st.encore?4:3}<br>♥ left ${st.hp}`+(rec?' · NEW BEST CLEAR!':''),
    text:`Cleared Storm-Head on Pole #CIRCUIT-13 — See you in another timeline.`,
    path:'dkorn-rescue/',
    again:()=>{reset();last=0;loop(performance.now())}
  });
}
function lose(){
  XC.over({
    img:A+'boss_phantom_outage.jpg',
    title:'OUTAGE WINS… FOR NOW',
    stats:`Made it to Phase ${st.phase} on Storm-Head Tower`,
    text:`Phantom Outage pushed us back on Pole #CIRCUIT-13. Rematch?`,
    path:'dkorn-rescue/',
    again:()=>{reset();last=0;loop(performance.now())}
  });
}

function draw(){
  const vip=vipVerified();
  c.fillStyle=vip?'#120e00':'#0a1020';c.fillRect(0,0,W,H);
  // storm sky
  c.fillStyle='#1a2040';c.fillRect(0,0,W,120);
  for(let i=0;i<8;i++){c.strokeStyle='#2ee6ff22';c.beginPath();c.moveTo(i*50,0);c.lineTo(i*50+20,120);c.stroke()}

  // tower lattice
  const baseX=W/2;
  c.strokeStyle='#8B5A2B';c.lineWidth=4;
  c.beginPath();c.moveTo(baseX-40,H);c.lineTo(baseX-20,40);c.lineTo(baseX+20,40);c.lineTo(baseX+40,H);c.stroke();
  for(let y=H-30;y>50;y-=28){
    c.strokeStyle='#6B4423';c.lineWidth=2;
    c.beginPath();c.moveTo(baseX-30+(H-y)*.05,y);c.lineTo(baseX+30-(H-y)*.05,y);c.stroke();
  }
  c.fillStyle='#ffd400';c.font='bold 9px monospace';c.textAlign='center';
  c.fillText('POLE #CIRCUIT-13',baseX,28);

  if(!st)return;

  if(st.phase===1){
    const py=H-40-st.climb*(H-80);
    // gaps
    st.gaps.forEach(g=>{
      const gy=H-40-g*(H-80);
      if(!st.bridged[g]){c.fillStyle='#ff2e6388';c.fillRect(baseX-50,gy-4,100,8);c.fillStyle='#fff';c.font='10px monospace';c.fillText('GAP',baseX,gy+3)}
      else{c.fillStyle='#C8A27A';c.fillRect(baseX-45,gy-5,90,10);c.strokeStyle='#5A3A22';c.strokeRect(baseX-45,gy-5,90,10)}
    });
    // arcs
    st.arcs.forEach(a=>{c.strokeStyle=`rgba(46,230,255,${a.t})`;c.lineWidth=3;c.beginPath();c.moveTo(a.x-20,a.y);c.lineTo(a.x+20,a.y-10);c.stroke()});
    try{if(imgs.dkorn_face.complete)c.drawImage(imgs.dkorn_face,baseX-18,py-36,36,36)}catch(e){}
    c.fillStyle='#F2C230';c.fillRect(baseX-10,py-40,20,5);
  }

  if(st.phase===2){
    // prism ring
    c.strokeStyle='#2ee6ff';c.lineWidth=2;c.beginPath();c.arc(baseX,H/2,70,0,7);c.stroke();
    st.nodes.forEach((n,i)=>{
      const x=baseX+Math.cos(n.a)*70,y=H/2+Math.sin(n.a)*70;
      c.fillStyle=n.locked?'#ffd400':'#2ee6ff';c.beginPath();c.arc(x,y,8,0,7);c.fill();
    });
    // aim
    c.strokeStyle='#fff';c.beginPath();c.moveTo(baseX,H/2);c.lineTo(baseX+Math.cos(st.aim)*90,H/2+Math.sin(st.aim)*90);c.stroke();
    // cores
    st.cores.forEach((core,i)=>{
      const x=80+i*120,y=H-50;
      c.fillStyle=core.lit?'#7dff5a':'#345';c.fillRect(x-16,y-16,32,32);
      c.fillStyle='#000';c.font='bold 10px monospace';c.textAlign='center';c.fillText(core.lit?'ON':'FUSE',x,y+4);
    });
    try{if(imgs.voltia_face.complete)c.drawImage(imgs.voltia_face,baseX-20,H/2-20,40,40)}catch(e){}
  }

  if(st.phase>=3){
    // boss
    const bx=baseX,by=90;
    c.fillStyle=st.phase===4?'#201030':'#1a2030';
    try{if(imgs.boss_phantom_outage.complete)c.drawImage(imgs.boss_phantom_outage,bx-40,by-40,80,80);
    else{c.beginPath();c.arc(bx,by,36,0,7);c.fill()}}catch(e){c.beginPath();c.arc(bx,by,36,0,7);c.fill()}
    c.strokeStyle=st.steam>0?'#c48a3a':'#2ee6ff';c.lineWidth=3;c.beginPath();c.arc(bx,by,40,0,7);c.stroke();
    c.fillStyle='#fff';c.font='bold 11px monospace';c.textAlign='center';
    c.fillText(st.phase===4?'SHADOW OUTAGE':'PHANTOM OUTAGE',bx,by-48);
    // bucket truck
    const by2=H-60-st.bucket*120;
    c.fillStyle='#F2C230';c.fillRect(40,by2,50,28);
    c.fillStyle='#D4E157';c.fillRect(45,by2+4,40,12);
    c.strokeStyle='#888';c.lineWidth=3;c.beginPath();c.moveTo(65,H-20);c.lineTo(65,by2+28);c.stroke();
    if(st.player===3){c.fillStyle='#7dff5a';c.font='bold 12px Impact,sans-serif';c.fillText('3P KRAMPUS',65,by2-6)}
    try{
      const im=st.player===1?imgs.dkorn_face:st.player===2?imgs.voltia_face:imgs.krampus_face;
      if(im.complete)c.drawImage(im,48,by2-8,36,36);
    }catch(e){}
    if(st.steam>0){c.fillStyle='rgba(196,138,58,.35)';c.beginPath();c.arc(bx,by,50+st.steam*20,0,7);c.fill()}
  }

  if(st.msgT>0){c.fillStyle='#ffd400';c.font='bold 14px Impact,sans-serif';c.textAlign='center';c.fillText(st.msg,W/2,50)}
  if(vip){c.fillStyle='#2ee6ff';c.font='bold 10px monospace';c.textAlign='right';c.fillText('★ VIP',W-8,14)}
}

function hud(){
  if(!st)return;
  $('#ph').textContent=st.phase;
  $('#hp').textContent='❤'.repeat(Math.max(0,st.hp));
  const b=st.phase===4?st.shadow:st.phase===3?st.boss:st.phase===2?(st.cores.filter(x=>x.lit).length/3*100):Math.round(st.climb*100);
  $('#bh').textContent=Math.round(b);
  hudPlayers();
}

function loop(now){
  if(!st?.on){draw();return}
  if(!last)last=now;
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  step(dt);draw();
  raf=requestAnimationFrame(loop);
}

function start(){cancelAnimationFrame(raf);last=0;reset();loop(performance.now())}

cv.addEventListener('pointerdown',e=>{e.preventDefault();hold=true;action();
  if(st?.phase===2){const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W-W/2;const y=(e.clientY-r.top)/r.height*H-H/2;st.aim=Math.atan2(y,x)}
});
cv.addEventListener('pointerup',()=>hold=false);
cv.addEventListener('pointermove',e=>{
  if(st?.phase===2&&(e.buttons||hold)){const r=cv.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W-W/2;const y=(e.clientY-r.top)/r.height*H-H/2;st.aim=Math.atan2(y,x)}
});
addEventListener('keydown',e=>{
  keys[e.key]=1;keys[e.code]=1;
  if(e.key==='1')setPlayer(1);if(e.key==='2')setPlayer(2);if(e.key==='3')setPlayer(3);
  if(e.code==='Space'){e.preventDefault();hold=true;action()}
});
addEventListener('keyup',e=>{keys[e.key]=0;keys[e.code]=0;if(e.code==='Space')hold=false});
document.querySelectorAll('#chips button').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();setPlayer(+b.dataset.p)}));

XC.muteBtn();refreshVip();
XC.title($('#stage'),{
  name:'CO-OP GRID RESCUE',
  img:A+'krampus_face.jpg',
  how:'3 phases on Storm-Head Tower: Dkorn spool-bridges → Voltia prism cores → Krampus steam vs Phantom Outage. Tap chips or keys 1/2/3 to tag-team. Local hotseat friendly.',
  best:XC.get('dkorn-rescue'),
  extra:'<p style="font-size:11px;color:#7dff5a">Share: Cleared Storm-Head on Pole #CIRCUIT-13</p>',
  start
});
