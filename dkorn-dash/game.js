const $=XC.$,cv=$('#cv'),c=cv.getContext('2d'),W=400,H=300,A='../arcade/dkorn-art/';
const CREW=[
  {id:'dkorn',name:'Dkorn',img:'dkorn_face',col:'#F2C230'},
  {id:'voltia',name:'Voltia',img:'voltia_face',col:'#FFB347'},
  {id:'krampus',name:'Krampus',img:'krampus_face',col:'#D4E157'}
];
const imgs={};CREW.forEach(p=>{const i=new Image();i.src=A+p.img+'.jpg';imgs[p.id]=i});
let st,raf,last=0,holding=false,skin='dkorn',vipOn=false,unlocked={dkorn:true};

function vipVerified(){return false}
function refreshVip(){
  const tag=$('#vipTag'); if(tag) tag.textContent='';
  const pill=$('#vipPill'); if(pill) pill.remove();
  renderSkins();
}
function renderSkins(){
  const el=$('#skins');el.innerHTML='';
  CREW.forEach(p=>{
    if(!unlocked[p.id]&&p.id!=='dkorn')return;
    const b=document.createElement('button');b.className=skin===p.id?'on':'';
    b.innerHTML=`<img src="${A+p.img}.jpg" alt="${p.name}">`;
    b.onclick=e=>{e.stopPropagation();skin=p.id;renderSkins()};
    el.appendChild(b);
  });
  if(vipVerified()){
    const b=document.createElement('button');b.className=skin==='gold'?'on':'';
    b.title='Golden Hard-Hat VIP';b.innerHTML='<div style="width:40px;height:40px;border-radius:50%;background:radial-gradient(#ffd400,#a08000);display:flex;align-items:center;justify-content:center;font:900 11px system-ui;color:#000">VIP</div>';
    b.onclick=e=>{e.stopPropagation();skin='gold';renderSkins()};
    el.appendChild(b);
  }
}

function reset(){
  st={
    on:true,x:80,y:180,vy:0,vx:0,grounded:false,swinging:false,line:null,ang:0,angV:0,
    spoolJumps:1,hp:3,tokens:0,combo:1,comboT:0,dist:0,t:0,scroll:0,speed:140,
    poles:[],lines:[],items:[],haz:[],zip:null,mustard:0,msgT:0,msg:''
  };
  // seed poles
  for(let i=0;i<8;i++)addPole(120+i*160);
  $('#quip').textContent='Hold to latch a cyan drop-line. Release to spool-jump!';
}

function addPole(x){
  const h=140+Math.random()*70;
  const top=H-40-h;
  st.poles.push({x,h,top});
  // cyan drop-line hanging from crossarm
  st.lines.push({x:x+18,y0:top+18,len:70+Math.random()*50,live:true});
  // maybe pretzel / hazard
  if(Math.random()<.7)st.items.push({k:'pretzel',x:x+40+Math.random()*40,y:top+40+Math.random()*60,got:false});
  if(Math.random()<.35)st.items.push({k:'mustard',x:x+60,y:top+30,got:false});
  if(Math.random()<.25)st.items.push({k:'key',x:x+30,y:top-10,got:false});
  if(Math.random()<.45)st.haz.push({k:Math.random()<.5?'xfmr':'drone',x:x+50+Math.random()*60,y:top+50+Math.random()*80,w:28,h:28,dead:false});
  if(Math.random()<.2)st.haz.push({k:'limb',x:x+70,y:top+20,w:40,h:18,dead:false});
}

function latch(){
  if(!st?.on||st.swinging)return;
  // find nearest live line within reach
  let best=null,bd=50;
  for(const L of st.lines){
    if(!L.live)continue;
    const dx=L.x-st.x,dy=(L.y0+L.len*.4)-st.y,d=Math.hypot(dx,dy);
    if(d<bd){bd=d;best=L}
  }
  if(best){
    st.swinging=true;st.line=best;st.grounded=false;st.spoolJumps=1;
    st.ang=Math.atan2(st.x-best.x,best.len*.55);st.angV=0;
    XC.sfx(660,.05,'triangle');
  }
}

function release(){
  if(!st?.on||!st.swinging)return;
  st.swinging=false;
  const L=st.line;st.line=null;
  // launch
  st.vx=Math.cos(st.ang)*220+st.speed*.3;st.vy=Math.sin(st.ang)*-200-40;
  XC.sfx(420,.08);
}

function spoolJump(){
  if(!st?.on||st.swinging||st.spoolJumps<=0)return;
  st.spoolJumps--;st.vy=-280;st.grounded=false;XC.sfx(520,.07,'square');
}

function score(){return Math.floor(st.dist/8)+st.tokens*15}

