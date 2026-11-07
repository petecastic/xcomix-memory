/* Retired. This file stays so an older page that still requests it does not throw.
   It does not contact a network or unlock anything. */
(function(){
'use strict';
try{
  document.documentElement.classList.remove('dk-vip');
  document.documentElement.classList.remove('dk-capsule');
}catch(e){}
window.DKVIP={
  open:function(){},
  close:function(){},
  badge:function(el){ if(el) el.textContent=''; },
  status:function(){ return null; },
  isVip:function(){ return false; },
  onChange:function(){},
  checkLock:function(){ return Promise.resolve(null); },
  capsule:function(){ return null; },
  refresh:function(){},
  rpc:function(){ return Promise.reject(new Error('retired')); },
  LOCKS:[],
  CLOCK_URL:''
};
})();
