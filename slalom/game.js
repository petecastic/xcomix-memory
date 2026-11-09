const cv=XC.$('#cv'),c=cv.getContext('2d'),W=360,H=480,stage=XC.$('#stage'),GATES=25;
const SK={peter:'peter_face',bear:'bear_face',zib:'zib_face',krampus:'krampus_face'};const im={};
for(const k of[...Object.values(SK),'bucky'])(im[k]=new Image()).src='../arcade/art/'+k+'.jpg';
let who=XC.get('slalom-who')||'peter',x,y,vx,spd,objs,gates,gi,t0,time,pen,phase='title',stun=0,steer=0,tilt=null,keys={},hold=0,fx=[];
let count=3,countAcc=0;
function build(){x=W/2;y=0;vx=0;spd=2.05;stun=0;pen=0;gi=0;time=0;objs=[];gates=[];fx=[];const r=Math.random;
 for(let i=0;i<GATES;i++){const gy=720+i*(i<6?330:275),gx=96+r()*(W-192),w=i<6?142:Math.max(86,126-i*1.5);
  gates.push({y:gy,x:gx,w,hit:null,red:i%2,practice:i<5})}
 const end=720+GATES*300;
 for(let yy=1280;yy<end;yy+=44){if(r()<.62){const ox=r()*W;if(gates.some(g=>Math.abs(g.y-yy)<48&&ox>g.x-g.w/2-24&&ox<g.x+g.w/2+24))continue;objs.push({x:ox,y:yy,t:r()<.7?'tree':'rock'})}}
 for(let i=0;i<6;i++)objs.push({x:-20,y:2100+i*980+r()*280,t:'goose',dir:1});
 gates.push({y:end,x:W/2,w:W,finish:1})}
function crash(m){if(stun>0)return;stun=50;spd=Math.min(spd,1.4);XC.sfx(120,.3,'sawtooth');fx.push({x,y,txt:m,t:50})}
function step(){
 steer=keys.ArrowLeft?-1:keys.ArrowRight?1:hold?hold:tilt!=null?Math.max(-1,Math.min(1,tilt/18)):0;
 if(phase==='count'){
  x=Math.max(18,Math.min(W-18,x+steer*3.1));
  if(++countAcc>=52){countAcc=0;count--;if(count<=0){phase='run';t0=performance.now()}}
  XC.$('#t').textContent='0.0';XC.$('#g').textContent='0/'+GATES;XC.$('#m').textContent='0m';
  return}
 if(stun>0)stun--;else{vx+=(steer*(y<1500?3.2:4.2)-vx)*.15;const opening=y<1500;spd=Math.min(opening?3.55:7.4,spd+(opening?.0032:.0065)+(1-Math.abs(steer))*(opening?.0015:.005))}
 x=Math.max(10,Math.min(W-10,x+vx));y+=spd*(1-Math.abs(vx)/10);time=(performance.now()-t0)/1000;
 for(const o of objs){if(o.t==='goose'){o.x+=1.15*o.dir;if(o.x>W+20)o.dir=-1;if(o.x<-20)o.dir=1}
  if(!o.gone&&Math.abs(o.y-y)<14&&Math.abs(o.x-x)<(o.t==='goose'?18:12)){crash(o.t==='goose'?'HONK!':'OOF!');if(o.t==='goose')o.gone=1}}
 const g=gates[gi];if(g&&y>=g.y){if(g.finish)return finish();const ok=Math.abs(x-g.x)<g.w/2;g.hit=ok;
  if(!ok){if(g.practice){fx.push({x,y,txt:'PRACTICE',t:50});XC.sfx(440,.08)}else{pen+=5;fx.push({x,y,txt:'+5s',t:50});XC.sfx(200,.15)}}
  else XC.sfx(880,.06);gi++}
 XC.$('#t').textContent=(time+pen).toFixed(1);XC.$('#g').textContent=gi+'/'+GATES;XC.$('#m').textContent=Math.floor(y/10)+'m'}
