/* Yard Lemonade Stand (Draft MVP) — X-COMIX Arcade
   480x480 X Player Card first. No cookies, no logins, no wallets, no autoplay sound.
   Shared Yard day seeded from midnight America/New_York; personal stand saved locally. */
(function () {
  'use strict';

  var SAVE_KEY = 'xca-yardstand-v1';
  var MUTE_KEY = 'xca-yardstand-muted';
  var SHARE_URL = 'https://petecastic.github.io/xcomix-memory/doge-yard/yard-stand/';
  var DAY_LEN = 32; // brisk ~32s game-time day (16s at 2x)

  // ---------- Safe Storage (iframe-safe) ----------
  var memStore = {};
  var store = {
    get: function (k) {
      try {
        var v = window.localStorage.getItem(k);
        return v ? JSON.parse(v) : null;
      } catch (e) {
        return Object.prototype.hasOwnProperty.call(memStore, k) ? memStore[k] : null;
      }
    },
    set: function (k, v) {
      memStore[k] = v;
      try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
    },
    del: function (k) {
      delete memStore[k];
      try { window.localStorage.removeItem(k); } catch (e) {}
    }
  };

  // ---------- Sound (muted by default, unlocked only on user tap) ----------
  var muted = store.get(MUTE_KEY);
  if (muted === null) muted = true;
  var AC = null;
  function sfx(freq, dur, type, vol, slide) {
    if (muted) return;
    try {
      if (!AC) {
        var Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        AC = new Ctx();
      }
      if (AC.state === 'suspended' && AC.resume) AC.resume();
      var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
      dur = dur || 0.08;
      o.type = type || 'square';
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
      g.gain.setValueAtTime(vol || 0.04, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(AC.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }
  var SFX = {
    tap: function () { sfx(580, 0.05, 'triangle', 0.04); },
    coin: function () { sfx(988, 0.06, 'square', 0.035); setTimeout(function () { sfx(1319, 0.09, 'square', 0.035); }, 50); },
    bark: function () { sfx(340, 0.07, 'sawtooth', 0.05, 540); setTimeout(function () { sfx(420, 0.08, 'sawtooth', 0.05, 220); }, 75); },
    no: function () { sfx(190, 0.14, 'sawtooth', 0.04, 130); },
    splash: function () { sfx(260, 0.16, 'triangle', 0.05, 110); },
    fanfare: function () { [523, 659, 784, 1047].forEach(function (f, i) { setTimeout(function () { sfx(f, 0.11, 'square', 0.035); }, i * 85); }); }
  };

  // ---------- Sprite Sheet ----------
  var FRAMES = {
    domino: [0, 0, 24, 32], domino_wag0: [24, 0, 24, 32], domino_wag1: [48, 0, 24, 32], domino_wag2: [72, 0, 24, 32],
    pickle: [96, 0, 24, 32], bear: [120, 0, 24, 32], meatball: [144, 0, 24, 32], mittens: [168, 0, 24, 32],
    tullio: [192, 0, 24, 32], pixel: [216, 0, 24, 32], tabby: [240, 0, 24, 32],
    lark: [0, 32, 24, 32], thistle: [24, 32, 24, 32], nix: [48, 32, 24, 32], pebble: [72, 32, 24, 32],
    lark_l: [96, 32, 24, 32], pebble_l: [120, 32, 24, 32],
    tree: [144, 32, 16, 32], fence: [160, 32, 24, 16], fence2: [184, 32, 24, 16],
    squirrel: [208, 32, 16, 16], sprinkler: [224, 32, 24, 24], chalkboard: [248, 32, 20, 24],
    sun: [160, 52, 8, 8], moon: [168, 52, 8, 8], cloud: [176, 52, 16, 8],
    bark: [192, 52, 8, 8], heart: [200, 52, 8, 8], pretzel_sm: [208, 52, 8, 8], coffee_sm: [216, 52, 8, 8],
    puddle: [272, 32, 16, 6], grass: [272, 40, 16, 8], sand: [288, 40, 16, 8],
    rain0: [272, 48, 16, 16], rain1: [288, 48, 16, 16], rain2: [304, 48, 16, 16],
    stand_pitcher: [0, 64, 56, 40], stand_cocoa: [56, 64, 56, 40], stand_pretzel: [112, 64, 56, 40],
    umbrella: [168, 64, 64, 32],
    ico_lemonade: [0, 112, 16, 16], ico_tea: [16, 112, 16, 16],
    ico_cocoa: [32, 112, 16, 16], ico_cider: [48, 112, 16, 16],
    ico_pretzel: [64, 112, 16, 16], ico_cookie: [80, 112, 16, 16]
  };
  var sheet = new Image();
  sheet.src = 'art/sprites.png';
  function spriteReady() { return sheet.complete && sheet.naturalWidth > 0; }
  function spr(ctx, name, x, y, scale, flipX) {
    var f = FRAMES[name];
    if (!f || !spriteReady()) return;
    scale = scale || 1;
    ctx.save();
    if (flipX) {
      ctx.translate(x + f[2] * scale, y);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, f[0], f[1], f[2], f[3], 0, 0, f[2] * scale, f[3] * scale);
    } else {
      ctx.drawImage(sheet, f[0], f[1], f[2], f[3], x, y, f[2] * scale, f[3] * scale);
    }
    ctx.restore();
  }

  // ---------- NY Calendar Date & Seeded RNG ----------
  function nyDateStr() {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
      }).format(new Date());
    } catch (e) {
      var d = new Date();
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }
  }
  function rngFromStr(seedStr) {
    var h = 7;
    for (var i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) | 0;
    return function () {
      h |= 0; h = (h + 0x6D2B79F5) | 0;
      var t = Math.imul(h ^ (h >>> 15), 1 | h);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- Game Content Data ----------
  var STARTERS = {
    pitcher: {
      id: 'pitcher', name: 'PITCHER STAND', item1: 'lemonade', item2: 'tea',
      standFrame: 'stand_pitcher', icon: 'ico_lemonade',
      perk: 'Hot & sunny days boom',
      unlockNote: 'Unlocks Iced Tea',
      toolName: 'Big Glass Pitcher', toolDesc: '+35% pour speed & +12% taste',
      keeperName: 'Insulated Ice Bucket', keeperDesc: 'Halves ice melt & lemon spoilage',
      ings: ['lemons', 'sugar', 'ice', 'cups', 'tea'],
      recLabels: ['Tart', 'Sweet', 'Ice'],
      recIdealBase: [3, 3, 3]
    },
    cocoa: {
      id: 'cocoa', name: 'WARM CUPS', item1: 'cocoa', item2: 'cider',
      standFrame: 'stand_cocoa', icon: 'ico_cocoa',
      perk: 'Rain & cool clouds boom',
      unlockNote: 'Unlocks Warm Cider',
      toolName: 'Copper Cocoa Kettle', toolDesc: '+35% pour speed & +12% taste',
      keeperName: 'Thermal Pot Lid', keeperDesc: 'Halves milk & cider spoilage',
      ings: ['cocoa', 'milk', 'toppings', 'mugs', 'apples'],
      recLabels: ['Rich', 'Sweet', 'Foam'],
      recIdealBase: [3, 3, 3]
    },
    pretzel: {
      id: 'pretzel', name: 'SNACK CRATE', item1: 'pretzel', item2: 'cookie',
      standFrame: 'stand_pretzel', icon: 'ico_pretzel',
      perk: 'Steady in any weather',
      unlockNote: 'Unlocks Yard Cookies',
      toolName: 'Warming Stone', toolDesc: '+35% plate speed & +12% taste',
      keeperName: 'Airtight Snack Crate', keeperDesc: 'Halves overnight dough spoilage',
      ings: ['dough', 'salt', 'butter', 'bags', 'chips'],
      recLabels: ['Salt', 'Butter', 'Bake'],
      recIdealBase: [3, 3, 3]
    }
  };

  var INGS = {
    lemons:   { n: 'Lemons',     unit: 'lemon', pack: [5, 1.50], big: [15, 4.00], perish: 0.25 },
    sugar:    { n: 'Sugar',      unit: 'scoop', pack: [5, 0.75], big: [15, 2.00], perish: 0 },
    ice:      { n: 'Ice Cubes',  unit: 'scoop', pack: [5, 0.50], big: [15, 1.25], perish: 1.0 },
    cups:     { n: 'Paper Cups', unit: 'cup',   pack: [5, 0.50], big: [15, 1.25], perish: 0 },
    tea:      { n: 'Tea Bags',   unit: 'bag',   pack: [5, 1.10], big: [15, 2.90], perish: 0 },

    cocoa:    { n: 'Cocoa Tin',  unit: 'scoop', pack: [5, 1.35], big: [15, 3.60], perish: 0 },
    milk:     { n: 'Milk',       unit: 'pour',  pack: [5, 1.10], big: [15, 2.90], perish: 0.45 },
    toppings: { n: 'Toppings',   unit: 'pinch', pack: [5, 0.70], big: [15, 1.80], perish: 0 },
    mugs:     { n: 'Warm Mugs',  unit: 'cup',   pack: [5, 0.60], big: [15, 1.50], perish: 0 },
    apples:   { n: 'Cider Jugs', unit: 'pour',  pack: [5, 1.40], big: [15, 3.75], perish: 0.30 },

    dough:    { n: 'Pretzel Dough', unit: 'ball',  pack: [5, 1.60], big: [15, 4.25], perish: 0.35 },
    salt:     { n: 'Coarse Salt',   unit: 'pinch', pack: [5, 0.40], big: [15, 1.00], perish: 0 },
    butter:   { n: 'Butter',        unit: 'pat',   pack: [5, 0.85], big: [15, 2.20], perish: 0.25 },
    bags:     { n: 'Snack Bags',    unit: 'bag',   pack: [5, 0.50], big: [15, 1.25], perish: 0 },
    chips:    { n: 'Choc Chips',    unit: 'scoop', pack: [5, 1.15], big: [15, 3.00], perish: 0 }
  };

  var ITEMS = {
    lemonade: { n: 'Lemonade',    cat: 'pitcher', icon: 'ico_lemonade', basePrice: 1.75, needs: { lemons: 1, sugar: 1, ice: 1, cups: 1 } },
    tea:      { n: 'Iced Tea',    cat: 'pitcher', icon: 'ico_tea',      basePrice: 2.00, needs: { tea: 1, sugar: 1, ice: 1, cups: 1 } },
    cocoa:    { n: 'Yard Cocoa',  cat: 'cocoa',   icon: 'ico_cocoa',    basePrice: 2.00, needs: { cocoa: 1, milk: 1, toppings: 1, mugs: 1 } },
    cider:    { n: 'Warm Cider',  cat: 'cocoa',   icon: 'ico_cider',    basePrice: 2.25, needs: { apples: 1, toppings: 1, mugs: 1 } },
    pretzel:  { n: 'Soft Pretzel',cat: 'pretzel', icon: 'ico_pretzel',  basePrice: 2.00, needs: { dough: 1, salt: 1, butter: 1, bags: 1 } },
    cookie:   { n: 'Yard Cookie', cat: 'pretzel', icon: 'ico_cookie',   basePrice: 2.25, needs: { dough: 1, butter: 1, chips: 1, bags: 1 } }
  };

  var WEATHER = {
    hot:    { n: 'Hot',     sym: '🔥', sky: ['#ff9e44', '#ffd07b'], hint: 'Thirsty sun! Cold drinks boom.',       dem: { pitcher: 1.45, cocoa: 0.45, pretzel: 0.95 }, traffic: 1.20, iceMod: 1 },
    sunny:  { n: 'Sunny',   sym: '☀',  sky: ['#5cc4ff', '#bce8ff'], hint: 'Bright fence weather. Cold & snacks steady.', dem: { pitcher: 1.25, cocoa: 0.70, pretzel: 1.05 }, traffic: 1.08, iceMod: 0 },
    cloudy: { n: 'Cloudy',  sym: '☁',  sky: ['#7b8fa8', '#b8c6d6'], hint: 'Cool breeze. Cocoa & pretzels shine.', dem: { pitcher: 0.85, cocoa: 1.18, pretzel: 1.25 }, traffic: 0.95, iceMod: -1 },
    rain:   { n: 'Rain',    sym: '☔', sky: ['#394661', '#5a6c8e'], hint: 'Wet yard! Warm cups up; Umbrella helps.', dem: { pitcher: 0.50, cocoa: 1.45, pretzel: 1.12 }, traffic: 0.72, iceMod: -1 },
    shower: { n: 'Showers', sym: '🌦', sky: ['#61b8f0', '#a9d7f5'], hint: 'Starts sunny, pop-up rain later!',     dem: { pitcher: 1.10, cocoa: 1.05, pretzel: 1.10 }, traffic: 0.98, iceMod: 0 }
  };

  var CREW = {
    bear:   { n: 'Bear',   frame: 'bear',   perk: 'Fast with snacks & crowds (+10% patience)' },
    domino: { n: 'Domino', frame: 'domino', perk: 'War Room chalk (+8% reputation gain)' },
    pickle: { n: 'Pickle', frame: 'pickle', perk: 'Pure chaos (+12% regular tips)' }
  };

  var REGULARS = [
    { id: 'meatball', n: 'Sgt. Meatball', frame: 'meatball', fav: ['cocoa', 'pretzel', 'lemonade'], maxP: 2.50, quipOk: 'Meatball sniffs clean ice and orders a double!', quipNo: 'Meatball blows his whistle: too steep!' },
    { id: 'mittens',  n: 'Mittens',       frame: 'mittens',  fav: ['cocoa', 'cookie', 'tea'],       maxP: 2.25, quipOk: 'Mittens\' bell jingles. She likes the batch!', quipNo: 'Mittens hisses from the fence and struts off.' },
    { id: 'tullio',   n: 'Tullio',        frame: 'tullio',   fav: ['pretzel', 'cider', 'lemonade'], maxP: 2.50, quipOk: 'Tullio trades shiny caps plus a tip!', quipNo: 'Tullio slips back toward the alley.' }
  ];

  // ---------- Daily Seed Computation ----------
  function getYardDayInfo(nyDate, dayNum) {
    var r = rngFromStr(nyDate + ':yard:' + dayNum);
    var pool = ['hot', 'sunny', 'sunny', 'cloudy', 'rain', 'shower'];
    var wk = pool[Math.floor(r() * pool.length)];
    var rNext = rngFromStr(nyDate + ':yard:' + (dayNum + 1));
    var wkNext = pool[Math.floor(rNext() * pool.length)];
    // Seeded Other Yard NPC stand picks a weather-savvy starter most days
    var wx = WEATHER[wk];
    var bestCat = 'pitcher';
    if (wx.dem.cocoa >= wx.dem.pitcher && wx.dem.cocoa >= wx.dem.pretzel) bestCat = 'cocoa';
    else if (wx.dem.pretzel > wx.dem.pitcher) bestCat = 'pretzel';
    var rivalCat = r() < 0.72 ? bestCat : ['pitcher', 'cocoa', 'pretzel'][Math.floor(r() * 3)];
    var rivalItem = STARTERS[rivalCat].item1;
    var rivalPrice = [1.50, 1.75, 2.00, 2.25][Math.floor(r() * 4)];
    var rivalSold = Math.round((6 + dayNum * 1.3 + r() * 4) * wx.traffic);
    var rivalNet = Math.round((rivalSold * (rivalPrice - 0.62) + dayNum * 0.6) * 100) / 100;
    return {
      nyDate: nyDate,
      wk: wk,
      wkNext: wkNext,
      rivalCat: rivalCat,
      rivalItem: rivalItem,
      rivalPrice: rivalPrice,
      rivalSold: rivalSold,
      rivalNet: Math.max(4.5, rivalNet)
    };
  }

  // ---------- State ----------
  function freshState() {
    return {
      v: 1,
      starter: null, // 'pitcher' | 'cocoa' | 'pretzel'
      crew: 'bear',
      day: 1,
      money: 18.00,
      rep: 2.5,
      inv: {},
      prices: { lemonade: 1.75, tea: 2.00, cocoa: 2.00, cider: 2.25, pretzel: 2.00, cookie: 2.25 },
      recipe: [3, 3, 3],
      ups: { tool: false, keeper: false, umbrella: false, sign: false },
      unlocked2: false,
      seasonDone: false,
      endless: false,
      totNet: 0,
      totSold: 0,
      totRivalNet: 0,
      lastReport: null
    };
  }

  var S = store.get(SAVE_KEY);
  if (!S || S.v !== 1) S = freshState();
  function save() { store.set(SAVE_KEY, S); }

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }
  function fmt(n) { return (n < 0 ? '-$' : '$') + Math.abs(n).toFixed(2); }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function activeItems() {
    if (!S.starter) return [];
    var st = STARTERS[S.starter];
    return S.unlocked2 ? [st.item1, st.item2] : [st.item1];
  }
  function activeIngs() {
    if (!S.starter) return [];
    var st = STARTERS[S.starter];
    return S.unlocked2 ? st.ings.slice(0, 5) : st.ings.slice(0, 4);
  }
  function canMakeItem(itemId) {
    var needs = ITEMS[itemId].needs;
    for (var k in needs) {
      if ((S.inv[k] || 0) < needs[k]) return false;
    }
    return true;
  }
  function countMakeable(itemId) {
    var needs = ITEMS[itemId].needs;
    var m = 999;
    for (var k in needs) {
      m = Math.min(m, Math.floor((S.inv[k] || 0) / needs[k]));
    }
    return m === 999 ? 0 : m;
  }
  function totalMakeable() {
    var items = activeItems();
    var sum = 0;
    items.forEach(function (id) { sum += countMakeable(id); });
    return sum;
  }
  function unitCost(itemId) {
    var needs = ITEMS[itemId].needs;
    var c = 0;
    for (var k in needs) {
      var ing = INGS[k];
      c += (ing.pack[1] / ing.pack[0]) * needs[k];
    }
    return c;
  }
  function idealRecipe(wk) {
    var st = STARTERS[S.starter];
    var base = st.recIdealBase.slice();
    var wx = WEATHER[wk];
    if (wx.iceMod) base[2] = clamp(base[2] + wx.iceMod, 1, 5);
    return base;
  }
  function recipeQuality(wk) {
    var id = idealRecipe(wk);
    var d = Math.abs(S.recipe[0] - id[0]) + Math.abs(S.recipe[1] - id[1]) + Math.abs(S.recipe[2] - id[2]);
    var q = 1.05 - 0.11 * d + (S.ups.tool ? 0.12 : 0);
    return clamp(q, 0.35, 1.18);
  }

  // ---------- App Routing ----------
  var screen = 'gate'; // 'gate' | 'pick' | 'prep' | 'day' | 'report' | 'comic' | 'finale'
  var prepTab = 'board';
  var confirmReset = false;
  var daySim = null;
  var rafId = null;

  function updateHud() {
    var ny = nyDateStr();
    var info = getYardDayInfo(ny, S.day);
    var wx = WEATHER[info.wk];
    $('hDay').textContent = S.day <= 7 ? (S.day + '/7') : ('DAY ' + S.day);
    $('hMoney').textContent = S.money.toFixed(2);
    $('hRep').textContent = S.rep.toFixed(1);
    $('hWx').textContent = wx.sym + ' ' + wx.n.toUpperCase();
    $('btnMute').textContent = muted ? '🔇' : '🔊';
  }

  function setScreen(next) {
    screen = next;
    if (rafId && next !== 'day') {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    confirmReset = false;
    render();
  }

  // ---------- Render Screens ----------
  function render() {
    updateHud();
    var view = $('view');
    if (screen === 'gate') renderGate(view);
    else if (screen === 'pick') renderPick(view);
    else if (screen === 'prep') renderPrep(view);
    else if (screen === 'day') renderDay(view);
    else if (screen === 'report') renderReport(view);
    else if (screen === 'comic') renderComic(view);
    else if (screen === 'finale') renderFinale(view);
  }

  function renderGate(el) {
    var hasSave = !!S.starter;
    el.className = 'screen gate';
    el.innerHTML =
      '<div class="poster-box"><img src="promo/yard-stand-card.jpg" alt="Bear, Domino, and Pickle at the Yard Lemonade Stand"></div>' +
      '<div class="gate-title">YARD LEMONADE STAND</div>' +
      '<div class="gate-sub">Everyone opening this card sells on the same Yard day (' + esc(nyDateStr()) + ' NY). Pick your stand, grow to snacks, dodge squirrels!</div>' +
      '<button type="button" class="go" id="btnPlay">' + (hasSave ? 'CONTINUE DAY ' + S.day : 'TAP TO PLAY') + '</button>' +
      '<div class="mini-note">X-Comix Fan Arcade &middot; Saves locally only</div>';
    $('btnPlay').onclick = function () {
      SFX.tap();
      setScreen(S.starter ? 'prep' : 'pick');
    };
  }

  function renderPick(el) {
    var info = getYardDayInfo(nyDateStr(), 1);
    var wx = WEATHER[info.wk];
    el.className = 'screen';
    var h = '<div class="pick-head"><h2>PICK YOUR STARTING STAND</h2>' +
      '<p>Today (' + esc(info.nyDate) + ' NY): ' + wx.sym + ' ' + wx.n + ' &mdash; ' + esc(wx.hint) + '</p></div>';
    h += '<div class="starters">';
    ['pitcher', 'cocoa', 'pretzel'].forEach(function (id) {
      var st = STARTERS[id];
      h += '<div class="scard">' +
        '<h3>' + esc(st.name) + '</h3>' +
        '<canvas width="64" height="46" data-stand="' + st.standFrame + '"></canvas>' +
        '<div class="item">' + esc(ITEMS[st.item1].n) + '</div>' +
        '<div class="perk">' + esc(st.perk) + '</div>' +
        '<div class="unlock">' + esc(st.unlockNote) + '</div>' +
        '<button type="button" class="go" data-pick="' + id + '">PICK</button>' +
        '</div>';
    });
    h += '</div>';
    h += '<div class="mini-note" style="text-align:center">You own your stand &amp; upgrades. Other Yard dogs sell across the lot.</div>';
    el.innerHTML = h;

    // Draw tiny stand previews
    var cvs = el.querySelectorAll('canvas[data-stand]');
    function drawPreviews() {
      cvs.forEach(function (cv) {
        var ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, cv.width, cv.height);
        spr(ctx, cv.getAttribute('data-stand'), 4, 3, 1);
      });
    }
    if (spriteReady()) drawPreviews();
    else sheet.addEventListener('load', drawPreviews, { once: true });

    el.querySelectorAll('button[data-pick]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-pick');
        SFX.fanfare();
        S = freshState();
        S.starter = id;
        // Starter kit: give 10 starter servings' worth of supplies + $14 working cash
        var item1 = ITEMS[STARTERS[id].item1];
        for (var k in item1.needs) S.inv[k] = 10 * item1.needs[k];
        S.money = 14.00;
        save();
        prepTab = 'board';
        setScreen('prep');
      };
    });
  }

  function renderPrep(el) {
    el.className = 'screen';
    var ny = nyDateStr();
    var info = getYardDayInfo(ny, S.day);
    var wx = WEATHER[info.wk];
    var wxN = WEATHER[info.wkNext];
    var st = STARTERS[S.starter];
    var items = activeItems();

    var h = '<div class="tabs">' +
      '<button type="button" data-tab="board" class="' + (prepTab === 'board' ? 'on' : '') + '">BOARD</button>' +
      '<button type="button" data-tab="stock" class="' + (prepTab === 'stock' ? 'on' : '') + '">STOCK</button>' +
      '<button type="button" data-tab="menu" class="' + (prepTab === 'menu' ? 'on' : '') + '">MENU</button>' +
      '<button type="button" data-tab="shop" class="' + (prepTab === 'shop' ? 'on' : '') + '">UPGRADES</button>' +
      '</div><div class="panel">';

    if (prepTab === 'board') {
      var tomText = S.ups.sign
        ? (wxN.sym + ' ' + wxN.n + ' (' + wxN.hint + ')')
        : (wxN.sym + ' Looks ' + (wxN.n === 'Hot' || wxN.n === 'Sunny' ? 'bright' : 'cool/wet') + ' (Chalkboard sharpens)');
      h += '<div class="card">' +
        '<div class="card-row"><span class="lbl">SHARED YARD (' + esc(info.nyDate) + ' NY)</span><span class="val"><b>' + esc(st.name) + '</b></span></div>' +
        '<div class="val" style="margin-top:3px">Today: ' + wx.sym + ' ' + wx.n + ' &mdash; <span style="color:#8be9ff">' + esc(wx.hint) + '</span></div>' +
        '<div class="lbl" style="margin-top:3px">Tomorrow: ' + esc(tomText) + '</div>' +
        '<div class="hint-tag">Other Yard Rival (Lark &amp; Crew): ' + esc(ITEMS[info.rivalItem].n) + ' @ ' + fmt(info.rivalPrice) + '</div>' +
        '</div>';

      h += '<div class="card"><div class="lbl" style="margin-bottom:4px">COUNTER CREW (tap to switch, free):</div><div class="crew-row">';
      ['bear', 'domino', 'pickle'].forEach(function (cid) {
        var c = CREW[cid];
        h += '<button type="button" class="crew-btn' + (S.crew === cid ? ' on' : '') + '" data-crew="' + cid + '">' +
          '<canvas width="24" height="32" data-spr="' + c.frame + '"></canvas>' +
          '<b>' + esc(c.n) + '</b><small>' + (cid === 'bear' ? 'Patience' : cid === 'domino' ? 'Rep+' : 'Tips+') + '</small></button>';
      });
      h += '</div><div class="lbl" style="margin-top:4px;text-align:center">' + esc(CREW[S.crew].perk) + '</div></div>';

      h += '<div class="card"><div class="card-row"><span class="lbl">ACTIVE MENU</span><span class="val">' +
        items.map(function (id) { return esc(ITEMS[id].n) + ' (' + fmt(S.prices[id]) + ')'; }).join(' + ') +
        '</span></div></div>';
    } else if (prepTab === 'stock') {
      // Quick Auto-Stock 10 button
      var autoCost = calcAutoStockCost(15);
      h += '<div class="srow" style="background:#142336;border-color:#2ee6ff">' +
        '<div class="info"><div class="name">Quick Restock (fill to 15)</div><div class="sub">Tops up ingredients to 15 servings</div></div>' +
        '<button type="button" class="cyan sm" id="btnAutoStock"' + (autoCost <= 0 || S.money < autoCost ? ' disabled' : '') + '>' +
        (autoCost <= 0 ? 'FULL' : 'BUY ' + fmt(autoCost)) + '</button></div>';

      activeIngs().forEach(function (ik) {
        var ing = INGS[ik];
        var have = S.inv[ik] || 0;
        h += '<div class="srow">' +
          '<div class="info"><div class="name">' + esc(ing.n) + ': <b style="color:#ffd400">' + have + '</b></div>' +
          '<div class="sub">' + (ing.perish >= 1 ? 'Melts overnight' : ing.perish > 0 ? 'Perishes slightly' : 'Keeps dry') +
          ' &middot; ' + ing.pack[0] + ' for ' + fmt(ing.pack[1]) + '</div></div>' +
          '<div class="acts">' +
          '<button type="button" class="sm" data-buy="' + ik + ':pack"' + (S.money < ing.pack[1] ? ' disabled' : '') + '>+' + ing.pack[0] + '<br>' + fmt(ing.pack[1]) + '</button>' +
          '<button type="button" class="sm gold" data-buy="' + ik + ':big"' + (S.money < ing.big[1] ? ' disabled' : '') + '>+' + ing.big[0] + '<br>' + fmt(ing.big[1]) + '</button>' +
          '</div></div>';
      });
    } else if (prepTab === 'menu') {
      items.forEach(function (id) {
        var it = ITEMS[id];
        var p = S.prices[id];
        var uc = unitCost(id);
        h += '<div class="srow">' +
          '<div class="info"><div class="name">' + esc(it.n) + '</div>' +
          '<div class="sub">Cost ' + fmt(uc) + ' &middot; Makeable: <b>' + countMakeable(id) + '</b> (Rival ' + fmt(info.rivalPrice) + ')</div></div>' +
          '<div class="stepper">' +
          '<button type="button" class="sm" data-pr="' + id + ':-0.25">-</button>' +
          '<b>' + fmt(p) + '</b>' +
          '<button type="button" class="sm" data-pr="' + id + ':0.25">+</button>' +
          '</div></div>';
      });
      var labels = st.recLabels;
      var idRec = idealRecipe(info.wk);
      h += '<div class="card"><div class="lbl" style="margin-bottom:4px">RECIPE BALANCE (3 = balanced; weather shifts ideal)</div>';
      for (var ri = 0; ri < 3; ri++) {
        h += '<div class="card-row" style="margin-top:4px">' +
          '<span class="val" style="font-size:12px">' + esc(labels[ri]) + ' <small style="color:#8be9ff">(ideal ~' + idRec[ri] + ')</small></span>' +
          '<div class="stepper">' +
          '<button type="button" class="sm" data-rec="' + ri + ':-1">-</button>' +
          '<b>' + S.recipe[ri] + '/5</b>' +
          '<button type="button" class="sm" data-rec="' + ri + ':1">+</button>' +
          '</div></div>';
      }
      h += '</div>';
    } else if (prepTab === 'shop') {
      var upList = [
        { k: 'tool',     n: st.toolName,    c: 10, d: st.toolDesc + ' (Starter discount!)' },
        { k: 'keeper',   n: st.keeperName,  c: 12, d: st.keeperDesc },
        { k: 'sign',     n: 'Chalkboard Sign', c: 14, d: '+25% traffic, faster rep, sharp tomorrow forecast' },
        { k: 'umbrella', n: 'Yard Umbrella',   c: 16, d: 'Rain shelter + cuts Sprinkler Soak loss' }
      ];
      // Mid-season Unlock Item #2
      var u2Item = ITEMS[st.item2];
      var u2Avail = S.day >= 2;
      h += '<div class="srow" style="border-color:#7dff5a">' +
        '<div class="info"><div class="name">Unlock: ' + esc(u2Item.n) + '</div>' +
        '<div class="sub">' + (S.unlocked2 ? 'Unlocked! Sell both items during the day.' : (u2Avail ? 'Add a 2nd menu item & grow the stand!' : 'Available starting Day 2')) + '</div></div>' +
        (S.unlocked2
          ? '<span class="hint-tag" style="border-color:#7dff5a;color:#7dff5a">OWNED</span>'
          : '<button type="button" class="go sm" id="btnUnlock2"' + (!u2Avail || S.money < 12 ? ' disabled' : '') + '>UNLOCK<br>$12.00</button>') +
        '</div>';

      upList.forEach(function (u) {
        var owned = !!S.ups[u.k];
        h += '<div class="srow">' +
          '<div class="info"><div class="name">' + esc(u.n) + '</div><div class="sub">' + esc(u.d) + '</div></div>' +
          (owned
            ? '<span class="hint-tag">OWNED</span>'
            : '<button type="button" class="gold sm" data-up="' + u.k + ':' + u.c + '"' + (S.money < u.c ? ' disabled' : '') + '>BUY<br>' + fmt(u.c) + '</button>') +
          '</div>';
      });
    }

    var makeTot = totalMakeable();
    h += '</div><div class="prep-foot">' +
      '<div class="make">Can serve: <b>' + makeTot + '</b></div>' +
      '<button type="button" class="go" id="btnOpen">OPEN STAND &#9654;</button>' +
      '</div>';

    el.innerHTML = h;

    // Draw crew thumbnails
    var crewCvs = el.querySelectorAll('canvas[data-spr]');
    function drawCrew() {
      crewCvs.forEach(function (cv) {
        var ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, cv.width, cv.height);
        spr(ctx, cv.getAttribute('data-spr'), 0, 0, 1);
      });
    }
    if (spriteReady()) drawCrew();
    else sheet.addEventListener('load', drawCrew, { once: true });

    el.querySelectorAll('.tabs button').forEach(function (b) {
      b.onclick = function () { SFX.tap(); prepTab = b.getAttribute('data-tab'); render(); };
    });
    el.querySelectorAll('button[data-crew]').forEach(function (b) {
      b.onclick = function () { SFX.tap(); S.crew = b.getAttribute('data-crew'); save(); render(); };
    });
    el.querySelectorAll('button[data-buy]').forEach(function (b) {
      b.onclick = function () {
        var parts = b.getAttribute('data-buy').split(':');
        var ing = INGS[parts[0]], pkg = ing[parts[1]];
        if (S.money + 1e-6 >= pkg[1]) {
          S.money = Math.round((S.money - pkg[1]) * 100) / 100;
          S.inv[parts[0]] = (S.inv[parts[0]] || 0) + pkg[0];
          daySpent += pkg[1];
          SFX.coin(); save(); render();
        } else SFX.no();
      };
    });
    var asBtn = $('btnAutoStock');
    if (asBtn) {
      asBtn.onclick = function () {
        buyAutoStock(15);
      };
    }
    el.querySelectorAll('button[data-pr]').forEach(function (b) {
      b.onclick = function () {
        var parts = b.getAttribute('data-pr').split(':');
        var id = parts[0], delta = parseFloat(parts[1]);
        S.prices[id] = clamp(Math.round((S.prices[id] + delta) * 100) / 100, 0.50, 5.00);
        SFX.tap(); save(); render();
      };
    });
    el.querySelectorAll('button[data-rec]').forEach(function (b) {
      b.onclick = function () {
        var parts = b.getAttribute('data-rec').split(':');
        var idx = parseInt(parts[0], 10), d = parseInt(parts[1], 10);
        S.recipe[idx] = clamp(S.recipe[idx] + d, 1, 5);
        SFX.tap(); save(); render();
      };
    });
    el.querySelectorAll('button[data-up]').forEach(function (b) {
      b.onclick = function () {
        var parts = b.getAttribute('data-up').split(':');
        var k = parts[0], cost = parseFloat(parts[1]);
        if (!S.ups[k] && S.money + 1e-6 >= cost) {
          S.money = Math.round((S.money - cost) * 100) / 100;
          S.ups[k] = true;
          SFX.fanfare(); save(); render();
        } else SFX.no();
      };
    });
    var u2Btn = $('btnUnlock2');
    if (u2Btn) {
      u2Btn.onclick = function () {
        if (S.day >= 2 && !S.unlocked2 && S.money + 1e-6 >= 12) {
          S.money = Math.round((S.money - 12) * 100) / 100;
          S.unlocked2 = true;
          // Gift 5 units of the new ingredient so player can try it immediately
          var newIng = STARTERS[S.starter].ings[4];
          S.inv[newIng] = (S.inv[newIng] || 0) + 5;
          SFX.fanfare(); save(); render();
        } else SFX.no();
      };
    }
    $('btnOpen').onclick = function () {
      if (totalMakeable() <= 0) {
        SFX.no();
        prepTab = 'stock';
        render();
        return;
      }
      SFX.tap();
      startDaySim();
      setScreen('day');
    };
  }

  var daySpent = 0;
  function calcAutoStockCost(targetServings) {
    var need = {};
    activeItems().forEach(function (id) {
      var n = ITEMS[id].needs;
      for (var k in n) need[k] = Math.max(need[k] || 0, targetServings * n[k]);
    });
    var cost = 0;
    for (var k in need) {
      var gap = Math.max(0, need[k] - (S.inv[k] || 0));
      var packs = Math.ceil(gap / INGS[k].pack[0]);
      cost += packs * INGS[k].pack[1];
    }
    return Math.round(cost * 100) / 100;
  }
  function buyAutoStock(targetServings) {
    var cost = calcAutoStockCost(targetServings);
    if (cost <= 0 || S.money + 1e-6 < cost) { SFX.no(); return; }
    var need = {};
    activeItems().forEach(function (id) {
      var n = ITEMS[id].needs;
      for (var k in n) need[k] = Math.max(need[k] || 0, targetServings * n[k]);
    });
    for (var k in need) {
      var gap = Math.max(0, need[k] - (S.inv[k] || 0));
      var packs = Math.ceil(gap / INGS[k].pack[0]);
      if (packs > 0) S.inv[k] = (S.inv[k] || 0) + packs * INGS[k].pack[0];
    }
    S.money = Math.round((S.money - cost) * 100) / 100;
    daySpent += cost;
    SFX.coin(); save(); render();
  }

  // ---------- Live Day Simulation ----------
  function startDaySim() {
    var ny = nyDateStr();
    var info = getYardDayInfo(ny, S.day);
    var wx = WEATHER[info.wk];
    var st = STARTERS[S.starter];
    var items = activeItems();

    // Calculate how many customers arrive today from shared seed + reputation + upgrades
    var baseTraffic = 11 + S.day * 1.4;
    var demMult = 0;
    items.forEach(function (id) { demMult = Math.max(demMult, wx.dem[ITEMS[id].cat]); });
    var signBoost = S.ups.sign ? 1.25 : 1.0;
    var rainSave = (info.wk === 'rain' && S.ups.umbrella) ? 1.25 : 1.0;
    var nCust = Math.round(baseTraffic * wx.traffic * (0.65 + 0.35 * demMult) * (0.8 + S.rep * 0.08) * signBoost * rainSave);
    nCust = clamp(nCust, 7, 26);

    var r = rngFromStr(ny + ':sim:' + S.day + ':' + S.starter);
    var arrivals = [];
    for (var i = 0; i < nCust; i++) {
      arrivals.push(1.0 + (i / nCust) * (DAY_LEN - 5.5) + r() * 1.4);
    }
    arrivals.sort(function (a, b) { return a - b; });

    // Schedule 1 Squirrel Raid + 1 Sprinkler Soak during the day
    var evTimes = [
      { type: 'squirrel', t: DAY_LEN * (0.28 + r() * 0.14), triggered: false },
      { type: 'sprinkler', t: DAY_LEN * (0.62 + r() * 0.14), triggered: false }
    ];

    daySim = {
      t: 0,
      speed: 1,
      info: info,
      wkNow: info.wk === 'shower' ? 'sunny' : info.wk,
      showerFlipped: false,
      arrivals: arrivals,
      ai: 0,
      custs: [],
      queue: [],
      evTimes: evTimes,
      activeEv: null, // { type, left, maxLeft }
      sold: 0,
      rev: 0,
      lostPrice: 0,
      lostStock: 0,
      lostSoak: 0,
      lostWait: 0,
      floats: [],
      quip: CREW[S.crew].n + ' sets up at the fence. Tap to serve!',
      serveBounce: 0,
      r: r
    };
  }

  function pickCustomerType(sim) {
    var r = sim.r();
    if (r < 0.14) return { kind: 'regular', reg: REGULARS[0], frame: 'meatball' };
    if (r < 0.27) return { kind: 'regular', reg: REGULARS[1], frame: 'mittens' };
    if (r < 0.38) return { kind: 'regular', reg: REGULARS[2], frame: 'tullio' };
    var generics = ['pebble_l', 'lark_l', 'thistle', 'nix'];
    var g = generics[Math.floor(sim.r() * generics.length)];
    return { kind: 'dog', frame: g };
  }

  function spawnCustomer(sim) {
    var items = activeItems();
    var wx = WEATHER[sim.wkNow];
    // Pick desired item weighted by shared weather demand
    var want = items[0];
    if (items.length > 1) {
      var w0 = wx.dem[ITEMS[items[0]].cat];
      var w1 = wx.dem[ITEMS[items[1]].cat];
      want = sim.r() < (w0 / (w0 + w1)) ? items[0] : items[1];
    }
    var who = pickCustomerType(sim);
    if (who.kind === 'regular') {
      for (var i = 0; i < items.length; i++) {
        if (who.reg.fav.indexOf(items[i]) >= 0) { want = items[i]; break; }
      }
    }
    var qQual = recipeQuality(sim.wkNow);
    var catDem = wx.dem[ITEMS[want].cat];
    var wtp = ITEMS[want].basePrice * (0.78 + 0.30 * catDem) * (0.75 + 0.35 * qQual) * (0.9 + sim.r() * 0.35);
    if (who.kind === 'regular') wtp = Math.max(wtp, who.reg.maxP);

    var c = {
      x: -28,
      y: 132,
      state: 'walk', // walk | queue | leave
      dir: 1,
      want: want,
      wtp: wtp,
      who: who,
      wait: 0,
      maxWait: (S.crew === 'bear' ? 11.5 : 10.0) + (S.ups.tool ? 1.5 : 0),
      bubble: ITEMS[want].icon,
      mood: null
    };
    sim.custs.push(c);
  }

  function stepDay(dt) {
    var sim = daySim;
    if (!sim) return;
    sim.t += dt;
    if (sim.serveBounce > 0) sim.serveBounce = Math.max(0, sim.serveBounce - dt);

    // Pop-up shower mid-day flip
    if (sim.info.wk === 'shower' && !sim.showerFlipped && sim.t >= DAY_LEN * 0.48) {
      sim.showerFlipped = true;
      sim.wkNow = 'rain';
      sim.quip = S.ups.umbrella ? 'Pop-up shower! Umbrella keeps the stand dry.' : 'Pop-up shower! Warm cups & snacks take the lead.';
      SFX.splash();
    }

    // Spawn arrivals
    while (sim.ai < sim.arrivals.length && sim.arrivals[sim.ai] <= sim.t) {
      spawnCustomer(sim);
      sim.ai++;
    }

    // Trigger Yard chaos events
    sim.evTimes.forEach(function (ev) {
      if (!ev.triggered && sim.t >= ev.t && !sim.activeEv) {
        ev.triggered = true;
        sim.activeEv = { type: ev.type, left: 4.5, maxLeft: 4.5 };
        if (ev.type === 'squirrel') {
          sim.quip = 'SQUIRREL ON THE CRATE! Tap BARK to shoo it!';
          SFX.no();
        } else {
          sim.quip = 'SPRINKLER GONE WILD! Slam the shutoff!';
          SFX.splash();
        }
        syncDayControls();
      }
    });

    if (sim.activeEv) {
      sim.activeEv.left -= dt;
      if (sim.activeEv.left <= 0) {
        resolveEventFail(sim);
      }
    }

    // Update customers
    var standStopX = 136;
    for (var i = 0; i < sim.custs.length; i++) {
      var c = sim.custs[i];
      if (c.state === 'walk') {
        c.x += 92 * dt;
        if (c.x >= standStopX - 42) {
          // Check price & queue cap
          var price = S.prices[c.want];
          if (!canMakeItem(c.want)) {
            c.state = 'leave'; c.dir = -1; c.mood = 'OUT';
            sim.lostStock++;
            sim.quip = 'Out of ' + ITEMS[c.want].n + ' stock!';
          } else if (price > c.wtp + 0.15) {
            c.state = 'leave'; c.dir = -1; c.mood = '$$$';
            sim.lostPrice++;
            S.rep = Math.max(1.0, S.rep - 0.03);
            if (c.who.kind === 'regular') sim.quip = c.who.reg.quipNo;
            else sim.quip = 'Too pricey! A customer heads toward the Other Yard.';
          } else if (sim.queue.length >= 4) {
            c.state = 'leave'; c.dir = -1; c.mood = '...';
            sim.lostWait++;
          } else {
            c.state = 'queue';
            sim.queue.push(c);
          }
        }
      } else if (c.state === 'queue') {
        var qi = sim.queue.indexOf(c);
        var tx = standStopX - qi * 38;
        c.x += (tx - c.x) * Math.min(1, 8 * dt);
        c.wait += dt;
        if (c.wait > c.maxWait) {
          sim.queue.splice(qi, 1);
          c.state = 'leave'; c.dir = -1; c.mood = '...';
          sim.lostWait++;
          S.rep = Math.max(1.0, S.rep - 0.02);
        }
      } else if (c.state === 'leave') {
        c.x += 110 * c.dir * dt;
      }
    }
    sim.custs = sim.custs.filter(function (c) { return c.x > -48 && c.x < 500; });

    // Update floats
    for (var fi = 0; fi < sim.floats.length; fi++) {
      sim.floats[fi].y -= 24 * dt;
      sim.floats[fi].a -= dt;
    }
    sim.floats = sim.floats.filter(function (f) { return f.a > 0; });

    // End day check
    if (sim.t >= DAY_LEN && sim.queue.length === 0 && !sim.activeEv && sim.custs.every(function (c) { return c.state === 'leave'; })) {
      finishDay(sim);
    }
  }

  function resolveEventTap() {
    var sim = daySim;
    if (!sim || !sim.activeEv) return;
    var t = sim.activeEv.type;
    sim.activeEv = null;
    sim.serveBounce = 0.35;
    if (t === 'squirrel') {
      SFX.bark();
      S.rep = clamp(S.rep + 0.08, 1, 5);
      sim.floats.push({ x: 210, y: 105, txt: '*WOOF!*', col: '#ffd400', a: 1.1 });
      sim.quip = CREW[S.crew].n + ' barks! Squirrel scrambles over the fence.';
    } else {
      SFX.coin();
      S.rep = clamp(S.rep + 0.06, 1, 5);
      sim.floats.push({ x: 300, y: 118, txt: '*CLANK!*', col: '#2ee6ff', a: 1.1 });
      sim.quip = 'Valve slammed shut! Stand stays dry.';
    }
    syncDayControls();
  }

  function resolveEventFail(sim) {
    var t = sim.activeEv.type;
    sim.activeEv = null;
    SFX.no();
    if (t === 'squirrel') {
      var ingK = activeIngs()[0];
      var lost = Math.min(S.inv[ingK] || 0, 2);
      S.inv[ingK] = Math.max(0, (S.inv[ingK] || 0) - lost);
      sim.floats.push({ x: 225, y: 105, txt: '-' + lost + ' ' + INGS[ingK].n, col: '#ff5c8a', a: 1.2 });
      sim.quip = 'Squirrel raided the crate! Lost ' + lost + ' ' + INGS[ingK].n + '.';
    } else {
      var soakCount = S.ups.umbrella ? (sim.queue.length > 2 ? 1 : 0) : Math.min(2, sim.queue.length);
      for (var k = 0; k < soakCount; k++) {
        var c = sim.queue.pop();
        if (c) { c.state = 'leave'; c.dir = -1; c.mood = '💧'; sim.lostSoak++; }
      }
      sim.floats.push({ x: 245, y: 115, txt: S.ups.umbrella ? 'UMBRELLA!' : 'SOAKED!', col: '#8be9ff', a: 1.2 });
      sim.quip = S.ups.umbrella ? 'Sprinkler sprayed, but the Umbrella saved the line!' : 'Sprinkler soaked the line! ' + soakCount + ' ran off.';
    }
    syncDayControls();
  }

  function serveFront(itemId) {
    var sim = daySim;
    if (!sim) return;
    if (!sim.queue.length) {
      SFX.tap();
      sim.quip = 'Waiting for the next Yard customer...';
      return;
    }
    var c = sim.queue[0];
    if (c.want !== itemId) {
      SFX.no();
      sim.floats.push({ x: 170, y: 105, txt: 'WANTS ' + ITEMS[c.want].n.toUpperCase(), col: '#ff9e44', a: 0.9 });
      sim.quip = 'Front customer wants ' + ITEMS[c.want].n + '!';
      return;
    }
    if (!canMakeItem(itemId)) {
      SFX.no();
      sim.queue.shift();
      c.state = 'leave'; c.dir = -1; c.mood = 'OUT';
      sim.lostStock++;
      sim.quip = 'Out of supplies for ' + ITEMS[itemId].n + '!';
      syncDayControls();
      return;
    }
    // Consume ingredients
    var needs = ITEMS[itemId].needs;
    for (var k in needs) S.inv[k] -= needs[k];
    var qty = 1;
    var tip = 0;
    if (c.who.kind === 'regular') {
      if (c.who.reg.id === 'meatball' && canMakeItem(itemId)) {
        for (var k2 in needs) S.inv[k2] -= needs[k2];
        qty = 2;
        tip = 0.50;
      } else {
        tip = S.crew === 'pickle' ? 0.40 : 0.25;
      }
      sim.quip = c.who.reg.quipOk;
    } else {
      sim.quip = 'Served ' + ITEMS[itemId].n + '!';
    }
    var earn = Math.round((S.prices[itemId] * qty + tip) * 100) / 100;
    S.money = Math.round((S.money + earn) * 100) / 100;
    sim.sold += qty;
    sim.rev = Math.round((sim.rev + earn) * 100) / 100;
    S.rep = clamp(S.rep + (S.crew === 'domino' ? 0.045 : 0.03) + (S.ups.sign ? 0.015 : 0), 1, 5);
    sim.serveBounce = 0.28;
    sim.queue.shift();
    c.state = 'leave'; c.dir = 1; c.mood = '♥';
    SFX.coin();
    sim.floats.push({ x: 205, y: 102, txt: '+' + fmt(earn), col: '#7dff5a', a: 1.0 });
    syncDayControls();
  }

  function finishDay(sim) {
    // Overnight spoilage / ice melt
    var spoilCount = 0;
    activeIngs().forEach(function (ik) {
      var ing = INGS[ik];
      var have = S.inv[ik] || 0;
      if (have > 0 && ing.perish > 0) {
        var rate = S.ups.keeper ? ing.perish * 0.5 : ing.perish;
        var lost = ing.perish >= 1 ? (S.ups.keeper ? Math.ceil(have * 0.5) : have) : Math.floor(have * rate);
        if (lost > 0) {
          S.inv[ik] = have - lost;
          spoilCount += lost;
        }
      }
    });
    var net = Math.round((sim.rev - daySpent) * 100) / 100;
    S.totNet = Math.round((S.totNet + net) * 100) / 100;
    S.totSold += sim.sold;
    S.totRivalNet = Math.round((S.totRivalNet + sim.info.rivalNet) * 100) / 100;
    S.lastReport = {
      day: S.day,
      info: sim.info,
      sold: sim.sold,
      rev: sim.rev,
      spent: daySpent,
      net: net,
      lostPrice: sim.lostPrice,
      lostStock: sim.lostStock,
      lostSoak: sim.lostSoak,
      lostWait: sim.lostWait,
      spoilCount: spoilCount
    };
    daySpent = 0;
    daySim = null;
    save();
    SFX.fanfare();
    setScreen('report');
  }

  // ---------- Render Live Day ----------
  function renderDay(el) {
    el.className = 'screen';
    var items = activeItems();
    var h = '<div class="day-meta">' +
      '<b id="dClock">9:00 AM</b>' +
      '<div class="prog"><i id="dProg"></i></div>' +
      '<span id="dSold">Sold: 0</span>' +
      '<button type="button" class="sm" id="btnSpeed">1x</button>' +
      '</div>' +
      '<div class="stage"><canvas id="cv" width="460" height="210"></canvas></div>' +
      '<div class="ev-bar" id="evBar" hidden><span id="evTxt">EVENT!</span><button type="button" class="gold sm" id="evBtn">TAP!</button></div>' +
      '<div class="serve-pad" id="servePad"></div>' +
      '<div class="quip" id="dQuip"></div>';
    el.innerHTML = h;

    // Build serve buttons
    var pad = $('servePad');
    var padHtml = '';
    items.forEach(function (id) {
      padHtml += '<button type="button" class="serve-btn" data-serve="' + id + '">' +
        '<span>SERVE ' + esc(ITEMS[id].n.toUpperCase()) + '</span>' +
        '<small>' + fmt(S.prices[id]) + ' &middot; Left: <b data-left="' + id + '">' + countMakeable(id) + '</b></small>' +
        '</button>';
    });
    pad.innerHTML = padHtml;
    pad.querySelectorAll('button[data-serve]').forEach(function (b) {
      b.onclick = function () { serveFront(b.getAttribute('data-serve')); };
    });

    $('btnSpeed').onclick = function () {
      if (!daySim) return;
      daySim.speed = daySim.speed === 1 ? 2 : 1;
      $('btnSpeed').textContent = daySim.speed + 'x';
      SFX.tap();
    };
    $('evBtn').onclick = function () { resolveEventTap(); };
    $('cv').addEventListener('click', function () {
      if (daySim && daySim.activeEv) resolveEventTap();
      else if (daySim && daySim.queue.length) serveFront(daySim.queue[0].want);
    });

    syncDayControls();

    var lastTs = 0;
    function loop(ts) {
      if (screen !== 'day' || !daySim) return;
      if (!lastTs) lastTs = ts;
      var dt = Math.min(0.1, (ts - lastTs) / 1000) * daySim.speed;
      lastTs = ts;
      stepDay(dt);
      if (screen !== 'day' || !daySim) return;
      drawDayCanvas();
      updateDayHud();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
  }

  function syncDayControls() {
    var sim = daySim;
    if (!sim || !$('evBar')) return;
    if (sim.activeEv) {
      $('evBar').hidden = false;
      if (sim.activeEv.type === 'squirrel') {
        $('evTxt').textContent = 'SQUIRREL RAID!';
        $('evBtn').textContent = 'BARK! SHOO!';
      } else {
        $('evTxt').textContent = 'SPRINKLER SOAK!';
        $('evBtn').textContent = 'SLAM SHUTOFF!';
      }
    } else {
      $('evBar').hidden = true;
    }
    var frontWant = sim.queue.length ? sim.queue[0].want : null;
    document.querySelectorAll('#servePad button[data-serve]').forEach(function (b) {
      var id = b.getAttribute('data-serve');
      b.classList.toggle('want', frontWant === id);
      var lbl = b.querySelector('b[data-left]');
      if (lbl) lbl.textContent = countMakeable(id);
    });
  }

  function updateDayHud() {
    var sim = daySim;
    if (!sim) return;
    var pct = clamp(sim.t / DAY_LEN, 0, 1);
    var hour = 9 + Math.floor(pct * 8);
    var ampm = hour >= 12 ? 'PM' : 'AM';
    var h12 = hour > 12 ? hour - 12 : hour;
    $('dClock').textContent = h12 + ':00 ' + ampm;
    $('dProg').style.width = Math.round(pct * 100) + '%';
    $('dSold').textContent = 'Sold: ' + sim.sold;
    $('dQuip').textContent = sim.quip;
    $('hMoney').textContent = S.money.toFixed(2);
    $('hRep').textContent = S.rep.toFixed(1);
    // highlight front customer item
    var frontWant = sim.queue.length ? sim.queue[0].want : null;
    document.querySelectorAll('#servePad button[data-serve]').forEach(function (b) {
      b.classList.toggle('want', frontWant === b.getAttribute('data-serve'));
    });
  }

  function drawDayCanvas() {
    var cv = $('cv');
    if (!cv || !daySim) return;
    var ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    var W = cv.width, H = cv.height, sim = daySim;
    var wx = WEATHER[sim.wkNow];

    // Sky
    var g = ctx.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, wx.sky[0]);
    g.addColorStop(1, wx.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 128);

    if (sim.wkNow === 'hot' || sim.wkNow === 'sunny') spr(ctx, 'sun', 392, 16, 3);
    else spr(ctx, 'cloud', 350, 18, 3);
    if (sim.wkNow === 'cloudy' || sim.wkNow === 'rain') spr(ctx, 'cloud', 80, 22, 3);

    // Grass & dry lot path
    ctx.fillStyle = '#338840';
    ctx.fillRect(0, 124, W, 32);
    ctx.fillStyle = '#b4824c';
    ctx.fillRect(0, 150, W, H - 150);
    ctx.fillStyle = '#7c562e';
    ctx.fillRect(0, 148, W, 4);

    // Tree & Fence
    spr(ctx, 'tree', 14, 54, 2.5);
    for (var fx = 0; fx < W; fx += 48) spr(ctx, 'fence', fx, 102, 2);

    // Other Yard NPC Stand across the lot (right side)
    spr(ctx, STARTERS[sim.info.rivalCat].standFrame, 358, 92, 1.3);
    spr(ctx, 'lark_l', 378, 72, 1.5);
    spr(ctx, 'pebble_l', 410, 74, 1.5);
    ctx.fillStyle = '#000';
    ctx.fillRect(346, 56, 102, 15);
    ctx.strokeStyle = '#ffd400';
    ctx.lineWidth = 1;
    ctx.strokeRect(346, 56, 102, 15);
    ctx.fillStyle = '#ffd400';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('OTHER YARD ' + fmt(sim.info.rivalPrice), 351, 67);

    // Player Stand + Upgrades + Counter Dog
    var bounce = sim.serveBounce > 0 ? -4 : 0;
    if (S.ups.umbrella) spr(ctx, 'umbrella', 180, 56 + bounce * 0.4, 2);
    spr(ctx, CREW[S.crew].frame, 220, 78 + bounce, 2);
    spr(ctx, STARTERS[S.starter].standFrame, 190, 104, 2);
    if (S.ups.sign) spr(ctx, 'chalkboard', 306, 134, 1.5);
    if (S.ups.keeper) {
      ctx.fillStyle = '#12121a'; ctx.fillRect(168, 152, 18, 16);
      ctx.fillStyle = '#2ee6ff'; ctx.fillRect(170, 154, 14, 12);
    }

    // Customers
    sim.custs.forEach(function (c) {
      spr(ctx, c.who.frame, Math.round(c.x), c.y, 2);
      if (c.state === 'queue') {
        // Icon thought bubble (no English words)
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillRect(Math.round(c.x) + 12, c.y - 24, 24, 22);
        ctx.strokeRect(Math.round(c.x) + 12, c.y - 24, 24, 22);
        spr(ctx, c.bubble, Math.round(c.x) + 16, c.y - 21, 1);
      } else if (c.mood) {
        ctx.fillStyle = '#000';
        ctx.fillRect(Math.round(c.x) + 8, c.y - 18, 28, 14);
        ctx.fillStyle = c.mood === '♥' ? '#ff5c8a' : '#ffd400';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(c.mood, Math.round(c.x) + 12, c.y - 8);
      }
    });

    // Live Events
    if (sim.activeEv) {
      if (sim.activeEv.type === 'squirrel') {
        var sqY = 104 + Math.sin(sim.t * 14) * 4;
        spr(ctx, 'squirrel', 274, sqY, 2);
        ctx.fillStyle = '#ff2e63';
        ctx.fillRect(280, sqY - 16, 14, 14);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('!', 285, sqY - 5);
      } else {
        spr(ctx, 'sprinkler', 110, 148, 2);
        // animated spray arcs
        ctx.fillStyle = '#8be9ff';
        for (var k = 0; k < 8; k++) {
          var sx = 120 + ((sim.t * 90 + k * 19) % 70);
          var sy = 148 - Math.sin(((sx - 120) / 70) * Math.PI) * 34;
          ctx.fillRect(sx, sy, 3, 3);
        }
      }
    }

    // Rain overlay
    if (sim.wkNow === 'rain') {
      var rf = 'rain' + (Math.floor(sim.t * 8) % 3);
      for (var rx = 0; rx < W; rx += 64) {
        for (var ry = 10; ry < 170; ry += 48) spr(ctx, rf, rx, ry, 2);
      }
    }

    // Floating comic pops
    sim.floats.forEach(function (f) {
      ctx.globalAlpha = clamp(f.a, 0, 1);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 13px Impact, sans-serif';
      ctx.fillText(f.txt, f.x + 1, f.y + 1);
      ctx.fillStyle = f.col;
      ctx.fillText(f.txt, f.x, f.y);
      ctx.globalAlpha = 1;
    });
  }

  // ---------- Sundown Report ----------
  function renderReport(el) {
    el.className = 'screen';
    var r = S.lastReport;
    var beatRival = r.net >= r.info.rivalNet;
    var h = '<div class="pick-head"><h2>SUNDOWN REPORT &middot; DAY ' + r.day + '</h2>' +
      '<p>' + WEATHER[r.info.wk].sym + ' ' + WEATHER[r.info.wk].n + ' &middot; ' + esc(r.info.nyDate) + ' NY</p></div>';
    h += '<div class="stat-grid">' +
      '<div class="stat-box">Items Sold<b>' + r.sold + '</b></div>' +
      '<div class="stat-box">Net Today<b style="color:' + (r.net >= 0 ? '#7dff5a' : '#ff5c8a') + '">' + fmt(r.net) + '</b></div>' +
      '<div class="stat-box">Gross / Spent<b>' + fmt(r.rev) + ' / ' + fmt(r.spent) + '</b></div>' +
      '<div class="stat-box">Missed / Spoiled<b>' + (r.lostPrice + r.lostStock + r.lostSoak + r.lostWait) + ' / ' + r.spoilCount + '</b></div>' +
      '</div>';
    h += '<div class="rival-box">' +
      '<b>SHARED YARD CHECK (' + esc(r.info.nyDate) + ' NY):</b><br>' +
      'Your Stand: <b>' + fmt(r.net) + '</b> vs Other Yard (' + esc(ITEMS[r.info.rivalItem].n) + '): <b>' + fmt(r.info.rivalNet) + '</b> &mdash; ' +
      (beatRival ? '<span style="color:#7dff5a">You led the fence today!</span>' : '<span style="color:#ffb86c">Lark\'s crew edged ahead today.</span>') +
      '</div>';
    if (r.day === 1 && !S.unlocked2) {
      h += '<div class="mini-note" style="text-align:center;color:#7dff5a">Tip: Starting Day 2, check UPGRADES to unlock ' + esc(ITEMS[STARTERS[S.starter].item2].n) + '!</div>';
    }
    h += '<button type="button" class="go" id="btnNextComic" style="margin-top:auto">NEXT (COMIC) &#9654;</button>';
    el.innerHTML = h;
    $('btnNextComic').onclick = function () {
      SFX.tap();
      setScreen('comic');
    };
  }

  // ---------- 2-Panel Silent-Dog Comic Cutscene ----------
  var COMICS = [
    { cap: 'Day 1 at dusk: Bear counts the till while Pickle eyes the leftover ice.', p1: ['bear', 'stand', 'domino'], p2: ['pickle', 'heart', 'tree'], b1: '*woof!*', b2: '*crunch*' },
    { cap: 'The fence squirrel plans a heist; Domino sketches a warning on the chalkboard.', p1: ['squirrel', 'tree', 'domino'], p2: ['domino', 'chalkboard', 'bear'], b1: '*chitter*', b2: '*grr*' },
    { cap: 'New recipe day! Pickle drops an extra spoonful into the batch.', p1: ['pickle', 'stand', 'bear'], p2: ['mittens', 'heart', 'pickle'], b1: '*plop!*', b2: '*purr*' },
    { cap: 'The garage sprinkler wakes up on its own. Bear stands guard with the umbrella.', p1: ['sprinkler', 'bear', 'domino'], p2: ['bear', 'umbrella', 'pickle'], b1: '*HISSS*', b2: '*boof!*' },
    { cap: 'Across the dry lot, Lark squints at your chalkboard price.', p1: ['lark_l', 'pebble_l', 'fence'], p2: ['domino', 'stand', 'lark_l'], b1: '*sniff*', b2: '*yip!*' },
    { cap: 'Sgt. Meatball and Tullio swap a bottle cap for the last treat at closing.', p1: ['meatball', 'stand', 'tullio'], p2: ['tullio', 'heart', 'bear'], b1: '*tweet*', b2: '*clink*' },
    { cap: 'Yard Fair dusk at the fence! Both yards toast a full week of stands.', p1: ['bear', 'domino', 'pickle'], p2: ['lark_l', 'fence', 'pebble_l'], b1: '*WOOF!*', b2: '*YIP!*' }
  ];

  function renderComic(el) {
    el.className = 'screen';
    var idx = (S.day - 1) % COMICS.length;
    var com = COMICS[idx];
    var isFinale = S.day === 7 && !S.seasonDone;

    el.innerHTML =
      '<div class="pick-head"><h2>YARD COMIC &middot; DAY ' + S.day + '</h2><p>Silent-dog strip between days</p></div>' +
      '<div class="comic-wrap"><canvas id="comicCv" width="440" height="186"></canvas></div>' +
      '<div class="comic-cap">' + esc(com.cap) + '</div>' +
      '<button type="button" class="go" id="btnNextDay" style="margin-top:auto">' +
      (isFinale ? 'YARD FAIR FINALE &#9654;' : 'NEXT MORNING (DAY ' + (S.day + 1) + ') &#9654;') + '</button>';

    function drawPanels() {
      var cv = $('comicCv');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#f7f2e6';
      ctx.fillRect(0, 0, 440, 186);

      [0, 1].forEach(function (pi) {
        var px = pi === 0 ? 6 : 224, pw = 210, py = 6, ph = 174;
        ctx.save();
        ctx.beginPath();
        ctx.rect(px, py, pw, ph);
        ctx.clip();
        // Dusk sky
        ctx.fillStyle = pi === 0 ? '#5c4b8a' : '#e0895c';
        ctx.fillRect(px, py, pw, 108);
        ctx.fillStyle = '#2e7a3a';
        ctx.fillRect(px, py + 108, pw, 66);
        spr(ctx, 'fence', px + 8, py + 92, 2);
        spr(ctx, 'fence', px + 56, py + 92, 2);
        spr(ctx, 'fence', px + 104, py + 92, 2);
        spr(ctx, 'fence', px + 152, py + 92, 2);

        var actors = pi === 0 ? com.p1 : com.p2;
        var xs = [px + 22, px + 86, px + 148];
        actors.forEach(function (a, ai) {
          var key = a === 'stand' ? STARTERS[S.starter].standFrame : a;
          var yOff = key.indexOf('stand_') === 0 ? py + 82 : (key === 'squirrel' || key === 'heart' ? py + 90 : py + 74);
          spr(ctx, key, xs[ai], yOff, key.indexOf('stand_') === 0 ? 1.5 : 2);
        });

        // Sound/bark gag pill (never English dog speech)
        var gag = pi === 0 ? com.b1 : com.b2;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.fillRect(px + 68, py + 16, 74, 22);
        ctx.strokeRect(px + 68, py + 16, 74, 22);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(gag, px + 105, py + 31);
        ctx.textAlign = 'left';
        ctx.restore();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 4;
        ctx.strokeRect(px, py, pw, ph);
      });
    }

    if (spriteReady()) drawPanels();
    else sheet.addEventListener('load', drawPanels, { once: true });

    $('btnNextDay').onclick = function () {
      SFX.tap();
      if (isFinale) {
        S.seasonDone = true;
        save();
        setScreen('finale');
      } else {
        S.day += 1;
        save();
        prepTab = 'board';
        setScreen('prep');
      }
    };
  }

  // ---------- Day 7 Finale ----------
  function renderFinale(el) {
    el.className = 'screen';
    var won = S.totNet >= S.totRivalNet;
    var st = STARTERS[S.starter];
    var shareText = 'I ran a ' + st.name.toLowerCase() + ' for 7 days in the X-COMIX Yard (' +
      S.totSold + ' served, ' + fmt(S.totNet) + ' net). Same Yard day for everyone!';
    var shareHref = 'https://x.com/intent/post?text=' + encodeURIComponent(shareText + ' #XCOMIX') +
      '&url=' + encodeURIComponent(SHARE_URL);

    el.innerHTML =
      '<div class="pick-head"><h2>YARD FAIR FINALE!</h2>' +
      '<p>' + (won ? 'You beat the Other Yard over 7 days!' : 'Close finish! The Other Yard edged the 7-day cup.') + '</p></div>' +
      '<div class="stat-grid">' +
      '<div class="stat-box">7-Day Served<b>' + S.totSold + '</b></div>' +
      '<div class="stat-box">Your 7-Day Net<b style="color:#7dff5a">' + fmt(S.totNet) + '</b></div>' +
      '<div class="stat-box">Other Yard Net<b>' + fmt(S.totRivalNet) + '</b></div>' +
      '<div class="stat-box">Final Till<b>' + fmt(S.money) + '</b></div>' +
      '</div>' +
      '<div class="rival-box">Keep going into Endless Summer on today\'s shared Yard calendar, or start a fresh stand with a different starter!</div>' +
      '<div style="display:flex;gap:6px;margin-top:auto">' +
      '<button type="button" class="go" id="btnEndless" style="flex:1">ENDLESS SUMMER</button>' +
      '<a class="btn gold" target="_blank" rel="noopener" href="' + shareHref + '">Share on &#120143;</a>' +
      '</div>' +
      '<button type="button" class="sm" id="btnFresh">Start a New Stand</button>';

    $('btnEndless').onclick = function () {
      SFX.fanfare();
      S.endless = true;
      S.day = 8;
      save();
      prepTab = 'board';
      setScreen('prep');
    };
    $('btnFresh').onclick = function () {
      SFX.tap();
      S = freshState();
      save();
      setScreen('pick');
    };
  }

  // ---------- Global HUD Buttons (no confirm() popup for iframe safety) ----------
  $('btnMute').onclick = function () {
    muted = !muted;
    store.set(MUTE_KEY, muted);
    updateHud();
    if (!muted) SFX.tap();
  };
  $('btnReset').onclick = function () {
    if (!confirmReset) {
      confirmReset = true;
      $('btnReset').textContent = 'RST?';
      $('btnReset').style.background = '#ff2e63';
      setTimeout(function () {
        if (confirmReset && $('btnReset')) {
          confirmReset = false;
          $('btnReset').textContent = '↻';
          $('btnReset').style.background = '';
        }
      }, 2500);
      return;
    }
    confirmReset = false;
    $('btnReset').textContent = '↻';
    $('btnReset').style.background = '';
    S = freshState();
    daySim = null;
    daySpent = 0;
    save();
    setScreen('pick');
  };

  render();
})();
