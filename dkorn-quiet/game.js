const $=XC.$,cv=$('#cv'),c=cv.getContext('2d'),W=360,H=320,A='../arcade/dkorn-art/';
const GTYPES=['shh','lasso','pretzel','coffee'];
const GLABEL={shh:'🤫',lasso:'🌀',pretzel:'🥨',coffee:'☕'};
const GCOLOR={shh:'#7dff5a',lasso:'#2ee6ff',pretzel:'#ffb347',coffee:'#c48a3a'};
const HAZ={shh:{name:'Splicer Drone',col:'#88a'},lasso:{name:'Sparking Transformer',col:'#2ee6ff'},pretzel:{name:'Raccoon Cart',col:'#a86'},coffee:{name:'Rattling Radiator',col:'#c84'}};
const imgs={};['kilo_face','dkorn_face','voltia_face','krampus_face','ep01_thumb'].forEach(n=>{const i=new Image();i.src=A+n+'.jpg';imgs[n]=i});

let st,raf,last=0,mode='endless',vipOn=false,rng=Math.random;

function vipData(){try{return XC.get('dkorn-vip')||null}catch(e){return null}}
function vipVerified(){const v=vipData();return !!(v&&v.verified)||vipOn}
function refreshVip(){
  const ok=vipVerified();
  $('#vipTag').textContent=ok?'★ VIP SKIN':'';
  document.body.classList.toggle('vipskin',ok);
  $('#vipPill').textContent=ok?'VIP Skin ON · Golden Hard-Hat':'VIP Skin / Toy Code';
}
function promptVip(){
  const code=window.prompt('Enter toy serial for VIP cosmetic skin (or open binder/#vip).\nTry: A1gR-APBeVk','');
  if(!code)return;
  if(code.trim().toUpperCase().replace(/\s/g,'')==='A1GR-APBEVK'||code.trim()==='A1gR-APBeVk'){
    vipOn=true;
    try{XC.set('dkorn-vip',{verified:true,skin:true,source:'toy-code',at:Date.now()})}catch(e){}
    refreshVip();
    XC.sfx(990,.2,'triangle');
  }else alert('That serial did not match Pole #A1gR-APBeVk. Game is fully playable either way!');
}

function sleepEmoji(s){return s>=70?'😴':s>=35?'😊':'😭'}

function makePattern(n){
  const a=[];
  for(let i=0;i<n;i++)a.push(GTYPES[Math.floor(rng()*4)]);
  return a;
}

function start(){
  cancelAnimationFrame(raf);last=0;
  const daily=mode==='daily';
  rng=daily?XC.rng('dkorn-quiet-'+XC.today()):Math.random;
  st={
    on:true,score:0,streak:0,bestStreak:0,sleep:100,happy:80,
    t:0,spawnAt:.9,haz:[],flash:null,flashT:0,missFlash:0,
    daily,seed:daily?XC.today():null,wave:0,cleared:0
  };
  hud();$('#quip').innerHTML=daily
    ?`Daily 3 AM Shift · <b>${XC.today()}</b> — same pattern for everyone on X.`
    :'Endless Night. Match the Quiet gesture. Keep Kilo asleep!';
  loop(performance.now());
}

function spawn(){
  if(!st||!st.on)return;
  const lane=Math.floor(rng()*4);
  const g=GTYPES[Math.floor(rng()*4)];
  const speed=70+Math.min(90,st.cleared*3)+(vipVerified()?5:0);
  st.haz.push({g,lane,y:-30,speed,hit:false});
  st.wave++;
}

