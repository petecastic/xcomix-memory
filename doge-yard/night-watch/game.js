/* Night Watch — catch pretzels on the night lawn, bark at the box.
   Score saves on this device only. Fan arcade, no prizes. */
(function(){
  var $=XC.$;
  var cv=$('#cv'), c=cv.getContext('2d');
  var W=480, H=300, GY=246, SCALE=2;
  c.imageSmoothingEnabled=false;
  var sheet=new Image();
  sheet.src='sprites.png';
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var F={
    krampus:[0,0,24,32], dkorn:[24,0,24,32], tabby:[48,0,24,32],
    zib:[72,0,24,32], gus:[96,0,24,32], pixel:[120,0,24,32],
    domino:[144,0,24,32], pickle:[168,0,24,32], bear:[192,0,24,32],
    lamp:[216,0,8,32], cactus:[224,0,16,32], tree:[240,0,16,32],
    wag0:[0,32,24,32], wag1:[24,32,24,32], wag2:[48,32,24,32],
    portal:[72,36,24,24], box:[96,44,16,12], pretzel:[112,48,8,8],
    coffee:[120,48,8,8], grass:[128,48,16,8], puddle:[176,50,16,6],
    sun:[192,40,8,8], moon:[200,40,8,8], cloud:[208,40,16,8],
    star:[224,40,8,8], rock:[232,40,8,8], bark:[240,40,8,8],
    heart:[248,40,8,8], dome:[0,64,48,32], fence:[96,80,24,16],
    buzzer:[152,72,8,24]
  };
  var WHO={
    domino:{label:'Domino', frames:['wag0','wag1','wag2']},
    pickle:{label:'Pickle', frames:['pickle']},
    bear:{label:'Bear', frames:['bear']}
  };
  var QUIP={
    start:'Amber watch. Keep an eye on the lawn.',
    pretzel:['Pretzel drop!','A soft pretzel on the grass.','Caught one.'],
    heart:['A heart print.','Someone left a heart.'],
    coffee:['Gus would approve.','Warm sip. The lawn slows down.'],
    box:['The box arrives. Bark it off.','A box on the lawn.'],
    shoo:['Two barks. The box is gone.','Shooed the box.'],
    rock:['Jump the rock.','Watch your paws.'],
    puddle:['Jump the puddle.','Night rain left a pool.'],
    hit:['Oof. Shake it off.','Missed that one.'],
    guest:['A palmate guest walks the fence.','Branching antlers in the dark.'],
    over:'Quiet rise. The watch is over.'
  };
  var who='domino';
  var st, raf, keys={}, held={};
  var clouds=[{x:40,y:18,s:0.15},{x:210,y:28,s:0.1},{x:340,y:14,s:0.12}];
  var stars=[[30,16],[58,28],[90,12],[140,22],[200,10],[250,26],[310,14],[370,20],[430,12],[460,30]];

  function blit(name,x,y,scale){
    var f=F[name]; if(!f||!sheet.complete)return;
    scale=scale||SCALE;
    c.drawImage(sheet,f[0],f[1],f[2],f[3], Math.round(x), Math.round(y), f[2]*scale, f[3]*scale);
  }
  function say(m){ st.quip=m; var q=$('#quip'); if(q)q.innerHTML=m; }
  function pickQuip(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function hud(){
    $('#sc').textContent=st.score;
    $('#pr').textContent=st.pretzels;
    $('#lv').textContent=Math.max(0, 3-st.misses);
  }
  function speed(){
    var base=Math.min(5.4, 2.05 + st.dist/1400 + st.score/180);
    return st.slow>0 ? base*0.5 : base;
  }

  function fresh(){
    st={
      on:true, over:false, t:0, dist:0, score:0, pretzels:0, boxes:0, misses:0,
      x:70, y:0, vy:0, facing:1, inv:0, cool:0, slow:0, next:70,
      items:[], barks:[], fx:[], guests:[], nextGuest:400,
      quip:QUIP.start
    };
    say(st.quip);
    hud();
  }

  function jump(){
    if(!st||!st.on||st.over)return;
    if(st.y===0){ st.vy=11.4; XC.sfx(520,.05); try{navigator.vibrate&&navigator.vibrate(8)}catch(e){} }
  }
  function bark(){
    if(!st||!st.on||st.over)return;
    if(st.cool>0)return;
    st.cool=26;
    var mouthX=st.x+(st.facing>0?44:4);
    var mouthY=GY-st.y-44;
    st.barks.push({x:mouthX, y:mouthY, life:28, vx:7*st.facing});
    st.fx.push({x:mouthX, y:mouthY-6, txt:'BARK', t:24, col:'#ffd400'});
    XC.sfx(240,.12,'square',.07);
    try{navigator.vibrate&&navigator.vibrate(10)}catch(e){}
  }

  function spawn(){
    var r=Math.random();
    var late=st.dist>900;
    var kind, y, grounded=false;
    if(r<0.46){ kind='pretzel'; y=20+Math.random()*70; }
    else if(r<0.58){ kind='heart'; y=30+Math.random()*60; }
    else if(r<0.66){ kind='coffee'; y=24+Math.random()*50; }
    else if(r<(late?0.86:0.80)){ kind='box'; y=0; grounded=true; }
    else if(r<0.93){ kind='rock'; y=0; grounded=true; }
    else { kind='puddle'; y=0; grounded=true; }
    var size={
      pretzel:[16,16], heart:[16,16], coffee:[16,16],
      box:[32,24], rock:[16,16], puddle:[32,12]
    }[kind];
    st.items.push({k:kind, x:W+20, y:y, w:size[0], h:size[1], grounded:grounded, dead:false});
    if(kind==='box') say(pickQuip(QUIP.box));
    st.next=Math.max(36, 92-st.dist/120)+Math.random()*36;
  }

  function spawnGuest(){
    var pal=Math.random()<0.5;
    st.guests.push({
      k: pal?'dkorn':'krampus',
      x:W+10,
      y: GY-64-18,
      vx: -(0.6+Math.random()*0.4)
    });
    say(pal?QUIP.guest[0]:QUIP.guest[1]);
    st.nextGuest=500+Math.random()*400;
  }

  function hit(){
    if(st.inv>0)return;
    st.misses++;
    st.inv=50;
    st.vy=Math.max(st.vy, 7);
    say(pickQuip(QUIP.hit));
    XC.sfx(140,.16,'sawtooth');
    try{navigator.vibrate&&navigator.vibrate(18)}catch(e){}
    hud();
    if(st.misses>=3) endWatch();
  }

  function collide(a,b){
    return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  }

  function step(){
    if(!st||st.over)return;
    st.t++;
    if(!st.on)return;
    if(st.inv>0)st.inv--;
    if(st.cool>0)st.cool--;
    if(st.slow>0)st.slow--;

    var dir=0;
    if(keys.ArrowLeft||keys.KeyA||keys.Left||held.left)dir-=1;
    if(keys.ArrowRight||keys.KeyD||keys.Right||held.right)dir+=1;
    if(dir) st.facing=dir;
    st.x=Math.max(16, Math.min(W-70, st.x+dir*3.2));

    st.vy-=0.62;
    st.y=Math.max(0, st.y+st.vy);
    if(st.y===0)st.vy=0;

    var sp=speed();
    st.dist+=sp;
    if(--st.next<=0)spawn();
    if(--st.nextGuest<=0)spawnGuest();

    var pw=40, ph=50;
    var pb={x:st.x+6, y:GY-st.y-ph, w:pw, h:ph};

    st.items.forEach(function(o){
      o.x-=sp;
      if(o.dead)return;
      var oy=o.grounded ? GY-o.h : GY-o.h-o.y;
      var ob={x:o.x, y:oy, w:o.w, h:o.h};
      if(!collide(pb,ob))return;
      if(o.k==='pretzel'){
        o.dead=true; st.pretzels++; st.score+=10;
        st.fx.push({x:o.x, y:oy, txt:'+10', t:36, col:'#7dff5a'});
        say(pickQuip(QUIP.pretzel)); XC.sfx(880,.06);
      } else if(o.k==='heart'){
        o.dead=true; st.score+=25;
        if(st.misses>0){ st.misses--; }
        st.fx.push({x:o.x, y:oy, txt:'+25', t:36, col:'#ff5c8a'});
        say(pickQuip(QUIP.heart)); XC.sfx(988,.08);
      } else if(o.k==='coffee'){
        o.dead=true; st.score+=5; st.slow=90;
        st.fx.push({x:o.x, y:oy, txt:'SLOW', t:36, col:'#c8e8ff'});
        say(pickQuip(QUIP.coffee)); XC.sfx(700,.08);
      } else if(o.k==='box' || o.k==='rock' || o.k==='puddle'){
        if(o.k==='puddle' && st.y>10)return;
        if(o.k==='rock' && st.y>14)return;
        if(o.k==='box' && st.y>22)return;
        o.dead=true;
        hit();
      }
    });

    st.barks.forEach(function(b){
      b.x+=b.vx; b.life--;
      st.items.forEach(function(o){
        if(o.dead||o.k!=='box')return;
        var oy=o.grounded?GY-o.h:GY-o.h-o.y;
        if(b.x<o.x+o.w && b.x+16>o.x && b.y<oy+o.h && b.y+16>oy){
          o.dead=true; b.life=0; st.boxes++; st.score+=15;
          st.fx.push({x:o.x, y:oy-8, txt:'SHOO', t:40, col:'#ffd400'});
          say(pickQuip(QUIP.shoo)); XC.sfx(660,.08);
        }
      });
    });

    st.guests.forEach(function(g){ g.x+=g.vx; });
    st.items=st.items.filter(function(o){ return !o.dead && o.x>-50; });
    st.barks=st.barks.filter(function(b){ return b.life>0 && b.x>-20 && b.x<W+20; });
    st.guests=st.guests.filter(function(g){ return g.x>-60; });
    st.fx.forEach(function(f){ f.t--; });
    st.fx=st.fx.filter(function(f){ return f.t>0; });
    hud();
  }

  function sky(){
    var g=c.createLinearGradient(0,0,0,GY);
    g.addColorStop(0,'#0e1728');
    g.addColorStop(0.7,'#1b2a4a');
    g.addColorStop(1,'#1a2418');
    c.fillStyle=g; c.fillRect(0,0,W,H);
    // stars
    c.fillStyle='#f4f0e8';
    stars.forEach(function(s,i){
      var tw=reduce?1:(Math.sin(st.t*0.05+i)*0.5+0.5);
      if(tw<0.25 && !reduce)return;
      c.fillRect(s[0], s[1], 2, 2);
    });
    blit('moon', 22, 16, 2);
    clouds.forEach(function(cl){
      var x=(cl.x - st.dist*cl.s)% (W+80);
      if(x<0)x+=W+80;
      blit('cloud', x-20, cl.y, 2);
    });
    blit('dome', 200, 78, 2);
    // amber ticks on the dome face
    if(!reduce && (st.t%24)<12){
      c.fillStyle='#f0b43a';
      c.fillRect(232, 96, 3, 3);
      c.fillRect(258, 96, 3, 3);
    }
    blit('lamp', 8, 118, 2);
    blit('tree', 424, 118, 2);
    // fence mid-ground
    var fx= -((st.dist*0.6)%48);
    for(var x=fx-24; x<W+24; x+=48) blit('fence', x, GY-40, 2);
    // occasional tabby on the fence
    var tabX=W-80-((st.dist*0.6)%900);
    if(tabX>-40 && tabX<W) blit('tabby', tabX, GY-40-48, 1.5);
  }

  function ground(){
    c.fillStyle='#1a2418';
    c.fillRect(0, GY-8, W, H-(GY-8));
    var gx= -((st.dist)%32);
    for(var x=gx-16; x<W+16; x+=32) blit('grass', x, GY-8, 2);
    // darker turf edge
    c.fillStyle='#12180f';
    c.fillRect(0, GY+16, W, H-GY-16);
  }

  function drawActor(){
    var frames=WHO[who].frames;
    var fi=frames.length>1 && !reduce ? (Math.floor(st.t/8)%frames.length) : 0;
    var nm=frames[fi];
    if(st.inv>0 && (st.t%6)<3) return;
    // shadow
    c.fillStyle='rgba(0,0,0,.35)';
    c.beginPath(); c.ellipse(st.x+24, GY-2, 18, 5, 0, 0, 7); c.fill();
    blit(nm, st.x, GY-st.y-64, 2);
    if(st.cool>18) blit('bark', st.x+(st.facing>0?44: -8), GY-st.y-52, 2);
  }

  function draw(){
    if(!st)return;
    sky();
    st.guests.forEach(function(g){ blit(g.k, g.x, g.y, 2); });
    ground();
    st.items.forEach(function(o){
      var oy=o.grounded ? GY-o.h : GY-o.h-o.y;
      blit(o.k, o.x, oy, 2);
    });
    st.barks.forEach(function(b){ blit('bark', b.x, b.y, 2); });
    drawActor();
    c.font='900 16px Impact,sans-serif';
    c.textAlign='center';
    st.fx.forEach(function(f){
      c.fillStyle=f.col;
      c.fillText(f.txt, f.x+8, f.y-(28-f.t));
    });
    // lives as hearts in the canvas corner (backup to HUD)
    for(var i=0;i<3;i++){
      if(i>=3-st.misses){
        c.globalAlpha=0.25;
      }
      blit('heart', 8+i*18, 8, 2);
      c.globalAlpha=1;
    }
    if(!st.on && !st.over){
      // idle preview still draws
    }
  }

  function loop(){
    step();
    draw();
    raf=requestAnimationFrame(loop);
  }

  function endWatch(){
    st.on=false; st.over=true;
    say(QUIP.over);
    var s=st.score;
    var r=XC.best('nightwatch', s);
    $('#hi').textContent=r.best;
    XC.over({
      title: r.rec ? 'NEW BEST!' : 'WATCH OVER',
      stats:'Score '+s+' · '+st.pretzels+' pretzels · '+st.boxes+' boxes shooed'+(r.rec?' · NEW BEST!':' · Best '+r.best),
      text:'I kept Night Watch in the Doge Yard and scored '+s+' with '+WHO[who].label+'.',
      path:'doge-yard/night-watch/',
      again:begin,
      againLabel:'Watch again'
    });
  }

  function begin(){
    var over=$('#over'); if(over)over.hidden=true;
    fresh();
    say('<b>'+WHO[who].label+':</b> '+QUIP.start);
  }

  function bindHold(id, key){
    var el=$(id);
    if(!el)return;
    function down(e){ e.preventDefault(); held[key]=true; el.classList.add('held'); }
    function up(e){ if(e)e.preventDefault(); held[key]=false; el.classList.remove('held'); }
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointerleave', up);
    el.addEventListener('pointercancel', up);
  }

  XC.muteBtn();
  var hi=XC.get('nightwatch');
  $('#hi').textContent=hi==null?'—':hi;
  fresh(); st.on=false; draw();
  requestAnimationFrame(loop);

  var extra='<div class="pick" id="who">'
    +'<button type="button" data-k="domino" class="on" aria-pressed="true"><img src="../art/domino.png" alt="Domino" width="56" height="72"></button>'
    +'<button type="button" data-k="pickle" aria-pressed="false"><img src="../art/pickle.png" alt="Pickle" width="56" height="72"></button>'
    +'<button type="button" data-k="bear" aria-pressed="false"><img src="../art/bear.png" alt="Bear" width="56" height="72"></button>'
    +'</div><p class="who-name" id="whoName">Domino</p>';

  XC.title($('#stage'),{
    name:'NIGHT WATCH',
    how:'Catch pretzels. Jump rocks and puddles. Bark at the box before it bumps you. Hearts fix a miss. Score stays on this device.',
    extra:extra,
    best:hi,
    start:begin
  });

  var pick=document.getElementById('who');
  if(pick){
    pick.addEventListener('click', function(e){
      var b=e.target.closest('button[data-k]');
      if(!b)return;
      who=b.dataset.k;
      [].slice.call(pick.querySelectorAll('button')).forEach(function(x){
        var on=x===b;
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on?'true':'false');
      });
      var n=$('#whoName'); if(n)n.textContent=WHO[who].label;
    });
  }

  bindHold('#left','left');
  bindHold('#right','right');
  $('#jump').addEventListener('pointerdown', function(e){ e.preventDefault(); jump(); });
  $('#bark').addEventListener('pointerdown', function(e){ e.preventDefault(); bark(); });
  cv.addEventListener('pointerdown', function(e){
    if(!st||!st.on)return;
    e.preventDefault();
    var r=cv.getBoundingClientRect();
    var x=(e.clientX-r.left)/r.width*W;
    if(x<st.x-8) held.left=true;
    else if(x>st.x+50) held.right=true;
    else jump();
  });
  cv.addEventListener('pointerup', function(){ held.left=false; held.right=false; });
  cv.addEventListener('pointerleave', function(){ held.left=false; held.right=false; });

  addEventListener('keydown', function(e){
    keys[e.code]=true;
    if(e.code==='ArrowLeft'||e.code==='ArrowRight'||e.code==='ArrowUp'||e.code==='Space'||e.code==='KeyW'||e.code==='KeyA'||e.code==='KeyD'||e.code==='KeyX'||e.code==='KeyB') e.preventDefault();
    if(e.code==='Space'||e.code==='ArrowUp'||e.code==='KeyW') jump();
    if(e.code==='KeyX'||e.code==='KeyB') bark();
  });
  addEventListener('keyup', function(e){ keys[e.code]=false; });

  // Test hook + optional ?play=1&who=bear
  window.__NW={
    start:begin,
    get state(){ return st; },
    setWho:function(k){ if(WHO[k]) who=k; },
    who:function(){ return who; }
  };
  var q=new URLSearchParams(location.search);
  if(q.get('who')&&WHO[q.get('who')]) who=q.get('who');
  if(q.get('play')==='1'){
    var t=document.querySelector('.title');
    if(t)t.remove();
    begin();
  }

  sheet.onload=function(){ if(st)draw(); };
})();
