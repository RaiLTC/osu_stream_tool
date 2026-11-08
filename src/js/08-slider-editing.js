/* ---- slider editing, as in lazer (PathControlPointVisualiser / SliderSelectionBlueprint) ----
   a selected slider shows its control points: drag one to reshape, Ctrl+click on the body adds one (after the nearest segment, and drags it),
   Ctrl+click toggles a point in the selection, Delete / right-click menu removes it, the dashed ring at the tail drags the length (snapped to the beat) */
var PTR=8,OFS2=null;
function selSliders(){var r=[];if(!st.map)return r;st.csel.forEach(function(k){var a=parseKey(k);if(a.o){var o=st.map.objs[a.i];if(o&&o.sl&&r.indexOf(o)<0)r.push(o)}});return r}
function uniqPts(o){var u=[];o.sl.pts.forEach(function(q){if(u.indexOf(q)<0)u.push(q)});return u}
function pselOf(o){return(st.po===o&&st.psel)?st.psel.filter(function(q){return o.sl.pts.indexOf(q)>0}):[]}
/* same, but the head counts too (it carries the first segment's type) */
function pselTypeOf(o){return(st.po===o&&st.psel)?st.psel.filter(function(q){return o.sl.pts.indexOf(q)>=0}):[]}
/* a perfect-curve segment needs exactly 3 points, otherwise it is drawn as a bezier */
function slNorm(s){slRanges(s.type,s.pts).forEach(function(r){if(r.ty==='perfect'&&r.b-r.a+1!==3){if(r.a===0)s.type='bezier';else s.pts[r.a].type='bezier'}})}
/* type of the segment that starts at anchor index ix (or, for the last anchor, the segment that ends there) */
function slSegTypeAt(s,ix){var rg=slRanges(s.type,s.pts),k;for(k=0;k<rg.length;k++)if(ix>=rg[k].a&&ix<rg[k].b)return rg[k].ty;return rg.length?rg[rg.length-1].ty:s.type}
/* lazer: after control points change, the slider length follows the path (its calculated length snapped to the beat divisor) - HitObject.SnapTo(distanceSnapProvider) */
function slRepathSnap(o){var s=o.sl,pl=slPath(s.type,s.pts,0).len;if(pl>=2)s.len=slSnapLen(o.time,pl,s.slides||1);slRepath(o,true)}
function slRepath(o,lenCh){var s=o.sl;slNorm(s);var r=slPath(s.type,s.pts,s.len);s.path=r.path;s.cum=r.cum;o.x=s.pts[0].x;o.y=s.pts[0].y;o.mod=true;if(lenCh)recSliders()}
function slHit(m,ctrl,head){var best=null,bd=1e9,R0=st.radius,ss=selSliders(),i;
  ss.forEach(function(o){var so=(o.sh||0)*(st.soff||0);
    uniqPts(o).forEach(function(q){if(q===o.sl.pts[0])return;var d=Math.hypot(q.x+so-m.x,q.y+so-m.y);if(d<=PTR&&d<bd){bd=d;best={o:o,q:q,k:'pt'}}})});
  if(best)return best;
  if(head){for(i=ss.length-1;i>=0;i--){var oh=ss[i],soh=(oh.sh||0)*(st.soff||0);if(Math.hypot(oh.x+soh-m.x,oh.y+soh-m.y)<=R0)return{o:oh,q:oh.sl.pts[0],k:'pt'}}}
  if(ctrl){for(i=ss.length-1;i>=0;i--){var o2=ss[i],so2=(o2.sh||0)*(st.soff||0),mm={x:m.x-so2,y:m.y-so2};
      if(Math.hypot(o2.x-mm.x,o2.y-mm.y)>R0&&distPath(o2.sl.path,mm)<=R0*.8)return{o:o2,k:'body'}}
    return null}
  for(i=ss.length-1;i>=0;i--){var o3=ss[i],so3=(o3.sh||0)*(st.soff||0),P=o3.sl.path,E=P[P.length-1],dT=Math.hypot(E.x+so3-m.x,E.y+so3-m.y),dH=Math.hypot(o3.x+so3-m.x,o3.y+so3-m.y);
    if(dT<=R0*.6&&dT<dH)return{o:o3,k:'tail'}}
  return null}