function gesture(g){
  if(!st?.on)return;
  const btn=[...document.querySelectorAll('.gestures button')].find(b=>b.dataset.g===g);
  if(btn){btn.classList.add('flash');setTimeout(()=>btn.classList.remove('flash'),120)}
  // nearest matching hazard in any lane in lower half
  let best=null,bd=1e9;
  for(const h of st.haz){
    if(h.hit||h.g!==g)continue;
    if(h.y<40)continue;
    const d=Math.abs(H-70-h.y);
    if(d<bd){bd=d;best=h}
  }
  if(best&&bd<110){
    best.hit=true;st.score+=10+st.streak*2;st.streak++;st.bestStreak=Math.max(st.bestStreak,st.streak);
    st.sleep=Math.min(100,st.sleep+2);st.happy=Math.min(100,st.happy+1);st.cleared++;
    st.flash=g;st.flashT=.25;XC.sfx(720+st.streak*20,.06,'triangle');
    $('#quip').innerHTML=['<b>Dkorn:</b> “Quiet Mode’s on.”','<b>Voltia:</b> “Crown’s lit — hush.”','<b>Krampus:</b> “…wit\' mustard?”','<b>Kilo:</b> *soft pretzel snore*'][st.cleared%4];
  }else{
    st.streak=0;st.sleep=Math.max(0,st.sleep-6);st.missFlash=.2;XC.sfx(160,.12,'sawtooth');
    $('#quip').innerHTML='<b>Wrong hush!</b> Noise leaks toward the crib…';
  }
  hud();
}

function step(dt){
  st.t+=dt;st.flashT=Math.max(0,st.flashT-dt);st.missFlash=Math.max(0,st.missFlash-dt);
  st.spawnAt-=dt;
  if(st.spawnAt<=0){
    spawn();
    st.spawnAt=Math.max(.55,1.35-st.cleared*.018)+(rng()*.25);
  }
  for(const h of st.haz){
    if(h.hit){h.y-=80*dt;continue}
    h.y+=h.speed*dt;
    if(h.y>H-55){
      h.hit=true;st.streak=0;st.sleep=Math.max(0,st.sleep-14);st.happy=Math.max(0,st.happy-8);
      XC.sfx(110,.25,'sawtooth');
      $('#quip').innerHTML=`<b>${HAZ[h.g].name}</b> got too close!`;
    }
  }
  st.haz=st.haz.filter(h=>!(h.hit&&h.y<-40)&&h.y<H+40);
  // slow sleep drain ambient
  if(st.haz.some(h=>!h.hit))st.sleep=Math.max(0,st.sleep-2.2*dt);
  if(st.sleep<=0){st.on=false;end();return}
  hud();
}

