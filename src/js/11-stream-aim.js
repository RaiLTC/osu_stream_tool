/* ---- aiming the next stretch of a stream: hold Shift to preview the direction (snaps to the original direction within 3 deg), right-click locks it, Shift+drag from the last circle then leaves along it ---- */
/* deleted circles at the end of a stream still hold timeline slots; drop them before extending so the new circles continue right after the last visible one */
function trimTail(B){var last=-1;B.circles.forEach(function(c){if(!c.del)last=c.i});
  if(last<0||last>=B.pos.length-1)return;var n=last+1;B.pos.length=n;B.count=n;
  [B.del,B.ncf].forEach(function(o){Object.keys(o||{}).forEach(function(k){if(+k>=n)delete o[k]})});
  if(B.pb)B.pb=B.pb.filter(function(i){return i<n});B.circles.length=n;st.key='';build()}
function aimBody(){if(st.tool!=='add'||st.playing||!st.map)return null;var B=AB();if(!B)return null;var lc=B.circles.filter(function(c){return !c.del});if(!lc.length)return null;var last=lc[lc.length-1];
  if(st.csel.indexOf(B.id+':'+last.i)<0)return null;return{B:B,last:last,prev:lc[lc.length-2]}}
function aimGap(A){var d=strD(A.B.start,A.B.snap);if(A.prev){var g=Math.hypot(A.last.x-A.prev.x,A.last.y-A.prev.y);if(g>4)d=g/st.ds}return d}
function aimUpdate(){st.aimPrev=null;var A=aimBody();
  if(st.aim&&(!A||st.aim.b!==A.B.id))st.aim=null;
  if(!A||!st.shift||!st.lm||st.nd||st.pend||st.dw||st.cd||st.box)return;
  var vx=st.lm.x-A.last.x,vy=st.lm.y-A.last.y,l=Math.hypot(vx,vy);if(l<6)return;
  var th=Math.atan2(vy,vx),tg=tangentOf(A.B),snap=false,rel=0;
  if(tg){var t0=Math.atan2(tg.y,tg.x);rel=((th-t0)*180/Math.PI+540)%360-180;if(Math.abs(rel)<=3){th=t0;rel=0;snap=true}}
  st.aimPrev={ux:Math.cos(th),uy:Math.sin(th),snap:snap,rel:rel,hasOrig:!!tg}}
/* mirror (M): continue the selected stream as a point-mirrored copy of itself (reversed, flipped both ways, around its last circle) - the S-shape. M shows a preview, M / Enter applies, Esc cancels */
function mirrorPrep(){
  var R=selRun(false);if(!R){toast('Select the circles to mirror');return null}
  var B=R.B;if(B.ticks){toast('Mirror needs a stream without custom timing');return null}
  var P=B.pos.slice(R.i0,R.i1+1);if(P.length<2){toast('Select at least 2 circles to mirror');return null}
  var L=P[P.length-1],Q=[],k;
  for(k=1;k<P.length;k++){var q=P[P.length-1-k];Q.push({x:2*L.x-q.x,y:2*L.y-q.y})}
  if(B.pos.length+Q.length>500){toast('Too many circles');return null}
  var bad=Q.filter(function(q){return q.x<0||q.x>W||q.y<0||q.y>H}).length;
  return {B:B,Q:Q,L:L,n:B.pos.length,at:R.i1+1,bad:bad}}
function mirrorKey(){
  if(st.mir){mirrorApply();return}
  var M=mirrorPrep();if(!M)return;st.mir=M;toast(M.bad?'Mirror goes outside the playfield ('+M.bad+' circle'+(M.bad>1?'s':'')+'): select fewer circles or move them first':'Mirror preview: M or Enter applies, Esc cancels');draw()}
function mirrorApply(){
  var M=st.mir;if(M&&M.bad){toast('Can\'t mirror: '+M.bad+' circle'+(M.bad>1?'s':'')+' would end up outside the playfield. Esc cancels the preview');return}
  st.mir=null;if(!M||st.bodies.indexOf(M.B)<0||M.B.pos.length!==M.n){draw();return}
  var B=M.B,at=M.at,c=M.Q.length,sh=function(o){var r={};Object.keys(o||{}).forEach(function(k){var i=+k;r[i>=at?i+c:i]=o[k]});return r};
  B.pb=(B.pb&&B.pb.length?B.pb:[0]).map(function(i){return i>=at?i+c:i}).concat([at]).sort(function(a,b){return a-b});
  B.ncf=sh(B.ncf);B.del=sh(B.del);
  B.pos=B.pos.slice(0,at).concat(M.Q,B.pos.slice(at));B.count=B.pos.length;
  st.key='';st.ab=B.id;st.csel=[];st.sel=[];syncPanel();checkpoint();draw()}
function drawMir(){var M=st.mir;if(!M)return;if(st.bodies.indexOf(M.B)<0||M.B.pos.length!==M.n){st.mir=null;return}
  var R=st.radius*S,acc=M.bad?'#e8485a':col['--accent'];ctx.save();ctx.strokeStyle=acc;ctx.fillStyle=acc;
  ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(X(M.L.x),Y(M.L.y));M.Q.forEach(function(q){ctx.lineTo(X(q.x),Y(q.y))});ctx.stroke();
  ctx.setLineDash([]);ctx.lineWidth=2.5;M.Q.forEach(function(q,i){ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(X(q.x),Y(q.y),R,0,6.283);ctx.stroke();});
  ctx.restore()}