function finish(){phase='done';const tot=+(time+pen).toFixed(1);const b=XC.best('slalom-best',tot,true);XC.sfx(1320,.4,'triangle');
 const miss=gates.filter(g=>g.hit===false&&!g.practice).length;
 XC.over({img:'../arcade/art/'+SK[who]+'.jpg',title:b.rec?'COURSE RECORD!':'FINISH!',stats:`Time <b>${tot}s</b> (${miss} missed gates, +${pen}s)<br>Best ${b.best}s`,text:`I skied the X-COMIX Downhill Slalom as ${who[0].toUpperCase()+who.slice(1)} in ${tot}s. Dodge Bucky the Goose and beat it.`,path:'slalom/',again:begin,againLabel:'Try again'})}
function flag(x,y,col){c.fillStyle='#333';c.fillRect(x-1,y-22,3,24);c.fillStyle=col;c.beginPath();c.moveTo(x+2,y-22);c.lineTo(x+16,y-16);c.lineTo(x+2,y-10);c.fill()}
function draw(){c.fillStyle='#f4f9ff';c.fillRect(0,0,W,H);const cam=y-130;
 c.strokeStyle='#dde8f5';for(let i=0;i<20;i++){const yy=((i*53-cam)%H+H)%H;c.beginPath();c.moveTo((i*97)%W,yy);c.lineTo((i*97)%W+20,yy+6);c.stroke()}
 for(const g of gates){const sy=g.y-cam;if(sy<-30||sy>H+30)continue;if(g.finish){c.fillStyle='#000';for(let i=0;i<W;i+=20){c.fillRect(i,sy+((i/20)%2)*8,10,8)}c.font='bold 20px Impact';c.textAlign='center';c.fillText('FINISH · SAL\'S HOAGIES',W/2,sy-10);continue}
  const col=g.hit===false?'#999':g.practice?'#1fae1f':g.red?'#e8262f':'#1f5cff';flag(g.x-g.w/2,sy,col);flag(g.x+g.w/2,sy,col)}
 for(const o of objs){const sy=o.y-cam;if(sy<-40||sy>H+40||o.gone)continue;
  if(o.t==='tree'){c.fillStyle='#1d6b34';c.beginPath();c.moveTo(o.x,sy-30);c.lineTo(o.x-13,sy);c.lineTo(o.x+13,sy);c.fill();c.fillStyle='#6b3d1d';c.fillRect(o.x-2,sy,4,6)}
  else if(o.t==='rock'){c.fillStyle='#8a8f99';c.beginPath();c.ellipse(o.x,sy,11,7,0,0,7);c.fill()}
  else{c.save();c.beginPath();c.arc(o.x,sy-6,15,0,7);c.clip();c.drawImage(im.bucky,o.x-15,sy-21,30,30);c.restore();c.strokeStyle='#000';c.lineWidth=2;c.beginPath();c.arc(o.x,sy-6,15,0,7);c.stroke()}}
 const sy=y-cam,a=stun>0?Math.sin(stun)*1.2:vx/9;c.save();c.translate(x,sy);
 c.strokeStyle='#ff2e63';c.lineWidth=4;c.save();c.rotate(a);c.beginPath();c.moveTo(-7,-2);c.lineTo(-7,16);c.moveTo(7,-2);c.lineTo(7,16);c.stroke();c.restore();
 c.fillStyle='#2ee6ff';c.fillRect(-8,-14,16,14);c.beginPath();c.arc(0,-24,12,0,7);c.save();c.clip();c.drawImage(im[SK[who]],-12,-36,24,24);c.restore();c.strokeStyle='#000';c.lineWidth=2;c.beginPath();c.arc(0,-24,12,0,7);c.stroke();c.restore();
 c.font='bold 18px Impact';c.textAlign='center';for(const f of fx){c.fillStyle=f.txt==='PRACTICE'?'#1fae1f':'#ff2e63';c.fillText(f.txt,f.x,f.y-cam-40-(50-f.t)/2);f.t--}fx=fx.filter(f=>f.t>0);
 if(phase==='count'){c.fillStyle='#14102acc';c.fillRect(0,0,W,62);c.fillStyle='#ffd400';c.font='900 34px Impact,sans-serif';c.textAlign='center';c.fillText(count>0?String(count):'SKI',W/2,38);c.fillStyle='#fff';c.font='bold 13px system-ui';c.fillText('Get ready. Line up.',W/2,56)}}
