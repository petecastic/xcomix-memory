/* Sub-Station 13 · 2126 Century Clock.
   Fictional cabinet countdown only. No wallet, no network, no score. */
(function(){
'use strict';
var MASTER=4949607960; /* 2126-11-06T03:06:00Z — Nov 5, 2126, 10:06 PM EST */
var $=function(id){return document.getElementById(id)};
function pad(n,w){n=String(Math.max(0,Math.floor(n)));while(n.length<w)n='0'+n;return n}
function addY(t,y){var d=new Date(t*1000);d.setUTCFullYear(d.getUTCFullYear()+y);return d.getTime()/1000}
function parts(sec){
  sec=Math.max(0,Math.floor(sec));
  var t0=Math.floor(Date.now()/1000),T=t0+sec,y=Math.floor(sec/31557600);
  while(y>0&&addY(t0,y)>T)y--;
  while(addY(t0,y+1)<=T)y++;
  sec=T-addY(t0,y);
  var d=Math.floor(sec/86400);sec-=d*86400;
  var h=Math.floor(sec/3600);sec-=h*3600;
  var m=Math.floor(sec/60);
  return[y,d,h,m,sec-m*60];
}
function tick(){
  var p=parts(MASTER-Date.now()/1000),ids=['cY','cD','cH','cM','cS'],w=[2,3,2,2,2];
  for(var i=0;i<5;i++){var e=$(ids[i]);if(e)e.textContent=pad(p[i],w[i])}
}
var s=$('status');
if(s)s.innerHTML='<span class="led on"></span>CABINET CLOCK RUNNING';
tick();
setInterval(tick,1000);
})();