function drawAim(){var A=aimBody();if(!A)return;var R=st.radius*S,dd=aimGap(A)*st.ds,acc=col['--accent'],lx=A.last.x,ly=A.last.y,tg=(st.aim&&st.aim.b===A.B.id)?{x:st.aim.ux,y:st.aim.uy}:null;
  var ringG=function(x,y,al){ctx.globalAlpha=al;ctx.setLineDash([]);ctx.beginPath();ctx.arc(X(x),Y(y),R,0,6.283);ctx.lineWidth=2.5;ctx.strokeStyle=acc;ctx.stroke()};
  ctx.save();ctx.strokeStyle=acc;ctx.fillStyle=acc;
  if(tg){
    var ex=lx+tg.x*(st.radius+34),ey=ly+tg.y*(st.radius+34);ctx.globalAlpha=.95;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(X(lx+tg.x*st.radius),Y(ly+tg.y*st.radius));ctx.lineTo(X(ex),Y(ey));ctx.stroke();
    var ax=X(ex),ay=Y(ey),nx=-tg.y,ny=tg.x;ctx.beginPath();ctx.moveTo(ax+tg.x*12,ay+tg.y*12);ctx.lineTo(ax+nx*8,ay+ny*8);ctx.lineTo(ax-nx*8,ay-ny*8);ctx.closePath();ctx.fill();
    if(st.shift&&st.lm&&!st.nd&&!st.pend){var C={x:cl(st.lm.x,0,W),y:cl(st.lm.y,0,H)},pl=arcPath([{x:lx,y:ly}],C,tg,'arc'),Lp=cumOf(pl).pop();
      if(pl.length>1&&Lp>2){var cnt=cl(st.lin?Math.floor(Lp/dd+1e-6):Math.max(1,Math.round(Lp/dd)),1,500),P=resample(pl,cnt+1,0,st.lin?dd:null);P.shift();
        ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();pl.forEach(function(q,i){i?ctx.lineTo(X(q.x),Y(q.y)):ctx.moveTo(X(q.x),Y(q.y))});ctx.stroke();
        P.forEach(function(q){ringG(q.x,q.y,.75)})}}}
  else if(st.aimPrev){var u=st.aimPrev,gx=lx+u.ux*dd,gy=ly+u.uy*dd;
    ctx.globalAlpha=.7;ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.moveTo(X(lx),Y(ly));ctx.lineTo(X(gx),Y(gy));ctx.stroke();ringG(gx,gy,.9);
    if(u.hasOrig)slLabel(u.snap?'straight':((u.rel>0?'+':'')+Math.round(u.rel)+'°'),X(gx),Y(gy)-R-18)}
  ctx.restore()}
function addObj(o){var m=st.map;m.objs.push(o);ovrObjs([o]);objsChanged();st.csel=['o:'+m.objs.indexOf(o)];st.canc=st.csel[0];st.ab=null;st.sel=[];checkpoint();draw()}
function newObj(x,y,time,nc){return{oid:null,user:true,mod:false,x:x,y:y,time:time,nc:!!nc,hs:'0',skip:0,raw:null,tail:null,tailSlides:0,num:1,end:time}}
/* lazer: convert selected sliders to streams. One circle every beatLength / snap divisor from the slider's start to its end (repeats followed), first keeps the slider's new combo. */
function convertToStream(){
  var ks=st.csel.filter(function(k){var a=parseKey(k);return a.o&&st.map.objs[a.i]&&st.map.objs[a.i].sl});
  if(!ks.length){toast('Select a slider first');return}
  var sn=+$('snap').value,ids=[];
  ks.map(function(k){return st.map.objs[parseKey(k).i]}).forEach(function(o){
    var tp=tpAt(o.time),step=tp.beat/sn,n=cl(Math.floor((o.dur+1)/step)+1,1,500),pos=[],i;
    for(i=0;i<n;i++){var pp=(i*step)/(o.dur||1)*o.sl.slides,pass=Math.min(Math.floor(pp+1e-9),o.sl.slides-1),ff=pp-pass;if(pass%2)ff=1-ff;
      var q=sliderPos(o.sl,cl(ff,0,1)*o.sl.len);pos.push({x:cl(q.x,0,W),y:cl(q.y,0,H)})}
    var B=newBody({start:o.time,count:n,snap:sn,ds:st.ds});B.pos=pos;B.ncf[0]=!!o.nc;st.bodies.push(B);ids.push(B.id)});
  delCircles();build();st.csel=[];
  ids.forEach(function(id){var B=bodyById(id);B.circles.forEach(function(c){if(!c.del)st.csel.push(id+':'+c.i)})});
  st.ab=ids[ids.length-1];st.sel=[];st.canc=st.csel[0]||null;markFresh();syncPanel();checkpoint();toast('Converted to stream');draw()}
function placeCircle(m,e){var t=snapT(st.ph),q={x:cl(m.x,0,W),y:cl(m.y,0,H)},sn=(e&&e.altKey)?null:nearSnap(q.x,q.y,null,null);if(sn)q=sn;addObj(newObj(Math.round(q.x),Math.round(q.y),t,st.pnc))}
function sliderClick(m,e){var q={x:Math.round(cl(m.x,0,W)),y:Math.round(cl(m.y,0,H))};if(!(e&&e.altKey)){var sk0=nearSnap(q.x,q.y,null,null);if(sk0)q={x:Math.round(sk0.x),y:Math.round(sk0.y)}}
  if(!st.slp){st.slp={time:snapT(st.ph),pts:[q],hd:{cx:e.clientX,cy:e.clientY}};try{cv.setPointerCapture(e.pointerId)}catch(_){}draw();return}
  var S=st.slp,last=S.pts[S.pts.length-1];
  if(e&&e.shiftKey)return; /* Shift only snaps the angle preview; it never adds an anchor (release Shift to click) */
  if(Math.hypot(q.x-last.x,q.y-last.y)<9){if(S.pts.length<2||S.pts[S.pts.length-2]!==last)S.pts.push(last)}
  else S.pts.push(q);
  draw()}
function finishSlider(){var S=st.slp;if(!S)return;var b=slBuild(true);st.slp=null;
  if(!b){draw();return}
  var o=newObj(b.pts[0].x,b.pts[0].y,S.time,st.pnc);o.sl={type:b.type,pts:b.pts,len:b.len,slides:1,path:b.path,cum:b.cum};addObj(o)}
