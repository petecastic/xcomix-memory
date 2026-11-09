const A='../arcade/art/',$=XC.$,PADS=[['peter','peter_face','Peter'],['krampus','krampus_face','Krampus'],['bear','bear_face','Bear'],['zib','zib_face','Zib']];
const g=$('#pads');let st;const tones=[262,330,392,523];let ac;
const KEYS={Digit1:0,Digit2:1,Digit3:2,Digit4:3,Numpad1:0,Numpad2:1,Numpad3:2,Numpad4:3,KeyQ:0,KeyW:1,KeyA:2,KeyS:3};
function beep(i,ok){if(XC.muted&&ok===false)return;try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();const o=ac.createOscillator(),v=ac.createGain();o.frequency.value=ok===false?110:tones[i];o.type='square';v.gain.value=ok===false?.03:.05;o.connect(v).connect(ac.destination);o.start();o.stop(ac.currentTime+(ok===false?.08:.18))}catch(e){}}
PADS.forEach((p,i)=>{const d=document.createElement('button');d.type='button';d.className='pad';d.innerHTML=`<img src="${A}${p[1]}.jpg" alt="${p[2]}"><b>${p[2]}</b>`;d.onpointerdown=e=>{e.preventDefault();press(i)};g.appendChild(d)});
const pads=[...g.children];
function flash(i,ms=420){pads[i].classList.add('lit');beep(i);setTimeout(()=>pads[i].classList.remove('lit'),ms)}
function say(t){$('#quip').innerHTML='<b>Overmind:</b> '+t}
function start(){const gen=(st?.gen||0)+1;st={seq:[],pos:0,phase:'ready',gen};$('#replay').hidden=true;$('#go').hidden=true;$('#round').textContent='0';$('#score').textContent='0%';
 let n=3;const tick=()=>{if(!st||st.gen!==gen)return;if(n>0){say('Get ready. '+n);$('#round').textContent=n;n--;setTimeout(tick,700)}else next()};tick()}
function next(){st.seq.push(Math.random()*4|0);st.pos=0;$('#round').textContent=st.seq.length;$('#score').textContent=(st.seq.length-1)*10+'%';showSeq()}
function showSeq(){const gen=st.gen;st.phase='watch';st.pos=0;$('#replay').hidden=true;const sp=Math.max(380,780-st.seq.length*20);say('Watch.');
 st.seq.forEach((v,k)=>setTimeout(()=>{if(st&&st.gen===gen)flash(v,Math.max(240,sp*.7))},420+k*sp));
 setTimeout(()=>{if(!st||st.gen!==gen)return;st.phase='input';st.pos=0;$('#replay').hidden=false;say('Your turn. Replay the sequence if you need it.')},420+st.seq.length*sp+240)}
function press(i){if(!st){say('Press Begin evaluation when you are ready.');pads[i].classList.add('nope');setTimeout(()=>pads[i].classList.remove('nope'),320);return}if(st.phase==='done')return;
 if(st.phase!=='input'){pads[i].classList.add('nope');beep(i,false);say('Watch first. Your turn comes next.');setTimeout(()=>pads[i].classList.remove('nope'),320);return}
 flash(i,200);if(i!==st.seq[st.pos]){pads[i].classList.add('bad');return end()}
 if(++st.pos===st.seq.length){st.phase='watch';$('#replay').hidden=true;say(['Acceptable.','Harmony rising.','Hm. Adequate.'][st.seq.length%3]);setTimeout(next,700)}}
function end(){st.phase='done';$('#replay').hidden=true;const r=st.seq.length-1,{best,rec}=XC.best('says',r);$('#best').textContent=best;say('“Unregistered lifeform detected. Reporting to the Director.”');navigator.vibrate?.([40,30,40]);
 $('#go').hidden=false;$('#go').textContent='Play again';
 XC.over({img:A+'overmind_head.jpg',title:'NON-COMPLIANT',stats:`You repeated ${r} in a row · Harmony Score ${r*10}%`+(rec?' · NEW BEST!':` · Best ${best}`)+'<br><small>Overmind: “...best friend?”</small>',
 text:`Overmind gave me a Harmony Score of ${r*10}% (${r} in a row) 🍞🤖`,path:'says/',again:start,againLabel:'Play again'})}
$('#best').textContent=XC.get('says')??'—';
$('#go').onclick=start;
$('#replay').onclick=()=>{if(st&&st.phase==='input')showSeq()};
addEventListener('keydown',e=>{if(!(e.code in KEYS))return;e.preventDefault();press(KEYS[e.code])});
