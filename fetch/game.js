const A='../arcade/art/',$=XC.$,cv=$('#cv'),c=cv.getContext('2d'),W=400,H=300,GY=250,FINISH=5200;
const img=n=>{const i=new Image();i.src=A+n+'.jpg';return i},BEAR=img('bear_run'),GOOSE=img('bucky'),HONK=img('bucky_honk');
const QUIPS=[
 '<b>Sal:</b> “Hoagie\'s on me.”',
 '<b>Bear:</b> *huff-huff-huff* (tail thumping)',
 '<b>Pete:</b> “Cable tech\'s hoagie. The end bite was the plan.”'
];
let st,raf,loopOn=false;
function fresh(){return {y:0,vy:0,obs:[],t:0,dist:0,hoag:0,honks:0,phase:'idle',count:3,countT:0,next:70,bx:0,slow:0,fx:[]}}
function score(){return Math.floor(st.dist/40)+st.hoag*10}
function spNow(){const base=Math.min(6.2,2.55+st.dist/1500);return st.slow>0?base*0.46:base}
function resetIdle(){st=fresh();$('#score').textContent='0';$('#quip').innerHTML='Bear is at the curb. Hoagies score. Bucky only slows him down.'}
function jump(){if(!st||st.phase==='done')return;if(st.y===0){st.vy=11.2;XC.sfx(520,.05);navigator.vibrate?.(10)}}
function spawn(){
 const r=Math.random();
 const goose=st.dist<850?0.1:st.dist<1900?0.3:0.46;
 if(r<goose)st.obs.push({k:'goose',x:W+24,y:0,w:46,h:52});
 else st.obs.push({k:'hoagie',x:W+24,y:r<.78?0:58+Math.random()*48,w:34,h:22});
 st.next=Math.max(48,108-st.dist/160)+Math.random()*40}
function step(){
 st.vy-=.6;st.y=Math.max(0,st.y+st.vy);if(st.y===0)st.vy=0;
 if(st.phase==='count'){
  if(++st.countT>=52){st.countT=0;st.count--;if(st.count<=0){st.phase='run';$('#quip').innerHTML='<b>Let\'s go.</b> Jump for the hoagies.'}}
  return}
 if(st.phase!=='run')return;
 st.t++;if(st.slow>0)st.slow--;
 const sp=spNow();st.dist+=sp;st.bx=(st.bx+sp*.3)%200;
 if(--st.next<=0)spawn();
 const bx=60,by=GY-st.y,bw=56,bh=52;
 st.obs.forEach(o=>{o.x-=sp;const oy=GY-o.y;
  if(!o.dead&&!o.passed&&o.x<bx+bw-12&&o.x+o.w>bx+10&&oy-o.h<by-8&&oy>by-bh+10){
   if(o.k==='hoagie'){o.dead=1;st.hoag++;$('#quip').innerHTML=QUIPS[(st.hoag-1)%3];st.fx.push({x:o.x,y:oy,txt:'+10',t:42,col:'#7dff5a'});XC.sfx(880,.06);navigator.vibrate?.(12)}
   else{o.passed=1;o.hit=1;st.honks++;st.vy=Math.max(st.vy,9);st.slow=78;
    $('#quip').innerHTML='<b>Bucky:</b> HONK. Bear bounces and keeps the harness on.';
    st.fx.push({x:o.x+10,y:oy-16,txt:'HONK',t:48,col:'#ffd400'});XC.sfx(200,.16,'square');navigator.vibrate?.(16)}}});
 st.obs=st.obs.filter(o=>o.x>-80&&!o.dead);
 st.fx.forEach(f=>f.t--);st.fx=st.fx.filter(f=>f.t>0);
 $('#score').textContent=score();
 if(st.dist>=FINISH)finish()}