function setSlType(t){st.slType=t;
  /* with sliders selected (and no slider being placed) the buttons also retype them: the selected anchors, or the whole slider */
  if(!st.slp&&t!=='auto'){var ss=selSliders();if(ss.length){var ok=ss.filter(function(o){return slTypeApply(o,t)});if(ok.length)checkpoint();if(ok.length<ss.length)toast('Perfect curve needs 3 points in its segment'+(ok.length?' ('+(ss.length-ok.length)+' skipped)':''))}}
  document.querySelectorAll('[data-sltype]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.sltype===t)});draw()}
function cycleSlType(d){var cur=st.slType&&st.slType!=='auto'?st.slType:(st.slp?(slBuild(true)||{type:'bezier'}).type:'bezier'),i=SLTYPES.indexOf(cur);setSlType(SLTYPES[(i+d+SLTYPES.length)%SLTYPES.length]);toast('Curve: '+st.slType)}
function altSnapC(d,dx,dy){var a=parseKey(d.key);if(a.o)return null;var it=d.items.filter(function(q){return q.B.id===a.b})[0];if(!it||it.idx.indexOf(a.i)<0)return null;
  var B=it.B,sel=it.idx,j=(sel.indexOf(a.i-1)<0&&B.pos[a.i-1])?a.i-1:((sel.indexOf(a.i+1)<0&&B.pos[a.i+1])?a.i+1:-1);if(j<0)return null;
  var A=B.pos[j],p=it.pos[a.i],vx=p.x+dx-A.x,vy=p.y+dy-A.y,l=Math.hypot(vx,vy);if(l<1e-6){vx=1;vy=0;l=1}
  var steps=1,c0=null,c1=null;st.live.forEach(function(c){if(c.b===B.id){if(c.i===j)c0=c;if(c.i===a.i)c1=c}});
  if(c0&&c1){var dt=Math.abs(c1.time-c0.time);steps=Math.max(1,Math.round(dt/(tpAt(Math.min(c0.time,c1.time)).beat/B.snap)))}
  var dist=bodyD(B)*(B.ds||1)*steps;return{x:A.x+vx/l*dist-p.x,y:A.y+vy/l*dist-p.y}}
function altSnapO(od,dx,dy){var a=parseKey(od.key),objs=st.map.objs,o=objs[a.i],it=od.items.filter(function(q){return q.o===o})[0];if(!o||!it)return null;
  var sel=st.csel,k=a.i-1;while(k>=0&&sel.indexOf('o:'+k)>=0)k--;if(k<0)return null;var P=objs[k],E=P.sl?P.sl.path[P.sl.path.length-1]:P;
  var vx=it.x+dx-E.x,vy=it.y+dy-E.y,l=Math.hypot(vx,vy);if(l<1e-6){vx=1;vy=0;l=1}
  var dt=Math.max(0,o.time-P.end),dist=100*st.map.sm*svAt(o.time)*dt/tpAt(o.time).beat;if(dist<1)return null;
  return{x:E.x+vx/l*dist-it.x,y:E.y+vy/l*dist-it.y}}
function shapeLine(){
  if(st.tool!=='bend'||!st.map)return null;var R=selRun(false);if(!R||R.i1-R.i0<2)return null;
  var pts=R.B.pos.slice(R.i0,R.i1+1),pl=splinePl(pts);return{R:R,pts:pts,pl:pl,cum:cumOf(pl)}}
function nearOnLine(pl,cum,m){var best=1e9,bs=0,j;for(j=1;j<pl.length;j++){var a=pl[j-1],b=pl[j],vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy||1,t=cl(((m.x-a.x)*vx+(m.y-a.y)*vy)/l2,0,1),d=Math.hypot(m.x-(a.x+vx*t),m.y-(a.y+vy*t));if(d<best){best=d;bs=cum[j-1]+(cum[j]-cum[j-1])*t}}return{d:best,s:bs}}
function bendApply(m){var d=st.bd;if(!d)return;var dx=m.x-d.g.x,dy=m.y-d.g.y;
  var pl2=d.pl.map(function(p,j){var q=Math.abs(d.cum[j]-d.ug)/d.hw,k=q>=1?0:.5*(1+Math.cos(Math.PI*q));return{x:p.x+dx*k,y:p.y+dy*k}}),c2=cumOf(pl2);
  var L2=c2[c2.length-1];d.u.forEach(function(u,i){var q=atD(pl2,c2,u/d.L*L2);d.B.pos[d.i0+i]={x:cl(q.x,0,W),y:cl(q.y,0,H)}});
  d.m=m;st.key='';draw()}
cv.addEventListener('pointerdown',function(e){
  if(!st.map)return;
  var m=pos(e),ctrl=e.ctrlKey||e.metaKey,sh=e.shiftKey,c=topAt(m);
  if(e.button!==0)return;
  if(c&&(st.tool==='select'||st.tool==='bend')){var oiP=objAt(m);if(oiP>=0&&st.csel.indexOf('o:'+oiP)>=0&&st.csel.indexOf(c.b+':'+c.i)<0)c=null}
  if(st.tool==='bend'&&(!c||st.csel.indexOf(c.b+':'+c.i)>=0)){var SL0=shapeLine();if(SL0){var h0=nearOnLine(SL0.pl,SL0.cum,m);if(h0.d<=10){var L0=SL0.cum[SL0.cum.length-1];
    st.bd={B:SL0.R.B,i0:SL0.R.i0,i1:SL0.R.i1,pl:SL0.pl,cum:SL0.cum,u:SL0.pts.map(function(p,i){return SL0.cum[Math.min(i*8,SL0.cum.length-1)]}),ug:h0.s,g:m,m:m,hw:L0*.45,L:L0};
    cv.setPointerCapture(e.pointerId);draw();return}}}
  if(st.tool==='select'){var rh1=rotHover(m);if(rh1>=0){var rb=rotBox();st.rd={ci:rh1,c:{x:(rb.x0+rb.x1)/2,y:(rb.y0+rb.y1)/2},begun:false,raw:0,deg:0};st.rd.a0=Math.atan2(m.y-st.rd.c.y,m.x-st.rd.c.x);cv.setPointerCapture(e.pointerId);draw();return}}
  if(st.tool==='add'&&sh&&!ctrl){var AA=aimBody(),av=AA&&((st.aim&&st.aim.b===AA.B.id)?{ux:st.aim.ux,uy:st.aim.uy}:st.aimPrev);
    if(AA&&av&&(!c||(c.b===AA.B.id&&c.i===AA.last.i&&st.aimPrev))){var Bx=AA.B;trimTail(Bx);st.nd={b:Bx,ext:true,base:Bx.pos.slice(),nodes:[{x:AA.last.x,y:AA.last.y}],tan0:{x:av.ux,y:av.uy},s0:Bx.start,sn0:Bx.snap,d:aimGap(AA),pm:m,from:null,style:'arc'};
      st.aim=null;st.aimPrev=null;ndStart(st.nd,m);st.lm=m;ndApply();cv.setPointerCapture(e.pointerId);draw();return}}
  if(st.tool==='circle'){placeCircle(m,e);return}
  if(st.tool==='slider'){if(st.slHeld&&(e.buttons&1))return;st.slHeld=true;sliderClick(m,e);return}
  if(st.tool==='delete'){
    /* faded circles can only be deleted when they are selected */
    var kF='Faded circles must be selected before they can be deleted';
    if(c){var kc=c.b+':'+c.i;if(st.csel.indexOf(kc)<0&&circFade(c)<1){toast(kF);draw();return}st.csel=[c.b+':'+c.i];delCircles();checkpoint()}
    else{var oi0=objAt(m);if(oi0>=0){var ko='o:'+oi0;if(st.csel.indexOf(ko)<0&&objFade(st.map.objs[oi0])<1){toast(kF);draw();return}st.csel=['o:'+oi0];delCircles();checkpoint()}}draw();return}
  var slh=st.tool==='select'?slHit(m,ctrl&&!sh):null;
  if(slh){slDown(slh,e,m);return}
  st.psel=null;
  if(!c&&(st.tool==='select'||st.tool==='bend')){var oi=objAt(m);if(oi>=0&&sh&&!ctrl){draw();return}if(oi>=0){var okk='o:'+oi,was=st.csel.indexOf(okk)>=0,multi=was&&st.csel.length>1&&!ctrl&&!sh;
    if(!was||ctrl||sh)pickKey(okk,e);
    st.od={m:m,cx:e.clientX,cy:e.clientY,started:false,key:okk,single:multi};cv.setPointerCapture(e.pointerId);draw();return}}
  if(c&&e.altKey&&!ctrl&&!sh&&st.tool!=='circle'&&st.tool!=='slider'){var keyA=c.b+':'+c.i,wasA=st.csel.indexOf(keyA)>=0;if(!wasA)selClick(c,false,false);
    st.cd={cx:e.clientX,cy:e.clientY,m:m,started:false,key:keyA,single:wasA&&st.csel.length>1};cv.setPointerCapture(e.pointerId);draw();return}
  var selHit=!!(c&&!ctrl&&!sh&&!e.altKey&&st.csel.indexOf(c.b+':'+c.i)>=0);
  if(st.tool==='draw'&&!selHit){
    var s0d=Math.max(0,snapT(st.ph)),snd=+$('snap').value,run=st.csel.length>1?selRun(false):null;
    if(run&&run.i1-run.i0<1)run=null;
    st.dw={pts:[{x:cl(m.x,0,W),y:cl(m.y,0,H),t:0}],b:null,run:run,orig:run?run.B.pos.slice(run.i0,run.i1+1).map(function(p){return{x:p.x,y:p.y}}):null,s0:s0d,sn0:snd,d:strD(s0d,snd),t0:performance.now()};
    cv.setPointerCapture(e.pointerId);return}
  if(c){
    var key=c.b+':'+c.i,B0=bodyById(c.b);
    if((ctrl||sh)&&B0&&isLastLive(B0,c.i)){st.pend={key:key,c:c,cx:e.clientX,cy:e.clientY,ctrl:ctrl,sh:sh,b:B0,m:m};cv.setPointerCapture(e.pointerId);return}
    if(st.tool==='add'&&(ctrl||sh)){
      var sn3=B0?B0.snap:+$('snap').value;
      st.nd={b:null,nodes:[{x:c.x,y:c.y}],tan0:regTan(c.time,c.x,c.y),s0:c.time,sn0:sn3,d:strD(c.time,sn3),from:c,pm:m,style:modStyle(ctrl,sh)};
      if(B0){var nb3=B0.circles[c.i-1]||B0.circles[c.i+1];if(nb3){var dn3=Math.hypot(nb3.x-c.x,nb3.y-c.y);if(dn3>4)st.nd.d=dn3/st.ds}}
      cv.setPointerCapture(e.pointerId);return}
    if(sh&&!ctrl){draw();return}
    if(ctrl){selClick(c,ctrl,sh);draw();return}
    if(st.tool==='add'&&!selHit){
      var sn1=B0?B0.snap:+$('snap').value;
      st.nd={b:null,nodes:[{x:c.x,y:c.y}],tan0:null,s0:c.time,sn0:sn1,d:strD(c.time,sn1),from:c,pm:m};
      if(B0){var nb=B0.circles[c.i-1]||B0.circles[c.i+1];if(nb){var dn=Math.hypot(nb.x-c.x,nb.y-c.y);if(dn>4)st.nd.d=dn/st.ds}}
      cv.setPointerCapture(e.pointerId);return}
    var wasC=st.csel.indexOf(key)>=0,sgl2=wasC&&st.csel.length>1;
    if(!wasC)selClick(c,false,false);
    st.cd={cx:e.clientX,cy:e.clientY,m:m,started:false,key:key,single:sgl2};cv.setPointerCapture(e.pointerId);
    draw();return}
  if(st.tool==='add'&&!e.altKey){
    var oiS=objAt(m);
    if(oiS>=0){var os=st.map.objs[oiS],snO=+$('snap').value,msO=modStyle(ctrl,sh);
      /* pressing a slider nearer its end than its head starts the stream at the slider end (the slider stays); pressing the head replaces it as before */
      var tl=null;if(os.sl&&(os.sl.slides||1)%2===1){var so2=(os.sh||0)*(st.soff||0),mt={x:m.x-so2,y:m.y-so2},te=os.sl.path[os.sl.path.length-1];
        if(Math.hypot(mt.x-te.x,mt.y-te.y)<=st.radius&&Math.hypot(mt.x-te.x,mt.y-te.y)<Math.hypot(mt.x-os.x,mt.y-os.y))tl=te}
      if(tl){var ts=Math.round(os.end);st.nd={b:null,style:msO,nodes:[{x:tl.x,y:tl.y}],tan0:msO?regTan(ts,tl.x,tl.y):null,s0:ts,sn0:snO,d:strD(ts,snO),fromO:os,tail:true,pm:m};cv.setPointerCapture(e.pointerId);return}
      st.nd={b:null,style:msO,nodes:[{x:os.x,y:os.y}],tan0:msO?regTan(os.time,os.x,os.y):null,s0:os.time,sn0:snO,d:strD(os.time,snO),fromO:os,pm:m};cv.setPointerCapture(e.pointerId);return}
    if(!sh&&!ctrl){var s0=Math.max(0,snapT(st.ph)),sn0=+$('snap').value;
    st.nd={b:null,nodes:[{x:cl(m.x,0,W),y:cl(m.y,0,H)}],tan0:null,s0:s0,sn0:sn0,d:strD(s0,sn0),pm:m};cv.setPointerCapture(e.pointerId);return}}
  if(!sh&&!ctrl){st.sel=[];st.csel=[];st.ab=null}
  st.box={x0:m.x,y0:m.y,x1:m.x,y1:m.y};cv.setPointerCapture(e.pointerId);draw();
});
cv.addEventListener('dblclick',function(e){
  if(!st.map)return;var c=topAt(pos(e));if(c){selectBody(c.b);draw()}});
cv.addEventListener('pointermove',function(e){
  if(!st.map)return;
  var m=pos(e),d;st.lm=m;st.lastAlt=e.altKey;st.shift=e.shiftKey;
  if(st.tool==='add'){var hadA=!!st.aimPrev;aimUpdate();if(st.aimPrev||hadA||st.aim)draw()}
  if(st.bd){bendApply(m);return}
  if(st.rd){rotDragMove(e,m);return}
  if(st.slp&&st.slp.hd){var hd=st.slp.hd;
    /* holding the button and dragging far enough just moves one end anchor around (no freehand); releasing places it */
    if(!hd.drag&&(e.buttons&1)&&Math.hypot(e.clientX-hd.cx,e.clientY-hd.cy)>=16)hd.drag=true}
  if(st.slp||st.tool==='circle'||st.tool==='slider'){draw()}
  if(st.pd){slDrag(e,m);return}
  if(st.od){var od=st.od;
    if(!od.started){if(Math.abs(e.clientX-od.cx)+Math.abs(e.clientY-od.cy)<5)return;od.started=true;od.items=[];var bx0=1e9,bx1=-1e9,by0=1e9,by1=-1e9;
      st.csel.forEach(function(k){var a=parseKey(k);if(!a.o)return;var o=st.map.objs[a.i];if(!o)return;var u=[];if(o.sl)o.sl.pts.forEach(function(q){if(u.indexOf(q)<0)u.push(q)});
        od.items.push({o:o,x:o.x,y:o.y,u:u,ux:u.map(function(q){return q.x}),uy:u.map(function(q){return q.y})});bx0=Math.min(bx0,o.x);bx1=Math.max(bx1,o.x);by0=Math.min(by0,o.y);by1=Math.max(by1,o.y)});
      od.bb=[bx0,bx1,by0,by1]}
    var odx=cl(m.x-od.m.x,-od.bb[0],W-od.bb[1]),ody=cl(m.y-od.m.y,-od.bb[2],H-od.bb[3]);
    if(e.altKey){var ao=altSnapO(od,odx,ody);if(ao){odx=ao.x;ody=ao.y}}else{var ko=nearSnapO(od,odx,ody);if(ko){odx=ko.x;ody=ko.y}}
    od.items.forEach(function(it){it.o.x=it.x+odx;it.o.y=it.y+ody;it.o.mod=true;it.u.forEach(function(q,i){q.x=it.ux[i]+odx;q.y=it.uy[i]+ody});
      if(it.o.sl){var rr=slPath(it.o.sl.type,it.o.sl.pts,it.o.sl.len);it.o.sl.path=rr.path;it.o.sl.cum=rr.cum}});
    st.key='';draw();return}
  if(st.tool==='select'&&!st.cd&&!st.box&&!st.nd&&!st.dw&&!st.od&&!st.pd){var rh0=rotHover(m);if(rh0!==st.rh){st.rh=rh0;draw()}}
  if(st.tool==='bend'&&!st.cd&&!st.box&&!st.nd&&!st.dw)draw();
  if(st.pend){var p=st.pend;
    if(Math.abs(e.clientX-p.cx)+Math.abs(e.clientY-p.cy)<5)return;
    var B=p.b,lc=B.circles.filter(function(c){return !c.del}),last=lc[lc.length-1],prev=lc[lc.length-2];
    trimTail(B);
    var dBase=strD(B.start,B.snap);
    if(prev){var g=Math.hypot(last.x-prev.x,last.y-prev.y);if(g>4)dBase=g/st.ds}
    st.nd={b:B,ext:true,base:B.pos.slice(),nodes:[{x:last.x,y:last.y}],tan0:(st.aim&&st.aim.b===B.id)?{x:st.aim.ux,y:st.aim.uy}:tangentOf(B),s0:B.start,sn0:B.snap,d:dBase,pm:m,from:null,style:(p.ctrl&&p.sh)?'bez':(p.ctrl?'line':'arc')};
    st.pend=null;st.aim=null;st.aimPrev=null;ndStart(st.nd,m);ndApply();draw();return}
  if(st.nd){
    if(!st.nd.b){var n0=st.nd;if(Math.hypot(m.x-n0.pm.x,m.y-n0.pm.y)<4)return;ndStart(n0,m)}
    ndApply();draw();return}
  if(st.dw){var D=st.dw,lp=D.pts[D.pts.length-1];
    if(Math.hypot(m.x-lp.x,m.y-lp.y)>=2){D.pts.push({x:cl(m.x,0,W),y:cl(m.y,0,H),t:performance.now()-D.t0});dwApply();draw()}return}
  if(st.cd){
    d=st.cd;
    if(!d.started){
      if(Math.abs(e.clientX-d.cx)+Math.abs(e.clientY-d.cy)<5)return;
      d.started=true;build();var by={};
      st.csel.forEach(function(k){var a=parseKey(k);if(a.o)return;(by[a.b]=by[a.b]||[]).push(a.i)});
      d.items=Object.keys(by).map(function(id){var B=bodyById(+id);return{B:B,idx:by[id].filter(function(i){return B.pos[i]}),pos:B.pos.map(function(p){return{x:p.x,y:p.y}})}}).filter(function(it){return it.B});
      var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
      d.items.forEach(function(it){it.idx.forEach(function(i){var p=it.pos[i];x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)})});
      d.bb=[x0,x1,y0,y1]}
    var ddx=cl(m.x-d.m.x,-d.bb[0],W-d.bb[1]),ddy=cl(m.y-d.m.y,-d.bb[2],H-d.bb[3]);
    if(e.altKey){var as=altSnapC(d,ddx,ddy);if(as){ddx=as.x;ddy=as.y}}else{var ks=nearSnapC(d,ddx,ddy);if(ks){ddx=ks.x;ddy=ks.y}}
    d.items.forEach(function(it){it.idx.forEach(function(i){it.B.pos[i].x=it.pos[i].x+ddx;it.B.pos[i].y=it.pos[i].y+ddy})});
    st.key='';draw();return}
  if(st.box){st.box.x1=m.x;st.box.y1=m.y;draw()}
});
function markFresh(){var fk={};st.csel.forEach(function(k){fk[k]=1});st.fresh={k:fk}}
cv.addEventListener('pointerup',function(e){
  if(st.rd){var rd0=st.rd;st.rd=null;if(rd0.begun)rotCommit();draw();return}
  if(st.slp&&st.slp.hd){var hd0=st.slp.hd;
    if(hd0.drag){if(slBuild(true)){finishSlider();draw();return}hd0.drag=false}
    st.slp.hd=null}
  if(st.pd){var pd0=st.pd;st.pd=null;if(!pd0.started&&pd0.single)st.psel=[pd0.q];if(pd0.started||pd0.added)checkpoint();draw();return}
  if(st.od){var od0=st.od;st.od=null;if(!od0.started&&od0.single){st.csel=[od0.key];st.canc=od0.key}checkpoint();draw();return}
  if(st.bd){st.bd=null;st.sp=null;st.dsr=null;st.key='';checkpoint();draw();return}
  if(st.pend){var pp=st.pend;st.pend=null;if(!(pp.sh&&!pp.ctrl))selClick(pp.c,pp.ctrl,pp.sh);draw()}
  if(st.nd){var nb=st.nd.b,nd0=st.nd;
    if(nb){build();
      if(nd0.fromO&&!nd0.tail&&!nd0.ext&&nb.count>=2){var ixo=st.map.objs.indexOf(nd0.fromO);if(ixo>=0){st.map.objs.splice(ixo,1);objsChanged();build()}}
      if(nd0.ext){overrideOthers(nb);selectRange(nb,nd0.base.length,nb.pos.length-1);markFresh();phToEnd(nb)}
      else if(nb.count<2){dropBody(nb);st.csel=[];st.sel=[]}
      else{st.ph=nb.start;center();overrideOthers(nb);st.ab=nb.id;selectBody(nb.id);markFresh();phToEnd(nb)}}
    else if(nd0.from){selClick(nd0.from,false,false)}
    else if(nd0.fromO){var ix=st.map.objs.indexOf(nd0.fromO);if(ix>=0){st.csel=['o:'+ix];st.canc=st.csel[0];st.ab=null;st.sel=[]}}
    else{st.csel=[];st.sel=[];st.ab=null;syncPanel()}
    st.nd=null}
  if(st.dw){var dw=st.dw;st.dw=null;
    if(dw.b){build();if(dw.b.count<2)dropBody(dw.b);else{st.ph=dw.b.start;center();overrideOthers(dw.b);selectBody(dw.b.id);markFresh();phToEnd(dw.b)}}
    else if(dw.run){st.key='';build()}}
  if(st.box){
    var b=st.box,x0=Math.min(b.x0,b.x1),x1=Math.max(b.x0,b.x1),y0=Math.min(b.y0,b.y1),y1=Math.max(b.y0,b.y1);
    st.live.forEach(function(c){var k=c.b+':'+c.i;if(visC(c)&&c.x>=x0&&c.x<=x1&&c.y>=y0&&c.y<=y1&&st.csel.indexOf(k)<0)st.csel.push(k)});
    st.map.objs.forEach(function(o,i){if(o.x>=x0&&o.x<=x1&&o.y>=y0&&o.y<=y1&&objVis(o)&&st.csel.indexOf('o:'+i)<0)st.csel.push('o:'+i)});
    st.box=null;
    var bi2={};st.csel.forEach(function(k){var q=parseKey(k);if(!q.o)bi2[q.b]=1});var bl2=Object.keys(bi2);if(bl2.length===1){st.ab=+bl2[0];syncPanel()}}
  if(st.cd&&!st.cd.started&&st.cd.single){var sk=parseKey(st.cd.key);st.csel=[st.cd.key];if(!sk.o){st.ab=sk.b;st.canc=st.cd.key;syncPanel()}}
  st.cd=null;checkpoint();draw();
});
cv.addEventListener('contextmenu',function(e){e.preventDefault()});
window.addEventListener('mouseup',function(e){if(e.button===2){st.rcDown=false}},true);
var menu=$('menu');
menu.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var a=b.dataset.a,o=st.po;menu.style.display='none';if(!o||!o.sl)return;
  if(SLTYPES.indexOf(a)>=0)slSetType(o,a);else if(a==='dup')slDup(o);else if(a==='del')slDelPts(o)});