function slAddPt(o,m){var s=o.sl,so=(o.sh||0)*(st.soff||0),q={x:Math.round(cl(m.x-so,0,W)),y:Math.round(cl(m.y-so,0,H))},P=s.pts,bi=1,bd=1e9,i;
  for(i=0;i<P.length-1;i++){if(P[i]===P[i+1])continue;var d=distPath([P[i],P[i+1]],q);if(d<bd){bd=d;bi=i+1}}
  P.splice(bi,0,q);slRepath(o,false);return q}
function slDown(h,e,m){var o=h.o,ctrl=e.ctrlKey||e.metaKey;
  if(h.k==='pt'){var cur=pselOf(o);
    if(ctrl){var ix=cur.indexOf(h.q);if(ix>=0)cur.splice(ix,1);else cur.push(h.q);st.po=o;st.psel=cur;draw();return}
    var single=cur.indexOf(h.q)>=0&&cur.length>1;if(cur.indexOf(h.q)<0){st.po=o;st.psel=[h.q]}
    st.pd={o:o,kind:'pt',q:h.q,single:single,m:m,cx:e.clientX,cy:e.clientY,started:false}}
  else if(h.k==='body'){var np=slAddPt(o,m);st.po=o;st.psel=[np];st.pd={o:o,kind:'pt',q:np,single:false,m:m,cx:e.clientX,cy:e.clientY,started:false,added:true}}
  else st.pd={o:o,kind:'tail',m:m,cx:e.clientX,cy:e.clientY,started:false};
  cv.setPointerCapture(e.pointerId);draw()}
function slDrag(e,m){var pd=st.pd,po=pd.o,ps=po.sl;
  if(!pd.started){if(Math.abs(e.clientX-pd.cx)+Math.abs(e.clientY-pd.cy)<5)return;pd.started=true;
    if(pd.kind==='pt'){pd.ps=pselOf(po).map(function(q){return{q:q,x:q.x,y:q.y}});var bx0=1e9,bx1=-1e9,by0=1e9,by1=-1e9;
      pd.ps.forEach(function(z){bx0=Math.min(bx0,z.x);bx1=Math.max(bx1,z.x);by0=Math.min(by0,z.y);by1=Math.max(by1,z.y)});
      pd.bb=[bx0,bx1,by0,by1];pd.dx=0;pd.dy=0;pd.g=pd.ps.filter(function(z){return z.q===pd.q})[0]||pd.ps[0]}}
  var so=(po.sh||0)*(st.soff||0);
  if(pd.kind==='pt'&&pd.ps.length){
    var ddx=cl(m.x-pd.m.x,-pd.bb[0],W-pd.bb[1]),ddy=cl(m.y-pd.m.y,-pd.bb[2],H-pd.bb[3]);
    if(!e.altKey&&!e.shiftKey){var sn=nearSnap(pd.g.x+ddx+so,pd.g.y+ddy+so,[po],null);if(sn){ddx=sn.x-pd.g.x;ddy=sn.y-pd.g.y}}
    if(e.shiftKey&&pd.ps.length===1&&(ps.type==='linear'||slDistinct(ps.pts)===2)){var ix0=ps.pts.indexOf(pd.g.q),rf=null,ii;for(ii=ix0-1;ii>=0;ii--)if(ps.pts[ii]!==pd.g.q){rf=ps.pts[ii];break}
      if(rf){var spp=snapAng(rf,{x:pd.g.x+ddx,y:pd.g.y+ddy});ddx=spp.x-pd.g.x;ddy=spp.y-pd.g.y}}
    var ap=function(dx,dy){pd.ps.forEach(function(z){z.q.x=z.x+dx;z.q.y=z.y+dy})};
    ap(ddx,ddy);if(slPath(ps.type,ps.pts,0).len<2)ap(pd.dx,pd.dy);else{pd.dx=ddx;pd.dy=ddy}
    slRepathSnap(po)}
  else if(pd.kind==='tail'){
    var cc0=(ps.type==='perfect'&&ps.pts.length===3)?circ3(ps.pts[0],ps.pts[1],ps.pts[2]):null,r0=slPath(ps.type,ps.pts,cc0?2*Math.PI*cc0.r:0),Pp=r0.path,E=Pp[Pp.length-1],Q=Pp[Math.max(0,Pp.length-2)],dl=Math.hypot(E.x-Q.x,E.y-Q.y)||1,
        ext=Pp.concat([{x:E.x+(E.x-Q.x)/dl*900,y:E.y+(E.y-Q.y)/dl*900}]),nr=nearOnLine(ext,cumOf(ext),{x:m.x-so,y:m.y-so});
    ps.len=slSnapLen(po.time,cl(nr.s,4,1e5),ps.slides);slRepath(po,true)}
  st.key='';draw()}
