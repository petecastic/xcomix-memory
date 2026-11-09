/* Drop Run — night drop route. Ladders land on the house, never the pole.
   Bear stays in the van. Score saves on this device. */
(function(){
  var $=XC.$;
  var cv=$('#cv'),c=cv.getContext('2d');
  var W=480,H=300,BAY=286,BAYH=72;
  var img={};
  function load(k,src){var i=new Image();i.src=src;img[k]=i;}
  load('pete','../td/img/peter.png');
  load('bear','../arcade/art/bear_face.jpg');
  load('zib','../arcade/art/zib_wink.jpg');
  var KINDS=[
    {name:'ROWHOUSE',w:96,h:88,hook:0.26},
    {name:'TWIN',w:118,h:74,hook:0.5},
    {name:'BUNGALOW',w:108,h:60,hook:0.74},
    {name:'CORNER',w:102,h:94,hook:0.22}
  ];
  var st,raf,booted=false;

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function sx(x){return x-st.cam;}
  function say(m){st.quip=m;var q=$('#quip');if(q)q.textContent=m;}
  function hud(){
    $('#sc').textContent=st.score;
    $('#lt').textContent=st.lit;
    $('#st').textContent=st.streak;
    $('#ms').textContent=st.misses+'/3';
  }
  function anchor(e){return e.type==='house'?e.x+e.w*0.72:e.x;}
  function winHalf(){return Math.max(0.09,0.18-st.lit*0.004);}

  function pushPair(x){
    var n=st.litSeed++;
    if(n%3===2){
      st.events.push({type:'pole',x:x+24,state:'wait'});
      x+=130;
    }
    var k=KINDS[n%KINDS.length];
    var hook=clamp(k.hook+(Math.random()-0.5)*0.08,0.2,0.8);
    var hx=x+36;
    st.events.push({type:'house',x:hx,state:'wait',w:k.w,h:k.h,name:k.name,hook:hook});
    return hx+k.w+150;
  }

  function fresh(){
    st={
      on:true,over:false,cam:0,speed:62,score:0,streak:0,misses:0,lit:0,
      events:[],nextX:300,litSeed:0,puck:0,puckDir:1,lastHot:null,can:null,zib:null,zibDone:false,
      fx:[],bear:0,quip:'Night route. Hook the house. Never the pole.'
    };
    var x=st.nextX;
    for(var i=0;i<5;i++)x=pushPair(x);
    st.nextX=x;
    say(st.quip);
    hud();
  }

  function miss(msg){
    if(!st.on)return;
    st.streak=0;
    st.misses++;
    say(msg);
    XC.sfx(150,.16,'sawtooth');
    hud();
    if(st.misses>=3)endShift();
  }

  function hook(){
    if(!st||!st.on)return;
    var hot=null,hotD=1e9;
    for(var i=0;i<st.events.length;i++){
      var e=st.events[i];
      if(e.state!=='wait'&&e.state!=='hot')continue;
      var d=Math.abs(sx(anchor(e))-BAY);
      if(d<=BAYH&&d<hotD){hot=e;hotD=d;}
    }
    if(!hot){say('Wait for the bay.');return;}
    if(hot.type==='pole'){
      hot.state='miss';
      miss('Ladders go on the house.');
      return;
    }
    var half=winHalf();
    var dlt=Math.abs(st.puck-hot.hook);
    if(dlt<=half){
      hot.state='lit';
      var perfect=dlt<=half*0.42;
      var add=(perfect?150:100)+st.streak*12;
      st.score+=add;
      st.streak++;
      st.lit++;
      st.speed=Math.min(132,62+st.lit*4);
      say(perfect?"Perfect drop. Let's go.":'Hear me out. That house is lit.');
      XC.sfx(perfect?980:740,.08,'square');
      st.fx.push({x:sx(hot.x+hot.w/2),y:118,txt:'+'+add,t:42});
      if(!st.zibDone&&st.lit===4)st.zib={t:200,bob:0};
      if(st.lit%4===0)st.can={x:W-16,y:46,good:Math.random()<0.72};
      hud();
    }else{
      hot.state='miss';
      miss(st.puck<hot.hook?'Short. The eave is higher.':'Long. Ease off the line.');
    }
  }

  function grabCan(){
    if(!st||!st.on||!st.can)return;
    if(st.can.good){
      st.score+=80;
      say("Uncle Gene's good kind.");
      XC.sfx(880,.1,'triangle');
      st.fx.push({x:st.can.x,y:st.can.y,txt:'+80',t:40});
    }else{
      say("That's the other kind.");
      XC.sfx(220,.1,'square');
    }
    st.can=null;
    hud();
  }

  function pokeZib(){
    if(!st||!st.zib)return;
    st.score+=40;
    say("Hi again! ...You don't remember me, do you?");
    XC.sfx(660,.12,'triangle');
    st.fx.push({x:W/2,y:36,txt:'+40',t:46});
    st.zib=null;
    st.zibDone=true;
    hud();
  }

  function step(dt){
    if(!st.on)return;
    st.bear+=dt;
    st.cam+=st.speed*dt;
    var rate=0.78+Math.min(0.7,st.lit*0.035);
    st.puck+=st.puckDir*rate*dt;
    if(st.puck>=1){st.puck=1;st.puckDir=-1;}
    if(st.puck<=0){st.puck=0;st.puckDir=1;}
    while(st.nextX<st.cam+W+220)st.nextX=pushPair(st.nextX);
    var hot=null,hotD=1e9,i,e,s,d;
    for(i=0;i<st.events.length;i++){
      e=st.events[i];
      if(e.state!=='wait'&&e.state!=='hot')continue;
      s=sx(anchor(e));
      d=Math.abs(s-BAY);
      if(d<=BAYH&&d<hotD){hot=e;hotD=d;}
    }
    for(i=0;i<st.events.length;i++){
      e=st.events[i];
      if(e.state!=='wait'&&e.state!=='hot')continue;
      s=sx(anchor(e));
      if(e===hot)e.state='hot';
      else if(e.state==='hot')e.state='wait';
    }
    if(hot&&hot.type==='house'&&hot!==st.lastHot){
      st.puck=0;st.puckDir=1;
    }
    st.lastHot=hot;
    for(i=0;i<st.events.length;i++){
      e=st.events[i];
      if(e.state!=='wait'&&e.state!=='hot')continue;
      s=sx(anchor(e));
      if(s<BAY-BAYH){
        if(e.type==='house'){
          e.state='miss';
          miss('Drove past a dark house.');
          if(!st.on)return;
        }else e.state='ok';
      }
    }
    if(st.can){
      st.can.x-=120*dt;
      st.can.y=46+Math.sin(st.bear*7)*6;
      if(st.can.x<-30)st.can=null;
    }
    if(st.zib){
      st.zib.t-=dt*60;
      st.zib.bob+=dt;
      if(st.zib.t<=0){st.zib=null;st.zibDone=true;}
    }
    for(i=st.fx.length-1;i>=0;i--)if(--st.fx[i].t<=0)st.fx.splice(i,1);
    st.events=st.events.filter(function(ev){return sx(ev.x)>-220;});
  }

  function drawPole(x,e){
    c.fillStyle='#5c3b22';
    c.fillRect(x-5,92,10,122);
    c.fillStyle='#3a2414';
    c.fillRect(x-18,96,36,7);
    c.fillStyle='#7ec8ff';
    c.fillRect(x-16,92,7,7);
    c.fillRect(x+9,92,7,7);
    if(e.state==='miss'){
      c.strokeStyle='#ff2e63';c.lineWidth=3;
      c.beginPath();c.moveTo(x-12,110);c.lineTo(x+12,132);c.moveTo(x+12,110);c.lineTo(x-12,132);c.stroke();
    }
  }

  function drawHouse(x,e){
    var base=214,top=base-e.h;
    c.fillStyle='#2a1d4a';
    c.fillRect(x,top,e.w,e.h);
    c.strokeStyle='#000';c.lineWidth=3;
    c.strokeRect(x,top,e.w,e.h);
    c.fillStyle=e.name==='CORNER'?'#ff2e63':'#4a2c78';
    c.beginPath();
    c.moveTo(x-6,top+6);c.lineTo(x+e.w/2,top-18);c.lineTo(x+e.w+6,top+6);c.fill();
    var lit=e.state==='lit';
    c.fillStyle=lit?'#ffd400':'#100818';
    c.fillRect(x+14,top+24,18,16);
    c.fillRect(x+e.w-34,top+24,18,16);
    c.strokeStyle='#000';c.lineWidth=2;
    c.strokeRect(x+14,top+24,18,16);
    c.strokeRect(x+e.w-34,top+24,18,16);
    if(e.name==='CORNER'){
      c.fillStyle='#140e22';
      c.fillRect(x+10,base-26,e.w-20,20);
      c.fillStyle='#7dff5a';
      c.font='bold 9px sans-serif';c.textAlign='center';
      c.fillText(lit?'OPEN':'DELI',x+e.w/2,base-13);
    }
    var hy=top+8+e.hook*(e.h*0.42);
    var hx=x+e.w*0.72;
    c.fillStyle='#ffd400';
    c.fillRect(hx-5,hy-3,10,6);
    if(lit){
      c.strokeStyle='#e6c36a';c.lineWidth=3;
      c.beginPath();c.moveTo(x+10,base);c.lineTo(hx-4,hy+10);c.stroke();
      c.lineWidth=2;
      for(var i=1;i<=5;i++){
        var t=i/6;
        var lx=x+10+(hx-4-(x+10))*t;
        var ly=base+(hy+10-base)*t;
        c.beginPath();c.moveTo(lx-6,ly);c.lineTo(lx+6,ly);c.stroke();
      }
      c.strokeStyle='#2ee6ff';c.lineWidth=2;
      c.beginPath();c.moveTo(hx,78);c.lineTo(hx,hy);c.stroke();
    }
    if(e.state==='miss'){
      c.fillStyle='#ff2e63';
      c.font='900 14px Impact,sans-serif';c.textAlign='center';
      c.fillText('DARK',x+e.w/2,top+e.h*0.62);
    }
  }

  function drawVan(){
    c.fillStyle='#14365c';
    c.fillRect(6,156,112,52);
    c.strokeStyle='#000';c.lineWidth=3;
    c.strokeRect(6,156,112,52);
    c.fillStyle='#ff7a18';
    c.fillRect(6,172,112,8);
    c.fillStyle='#9fd7ff';
    c.fillRect(82,160,28,16);
    c.save();
    c.beginPath();c.rect(14,160,40,30);c.clip();
    if(img.bear.complete&&img.bear.naturalWidth)c.drawImage(img.bear,10,154+Math.sin(st.bear*5)*2,44,44);
    c.restore();
    c.strokeRect(14,160,40,30);
    c.fillStyle='#111';
    c.beginPath();c.arc(30,208,8,0,7);c.arc(98,208,8,0,7);c.fill();
    if(img.pete.complete&&img.pete.naturalWidth)c.drawImage(img.pete,114,148,40,70);
    c.fillStyle='#ffd400';
    c.font='bold 9px sans-serif';c.textAlign='left';
    c.fillText('BEAR · HAPPY',14,152);
  }

  function draw(){
    if(!st)return;
    var g=c.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#100824');
    g.addColorStop(1,'#2a1850');
    c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle='#fff';
    for(var i=0;i<26;i++){
      c.globalAlpha=0.35+(i%3)*0.2;
      c.fillRect((i*89+12)%W,(i*47%100)+6,2,2);
    }
    c.globalAlpha=1;
    c.fillStyle='#f5e6b8';c.beginPath();c.arc(430,34,14,0,7);c.fill();
    c.fillStyle='#2a1850';c.beginPath();c.arc(436,30,11,0,7);c.fill();
    var tx=((140-st.cam*0.12)%520+520)%520-40;
    c.fillStyle='#241838';c.fillRect(tx,48,26,110);
    c.fillStyle='#f5e6b8';c.fillRect(tx+4,56,18,14);
    c.fillStyle='#000';c.font='bold 7px sans-serif';c.textAlign='center';
    c.fillText('12:49',tx+13,66);
    c.strokeStyle='#2ee6ff';c.lineWidth=2;
    c.beginPath();c.moveTo(0,78);c.lineTo(W,78);c.stroke();
    c.fillStyle='#163222';c.fillRect(0,198,W,20);
    c.fillStyle='#23232e';c.fillRect(0,214,W,H-214);
    c.fillStyle='#ffd400';
    for(var x=-((st.cam*0.9)%36);x<W;x+=36)c.fillRect(x,236,16,3);
    c.fillStyle='rgba(255,212,0,.18)';
    c.fillRect(BAY-BAYH,198,BAYH*2,16);
    c.strokeStyle='#ffd400';c.strokeRect(BAY-BAYH,198,BAYH*2,16);
    var hot=null;
    for(var n=0;n<st.events.length;n++){
      var e=st.events[n];
      var ex=sx(e.x);
      if(ex>W+30||ex<-200)continue;
      if(e.type==='pole')drawPole(ex,e);
      else drawHouse(ex,e);
      if(e.state==='hot')hot=e;
    }
    drawVan();
    if(hot&&hot.type==='house'){
      var swing=(st.puck-hot.hook)*70;
      c.strokeStyle='#2ee6ff';c.lineWidth=2;
      c.beginPath();c.moveTo(BAY,78);c.lineTo(BAY+swing,168);c.stroke();
    }
    var x0=168,y0=266,gw=292,gh=18;
    c.fillStyle='#000';c.fillRect(x0,y0,gw,gh);
    c.strokeStyle='#ffd400';c.lineWidth=2;c.strokeRect(x0,y0,gw,gh);
    if(hot&&hot.type==='house'){
      var half=winHalf();
      var g0=Math.max(0,hot.hook-half);
      var g1=Math.min(1,hot.hook+half);
      c.fillStyle='#1c7a30';
      c.fillRect(x0+g0*gw,y0,(g1-g0)*gw,gh);
    }else if(hot&&hot.type==='pole'){
      c.fillStyle='#6a1030';c.fillRect(x0,y0,gw,gh);
    }
    c.fillStyle='#2ee6ff';
    c.fillRect(x0+st.puck*gw-4,y0-3,8,gh+6);
    c.font='900 14px Impact,sans-serif';c.textAlign='center';
    if(hot&&hot.type==='pole'){c.fillStyle='#ff2e63';c.fillText('POLE — WAIT',BAY,194);}
    else if(hot){c.fillStyle='#7dff5a';c.fillText(hot.name,BAY,194);}
    if(st.can){
      c.fillStyle=st.can.good?'#6b3a1a':'#555';
      c.fillRect(st.can.x-14,st.can.y-8,28,16);
      c.strokeStyle='#000';c.strokeRect(st.can.x-14,st.can.y-8,28,16);
      c.fillStyle='#ddd';c.fillRect(st.can.x-14,st.can.y-12,28,5);
      c.fillStyle='#ffd400';c.font='bold 8px sans-serif';
      c.fillText(st.can.good?'GOOD':'NOPE',st.can.x,st.can.y+3);
    }
    if(st.zib&&img.zib.complete&&img.zib.naturalWidth){
      var zy=28+Math.sin(st.zib.bob*6)*3;
      c.drawImage(img.zib,W/2-20,zy,40,40);
    }
    c.font='900 16px Impact,sans-serif';c.textAlign='center';c.fillStyle='#ffd400';
    for(var f=0;f<st.fx.length;f++)c.fillText(st.fx[f].txt,st.fx[f].x,st.fx[f].y-(42-st.fx[f].t)*0.4);
  }

  function endShift(){
    if(!st||st.over)return;
    st.on=false;st.over=true;
    var prev=XC.get('droprun');
    var rec=false,best=prev;
    if(st.score>0){var r=XC.best('droprun',st.score);rec=!!r.rec;best=r.best;}
    $('#hi').textContent=best==null?'—':best;
    XC.over({
      img:'../arcade/art/bear_face.jpg',
      title:rec?'SHIFT RECORD!':'END OF SHIFT',
      stats:'Score <b>'+st.score+'</b> · '+st.lit+' houses lit · Best '+(best==null?'—':best)+'<br>Bear gets the hoagie end bite.<br><small>The tech pretends that wasn\'t the plan.</small>',
      text:'Drop Run: I lit '+st.lit+' houses on the night route and scored '+st.score+'. Ladders stayed on the houses. Bear got the end bite.',
      path:'drop-run/',
      again:function(){fresh();}
    });
  }

  function loop(t){
    if(!loop.lt)loop.lt=t;
    var dt=Math.min(0.05,(t-loop.lt)/1000);
    loop.lt=t;
    if(st&&st.on)step(dt);
    draw();
    raf=requestAnimationFrame(loop);
  }

  function begin(){
    if(booted)return;
    booted=true;
    loop.lt=0;
    fresh();
  }

  addEventListener('keydown',function(e){
    if(e.repeat)return;
    if(e.code==='Space'||e.code==='Enter'||e.code==='ArrowDown'){e.preventDefault();hook();}
    else if(e.code==='ArrowUp'||e.code==='KeyW'||e.code==='ShiftLeft'||e.code==='ShiftRight'){
      e.preventDefault();
      if(st&&st.zib)pokeZib();else grabCan();
    }
  });
  cv.addEventListener('pointerdown',function(e){
    e.preventDefault();
    var r=cv.getBoundingClientRect();
    var x=(e.clientX-r.left)*(W/r.width);
    var y=(e.clientY-r.top)*(H/r.height);
    if(st&&st.can&&Math.abs(x-st.can.x)<26&&Math.abs(y-st.can.y)<24){grabCan();return;}
    if(st&&st.zib&&Math.abs(x-W/2)<28&&y<80){pokeZib();return;}
    hook();
  });
  $('#hook').addEventListener('click',function(e){e.preventDefault();hook();});
  $('#canbtn').addEventListener('click',function(e){
    e.preventDefault();
    if(st&&st.zib)pokeZib();else grabCan();
  });

  XC.muteBtn();
  var hi=XC.get('droprun');
  $('#hi').textContent=hi==null?'—':hi;
  fresh();st.on=false;draw();
  requestAnimationFrame(loop);
  XC.title($('#stage'),{
    name:'DROP RUN',
    img:'../arcade/art/peter_face.jpg',
    how:'Tap HOOK or press Space when the cyan mark sits in the green and a house is in the bay. If the bay says POLE, wait. Ladders go on the house, never the pole. GRAB CAN or press Up for Uncle Gene\'s good kind. Bear stays in the van.',
    best:hi,
    start:begin
  });
})();
