const $=XC.$,P=[
['Krampus Storm Desk: “Fog Check”','2115389105140043806',0],['Lil Spanky, Ep. 2','2117330807908176127',1],['Trail Trouble: Morgan Shoutout','2112703319202255212',2],
['Echoes of the Red Horizon, Ep. 4: “Tryouts”','2116644855342670249',3],['The Timeline Classifieds, Ep. 1: “Lost: One Tuesday”','2113006493595238797',4],['Morgan, Ep. 2','2117711382116519949',5],
['Stink Patrol, Ep. 6: “The Mummy Cat”','2112255102384025950',7],['Toll Booth Night Shift: “Dark Booth”','2114910184745107728',8],['Graveyard Shift: Ceres, WO No. 5: “Going Down”','2112614618573259008',9]];
const N=3,b=$('#board');let st;
function start(mode){mode=mode||'daily';const r=mode==='daily'?XC.rng('panel'+XC.today()):Math.random;const pi=Math.floor(r()*P.length);
 let order;do{order=XC.shuffle([...Array(N*N).keys()],r)}while(order.every((v,i)=>v===i));
 st={mode,pi,img:P[pi][2],order,sel:null,moves:0};document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('on',x.dataset.mode===mode));
 $('#quip').innerHTML='Circuit 13 scrambled a page from <b>'+P[pi][0]+'</b>. Tap two tiles to swap.';render()}
function render(){b.innerHTML='';st.order.forEach((t,i)=>{const d=document.createElement('button');d.className='tile'+(st.sel===i?' sel':'')+(t===i?' home':'');
 d.style.backgroundImage=`url(../arcade/panels/p${st.img}.jpg)`;d.style.backgroundPosition=`${(t%N)*50}% ${Math.floor(t/N)*50}%`;d.onclick=()=>tap(i);b.appendChild(d)});$('#moves').textContent=st.moves}
function tap(i){if(st.sel==null){st.sel=i}else{if(st.sel!==i){[st.order[st.sel],st.order[i]]=[st.order[i],st.order[st.sel]];st.moves++;navigator.vibrate?.(10)}st.sel=null}render();
 if(st.order.every((v,k)=>v===k))setTimeout(end,350)}
function end(){const k='panels-'+(st.mode==='daily'?XC.today():'free'),{best,rec}=XC.best(k,st.moves,true);$('#best').textContent=best;
 XC.over({img:`../arcade/panels/p${st.img}.jpg`,title:'PAGE FIXED!',stats:`${st.moves} swaps`+(rec?' · NEW BEST!':` · Best ${best}`)+`<br><small>${P[st.pi][0]} · <a style="color:#ffd400" target="_blank" rel="noopener" href="https://x.com/PeteCastic/status/${P[st.pi][1]}">read it on X</a></small>`,
 text:`I unscrambled a ${P[st.pi][0].split(/[,:·]/)[0].trim()} page in ${st.moves} swaps 🧩`,path:'panels/',again:()=>start('random'),againLabel:'New page'})}
document.querySelectorAll('[data-mode]').forEach(x=>x.onclick=()=>start(x.dataset.mode));$('#best').textContent=XC.get('panels-'+XC.today())??'—';start('daily');
