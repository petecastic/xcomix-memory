(function(){
  var CARDS=[
    {n:1, title:'AMBER WATCH', strip:1, slab:'STRIP 1 · NIGHT LAWN', blurb:'Domino watches the amber tick-lights on the unmarked dome.'},
    {n:2, title:'SECOND WATCH', strip:1, slab:'STRIP 1 · NIGHT LAWN', blurb:'Pickle joins him on the night lawn.'},
    {n:3, title:'TICK FLASH', strip:1, slab:'STRIP 1 · NIGHT LAWN', blurb:'Both look up as the dome face flashes.'},
    {n:4, title:'TWO BARKS', strip:1, slab:'STRIP 1 · NIGHT LAWN', blurb:'Bark lines only. No words.'},
    {n:5, title:'PRETZEL DROP', strip:1, slab:'STRIP 1 · NIGHT LAWN', blurb:'The rain eases. A pretzel sits on the grass.'},
    {n:6, title:'DRY LOT', strip:2, slab:'STRIP 2 · DRY LOT', blurb:'An empty portal between two cacti.'},
    {n:7, title:'SOFT PRETZEL', strip:2, slab:'STRIP 2 · DRY LOT', blurb:'A branching-antlered guest by a crate, pretzel on the sand.'},
    {n:8, title:'PALMATE GUEST', strip:2, slab:'STRIP 2 · DRY LOT', blurb:'A palmate-antlered guest arrives.'},
    {n:9, title:'BOX ARRIVES', strip:2, slab:'STRIP 2 · DRY LOT', blurb:'A box appears at the portal.'},
    {n:10, title:'SHADE BREAK', strip:2, slab:'STRIP 2 · DRY LOT', blurb:'They share the pretzel in the cactus shade.'},
    {n:11, title:'SIDE SLOT', strip:3, slab:'STRIP 3 · DUSK BOOTH', blurb:'Pixel at the booth, a print coming from the side slot.'},
    {n:12, title:'GREEN GUEST', strip:3, slab:'STRIP 3 · DUSK BOOTH', blurb:'Zib looks at the slip.'},
    {n:13, title:'BOOTH DRIP', strip:3, slab:'STRIP 3 · DUSK BOOTH', blurb:'Gus with coffee. The slip unspools.'},
    {n:14, title:'CAT BAT', strip:3, slab:'STRIP 3 · DUSK BOOTH', blurb:'The Tabby bats at the slip.'},
    {n:15, title:'HEART PRINT', strip:3, slab:'STRIP 3 · DUSK BOOTH', blurb:'A heart slip on the floor. The Tabby and Zib stay.'},
    {n:16, title:'FENCE DAWN', strip:4, slab:'STRIP 4 · FENCE DAWN', blurb:'Bear stands in front of the fence at dawn.'},
    {n:17, title:'TWO SIDES', strip:4, slab:'STRIP 4 · FENCE DAWN', blurb:'Domino and Pickle behind the fence. Bear stays on the near side.'},
    {n:18, title:'BUZZ POST', strip:4, slab:'STRIP 4 · FENCE DAWN', blurb:'A haptic buzzer lights on the post.'},
    {n:19, title:'TRIPLE BARK', strip:4, slab:'STRIP 4 · FENCE DAWN', blurb:'All three dogs gather on the near side and bark.'},
    {n:20, title:'QUIET RISE', strip:4, slab:'STRIP 4 · FENCE DAWN', blurb:'They sit together as the buzzer goes quiet.'}
  ];
  var i=0, filter=0, playing=false, timer=null;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var frame=document.getElementById('frame');
  var stage=document.getElementById('stage');
  var thumbs=document.getElementById('thumbs');

  function pad(n){ return String(n).padStart(2,'0'); }
  function inFilter(c){ return !filter || c.strip===filter; }
  function list(){ return CARDS.filter(inFilter); }

  function fit(){
    var w=stage.clientWidth;
    var s=w/384;
    frame.style.transform='scale('+s+')';
  }

  function show(n, keepPlay){
    var idx=CARDS.findIndex(function(c){ return c.n===n; });
    if(idx<0)return;
    i=idx;
    var c=CARDS[i];
    frame.src='cards/card-'+pad(c.n)+'.html';
    document.getElementById('title').textContent=c.title;
    document.getElementById('slab').textContent=c.slab+' · '+c.n+' / 20';
    document.getElementById('blurb').textContent=c.blurb;
    [].slice.call(thumbs.querySelectorAll('button')).forEach(function(b){
      b.classList.toggle('on', +b.dataset.n===c.n);
    });
    if(!keepPlay && playing){ /* stay playing */ }
    fit();
  }

  function step(dir){
    var arr=list();
    var at=arr.findIndex(function(c){ return c.n===CARDS[i].n; });
    if(at<0)at=0;
    at=(at+dir+arr.length)%arr.length;
    show(arr[at].n, true);
  }

  function play(on){
    playing=on;
    var b=document.getElementById('playbtn');
    b.classList.toggle('on', playing);
    b.textContent=playing?'PAUSE':'PLAY';
    if(timer){ clearInterval(timer); timer=null; }
    if(playing){
      timer=setInterval(function(){ step(1); }, reduce?4000:2200);
    }
  }

  CARDS.forEach(function(c){
    var b=document.createElement('button');
    b.type='button';
    b.dataset.n=c.n;
    b.dataset.strip=c.strip;
    b.innerHTML='<img src="thumbs/card-'+pad(c.n)+'.png" alt="'+c.title+'" width="96" height="120"><i>'+pad(c.n)+'</i>';
    b.addEventListener('click', function(){ play(false); show(c.n); });
    thumbs.appendChild(b);
  });

  document.getElementById('prev').onclick=function(){ play(false); step(-1); };
  document.getElementById('next').onclick=function(){ play(false); step(1); };
  document.getElementById('playbtn').onclick=function(){ play(!playing); };

  document.getElementById('strips').addEventListener('click', function(e){
    var b=e.target.closest('button[data-s]');
    if(!b)return;
    filter=+b.dataset.s;
    [].slice.call(document.querySelectorAll('#strips button')).forEach(function(x){
      var on=x===b;
      x.classList.toggle('on', on);
      x.setAttribute('aria-selected', on?'true':'false');
    });
    [].slice.call(thumbs.querySelectorAll('button')).forEach(function(t){
      t.hidden=filter && +t.dataset.strip!==filter;
    });
    var first=list()[0];
    play(false);
    if(first) show(first.n);
  });

  addEventListener('keydown', function(e){
    if(e.key==='ArrowRight'||e.key==='ArrowDown'){ e.preventDefault(); play(false); step(1); }
    if(e.key==='ArrowLeft'||e.key==='ArrowUp'){ e.preventDefault(); play(false); step(-1); }
    if(e.key===' '){ e.preventDefault(); play(!playing); }
  });

  var sx=0;
  stage.addEventListener('touchstart', function(e){ sx=e.changedTouches[0].clientX; }, {passive:true});
  stage.addEventListener('touchend', function(e){
    var dx=e.changedTouches[0].clientX-sx;
    if(Math.abs(dx)>40){ play(false); step(dx<0?1:-1); }
  }, {passive:true});

  addEventListener('resize', fit);
  show(1);
  fit();
  window.__STRIP={show:show, step:step, play:play, index:function(){return i;}};
})();
