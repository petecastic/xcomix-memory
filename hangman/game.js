const W=[
["CAST","KRAMPUS"],["CAST","BIG WALT"],["CAST","FATHER RAY"],["CAST","LINDA PFISTER"],["CAST","MARJORIE"],["CAST","NANA DOT"],["CAST","OFFICER TIM"],["CAST","OVERMIND"],["CAST","ROZ PAK"],["CAST","TONY TWO TRUCKS"],["CAST","BUCKY THE GOOSE"],["CAST","THE TABBY"],["CAST","ZIB"],["CAST","KYLE"],["CAST","DEB"],["CAST","SAL"],
["PLACE","MILL STREET"],["PLACE","SALS HOAGIES"],["PLACE","THE 3 AM VALLEY"],["PLACE","LIBERTY TAVERN"],["PLACE","LEVITTOWN DINER"],["PLACE","OTTER STREET"],["PLACE","RADCLIFFE STREET"],["PLACE","SYCAMORE STREET"],["PLACE","THE TURNPIKE"],
["SHOW","TOLL BOOTH NIGHT SHIFT"],["SHOW","NITRO GRID"],["SHOW","STINK PATROL"],["SHOW","GRAVEYARD SHIFT CERES"],["SHOW","LIL SPANKY"],["SHOW","SIGNAL LOST"],["SHOW","WILD FILES"],["SHOW","ECHOES OF THE RED HORIZON"],["SHOW","ONIGIRI SQUAD"],["SHOW","TIMELINE CLASSIFIEDS"],["SHOW","TRAIL TROUBLE"],
["SAID IT","POINT OF ORDER"],["SAID IT","COPY EATING"],["SAID IT","BLESS THIS BUCKET TRUCK"],["SAID IT","SOFT PRETZEL MUSTARD NO QUESTIONS"],["SAID IT","COFFEE ISLANDS NEUTRAL GROUND"],["SAID IT","PLUG IT IN JUST ONCE"],["SAID IT","ORIGINAL RECIPE NOT TELLING"],["SAID IT","TRUCK 4 YOURE ON"],["SAID IT","OKAY MAAM FOR COMPLIANCE"],
["VALLEY LORE","CIRCUIT 13"],["VALLEY LORE","THE MILL CLOCK"],["VALLEY LORE","WE NEVER CLOSE"]];
const $=XC.$,stage=$('#stage');let word,cat,got,miss,mode,streak=XC.get('hang-streak')||0,done;
const PIECES=['🥖','🧀','🥬','🍅','🧅','🥖'];
function pick(m){mode=m;const r=m==='daily'?XC.rng('hang'+XC.today()):Math.random;[cat,word]=W[Math.floor(r()*W.length)];got=new Set();miss=0;done=false;draw();}
function draw(){
 $('#cat').textContent=cat;$('#miss').textContent=miss+'/6';$('#streak').textContent=streak;
 $('#word').innerHTML=word.split(' ').map(w=>'<span class="w">'+[...w].map(c=>/[A-Z]/.test(c)?`<i class="${got.has(c)?'on':''}">${got.has(c)||done?c:''}</i>`:`<i class="on">${c}</i>`).join('')+'</span>').join('');
 $('#hoagie').innerHTML=PIECES.map((p,i)=>`<span class="${i<miss?'gone':''}">${p}</span>`).join('');
 const g=$('#goose');g.style.left=(4+miss*13)+'%';g.src='../arcade/art/'+(miss>=6?'bucky_honk':'bucky')+'.jpg';
 $('#kb').innerHTML=[...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(c=>`<button data-k="${c}" ${got.has(c)?'disabled class="'+(word.includes(c)?'hit':'no')+'"':''}>${c}</button>`).join('');
}
function guess(c){if(done||got.has(c))return;got.add(c);if(word.includes(c))XC.sfx(880);else{miss++;XC.sfx(140,.2,'sawtooth');}
 const win=[...word].every(ch=>!/[A-Z]/.test(ch)||got.has(ch));draw();
 if(win||miss>=6){done=true;draw();if(win){streak++;XC.sfx(1320,.3)}else streak=0;XC.set('hang-streak',streak);const b=XC.best('hang-best',streak);
  setTimeout(()=>XC.over({img:'../arcade/art/'+(win?'bear_pant':'bucky_honk')+'.jpg',title:win?'SAVED THE HOAGIE!':'HONK.',stats:`${cat}: <b>${word}</b><br>${win?'Misses '+miss+'/6':'Bucky the Goose ate Sal\'s hoagie.'}<br>Streak ${streak} · Best ${b.best}`,text:win?`I saved Sal's hoagie from Bucky the Goose in X-COMIX Hangman (${mode}, ${miss} misses, streak ${streak}). Can you?`:`Bucky the Goose ate my hoagie in X-COMIX Hangman. Your turn.`,path:'hangman/',againLabel:'Next word',again:()=>pick('random')}),500)}}
$('#kb').onclick=e=>{const b=e.target.closest('button[data-k]');if(b)guess(b.dataset.k)};
addEventListener('keydown',e=>{const k=e.key.toUpperCase();if(/^[A-Z]$/.test(k))guess(k)});
XC.muteBtn();pick('daily');
XC.title(stage,{name:'HANGMAN',img:'../arcade/art/bucky.jpg',how:'Guess the 3 AM Valley word before Bucky the Goose steals all 6 pieces of Sal\'s hoagie.',best:XC.get('hang-best'),extra:'<div class="pick"><button class="on" data-k="d">TODAY\'S WORD</button><button data-k="r">RANDOM</button></div>',start:()=>{}}).addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(b){pick(b.dataset.k==='d'?'daily':'random');e.currentTarget.remove()}});