function step(dt){
  st.t+=dt;st.comboT=Math.max(0,st.comboT-dt);if(st.comboT<=0)st.combo=1;
  st.mustard=Math.max(0,st.mustard-dt);st.msgT=Math.max(0,st.msgT-dt);
  const spd=(st.speed+(st.mustard>0?90:0))*(vipVerified()?1.05:1);
  st.scroll+=spd*dt;st.dist+=spd*dt;

  // recycle poles far behind camera
  while(st.poles.length&&st.poles[0].x<st.scroll-100){
    st.poles.shift();
  }
  st.lines=st.lines.filter(L=>L.x>st.scroll-100);
  let mx=st.poles.reduce((m,p)=>Math.max(m,p.x),st.scroll+200);
  while(st.poles.length<8){mx+=140+Math.random()*50;addPole(mx);mx=st.poles[st.poles.length-1].x}

  st.speed=140+Math.min(160,st.dist/40);

  if(st.swinging&&st.line){
    const L=st.line;
    // pendulum
    const g=9.5;
    st.angV+=(-g*Math.sin(st.ang)/Math.max(40,L.len*.01))*dt*6;
    if(holding)st.angV*=0.98; // slight damp while holding
    st.ang+=st.angV*dt;
    st.ang=Math.max(-1.3,Math.min(1.3,st.ang));
    const len=L.len*.7;
    st.x=L.x+Math.sin(st.ang)*len;
    st.y=L.y0+Math.cos(st.ang)*len;
    st.vx=0;st.vy=0;
  }else{
    st.vy+=900*dt;
    st.x+=st.vx*dt;st.y+=st.vy*dt;
    st.vx*=0.99;
    // world scroll: keep player near left-mid
    const target=90;const worldX=st.x; // player world x absolute? We'll treat st.x as world
    // Floor / rooftops
    const ground=H-36;
    // pole platforms (crossarms)
    let onPlat=false;
    for(const p of st.poles){
      const px=p.x-st.scroll+st.scroll; // absolute
      // Actually draw uses p.x - scroll. Player x is world absolute matching pole.x
      if(st.vy>=0&&st.x>p.x-10&&st.x<p.x+40&&st.y>=p.top-4&&st.y<=p.top+16){
        st.y=p.top;st.vy=0;st.grounded=true;st.spoolJumps=1;onPlat=true;
      }
    }
    // neon rooftops as ground strips between poles
    if(st.y>=ground){st.y=ground;st.vy=0;st.grounded=true;st.spoolJumps=1;onPlat=true}
    if(!onPlat&&st.y<ground)st.grounded=false;
    // auto-scroll: pull player with world? Keep camera: represent player screen x = st.x - st.scroll
    // Maintain player roughly: increase st.x with speed slowly so they keep pace
    if(!st.swinging)st.x+=spd*dt*0.85;
  }

  // items
  for(const it of st.items){
    if(it.got)continue;
    if(Math.hypot(it.x-st.x,it.y-st.y)<28){
      it.got=true;
      if(it.k==='pretzel'){st.tokens++;st.combo=Math.min(8,st.combo+1);st.comboT=2.5;st.hp=Math.min(3,st.hp+0);XC.sfx(880,.06,'triangle');st.msg='Lightning pretzel!';st.msgT=1}
      if(it.k==='mustard'){st.mustard=3;XC.sfx(600,.1);st.msg='Mustard Speed!';st.msgT=1.2}
      if(it.k==='key'){st.zip={x:st.x+80,y:st.y-40,t:4};XC.sfx(1000,.15,'triangle');st.msg='Fuse-Core Key — Zip-Line!';st.msgT=1.4}
    }
  }
  st.items=st.items.filter(it=>!it.got&&it.x>st.scroll-100);

  // zip boost
  if(st.zip){st.zip.t-=dt;st.x+=280*dt;st.y+=(st.zip.y-st.y)*3*dt;if(st.zip.t<=0)st.zip=null}

  // hazards
  for(const h of st.haz){
    if(h.dead)continue;
    if(Math.hypot(h.x-st.x,h.y-st.y)<26){
      if(h.k==='drone'&&st.swinging){
        // perfect quiet catch
        h.dead=true;st.tokens+=2;st.combo=Math.min(8,st.combo+2);st.comboT=3;
        XC.sfx(1200,.12,'triangle');st.msg='Quiet Catch!';st.msgT=1;
      }else{
        h.dead=true;st.hp--;st.combo=1;XC.sfx(140,.25,'sawtooth');st.msg='Ouch — spark!';st.msgT=1;
        if(st.hp<=0){st.on=false;end();return}
      }
    }
  }
  st.haz=st.haz.filter(h=>h.x>st.scroll-120);

  // unlock skins by milestones
  if(st.tokens>=15)unlocked.voltia=true;
  if(st.tokens>=30)unlocked.krampus=true;

  // camera follow: set scroll so player screen ~ 100
  st.scroll=st.x-100;
  hud();
}

