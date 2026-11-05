const cv=XC.$('#cv'),c=cv.getContext('2d'),W=360,H=480,stage=XC.$('#stage');
const LV=[{name:'MILL STREET',map:['..AA....BB....','.AAAA..BBBB..','.AWAW..BWBW..','CAAAAACBBBBBDD','CAWAWACBWBWBDD','CAAAAACBBBBBDD','CAADAACBBDBBDD'],pal:{A:'#c0533a',B:'#8a5a3c',C:'#5b6ea8',D:'#3d8a5a',W:'#ffd45a'}},
{name:'BEAR',img:'bear_face'},{name:'ZIB',img:'zib_face'},{name:'OVERMIND',img:'overmind_head'},{name:'BOSS: KRAMPUS',img:'krampus_face'}];
let st,bricks,balls,pad,pw,drops,lv,lives,score,run=false,keys={},px=null,last=0,slowT=0,wideT=0;
const imgs={};LV.forEach(l=>{if(l.img){const i=new Image();i.src='../arcade/art/'+l.img+'.jpg';imgs[l.img]=i}});
function build(){const L=LV[lv%LV.length],cols=14,bw=W/cols,bh=14;bricks=[];
 if(L.map){L.map.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch!=='.')bricks.push({x:x*bw,y:50+y*bh,w:bw-1,h:bh-1,col:L.pal[ch],hp:ch==='W'?2:1})}))}
 else{const cols=24,rows=20,bw=W/cols,bh=10,o=document.createElement('canvas');o.width=cols;o.height=rows;const oc=o.getContext('2d');oc.drawImage(imgs[L.img],0,0,cols,rows);const d=oc.getImageData(0,0,cols,rows).data;
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const i=(y*cols+x)*4;if(d[i]+d[i+1]+d[i+2]>720)continue;bricks.push({x:x*bw,y:36+y*bh,w:bw-1,h:bh-1,col:`rgb(${d[i]},${d[i+1]},${d[i+2]})`,hp:L.hp||1})}}
 serve()}
function serve(){pw=70;wideT=slowT=0;pad=W/2;balls=[{x:W/2,y:H-60,vx:2.2,vy:-4.2-lv*.25,stuck:true}];drops=[]}
function start(){lv=0;lives=3;score=0;build();run=true;hud()}
function hud(){XC.$('#sc').textContent=score;XC.$('#lv').textContent=(lv+1)+' '+LV[lv%LV.length].name;XC.$('#li').textContent='♥'.repeat(Math.max(0,lives));XC.$('#hi').textContent=XC.get('bricks-best')??'—'}
function step(){
 const sp=slowT>0?.6:1;if(keys.ArrowLeft)pad-=7;if(keys.ArrowRight)pad+=7;if(px!=null)pad+=(px-pad)*.5;const hw=(wideT>0?pw*1.6:pw)/2;pad=Math.max(hw,Math.min(W-hw,pad));
 slowT--;wideT--;
 for(const b of balls){if(b.stuck){b.x=pad;b.y=H-38;continue}
  b.x+=b.vx*sp;b.y+=b.vy*sp;if(b.x<5||b.x>W-5){b.vx*=-1;b.x=Math.max(5,Math.min(W-5,b.x));XC.sfx(300,.03)}if(b.y<5){b.vy=Math.abs(b.vy);XC.sfx(300,.03)}
  if(b.vy>0&&b.y>H-36&&b.y<H-24&&Math.abs(b.x-pad)<hw+5){const t=(b.x-pad)/hw,s=Math.hypot(b.vx,b.vy);b.vx=s*Math.sin(t*1.05);b.vy=-s*Math.cos(t*1.05);XC.sfx(520,.04)}
  for(const k of bricks){if(k.hp>0&&b.x>k.x-4&&b.x<k.x+k.w+4&&b.y>k.y-4&&b.y<k.y+k.h+4){const ox=Math.min(b.x-k.x+4,k.x+k.w+4-b.x),oy=Math.min(b.y-k.y+4,k.y+k.h+4-b.y);if(ox<oy)b.vx*=-1;else b.vy*=-1;
   k.hp--;score+=10;XC.sfx(700+Math.random()*300,.04);if(k.hp<=0&&Math.random()<.12)drops.push({x:k.x+k.w/2,y:k.y,t:'WMS'[Math.floor(Math.random()*3)]});break}}}
 balls=balls.filter(b=>b.y<H+10);
 if(!balls.length){lives--;XC.sfx(110,.4,'sawtooth');hud();if(lives<=0)return end(false);serve()}
 for(const d of drops){d.y+=2.2;if(d.y>H-36&&d.y<H-20&&Math.abs(d.x-pad)<hw+8){d.y=H+50;score+=50;XC.sfx(1200,.15,'triangle');
  if(d.t==='W')wideT=600;if(d.t==='S')slowT=500;if(d.t==='M'){const b=balls.find(q=>!q.stuck)||balls[0];for(const a of[-.5,.5])balls.push({x:b.x,y:b.y,vx:b.vx*Math.cos(a)-b.vy*Math.sin(a),vy:b.vx*Math.sin(a)+b.vy*Math.cos(a)})}}}
 drops=drops.filter(d=>d.y<H);
 if(!bricks.some(k=>k.hp>0)){score+=500;lv++;XC.sfx(990,.3,'triangle');build()}
 hud()}
