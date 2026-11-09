(function(){
'use strict';
var D=window.BINDER_DATA, C=D.cards, BY={};C.forEach(function(c){BY[c.id]=c});
var $=function(s,r){return (r||document).querySelector(s)};
var EMBED=document.body.classList.contains('embed');
var SER='STAGE: A1gR-APBeVk';
var SICON=['','☔','⚡','🪜','🥨','🎄','🕳️','🌩️','👑','⚙️','🚧','❄️','📍'];
var UCLS={'Dkorn Saga':'','Multiverse Core':'u-ms','Line Life':'u-ll','Krampus':'u-kr','Rainbow Herd':'u-pd','Old Bay Boys':'u-ob','Echoes of the Red Horizon':'u-eh','Domino & Pickle':'u-dp','Trail Trouble':'u-tt'};
var RCLS={'Common':'','Foil':'holo','Boss':'holo r-boss','10-Book Relic':'holo r-relic'};
var RW={'Common':66,'Foil':24,'Boss':7,'10-Book Relic':3};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function today(){return window.XC?XC.today():new Date().toISOString().slice(0,10)}
function load(){var s=window.XC&&XC.get('binder');if(!s||!s.own){s={own:{},day:'',packs:0,boss:''};['dk001','dk002','dk003','dk004','mv_peter'].forEach(function(id){s.own[id]=1})}return s}
var S=load();function save(){if(window.XC)XC.set('binder',S)}save();
function bonus(){return (window.XC&&XC.get('binder-packs'))|0}
function setBonus(n){if(window.XC)XC.set('binder-packs',Math.max(0,n))}
function dailyLeft(){return S.day!==today()?1:0}
function bossLeft(){return S.boss!==today()?1:0}
var st={q:'',u:'All',r:'All',b:'All',s:'All',o:'All',view:EMBED?'binder':'binder',page:0,newIds:{}};
function filt(){var q=st.q.toLowerCase();return C.filter(function(c){
  if(st.u!=='All'&&c.shows.indexOf(st.u)<0)return false;
  if(st.r!=='All'&&c.rarity!==st.r)return false;
  if(st.b!=='All'&&String(c.book)!==st.b)return false;
  if(st.s!=='All'&&String(c.sector)!==st.s)return false;
  if(st.o==='Owned'&&!S.own[c.id])return false;
  if(st.o==='Missing'&&S.own[c.id])return false;
  if(q&&(c.name+' '+c.role+' '+c.bio+' '+c.power+' '+c.no+' '+c.shows.join(' ')).toLowerCase().indexOf(q)<0)return false;
  return true})}
function artHTML(c){
  if(c.img){var sheet=/\/mv_|card_/.test(c.img);return '<img loading="lazy" decoding="async" class="'+(sheet?'sheet':'')+'" src="'+c.img+'" alt="'+esc(c.name)+'">'}
  var sec=c.sector||1;var hue=(sec*29+c.no.length*7)%360;
  return '<div class="gl" style="background:radial-gradient(circle at 50% 45%,hsl('+hue+',70%,38%),hsl('+((hue+40)%360)+',60%,10%))">'+c.glyph+'<small>'+(c.sector?esc(D.sectors[c.sector-1]):esc(c.shows[0]))+'</small></div>';
}
function cardHTML(c,big){
  var own=S.own[c.id]|0;
  var cls='card '+(RCLS[c.rarity]||'')+' '+(UCLS[c.u]||'')+(own||big?'':' unowned');
  var foot=c.book?'<span class="bk">BOOK '+c.book+'</span><span>'+SICON[c.sector]+' S'+c.sector+'</span>':'<span class="bk">'+esc(c.shows[0]).toUpperCase()+'</span>';
  return '<div class="'+cls+'" data-id="'+c.id+'">'+(st.newIds[c.id]&&!big?'<span class="newb">NEW!</span>':'')+(own>1&&!big?'<span class="own">x'+own+'</span>':'')+
   '<div class="hd"><span class="nm">'+esc(c.name)+'</span><span class="no">'+c.no+'</span></div>'+
   '<span class="rar">'+(c.rarity==='10-Book Relic'?'RELIC':c.rarity.toUpperCase())+'</span>'+
   '<div class="art">'+artHTML(c)+'</div>'+
   '<div class="ty">'+esc(c.role)+'</div>'+
   '<div class="pw"><b>⚡ '+esc(c.power)+'</b>'+(c.powerTxt?' — '+esc(c.powerTxt):'')+'</div>'+
   '<div class="sts"><span>HP</span><i class="hp"><b style="width:'+c.stats[0]+'%"></b></i><span>ARC</span><i class="arc"><b style="width:'+c.stats[1]+'%"></b></i><span>WIT</span><i class="wit"><b style="width:'+c.stats[2]+'%"></b></i></div>'+
   '<div class="ft">'+foot+'<span class="ser">'+SER+'</span></div></div>';
}
function per(){return EMBED||window.innerWidth<=1020?9:18}
function render(){
  var list=filt(),host=$('#view');
  $('#cnt').textContent=list.length+' card'+(list.length===1?'':'s');
  var owned=Object.keys(S.own).filter(function(k){return BY[k]}).length;
  $('#progTxt').textContent='COLLECTED '+owned+'/'+C.length+' ('+Math.floor(owned*100/C.length)+'%)';
  $('#progBar').style.width=(owned*100/C.length)+'%';
  var n=dailyLeft()+bonus()+bossLeft();$('#packN').textContent=n;$('#ripBtn').disabled=!n;
  if(!list.length){host.innerHTML='<div class="empty-msg">No cards match those filters.</div>';$('#pager').style.display='none';return}
  if(st.view==='grid'){host.innerHTML='<div class="grid">'+list.map(function(c){return cardHTML(c)}).join('')+'</div>';$('#pager').style.display='none';return}
  var p=per(),pages=Math.ceil(list.length/p);if(st.page>=pages)st.page=pages-1;if(st.page<0)st.page=0;
  var sl=list.slice(st.page*p,st.page*p+p),h='<div class="binder">';
  for(var pg=0;pg<p/9;pg++){h+='<div class="page">';for(var i=0;i<9;i++){var c=sl[pg*9+i];h+=c?'<div class="pocket">'+cardHTML(c)+'</div>':'<div class="pocket empty"></div>'}h+='</div>'}
  host.innerHTML=h+'</div>';
  $('#pager').style.display='flex';$('#pgTxt').textContent='PAGE '+(st.page+1)+' / '+pages;
}
/* card modal with 3D tilt + flip */
function openCard(id){
  var c=BY[id];if(!c)return;var ov=$('#cardOv');var own=S.own[id]|0;
  var back='<div class="cback"><h3>'+esc(c.name)+'</h3><div style="font:bold 11px \'Courier New\';color:#9fb3d9">'+c.no+' · '+esc(c.rarity)+' · '+esc(c.shows.join(' / '))+'</div>'+
   '<p>'+esc(c.bio)+'</p><dl>'+(c.look?'<dt>Look</dt><dd>'+esc(c.look)+'</dd>':'')+'<dt>Power</dt><dd>'+esc(c.power)+(c.powerTxt?' — '+esc(c.powerTxt):'')+'</dd>'+
   (c.book?'<dt>Book</dt><dd>Book '+c.book+': '+esc(c.bookTitle)+'</dd><dt>Sector</dt><dd>'+SICON[c.sector]+' '+c.sector+' · '+esc(D.sectors[c.sector-1])+'</dd>':'<dt>Show</dt><dd>'+esc(c.shows.join(', '))+'</dd>')+
   '<dt>Stats</dt><dd>HP '+c.stats[0]+' · ARC '+c.stats[1]+' · WIT '+c.stats[2]+'</dd></dl>'+
   '<span class="stamp">'+SER+'</span><br><span class="mx">◆ Series 1 Metaplex Core Card Ready</span></div>';
  ov.innerHTML='<div class="cm"><div class="tilt"><div class="tiltin" id="tiltin"><div class="flip" id="flip"><div class="face f big">'+cardHTML(c,true)+'</div><div class="face b">'+back+'</div></div></div></div>'+
   '<div class="side"><h2>'+esc(c.name)+'</h2><p style="color:#2ee6ff;font-weight:bold">'+c.no+' · '+esc(c.rarity)+(own?' · in your binder x'+own:' · not pulled yet')+'</p><p>'+esc(c.bio)+'</p>'+
   '<p style="font:bold 12px \'Courier New\';color:#ff7aa8">'+SER+'</p><span class="mx">◆ Series 1 Metaplex Core Card Ready</span>'+
   '<div class="row"><button class="b cy" id="flipBtn">↻ Flip card</button><button class="b" id="closeCard">Close</button><a class="b pink" style="text-decoration:none" target="_blank" rel="noopener" href="'+shareURL('I just pulled '+c.name+' ('+c.no+') in the X-Comix Multiverse Card Binder. Free to collect:')+'">Share on 𝕏</a></div>'+
   '<p style="font-size:11px;color:#8b98c4;margin-top:10px">Collector card fun only. Cards are free browser collectibles saved on this device.</p></div></div>';
  ov.classList.add('show');
  var tin=$('#tiltin'),fl=$('#flip');
  function mv(e){var r=tin.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tin.style.transform='rotateY('+(x*22)+'deg) rotateX('+(-y*22)+'deg)';var cd=tin.querySelector('.card');if(cd){cd.style.setProperty('--px',(x+.5)*100+'%');cd.style.setProperty('--py',(y+.5)*100+'%')}}
  tin.addEventListener('pointermove',mv);tin.addEventListener('pointerleave',function(){tin.style.transform=''});
  $('#flipBtn').onclick=function(){fl.classList.toggle('back');sfx(520)};
  tin.addEventListener('click',function(){fl.classList.toggle('back');sfx(520)});
  $('#closeCard').onclick=function(){ov.classList.remove('show')};
}
function shareURL(t){return 'https://x.com/intent/post?text='+encodeURIComponent(t+' https://petecastic.github.io/xcomix-memory/binder/ See you in another timeline.')}
function sfx(f,d,t){if(window.XC)XC.sfx(f,d||.07,t||'square',.05)}
/* booster packs */
function roll(r,boss){
  if(boss){var bs=C.filter(function(c){return c.rarity==='Boss'});return bs[Math.floor(r()*bs.length)]}
  var x=r()*100,acc=0,rar='Common';for(var k in RW){acc+=RW[k];if(x<acc){rar=k;break}}
  var pool=C.filter(function(c){return c.rarity===rar});return pool[Math.floor(r()*pool.length)];
}
function rip(){
  var kind=dailyLeft()?'daily':bonus()?'bonus':bossLeft()?'boss':null;if(!kind)return;
  var ov=$('#packOv');
  var label=kind==='daily'?'DAILY FREE PACK':kind==='bonus'?'ARCADE BONUS PACK':'SECRET BOSS WAVE PACK';
  ov.innerHTML='<div class="stagep"><div class="hint">'+label+' · 5 CARDS · TAP THE PACK TO RIP IT</div><div class="pack" id="pk"><span class="tear"></span><b>X-COMIX<br>MULTIVERSE</b><small>SERIES 1 · '+SER+'</small><small>5 FOIL-CHANCE CARDS</small></div></div>';
  ov.classList.add('show');
  $('#pk').addEventListener('click',function(){
    if(kind==='daily')S.day=today();else if(kind==='bonus')setBonus(bonus()-1);else S.boss=today();
    var r=Math.random,got=[];for(var i=0;i<5;i++)got.push(roll(r,kind==='boss'&&i===4));
    st.newIds={};got.forEach(function(c){if(!S.own[c.id])st.newIds[c.id]=1;S.own[c.id]=(S.own[c.id]|0)+1});S.opened=(S.opened|0)+1;save();
    this.classList.add('rip');sfx(220,.25,'sawtooth');
    var self=this;setTimeout(function(){
      var h='<div class="hint">TAP EACH CARD TO REVEAL</div><div class="pulls">'+got.map(function(c,i){return '<div class="slot" data-i="'+i+'"><div class="flip"><div class="face f">'+cardHTML(c)+'</div><div class="face b"><div class="cardback">XC</div></div></div></div>'}).join('')+'</div><div class="row" style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><button class="b gold" id="revAll">Reveal all</button><button class="b" id="packDone">Add to binder</button><a class="b pink" style="text-decoration:none" target="_blank" rel="noopener" href="'+shareURL('Ripped a free X-Comix Multiverse booster: '+got.map(function(c){return c.name.split(' — ')[0]}).join(', ')+'.')+'">Share pulls on 𝕏</a></div>';
      $('.stagep',ov).innerHTML=h;
      var slots=ov.querySelectorAll('.slot');
      function reveal(s){if(s.classList.contains('open'))return;s.classList.add('open');var c=got[+s.getAttribute('data-i')];sfx(c.rarity==='Common'?660:c.rarity==='Foil'?880:1175,.12,'triangle')}
      for(var j=0;j<slots.length;j++)slots[j].addEventListener('click',function(){reveal(this)});
      $('#revAll').onclick=function(){for(var j=0;j<slots.length;j++)(function(s,k){setTimeout(function(){reveal(s)},k*160)})(slots[j],j)};
      $('#packDone').onclick=function(){ov.classList.remove('show');st.o='All';$('#fO').value='All';render()};
    },450);
  },{once:true});
}
/* wire up */
function opts(sel,arr){sel.innerHTML=arr.map(function(a){return '<option value="'+esc(a[0])+'">'+esc(a[1])+'</option>'}).join('')}
function init(){
  opts($('#fU'),[['All','All Universes'],['Dkorn Saga','Dkorn Saga (100)'],['Multiverse Core','Multiverse Core'],['Line Life','Line Life'],['Krampus','Krampus'],['Rainbow Herd','Rainbow Herd'],['Old Bay Boys','Old Bay Boys'],['Echoes of the Red Horizon','Echoes of the Red Horizon'],['Domino & Pickle','Domino & Pickle'],['Trail Trouble','Trail Trouble']]);
  opts($('#fR'),[['All','All Rarities'],['Common','Common'],['Foil','Foil'],['Boss','Boss'],['10-Book Relic','10-Book Relic']]);
  var b=[['All','All Books']];for(var i=1;i<=10;i++)b.push([String(i),'Book '+i+': '+D.books[i]]);opts($('#fB'),b);
  var s=[['All','All Sectors']];for(i=1;i<=12;i++)s.push([String(i),SICON[i]+' '+i+' · '+D.sectors[i-1]]);opts($('#fS'),s);
  opts($('#fO'),[['All','Owned + missing'],['Owned','In my binder'],['Missing','Not pulled yet']]);
  [['#fU','u'],['#fR','r'],['#fB','b'],['#fS','s'],['#fO','o']].forEach(function(p){$(p[0]).addEventListener('change',function(){st[p[1]]=this.value;st.page=0;render()})});
  $('#q').addEventListener('input',function(){st.q=this.value;st.page=0;render()});
  var segs=document.querySelectorAll('#viewSeg button');for(i=0;i<segs.length;i++)segs[i].addEventListener('click',function(){st.view=this.getAttribute('data-v');for(var j=0;j<segs.length;j++)segs[j].classList.toggle('on',segs[j]===this);render()});
  $('#prev').onclick=function(){st.page--;render();sfx(330)};$('#next').onclick=function(){st.page++;render();sfx(392)};
  $('#view').addEventListener('click',function(e){var c=e.target.closest('.card');if(c){openCard(c.getAttribute('data-id'));sfx(587)}});
  $('#cardOv').addEventListener('click',function(e){if(e.target===this)this.classList.remove('show')});
  $('#packOv').addEventListener('click',function(e){if(e.target===this){this.classList.remove('show');render()}});
  $('#ripBtn').onclick=rip;
  $('#vipBtn').onclick=function(){if(window.DKVIP)DKVIP.open()};
  if(window.DKVIP){DKVIP.badge($('#lockBadge'));DKVIP.onChange(render)}
  var sw=$('#shareBtn');if(sw)sw.href=shareURL('The X-Comix Multiverse Card Binder is open: 155 cards, all 100 Dkorn characters plus the multiverse crew. Rip a free pack every day:');
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){$('#cardOv').classList.remove('show')}if(e.key==='ArrowRight'&&st.view==='binder'){st.page++;render()}if(e.key==='ArrowLeft'&&st.view==='binder'){st.page--;render()}});
  var lastW=window.innerWidth;window.addEventListener('resize',function(){if((lastW<=1020)!==(window.innerWidth<=1020)){lastW=window.innerWidth;render()}});
  if(/vip|lock/i.test(location.hash)&&window.DKVIP)DKVIP.open();
  render();
  window.__binder={S:S,C:C,render:render,openCard:openCard,rip:rip,st:st};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