/* lazer: a type is set on an anchor and shapes the segment that starts there (up to the next anchor with its own type). Choosing Perfect on
   an anchor makes it start a 3-point segment, so the anchor after it shapes the arc; any points beyond those 3 stay in the previous type. */
function slSetPtType(o,qs,t){
  var s=o.sl,P=s.pts,any=false;
  qs.forEach(function(q){
    var ix=P.indexOf(q);if(ix<0)return;
    var rg0=slRanges(s.type,P),start=ix===P.length-1?rg0[rg0.length-1].a:ix,old=slSegTypeAt(s,start),had=start>0?P[start].type:s.type;
    var restore=function(){if(start===0)s.type=had;else{if(had)P[start].type=had;else delete P[start].type}};
    if(start===0)s.type=t;else P[start].type=t;
    if(t==='perfect'){
      var r=slRanges(s.type,P).filter(function(z){return z.a===start})[0],size=r?r.b-r.a+1:0;
      if(size<3){restore();return}
      if(size>3){if(P[start+1]===P[start]||P[start+2]===P[start+1]){restore();return}P[start+2].type=old}}
    any=true});
  if(any)slRepath(o,false);
  return any}
/* apply a type to a slider: to the selected anchors when there are some, otherwise to the whole slider */
function slTypeApply(o,t){var s=o.sl,qs=pselTypeOf(o);
  if(qs.length)return slSetPtType(o,qs,t);
  if(t==='perfect'&&s.pts.length!==3)return false;
  s.type=t;s.pts.forEach(function(q,i){if(i)delete q.type});slRepath(o,false);return true}
function slSetType(o,t){if(!slTypeApply(o,t)){toast('Perfect curve needs 3 points in its segment');return}checkpoint();draw()}
function cycleSelSlType(d){var ss=selSliders();if(!ss.length)return false;var o0=ss[0],q0=pselTypeOf(o0)[0],cur=q0?slSegTypeAt(o0.sl,o0.sl.pts.indexOf(q0)):o0.sl.type,i=SLTYPES.indexOf(cur),n=SLTYPES.length;
  for(var k=1;k<=n;k++){var t=SLTYPES[((i+d*k)%n+n)%n];
    if(ss.filter(function(o){return slTypeApply(o,t)}).length){checkpoint();toast('Curve: '+t);draw();return true}}
  return true}
function slDup(o){var s=o.sl,ps=pselOf(o);if(!ps.length)return;
  ps.forEach(function(q){var ix=s.pts.indexOf(q);if(ix>=0&&s.pts[ix+1]!==q)s.pts.splice(ix+1,0,q)});
  slRepath(o,false);checkpoint();draw()}
function slDelPts(o){var s=o.sl,ps=pselOf(o);if(!ps.length)return;
  ps.forEach(function(q){var ix=s.pts.indexOf(q);if(ix>0)s.pts.splice(ix,1)});
  if(slDistinct(s.pts)<2||slPath(s.type,s.pts,0).len<2){var i=st.map.objs.indexOf(o);if(i>=0)st.map.objs.splice(i,1);objsChanged();st.csel=[];st.psel=null;toast('Slider removed');checkpoint();draw();return}
  st.psel=null;slRepathSnap(o);checkpoint();draw()}
