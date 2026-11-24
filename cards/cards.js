/* X-Comix on-chain card catalog. Read-only. No wallet, no payments, no prices. */
(function(){
  'use strict';
  var DATA = 'data/catalog.json';
  var chain = 'all';
  var collection = 'all';
  var q = '';
  var showSupport = false;
  var catalog = null;

  var $ = function(s, r){ return (r||document).querySelector(s); };
  var $$ = function(s, r){ return [].slice.call((r||document).querySelectorAll(s)); };
  function esc(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function chainLabel(c){
    return {solana:'Solana', base:'Base', doge:'Doge'}[c] || c;
  }

  function collectionsFor(ch){
    if(!catalog) return [];
    return catalog.collections.filter(function(c){
      return ch==='all' || c.chain===ch;
    });
  }

  function drawCollectionPills(){
    var host = $('#collections');
    var list = collectionsFor(chain);
    var html = '<button type="button" data-col="all" class="'+(collection==='all'?'on':'')+'">All collections</button>';
    html += list.map(function(c){
      return '<button type="button" data-col="'+esc(c.id)+'" class="'+(collection===c.id?'on':'')+'">'+esc(c.label)+'</button>';
    }).join('');
    host.innerHTML = html;
  }

  function matches(it){
    if(chain!=='all' && it.chain!==chain) return false;
    if(collection!=='all' && it.collection!==collection) return false;
    if(!showSupport && it.kind==='support') return false;
    if(!q) return true;
    var blob = (it.name+' '+(it.num||'')+' '+it.chain+' '+it.collection+' '+(it.asset||'')+' '+(it.kind||'')).toLowerCase();
    return blob.indexOf(q)>=0;
  }

  function render(){
    if(!catalog) return;
    var list = catalog.items.filter(matches);
    var grid = $('#grid');
    var empty = $('#empty');
    $('#showing').textContent = list.length + ' of ' + catalog.counts.total + ' minted';
    empty.hidden = list.length>0;
    grid.innerHTML = list.map(function(it){
      var col = (catalog.collections.filter(function(c){return c.id===it.collection;})[0]||{});
      var num = it.num ? String(it.num) : '';
      var sub = [chainLabel(it.chain), col.label || it.collection, num].filter(Boolean).join(' · ');
      var kind = it.kind==='support' ? '<span class="kind">Support file</span>' : '';
      return '<article class="card" data-id="'+esc(it.id)+'">'+
        '<div class="art">'+
          '<span class="chip '+esc(it.chain)+'">'+esc(chainLabel(it.chain))+'</span>'+
          '<img src="'+esc(it.thumb)+'" alt="'+esc(it.name)+'" width="360" height="450" loading="lazy">'+
        '</div>'+
        '<div class="meta">'+
          '<div class="name">'+esc(it.name)+'</div>'+
          '<div class="sub">'+esc(sub)+'</div>'+
          kind+
          '<a class="explore" href="'+esc(it.explorer)+'" target="_blank" rel="noopener">On-chain page ↗</a>'+
        '</div>'+
      '</article>';
    }).join('');
  }

  $('#q').addEventListener('input', function(e){
    q = (e.target.value||'').trim().toLowerCase();
    render();
  });
  $('#chains').addEventListener('click', function(e){
    var b = e.target.closest('button[data-chain]');
    if(!b) return;
    chain = b.dataset.chain;
    collection = 'all';
    $$('#chains button').forEach(function(x){ x.classList.toggle('on', x===b); });
    drawCollectionPills();
    render();
  });
  $('#collections').addEventListener('click', function(e){
    var b = e.target.closest('button[data-col]');
    if(!b) return;
    collection = b.dataset.col;
    $$('#collections button').forEach(function(x){ x.classList.toggle('on', x===b); });
    render();
  });
  $('#showSupport').addEventListener('change', function(e){
    showSupport = !!e.target.checked;
    render();
  });

  fetch(DATA, {cache:'no-store'}).then(function(r){
    if(!r.ok) throw new Error('catalog '+r.status);
    return r.json();
  }).then(function(j){
    catalog = j;
    drawCollectionPills();
    render();
  }).catch(function(){
    $('#showing').textContent = 'Could not load the catalog.';
  });
})();
