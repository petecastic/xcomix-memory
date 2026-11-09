/* Last Booth — exact change on the night shift.
   Doug is a nuisance. Bear is not in this one. Pixel prints heart receipts. */
(function(){
  var $=XC.$;
  var cv=$('#cv'),c=cv.getContext('2d');
  var W=480,H=220;
  var img={};
  function load(k,src){var i=new Image();i.src=src;img[k]=i;}
  load('gus','../td/img/gus.png');
  load('pixel','../td/img/pixel.png');
  load('zib','../arcade/art/zib_wink.jpg');
  var KINDS=['SEDAN','WAGON','VAN','HATCH'];
  var st,raf,booted=false;

  function money(cents){return '$'+(cents/100).toFixed(2);}
  function say(m){var q=$('#quip');if(q)q.textContent=m;}
  function sum(){var n=0;for(var i=0;i<st.tray.length;i++)n+=st.tray[i];return n;}
  function greedy(cents){
    var n=0,left=cents,vals=[100,25,10,5,1],i;
    for(i=0;i<vals.length;i++){n+=Math.floor(left/vals[i]);left%=vals[i];}
    return n;
  }
  function label(v){return v>=100?'$'+(v/100):v+'¢';}
  function hud(){
    $('#sc').textContent=st.score;
    $('#cars').textContent=st.served;
    $('#sk').textContent=st.streak;
    $('#cones').textContent=st.strikes+'/3';
  }
  function renderTray(){
    $('#tray').textContent=money(sum());
    $('#chips').textContent=st.tray.map(label).join('  ');
  }

  function roll(){
    var n=st.seen;
    var fare;
    if(n<4){
      fare=[75,100,125,150,50,200,225,175][n%8];
    }else if(n<8){
      fare=40+5*Math.floor(Math.random()*36);
    }else if(Math.random()<0.28){
      fare=80+Math.floor(Math.random()*70);
    }else{
      fare=45+5*Math.floor(Math.random()*40);
    }
    var bills=[100,200,500,1000];
    var tender=1000,i;
    for(i=0;i<bills.length;i++){if(bills[i]>fare){tender=bills[i];break;}}
    if(Math.random()<0.3){
      for(i=0;i<bills.length;i++){if(bills[i]>tender){tender=bills[i];break;}}
    }
    st.car={
      fare:fare,tender:tender,due:tender-fare,
      kind:KINDS[n%KINDS.length],
      hue:Math.floor(Math.random()*360),
      x:W+30
    };
    st.tray=[];
    st.seen++;
    $('#fare').textContent=money(fare);
    $('#paid').textContent=money(tender);
    $('#due').textContent=money(st.car.due);
    renderTray();
    if(st.seen>2&&st.seen%3===0){
      st.doug={x:W+10,phase:'walk',t:0,warned:false};
      $('#shoo').hidden=false;
      return true;
    }
    if(!st.doug)$('#shoo').hidden=true;
    return false;
  }

  function fresh(){
    st={on:true,over:false,score:0,streak:0,strikes:0,served:0,seen:0,tray:[],car:null,doug:null,receipt:0,zib:0,zibDone:false,t:0};
    $('#play').hidden=false;
    $('#shoo').hidden=true;
    say('Radio: snow on the ridge. The wind gets here in two days.');
    roll();
    hud();
  }

  function strike(){
    if(!st.on)return;
    st.streak=0;
    st.strikes++;
    hud();
    if(st.strikes>=3)endShift();
  }

  function addCoin(v){
    if(!st||!st.on)return;
    v=+v;
    if(sum()+v>st.car.due+200){say('Gus: no. The tray is piled up.');return;}
    st.tray.push(v);
    renderTray();
    XC.sfx(500+v,.04,'square',.05);
    if(sum()===st.car.due)say('That matches. Hand it over.');
    else if(sum()>st.car.due)say('Too much. Undo a coin.');
  }
  function undo(){if(!st||!st.on||!st.tray.length)return;st.tray.pop();renderTray();}
  function clearTray(){if(!st||!st.on)return;st.tray=[];renderTray();say('Tray clear.');}

  function hand(){
    if(!st||!st.on)return;
    if(st.doug&&st.doug.phase!=='leave'){
      say("Gus: it's a goose, pixel.");
      if(st.doug.warned)strike();
      else st.doug.warned=true;
      return;
    }
    if(sum()!==st.car.due){
      say('Gus: no.');
      st.tray=[];
      renderTray();
      XC.sfx(140,.18,'sawtooth');
      strike();
      return;
    }
    var clean=st.tray.length<=greedy(st.car.due);
    var add=100+st.streak*20+(clean?25:0);
    st.score+=add;
    st.streak++;
    st.served++;
    st.receipt=48;
    XC.sfx(880,.12,'triangle');
    var dougIn=roll();
    var line=clean?'Pixel: HI BEST FRIEND! Clean till.':'Pixel: HI BEST FRIEND!';
    if(!st.zibDone&&st.served===5){
      st.zib=170;
      st.zibDone=true;
      line="Hi again! ...You don't remember me, do you?";
    }else if(dougIn){
      line=line+' Doug is in the lane.';
    }
    say(line);
    hud();
  }

  function shoo(){
    if(!st||!st.on||!st.doug||st.doug.phase==='leave')return;
    st.doug.phase='leave';
    st.score+=10;
    $('#shoo').hidden=true;
    say('Honk. Doug waddles off, unbothered.');
    XC.sfx(280,.14,'square');
    hud();
  }

  function step(dt){
    if(!st||!st.on)return;
    st.t+=dt;
    if(st.car&&st.car.x>248)st.car.x=Math.max(248,st.car.x-240*dt);
    if(st.receipt>0)st.receipt--;
    if(st.zib>0)st.zib--;
    if(!st.doug)return;
    if(st.doug.phase==='walk'){
      st.doug.x-=80*dt;
      if(st.doug.x<=196){st.doug.phase='sit';st.doug.x=196;}
    }else if(st.doug.phase==='sit'){
      st.doug.t+=dt;
      if(st.doug.t>7.5){
        st.tray=[];
        renderTray();
        say("Doug sat on the tray. Gus: it's a goose, pixel.");
        st.doug.phase='leave';
        $('#shoo').hidden=true;
        XC.sfx(180,.16,'sawtooth');
        strike();
      }
    }else if(st.doug.phase==='leave'){
      st.doug.x+=140*dt;
      if(st.doug.x>W+30)st.doug=null;
    }
  }

  function draw(){
    c.fillStyle='#100824';c.fillRect(0,0,W,H);
    c.fillStyle='#1a3a28';c.fillRect(0,150,W,70);
    c.fillStyle='#2a2a32';c.fillRect(0,168,W,52);
    c.fillStyle='#e6d48a';
    for(var i=0;i<8;i++)c.fillRect(40+i*56,188,26,4);
    c.fillStyle='#f4f1e4';
    c.fillRect(18,58,168,112);
    c.strokeStyle='#000';c.lineWidth=3;c.strokeRect(18,58,168,112);
    c.fillStyle='#16324a';c.fillRect(18,58,168,16);
    c.fillStyle='#ffd400';c.font='900 12px Impact,sans-serif';c.textAlign='left';
    c.fillText('LAST BOOTH',26,71);
    c.fillStyle='#9fd7ff';c.fillRect(28,80,78,52);
    c.strokeRect(28,80,78,52);
    if(img.gus.complete&&img.gus.naturalWidth)c.drawImage(img.gus,36,78,34,62);
    if(img.pixel.complete&&img.pixel.naturalWidth)c.drawImage(img.pixel,112,96,52,52);
    c.fillStyle='#111';c.fillRect(30,136,70,8);
    c.fillStyle='#f5e6b8';c.font='bold 9px sans-serif';c.textAlign='center';
    c.fillText('12:49',148,96);
    if(st&&st.receipt>0){
      var slip=Math.min(36,48-st.receipt);
      c.fillStyle='#fff';c.fillRect(118,128,46,slip);
      c.strokeStyle='#000';c.strokeRect(118,128,46,slip);
      c.fillStyle='#ff2e63';c.font='bold 8px sans-serif';
      c.fillText('HI BEST',141,128+Math.min(12,slip));
      if(slip>16)c.fillText('FRIEND',141,128+24);
    }
    if(st&&st.car){
      var car=st.car,y=156;
      c.fillStyle='hsl('+car.hue+',55%,42%)';
      c.fillRect(car.x,y,118,36);
      c.fillRect(car.x+22,y-16,62,18);
      c.strokeStyle='#000';c.strokeRect(car.x,y,118,36);
      c.fillStyle='#ffd400';c.fillRect(car.x+6,y+10,12,10);c.fillRect(car.x+100,y+10,12,10);
      c.fillStyle='#111';c.beginPath();c.arc(car.x+24,y+36,8,0,7);c.arc(car.x+94,y+36,8,0,7);c.fill();
      c.fillStyle='#fff';c.font='bold 11px sans-serif';c.textAlign='center';
      c.fillText(car.kind,car.x+59,y+24);
    }
    if(st&&st.doug){
      var gy=st.doug.phase==='sit'?132:142;
      var x=st.doug.x;
      c.fillStyle='#6d5344';
      c.beginPath();c.ellipse(x+18,gy+20,20,11,0,0,7);c.fill();
      c.strokeStyle='#000';c.lineWidth=2;c.stroke();
      c.fillStyle='#161616';
      c.fillRect(x+28,gy+6,8,14);
      c.beginPath();c.arc(x+36,gy+6,8,0,7);c.fill();
      c.fillStyle='#f2f2f2';
      c.beginPath();c.arc(x+32,gy+8,3.5,0,7);c.fill();
      c.fillStyle='#111';
      c.beginPath();c.moveTo(x+42,gy+4);c.lineTo(x+54,gy+7);c.lineTo(x+42,gy+11);c.fill();
      c.fillStyle='#ffd400';
      c.beginPath();c.moveTo(x+30,gy+1);c.lineTo(x+38,gy-12);c.lineTo(x+46,gy+1);c.fill();
      c.stroke();
      c.fillStyle='#ffd400';c.font='bold 9px sans-serif';c.textAlign='center';
      c.fillText('DOUG',x+20,gy+40);
    }
    if(st&&st.zib>0&&img.zib.complete&&img.zib.naturalWidth){
      c.drawImage(img.zib,200,8,42,42);
    }
    if(!st||!st.car){
      c.fillStyle='#ffd400';c.font='900 22px Impact,sans-serif';c.textAlign='center';
      c.fillText('NIGHT SHIFT',W/2,40);
    }
  }

  function endShift(){
    if(!st||st.over)return;
    st.on=false;st.over=true;
    var rec=XC.best('booth',st.score);
    $('#hi').textContent=rec.best;
    XC.over({
      img:'../td/img/pixel.png',
      title:rec.rec?'CLEAN TILL!':'SHIFT OVER',
      stats:st.served+' cars · score <b>'+st.score+'</b> · Best '+rec.best+'<br>'+(st.strikes>=3?'Gus: no.':'Pixel kept every heart receipt.'),
      text:'Last Booth: Gus made exact change for '+st.served+' cars. Score '+st.score+'. Doug the Goose got in the way.',
      path:'last-booth/',
      again:function(){fresh();}
    });
  }

  function loop(t){
    if(!loop.lt)loop.lt=t;
    var dt=Math.min(0.05,(t-loop.lt)/1000);
    loop.lt=t;
    step(dt);
    draw();
    raf=requestAnimationFrame(loop);
  }

  function begin(){
    if(booted)return;
    booted=true;
    fresh();
  }

  $('#coins').addEventListener('click',function(e){
    var b=e.target.closest('button');
    if(!b)return;
    addCoin(b.dataset.c);
  });
  $('#undo').addEventListener('click',undo);
  $('#clear').addEventListener('click',clearTray);
  $('#hand').addEventListener('click',hand);
  $('#shoo').addEventListener('click',shoo);
  addEventListener('keydown',function(e){
    if(!st||!st.on||e.repeat)return;
    var map={Digit1:100,Digit2:25,Digit3:10,Digit4:5,Digit5:1,Numpad1:100,Numpad2:25,Numpad3:10,Numpad4:5,Numpad5:1};
    if(map[e.code]){e.preventDefault();addCoin(map[e.code]);return;}
    if(e.code==='Backspace'){e.preventDefault();undo();return;}
    if(e.code==='KeyC'){clearTray();return;}
    if(e.code==='Enter'){e.preventDefault();hand();return;}
    if(e.code==='Space'){e.preventDefault();if(st.doug)shoo();}
  });

  XC.muteBtn();
  var hi=XC.get('booth');
  $('#hi').textContent=hi==null?'—':hi;
  requestAnimationFrame(loop);
  XC.title($('#stage'),{
    name:'LAST BOOTH',
    img:'../td/img/gus.png',
    how:'Build the change due with the coins, then hand it over. 1–5 on the keyboard, Enter to hand it over, Space to shoo Doug. Three cones and the lane closes. Pixel prints a heart receipt when you are exact.',
    best:hi,
    start:begin
  });
})();
