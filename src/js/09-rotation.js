/* ---- rotation, as in lazer (SelectionBox corner rotation handles, OsuSelectionRotationHandler, PreciseRotationPopover) ---- */
var ROT=null;
function minCircle(P){if(!P.length)return{x:W/2,y:H/2,r:0};var c=null,i,j,k,inC=function(c,p){return Math.hypot(p.x-c.x,p.y-c.y)<=c.r+1e-7},c2=function(a,b){return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,r:Math.hypot(a.x-b.x,a.y-b.y)/2}};
  for(i=0;i<P.length;i++){if(c&&inC(c,P[i]))continue;c={x:P[i].x,y:P[i].y,r:0};
    for(j=0;j<i;j++){if(inC(c,P[j]))continue;c=c2(P[i],P[j]);
      for(k=0;k<j;k++){if(inC(c,P[k]))continue;var c3=circ3(P[i],P[j],P[k]);if(c3)c=c3}}}
  return c}
function rotBegin(){var its=[],cs=[],pts=[];
  st.csel.forEach(function(k){var a=parseKey(k);
    if(a.o){var o=st.map.objs[a.i];if(!o)return;var u=[];if(o.sl)o.sl.pts.forEach(function(q){if(u.indexOf(q)<0)u.push(q)});
      its.push({o:o,x:o.x,y:o.y,u:u,ux:u.map(function(q){return q.x}),uy:u.map(function(q){return q.y})});pts.push({x:o.x,y:o.y});if(o.sl){var E=o.sl.path[o.sl.path.length-1];pts.push({x:E.x,y:E.y})}}
    else{var B=bodyById(a.b);if(!B||!B.pos[a.i])return;var p=B.pos[a.i];cs.push({p:p,x:p.x,y:p.y});pts.push({x:p.x,y:p.y})}});
  if(!its.length&&!cs.length){ROT=null;return null}
  var mc=minCircle(pts),x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;pts.forEach(function(p){x0=Math.min(x0,p.x);x1=Math.max(x1,p.x);y0=Math.min(y0,p.y);y1=Math.max(y1,p.y)});
  ROT={its:its,cs:cs,def:{x:mc.x,y:mc.y},can:(x1-x0>.5||y1-y0>.5)};return ROT}
function rotUpdate(deg,org){var R=ROT;if(!R)return;var o0=org||R.def,rad=deg*Math.PI/180,cs=Math.cos(rad),sn=Math.sin(rad);
  var rp=function(x,y){var dx=x-o0.x,dy=y-o0.y;return{x:o0.x+dx*cs-dy*sn,y:o0.y+dx*sn+dy*cs}};
  R.its.forEach(function(it){var o=it.o,p=rp(it.x,it.y);o.x=p.x;o.y=p.y;o.mod=true;
    it.u.forEach(function(q,i){var r=rp(it.ux[i],it.uy[i]);q.x=r.x;q.y=r.y});
    if(o.sl){var rr=slPath(o.sl.type,o.sl.pts,o.sl.len);o.sl.path=rr.path;o.sl.cum=rr.cum}});
  R.cs.forEach(function(c){var r=rp(c.x,c.y);c.p.x=r.x;c.p.y=r.y});
  st.key='';draw()}
function rotCommit(){var R=ROT;ROT=null;if(!R)return;
  R.its.forEach(function(it){it.o.x=Math.round(it.o.x);it.o.y=Math.round(it.o.y);if(it.o.sl){it.u.forEach(function(q){q.x=Math.round(q.x);q.y=Math.round(q.y)});slRepath(it.o,false)}});
  st.key='';checkpoint();draw()}
function rotCancel(){var R=ROT;ROT=null;if(!R)return;
  R.its.forEach(function(it){it.o.x=it.x;it.o.y=it.y;it.u.forEach(function(q,i){q.x=it.ux[i];q.y=it.uy[i]});if(it.o.sl){var rr=slPath(it.o.sl.type,it.o.sl.pts,it.o.sl.len);it.o.sl.path=rr.path;it.o.sl.cum=rr.cum}});
  R.cs.forEach(function(c){c.p.x=c.x;c.p.y=c.y});st.key='';draw()}
/* box around the selection (object radius included), like lazer's SelectionBox */
function rotBox(){if(st.tool!=='select'||st.playing||!st.map||!st.csel.length)return null;
  var R0=st.radius,x0=1e9,x1=-1e9,y0=1e9,y1=-1e9,n=0,sl=false,ex=function(x,y){x0=Math.min(x0,x-R0);x1=Math.max(x1,x+R0);y0=Math.min(y0,y-R0);y1=Math.max(y1,y+R0)};
  st.csel.forEach(function(k){var c=circleOf(k);if(!c||c.del)return;n++;ex(c.x,c.y);if(k[0]==='o'&&c.sl){sl=true;c.sl.path.forEach(function(q){ex(q.x,q.y)})}});
  if(!n||(n===1&&!sl))return null;return{x0:x0,y0:y0,x1:x1,y1:y1,n:n}}
