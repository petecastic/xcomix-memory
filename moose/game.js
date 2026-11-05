const A='../arcade/art/',$=XC.$;
const WHO={krampus:{img:'krampus_face',pts:1,say:['<b>Officer Tim:</b> “Got a suspicious moose on Mill Street.”','<b>Krampus:</b> “Okay ma\'am. For compliance.”','<b>Krampus:</b> “...wit\' mustard?”']},
 marjorie:{img:'marjorie_face',pts:-2,say:['<b>Marjorie:</b> “Goodness.” (That\'s not a moose. −2)']},
 tabby:{img:'tabby_face',pts:-2,say:['<b>The Tabby:</b> “Hissss! That chain is my jurisdiction, lady.” (−2)']},
 zib:{img:'zib_wink',pts:5,say:['<b>Zib:</b> “Hi again! ...You don\'t remember me, do you?” (+5)']}};
const g=$('#grid');let st;
for(let i=0;i<9;i++){const h=document.createElement('button');h.className='hole';h.innerHTML='<div class="sash"></div><img alt="">';h.onpointerdown=e=>{e.preventDefault();hit(h)};g.appendChild(h)}
const holes=[...g.children];
function start(){st={score:0,t:30,on:true};$('#score').textContent=0;$('#quip').innerHTML='Circuit 13 blinked. Tap the <b>moose</b>, not the ladies. Zib is +5.';
 holes.forEach(h=>{h.className='hole';h.who=null});clearInterval(st.ti);st.ti=setInterval(()=>{st.t--;$('#time').textContent=st.t;if(st.t<=0)end()},1000);$('#time').textContent=30;spawn()}
function spawn(){if(!st.on)return;const free=holes.filter(h=>!h.who);if(free.length){const h=free[Math.random()*free.length|0];const r=Math.random();
 const w=r<.66?'krampus':r<.81?'marjorie':r<.95?'tabby':'zib';h.who=w;h.querySelector('img').src=A+WHO[w].img+'.jpg';h.classList.add('up');
 const life=Math.max(520,1150-(30-st.t)*20);h.tm=setTimeout(()=>{h.classList.remove('up');h.who=null},life)}
 setTimeout(spawn,Math.max(330,750-(30-st.t)*14))}
function hit(h){if(!st?.on||!h.who)return;const w=WHO[h.who];st.score=Math.max(0,st.score+w.pts);$('#score').textContent=st.score;
 $('#quip').innerHTML=w.say[Math.random()*w.say.length|0];h.classList.add(w.pts>0?'good':'bad');clearTimeout(h.tm);h.who=null;navigator.vibrate?.(w.pts>0?20:[40,30,40]);
 setTimeout(()=>h.className='hole',220)}
function end(){st.on=false;clearInterval(st.ti);holes.forEach(h=>{h.className='hole';h.who=null});const{best,rec}=XC.best('moose',st.score);$('#best').textContent=best;
 XC.over({img:A+'krampus.jpg',title:'SHIFT OVER',stats:`${st.score} moose sightings written up`+(rec?' · NEW BEST!':` · Best ${best}`)+`<br><small>“Antlered persons after dark? Unacceptable.” — Linda Pfister</small>`,
 text:`I wrote up ${st.score} suspicious moose sightings on Mill Street in 30 seconds 🫎 Can you beat my report?`,path:'moose/',again:start})}
$('#best').textContent=XC.get('moose')??'—';$('#go').onclick=()=>{$('#go').hidden=true;start()};