document.addEventListener('pointerdown',function(e){if(menu.style.display==='block'&&!menu.contains(e.target))menu.style.display='none'},true);
tt.addEventListener('contextmenu',function(e){e.preventDefault()});
tt.addEventListener('mousedown',function(e){if(e.button!==2||!st.map)return;e.preventDefault();
  if(st.tm||st.nd||st.dw)return;
  /* as in osu!: right-click on a selected object deletes the whole selection; on an unselected one it deletes just that one and leaves the selection alone */
  var k=tlHit(tlXY(tt,e));if(!k)return;
  if(st.csel.indexOf(k)>=0){if(delCircles())checkpoint()}
  else{var keepO=st.csel.filter(function(q){return q[0]==='o'}).map(function(q){return st.map.objs[parseKey(q).i]}).filter(Boolean),keepC=st.csel.filter(function(q){return q[0]!=='o'});
    st.csel=[k];var did=delCircles();st.csel=keepC;reselObjs(keepO);if(did)checkpoint()}
  draw()});
tt.addEventListener('dblclick',function(e){if(!st.map)return;var k=tlHit(tlXY(tt,e));if(!k||k[0]==='o')return;selectBody(parseKey(k).b);draw()});
/* edit tools */
function toast(t){st.toast=t;draw();clearTimeout(st.toastT);st.toastT=setTimeout(function(){st.toast=null;draw()},1600)}
function copySel(){
  build();var ids={},sel={},list;
  st.csel.forEach(function(k){var q=parseKey(k);if(!q.o){ids[q.b]=1;(sel[q.b]=sel[q.b]||{})[q.i]=1}});
  list=Object.keys(ids).map(Number);
  var oc=[];st.csel.forEach(function(k){var q=parseKey(k);if(q.o&&st.map.objs[q.i])oc.push(cpt(st.map.objs[q.i]))});
  if(!list.length&&!oc.length&&st.ab!=null&&bodyById(st.ab)){list=[st.ab];sel[st.ab]=null}
  if(!list.length&&!oc.length){toast('Nothing to copy: select circles, sliders or a stream');return false}
  var clip=[],n=oc.length;
  list.forEach(function(id){var B=bodyById(id);if(!B)return;
    var o=JSON.parse(JSON.stringify({pos:B.pos,start:B.start,count:B.count,snap:B.snap,bias:B.bias,nc:B.nc,lin:B.lin,ticks:B.ticks,del:B.del,ncf:B.ncf}));
    if(sel[id])for(var i=0;i<B.count;i++)if(!sel[id][i])o.del[i]=1;
    var ft=1e18;B.circles.forEach(function(c){if(!o.del[c.i]){n++;if(c.time<ft)ft=c.time}});o.ft=ft;if(ft<1e17)clip.push(o)});
  if(!clip.length&&!oc.length)return false;
  st.clip=clip;st.clipO=oc;toast('Copied '+n+' object'+(n===1?'':'s')+(clip.length?' ('+clip.length+' stream'+(clip.length===1?'':'s')+')':''));return true}