var RHOFF=30,RHR=28;
function rotHandle(b,i){var cx=(i&1)?b.x1:b.x0,cy=(i&2)?b.y1:b.y0,ox=(i&1)?1:-1,oy=(i&2)?1:-1;return{x:X(cx)+ox*RHOFF,y:Y(cy)+oy*RHOFF}}
function rotHover(m){var b=rotBox();if(!b)return -1;var px=X(m.x),py=Y(m.y),i;
  for(i=0;i<4;i++){var h=rotHandle(b,i);if(Math.hypot(px-h.x,py-h.y)<=RHR)return i}return -1}
function rotDragMove(e,m){var d=st.rd;if(!d.begun){if(!rotBegin()){st.rd=null;return}d.begun=true}
  var a=Math.atan2(m.y-d.c.y,m.x-d.c.x),da=(a-d.a0)*180/Math.PI;da=((da+540)%360+360)%360-180;d.raw+=da;d.a0=a;
  var v=e.shiftKey?Math.round(d.raw/15)*15:Math.round(d.raw);v=((v%360)+540)%360-180;if(v===-180)v=180;d.deg=v;d.snapped=e.shiftKey;d.mx=X(m.x);d.my=Y(m.y);
  rotUpdate(v,null)}
function drawRotBox(){var b=rotBox();if(!b)return;
  ctx.save();ctx.globalAlpha=1;ctx.setLineDash([]);ctx.strokeStyle=col['--accent'];ctx.lineWidth=2;ctx.setLineDash([8,6]);ctx.strokeRect(X(b.x0),Y(b.y0),(b.x1-b.x0)*S,(b.y1-b.y0)*S);ctx.setLineDash([]);
  ctx.fillStyle=col['--accent'];ctx.fillRect(X(b.x0),Y(b.y0),30,26);ctx.fillStyle='#fff';ctx.font='700 16px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(b.n),X(b.x0)+15,Y(b.y0)+13);
  var hi=st.rd?st.rd.ci:st.rh;
  if(hi!=null&&hi>=0){var h=rotHandle(b,hi);
    ctx.beginPath();ctx.arc(h.x,h.y,25,0,6.283);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle=col['--accent'];ctx.stroke();
    ctx.strokeStyle=col['--accent'];ctx.fillStyle=col['--accent'];ctx.lineWidth=4.5;ctx.lineCap='round';ctx.beginPath();ctx.arc(h.x,h.y,11,0,1.55*Math.PI);ctx.stroke();
    var ax=h.x,ay=h.y-11;ctx.beginPath();ctx.moveTo(ax+10,ay);ctx.lineTo(ax-2,ay-8);ctx.lineTo(ax-2,ay+8);ctx.closePath();ctx.fill();
    if(st.rd&&st.rd.begun){var dg=st.rd.deg,tt2=(dg>0?'+':'')+dg+'\u00b0';ctx.font='600 15px system-ui,sans-serif';var tw=ctx.measureText(tt2).width+14,tx=cl((st.rd.mx||h.x)+34+tw/2,tw/2+4,(W+2*M)*S-tw/2-4),ty=cl((st.rd.my||h.y)+34,16,(H+2*M)*S-16);slLabel(tt2,tx,ty)}}
  ctx.restore()}
/* Ctrl+Shift+R: Rotate by... (stable's dialog, applied live like lazer's popover) */
function openRot(){if(!st.map)return;if(!rotBegin()){toast('Select objects to rotate first');return}
  var d=$('rotdlg'),can=ROT.can,org='play';try{org=localStorage.getItem('sm_rotorigin')||'play'}catch(_){}
  if(org==='sel'&&!can)org='play';
  $('rotAng').value=0;$('rotNum').value=0;$('rotCW').checked=true;$('rotSel').disabled=!can;$('rotSelL').style.opacity=can?1:.5;$('rotSelL').title=can?'':'Select more than one object to rotate around the selection centre';
  $('rotPlay').checked=org!=='sel';$('rotSel').checked=org==='sel';d.returnValue='';d.showModal();$('rotNum').focus();$('rotNum').select()}
function rotApply(){if(!ROT)return;var v=cl(+$('rotNum').value||0,0,360)*($('rotACW').checked?-1:1);rotUpdate(v,$('rotSel').checked?null:{x:W/2,y:H/2})}
$('rotAng').addEventListener('input',function(){$('rotNum').value=$('rotAng').value;rotApply()});
$('rotNum').addEventListener('input',function(){$('rotAng').value=cl(+$('rotNum').value||0,0,360);rotApply()});
$('rotNum').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('rotdlg').close('ok')}});
['rotCW','rotACW','rotPlay','rotSel'].forEach(function(id){$(id).addEventListener('change',function(){try{localStorage.setItem('sm_rotorigin',$('rotSel').checked?'sel':'play')}catch(_){}rotApply()})});
$('rotOk').addEventListener('click',function(){$('rotdlg').close('ok')});
$('rotNo').addEventListener('click',function(){$('rotdlg').close('cancel')});
$('rotdlg').addEventListener('close',function(){if($('rotdlg').returnValue==='ok'){rotApply();rotCommit()}else rotCancel()});
