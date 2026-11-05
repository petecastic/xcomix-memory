const A='../arcade/art/',$=XC.$,cv=$('#cv'),c=cv.getContext('2d'),W=400,H=300,GY=250;
const img=n=>{const i=new Image();i.src=A+n+'.jpg';return i},BEAR=img('bear_run'),GOOSE=img('bucky'),HONK=img('bucky_honk');
let st,raf;
function reset(){st={y:0,vy:0,obs:[],t:0,sp:4,dist:0,hoag:0,on:true,next:60,bx:0};$('#quip').innerHTML='Tap to jump Bucky. Grab Sal\'s hoagies. <b>Bear</b> follows the food.'}
function jump(){if(!st?.on)return;if(st.y===0){st.vy=11.5;navigator.vibrate?.(10)}}
cv.addEventListener('pointerdown',e=>{e.preventDefault();jump()});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();jump()}});
function spawn(){const r=Math.random();if(r<.55)st.obs.push({k:'goose',x:W+20,y:0,w:46,h:52});
 else st.obs.push({k:'hoagie',x:W+20,y:r<.8?0:70+Math.random()*40,w:34,h:22});
 st.next=Math.max(38,90-st.sp*5)+Math.random()*50}
function step(){st.t++;st.sp=4+st.t/600;st.dist+=st.sp;st.bx=(st.bx+st.sp*.3)%200;
 st.vy-=.6;st.y=Math.max(0,st.y+st.vy);if(st.y===0)st.vy=0;
 if(--st.next<=0)spawn();
 const bx=60,by=GY-st.y,bw=56,bh=52;
 st.obs.forEach(o=>{o.x-=st.sp;const oy=GY-o.y;if(!o.dead&&o.x<bx+bw-12&&o.x+o.w>bx+10&&oy-o.h<by-8&&oy>by-bh+10){
  if(o.k==='hoagie'){o.dead=1;st.hoag++;$('#quip').innerHTML=['<b>Sal:</b> “Hoagie\'s on me.”','<b>Bear:</b> *huff-huff-huff* (tail thumping)','<b>Peter:</b> “Bear, no. That\'s a lineman\'s sandwich.”'][st.hoag%3];navigator.vibrate?.(15)}
  else{o.hit=1;st.on=false}}});
 st.obs=st.obs.filter(o=>o.x>-60&&!(o.dead));$('#score').textContent=score()}
const score=()=>Math.floor(st.dist/40)+st.hoag*10;
function draw(){c.fillStyle='#120c24';c.fillRect(0,0,W,H);
 // mill clock tower
 const tx=300-(st.bx*.5);c.fillStyle='#2a2140';c.fillRect(tx,60,46,190);c.fillStyle='#f5e6b8';c.beginPath();c.arc(tx+23,95,16,0,7);c.fill();c.fillStyle='#000';c.font='bold 9px system-ui';c.textAlign='center';c.fillText('12:49',tx+23,98);
 for(let i=0;i<5;i++){const x=((i*110-st.bx*1.1)%550+550)%550-60;c.fillStyle='#22183a';c.fillRect(x,150,90,100);c.fillStyle='#ffcf66';c.fillRect(x+12,170,18,16);c.fillRect(x+55,170,18,16);if(i===2){c.fillStyle='#e33';c.fillRect(x+5,152,80,14);c.fillStyle='#fff';c.font='bold 10px system-ui';c.fillText("SAL'S HOAGIES",x+45,163)}}
 c.fillStyle='#333';c.fillRect(0,GY,W,H-GY);c.fillStyle='#ffd400';for(let x=-(st.dist%40);x<W;x+=40)c.fillRect(x,GY+22,20,3);
 c.fillStyle='#bbb';c.font='bold 11px system-ui';c.textAlign='left';c.fillText('MILL STREET · BRISTOL',8,16);
 st.obs.forEach(o=>{const oy=GY-o.y;if(o.k==='hoagie'){c.font='26px serif';c.fillText('🥪',o.x,oy-2)}else{c.drawImage(o.hit?HONK:GOOSE,o.x,oy-o.h,o.w,o.h)}});
 c.drawImage(BEAR,60,GY-st.y-52,56,52)}
function loop(){step();draw();if(st.on)raf=requestAnimationFrame(loop);else end()}
function start(){cancelAnimationFrame(raf);reset();loop()}
function end(){const s=score(),{best,rec}=XC.best('fetch',s);$('#best').textContent=best;$('#quip').innerHTML='<b>Bucky:</b> HONK.';
 XC.over({img:A+'bear_pant.jpg',title:'HONKED!',stats:`Score ${s} · ${st.hoag} hoagies`+(rec?' · NEW BEST!':` · Best ${best}`),text:`Bear ran Mill Street, grabbed ${st.hoag} hoagies and scored ${s} before Bucky the Goose got him 🐕🥪`,path:'fetch/',again:start})}
$('#best').textContent=XC.get('fetch')??'—';reset();BEAR.onload=draw;$('#go').onclick=()=>{$('#go').hidden=true;start()};
