const A='../arcade/art/',$=XC.$,POOL=LINES.filter(l=>l[0]!=='bear'),WHO=[...new Map(POOL.map(l=>[l[0],l[1]])).entries()];
let st;
function start(mode){mode=mode||st?.mode||'daily';const r=mode==='daily'?XC.rng('said'+XC.today()):Math.random;
 st={mode,qs:XC.shuffle(POOL.slice(),r).slice(0,10),i:0,right:0,r};document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('on',b.dataset.mode===mode));ask()}
function ask(){const q=st.qs[st.i];$('#n').textContent=(st.i+1)+'/10';$('#right').textContent=st.right;
 $('#line').textContent='“'+q[2]+'”';$('#reveal').innerHTML='<div class="mystery">?</div>';
 const opts=XC.shuffle([q,...XC.shuffle(WHO.filter(w=>w[0]!==q[0]),st.r).slice(0,3).map(w=>[w[0],w[1]])],st.r);
 $('#opts').innerHTML='';opts.forEach(o=>{const b=document.createElement('button');b.textContent=o[1];b.onclick=()=>pick(b,o,q);$('#opts').appendChild(b)})}
function pick(b,o,q){if($('#opts').dataset.lock==='1')return;$('#opts').dataset.lock='1';const ok=o[0]===q[0];if(ok)st.right++;
 [...$('#opts').children].forEach(x=>{if(x.textContent===q[1])x.classList.add('ok');else if(x===b)x.classList.add('no')});
 $('#reveal').innerHTML=`<img src="${A}card_${q[0]}.jpg" alt="${q[1]}"><b>${ok?'✅ Right!':'❌ Nope'} That was ${q[1]}.</b>`;$('#right').textContent=st.right;navigator.vibrate?.(ok?20:[40,30,40]);
 setTimeout(()=>{$('#opts').dataset.lock='0';if(++st.i<10)ask();else end()},1700)}
function end(){let streak='';if(st.mode==='daily'){const s=XC.get('said-streak')||{d:'',n:0},y=new Date(Date.now()-864e5),yd=y.getFullYear()+'-'+String(y.getMonth()+1).padStart(2,'0')+'-'+String(y.getDate()).padStart(2,'0');
  if(s.d!==XC.today()){s.n=s.d===yd?s.n+1:1;s.d=XC.today();XC.set('said-streak',s)}streak=` · 🔥 ${s.n}-day streak`}
 const{best,rec}=XC.best('said',st.right);$('#best').textContent=best+'/10';
 XC.over({title:st.right>=8?'VALLEY LEGEND':st.right>=5?'NIGHT SHIFT':'DAYTIME PERSON',stats:`${st.right}/10 right`+streak+(rec?' · NEW BEST!':''),
 text:`I got ${st.right}/10 on today's X-COMIX "Who Said It?" from the 3 AM Valley 🗯️${streak.replace(' · ',' ')}`,path:'said/',again:()=>start()})}
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>start(b.dataset.mode));$('#best').textContent=(XC.get('said')??'—')+(XC.get('said')!=null?'/10':'');start('daily');