function pasteSel(){
  var co=st.clipO||[];
  if(!st.map||((!st.clip||!st.clip.length)&&!co.length)){toast('Nothing copied yet');return}
  var clipS=st.clip||[],base=Math.min.apply(0,clipS.map(function(o){return o.ft}).concat(co.map(function(c){return c.time}))),sh=snapT(st.ph)-base,off=sh===0?24:0,made=[],last=null,newO=[];
  co.forEach(function(c0){var c=JSON.parse(JSON.stringify(c0));c.time=Math.max(0,c.time+sh);c.oid=null;c.user=true;c.mod=false;c.raw=null;c.x=cl(c.x+off,0,W);c.y=cl(c.y+off,0,H);
    if(c.sl)c.sl.pts=c.sl.pts.map(function(q){return[cl(q[0]+off,0,W),cl(q[1]+off,0,H)].concat(q.slice(2))});newO.push(xpt(c))});
  if(newO.length){newO.forEach(function(o){st.map.objs.push(o)});ovrObjs(newO);objsChanged()}
  clipS.forEach(function(o){
    var pos=JSON.parse(JSON.stringify(o.pos)).map(function(q){q.x=cl(q.x+off,0,W);q.y=cl(q.y+off,0,H);return q});
    var B=newBody({pos:pos,start:Math.max(0,o.start+sh),count:o.count,snap:o.snap,bias:o.bias,nc:o.nc,lin:o.lin,ticks:o.ticks,ncf:JSON.parse(JSON.stringify(o.ncf||{}))});
    B.del=JSON.parse(JSON.stringify(o.del||{}));st.bodies.push(B);made.push(B);last=B});
  st.key='';build();made.forEach(overrideOthers);st.csel=[];made.forEach(function(B){B.circles.forEach(function(c){if(!c.del)st.csel.push(B.id+':'+c.i)})});
  newO.forEach(function(o){var ix=st.map.objs.indexOf(o);if(ix>=0)st.csel.push('o:'+ix)});
  if(last)st.ab=last.id;else st.ab=null;st.sel=[];syncPanel();checkpoint();draw();toast('Pasted at '+fmt(snapT(st.ph)))}
