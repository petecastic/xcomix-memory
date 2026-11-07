/* Retired. This file stays so a cached page that still requests it does not throw.
   It does not contact a network or show a form. */
(function(){
'use strict';
window.XCBACKROOM={
  open:function(){},
  close:function(){},
  lookup:function(){ return Promise.resolve(); },
  mountButton:function(){},
  state:function(){ return {}; },
  setSky:function(){},
  MINTS:{}
};
})();