function draw(){
  const vip=vipVerified();
  // night sky
  const g=c.createLinearGradient(0,0,0,H);
  g.addColorStop(0,vip?'#1a1200':'#050814');g.addColorStop(1,vip?'#2a1808':'#1a0a28');
  c.fillStyle=g;c.fillRect(0,0,W,H);
  // stars
  c.fillStyle='#fff8';for(let i=0;i<30;i++){const sx=((i*97-st.scroll*.05)%W+W)%W;c.fillRect(sx,(i*53)%(H-60),2,2)}

  // neon deli roofs
  for(let i=0;i<5;i++){
    const bx=((i*180-st.scroll*.4)%(W+180)+W+180)%(W+180)-60;
    c.fillStyle='#1a1030';c.fillRect(bx,H-90,120,60);
    c.fillStyle=i%2?'#ff2e63':'#2ee6ff';c.fillRect(bx+8,H-86,104,14);
    c.fillStyle='#fff';c.font='bold 9px system-ui';c.textAlign='center';
    c.fillText(i%2?"SAL'S DELI":'3 AM PRETZELS',bx+60,H-76);
    c.fillStyle='#ffcf66';c.fillRect(bx+20,H-60,16,14);c.fillRect(bx+80,H-60,16,14);
  }

  // ground
  c.fillStyle='#2a2010';c.fillRect(0,H-36,W,36);
  c.fillStyle='#F2C230';for(let x=-(st.scroll%40);x<W;x+=40)c.fillRect(x,H-20,22,3);

  // poles + lines
  if(st)for(const p of st.poles){
    const sx=p.x-st.scroll;
    if(sx<-40||sx>W+40)continue;
    // timber pole
    c.fillStyle='#6B4423';c.fillRect(sx,p.top,14,p.h);
    c.fillStyle='#8B5A2B';c.fillRect(sx+2,p.top,4,p.h);
    // crossarm
    c.fillStyle='#5A3A22';c.fillRect(sx-18,p.top+8,50,8);
    // transformer
    c.fillStyle='#555';c.fillRect(sx+16,p.top+16,18,16);
    c.fillStyle='#2ee6ff';c.fillRect(sx+18,p.top+18,4,4);
  }
  if(st)for(const L of st.lines){
    const sx=L.x-st.scroll;
    c.strokeStyle='#2ee6ff';c.lineWidth=2;c.beginPath();c.moveTo(sx,L.y0);c.lineTo(sx,L.y0+L.len);c.stroke();
    c.fillStyle='#2ee6ff';c.beginPath();c.arc(sx,L.y0+L.len,4,0,7);c.fill();
  }

  // items
  if(st)for(const it of st.items){
    if(it.got)continue;const sx=it.x-st.scroll;
    if(it.k==='pretzel'){c.font='20px serif';c.fillText('🥨',sx-8,it.y)}
    if(it.k==='mustard'){c.fillStyle='#ffd400';c.fillRect(sx-8,it.y-8,16,16);c.fillStyle='#000';c.font='bold 9px monospace';c.textAlign='center';c.fillText('M',sx,it.y+3)}
    if(it.k==='key'){c.fillStyle='#2ee6ff';c.beginPath();c.arc(sx,it.y,8,0,7);c.fill();c.fillStyle='#000';c.font='bold 9px monospace';c.textAlign='center';c.fillText('F',sx,it.y+3)}
  }
  // haz
  if(st)for(const h of st.haz){
    if(h.dead)continue;const sx=h.x-st.scroll;
    if(h.k==='xfmr'){c.fillStyle='#666';c.fillRect(sx-12,h.y-12,24,24);c.strokeStyle='#ffd400';c.strokeRect(sx-12,h.y-12,24,24);c.fillStyle='#ff2e63';c.fillText('⚡',sx-6,h.y+4)}
    else if(h.k==='drone'){c.fillStyle='#88a';c.beginPath();c.arc(sx,h.y,12,0,7);c.fill();c.fillStyle='#2ee6ff';c.fillRect(sx-6,h.y-2,12,4)}
    else {c.fillStyle='#9cf';c.fillRect(sx-20,h.y-6,40,12);c.fillStyle='#cff';c.fillText('❄',sx-6,h.y+4)}
  }

  // zip
  if(st?.zip){c.strokeStyle='#ffd400';c.setLineDash([6,4]);c.beginPath();c.moveTo(st.x-st.scroll,st.y);c.lineTo(st.x-st.scroll+80,st.zip.y);c.stroke();c.setLineDash([])}

  // player
  if(st){
    const px=st.x-st.scroll,py=st.y;
    const col=skin==='gold'?'#ffd400':(CREW.find(p=>p.id===skin)||CREW[0]).col;
    try{
      const im=skin==='gold'?imgs.dkorn:imgs[skin]||imgs.dkorn;
      if(im&&im.complete)c.drawImage(im,px-18,py-36,36,36);
      else{c.fillStyle=col;c.beginPath();c.arc(px,py-12,14,0,7);c.fill()}
    }catch(e){c.fillStyle=col;c.beginPath();c.arc(px,py-12,14,0,7);c.fill()}
    if(vip||skin==='gold'){c.strokeStyle='#2ee6ff';c.lineWidth=2;c.strokeRect(px-20,py-38,40,40)}
    // hard hat hint
    c.fillStyle=col;c.fillRect(px-10,py-40,20,6);
    if(st.swinging){c.strokeStyle='#2ee6ff';c.lineWidth=2;c.beginPath();c.moveTo(st.line.x-st.scroll,st.line.y0);c.lineTo(px,py-10);c.stroke()}
  }

  c.fillStyle='#fff';c.font='bold 10px monospace';c.textAlign='left';
  c.fillText('POLE #CIRCUIT-13 · 3 AM VALLEY',8,14);
  c.fillText('♥'.repeat(Math.max(0,st?st.hp:0)),8,28);
  if(st?.msgT>0){c.fillStyle='#ffd400';c.font='bold 14px Impact,sans-serif';c.textAlign='center';c.fillText(st.msg,W/2,40)}
  if(vip){c.fillStyle='#2ee6ff';c.font='bold 10px monospace';c.textAlign='right';c.fillText('★ CYAN ARC VIP',W-8,14)}
}