function openPtMenu(e,h){var o=h.o;if(pselTypeOf(o).indexOf(h.q)<0){st.po=o;st.psel=[h.q]}
  var NM={linear:'Linear',bezier:'Bezier',perfect:'Perfect curve',catmull:'Catmull'};
  menu.innerHTML=SLTYPES.map(function(t){return '<button data-a="'+t+'">'+NM[t]+(t===slSegTypeAt(o.sl,Math.max(0,o.sl.pts.indexOf(h.q)))?'  \u2713':'')+'</button>'}).join('')+(h.q===o.sl.pts[0]?'':'<hr><button data-a="dup">Duplicate point (red anchor)</button><button data-a="del">Delete point</button>');
  menu.style.display='block';menu.style.left=Math.min(e.clientX,innerWidth-210)+'px';menu.style.top=Math.min(e.clientY,innerHeight-230)+'px';draw()}
function circ3(a,b,c){var d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));if(Math.abs(d)<1e-6)return null;
  var A=a.x*a.x+a.y*a.y,B=b.x*b.x+b.y*b.y,C=c.x*c.x+c.y*c.y,ux=(A*(b.y-c.y)+B*(c.y-a.y)+C*(a.y-b.y))/d,uy=(A*(c.x-b.x)+B*(a.x-c.x)+C*(b.x-a.x))/d;return{x:ux,y:uy,r:Math.hypot(a.x-ux,a.y-uy)}}
/* straight slider: direction (same convention as the stream label: 0 = right, 90 = up); perfect curve: circumference of its circle */
function slInfo(type,pts,path){if(!path||path.length<2)return null;
  var u=[];pts.forEach(function(q,i){if(!i||q!==pts[i-1])u.push(q)});
  if(type==='perfect'&&pts.length===3&&u.length===3){var c=circ3(u[0],u[1],u[2]);if(c&&c.r<1e5)return{k:'circ',circ:2*Math.PI*c.r,r:c.r,cx:c.x,cy:c.y,at:u[1],path:path}}
  var a=path[0],e=path[path.length-1],L=Math.hypot(e.x-a.x,e.y-a.y);if(L<2)return null;
  var vx=(e.x-a.x)/L,vy=(e.y-a.y)/L,i;
  for(i=1;i<path.length-1;i++)if(Math.abs((path[i].x-a.x)*vy-(path[i].y-a.y)*vx)>.75)return null;
  return{k:'deg',deg:(Math.atan2(-(e.y-a.y),e.x-a.x)*180/Math.PI+360)%360,mx:(a.x+e.x)/2,my:(a.y+e.y)/2,vx:vx,vy:vy}}