function targets(){var ids={},r=[];st.csel.forEach(function(k){var a=parseKey(k);if(!a.o)ids[a.b]=1});Object.keys(ids).forEach(function(id){var B=bodyById(+id);if(B)r.push(B)});if(!r.length&&AB())r.push(AB());return r}
/* selected map objects (circles and sliders), as the objects themselves */
function selObjs(){var r=[];if(!st.map)return r;st.csel.forEach(function(k){var a=parseKey(k);if(a.o){var o=st.map.objs[a.i];if(o&&r.indexOf(o)<0)r.push(o)}});return r}
function selBodyIds(){var ids={};st.csel.forEach(function(k){var a=parseKey(k);if(!a.o)ids[a.b]=1});return Object.keys(ids)}
function flip(ax){build();var os=selObjs(),hasB=selBodyIds().length>0,f=function(p){if(ax==='x')p.x=W-p.x;else p.y=H-p.y};
  if(hasB||!os.length)targets().forEach(function(B){var clean=B.psig===sigOf(B);(B.pts||[]).forEach(f);(B.pos||[]).forEach(f);if(clean&&B.pts.length)B.psig=sigOf(B)});
  os.forEach(function(o){if(o.sl){uniqPts(o).forEach(f);slRepath(o,false)}else{f(o);o.mod=true}});
  st.key='';checkpoint();draw()}