function hud(){
  if(!st)return;
  $('#sc').textContent=score();$('#pr').textContent=st.tokens;
  $('#cm').textContent='×'+st.combo;$('#di').textContent=Math.floor(st.dist/10);
  $('#hi').textContent=XC.get('dkorn-dash')??'—';
}

function end(){
  const s=score(),{best,rec}=XC.best('dkorn-dash',s);
  if(st.tokens>=15)unlocked.voltia=true;
  if(st.tokens>=30)unlocked.krampus=true;
  try{XC.set('dkorn-dash-unlocks',unlocked)}catch(e){}
  hud();renderSkins();
  XC.over({
    img:A+'dkorn_face.jpg',
    title:rec?'NEW HI-SCORE!':'LINE DOWN!',
    stats:`Score <b>${s}</b> · ${st.tokens} pretzels · ${Math.floor(st.dist/10)}m`+(rec?' · NEW BEST!':` · Best ${best}`),
    text:`I scored ${s} in 3 AM Drop-Line Dash — ${st.tokens} lightning pretzels on Pole #CIRCUIT-13. Beat me!`,
    path:'dkorn-dash/',
    again:()=>{reset();last=0;loop(performance.now())}
  });
}

function loop(now){
  if(!st?.on){draw();return}
  if(!last)last=now;
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  step(dt);draw();
  raf=requestAnimationFrame(loop);
}

function start(){cancelAnimationFrame(raf);last=0;reset();loop(performance.now())}

const holdOn=e=>{e.preventDefault();holding=true;if(st?.swinging)return;if(st&&!st.swinging&&st.spoolJumps>0&&!st.grounded)spoolJump();else latch()};
const holdOff=e=>{holding=false;release()};
cv.addEventListener('pointerdown',holdOn);
cv.addEventListener('pointerup',holdOff);
cv.addEventListener('pointercancel',holdOff);
cv.addEventListener('pointerleave',()=>{if(holding){holding=false;release()}});
if(!window.PointerEvent){
  cv.addEventListener('touchstart',holdOn,{passive:false});
  cv.addEventListener('touchend',holdOff,{passive:false});
}
addEventListener('keydown',e=>{
  if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();holding=true;if(!st?.swinging){if(!st.grounded&&st.spoolJumps>0)spoolJump();else latch()}}
});
addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='ArrowUp'){holding=false;release()}});

try{const u=XC.get('dkorn-dash-unlocks');if(u)Object.assign(unlocked,u)}catch(e){}
XC.muteBtn();refreshVip();renderSkins();
$('#hi').textContent=XC.get('dkorn-dash')??'—';
XC.title($('#stage'),{
  name:'3 AM DROP-LINE DASH',
  img:A+'dkorn_face.jpg',
  how:'Hold to latch cyan drop-lines on timber poles. Release to launch. Spool double-jump in air. Grab pretzels, dodge transformers & drones. Perfect drone catch = Quiet bonus.',
  best:XC.get('dkorn-dash'),
  extra:'<p style="font-size:11px;color:#2ee6ff">Timber poles · cyan drop-lines · Pole #CIRCUIT-13</p>',
  start
});
