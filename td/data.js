/* 12:49 Defense - data. X-COMIX Multiverse. */
var TD_DATA=(function(){
function mul(k,v){return function(s){s[k]*=v;};}
function add(k,v){return function(s){s[k]=(s[k]||0)+v;};}
function set(k,v){return function(s){s[k]=v;};}
function all(){var f=arguments;return function(s){for(var i=0;i<f.length;i++)f[i](s);};}
var TOWERS=[
{id:'pete',n:'Pete the Cable Guy',show:'X-COMIX Multiverse',img:'peter',col:'#d64b2a',lv:1,cost:120,
 kind:'proj',dmg:3,rate:1.4,range:120,pierce:1,air:1,proj:'splitter',
 line:'Hear me out.',lines:['Hear me out.',"Let's go.",'Ladder goes on the house, not the pole.'],
 about:'The real Peter: a cable tech on the drop side. Throws splitters from the coffee can.',
 paths:[
  {n:'Good Kind Splitter',u:[
   {n:'2-Way Split',c:90,d:'Splitters burst into 2 shards on hit.',f:set('split',2)},
   {n:'4-Way Split',c:210,d:'4 shards, +1 damage.',f:all(set('split',4),add('dmg',1))},
   {n:'The Good Kind',c:680,d:"Uncle Gene's can: 8 shards that pierce 2. Main hit +3.",f:all(set('split',8),set('splitPierce',2),add('dmg',3),add('splitDmg',2))}]},
  {n:'Ladder Up',u:[
   {n:'Ladder on the House',c:80,d:'+40 range.',f:add('range',40)},
   {n:'Bear Rides Along',c:230,d:'Bear sniffs out hidden enemies (camo) and finds dropped hoagies: +$1 per shoo.',f:all(set('detect',1),add('cashPerKill',1),set('bear',1))},
   {n:'Drop Line',c:720,d:'Throws 2.2x faster. +3 damage, pierce 3.',f:all(mul('rate',2.2),add('dmg',3),set('pierce',3))}]}
 ]},
{id:'krampus',n:'Krampus Kornelius',show:'Krampus (Multiverse)',img:'krampus',col:'#e0b21c',lv:1,cost:200,
 kind:'pulse',dmg:4,rate:0.7,range:85,air:0,
 line:'Okay ma\'am. For compliance.',lines:['...wit\' mustard?','Okay ma\'am. For compliance.','I felt heat like a bad secondary.'],
 about:'The lineman moose. Stomps out a recloser pulse that hits every ground enemy around him.',
 paths:[
  {n:'Recloser',u:[
   {n:'Fast Reclose',c:150,d:'Pulses 40% faster.',f:mul('rate',1.4)},
   {n:'Three-Shot Reclose',c:330,d:'Each pulse recloses twice more (3 hits).',f:set('repeat',3)},
   {n:'Lockout',c:900,d:'Last reclose locks out: +10 damage and a 0.8s stun.',f:all(set('lockout',1),add('dmg',2))}]},
  {n:'Wit\' Mustard',u:[
   {n:'Soft Pretzel',c:120,d:'Also lobs a soft pretzel (6 dmg, hits air) at the lead enemy.',f:set('pretzel',6)},
   {n:'Extra Mustard',c:270,d:'Pretzels splash and mustard slows 30%.',f:all(set('pretzelSplash',45),add('pretzel',4))},
   {n:'Chain Collar',c:760,d:'Pulses knock enemies back and strip 2 armor. "For compliance."',f:all(set('knock',28),set('strip',2))}]}
 ]},
{id:'marjorie',n:'Marjorie & The Tabby',show:'X-COMIX Multiverse',img:'marjorie',img2:'tabby',col:'#2b4f8f',lv:1,cost:150,
 kind:'proj',dmg:1,rate:1.0,range:130,pierce:1,air:1,proj:'citation',slow:0.4,slowT:1.6,
 line:'This is highly irregular.',lines:['Goodness.','This is highly irregular.','*chomp* Evidence.'],
 about:'Utility safety inspector with a carbon citation pad. Cited enemies slow down to read it.',
 paths:[
  {n:'Highly Irregular',u:[
   {n:'Carbon Copies',c:120,d:'Cites 3 enemies at once.',f:set('multi',3)},
   {n:'Goodness.',c:260,d:'Slow 60% for 2.2s.',f:all(set('slow',0.6),set('slowT',2.2))},
   {n:'Cease & Desist',c:820,d:'Every 6s freezes everything in range for 1.5s (bosses 0.5s).',f:set('freeze',6)}]},
  {n:'*chomp* Evidence',u:[
   {n:'Tabby on Patrol',c:140,d:'The Tabby eats the carbon: each citation strips 1 armor (up to 3).',f:set('stripHit',1)},
   {n:'Hiss',c:280,d:'Sees hidden enemies. Cited enemies take +25% damage.',f:all(set('detect',1),set('amp',0.25))},
   {n:'Whip Crack',c:700,d:'The Tabby lashes every enemy near Marjorie for 8/s.',f:set('whip',8)}]}
 ]},
{id:'jimmy',n:'Big Jimmy',show:'The Old Bay Boys',img:'jimmy',col:'#2d6fc1',lv:2,cost:180,
 kind:'melee',dmg:6,rate:1.6,range:72,air:0,
 line:'Nobody gets caught this year.',lines:['Nobody gets caught this year.','Same time tomorrow, hon.','Steve, you picked TODAY?'],
 about:'Huge tough blue crab (live and blue, never cooked). Short-range pinch, big damage.',
 paths:[
  {n:"Lil Sook's Orders",u:[
   {n:'Boys. Listen to Me.',c:160,d:'Pinches 50% faster.',f:mul('rate',1.5)},
   {n:'I Will Pinch You',c:340,d:'Ignores 3 armor. +4 damage.',f:all(add('ap',3),add('dmg',4))},
   {n:'Same Time Tomorrow, Hon',c:950,d:'Both claws: hits 2 enemies for 18.',f:all(set('multi',2),set('dmg',18))}]},
  {n:"Old Bay's Seasoning",u:[
   {n:'Pre-Seasoned',c:150,d:'Pinched enemies are seasoned: +15% damage taken.',f:set('season',0.15)},
   {n:'Taste the Wisdom',c:300,d:'Seasons everything in range: +25%.',f:all(set('season',0.25),set('seasonAura',1))},
   {n:'The Pot Sees All',c:650,d:'Reveals hidden enemies for every tower nearby. Seasoning +40%.',f:all(set('season',0.4),set('reveal',120),set('detect',1))}]}
 ]},
{id:'gus',n:'Gus & Pixel',show:'Toll Booth Night Shift',img:'pixel',img2:'gus',col:'#2e9e6b',lv:3,cost:250,
 kind:'toll',dmg:1,rate:0.8,range:110,pierce:1,air:1,proj:'receipt',toll:1,
 line:'HI BEST FRIEND!',lines:['HI BEST FRIEND!','TOLL VIOLATION. $4.10. BEST FRIEND DISCOUNT $4.09.','no.','it\'s a goose, pixel.'],
 about:'The last human toll collector and his overeager kiosk. Every enemy passing through pays a toll.',
 paths:[
  {n:'Best Friend Discount',u:[
   {n:'Exact Change',c:200,d:'Toll is $2.',f:set('toll',2)},
   {n:'E-ZPass Lane',c:450,d:'+$30 at the end of every wave.',f:set('waveCash',30)},
   {n:'BEST FRIENDS x3!',c:1100,d:'Toll $4 and +$80 per wave.',f:all(set('toll',4),set('waveCash',80))}]},
  {n:'HI BEST FRIEND!',u:[
   {n:'Heart Receipts',c:150,d:'Receipts confuse: 25% chance to stun 0.5s.',f:set('confuse',0.25)},
   {n:'Receipt Roll',c:300,d:'Prints twice as fast. 3 damage.',f:all(mul('rate',2),set('dmg',3))},
   {n:'gus says no.',c:800,d:'Every 5s Gus says "no." and stops the strongest enemy for 2s (bosses 0.7s).',f:set('no',5)}]}
 ]},
{id:'stanley',n:'Stanley the Skunk',show:'Stink Patrol',img:'stanley',col:'#4c9a2a',lv:4,cost:220,
 kind:'aura',dmg:3,range:80,air:0,
 line:'Don\'t panic. Don\'t panic.',lines:['Don\'t panic. Don\'t panic. Don\'t-','Incident report, 12:01...','Quiet night, sir.'],
 about:'Anxious night guard. A stink cloud wears down every ground enemy that walks through it.',
 paths:[
  {n:'Stink Mode',u:[
   {n:'Don\'t Panic',c:160,d:'+20 cloud radius.',f:add('range',20)},
   {n:'Emergency Stink Mode',c:380,d:'6+ enemies in the cloud? He panics: 25 damage burst (5s cooldown).',f:set('panic',25)},
   {n:'Green Cloud',c:900,d:'Triple stink. Enemies in the cloud slow 25%.',f:all(mul('dmg',3),set('aslow',0.25))}]},
  {n:'Night Security',u:[
   {n:'Flashlight',c:140,d:'Sees hidden enemies.',f:set('detect',1)},
   {n:'Incident Report',c:300,d:'The cloud reaches flying enemies too.',f:set('air',1)},
   {n:'Quiet Night, Sir.',c:800,d:'Stink lingers on enemies for 3s after they leave (6/s).',f:set('linger',6)}]}
 ]},
{id:'pikaru',n:'Pikaru',show:'Onigiri Squad',img:'pikaru',col:'#f2b632',lv:5,cost:260,
 kind:'chain',dmg:5,rate:0.9,range:130,air:1,chains:3,
 line:'Pika-zap!',lines:['Pika-zap!','Wasn\'t me!','Hehehe.'],
 about:'Tiny thunder-tanuki prankster. Zaps jump from enemy to enemy.',
 paths:[
  {n:'Thunder Tanuki',u:[
   {n:'Hehehe',c:200,d:'+2 jumps.',f:add('chains',2)},
   {n:'Big Zap',c:420,d:'9 damage per jump.',f:set('dmg',9)},
   {n:'Wasn\'t Me!',c:1000,d:'10 jumps. Every 4th zap stuns 0.6s.',f:all(set('chains',10),set('stun4',0.6))}]},
  {n:'Prankster',u:[
   {n:'Leaf Hop',c:150,d:'+30 range.',f:add('range',30)},
   {n:'Static Pop',c:360,d:'Double damage to flying enemies.',f:set('airMult',2)},
   {n:'Dan-go-GO!',c:900,d:'The Dango Bros cheer: zaps 2.5x faster.',f:mul('rate',2.5)}]}
 ]},
{id:'dom',n:'Dom "Breaker" DiNardo',show:'Graveyard Shift: Ceres',img:'dom',col:'#c9842b',lv:6,cost:300,
 kind:'proj',dmg:8,rate:0.8,range:140,pierce:2,air:1,proj:'wrench',
 line:'Throwin\' the main. Everybody hold on.',lines:['Throwin\' the main. Everybody hold on.','Lady, you don\'t have a head.','Easy.'],
 about:'Fishtown lineman turned Ceres foreman. Hates paperwork, throws wrenches.',
 paths:[
  {n:'Throwin\' the Main',u:[
   {n:'Ya Know',c:250,d:'14 damage.',f:set('dmg',14)},
   {n:'Lady, You Don\'t Have a Head',c:450,d:'Sees hidden enemies. Double damage to bosses.',f:all(set('detect',1),set('bossMult',2))},
   {n:'Throw the Main',c:1200,d:'Unlocks THROW THE MAIN: stun everything on the map 2.5s (bosses 1s), every 40s.',f:set('main',1)}]},
  {n:'WATT (Toolbox Unit 7)',u:[
   {n:'Beep.',c:200,d:'WATT joins: extra bolt shooter (2 dmg, 2/s).',f:set('watt',2)},
   {n:'GHOST! GHOST!',c:400,d:'WATT panics and fires 3x faster with 3+ enemies close.',f:set('wattPanic',1)},
   {n:'Requests a Raise',c:900,d:'WATT fires 6/s for 4 dmg.',f:all(set('watt',6),set('wattDmg',4))}]}
 ]},
{id:'salt',n:'Salt (Salt Sprite)',show:'Echoes of the Red Horizon',img:'salt',col:'#b9c6ff',lv:7,cost:240,
 kind:'proj',dmg:4,rate:1.2,range:110,pierce:1,air:1,proj:'crystal',detect:1,reveal:110,
 line:'Chrrrrrr!',lines:['Chrrrrrr!','*crackle crackle*','\u266a mmm-MMM-mmm'],
 about:'Pepper\'s Martian best friend. Its fur crackles near Echoes, so it reveals hidden enemies for every tower nearby.',
 paths:[
  {n:'Shapeshift',u:[
   {n:'Bunny Puff',c:150,d:'Bouncy crackle hits 2 enemies.',f:set('multi',2)},
   {n:'Crystal Critter',c:380,d:'Crystal shards: 8 damage, pierce 3.',f:all(set('dmg',8),set('pierce',3))},
   {n:'Red Crystal Wolf',c:1100,d:'30 damage, faster, +40 range. Double vs Hollowhounds.',f:all(set('dmg',30),mul('rate',1.6),add('range',40),set('houndMult',2))}]},
  {n:'Echo Sense',u:[
   {n:'Purrs in Chords',c:160,d:'Reveal radius +60.',f:add('reveal',60)},
   {n:'Crackle',c:320,d:'Revealed enemies take +20% damage.',f:set('revealAmp',0.2)},
   {n:'\u266a mmm-MMM-mmm',c:800,d:'Towers inside the reveal circle fire 15% faster.',f:set('buffRate',0.15)}]}
 ]},
{id:'lumos',n:'Lumos',show:'Echoes of the Red Horizon',img:'lumos',col:'#8fd3ff',lv:8,cost:280,
 kind:'beam',dmg:10,range:120,air:1,detect:1,houndMult:3,
 line:'Woof.',lines:['Woof.','*glows*','*soft whine toward the Echo*'],
 about:'The glowing spirit dog who stepped out of an Echo. Its light burns away Hollowhound shadow (3x).',
 paths:[
  {n:'Glows Brighter',u:[
   {n:'Happy Glow',c:200,d:'18 light per second.',f:set('dmg',18)},
   {n:'Twin Beam',c:450,d:'Beams 2 enemies.',f:set('multi',2)},
   {n:'Radiant',c:1200,d:'60 light per second.',f:set('dmg',60)}]},
  {n:'Gentle',u:[
   {n:'Woof.',c:150,d:'Towers nearby get +10% range.',f:set('buffRange',0.1)},
   {n:'*glows*',c:350,d:'Towers nearby deal +15% damage.',f:set('buffDmg',0.15)},
   {n:'*soft whine*',c:900,d:'Enemies in its light walk 20% slower.',f:set('aslow',0.2)}]}
 ]},
{id:'tavern',n:'The Liberty Tavern Bartenders',show:'Liberty Tavern',img:'bartender',col:'#7a4a2a',lv:9,cost:350,
 kind:'push',dmg:2,rate:0.33,range:120,air:1,push:60,pushN:1,
 line:'Portal\'s open, hold your hats.',lines:['Portal\'s open, hold your hats.','Pull up a stool, it\'s 1777.','Fun fact, footnote one.','Last call for liberty!'],
 about:'Time-traveling tavern keepers. Their portal sends enemies back up the road.',
 paths:[
  {n:'Where Are We Today?',u:[
   {n:'Wrong Year',c:250,d:'Sends enemies back 100.',f:set('push',100)},
   {n:'It\'s 1777',c:500,d:'Portals 3 enemies at once.',f:set('pushN',3)},
   {n:'Last Call for Liberty!',c:1300,d:'Every 12s, sends everything in range way back (bosses a little).',f:set('lastCall',1)}]},
  {n:'Fun Fact, Footnote One',u:[
   {n:'Quick Pour',c:200,d:'Portals 50% faster.',f:mul('rate',1.5)},
   {n:'Jet Lag',c:400,d:'Portaled enemies are 30% slower for 2s.',f:set('jet',1)},
   {n:'Anachronism',c:900,d:'Portaled enemies take 20 damage.',f:set('dmg',22)}]}
 ]},
{id:'rumple',n:'Lt. Rumple',show:'Lt. Rumple',img:'rumple',col:'#b08a5a',lv:10,cost:400,
 kind:'snipe',dmg:20,rate:0.45,range:999,air:1,detect:1,
 line:'Just one more thing...',lines:['Just one more thing...','Funny thing about the clock, sir. It was wrong.','My wife, she loves your books.'],
 about:'Rumpled detective. Whole-map range, sees through any disguise, and every third clue hits triple.',
 paths:[
  {n:'Funny Thing About the Clock',u:[
   {n:'Pats Pockets',c:300,d:'35 damage.',f:set('dmg',35)},
   {n:'Squint',c:650,d:'Hits stun 0.3s.',f:set('stun',0.3)},
   {n:'It Was Wrong.',c:1500,d:'120 damage. Every 3rd clue hits 4x.',f:all(set('dmg',120),set('crit',4))}]},
  {n:'My Wife Says',u:[
   {n:'Coffee',c:250,d:'40% faster.',f:mul('rate',1.4)},
   {n:'Found a Receipt',c:500,d:'+$2 every time he shoos one.',f:add('cashPerKill',2)},
   {n:'One More Thing',c:1200,d:'Marks his target: marked enemies take +35% from everyone.',f:set('mark',0.35)}]}
 ]},
{id:'tess',n:'Big Tess',show:'Graveyard Shift: Ceres',img:'tess',col:'#d8562c',lv:11,cost:350,
 kind:'support',dmg:4,rate:1,range:120,air:0,buffRate:0.2,
 line:'Keep it hot.',lines:['Keep it hot.','Sit down, baby, you look haunted.','Living get the cheesesteak.'],
 about:'Deck 4 diner cook. Feeds the crew: towers near her fire 20% faster.',
 paths:[
  {n:'Keep It Hot',u:[
   {n:'Second Shift',c:250,d:'Nearby towers +30% speed.',f:set('buffRate',0.3)},
   {n:'Double Order',c:500,d:'+40% speed, +20 aura range.',f:all(set('buffRate',0.4),add('range',20))},
   {n:'Living Get the Cheesesteak',c:1200,d:'+50% speed and +20% damage nearby.',f:all(set('buffRate',0.5),set('buffDmg',0.2))}]},
  {n:'Sit Down, Baby',u:[
   {n:'Sit Down, Baby',c:200,d:'Enemies near her slow 15%.',f:set('aslow',0.15)},
   {n:'Grill Smoke',c:450,d:'Grill smoke: 5/s to ground enemies nearby.',f:set('grill',5)},
   {n:'Deck 4 Diner',c:1000,d:'+$50 at the end of every wave.',f:set('waveCash',50)}]}
 ]},
{id:'wheel',n:'Mr. Trash Wheel',show:'The Old Bay Boys',img:'trashwheel',col:'#5b6670',lv:12,cost:450,
 kind:'gulp',range:90,air:0,gulp:40,gulpEvery:4,dmg:0,
 line:'*chug chug*',lines:['*chug chug*','*GULP*','*googly-eye wink*'],
 about:'The harbor legend. Every few seconds: *GULP*. Swallows the lead enemy whole if it is small enough.',
 paths:[
  {n:'*GULP*',u:[
   {n:'Bigger Bites',c:300,d:'Swallows up to 80 HP, every 3s.',f:all(set('gulp',80),set('gulpEvery',3))},
   {n:'Wide Mouth',c:650,d:'Up to 200 HP.',f:set('gulp',200)},
   {n:'Sees All',c:1500,d:'Up to 600 HP every 2s. Bosses take 300 per gulp.',f:all(set('gulp',600),set('gulpEvery',2),set('gulpBoss',300))}]},
  {n:'Googly-Eye Wink',u:[
   {n:'Wink',c:250,d:'Sees hidden enemies. +30 range.',f:all(set('detect',1),add('range',30))},
   {n:'Recycling',c:500,d:'+$3 per gulp.',f:add('cashPerKill',3)},
   {n:'Harbor Legend',c:1100,d:'Gulps 2 at a time.',f:set('gulpN',2)}]}
 ]}
];
var ENEMIES={
 ant:{n:'Heist Ant',hp:6,spd:62,r:2,sz:9,d:'Stink Patrol vending-machine heist crew. "Grab the cheesy puffs. Go, go, go."'},
 twitch:{n:'Twitch the Lookout',hp:5,spd:118,r:2,sz:8,d:'Fast, paranoid. "S-s-somebody\'s coming!"'},
 loaded:{n:'Loaded Ant',hp:40,spd:42,armor:1,r:6,sz:13,life:2,d:'Carrying a candy bar. Armored.'},
 goose:{n:'Turnpike Goose',hp:16,spd:72,r:3,sz:12,honk:1,d:'Hisses at screens. Speeds up when it HONKS at half health.'},
 gull:{n:'Harbor Gull',hp:10,spd:82,air:1,r:3,sz:11,d:'One of Gully\'s crew. Flies.'},
 snack:{n:'Runaway Snack Bag',hp:9,spd:108,r:1,sz:8,d:'Kappa-Boss dropped them.'},
 mite:{n:'Cinder Mite',hp:5,spd:68,r:1,sz:7,d:'Dust-eating pest that clogs dome filters. The grid crews\' eternal enemy.'},
 puff:{n:'Phobos Puff',hp:14,spd:48,air:1,r:2,sz:12,split:'minipuff',splitN:2,d:'Floating gas-sac. Pops into 2 smaller puffs with a squeak.'},
 minipuff:{n:'Mini Puff',hp:5,spd:64,air:1,r:1,sz:7,d:'Squeak.'},
 runner:{n:'Dustrunner',hp:18,spd:125,r:3,sz:12,storm:1,d:'Glass-legged herd animal. They run ahead of dust storms, and a storm follows them.'},
 emoth:{n:'Echo Moth',hp:9,spd:82,air:1,r:2,sz:9,d:'Drawn to Echo light. Flies fast in swarms.'},
 hound:{n:'Hollowhound',hp:42,spd:76,camo:1,r:7,sz:13,life:1,d:'Dr. Null\'s shadow crystal dog. Hidden. Lumos\'s light hurts it 3x.'},
 bigsal:{n:'Big Sal',hp:270,spd:40,armor:2,r:40,sz:28,img:'bigsal',life:5,mini:1,line:'I got it.',d:'The ant gang\'s gentle muscle. "Candy bar\'s heavy."'},
 tank:{n:'Tank Morrow',hp:310,spd:38,armor:3,r:45,sz:30,img:'tank',life:5,mini:1,line:'Hale wants it!',d:'Heights Crew enforcer. Here for the crystal.'},
 gully:{n:'Gully',hp:900,spd:44,armor:1,r:150,sz:36,img:'gully',boss:1,line:'Trust me.',out:'X marks the spot, boys...',d:'Con-artist seagull. Every few seconds he cons you out of some cash.'},
 kappa:{n:'Kappa-Boss',hp:1000,spd:40,armor:1,r:180,sz:34,img:'kappa',boss:1,line:'Snacks are MINE!',out:'...I dropped them.',d:'Snack-stealing villain. At half health: "...I dropped them." Snack bags run.'},
 pell:{n:'Mr. Pell',hp:1300,spd:34,armor:2,r:220,sz:36,img:'pell',boss:1,line:'Per the audit, this station is closed.',out:'Ghosts are not a line item...',d:'Corporate auditor. His audit shuts down nearby towers for 3s.'},
 sucks:{n:'Sir Sucks-a-Lot',hp:1700,spd:32,armor:2,r:260,sz:38,img:'sucks',boss:1,line:'ALL DUST IS MINE.',out:'Low... battery...',d:'Villain robot vacuum, thrilled to find a planet made of dust. Sucks up Cinder Mites to heal.'},
 crawler:{n:'Regolith Crawler',hp:2200,spd:26,armor:3,r:320,sz:40,boss:1,line:'*RUMBLE*',out:'*calms down and burrows home*',d:'Bus-sized burrower, spooked by the crack. Usually harmless. Shakes Cinder Mites loose.'},
 overmind:{n:'Overmind',hp:3200,spd:28,armor:3,r:500,sz:40,img:'overmind',boss:1,line:'Unregistered lifeform detected.',out:'...best friend?',d:'Aetheria\'s toaster AI. Projects Harmony shields on nearby enemies.'}
};
var MAPS=[
 {id:'mill',n:'Mill Street',place:'Bristol, PA (Earth)',theme:'earth',diff:1.0,cur:'$',
  paths:[[[-1,2],[4,2],[4,7],[9,7],[9,3],[13,3],[13,8],[16,8]]],
  pool:[['ant',1,4],['twitch',3,2],['goose',5,3],['loaded',8,2],['gull',10,2]],mini:'bigsal',boss:'gully',
  block:[[6,4],[7,4],[6,5],[7,5]],
  intro:'12:49. The mill clock froze and the crack opened at the end of Mill Street. Something is coming through. Hold the line.'},
 {id:'river',n:'Delaware Riverfront',place:'Bristol waterfront (Earth)',theme:'river',diff:1.08,cur:'$',
  paths:[[[-1,3],[3,3],[3,6],[7,6],[7,1],[11,1],[11,10]]],
  pool:[['ant',1,3],['goose',1,4],['gull',3,3],['twitch',5,2],['loaded',7,2],['snack',9,2]],mini:'bigsal',boss:'kappa',
  water:8,
  intro:'The geese are restless and Kappa-Boss came through the crack chasing snacks. Keep them off the bridge.'},
 {id:'pike',n:'Turnpike Toll Plaza',place:'Bensalem interchange (Earth)',theme:'pike',diff:1.16,cur:'$',fog:0.2,
  paths:[[[-1,5],[4,5],[4,2],[8,2],[8,7],[12,7],[12,4],[16,4]]],
  pool:[['goose',1,4],['twitch',1,2],['gull',3,3],['ant',2,2],['loaded',6,3]],mini:'bigsal',boss:'pell',
  block:[[6,4],[6,5],[10,4],[10,5]],
  intro:'Fog off the Neshaminy. One in five enemies is hidden in it, so bring a tower that can see. Mr. Pell has come to audit the booth.'},
 {id:'ring',n:'New Fishtown Ring',place:'Aetheria dome (Mars)',theme:'mars',diff:1.25,cur:'\u2726',
  paths:[[[16,1],[2,1],[2,8],[13,8],[13,4],[6,4],[6,6],[9,6]]],
  pool:[['mite',1,4],['puff',2,3],['runner',5,2],['emoth',8,2],['hound',11,2]],mini:'tank',boss:'sucks',
  intro:'The crack opened inside the dome. Blue Echo light shows a Philly street, and the dust is pouring in. Sir Sucks-a-Lot followed it.'},
 {id:'el',n:'The El Ring',place:'Maglev line, last train 1:13 AM (Mars)',theme:'night',diff:1.34,cur:'\u2726',
  paths:[[[-1,1],[5,1],[5,5],[16,5]],[[-1,8],[10,8],[10,5],[16,5]]],
  pool:[['mite',1,4],['puff',1,3],['runner',3,2],['emoth',3,2],['hound',6,3]],mini:'tank',boss:'crawler',
  intro:'Two tunnels, one line. Something big is rumbling under the tracks.'},
 {id:'overlap',n:'12:49 Overlap',place:'Earth on Mars',theme:'overlap',diff:1.45,cur:'$',
  paths:[[[-1,1],[3,1],[3,7],[7,7],[7,5]],[[16,8],[12,8],[12,2],[8,2],[8,4]]],
  pool:[['ant',1,2],['mite',1,2],['goose',2,2],['puff',3,2],['gull',4,2],['runner',5,2],['loaded',6,2],['emoth',7,2],['hound',9,3]],mini:'tank',mini2:'bigsal',boss:'overmind',
  block:[[7,4],[8,4],[7,5],[8,5]],
  intro:'Mill Street on one side, Mars on the other, and the crack right in the middle. Overmind wants to register the anomaly.'}
];
var MODS=[
 {id:'storm',n:'Dust Storm Day',d:'All tower range -15%.'},
 {id:'honk',n:'Honk Hour',d:'Enemies move 20% faster.'},
 {id:'bff',n:'Best Friend Discount',d:'Towers cost 20% less. Selling pays 50%.'},
 {id:'irreg',n:'Highly Irregular',d:'Double starting cash. Only 5 lives.'},
 {id:'tmrw',n:'Same Time Tomorrow',d:'Enemies +40% health. Wave bonuses doubled.'},
 {id:'glitch',n:'12:49 Glitch',d:'1 in 4 enemies is hidden.'}
];
return {TOWERS:TOWERS,ENEMIES:ENEMIES,MAPS:MAPS,MODS:MODS};
})();
