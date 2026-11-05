const CAST=[["pete","Pete","Hold on, I had an idea for that."],["cap","Cap","Ooh, what does THIS button do?"],["pepper","Pepper","Acceptable. Barely."],["spanky","Spanky","I SAW that coming!"],["morgan","Morgan","Easy. Next."],["overmind","Overmind","As I calculated."],["krampus","Krampus","Flex for the pair! 💪"],["ivy","Ivy","Sketching this moment."],["aria","Aria","Some memories never fade."],["lumos","Lumos","A little light helps."],["bear","Bear","Woof! Good find! 🐾"],["bitboyjay","BitBoyJay","Pair secured. Bullish."],["dusty","Dusty","Thumbs up, legend! 👍"]];
const MODES={easy:[6,3],medium:[8,4],hard:[12,4],daily:[8,4]};
const $=s=>document.querySelector(s),board=$('#board');let st;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const today=()=>new Date().toISOString().slice(0,10);
function start(mode){mode=mode||st?.mode||'easy';const[n,cols]=MODES[mode];
 const r=mode==='daily'?rng([...today()].reduce((h,c)=>h*31+c.charCodeAt(0)|0,7)):Math.random;
 const pick=shuffle(CAST.slice(),r).slice(0,n);const deck=shuffle([...pick,...pick].map((c,i)=>({c,i})),r);
 st={mode,moves:0,found:0,n,open:[],lock:false,t0:0,timer:null};
 document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===mode));
 board.style.setProperty('--cols',cols);board.innerHTML='';$('#win').hidden=true;$('#quip').textContent=mode==='daily'?'Daily board · '+today():'Flip two cards. Find the pairs.';
 deck.forEach(({c})=>{const el=document.createElement('button');el.className='card';el.dataset.id=c[0];el.setAttribute('aria-label','card');
  el.innerHTML=`<div class="in"><div class="f back"><span>X</span><small>COMIX</small></div><div class="f front"><img src="${window.CARDS||"cards/"}${c[0]}.webp" alt="${c[1]}" loading="eager" decoding="async"><b>${c[1]}</b></div></div>`;
  el.addEventListener('click',()=>flip(el,c));board.appendChild(el)});hud();showBest()}
function hud(){$('#moves').textContent=st.moves;const s=st.t0?Math.floor((Date.now()-st.t0)/1000):0;$('#time').textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');return s}
function flip(el,c){if(st.lock||el.classList.contains('up'))return;
 if(!st.t0){st.t0=Date.now();st.timer=setInterval(hud,500)}
 el.classList.add('up');st.open.push([el,c]);if(st.open.length<2)return;
 st.moves++;const[[a,ca],[b,cb]]=st.open;st.open=[];
 if(ca[0]===cb[0]){a.classList.add('match');b.classList.add('match');st.found++;$('#quip').innerHTML=`<b>${ca[1]}:</b> “${ca[2]}”`;navigator.vibrate?.(30);if(st.found===st.n)setTimeout(win,500)}
 else{st.lock=true;setTimeout(()=>{a.classList.remove('up');b.classList.remove('up');st.lock=false},800)}hud()}
function key(){return'xcm-best-'+st.mode+(st.mode==='daily'?'-'+today():'')}
function showBest(){const b=JSON.parse(localStorage.getItem('xcm-best-'+st.mode+(st.mode==='daily'?'-'+today():''))||'null');$('#best').textContent=b?`${b.moves} moves · ${b.secs}s`:'—'}
function win(){clearInterval(st.timer);const secs=hud();let b=null;try{b=JSON.parse(localStorage.getItem(key()))}catch(e){}
 const rec=!b||st.moves<b.moves||(st.moves===b.moves&&secs<b.secs);if(rec)try{localStorage.setItem(key(),JSON.stringify({moves:st.moves,secs}))}catch(e){}
 const label=st.mode==='daily'?'Daily '+today():st.mode[0].toUpperCase()+st.mode.slice(1);
 const text=`I matched all ${st.n} X-COMIX pairs (${label}) in ${st.moves} moves and ${secs}s! 🃏 Can you beat me? #XCOMIX`;
 const url='https://petecastic.github.io/xcomix-memory/memory/';
 $('#share').href='https://x.com/intent/post?text='+encodeURIComponent(text)+(url?'&url='+encodeURIComponent(url):'');
 $('#stats').textContent=`${st.n} pairs · ${st.moves} moves · ${secs}s`+(rec?' · NEW BEST!':'');$('#win').hidden=false;showBest()}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));$('#again').onclick=()=>start();
start(document.body.dataset.start||'easy');