function draw(){c.fillStyle='#0b0820';c.fillRect(0,0,W,H);c.fillStyle='#ffffff10';for(let i=0;i<H;i+=4)c.fillRect(0,i,W,1);
 for(const k of bricks)if(k.hp>0){c.fillStyle=k.col;c.fillRect(k.x,k.y,k.w,k.h);c.fillStyle=k.hp>1?'#fff8':'#fff3';c.fillRect(k.x,k.y,k.w,3)}
 const hw=(wideT>0?pw*1.6:pw)/2;c.fillStyle=wideT>0?'#2ee6ff':'#ffd400';c.fillRect(pad-hw,H-30,hw*2,10);c.fillStyle='#000';c.fillRect(pad-hw,H-22,hw*2,2);
 c.fillStyle='#fff';for(const b of balls){c.fillRect(b.x-4,b.y-4,8,8)}
 c.font='bold 12px monospace';c.textAlign='center';for(const d of drops){c.fillStyle={W:'#2ee6ff',M:'#ff2e63',S:'#7dff5a'}[d.t];c.fillRect(d.x-12,d.y-7,24,14);c.fillStyle='#000';c.fillText(d.t,d.x,d.y+4)}
 if(balls.some(b=>b.stuck)){c.fillStyle='#fff';c.fillText('TAP TO LAUNCH',W/2,H/2+60)}}
function loop(t){if(run){step();}draw();requestAnimationFrame(loop)}
function launch(){for(const b of balls)b.stuck=false}
function end(){run=false;const b=XC.best('bricks-best',score);hud();
 XC.over({img:'../arcade/art/krampus_face.jpg',title:b.rec?'NEW HI-SCORE!':'GAME OVER',stats:`Score <b>${score}</b> · Reached level ${lv+1}: ${LV[lv%LV.length].name}<br>Best ${b.best}`,text:`I scored ${score} in X-COMIX Brick Breaker and made it to ${LV[lv%LV.length].name}. Beat me.`,path:'bricks/',again:start})}
const pos=e=>{const r=cv.getBoundingClientRect();return (e.clientX-r.left)/r.width*W};
cv.addEventListener('pointerdown',e=>{px=pos(e);launch()});cv.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons)px=pos(e)});cv.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')px=null});
addEventListener('keydown',e=>{keys[e.key]=1;if(e.key===' '){launch();e.preventDefault()}if(e.key.startsWith('Arrow'))px=null});addEventListener('keyup',e=>keys[e.key]=0);
XC.muteBtn();lv=0;lives=3;score=0;hud();
Promise.all(Object.values(imgs).map(i=>i.decode().catch(()=>0))).then(()=>{build();requestAnimationFrame(loop);
 XC.title(stage,{name:'BRICK BREAKER',img:'../arcade/art/krampus_face.jpg',how:'Smash Mill Street, Bear, Zib and Overmind, then the Krampus boss wall. Drag to move. Power-ups: W wide · M multi-ball · S slow.',best:XC.get('bricks-best'),start})});