var acc=0,lt=0;function loop(t){if(!lt)lt=t;acc+=Math.min(100,t-lt);lt=t;var n=0;while(acc>=16.67&&n<6){if(phase==='count'||phase==='run')step();acc-=16.67;n++}try{if(gates)draw()}catch(e){}requestAnimationFrame(loop)}
function begin(){const over=document.getElementById('over');if(over)over.hidden=true;build();phase='count';count=3;countAcc=0;try{DeviceOrientationEvent.requestPermission&&DeviceOrientationEvent.requestPermission().catch(()=>0)}catch(e){}}
cv.style.touchAction='none';cv.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
if(!window.PointerEvent){cv.addEventListener('touchstart',e=>{e.preventDefault();const r=cv.getBoundingClientRect();hold=e.touches[0].clientX-r.left<r.width/2?-1:1},{passive:false});cv.addEventListener('touchend',()=>hold=0)}
cv.addEventListener('pointerdown',e=>{e.preventDefault();const r=cv.getBoundingClientRect();hold=e.clientX-r.left<r.width/2?-1:1});addEventListener('pointerup',()=>hold=0);addEventListener('pointercancel',()=>hold=0);
cv.addEventListener('pointermove',e=>{if(e.buttons){const r=cv.getBoundingClientRect();hold=e.clientX-r.left<r.width/2?-1:1}});
addEventListener('keydown',e=>{keys[e.key]=1;if(String(e.key).indexOf('Arrow')===0||e.code==='Space')e.preventDefault()});addEventListener('keyup',e=>keys[e.key]=0);
addEventListener('deviceorientation',e=>{if(e.gamma!=null&&matchMedia('(pointer:coarse)').matches)tilt=e.gamma});
const bar=document.createElement('div');bar.className='steer';bar.innerHTML='<button type="button" id="stL">◀ LEFT</button><button type="button" id="stR">RIGHT ▶</button>';document.body.appendChild(bar);
function holdBtn(el,dir){const on=e=>{e.preventDefault();e.stopPropagation();hold=dir};const off=()=>{if(hold===dir)hold=0};
 el.addEventListener('pointerdown',on);el.addEventListener('pointerup',off);el.addEventListener('pointercancel',off);el.addEventListener('lostpointercapture',off)}
holdBtn(bar.querySelector('#stL'),-1);holdBtn(bar.querySelector('#stR'),1);
XC.muteBtn();build();phase='title';requestAnimationFrame(loop);
const pk=Object.keys(SK).map(k=>`<button type="button" data-k="${k}" class="${k===who?'on':''}"><img src="../arcade/art/${SK[k]}.jpg" alt="${k}"></button>`).join('');
const T=XC.title(stage,{name:'DOWNHILL SLALOM',img:'../arcade/art/bucky.jpg',how:'Pick a skier, then press Start run. You get a countdown, then an easy opening. Hold the left or right button, the snow, or the arrow keys to carve. The first gates are practice. After that a miss is +5s.',best:XC.get('slalom-best')!=null?XC.get('slalom-best')+'s':null,extra:'<div class="pick">'+pk+'</div>',armLabel:'START RUN',start:begin});
T.addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(b){who=b.dataset.k;XC.set('slalom-who',who);T.querySelectorAll('.pick button').forEach(q=>q.classList.toggle('on',q===b))}},true);
