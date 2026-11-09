const A='../arcade/art/',$=XC.$,ROUND=45;
const WHO={krampus:{img:'krampus_face',pts:1,tag:'KRAMPUS',say:['<b>Officer Tim:</b> “Got a suspicious moose on Mill Street.”','<b>Krampus:</b> “Okay ma\'am. For compliance.”','<b>Krampus:</b> “...wit\' mustard?”']},
 marjorie:{img:'marjorie_face',pts:0,tag:'NOT THE MOOSE',say:['<b>Marjorie:</b> “Goodness.” That\'s the clerk. No points lost.']},
 tabby:{img:'tabby_face',pts:0,tag:'NOT THE MOOSE',say:['<b>The Tabby:</b> “Hissss!” Wrong window. No points lost.']},
 zib:{img:'zib_wink',pts:5,tag:'ZIB +5',say:['<b>Zib:</b> “Hi again! ...You don\'t remember me, do you?” (+5)']}};
const g=$('#grid');let st,armT;
for(let i=0;i<9;i++){const h=document.createElement('button');h.className='hole';h.innerHTML='<div class="sash"></div><img alt=""><b class="tag"></b>';h.onpointerdown=e=>{e.preventDefault();hit(h)};g.appendChild(h)}
const holes=[...g.children];
function clearHoles(){holes.forEach(h=>{clearTimeout(h.tm);h.className='hole';h.who=null;const tag=h.querySelector('.tag');if(tag)tag.textContent=''})}
function arm(){$('#go').hidden=true;clearHoles();if(st){st.on=false;clearInterval(st.ti);clearTimeout(st.sp)}
 let n=3;$('#time').textContent=n;$('#quip').innerHTML='<b>Get ready.</b> Tap the moose. A miss costs nothing.';
 clearTimeout(armT);
 const tick=()=>{if(n>1){n--;$('#time').textContent=n;armT=setTimeout(tick,700)}else begin()};
 armT=setTimeout(tick,700)}
function begin(){clearHoles();st={score:0,t:ROUND,on:true};$('#score').textContent=0;$('#time').textContent=ROUND;
 $('#quip').innerHTML='Circuit 13 blinked. Tap <b>Krampus</b>. Marjorie and the Tabby are free misses. Zib is +5.';
 clearInterval(st.ti);st.ti=setInterval(()=>{st.t--;$('#time').textContent=st.t;if(st.t<=0)end()},1000);spawn()}
function spawn(){if(!st?.on)return;const free=holes.filter(h=>!h.who);const elapsed=ROUND-st.t;
 if(free.length){const h=free[Math.random()*free.length|0];const r=Math.random();
  const w=elapsed<12?(r<.84?'krampus':r<.93?'zib':'marjorie'):r<.6?'krampus':r<.78?'marjorie':r<.92?'tabby':'zib';
  h.who=w;h.querySelector('img').src=A+WHO[w].img+'.jpg';h.querySelector('.tag').textContent=WHO[w].tag;h.classList.add('up');
  const life=Math.max(1100,2050-elapsed*18);
  h.tm=setTimeout(()=>{h.classList.remove('up');h.who=null},life)}
 const gap=Math.max(640,1280-elapsed*12);
 st.sp=setTimeout(spawn,gap)}
function hit(h){if(!st?.on)return;if(!h.who){$('#quip').innerHTML='Empty window. Wait for a face.';return}
 const w=WHO[h.who];st.score+=w.pts;$('#score').textContent=st.score;
 $('#quip').innerHTML=w.say[Math.random()*w.say.length|0];h.classList.add(w.pts>0?'good':'miss');clearTimeout(h.tm);h.who=null;navigator.vibrate?.(w.pts>0?16:10);
 setTimeout(()=>h.className='hole',420)}
function end(){if(!st?.on)return;st.on=false;clearInterval(st.ti);clearTimeout(st.sp);clearHoles();const{best,rec}=XC.best('moose',st.score);$('#best').textContent=best;
 $('#go').hidden=false;$('#go').textContent='Try again';
 XC.over({img:A+'krampus.jpg',title:'SHIFT OVER',stats:`${st.score} points`+(rec?' · NEW BEST!':` · Best ${best}`)+`<br><small>“Antlered persons after dark? Unacceptable.” — Linda Pfister</small>`,
 text:`I wrote up ${st.score} suspicious moose sightings on Mill Street 🫎 Can you beat my report?`,path:'moose/',again:arm,againLabel:'Try again'})}
$('#best').textContent=XC.get('moose')??'—';$('#go').onclick=arm;
addEventListener('keydown',e=>{const n=+e.key;if(n>=1&&n<=9){e.preventDefault();hit(holes[n-1])}});
