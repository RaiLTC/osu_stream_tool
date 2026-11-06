/* ---- undo / redo ---- */
var HIST=[],hi=-1,META=[];
/* undo/redo also bring back the playhead and the selection: the state from just before the action (undo) or just after it (redo) */
function metaNow(){return{ph:st.ph,cs:st.csel.slice(),ab:st.ab}}
window.addEventListener('pointerdown',function(){st.undoPre=metaNow()},true);
['pointerup','pointercancel','blur','lostpointercapture'].forEach(function(n){window.addEventListener(n,function(){st.slHeld=false},true)});
window.addEventListener('keydown',function(e){if(e.repeat||e.key==='Shift'||e.key==='Control'||e.key==='Alt'||e.key==='Meta')return;if(e.ctrlKey&&!e.shiftKey&&(e.key==='z'||e.key==='y'||e.key==='Z'))return;st.undoPre=metaNow()},true);
function applyMeta(m){if(!m||!st.map)return;st.sa=null;st.ph=m.ph;center();build();
  st.csel=(m.cs||[]).filter(function(k){var c=circleOf(k);return c&&!c.del});st.canc=st.csel.length?st.csel[st.csel.length-1]:null;st.sel=[];
  st.ab=(m.ab!=null&&bodyById(m.ab))?m.ab:null;st.key='';syncPanel();if(st.playing)reseek();draw()}
function cap(){return JSON.stringify({b:st.bodies.map(function(B){return{id:B.id,pos:B.pos,psig:B.psig,pts:B.pts,start:B.start,count:B.count,snap:B.snap,bias:B.bias,nc:B.nc,lin:B.lin,ds:B.ds,ticks:B.ticks,del:B.del,ncf:B.ncf,pb:B.pb||null}}),ab:st.ab,nid:st.nid,sn:$('snap').value,sm:st.map?st.map.sm:0,ob:objsCap(),sk:st.map?st.map.stack:.7,sv:st.map?svList():[]})}
var lastSl=0;
function checkpointSlider(){if(!st.map)return;var c=cap();if(HIST[hi]===c)return;var now=Date.now();
  if(now-lastSl<2500&&hi>0&&lastSl){HIST[hi]=c;META[hi]={pre:(META[hi]||{}).pre,post:metaNow()}}else{HIST.length=hi+1;META.length=hi+1;HIST.push(c);META.push({pre:st.undoPre,post:metaNow()});hi++;if(HIST.length>200){HIST.shift();META.shift();hi--}}
  lastSl=now}
function checkpoint(){lastSl=0;if(!st.map)return;var c=cap();if(HIST[hi]===c)return;HIST.length=hi+1;META.length=hi+1;HIST.push(c);META.push({pre:st.undoPre,post:metaNow()});hi++;if(HIST.length>200){HIST.shift();META.shift();hi--}}
function restore(c){var o=JSON.parse(c);st.bodies=o.b.map(function(b){b.circles=[];b.path=[];b.len=0;b.step=0;b.bpm=0;return b});st.nid=o.nid;st.ab=o.ab;st.csel=[];st.sel=[];st.key='';$('snap').value=o.sn;if(o.sm&&st.map&&st.map.sm!==o.sm){st.map.sm=o.sm;$('bsv').value=o.sm;recSliders();st.clk=''}if(st.map&&o.sk!=null){st.map.stack=o.sk;$('stk').value=Math.round(o.sk*10);$('stkV').textContent=$('stk').value}if(st.map&&o.ob)restoreObjs(o.ob);if(st.map)applySv(o.sv||[]);syncPanel();draw()}
function undo(){if(hi>0){var m=META[hi];hi--;restore(HIST[hi]);applyMeta(m&&m.pre)}}
function redo(){if(hi<HIST.length-1){hi++;restore(HIST[hi]);applyMeta(META[hi]&&META[hi].post)}}