function slLabel(txt,gx,gy){ctx.save();ctx.globalAlpha=1;ctx.font='600 15px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  var tw=ctx.measureText(txt).width+14;ctx.fillStyle=col['--accent'];ctx.fillRect(gx-tw/2,gy-12,tw,24);ctx.fillStyle='#fff';ctx.fillText(txt,gx,gy+1);ctx.restore()}
function slInfoDraw(inf){var R0=st.radius;
  if(inf.k==='deg'){var nx=-inf.vy,ny=inf.vx;if(ny>0){nx=-nx;ny=-ny}if(Math.abs(ny)<.2&&nx<0){nx=-nx;ny=-ny}
    slLabel(degTxt(inf.deg),X(inf.mx+nx*(R0+14)),Y(inf.my+ny*(R0+14)))}
  else{if(inf.r<=500){if(!OFS2)OFS2=document.createElement('canvas');if(OFS2.width!==cv.width||OFS2.height!==cv.height){OFS2.width=cv.width;OFS2.height=cv.height}
      var g2=OFS2.getContext('2d');g2.clearRect(0,0,OFS2.width,OFS2.height);g2.setLineDash([6,6]);g2.lineWidth=2;g2.strokeStyle=col['--accent'];g2.beginPath();g2.arc(X(inf.cx),Y(inf.cy),inf.r*S,0,6.283);g2.stroke();
      g2.setLineDash([]);g2.globalCompositeOperation='destination-out';g2.lineCap='round';g2.lineJoin='round';g2.lineWidth=st.radius*S*1.72;g2.beginPath();inf.path.forEach(function(q,i){i?g2.lineTo(X(q.x),Y(q.y)):g2.moveTo(X(q.x),Y(q.y))});g2.stroke();g2.globalCompositeOperation='source-over';
      ctx.save();ctx.globalAlpha=.55;ctx.drawImage(OFS2,0,0);ctx.restore()}
    var dx=inf.at.x-inf.cx,dy=inf.at.y-inf.cy,dl=Math.hypot(dx,dy)||1;slLabel('circ '+inf.circ.toFixed(1),X(inf.at.x+dx/dl*(R0+16)),Y(inf.at.y+dy/dl*(R0+16)))}}
/* straight pieces of a slider (every piece of a linear one, 2-point pieces of a bezier), cut at the tail */
function slSegs(type,pts,len){var out=[],i,pc;
  if(type==='linear'){var u=[];pts.forEach(function(q,k){if(!k||q!==pts[k-1])u.push(q)});for(i=0;i<u.length-1;i++)out.push([u[i],u[i+1]])}
  else if(type==='bezier'){pc=[pts[0]];for(i=1;i<pts.length;i++){if(pts[i]===pts[i-1]){pc=[pts[i]];continue}pc.push(pts[i]);
      if(pc.length===2&&(i===pts.length-1||pts[i+1]===pts[i]))out.push([pc[0],pc[1]]);else if(pc.length>2)pc=[pts[i]]}}
  var acc=0,res=[];
  for(i=0;i<out.length;i++){var a=out[i][0],b=out[i][1],L=Math.hypot(b.x-a.x,b.y-a.y);if(L<2)continue;
    if(len&&acc+L>len+.01){var f=(len-acc)/L;if(f>.05)res.push([a,{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}]);break}
    res.push([a,b]);acc+=L}
  return res}
function slDegLabel(a,b){var L=Math.hypot(b.x-a.x,b.y-a.y),vx=(b.x-a.x)/L,vy=(b.y-a.y)/L,nx=-vy,ny=vx;if(ny>0){nx=-nx;ny=-ny}if(Math.abs(ny)<.2&&nx<0){nx=-nx;ny=-ny}
  var d=(Math.atan2(-(b.y-a.y),b.x-a.x)*180/Math.PI+360)%360,R0=st.radius*.55+10;
  slLabel(degTxt(d),X((a.x+b.x)/2+nx*R0),Y((a.y+b.y)/2+ny*R0))}
function slLabels(type,pts,path,len){var sg=slSegs(type,pts,len);
  if(sg.length>1){sg.forEach(function(q){slDegLabel(q[0],q[1])});return}
  var inf=slInfo(type,pts,path);if(inf)slInfoDraw(inf)}
function drawSlPts(){
  var acc=col['--accent'],R0=st.radius;
  selSliders().forEach(function(o){var so=(o.sh||0)*(st.soff||0)*S,s=o.sl,P=s.pts,ps=pselOf(o),u=uniqPts(o);
    ctx.save();ctx.translate(so,so);
    ctx.globalAlpha=.55;ctx.strokeStyle=acc;ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.beginPath();P.forEach(function(q,i){i?ctx.lineTo(X(q.x),Y(q.y)):ctx.moveTo(X(q.x),Y(q.y))});ctx.stroke();
    var E=s.path[s.path.length-1];ctx.globalAlpha=.9;ctx.lineWidth=2;ctx.setLineDash([5,4]);ctx.beginPath();ctx.arc(X(E.x),Y(E.y),R0*S*.6,0,6.283);ctx.stroke();ctx.setLineDash([]);
    u.forEach(function(q){if(q===P[0])return;var sel=ps.indexOf(q)>=0,red=P.indexOf(q)!==P.lastIndexOf(q);
      ctx.globalAlpha=1;ctx.beginPath();ctx.rect(X(q.x)-9,Y(q.y)-9,18,18);ctx.fillStyle=sel?acc:(red?'#e8485a':'#fff');ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=red?'#fff':acc;ctx.stroke();
      var ix=P.indexOf(q);if(q.type&&ix<P.length-1){ctx.textAlign='center';ctx.textBaseline='middle';lbl(({linear:'L',perfect:'P',bezier:'B',catmull:'C'})[q.type]||'',X(q.x),Y(q.y)-19,13)}});
    ctx.globalAlpha=1;ctx.textAlign='center';ctx.textBaseline='middle';lbl(({linear:'Linear',bezier:'Bezier',perfect:'Perfect',catmull:'Catmull'})[s.type]||s.type,X(P[0].x),Y(P[0].y)-R0*S-14,13);
    slLabels(s.type,P,s.path,s.len);
    ctx.restore()});
  ctx.globalAlpha=1}