function reverseBody(B){
  var cn=cl(Math.round(B.count)||2,1,500),nd={},nf={};build();if(!B.pos||B.pos.length<2)return;
  B.pos=B.pos.slice(0,cn).reverse();
  Object.keys(B.del).forEach(function(k){nd[cn-1-k]=1});Object.keys(B.ncf).forEach(function(k){nf[cn-1-k]=B.ncf[k]});
  if(B.ticks){var T=tickOf(B,cn-1),nt=[];for(var j=0;j<cn;j++)nt.push(T-tickOf(B,cn-1-j));B.ticks=nt}
  B.del=nd;B.ncf=nf;B.pts=[];B.psig=null;st.key=''}
/* lazer's "reverse selection" (Ctrl+G): selected map objects keep their positions but swap places in time, and sliders run the other way */
function reverseSlider(o){var s=o.sl,nat=slPath(s.type,s.pts,0).len,tail=s.path[s.path.length-1],rg=slRanges(s.type,s.pts),n=s.pts.length,np=s.pts.slice().reverse();
  s.pts.forEach(function(q,i){if(i)delete q.type});
  if(s.len<nat-.5)np[0]={x:tail.x,y:tail.y};
  rg.forEach(function(r){var ni=n-1-r.b;if(ni===0)s.type=r.ty;else np[ni].type=r.ty}); /* each segment keeps its type but now starts at its old end */
  s.pts=np;slRepath(o,false)}