function draw(){
  const vip=vipVerified();
  c.fillStyle=vip?'#12100a':'#0b1020';c.fillRect(0,0,W,H);
  // grid
  c.strokeStyle=vip?'#3a3010':'#1a2a44';c.lineWidth=1;
  for(let x=0;x<W;x+=20){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  for(let y=0;y<H;y+=20){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  // crib
  const cx=W/2,cy=H-48;
  c.fillStyle='#2a1a10';c.fillRect(cx-70,cy-18,140,36);
  c.strokeStyle=vip?'#ffd400':'#2ee6ff';c.lineWidth=3;c.strokeRect(cx-70,cy-18,140,36);
  c.fillStyle='#1a0a08';c.fillRect(cx-55,cy-8,110,20);
  // kilo
  try{if(imgs.kilo_face.complete)c.drawImage(imgs.kilo_face,cx-28,cy-50,56,56)}catch(e){}
  c.font='22px serif';c.textAlign='center';c.fillText(sleepEmoji(st?st.sleep:100),cx+36,cy-28);
  c.fillStyle='#ffd400';c.font='bold 10px monospace';c.fillText('CRIB · QUIET ZONE',cx,cy+28);
  // lanes
  const lanes=[60,140,220,300];
  for(let i=0;i<4;i++){
    c.fillStyle='#ffffff08';c.fillRect(lanes[i]-28,0,56,H-70);
  }
  if(st)for(const h of st.haz){
    const x=lanes[h.lane];
    c.globalAlpha=h.hit?.4:1;
    c.fillStyle=GCOLOR[h.g];
    c.beginPath();c.arc(x,h.y,18,0,7);c.fill();
    c.fillStyle='#000';c.font='16px serif';c.textAlign='center';c.fillText(GLABEL[h.g],x,h.y+5);
    c.globalAlpha=1;
    if(!h.hit&&h.y>H-140){
      c.strokeStyle='#ff2e63';c.lineWidth=2;c.strokeRect(x-22,h.y-22,44,44);
    }
  }
  if(st&&st.missFlash>0){c.fillStyle='rgba(255,46,99,'+(st.missFlash*1.5)+')';c.fillRect(0,0,W,H)}
  // stage stamp
  c.fillStyle='#ffffff55';c.font='bold 9px monospace';c.textAlign='left';
  c.fillText('STAGE: A1gR-APBeVk',8,14);
  if(vip){c.fillStyle='#ffd400';c.fillText('★ VIP GOLDEN HARD-HAT',8,26)}
}

function hud(){
  if(!st)return;
  $('#sc').textContent=st.score;$('#st').textContent=st.streak;
  $('#kilo').textContent=sleepEmoji(st.sleep);$('#sleep').textContent=Math.round(st.sleep);
  const key=st.daily?'dkorn-quiet-daily':'dkorn-quiet';
  $('#hi').textContent=XC.get(key)??'—';
}

function end(){
  st.on=false;
  const key=st.daily?'dkorn-quiet-daily':'dkorn-quiet';
  const{best,rec}=XC.best(key,st.score);
  hud();
  XC.over({
    img:A+'ep01_cover.jpg',
    title:'BABY KILO IS AWAKE',
    stats:`YOU EAT THE SPOOL!<br>Score <b>${st.score}</b> · Best streak ${st.bestStreak}`+(rec?' · NEW BEST!':` · Best ${best}`)+`<br><small>Family hugs Kilo anyway. Pole #A1gR-APBeVk.</small>`,
    text:`I kept Baby Kilo asleep for ${st.score} points in Don't Wake Baby Kilo! (${st.daily?'Daily '+XC.today():'Endless Night'}). Can you hush the grid?`,
    path:'dkorn-quiet/',
    againLabel:'Replay hush',
    again:start
  });
}

function loop(now){
  if(!st?.on){draw();return}
  if(!last)last=now;
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  step(dt);draw();
  raf=requestAnimationFrame(loop);
}

document.querySelectorAll('.gestures button').forEach(b=>{
  const go=e=>{e.preventDefault();gesture(b.dataset.g)};
  b.addEventListener('pointerdown',go);b.addEventListener('click',go);
});
$('#mEndless').onclick=()=>{mode='endless';$('#mEndless').classList.add('on');$('#mDaily').classList.remove('on')};
$('#mDaily').onclick=()=>{mode='daily';$('#mDaily').classList.add('on');$('#mEndless').classList.remove('on')};
$('#vipPill').onclick=e=>{e.stopPropagation();promptVip()};
addEventListener('keydown',e=>{
  const map={Digit1:'shh',Digit2:'lasso',Digit3:'pretzel',Digit4:'coffee',KeyQ:'shh',KeyW:'lasso',KeyE:'pretzel',KeyR:'coffee'};
  if(map[e.code]){e.preventDefault();gesture(map[e.code])}
});

XC.muteBtn();refreshVip();
$('#hi').textContent=XC.get('dkorn-quiet')??'—';
XC.title($('#stage'),{
  name:"DON'T WAKE BABY KILO!",
  img:A+'kilo_face.jpg',
  how:'Noise hazards drift toward the crib. Tap Finger-Shh / Cyan Lasso / Pretzel / Coffee Steam to match them. Misses wake Kilo. Keys 1–4.',
  best:XC.get('dkorn-quiet'),
  extra:`<p style="font-size:11px;color:#2ee6ff">STAGE: A1gR-APBeVk · PG family arcade</p>`,
  start
});