function draw(){c.fillStyle='#120c24';c.fillRect(0,0,W,H);
 const tx=300-(st.bx*.5);c.fillStyle='#2a2140';c.fillRect(tx,60,46,190);c.fillStyle='#f5e6b8';c.beginPath();c.arc(tx+23,95,16,0,7);c.fill();c.fillStyle='#000';c.font='bold 9px system-ui';c.textAlign='center';c.fillText('12:49',tx+23,98);
 for(let i=0;i<5;i++){const x=((i*110-st.bx*1.1)%550+550)%550-60;c.fillStyle='#22183a';c.fillRect(x,150,90,100);c.fillStyle='#ffcf66';c.fillRect(x+12,170,18,16);c.fillRect(x+55,170,18,16);if(i===2){c.fillStyle='#e33';c.fillRect(x+5,152,80,14);c.fillStyle='#fff';c.font='bold 10px system-ui';c.fillText("SAL'S HOAGIES",x+45,163)}}
 c.fillStyle='#333';c.fillRect(0,GY,W,H-GY);c.fillStyle='#ffd400';for(let x=-(st.dist%40);x<W;x+=40)c.fillRect(x,GY+22,20,3);
 c.fillStyle='#bbb';c.font='bold 11px system-ui';c.textAlign='left';c.fillText('MILL STREET · BRISTOL',8,16);
 st.obs.forEach(o=>{const oy=GY-o.y;if(o.k==='hoagie'){c.font='26px serif';c.textAlign='left';c.fillText('🥪',o.x,oy-2)}else{c.drawImage(o.hit?HONK:GOOSE,o.x,oy-o.h,o.w,o.h)}});
 c.drawImage(BEAR,60,GY-st.y-52,56,52);
 c.font='900 16px Impact,sans-serif';c.textAlign='center';
 st.fx.forEach(f=>{c.fillStyle=f.col;c.fillText(f.txt,f.x,f.y-(48-f.t))});
 if(st.phase==='run'&&FINISH-st.dist<520){c.fillStyle='#ffd400';c.font='900 16px Impact,sans-serif';c.fillText("SAL'S AHEAD",W/2,36)}
 if(st.phase==='count'){c.fillStyle='#000a';c.fillRect(0,0,W,H);c.fillStyle='#ffd400';c.font='900 64px Impact,sans-serif';c.textAlign='center';c.fillText(String(Math.max(st.count,1)),W/2,H/2);c.fillStyle='#fff';c.font='bold 16px system-ui';c.fillText('Get ready',W/2,H/2+34)}}
function loop(){step();draw();raf=requestAnimationFrame(loop)}
function begin(){const over=$('#over');if(over)over.hidden=true;st=fresh();st.phase='count';$('#startcard').hidden=true;$('#retry').hidden=false;$('#quip').innerHTML='<b>Get ready.</b> Try the jump button.'}
function finish(){st.phase='done';const s=score(),{best,rec}=XC.best('fetch',s);$('#best').textContent=best;$('#score').textContent=s;
 $('#quip').innerHTML='<b>Sal:</b> “End bite\'s yours, Bear.”';
 XC.over({img:A+'bear_face.jpg',title:rec?'NEW BEST!':"SAL'S HOAGIES",stats:`Score ${s} · ${st.hoag} hoagies · Bucky honked ${st.honks}`+(rec?' · NEW BEST!':` · Best ${best}`),text:`Bear ran Mill Street, grabbed ${st.hoag} hoagies and scored ${s}. Bucky honked. Bear was fine.`,path:'fetch/',again:begin,againLabel:'Try again'})}
$('#best').textContent=XC.get('fetch')??'—';
resetIdle();
$('#go').onclick=begin;
$('#retry').onclick=begin;
$('#jump').addEventListener('pointerdown',e=>{e.preventDefault();jump()});
cv.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
addEventListener('keydown',e=>{
 if(e.code==='Enter'&&st.phase==='idle'){e.preventDefault();begin();return}
 if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW'){e.preventDefault();if(st.phase==='idle')begin();else jump()}
});
BEAR.onload=draw;
if(!loopOn){loopOn=true;loop()}
