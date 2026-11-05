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
