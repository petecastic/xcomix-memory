const XC={base:'https://petecastic.github.io/xcomix-memory/',
 $:s=>document.querySelector(s),
 embed:document.body.classList.contains('embed'),
 today:()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')},
 rng(seed){if(typeof seed==='string')seed=[...seed].reduce((h,c)=>h*31+c.charCodeAt(0)|0,7);return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}},
 shuffle(a,r=Math.random){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a},
 get(k){try{return JSON.parse(localStorage.getItem('xca-'+k))}catch(e){return null}},
 set(k,v){try{localStorage.setItem('xca-'+k,JSON.stringify(v))}catch(e){}},
 best(k,score,lower){const b=XC.get(k);const rec=b==null||(lower?score<b:score>b);if(rec)XC.set(k,score);return{best:rec?score:b,rec}},
 shareURL(text,path){return'https://x.com/intent/post?text='+encodeURIComponent(text+' #XCOMIX')+'&url='+encodeURIComponent(XC.base+path)},
 over(o){let el=XC.$('#over');if(!el){el=document.createElement('div');el.id='over';document.body.appendChild(el)}
  el.innerHTML=`<div class="panel">${o.img?`<img src="${o.img}" alt="">`:''}<h2>${o.title}</h2><p>${o.stats}</p><div class="row"><button id="again">${o.againLabel||'Play again'}</button><a class="btn share" target="_blank" rel="noopener" href="${XC.shareURL(o.text,o.path)}">Share on 𝕏</a></div>${XC.embed?'':'<p style="margin:12px 0 0;font-size:12px"><a href="../" style="color:#ffd400">← Back to the 3 AM Valley Arcade</a></p>'}</div>`;
  el.hidden=false;XC.$('#again').onclick=()=>{el.hidden=true;o.again()}}};
XC.muted=XC.get('muted')!==false;XC.ac=null;
XC.sfx=function(f,d=.08,type='square',v=.06){if(XC.muted)return;try{XC.ac=XC.ac||new(window.AudioContext||window.webkitAudioContext)();const o=XC.ac.createOscillator(),g=XC.ac.createGain();o.type=type;o.frequency.value=f;g.gain.value=v;o.connect(g);g.connect(XC.ac.destination);const t=XC.ac.currentTime;g.gain.exponentialRampToValueAtTime(.0001,t+d);o.start(t);o.stop(t+d)}catch(e){}};
XC.muteBtn=function(){const b=document.createElement('button');b.className='mute';const u=()=>b.textContent=XC.muted?'🔇':'🔊';u();b.onclick=e=>{e.stopPropagation();XC.muted=!XC.muted;XC.set('muted',XC.muted);u();XC.sfx(660)};document.body.appendChild(b)};
XC.title=function(host,o){const t=document.createElement('div');t.className='title'+(o.armLabel?' split':'');const ctp=o.armLabel?`<button type="button" class="ctp arm">${o.armLabel}</button>`:`<div class="ctp">CLICK TO PLAY</div>`;t.innerHTML=`<div class="tbox">${o.img?`<img src="${o.img}" alt="">`:''}<h2>${o.name}</h2><p>${o.how}</p>${o.extra||''}${ctp}<div class="hi">HI-SCORE <b>${o.best==null?'—':o.best}</b></div></div>`;host.appendChild(t);var go=function(e){if(o.armLabel){if(!e.target.closest('button.arm'))return}else if(e.target.closest('button[data-k],select'))return;if(!t.parentNode)return;e.preventDefault();t.remove();o.start()};if(window.PointerEvent)t.addEventListener('pointerup',go);else t.addEventListener('touchend',go,{passive:false});t.addEventListener('click',go);return t};

XC.fit=function(){if(!XC.embed||document.querySelector('canvas'))return;var w=document.querySelector('.wrap');if(!w)return;w.style.zoom=1;var h=w.scrollHeight+12,ww=w.scrollWidth+12,vh=window.innerHeight,vw=window.innerWidth;if(!vh||!vw)return;var z=Math.min(1,vh/h,vw/ww);w.style.zoom=z};
window.addEventListener('resize',function(){XC.fit()});window.addEventListener('load',function(){XC.fit();setTimeout(XC.fit,300)});
(function(){
  if(document.body.classList.contains('embed'))return;
  if(!document.querySelector('a.back, a.bk')&&document.body.dataset.xcbar!=='on')return;
  var s=document.currentScript;if(!s)return;
  var src=s.src.replace(/common\.js(\?.*)?$/,'chrome.js');
  document.write('<script src="'+src+'"><\/script>');
})();
