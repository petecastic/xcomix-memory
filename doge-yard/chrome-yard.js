/* Site bar for pages inside Doge Yard (two levels below the arcade root). */
(function(){
  if(document.getElementById('xcbar'))return;
  if(!document.body||document.body.classList.contains('embed'))return;
  // Live common.js may have already set __xcbar after bailing on data-xcbar=off.
  window.__xcbar=1;
  var css=document.createElement('style');
  css.textContent=[
    '#xcbar{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;gap:8px;min-height:48px;padding:6px 10px;padding-top:max(6px,env(safe-area-inset-top));background:#0a0812;border-bottom:4px solid #ff2e63;box-sizing:border-box}',
    'body.xc-hasbar{padding-top:62px!important}',
    '#xcbar .xc-logo{font:900 18px Impact,"Arial Black",sans-serif;color:#fff;text-decoration:none;letter-spacing:.5px;text-shadow:2px 2px 0 #ff2e63;flex:none}',
    '#xcbar .xc-logo span{color:#ffd400}',
    '#xcbar nav{display:flex;gap:6px;overflow-x:auto;flex:1;scrollbar-width:none}',
    '#xcbar nav a{flex:none;text-decoration:none;color:#000;background:linear-gradient(#fff,#cfd8ff);border:2px solid #000;border-radius:20px;padding:4px 10px;font:900 13px Impact,sans-serif;letter-spacing:.4px;line-height:1}',
    '#xcbar nav a[aria-current="page"]{background:linear-gradient(#7dff5a,#1fae1f)}',
    '#xcbar a:focus-visible{outline:3px solid #ffd400;outline-offset:2px}',
    '#xcbar .xc-clk{flex:none;font:900 12px "Courier New",monospace;background:#f5e6b8;color:#000;border:2px solid #000;border-radius:20px;padding:4px 8px}',
    'body.xc-hasbar a.back,body.xc-hasbar a.bk{display:none!important}',
    'body.xc-hasbar .mute{top:58px!important}',
    'body.xc-hasbar h1{margin-top:6px!important}',
    'body.xc-hasbar footer .xc-tag{color:#9aa}',
    '@media (max-width:430px){#xcbar .xc-logo{font-size:16px}#xcbar nav a{padding:4px 8px;font-size:12px}#xcbar .xc-clk{padding:4px 6px}}'
  ].join('');
  document.head.appendChild(css);
  var here=location.pathname;
  function cur(seg){return here.indexOf(seg)>=0?' aria-current="page"':''}
  var bar=document.createElement('header');
  bar.id='xcbar';
  bar.innerHTML='<a class="xc-logo" href="../../">X-<span>COMIX</span></a>'
    +'<nav aria-label="Arcade">'
    +'<a href="../../">Games</a>'
    +'<a href="../">Doge Yard</a>'
    +'<a href="../../shop/">Shop</a>'
    +'<a href="../../binder/">Binder</a>'
    +'<a href="../../vault-clock/">Clock</a>'
    +'</nav><div class="xc-clk" title="The mill clock, stuck">12:49</div>';
  document.body.insertBefore(bar,document.body.firstChild);
  document.body.classList.add('xc-hasbar');
  var foot=document.querySelector('footer');
  if(foot&&!foot.classList.contains('legal')&&foot.textContent.indexOf('we never close')<0){
    var tag=document.createElement('span');
    tag.className='xc-tag';
    tag.textContent=' · “X-COMIX, we never close.”';
    foot.appendChild(tag);
  }
})();
