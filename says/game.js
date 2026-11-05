const A='../arcade/art/',$=XC.$,PADS=[['peter','peter_face','Peter'],['krampus','krampus_face','Krampus'],['bear','bear_face','Bear'],['zib','zib_face','Zib']];
const g=$('#pads');let st;const tones=[262,330,392,523];let ac;
function beep(i){try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),v=ac.createGain();o.frequency.value=tones[i];o.type='square';v.gain.value=.05;o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+.18)}catch(e){}}
PADS.forEach((p,i)=>{const d=document.createElement('button');d.className='pad';d.innerHTML=`<img src="${A}${p[1]}.jpg" alt="${p[2]}"><b>${p[2]}</b>`;d.onpointerdown=e=>{e.preventDefault();press(i)};g.appendChild(d)});
const pads=[...g.children];
function flash(i,ms=380){pads[i].classList.add('lit');beep(i);setTimeout(()=>pads[i].classList.remove('lit'),ms)}
function start(){st={seq:[],pos:0,busy:true};$('#round').textContent=0;say('“Good morning, data points. Daily Harmony Scores are live.”');setTimeout(next,900)}
function say(t){$('#quip').innerHTML='<b>Overmind:</b> '+t}
function next(){st.seq.push(Math.random()*4|0);st.pos=0;st.busy=true;$('#round').textContent=st.seq.length;$('#score').textContent=(st.seq.length-1)*10+'%';
 const sp=Math.max(260,620-st.seq.length*25);say('Watch. Repeat. Comply.');st.seq.forEach((v,k)=>setTimeout(()=>flash(v,sp*.7),400+k*sp));setTimeout(()=>{st.busy=false;say('Your turn, data point.')},400+st.seq.length*sp)}
function press(i){if(!st||st.busy)return;flash(i,200);if(i!==st.seq[st.pos]){return end()}if(++st.pos===st.seq.length){st.busy=true;say(['Acceptable.','Harmony rising.','Hm. Adequate.'][st.seq.length%3]);setTimeout(next,700)}}
function end(){st.busy=true;const r=st.seq.length-1,{best,rec}=XC.best('says',r);$('#best').textContent=best;say('“Unregistered lifeform detected. Reporting to the Director.”');navigator.vibrate?.([60,40,60]);
 XC.over({img:A+'overmind_head.jpg',title:'NON-COMPLIANT',stats:`You repeated ${r} in a row · Harmony Score ${r*10}%`+(rec?' · NEW BEST!':` · Best ${best}`)+'<br><small>Overmind: “...best friend?”</small>',
 text:`Overmind gave me a Harmony Score of ${r*10}% (${r} in a row) 🍞🤖`,path:'says/',again:start})}
$('#best').textContent=XC.get('says')??'—';$('#go').onclick=()=>{$('#go').hidden=true;start()};