function reverseObjs(os){if(!os.length)return;
  var t0=Infinity,t1=-Infinity;os.forEach(function(o){t0=Math.min(t0,o.time);t1=Math.max(t1,o.end==null?o.time:o.end)});
  os.forEach(function(o){var e=o.end==null?o.time:o.end;o.time=Math.round(t1-(e-t0));o.mod=true;if(o.sl)reverseSlider(o)});
  objsChanged();st.csel=os.map(function(o){return 'o:'+st.map.objs.indexOf(o)})}
function reverse(){var os=selObjs(),hasB=selBodyIds().length>0;
  if(hasB||!os.length){targets().forEach(reverseBody);if(!os.length){st.csel=[];st.sel=[]}}
  if(os.length)reverseObjs(os);
  checkpoint();draw()}
$('flipH').onclick=function(){flip('x')};$('flipV').onclick=function(){flip('y')};$('rev').onclick=reverse;
var STREAMS={add:1,draw:1,bend:1};
function toolGroup(t){return STREAMS[t]?'stream':t}
function setTool(t){
  if(t==='stream')t=st.lastStream||'add';
  if(STREAMS[t])st.lastStream=t;
  if(st.tool!==t&&st.slp)st.slp=null;
  st.tool=t;var g=toolGroup(t);
  document.querySelectorAll('[data-tool]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.tool===g)});
  document.querySelectorAll('[data-sub]').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.sub===t)});
  document.querySelectorAll('#opts .grp').forEach(function(e){e.classList.toggle('on',e.dataset.g===g)});
  draw()}
document.querySelectorAll('[data-tool]').forEach(function(b){b.onclick=function(){setTool(b.dataset.tool)}});
document.querySelectorAll('[data-sub]').forEach(function(b){b.onclick=function(){setTool(b.dataset.sub)}});
(function(){var host=$('optToggles'),tmp=document.createElement('div');tmp.innerHTML=document.getElementById('linTpl').innerHTML;
  Array.prototype.slice.call(tmp.children).forEach(function(c){c.classList.remove('tool');c.classList.add('obtn');c.innerHTML=c.id==='linBtn'?'Exact SV spacing (L)':'Draw by speed (E)';host.appendChild(c)})})();
setTool('select');
$('cvsBtn').onclick=convertToStream;
$('stk').oninput=function(){if(!st.map)return;st.map.stack=+$('stk').value/10;$('stkV').textContent=$('stk').value;draw()};$('stk').onchange=function(){checkpoint()};
document.querySelectorAll('[data-sltype]').forEach(function(b){b.onclick=function(){setSlType(b.dataset.sltype)}});
$('pncBtn').onclick=function(){st.pnc=!st.pnc;$('pncBtn').setAttribute('aria-pressed',st.pnc)};

function setVis(v){st.vis=v;st.showAll=v>0;$('showBtn').setAttribute('aria-pressed',v>0);$('showBtn').title='View (A): normal / all circles / fade + path line on top. Now: '+['normal','all circles','fade + line'][v];draw()}
$('showBtn').onclick=function(){setVis((st.vis+1)%3)};
$('ncBtn').onclick=toggleNC;
function setLin(v){st.lin=v;$('linBtn').setAttribute('aria-pressed',v);var A=AB();if(A){A.lin=v;st.key='';checkpoint()}draw()}
$('linBtn').onclick=function(){setLin(!st.lin)};
$('spdBtn').onclick=function(){st.speed=!st.speed;$('spdBtn').setAttribute('aria-pressed',!!st.speed);draw()};
