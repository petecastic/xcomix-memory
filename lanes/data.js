/* Midnight Lanes: Three Worlds — data. X-COMIX Arcade. Free, no ads, no gems, no timers. */
var ML_DATA = (function(){
var D = {};
/* kinds: prod, shoot, wall, tall, bomb_row, bomb_3x3, chomp, lob, mine, trap, triple, torch, paddle, bell */
D.worlds = [
{ id:'stink', show:'Stink Patrol', name:'Museum After Midnight', place:'Delaware Valley Museum of Natural History · Fossil Hall',
  cur:'Vending Crumbs', curShort:'Crumbs', sweeper:'Museum Floor Buffer', clockFrom:'12:00 AM', clockTo:'6:00 AM',
  pal:{bg1:'#1b2550',bg2:'#222e60',line:'#0e1433',accent:'#7ccb3a',hud:'#1a2350',glow:'#9effa0'},
  blurb:'Midnight. The dinos are awake, the ant gang is on your side for once, and a villain Roomba wants every speck of dust in the Fossil Hall. Stanley\'s one rule: don\'t panic.',
  defenders:['crumbs','lefty','trixie','stanley','gary','rexanne','twitch','doris','bigsal'],
  start:3, unlock:[['stanley','gary'],['rexanne'],['twitch'],['doris'],['bigsal']],
  enemies:['dustmite','mopdrone','bufferbot','tunneler','sirsucks'],
  pool:[['dustmite'],['dustmite','mopdrone'],['dustmite','mopdrone','tunneler'],['dustmite','mopdrone','tunneler','bufferbot'],['dustmite','mopdrone','tunneler','bufferbot']],
  boss:'sirsucks',
  win:[{img:'director-buzzwell',who:'Director Buzzwell',say:'*sniff* ...What is that SMELL?'},{img:'stanley',who:'Stanley',say:'Quiet night, sir.'}],
  lose:{img:'sir-sucks-a-lot',who:'Sir Sucks-a-Lot',say:'ALL DUST IS MINE. Kneel before the suction.'},
  stageNames:['Night One','The Toe Bone','The Sleepover','Lights Out','The New Model','BOSS: Sir Sucks-a-Lot','Endless Graveyard Shift']
},
{ id:'oldbay', show:'Bay Dust Boys', name:'Fells Point Pier', place:'Baltimore Inner Harbor · under the Fells Point docks',
  cur:'Shiny Shells', curShort:'Shells', sweeper:'Harbor Wave Barrel', clockFrom:'7:00 PM', clockTo:'8:19 PM',
  pal:{bg1:'#7a5434',bg2:'#8a6240',line:'#3a2414',accent:'#2d6fb5',hud:'#20324a',glow:'#9ad7ff'},
  blurb:'Dusk on the docks. Captain Dottie\'s traps are out, Gully is selling fake escape maps again, and the boys have to keep the pier clear till the lights come on. Live blue crabs only, hon.',
  defenders:['lilsook','bigjimmy','hon','softshell','oldbay','wheel'],
  start:3, unlock:[['softshell'],['oldbay'],[],['wheel'],[]],
  enemies:['deckhand','gull','crabpot','boathook','dredge'],
  pool:[['deckhand'],['deckhand','gull'],['deckhand','gull','crabpot'],['deckhand','gull','crabpot','boathook'],['deckhand','gull','crabpot','boathook']],
  boss:'dredge',
  win:[{img:'lil-sook',who:'Lil Sook',say:'Boys. Listen to me. We did it.'},{img:'big-jimmy',who:'Big Jimmy',say:'Same time tomorrow, hon.'}],
  lose:{img:'gully',who:'Gully',say:'Trust me. X marks the spot, boys.'},
  stageNames:['Steamer Season','Brown Paper Blues','Spa Day','Dragon Boat','Low Tide Caper','BOSS: The Dredge Rig','Endless High Tide']
},
{ id:'onigiri', show:'Onigiri Squad!', name:'Onigiri Mart Aisles', place:'Onigiri Mart · cherry-blossom shrine lane',
  cur:'Sakura Rice Stars', curShort:'Stars', sweeper:'Rolling Bento Cart', clockFrom:'2:30 PM', clockTo:'Closing',
  pal:{bg1:'#ffe3ec',bg2:'#fff4f7',line:'#e7a9bd',accent:'#ff7aa8',hud:'#ff9ab8',glow:'#ffd6e4'},
  blurb:'Kappa-Boss and his snack-grabbing yokai minions are raiding Onigiri Mart again. Tamago-chan, Pikaru and the squad hold the aisles. Gwa-ha-ha!',
  defenders:['tamago','pikaru','mochi','umebo','wasabi','dango','neko'],
  start:3, unlock:[['umebo'],['wasabi'],['neko'],['dango'],[]],
  enemies:['imp','basket','umbrella','sodacan','kappamech'],
  pool:[['imp'],['imp','basket'],['imp','basket','sodacan'],['imp','basket','sodacan','umbrella'],['imp','basket','sodacan','umbrella']],
  boss:'kappamech',
  win:[{img:'neko-sensei',who:'Neko-Sensei',say:'Nya, class. Patience brings luck.'},{img:'kappa-boss',who:'Kappa-Boss',say:'...I dropped them.'}],
  lose:{img:'kappa-boss',who:'Kappa-Boss',say:'Snacks are MINE! Gwa-ha-ha!'},
  stageNames:['Opening Shift','Rice Ball Rush','Shrine Lane','Umbrella Season','Sold Out!','BOSS: Snack-Heist Mech','Endless Night Shift']
}];

D.def = {
/* ---------- WORLD 1: STINK PATROL ---------- */
crumbs:{name:'Crumbs',img:'crumbs',kind:'prod',cost:50,cd:7.5,hp:300,rate:24,
  role:'Snack Dispenser',desc:'Shakes loose bonus Vending Crumbs from the break-room machine every 24 seconds.',line:'"Crumbs is crumbs."'},
lefty:{name:'Lefty',img:'lefty',kind:'shoot',cost:100,cd:7.5,hp:300,dmg:20,rate:1.45,proj:'acorn',
  role:'Museum Pelter',desc:'Cool as ice. Flings gift-shop acorns straight down the lane.',line:'"Easy."'},
trixie:{name:'Trixie',img:'trixie',kind:'wall',cost:50,cd:30,hp:4000,
  role:'Triceratops Fossil Shield',desc:'68 million years old and flawless. Raiders get stuck chewing on bone while she takes selfies.',line:'"Do not tag me in that."'},
stanley:{name:'Stanley the Skunk',img:'stanley',kind:'bomb_row',cost:125,cd:45,hp:300,dmg:1800,
  role:'Emergency Panic Stink Bomb',desc:'Don\'t panic. Don\'t panic. Don\'t— One use. Panics and fills his whole lane with a green stink cloud.',line:'"Don\'t panic. Don\'t panic. Don\'t—"'},
gary:{name:'Gary the Moth',img:'gary',kind:'shoot',cost:175,cd:7.5,hp:300,dmg:20,rate:1.45,proj:'heart',slow:4,
  role:'Lovesick Slowing Slobber',desc:'Sighs love-hearts down the lane. Anything hit swoons and moves at half speed.',line:'"She\'s the one."'},
rexanne:{name:'Rexanne',img:'rexanne',kind:'chomp',cost:150,cd:7.5,hp:300,dmg:2000,chew:28,
  role:'Waking T-Rex Skeleton',desc:'Screams, then swallows the raider right in front of her whole. Needs a long chew after. Bosses just get a bite.',line:'"NOT THE ROOMBA!"'},
twitch:{name:'Twitch',img:'twitch',kind:'shoot',cost:200,cd:7.5,hp:300,dmg:20,rate:1.45,proj:'bolt',shots:2,
  role:'Rapid Panic Pelter',desc:'Shaky hands, fast fingers. Fires two loose bolts every volley.',line:'"S-s-somebody\'s coming!"'},
doris:{name:'Doris',img:'doris',kind:'trap',cost:75,cd:20,hp:9999,uses:4,stick:3,dmg:20,
  role:'Gift-Shop Glue Puddle',desc:'300 million years of patience. Lays a glue puddle on a tile; raiders crossing it get stuck for 3 seconds. Four uses.',line:'"I seen it all, kid."'},
bigsal:{name:'Big Sal',img:'big-sal',kind:'lob',cost:125,cd:7.5,hp:300,dmg:40,rate:2.8,proj:'candy',splash:0,
  role:'Heavy Museum Thumper',desc:'The muscle. Lobs full-size candy bars over walls, so he can hit things the pelters can\'t.',line:'"Candy bar\'s heavy."'},
/* ---------- WORLD 2: BAY DUST BOYS (LIVE BLUE CRABS ONLY) ---------- */
lilsook:{name:'Lil Sook',img:'lil-sook',kind:'prod',cost:50,cd:7.5,hp:300,rate:24,
  role:'Shell Finder',desc:'She\'s really in charge. Digs up Shiny Shells from under the pilings every 24 seconds.',line:'"I\'m in charge, he just has the hat."'},
bigjimmy:{name:'Big Jimmy',img:'big-jimmy',kind:'shoot',cost:125,cd:7.5,hp:400,dmg:34,rate:1.8,proj:'bolt2',
  role:'Heavy Blue-Claw Snapper',desc:'Huge, live, very blue and very tough. Snaps rusty harbor bolts down the planks.',line:'"Nobody gets caught this year."'},
hon:{name:'Hon',img:'hon',kind:'tall',cost:100,cd:30,hp:3000,buff:1.3,
  role:'Pier Barricade Counter',desc:'Rolls her crab-shack counter onto the dock. Blocks gulls, and the crabs next to her fire 30% faster because she believes in them.',line:'"What can I get ya, hon?"'},
softshell:{name:'Softshell Steve',img:'softshell-steve',kind:'mine',cost:25,cd:30,hp:300,arm:14,dmg:1800,
  role:'Mid-Molt Pier Mine',desc:'Too squishy for traps. Hides under the planks for 14 seconds, then pops up under the first thing that steps on him.',line:'"Why now? Why TODAY?"'},
oldbay:{name:'Bay Dust',img:'old-bay',kind:'lob',cost:200,cd:7.5,hp:300,dmg:60,rate:3,proj:'spice',splash:90,
  role:'Veteran Seasoning Mortar',desc:'Crusted in spice, still a live blue crab underneath. Lobs spice clouds that splash everything nearby.',line:'"Nobody steams a crab that\'s already seasoned."'},
wheel:{name:'Googly Harbor Wheel',img:'mr-trash-wheel',kind:'paddle',cost:225,cd:20,hp:1200,dmg:45,rate:2.2,
  role:'Paddle Splash Sweeper',desc:'A fictional googly-eyed harbor wheel. Paddles water across three lanes in front of it and strips armor three times as fast. *GULP*',line:'"*chug chug* ... *googly-eye wink*"'},
/* ---------- WORLD 3: ONIGIRI SQUAD! ---------- */
tamago:{name:'Tamago-chan',img:'tamago-chan',kind:'prod',cost:50,cd:7.5,hp:300,rate:24,
  role:'Sunny Egg Producer',desc:'Sunny side up! Makes a Sakura Rice Star every 24 seconds.',line:'"Egg-cellent!"'},
pikaru:{name:'Pikaru',img:'pikaru',kind:'shoot',cost:125,cd:7.5,hp:300,dmg:11,rate:0.55,proj:'spark',
  role:'Zappy Rice-Ball Shooter',desc:'Tiny thunder-tanuki. Fires a fast stream of electric sparks down the aisle.',line:'"Pika-zap! ...Wasn\'t me!"'},
mochi:{name:'Mochi-Mochi',img:'mochi-mochi',kind:'tall',cost:125,cd:30,hp:6000,boing:true,
  role:'Bouncy Mochi Wall',desc:'So stretchy. Absorbs a ton of bites, blocks jumpers, and every few seconds boings the attacker back a step.',line:'"Squish hug!"'},
umebo:{name:'Umebo',img:'umebo',kind:'lob',cost:150,cd:7.5,hp:300,dmg:30,rate:2.6,proj:'plum',splash:0,slow:4,
  role:'Sour Plum Lobber',desc:'Brave onigiri hero. Lobs sour umeboshi plums that pucker raiders into slow motion.',line:'"Ume-POW!"'},
wasabi:{name:'Wasabi-kun',img:'wasabi-kun',kind:'torch',cost:175,cd:7.5,hp:300,
  role:'Spicy Row-Burner',desc:'Any shot that flies through him gets spicy and does double damage. Put him in front of Pikaru.',line:'"Too spicy for you!"'},
dango:{name:'Dango Bros',img:'dango-bros',kind:'triple',cost:325,cd:7.5,hp:300,dmg:20,rate:1.5,proj:'dango',
  role:'Three-Lane Skewer',desc:'Dan- go- GO! Three brothers fire into their aisle and the two next to it at once.',line:'"Dan-" "-go-" "-GO!"'},
neko:{name:'Neko-Sensei',img:'neko-sensei',kind:'bell',cost:150,cd:45,hp:300,dmg:1800,stun:3,
  role:'Shrine Bell Ultimate',desc:'One use. Rings the shrine bell: banishes every yokai thief in a 3×3 area and stuns everything else on screen.',line:'"Nya, class."'}
};

D.foe = {
/* World 1 */
dustmite:{name:'Dust-Mite Bot',hp:200,spd:19,bite:100,cost:1,desc:'Basic dust bot. Walks in a straight line and nibbles whatever is in front of it.'},
mopdrone:{name:'Mop Drone',hp:200,armor:370,spd:19,bite:100,cost:2,desc:'Wears a soggy mop head as a helmet. Knock the mop off first.'},
bufferbot:{name:'Armored Buffer Bot',hp:200,armor:950,spd:17,bite:100,cost:4,desc:'Heavy floor-buffer plating. Very slow, very stubborn.'},
tunneler:{name:'Boss Ant Tunneler',img:'boss-ant',hp:300,spd:28,bite:100,cost:3,burrow:true,desc:'The ant gang\'s boss still won\'t share. Tunnels under your front line (only lobbers and blasts reach him while he digs) and pops up in the middle of the hall. "Grab the cheesy puffs. Go, go, go."'},
sirsucks:{name:'Sir Sucks-a-Lot',img:'sir-sucks-a-lot',hp:5200,spd:9,bite:450,boss:true,desc:'Villain robot vacuum in a purple cape. Switches lanes, vacuums up whole tiles and spits out Dust-Mite Bots. "ALL DUST IS MINE."'},
/* World 2 */
deckhand:{name:'Deckhand Net',hp:220,spd:19,bite:100,cost:1,desc:'One of Captain Dottie\'s deckhands, hauling a net. Basic.'},
gull:{name:'Swooping Pier Gull',hp:180,spd:34,bite:80,cost:2,fly:true,desc:'Flies right over crabs and walls. Only Hon\'s counter stops it. Lobs and mines miss it.'},
crabpot:{name:'Weighted Crab Pot',hp:200,armor:1000,spd:15,bite:100,cost:4,desc:'A heavy wire crab pot on stubby legs. Empty, thankfully. The Harbor Wheel tears through the wire.'},
boathook:{name:'Boat Hook',hp:340,spd:24,bite:100,cost:3,hook:true,desc:'Yanks the first crab it reaches clean off the dock. Walls and counters are too heavy to hook.'},
dredge:{name:'Captain Dottie\'s Dredge Rig',img:'captain-dottie',img2:'gully',hp:5000,spd:8,bite:500,boss:true,desc:'Dottie runs the rig and Gully runs the con. Switches lanes, scoops up whole tiles, drops crab pots and sends gulls. "Back tomorrow, boys."'},
/* World 3 */
imp:{name:'Snack-Grab Imp',hp:200,spd:20,bite:100,cost:1,desc:'Kappa-Boss\'s smallest minion. Grabs any snack it can reach.'},
basket:{name:'Basket Roller',hp:200,armor:550,spd:34,bite:100,cost:3,bump:300,desc:'An imp rolling in a shopping basket. Fast until the basket breaks, and it slams the first friend it hits.'},
umbrella:{name:'Umbrella Yokai',hp:400,spd:18,bite:100,cost:3,umb:true,desc:'A hopping one-eyed paper umbrella. Lobbed shots bounce off it, so use straight shooters.'},
sodacan:{name:'Soda-Can Jumper',hp:300,spd:30,bite:100,cost:2,vault:true,desc:'Fizzes up and leaps over the first friend in its way. Mochi-Mochi is too tall to jump.'},
kappamech:{name:'Kappa-Boss\'s Snack-Heist Mech',img:'kappa-boss',hp:6500,spd:8,bite:550,boss:true,desc:'Kappa-Boss in a giant snack-grabbing mech. Switches aisles, stomps tiles and launches Soda-Can Jumpers. "Gwa-ha-ha!"'}
};
D.foe.dustmite.art='dustmite';
return D;
})();
