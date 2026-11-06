/* Graveyard Shift: Ceres — Work Order Shelter
   Fallout Shelter-style cutaway on haunted Ceres Station.
   Free X-COMIX Arcade game. © 2026 Petecastic Productions LLC */
(function(){
'use strict';
const SAVE='xca-ceres-v1';
const COLS=6, DECKS=6, ROOM_W=112, ROOM_H=88, LIFT_W=36, PAD=12;
const OFFLINE_CAP=2*3600; // 2h safe catch-up
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const rnd=()=>Math.random();
const pick=a=>a[Math.floor(rnd()*a.length)];
const fmt=n=>n>=1000?(n/1000).toFixed(1)+'k':String(Math.floor(n));
const now=()=>Date.now()/1000;

// —— ROOM TYPES ——
const ROOMS={
  breaker:{id:'breaker',name:'Main Breaker',icon:'⚡',res:'power',base:12,cost:0,desc:'Grid Amps. Scales with TECH.',color:'#2a6a8a',maxLvl:3,slots:2},
  diner:{id:'diner',name:'Deck 4 Diner',icon:'🥟',res:'grub',base:8,cost:80,desc:'Pierogies & plates. Scales with GRIT/COOK.',color:'#8a5a20',maxLvl:3,slots:2},
  scrubber:{id:'scrubber',name:'Air Scrubber Bay',icon:'💨',res:'air',base:8,cost:90,desc:'O₂ & coolant. Scales with SMART.',color:'#2a7a5a',maxLvl:3,slots:2},
  bunk:{id:'bunk',name:'Bunk Quarters',icon:'🛏',res:'beds',base:2,cost:60,desc:'Crew capacity & morale recovery.',color:'#3a4a6a',maxLvl:3,slots:2},
  med:{id:'med',name:'Med & Un-Haunt',icon:'✚',res:'heal',base:1,cost:120,desc:'Heals crew, clears spook stress.',color:'#6a2a4a',maxLvl:3,slots:2},
  workshop:{id:'workshop',name:'Tool & Coil Shop',icon:'🔧',res:'craft',base:1,cost:110,desc:'Craft flashlights, wrenches, salt-fuses.',color:'#5a4a2a',maxLvl:3,slots:2},
  security:{id:'security',name:'Security Airlock',icon:'🛡',res:'guard',base:1,cost:140,desc:'Guards top deck vs auditors & specters.',color:'#4a2a6a',maxLvl:3,slots:2},
  portal:{id:'portal',name:'PORT RICHMOND SUB',icon:'🌀',res:'portal',base:0,cost:200,desc:'Throw the main. Visitors drop in.',color:'#1a5a8a',maxLvl:1,slots:1}
};

// —— CREW ——
const CREW_DEFS={
  dom:{id:'dom',name:"Dom 'Breaker' DiNardo",short:'Dom',art:'dom',show:'Ceres',
    tech:9,smart:5,grit:7,cook:4,speed:5,line:"Throwin' the main. Everybody hold on.",
    banter:["Lady, you don't have a head.","Replace bulbs. Ignore the knocking.","Paperwork can wait."],role:'Foreman · TECH'},
  vivian:{id:'vivian',name:'Lt. Vivian Gray',short:'Vivian',art:'vivian',show:'Ceres',
    tech:4,smart:9,grit:4,cook:3,speed:5,line:'This is highly irregular.',
    banter:["No hard hat in a haunted zone. Citation.","Do sign here, Mr. DiNardo.","Ghost safety never sleeps."],role:'Ghost inspector · SMART'},
  tess:{id:'tess',name:'Big Tess',short:'Tess',art:'tess',show:'Ceres',
    tech:3,smart:4,grit:8,cook:9,speed:4,line:'Keep it hot.',
    banter:["Living get the cheesesteak. Dead get the smell.","Sit down, baby, you look haunted.","Order up."],role:'Deck 4 cook · GRIT/COOK'},
  rook:{id:'rook',name:'Rook',short:'Rook',art:'rook',show:'Ceres',
    tech:4,smart:5,grit:4,cook:2,speed:9,line:'Chat, are you SEEING this?',
    banter:["Rooktober Live, baby!","4,000 viewers. Worth dying for.","I'm streaming the dark decks."],role:'Apprentice runner · SPEED'},
  watt:{id:'watt',name:'WATT (Toolbox Unit 7)',short:'WATT',art:'watt',show:'Ceres',
    tech:8,smart:6,grit:3,cook:1,speed:6,line:'Beep. Can we go home?',
    banter:["Ghost! GHOST! ...Oh, it's a mop.","Toolbox Unit 7 requests a raise.","Spark happy."],role:'Spark bot · POWER boost'},
  mildred:{id:'mildred',name:'Mildred',short:'Mildred',art:'mildred',show:'Ceres',
    tech:2,smart:5,grit:3,cook:2,speed:7,line:'Mrrrow.',
    banter:["*knocks wrench into space*","*purrs through the wall*","Mrrrow."],role:'Ghost cat · calms haunt'},
  supervisor:{id:'supervisor',name:'The Shift Supervisor',short:'Supervisor',art:'supervisor',show:'Ceres',
    tech:5,smart:7,grit:5,cook:2,speed:3,line:'Attention crew. Clock in.',
    banter:["Nobody clocks out on Ceres.","Break's over. It's been over since 2190.","Work Order logged."],role:'PA ghost · ORDER boost'}
};
const GUESTS={
  nonna:{id:'nonna',name:'Nonna Rosa',short:'Nonna',art:'nonna',show:'Midnight Kitchen',
    tech:2,smart:4,grit:6,cook:10,speed:3,line:"Mangia! You're too skinny.",
    banter:["Three eggs, little salt, lotta love.","Recipe's on the last page, honey."],role:'Diner queen',buff:'diner'},
  marcus:{id:'marcus',name:"Chef Marcus 'Night Owl'",short:'Marcus',art:'marcus',show:'Midnight Kitchen',
    tech:3,smart:5,grit:6,cook:9,speed:5,line:"Night's young. Grill's hot.",
    banter:["Nonna, I seasoned it. Twice.","Order up, night owls."],role:'Line chef',buff:'diner'},
  gus:{id:'gus',name:'Gus',short:'Gus',art:'gus',show:'Toll Booth',
    tech:4,smart:5,grit:6,cook:3,speed:3,line:'no.',
    banter:["it's a goose, pixel.","i didn't throw mine out. it's in the vest."],role:'Toll lead',buff:'morale'},
  pixel:{id:'pixel',name:'Pixel',short:'Pixel',art:'pixel',show:'Toll Booth',
    tech:7,smart:6,grit:2,cook:1,speed:5,line:'HI BEST FRIEND!',
    banter:["BEST FRIENDS x3!","TOLL VIOLATION. BEST FRIEND DISCOUNT."],role:'Heart receipts',buff:'morale'},
  ruth:{id:'ruth',name:'Mama Ruth',short:'Ruth',art:'ruth',show:'Toll Booth',
    tech:3,smart:4,grit:8,cook:9,speed:3,line:'Eat. You look thin.',
    banter:["Breaker breaker, goose holding up the Turnpike.","Gus, honey…"],role:'Pierogi queen',buff:'diner'},
  rumple:{id:'rumple',name:'Lt. Rumple',short:'Rumple',art:'rumple',show:'Lt. Rumple',
    tech:3,smart:9,grit:5,cook:2,speed:4,line:'Just one more thing...',
    banter:["My wife, she loves your books.","Funny thing about the clock, sir."],role:'Shuts down audits',buff:'audit'},
  bartender1:{id:'bartender1',name:'Bartender One',short:'Barkeep 1',art:'bartender1',show:'Liberty Tavern',
    tech:2,smart:7,grit:4,cook:5,speed:4,line:"Pull up a stool, it's 1777.",
    banter:["Fun fact, footnote one.","Where are we today?"],role:'Historian',buff:'morale'},
  bartender2:{id:'bartender2',name:'Bartender Two',short:'Barkeep 2',art:'bartender2',show:'Liberty Tavern',
    tech:2,smart:6,grit:5,cook:5,speed:5,line:'Last call for liberty!',
    banter:["No, Ben, we don't have Wi-Fi.","Portal's open, hold your hats."],role:'Prankster historian',buff:'morale'}
};

const GEAR=[
  {id:'flashlight',name:'Arc Flashlight',cost:40,icon:'🔦',stat:'smart',bonus:1,desc:'Lights dark decks. +1 SMART'},
  {id:'wrench',name:'Arc Wrench',cost:55,icon:'🔧',stat:'tech',bonus:1,desc:'Breaker work. +1 TECH'},
  {id:'saltfuse',name:'Salt-Fuse Pack',cost:70,icon:'🧂',stat:'haunt',bonus:2,desc:'Clears specters faster'},
  {id:'hardhat',name:'Ceres Hard Hat',cost:45,icon:'⛑',stat:'grit',bonus:1,desc:'+1 GRIT, Vivian approves'},
  {id:'radio',name:'Deck Radio',cost:60,icon:'📻',stat:'speed',bonus:1,desc:'+1 SPEED on expeditions'}
];

const INCIDENT_TYPES=[
  {id:'fire',name:'Electrical Arc Fire',icon:'🔥',need:'tech',spread:true,line:'Arc fire on the deck!'},
  {id:'specter',name:'Dark-Deck Specter',icon:'👻',need:'smart',spread:true,line:'Something knocked from inside the wall.'},
  {id:'gremlin',name:'Vent Gremlin',icon:'🐀',need:'grit',spread:false,line:'Vent gremlins chewing the scrubbers!'},
  {id:'audit',name:'Mr. Pell Audit',icon:'📋',need:'smart',spread:false,line:'Per the audit, this station is closed.',pell:true}
];

const ORDERS=[
  {id:1,title:'Work Order #1 — Replace bulbs, Deck 9',need:{power:20},reward:100,line:'Ignore the knocking. Easy.'},
  {id:2,title:'Work Order #2 — Return to Sender',need:{grub:30,air:20},reward:160,line:'Package humming in the airlock.'},
  {id:3,title:'Work Order #3 — The Auditor',need:{crew:5,guard:1},reward:220,line:'Mr. Pell is alive. That is worse.'},
  {id:4,title:'Work Order #4 — Sunday Gravy',need:{grub:60},reward:200,line:'Tess says living get the cheesesteak.'},
  {id:5,title:'Work Order #5 — Dig Deck 4',need:{decks:4},reward:280,line:'Would you take this shift?'},
  {id:6,title:'Work Order #6 — Portal Charge',need:{portal:1},reward:300,line:'Throw the PORT RICHMOND SUB.'},
  {id:7,title:'Work Order #7 — Full Hab',need:{crew:8,happy:70},reward:400,line:'Nobody clocks out on Ceres.'}
];

const EXPEDITIONS=[
  {id:'deck9',name:'Sealed Deck 9',time:45,risk:.25,loot:['flashlight','scrip'],line:'Bulbs out. Knocking continues.'},
  {id:'core',name:'Ring-Hab Core',time:70,risk:.4,loot:['wrench','saltfuse','scrip'],line:'Coolant fog thick as pierogi steam.'},
  {id:'outer',name:'Outer Rock Spur',time:90,risk:.55,loot:['hardhat','radio','scrip'],line:'Vacuum on one side, ghosts on the other.'}
];

// —— STATE ——
let S, tab='build', selectedCrew=null, selectedRoom=null, buildPick=null;
let cam={x:0,y:0,scale:1}, dragging=false, lastP={x:0,y:0}, dragCrew=null;
let lastT=0, spd=1, started=false, tutorial=0;
let imgs={};
const canvas=$('#cv'), ctx=canvas.getContext('2d');

function newCrew(def, guest){
  return {
    id:def.id+(guest?('_'+Math.floor(rnd()*9999)):''),
    defId:def.id, name:def.name, short:def.short, art:def.art, show:def.show,
    tech:def.tech, smart:def.smart, grit:def.grit, cook:def.cook, speed:def.speed,
    hp:100, happiness:85, haunt:0, room:null, gear:[],
    guest:!!guest, buff:def.buff||null, line:def.line, banter:def.banter.slice(), role:def.role,
    xp:0, away:null
  };
}

function freshState(){
  const rooms=[];
  // Deck 0 (top): breaker | lift | bunk
  rooms.push(mkRoom('breaker',0,0,1));
  rooms.push(mkRoom('bunk',0,3,1));
  const crew=[newCrew(CREW_DEFS.dom), newCrew(CREW_DEFS.vivian), newCrew(CREW_DEFS.tess)];
  crew[0].room=rooms[0].uid; rooms[0].crew.push(crew[0].id);
  crew[2].room=rooms[1].uid; rooms[1].crew.push(crew[2].id);
  return {
    power:40, grub:30, air:30, scrip:280, happy:80,
    rooms, crew, unlockedDecks:1, liftTo:1,
    orderIdx:0, ordersDone:[],
    incidents:[], expeditions:[], log:[],
    portalCharge:0, guestsGot:[],
    gearInv:{flashlight:0,wrench:0,saltfuse:0,hardhat:0,radio:0},
    craftProg:0, shiftSec:0, ticks:0,
    lastSave:now(), version:1, tut:0
  };
}
function mkRoom(type,deck,col,w){
  return {uid:'r'+Math.random().toString(36).slice(2,9), type, deck, col, w:w||1, lvl:1, crew:[], rushCd:0, building:0};
}

function load(){
  let raw=null;
  try{raw=XC.get('ceres-v1')||JSON.parse(localStorage.getItem(SAVE))}catch(e){}
  if(!raw||!raw.rooms) return freshState();
  // Offline catch-up
  const elapsed=clamp((now()-(raw.lastSave||now())),0,OFFLINE_CAP);
  S=raw;
  if(elapsed>30){
    simOffline(elapsed);
    pushLog(`Safe shift summary: +${Math.floor(elapsed/60)}m offline (capped).`);
  }
  return S;
}
function save(){
  if(!S) return;
  S.lastSave=now();
  try{XC.set('ceres-v1',S); localStorage.setItem(SAVE,JSON.stringify(S))}catch(e){}
}

function simOffline(sec){
  // Coarse catch-up: resource ticks only, no new incidents
  const steps=Math.floor(sec/2);
  for(let i=0;i<steps;i++) tickResources(2);
  S.shiftSec+=sec;
}

function pushLog(msg){
  S.log.unshift({t:S.shiftSec,msg});
  if(S.log.length>40) S.log.pop();
  const el=$('#logLine'); if(el) el.textContent=msg;
}

function toast(msg){
  const t=$('#toast'); if(!t) return;
  t.textContent=msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t=setTimeout(()=>t.classList.remove('on'),2400);
}

function bubbleAt(x,y,text){
  const host=$('#bubbles'); if(!host) return;
  const b=document.createElement('div'); b.className='bubble'; b.textContent=text;
  b.style.left=x+'px'; b.style.top=y+'px';
  host.appendChild(b); setTimeout(()=>b.remove(),3200);
}

// —— LAYOUT HELPERS ——
function roomAt(deck,col){return S.rooms.find(r=>r.deck===deck && col>=r.col && col<r.col+r.w)}
function roomsOnDeck(deck){return S.rooms.filter(r=>r.deck===deck)}
function canPlace(type,deck,col,w){
  if(deck>=S.unlockedDecks) return false;
  if(col<0||col+w>COLS) return false;
  // can't overlap lift column  — lift is between col 2 and 3 visually; grid cols 0-5 all buildable, lift is center visual only
  for(let c=col;c<col+w;c++) if(roomAt(deck,c)) return false;
  return true;
}
function tryMerge(room){
  // merge adjacent same type same lvl
  const left=S.rooms.find(r=>r.deck===room.deck && r.type===room.type && r.lvl===room.lvl && r.col+r.w===room.col && r.w+room.w<=3);
  if(left){
    left.w+=room.w; left.crew=left.crew.concat(room.crew);
    S.rooms=S.rooms.filter(r=>r.uid!==room.uid);
    S.crew.forEach(c=>{if(c.room===room.uid)c.room=left.uid});
    return left;
  }
  const right=S.rooms.find(r=>r.deck===room.deck && r.type===room.type && r.lvl===room.lvl && room.col+room.w===r.col && r.w+room.w<=3);
  if(right){
    room.w+=right.w; room.crew=room.crew.concat(right.crew);
    S.rooms=S.rooms.filter(r=>r.uid!==right.uid);
    S.crew.forEach(c=>{if(c.room===right.uid)c.room=room.uid});
    return room;
  }
  return room;
}

function buildRoom(type,deck,col){
  const def=ROOMS[type]; if(!def) return false;
  const cost=def.cost*(1+(S.rooms.filter(r=>r.type===type).length)*0.35)|0;
  if(type!=='breaker' && S.scrip<cost){toast('Need more Contract Scrip'); return false}
  if(!canPlace(type,deck,col,1)){toast("Can't build there"); return false}
  if(type!=='breaker') S.scrip-=cost;
  let room=mkRoom(type,deck,col,1);
  S.rooms.push(room);
  room=tryMerge(room);
  selectedRoom=room.uid;
  pushLog(`Built ${def.name} on Deck ${deck+1}.`);
  sfx(520,.06); save(); renderPanel(); return true;
}

function excavate(){
  const cost=80+S.unlockedDecks*60;
  if(S.unlockedDecks>=DECKS){toast('All decks excavated'); return}
  if(S.scrip<cost){toast('Need '+cost+' scrip to dig'); return}
  S.scrip-=cost; S.unlockedDecks++; S.liftTo=S.unlockedDecks;
  pushLog(`Excavated Deck ${S.unlockedDecks}. Dark rock gives way.`);
  toast(`Deck ${S.unlockedDecks} open`);
  sfx(280,.1,'sawtooth'); save(); renderPanel();
}

function upgradeRoom(room){
  const def=ROOMS[room.type]; if(!def||room.lvl>=def.maxLvl) return;
  const cost=Math.floor(def.cost*0.8*room.lvl)+50*room.lvl;
  if(S.scrip<cost){toast('Need '+cost+' scrip'); return}
  S.scrip-=cost; room.lvl++;
  pushLog(`Upgraded ${def.name} to tier ${room.lvl}.`);
  sfx(660,.08); save(); renderPanel();
}

// —— CREW ASSIGNMENT ——
function assignCrew(crewId, roomUid){
  const c=S.crew.find(x=>x.id===crewId); if(!c||c.away) return;
  const room=S.rooms.find(r=>r.uid===roomUid); if(!room) return;
  const def=ROOMS[room.type];
  // unassign old
  if(c.room){
    const old=S.rooms.find(r=>r.uid===c.room);
    if(old) old.crew=old.crew.filter(id=>id!==c.id);
  }
  if(room.crew.length>=def.slots*room.w){
    // bump first
    const bump=room.crew.shift();
    const bc=S.crew.find(x=>x.id===bump); if(bc) bc.room=null;
  }
  room.crew.push(c.id); c.room=room.uid;
  // banter
  if(room.crew.length>=2){
    const other=S.crew.find(x=>x.id===room.crew.find(id=>id!==c.id));
    if(other && ((c.defId==='dom'&&other.defId==='vivian')||(c.defId==='vivian'&&other.defId==='dom'))){
      toast(pick(["Dom: 'Lady…' / Vivian: 'Highly irregular.'","Slow burn on Deck "+(room.deck+1)]));
    }
  }
  if(rnd()<0.45) speak(c);
  sfx(440,.05); save(); renderPanel();
}

function speak(c){
  const room=S.rooms.find(r=>r.uid===c.room);
  const rect=roomScreen(room||{deck:0,col:0,w:1});
  bubbleAt(rect.x+rect.w/2, rect.y+20, pick(c.banter.concat([c.line])));
}

function roomScreen(room){
  const layout=layoutMetrics();
  const x=layout.originX + room.col*ROOM_W*cam.scale + (room.col>=3?LIFT_W*cam.scale:0) + cam.x;
  const y=layout.originY + room.deck*ROOM_H*cam.scale + cam.y;
  return {x,y,w:room.w*ROOM_W*cam.scale, h:ROOM_H*cam.scale};
}

function layoutMetrics(){
  const totalW=COLS*ROOM_W+LIFT_W+PAD*2;
  const totalH=S.unlockedDecks*ROOM_H+PAD*2+40;
  return {totalW,totalH,originX:PAD,originY:30};
}

// —— PRODUCTION ——
function crewIn(room){return room.crew.map(id=>S.crew.find(c=>c.id===id)).filter(Boolean)}
function skillFor(room,c){
  const t=room.type;
  let s=1;
  if(t==='breaker') s=c.tech+(c.defId==='watt'?3:0);
  else if(t==='diner') s=c.cook*0.7+c.grit*0.3+(c.buff==='diner'?4:0);
  else if(t==='scrubber') s=c.smart;
  else if(t==='bunk') s=3;
  else if(t==='med') s=c.smart*0.6+c.grit*0.4;
  else if(t==='workshop') s=c.tech*0.7+c.smart*0.3;
  else if(t==='security') s=c.grit*0.6+c.smart*0.4;
  else if(t==='portal') s=c.tech;
  // gear
  c.gear.forEach(g=>{const gd=GEAR.find(x=>x.id===g); if(!gd)return;
    if(gd.stat==='tech'&&t==='breaker')s+=gd.bonus;
    if(gd.stat==='smart'&&(t==='scrubber'||t==='med'))s+=gd.bonus;
    if(gd.stat==='grit'&&(t==='diner'||t==='security'))s+=gd.bonus;
  });
  // mildred haunt calm
  if(c.defId==='mildred') room._mildred=true;
  return s;
}

function roomOutput(room){
  const def=ROOMS[room.type]; if(!def) return 0;
  const crew=crewIn(room); if(!crew.length && def.res!=='beds') return def.base*0.15*room.lvl*room.w;
  let skill=crew.reduce((a,c)=>a+skillFor(room,c),0)/Math.max(1,crew.length);
  const mergeBonus=1+(room.w-1)*0.35;
  return def.base*room.lvl*room.w*mergeBonus*(0.4+skill/10);
}

function totals(){
  let powerProd=0,powerNeed=0,grub=0,air=0,beds=0,guard=0;
  S.rooms.forEach(r=>{
    const out=roomOutput(r);
    powerNeed+=2*r.w*r.lvl;
    if(r.type==='breaker') powerProd+=out;
    if(r.type==='diner') grub+=out;
    if(r.type==='scrubber') air+=out;
    if(r.type==='bunk') beds+=2*r.w*r.lvl;
    if(r.type==='security') guard+=out;
  });
  // guest buffs
  S.crew.forEach(c=>{
    if(c.buff==='diner'&&c.room){const r=S.rooms.find(x=>x.uid===c.room); if(r&&r.type==='diner')grub+=4}
    if(c.buff==='morale') S._moraleBoost=(S._moraleBoost||0)+0.5;
  });
  return {powerProd,powerNeed,grub,air,beds,guard};
}

function tickResources(dt){
  const t=totals();
  S.power=clamp(S.power+(t.powerProd-t.powerNeed)*dt*0.15,0,200+t.powerProd*3);
  S.grub=clamp(S.grub+t.grub*dt*0.12 - S.crew.filter(c=>!c.away).length*dt*0.35,0,300);
  S.air=clamp(S.air+t.air*dt*0.12 - S.unlockedDecks*dt*0.4,0,300);
  // happiness
  let happyTarget=70;
  if(S.power<t.powerNeed*0.5) happyTarget-=25;
  if(S.grub<5) happyTarget-=20;
  if(S.air<5) happyTarget-=20;
  if(S.incidents.length) happyTarget-=10*S.incidents.length;
  happyTarget+= (S._moraleBoost||0)*3;
  S._moraleBoost=0;
  S.happy=clamp(S.happy+(happyTarget-S.happy)*dt*0.05,0,100);
  // bunk heal happiness + med heal
  S.rooms.forEach(r=>{
    const crew=crewIn(r);
    if(r.type==='bunk') crew.forEach(c=>{c.happiness=clamp(c.happiness+dt*2,0,100); c.haunt=clamp(c.haunt-dt*1.5,0,100)});
    if(r.type==='med') crew.forEach(c=>{c.hp=clamp(c.hp+dt*4,0,100); c.haunt=clamp(c.haunt-dt*5,0,100)});
    if(r._mildred){delete r._mildred; crew.forEach(c=>c.haunt=clamp(c.haunt-dt*3,0,100))}
  });
  // workshop craft
  const shops=S.rooms.filter(r=>r.type==='workshop'&&r.crew.length);
  if(shops.length){
    S.craftProg+=(shops.reduce((a,r)=>a+roomOutput(r),0))*dt*0.02;
    if(S.craftProg>=1){
      S.craftProg-=1;
      const g=pick(GEAR);
      S.gearInv[g.id]=(S.gearInv[g.id]||0)+1;
      pushLog(`Workshop finished a ${g.name}.`);
      toast('Crafted '+g.icon+' '+g.name);
    }
  }
  // hunger/air damage
  S.crew.forEach(c=>{
    if(c.away) return;
    if(S.grub<=0) c.hp=clamp(c.hp-dt*1.2,0,100);
    if(S.air<=0){c.hp=clamp(c.hp-dt*1.5,0,100); c.haunt=clamp(c.haunt+dt*2,0,100)}
    if(S.power<t.powerNeed*0.3 && c.room){
      const r=S.rooms.find(x=>x.uid===c.room);
      if(r && r.deck>=S.unlockedDecks-1) c.haunt=clamp(c.haunt+dt*1.5,0,100);
    }
  });
  // portal charge
  const portals=S.rooms.filter(r=>r.type==='portal');
  if(portals.length) S.portalCharge=clamp(S.portalCharge+dt*0.4,0,100);
}

// —— RUSH / INCIDENTS ——
function rush(room){
  if(room.rushCd>0){toast('Rush cooling down'); return}
  const risk=0.25+room.lvl*0.05+S.incidents.length*0.05;
  room.rushCd=18;
  if(rnd()>risk){
    const out=roomOutput(room)*8;
    if(room.type==='breaker') S.power=clamp(S.power+out,0,400);
    if(room.type==='diner') S.grub=clamp(S.grub+out,0,400);
    if(room.type==='scrubber') S.air=clamp(S.air+out,0,400);
    S.scrip+=10;
    toast('RUSH success! +'+Math.floor(out));
    sfx(780,.08); pushLog('RUSH cleared on '+ROOMS[room.type].name);
  } else {
    spawnIncident(room, rnd()<0.5?'fire':'specter');
    toast('RUSH failed — incident!');
    sfx(180,.15,'sawtooth');
  }
  save(); renderPanel();
}

function spawnIncident(room, typeId){
  const t=INCIDENT_TYPES.find(x=>x.id===typeId)||pick(INCIDENT_TYPES);
  // Rumple blocks audits
  if(t.pell && S.crew.some(c=>c.defId==='rumple'&&!c.away)){
    pushLog('Lt. Rumple: "Just one more thing..." Audit dismissed.');
    toast('Rumple shut down Mr. Pell!');
    return;
  }
  if(S.incidents.some(i=>i.room===room.uid)) return;
  S.incidents.push({id:'i'+Math.random().toString(36).slice(2,7), type:t.id, room:room.uid, hp:40+room.lvl*15, max:40+room.lvl*15, age:0});
  pushLog(t.line);
  toast(t.icon+' '+t.name);
  if(t.pell) speakPell();
}

function speakPell(){
  const img=imgs.pell; // just toast
  openModal(`<img class="av" src="art/pell.jpg" alt=""><h2>Mr. Pell — Audit</h2>
    <p>"Per the audit, this station is closed. Ghosts are not a line item."</p>
    <p>Drag your smartest crew into the airlock / incident room. Lt. Rumple dismisses audits automatically.</p>
    <div class="btns"><button class="btn" id="mOk">On it</button></div>`);
  $('#mOk').onclick=closeModal;
}

function tickIncidents(dt){
  S.incidents.slice().forEach(inc=>{
    inc.age+=dt;
    const room=S.rooms.find(r=>r.uid===inc.room);
    if(!room){S.incidents=S.incidents.filter(x=>x.id!==inc.id); return}
    const t=INCIDENT_TYPES.find(x=>x.id===inc.type);
    const crew=crewIn(room);
    let dmg=0;
    crew.forEach(c=>{
      let s=c[t.need]||3;
      if(c.gear.includes('saltfuse')&&(t.id==='specter'||t.id==='gremlin')) s+=3;
      dmg+=s*dt*1.8;
      c.hp=clamp(c.hp-dt*2,0,100);
      if(t.id==='specter') c.haunt=clamp(c.haunt+dt*3,0,100);
    });
    // security help
    S.rooms.filter(r=>r.type==='security').forEach(sec=>{
      crewIn(sec).forEach(c=>{dmg+=c.grit*dt*0.4});
    });
    inc.hp-=dmg;
    if(inc.hp<=0){
      S.incidents=S.incidents.filter(x=>x.id!==inc.id);
      S.scrip+=25; pushLog(t.name+' contained.'); toast('Contained '+t.icon); sfx(620,.08);
      return;
    }
    // spread
    if(t.spread && inc.age>12 && rnd()<0.002*dt*60){
      const neigh=S.rooms.filter(r=>r.deck===room.deck && Math.abs(r.col-room.col)<=room.w && r.uid!==room.uid);
      if(neigh.length) spawnIncident(pick(neigh), inc.type);
    }
    // timeout disaster
    if(inc.age>55){
      S.power=clamp(S.power-15,0,400); S.happy=clamp(S.happy-8,0,100);
      S.incidents=S.incidents.filter(x=>x.id!==inc.id);
      pushLog(t.name+' burned out — systems damaged.');
    }
  });
  // random spawns
  if(rnd()<0.0009*dt*60*spd && S.incidents.length<3){
    const candidates=S.rooms.filter(r=>r.type!=='portal');
    if(candidates.length){
      let type='specter';
      if(S.power<totals().powerNeed*0.5) type=pick(['fire','specter']);
      if(S.shiftSec>180 && rnd()<0.2) type='audit';
      if(S.air<10) type=pick(['gremlin','specter']);
      spawnIncident(pick(candidates), type);
    }
  }
}

// —— PORTAL ——
function throwPortal(){
  const portal=S.rooms.find(r=>r.type==='portal');
  if(!portal){toast('Build the PORT RICHMOND SUB first'); return}
  if(S.portalCharge<60 && S.scrip<80){toast('Need charge (60+) or 80 scrip'); return}
  if(S.portalCharge>=60) S.portalCharge-=60; else S.scrip-=80;
  const pool=Object.values(GUESTS).filter(g=>!S.guestsGot.includes(g.id)||rnd()<0.3);
  if(!pool.length){toast('Line went quiet'); return}
  const g=pick(pool);
  const c=newCrew(g,true);
  // beds check
  const beds=totals().beds;
  if(S.crew.filter(x=>!x.away).length>=Math.max(beds,3)){
    // still allow but happiness hit
    S.happy=clamp(S.happy-5,0,100);
  }
  S.crew.push(c); S.guestsGot.push(g.id);
  // park in portal room or bunk
  const bunk=S.rooms.find(r=>r.type==='bunk'&&r.crew.length<ROOMS.bunk.slots*r.w) || portal;
  assignCrew(c.id, bunk.uid);
  pushLog(`PORT RICHMOND SUB: ${g.name} drops in from ${g.show}.`);
  openModal(`<img class="av" src="art/${g.art}.jpg" alt=""><h2>${g.name}</h2>
    <p><i>${g.show}</i> · ${g.role}</p>
    <p>"${g.line}"</p>
    <p>Assign them to a room. ${g.buff==='diner'?'They supercharge the Deck 4 Diner!':g.buff==='audit'?'They shut down Mr. Pell audits!':'They boost station morale.'}</p>
    <div class="btns"><button class="btn good" id="mOk">Welcome aboard</button></div>`);
  $('#mOk').onclick=closeModal;
  sfx(900,.12,'triangle'); save(); renderPanel();
}

// —— EXPEDITIONS / WORK ORDERS ——
function startExpedition(exId, crewIds){
  const ex=EXPEDITIONS.find(x=>x.id===exId); if(!ex) return;
  if(crewIds.length<1||crewIds.length>2){toast('Send 1–2 crew'); return}
  const members=crewIds.map(id=>S.crew.find(c=>c.id===id)).filter(c=>c&&!c.away);
  if(members.length!==crewIds.length) return;
  members.forEach(c=>{
    if(c.room){const r=S.rooms.find(x=>x.uid===c.room); if(r)r.crew=r.crew.filter(id=>id!==c.id); c.room=null}
    c.away={ex:exId, left:ex.time, log:[`Departed for ${ex.name}.`]};
  });
  S.expeditions.push({id:'e'+Date.now(), ex:exId, crew:members.map(c=>c.id), left:ex.time});
  pushLog(`Dark-deck team headed to ${ex.name}.`);
  toast('Expedition launched'); sfx(300,.1); save(); renderPanel();
}

function tickExpeditions(dt){
  S.expeditions.slice().forEach(e=>{
    e.left-=dt;
    const ex=EXPEDITIONS.find(x=>x.id===e.ex);
    e.crew.forEach(id=>{
      const c=S.crew.find(x=>x.id===id); if(!c||!c.away) return;
      c.away.left=e.left;
      if(rnd()<0.01*dt) c.away.log.push(pick([
        'Footsteps in the vacuum.',
        'Found a fused breaker labeled "DO NOT".',
        'Mildred? No — something else.',
        ex.line,
        'Radio crackle. Supervisor hums.'
      ]));
    });
    if(e.left<=0){
      const success=rnd()>ex.risk*0.7;
      const members=e.crew.map(id=>S.crew.find(c=>c.id===id)).filter(Boolean);
      if(success){
        let scrip=40+Math.floor(rnd()*50);
        S.scrip+=scrip;
        const loot=pick(ex.loot);
        if(loot==='scrip') S.scrip+=30;
        else S.gearInv[loot]=(S.gearInv[loot]||0)+1;
        members.forEach(c=>{c.xp+=10; c.away=null; c.happiness=clamp(c.happiness+10,0,100)});
        pushLog(`Team returned from ${ex.name}. +${scrip} scrip`+(loot!=='scrip'?`, ${loot}`:''));
        toast('Expedition success');
      } else {
        members.forEach(c=>{c.hp=clamp(c.hp-25,10,100); c.haunt=clamp(c.haunt+20,0,100); c.away=null});
        S.scrip+=15;
        pushLog(`Team limped back from ${ex.name}. Rough shift.`);
        toast('Expedition rough — crew hurt');
      }
      // milestone ask
      if(rnd()<0.5) setTimeout(()=>openModal(`<h2>Would you take this shift?</h2><p>The Supervisor crackles over the PA. Another dark-deck Work Order waits.</p><div class="btns"><button class="btn good" id="mOk">Clock back in</button></div>`),400),
        setTimeout(()=>{const b=$('#mOk'); if(b)b.onclick=closeModal},500);
      S.expeditions=S.expeditions.filter(x=>x.id!==e.id);
      sfx(500,.1); save();
    }
  });
}

function checkOrders(){
  const o=ORDERS[S.orderIdx]; if(!o) return;
  if(S.ordersDone.includes(o.id)) return;
  const t=totals();
  const n=o.need; let ok=true;
  if(n.power && t.powerProd<n.power) ok=false;
  if(n.grub && S.grub<n.grub) ok=false;
  if(n.air && S.air<n.air) ok=false;
  if(n.crew && S.crew.length<n.crew) ok=false;
  if(n.guard && t.guard<n.guard) ok=false;
  if(n.decks && S.unlockedDecks<n.decks) ok=false;
  if(n.portal && !S.rooms.some(r=>r.type==='portal')) ok=false;
  if(n.happy && S.happy<n.happy) ok=false;
  // supervisor boost
  const boost=S.crew.some(c=>c.defId==='supervisor'&&c.room)?1.25:1;
  if(ok){
    S.ordersDone.push(o.id);
    const pay=Math.floor(o.reward*boost);
    S.scrip+=pay;
    pushLog(`${o.title} complete. +${pay} scrip. "${o.line}"`);
    toast('Work Order complete! +'+pay);
    openModal(`<h2>${o.title}</h2><p>${o.line}</p><p><b>+${pay} Contract Scrip</b></p><p><i>Would you take this shift?</i></p><div class="btns"><button class="btn good" id="mOk">Next Work Order</button></div>`);
    $('#mOk').onclick=()=>{closeModal(); if(S.orderIdx<ORDERS.length-1) S.orderIdx++; save(); renderPanel()};
    sfx(840,.12,'triangle');
  }
}

// —— EQUIP ——
function equipOn(crewId, gearId){
  const c=S.crew.find(x=>x.id===crewId); if(!c) return;
  if((S.gearInv[gearId]||0)<1){toast('None in inventory'); return}
  if(c.gear.length>=2){toast('Crew holds 2 items max — unequip first'); return}
  S.gearInv[gearId]--; c.gear.push(gearId);
  toast(`Equipped ${GEAR.find(g=>g.id===gearId).name}`);
  save(); renderPanel();
}
function unequip(crewId, gearId){
  const c=S.crew.find(x=>x.id===crewId); if(!c) return;
  const i=c.gear.indexOf(gearId); if(i<0) return;
  c.gear.splice(i,1); S.gearInv[gearId]=(S.gearInv[gearId]||0)+1;
  save(); renderPanel();
}

// —— UNLOCK STARTERS ——
function maybeUnlockCrew(){
  // Rook joins after 90s or first excavate
  if(!S.crew.some(c=>c.defId==='rook') && (S.shiftSec>90||S.unlockedDecks>=2)){
    const c=newCrew(CREW_DEFS.rook); S.crew.push(c);
    pushLog('Rook clocks in with a gimbal. "Rooktober Live!"');
    toast('Rook joined the crew');
  }
  if(!S.crew.some(c=>c.defId==='watt') && S.rooms.some(r=>r.type==='workshop')){
    const c=newCrew(CREW_DEFS.watt); S.crew.push(c);
    pushLog('WATT rolls out of the workshop. Beep.');
    toast('WATT joined');
  }
  if(!S.crew.some(c=>c.defId==='mildred') && S.unlockedDecks>=3){
    const c=newCrew(CREW_DEFS.mildred); S.crew.push(c);
    pushLog('Mildred phases through a bulkhead. Mrrrow.');
    toast('Mildred appeared');
  }
  if(!S.crew.some(c=>c.defId==='supervisor') && S.ordersDone.length>=2){
    const c=newCrew(CREW_DEFS.supervisor); S.crew.push(c);
    pushLog('PA crackles. The Shift Supervisor is… present.');
    toast('Supervisor on the PA');
  }
}

// —— RENDER CANVAS ——
function resize(){
  const wrap=$('#stageWrap'); if(!wrap) return;
  const r=wrap.getBoundingClientRect();
  const dpr=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.max(320,r.width*dpr);
  canvas.height=Math.max(240,r.height*dpr);
  canvas.style.width=r.width+'px'; canvas.style.height=r.height+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
function draw(){
  const w=canvas.clientWidth, h=canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  // starfield / rock
  const g=ctx.createLinearGradient(0,0,0,h);
  g.addColorStop(0,'#041018'); g.addColorStop(1,'#0a1820');
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  // stars
  ctx.fillStyle='#8cf';
  for(let i=0;i<40;i++){const sx=(i*97+cam.x*0.1)%w, sy=(i*53)%(h*0.4); ctx.globalAlpha=0.3+(i%5)*0.1; ctx.fillRect(sx,sy,2,2)}
  ctx.globalAlpha=1;
  // asteroid rock sides
  ctx.fillStyle='#1a1010';
  ctx.fillRect(0,h*0.35,18,h); ctx.fillRect(w-18,h*0.35,18,h);

  const sc=cam.scale;
  const ox=cam.x+PAD, oy=cam.y+30;

  // decks
  for(let d=0;d<S.unlockedDecks;d++){
    const y=oy+d*ROOM_H*sc;
    // deck plate
    ctx.fillStyle=d%2? '#0c222c':'#0a1c26';
    ctx.fillRect(ox, y, (COLS*ROOM_W+LIFT_W)*sc, ROOM_H*sc);
    // sodium / teal lights
    ctx.fillStyle='rgba(240,160,64,0.05)'; ctx.fillRect(ox,y,COLS*ROOM_W*sc+LIFT_W*sc,8*sc);
    // label
    ctx.fillStyle='#3a7a82'; ctx.font=`${10*sc}px system-ui`;
    ctx.fillText('DECK '+(d+1), ox+4, y+12*sc);
    // blackout flicker on deep decks if low power
    const t=totals();
    if(S.power<t.powerNeed*0.4 && d>=S.unlockedDecks-1){
      ctx.fillStyle=`rgba(0,0,0,${0.35+Math.sin(S.shiftSec*6)*0.1})`;
      ctx.fillRect(ox,y,(COLS*ROOM_W+LIFT_W)*sc,ROOM_H*sc);
    }
  }
  // unexcavated
  for(let d=S.unlockedDecks;d<DECKS;d++){
    const y=oy+d*ROOM_H*sc;
    ctx.fillStyle='#120808';
    ctx.fillRect(ox,y,(COLS*ROOM_W+LIFT_W)*sc,ROOM_H*sc);
    ctx.fillStyle='#3a2020'; ctx.font=`${11*sc}px system-ui`;
    ctx.fillText('· dark rock · excavate ·', ox+ROOM_W*sc, y+ROOM_H*sc/2);
  }

  // lift shaft
  const liftX=ox+3*ROOM_W*sc;
  ctx.fillStyle='#152830';
  ctx.fillRect(liftX, oy, LIFT_W*sc, S.unlockedDecks*ROOM_H*sc);
  ctx.strokeStyle='#2a8a8e'; ctx.lineWidth=2;
  ctx.strokeRect(liftX, oy, LIFT_W*sc, S.unlockedDecks*ROOM_H*sc);
  ctx.fillStyle='#7ef0d8'; ctx.font=`bold ${9*sc}px system-ui`;
  ctx.save(); ctx.translate(liftX+LIFT_W*sc/2, oy+20); ctx.rotate(-Math.PI/2);
  ctx.fillText('LIFT',0,0); ctx.restore();
  // lift car
  const carY=oy+((Math.floor(S.shiftSec/3)%S.unlockedDecks)*ROOM_H*sc)+10*sc;
  ctx.fillStyle='#3ad'; ctx.fillRect(liftX+4*sc, carY, (LIFT_W-8)*sc, 20*sc);

  // rooms
  S.rooms.forEach(room=>drawRoom(room, ox, oy, sc, w));

  // build ghost
  if(buildPick && buildPick.hover){
    const {deck,col}=buildPick.hover;
    const x=ox+col*ROOM_W*sc+(col>=3?LIFT_W*sc:0);
    const y=oy+deck*ROOM_H*sc;
    ctx.fillStyle=canPlace(buildPick.type,deck,col,1)?'rgba(80,220,180,0.25)':'rgba(220,60,60,0.25)';
    ctx.fillRect(x+2,y+2,ROOM_W*sc-4,ROOM_H*sc-4);
  }

  // incident markers already in rooms
  // selected crew follow cursor?
  if(dragCrew){
    const c=S.crew.find(x=>x.id===dragCrew);
    if(c){
      const img=imgs[c.art];
      const p=lastP;
      if(img) ctx.drawImage(img, p.x-16, p.y-16, 32, 32);
      else {ctx.fillStyle='#7ef'; ctx.beginPath(); ctx.arc(p.x,p.y,14,0,6.28); ctx.fill()}
    }
  }
}

function drawRoom(room, ox, oy, sc){
  const def=ROOMS[room.type];
  let x=ox+room.col*ROOM_W*sc; if(room.col>=3) x+=LIFT_W*sc;
  const y=oy+room.deck*ROOM_H*sc;
  const rw=room.w*ROOM_W*sc, rh=ROOM_H*sc;
  // body
  ctx.fillStyle=def.color;
  roundRect(ctx,x+2,y+4,rw-4,rh-8,6*sc); ctx.fill();
  ctx.strokeStyle=selectedRoom===room.uid?'#7ef0d8':'#0a1014';
  ctx.lineWidth=selectedRoom===room.uid?2.5:1;
  ctx.stroke();
  // tier pips
  for(let i=0;i<room.lvl;i++){ctx.fillStyle='#ffd'; ctx.fillRect(x+8+i*8*sc,y+8,5*sc,5*sc)}
  // title
  ctx.fillStyle='#e8fff8'; ctx.font=`bold ${11*sc}px system-ui`;
  ctx.fillText(def.icon+' '+def.name.slice(0, room.w===1?10:18), x+8, y+28*sc);
  // output hint
  ctx.fillStyle='#bde'; ctx.font=`${9*sc}px system-ui`;
  const out=roomOutput(room);
  if(def.res==='power') ctx.fillText('+'+out.toFixed(0)+' amps', x+8, y+42*sc);
  else if(def.res==='grub') ctx.fillText('+'+out.toFixed(0)+' grub', x+8, y+42*sc);
  else if(def.res==='air') ctx.fillText('+'+out.toFixed(0)+' O₂', x+8, y+42*sc);
  else if(def.res==='beds') ctx.fillText((2*room.w*room.lvl)+' beds', x+8, y+42*sc);
  else if(def.res==='portal') ctx.fillText('Charge '+Math.floor(S.portalCharge)+'%', x+8, y+42*sc);

  // crew portraits
  const crew=crewIn(room);
  crew.forEach((c,i)=>{
    const cx=x+10*sc+i*36*sc, cy=y+rh-40*sc;
    const img=imgs[c.art];
    ctx.save();
    ctx.beginPath(); ctx.arc(cx+14*sc, cy+14*sc, 14*sc, 0, 6.28); ctx.clip();
    if(img) ctx.drawImage(img, cx, cy, 28*sc, 28*sc);
    else {ctx.fillStyle='#456'; ctx.fillRect(cx,cy,28*sc,28*sc)}
    ctx.restore();
    ctx.strokeStyle=c.hp<40?'#f44':c.haunt>50?'#a6f':'#2a8';
    ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx+14*sc,cy+14*sc,14*sc,0,6.28); ctx.stroke();
  });

  // rush button zone indicator when selected
  if(selectedRoom===room.uid && ['breaker','diner','scrubber'].includes(room.type)){
    ctx.fillStyle='#f0a040'; ctx.font=`bold ${10*sc}px system-ui`;
    ctx.fillText(room.rushCd>0?`CD ${room.rushCd|0}`:'RUSH', x+rw-48*sc, y+18*sc);
  }

  // incident overlay
  const inc=S.incidents.find(i=>i.room===room.uid);
  if(inc){
    const t=INCIDENT_TYPES.find(x=>x.id===inc.type);
    ctx.fillStyle='rgba(180,30,30,0.35)';
    ctx.fillRect(x+2,y+4,rw-4,rh-8);
    ctx.fillStyle='#fff'; ctx.font=`bold ${14*sc}px system-ui`;
    ctx.fillText(t.icon, x+rw/2-8*sc, y+rh/2);
    // hp bar
    ctx.fillStyle='#300'; ctx.fillRect(x+10,y+rh-14,rw-20,6);
    ctx.fillStyle='#f44'; ctx.fillRect(x+10,y+rh-14,(rw-20)*(inc.hp/inc.max),6);
  }
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
}

// —— HUD ——
function updateHud(){
  const t=totals();
  $('#hPwr').textContent=Math.floor(S.power);
  const need=$('#hPwrNeed'); if(need) need.textContent=Math.floor(t.powerNeed);
  $('#hGrub').textContent=Math.floor(S.grub);
  $('#hAir').textContent=Math.floor(S.air);
  $('#hScrip').textContent=Math.floor(S.scrip);
  $('#hHappy').textContent=Math.floor(S.happy);
  const clk=$('#hClock');
  if(clk){
    const m=Math.floor(S.shiftSec/60), s=Math.floor(S.shiftSec%60);
    clk.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }
}

// —— PANEL UI ——
function renderPanel(){
  const p=$('#panel'); if(!p) return;
  if(tab==='build') p.innerHTML=panelBuild();
  else if(tab==='crew') p.innerHTML=panelCrew();
  else if(tab==='orders') p.innerHTML=panelOrders();
  else if(tab==='shop') p.innerHTML=panelShop();
  bindPanel();
}
function panelBuild(){
  const room=S.rooms.find(r=>r.uid===selectedRoom);
  let html=`<div class="cardb"><h4>Excavate Dark Deck</h4>
    <div class="meta">Open Deck ${(S.unlockedDecks+1)} · cost ${80+S.unlockedDecks*60} scrip</div>
    <button class="btn" id="btnDig" ${S.unlockedDecks>=DECKS?'disabled':''}>DIG DOWN</button></div>`;
  html+=`<div class="cardb"><h4>Build Room</h4><div class="meta">Tap a type, then tap an empty bay on a lit deck. Same rooms merge (2–3 wide).</div>`;
  Object.values(ROOMS).forEach(def=>{
    const owned=S.rooms.filter(r=>r.type===def.id).length;
    const cost=def.id==='breaker'&&owned? Math.floor(def.cost*(1+owned*0.35)) : (owned?Math.floor(def.cost*(1+owned*0.35)):def.cost);
    const label=def.id==='breaker'&&owned===0?'Built': (cost?cost+'🔩': 'free');
    html+=`<div class="row" style="margin:4px 0"><button class="btn ${buildPick&&buildPick.type===def.id?'good':''}" data-build="${def.id}">${def.icon} ${def.name}</button><span class="meta">${label}</span></div>`;
  });
  html+=`</div>`;
  if(room){
    const def=ROOMS[room.type];
    html+=`<div class="cardb ${S.incidents.some(i=>i.room===room.uid)?'incident':''}"><h4>${def.icon} ${def.name} · D${room.deck+1}</h4>
      <div class="meta">Tier ${room.lvl}/${def.maxLvl} · ${room.w}-wide · ${room.crew.length}/${def.slots*room.w} crew</div>
      <div class="row">
        <button class="btn" id="btnUp" ${room.lvl>=def.maxLvl?'disabled':''}>UPGRADE</button>
        ${['breaker','diner','scrubber'].includes(room.type)?`<button class="btn warn" id="btnRush">RUSH ${Math.floor(25+room.lvl*5)}%</button>`:''}
        ${room.type==='portal'?`<button class="btn good" id="btnPortal">THROW MAIN</button>`:''}
      </div>
      <div class="meta" style="margin-top:6px">Tap a crew chip, then this room — or drag portrait onto room.</div>
    </div>`;
  }
  return html;
}
function panelCrew(){
  let html=`<div class="cardb"><h4>Crew (${S.crew.length}) · Beds ${totals().beds}</h4>
    <div class="meta">Select, then tap a room to assign. ${selectedCrew?'Selected — tap a room.':'No one selected.'}</div></div>`;
  S.crew.forEach(c=>{
    const room=S.rooms.find(r=>r.uid===c.room);
    const away=c.away?` · away ${Math.ceil(c.away.left)}s`:'';
    html+=`<div class="crewchip ${selectedCrew===c.id?'sel':''}" data-crew="${c.id}">
      <img src="art/${c.art}.jpg" alt="">
      <div style="flex:1"><div class="nm">${c.short}${c.guest?' ✈':''}</div>
      <div class="st">${c.role}${room?' · '+ROOMS[room.type].name:''}${away}</div>
      <div class="bar hp"><i style="width:${c.hp}%"></i></div>
      <div class="bar ha"><i style="width:${100-c.haunt}%"></i></div>
      </div></div>`;
  });
  return html;
}
function panelOrders(){
  const o=ORDERS[S.orderIdx];
  let html=`<div class="cardb"><h4>Active Work Order</h4>`;
  if(o && !S.ordersDone.includes(o.id)){
    html+=`<div class="nm">${o.title}</div><div class="meta">${o.line}</div>
      <div class="meta">Reward ${o.reward}🔩 ${S.crew.some(c=>c.defId==='supervisor')?'(+Supervisor boost)':''}</div>
      <div class="meta">Need: ${JSON.stringify(o.need)}</div>`;
  } else html+=`<div class="meta">All listed Work Orders cleared. Keep the station alive.</div>`;
  html+=`</div><div class="cardb"><h4>Dark-Deck Expeditions</h4><div class="meta">Send 1–2 selected crew into sealed sectors.</div>`;
  EXPEDITIONS.forEach(ex=>{
    html+=`<div class="row" style="margin:6px 0"><button class="btn" data-ex="${ex.id}">${ex.name}</button><span class="meta">${ex.time}s · risk ${Math.floor(ex.risk*100)}%</span></div>`;
  });
  html+=`</div>`;
  // live expedition logs
  S.crew.filter(c=>c.away).forEach(c=>{
    html+=`<div class="cardb"><h4>${c.short} — live log</h4>`;
    (c.away.log||[]).slice(-4).forEach(l=>html+=`<div class="meta">• ${l}</div>`);
    html+=`</div>`;
  });
  html+=`<div class="cardb"><h4>Completed</h4><div class="meta">${S.ordersDone.map(id=>'#'+id).join(', ')||'—'}</div></div>`;
  return html;
}
function panelShop(){
  let html=`<div class="cardb"><h4>Gear Locker</h4><div class="meta">Crafted in Tool & Coil Workshop, or found on expeditions. Equip from crew select.</div>`;
  GEAR.forEach(g=>{
    html+=`<div class="row" style="margin:4px 0;justify-content:space-between">
      <span>${g.icon} <b>${g.name}</b> ×${S.gearInv[g.id]||0}</span>
      <button class="btn" data-buy="${g.id}" ${S.scrip<g.cost?'disabled':''}>Buy ${g.cost}🔩</button>
    </div><div class="meta">${g.desc}</div>`;
  });
  html+=`</div>`;
  if(selectedCrew){
    const c=S.crew.find(x=>x.id===selectedCrew);
    if(c){
      html+=`<div class="cardb"><h4>Equip → ${c.short}</h4>`;
      GEAR.forEach(g=>{
        if((S.gearInv[g.id]||0)>0) html+=`<button class="btn" data-eq="${g.id}" style="margin:3px">${g.icon} Equip</button>`;
      });
      c.gear.forEach(id=>{
        const g=GEAR.find(x=>x.id===id);
        html+=`<button class="btn bad" data-uneq="${id}" style="margin:3px">Unequip ${g.icon}</button>`;
      });
      html+=`</div>`;
    }
  }
  return html;
}
function bindPanel(){
  $$('[data-build]').forEach(b=>b.onclick=()=>{
    buildPick={type:b.dataset.build, hover:null};
    toast('Tap an empty bay to build '+ROOMS[b.dataset.build].name);
    renderPanel();
  });
  const dig=$('#btnDig'); if(dig) dig.onclick=excavate;
  const up=$('#btnUp'); if(up) up.onclick=()=>{const r=S.rooms.find(x=>x.uid===selectedRoom); if(r) upgradeRoom(r)};
  const rushB=$('#btnRush'); if(rushB) rushB.onclick=()=>{const r=S.rooms.find(x=>x.uid===selectedRoom); if(r) rush(r)};
  const portal=$('#btnPortal'); if(portal) portal.onclick=throwPortal;
  $$('[data-crew]').forEach(el=>el.onclick=()=>{
    selectedCrew=el.dataset.crew; buildPick=null;
    toast(S.crew.find(c=>c.id===selectedCrew).short+' selected — tap a room');
    renderPanel();
  });
  $$('[data-ex]').forEach(b=>b.onclick=()=>{
    if(!selectedCrew){toast('Select crew first'); return}
    const ids=[selectedCrew];
    // if another selected via multi — for now just 1, allow second if last clicked different stored
    startExpedition(b.dataset.ex, ids);
  });
  $$('[data-buy]').forEach(b=>b.onclick=()=>{
    const g=GEAR.find(x=>x.id===b.dataset.buy); if(!g||S.scrip<g.cost) return;
    S.scrip-=g.cost; S.gearInv[g.id]=(S.gearInv[g.id]||0)+1; save(); renderPanel(); updateHud();
  });
  $$('[data-eq]').forEach(b=>b.onclick=()=>equipOn(selectedCrew,b.dataset.eq));
  $$('[data-uneq]').forEach(b=>b.onclick=()=>unequip(selectedCrew,b.dataset.uneq));
}

// —— INPUT ——
function canvasPos(e){
  const r=canvas.getBoundingClientRect();
  const pt=e.touches?e.touches[0]:e.changedTouches?e.changedTouches[0]:e;
  return {x:(pt.clientX-r.left), y:(pt.clientY-r.top)};
}
function hitRoom(p){
  const sc=cam.scale, ox=cam.x+PAD, oy=cam.y+30;
  for(const room of S.rooms){
    let x=ox+room.col*ROOM_W*sc; if(room.col>=3) x+=LIFT_W*sc;
    const y=oy+room.deck*ROOM_H*sc;
    if(p.x>=x && p.x<=x+room.w*ROOM_W*sc && p.y>=y && p.y<=y+ROOM_H*sc) return room;
  }
  return null;
}
function hitCrewPortrait(p){
  const sc=cam.scale, ox=cam.x+PAD, oy=cam.y+30;
  for(const room of S.rooms){
    let x=ox+room.col*ROOM_W*sc; if(room.col>=3) x+=LIFT_W*sc;
    const y=oy+room.deck*ROOM_H*sc;
    const crew=crewIn(room);
    for(let i=0;i<crew.length;i++){
      const cx=x+10*sc+i*36*sc, cy=y+ROOM_H*sc-40*sc;
      const dx=p.x-(cx+14*sc), dy=p.y-(cy+14*sc);
      if(dx*dx+dy*dy < (16*sc)*(16*sc)) return crew[i];
    }
  }
  return null;
}
function gridAt(p){
  const sc=cam.scale, ox=cam.x+PAD, oy=cam.y+30;
  const deck=Math.floor((p.y-oy)/(ROOM_H*sc));
  if(deck<0||deck>=S.unlockedDecks) return null;
  let x=p.x-ox;
  // skip lift
  let col;
  if(x < 3*ROOM_W*sc) col=Math.floor(x/(ROOM_W*sc));
  else if(x < 3*ROOM_W*sc+LIFT_W*sc) return null;
  else col=3+Math.floor((x-3*ROOM_W*sc-LIFT_W*sc)/(ROOM_W*sc));
  if(col<0||col>=COLS) return null;
  return {deck,col};
}

let downP={x:0,y:0}, panMoved=0;
function onDown(e){
  if(!started) return;
  e.preventDefault();
  const p=canvasPos(e); lastP=p; downP=p; panMoved=0;
  const c=hitCrewPortrait(p);
  if(c){ dragCrew=c.id; selectedCrew=c.id; dragging=false; canvas.classList.add('drag'); return}
  dragging=true; canvas.classList.add('drag');
}
function onMove(e){
  if(!started) return;
  const p=canvasPos(e);
  if(dragCrew){ lastP=p; return}
  if(dragging){
    cam.x+=p.x-lastP.x; cam.y+=p.y-lastP.y;
    panMoved+=Math.hypot(p.x-lastP.x,p.y-lastP.y);
    lastP=p;
  }
  if(buildPick){ buildPick.hover=gridAt(p) }
}
function onUp(e){
  if(!started) return;
  const ev=e.changedTouches?e:e;
  const p=canvasPos(ev);
  canvas.classList.remove('drag');
  if(dragCrew){
    const room=hitRoom(p);
    if(room) assignCrew(dragCrew, room.uid);
    dragCrew=null; dragging=false; return;
  }
  const wasDrag=dragging; dragging=false;
  if(wasDrag && panMoved>8) return; // pan only
  // click
  if(buildPick){
    const g=gridAt(p);
    if(g){ buildRoom(buildPick.type,g.deck,g.col); buildPick=null; }
    return;
  }
  const room=hitRoom(p);
  if(room){
    if(selectedCrew){ assignCrew(selectedCrew, room.uid); selectedCrew=null; }
    else { selectedRoom=room.uid; }
    renderPanel(); return;
  }
}

// —— MODAL / HELP / CODEX ——
function openModal(html){ const m=$('#modal'), box=$('#mbox'); m.hidden=false; box.innerHTML=html }
function closeModal(){ $('#modal').hidden=true }
function showHelp(){
  openModal(`<h2>How to run Ceres</h2>
    <p><b>Build</b> rooms on lit decks. Matching neighbors <b>merge</b> into wider bays (classic vault style).</p>
    <p><b>Assign crew</b> by tapping a chip then a room, or dragging their portrait.</p>
    <p>Keep <b>⚡ Power</b>, <b>🥟 Grub</b>, and <b>💨 Air</b> above zero. Earn <b>🔩 Scrip</b> from Work Orders &amp; surviving shifts.</p>
    <p><b>RUSH</b> a production room for a burst — or spark an Arc Fire / Specter.</p>
    <p>Build the <b>PORT RICHMOND SUB</b> and throw the main to recruit Nonna, Gus, Rumple &amp; more.</p>
    <p>No gems. No energy. No ads. Would you take this shift?</p>
    <div class="btns"><button class="btn" id="mOk">Clock in</button></div>`);
  $('#mOk').onclick=closeModal;
}
function showCodex(){
  let html=`<h2>Crew Codex</h2>`;
  S.crew.forEach(c=>{
    html+=`<div class="crewchip" style="cursor:default"><img src="art/${c.art}.jpg"><div>
      <div class="nm">${c.name}</div><div class="st">${c.show} · ${c.role}</div>
      <div class="st">TECH ${c.tech} · SMART ${c.smart} · GRIT ${c.grit} · COOK ${c.cook} · SPD ${c.speed}</div>
      <div class="st">"${c.line}"</div></div></div>`;
  });
  html+=`<div class="btns"><button class="btn" id="mOk">Close</button></div>`;
  openModal(html); $('#mOk').onclick=closeModal;
}

function sfx(f,d,type){ try{ XC.sfx(f,d,type||'square') }catch(e){} }

// —— TUTORIAL ——
function tickTutorial(){
  if(S.tut>=4) return;
  if(S.tut===0 && S.shiftSec>3){
    S.tut=1;
    openModal(`<h2>Work Order #0</h2><p>Foreman Dom is on the Main Breaker. Tess is in the bunks warming up for the Deck 4 Diner.</p>
      <p>Build a <b>Deck 4 Diner</b> and an <b>Air Scrubber</b>, then assign crew.</p>
      <div class="btns"><button class="btn good" id="mOk">Got it</button></div>`);
    $('#mOk').onclick=closeModal;
  } else if(S.tut===1 && S.rooms.some(r=>r.type==='diner')){
    S.tut=2; toast('Assign Tess to the Diner — tap her, tap the room');
  } else if(S.tut===2 && S.rooms.some(r=>r.type==='diner'&&r.crew.length)){
    S.tut=3; toast('Dig down when you can. Dark decks hide Work Orders.');
  } else if(S.tut===3 && S.unlockedDecks>=2){
    S.tut=4; pushLog('Would you take this shift?');
  }
}

// —— LOOP ——
function frame(t){
  if(!started){ requestAnimationFrame(frame); return }
  if(!lastT) lastT=t;
  let dt=Math.min(0.05,(t-lastT)/1000)*spd; lastT=t;
  S.shiftSec+=dt; S.ticks++;
  // rush cooldowns
  S.rooms.forEach(r=>{if(r.rushCd>0)r.rushCd=Math.max(0,r.rushCd-dt)});
  tickResources(dt);
  tickIncidents(dt);
  tickExpeditions(dt);
  maybeUnlockCrew();
  if(S.ticks%30===0) checkOrders();
  tickTutorial();
  if(S.ticks%60===0) save();
  // random banter
  if(rnd()<0.0015*dt*60){
    const talking=S.crew.filter(c=>c.room&&!c.away);
    if(talking.length) speak(pick(talking));
  }
  updateHud();
  draw();
  requestAnimationFrame(frame);
}

// —— BOOT ——
function preload(cb){
  const keys=['dom','vivian','tess','rook','watt','mildred','supervisor','pell','nonna','marcus','gus','pixel','ruth','rumple','bartender1','bartender2'];
  let left=keys.length;
  keys.forEach(k=>{
    const im=new Image();
    im.onload=im.onerror=()=>{imgs[k]=im; if(--left<=0) cb()};
    im.src='art/'+k+'.jpg';
  });
}

function bindChrome(){
  $$('.tab').forEach(t=>t.onclick=()=>{tab=t.dataset.t; $$('.tab').forEach(x=>x.classList.toggle('on',x===t)); renderPanel()});
  const spdB=$('#btnSpd');
  if(spdB) spdB.onclick=()=>{spd=spd===1?2:spd===2?3:1; spdB.textContent=spd+'×'};
  const snd=$('#btnSnd');
  if(snd){ snd.textContent=XC.muted?'🔇':'🔊'; snd.onclick=()=>{XC.muted=!XC.muted; try{XC.set('muted',XC.muted)}catch(e){} snd.textContent=XC.muted?'🔇':'🔊'; sfx(660)} }
  const help=$('#btnHelp'); if(help) help.onclick=showHelp;
  const codex=$('#btnCodex'); if(codex) codex.onclick=showCodex;

  canvas.addEventListener('pointerdown',onDown);
  window.addEventListener('pointermove',onMove);
  window.addEventListener('pointerup',onUp);
  canvas.addEventListener('touchstart',onDown,{passive:false});
  canvas.addEventListener('touchmove',e=>{onMove(e); e.preventDefault()},{passive:false});
  canvas.addEventListener('touchend',onUp,{passive:false});
  // wheel zoom
  canvas.addEventListener('wheel',e=>{
    e.preventDefault();
    cam.scale=clamp(cam.scale*(e.deltaY>0?0.9:1.1),0.55,1.6);
  },{passive:false});
  window.addEventListener('resize',()=>{resize();});
}

function startGame(){
  const st=$('#start'); if(st) st.style.display='none';
  started=true; lastT=0;
  try{ XC.ac=XC.ac||new(window.AudioContext||window.webkitAudioContext)(); XC.ac.resume&&XC.ac.resume() }catch(e){}
  resize(); renderPanel(); updateHud();
  pushLog('Attention crew. Clock in.');
  sfx(440,.1);
  if(!S.tut) setTimeout(()=>tickTutorial(),800);
}

function boot(){
  S=load();
  bindChrome();
  preload(()=>{ /* portraits ready */ });
  // start on pointerdown/touchstart/click
  const btn=$('#startBtn'), gate=$('#start');
  const go=e=>{e.preventDefault(); startGame()};
  if(btn){
    if(window.PointerEvent) btn.addEventListener('pointerdown',go);
    btn.addEventListener('touchstart',go,{passive:false});
    btn.addEventListener('click',go);
  }
  // also whole gate
  if(gate){
    if(window.PointerEvent) gate.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.target===gate||e.target.closest('.card'))go(e)});
  }
  requestAnimationFrame(frame);
  // autosave on hide
  document.addEventListener('visibilitychange',()=>{if(document.hidden) save()});
  window.addEventListener('beforeunload',save);
}

boot();
window.__CERES__={get:()=>S,save,throwPortal,spawnIncident:(r,ty)=>spawnIncident(S.rooms.find(x=>x.uid===r)||S.rooms[0],ty),rush,assignCrew,buildRoom,excavate,totals};
})();
