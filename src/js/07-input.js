/* ---- playfield input ---- */
/* ===== circle-first editing core (v2): circles are the only data, no anchors ===== */
function topAt(m){var L=st.live,i,c,sl={},best=null,bd=1e18,bs=null,bsd=1e18;st.csel.forEach(function(k){sl[k]=1});
  for(i=0;i<L.length;i++){c=L[i];if(!visC(c))continue;var so=(c.sh||0)*(st.soff||0),dd=Math.hypot(c.x+so-m.x,c.y+so-m.y);if(dd>st.radius)continue;if(sl[c.b+':'+c.i]&&dd<bsd){bsd=dd;bs=c}if(dd<bd){bd=dd;best=c}}
  return bs||best}/* a selected circle is picked even when other circles lie on top of it */
function patRange(B,i){var pb=B.pb&&B.pb.length?B.pb:[0],a=0,b=B.pos.length-1,k;for(k=0;k<pb.length;k++){if(pb[k]<=i)a=pb[k];else{b=pb[k]-1;break}}return[a,b]}
function selectRange(B,a,b){build();st.csel=[];B.circles.forEach(function(c){if(!c.del&&c.i>=a&&c.i<=b)st.csel.push(B.id+':'+c.i)});st.ab=B.id;st.sel=[];st.canc=st.csel[0]||null;syncPanel()}
function selClick(c,ctrl,sh){
  var B=bodyById(c.b);if(!B)return;
  if(ctrl){selectBody(c.b);return}
  if(sh){var one=st.csel.length===1?parseKey(st.csel[0]):null;
    if(one&&!one.o&&one.b===c.b&&one.i!==c.i){selectRange(B,Math.min(one.i,c.i),Math.max(one.i,c.i));return}
    var pr=patRange(B,c.i);selectRange(B,pr[0],pr[1]);return}
  var key=c.b+':'+c.i;st.csel=[key];st.ab=c.b;st.sel=[];st.canc=key;syncPanel()}
function selectBody(id){var B=bodyById(id);if(!B)return;st.csel=B.circles.filter(function(c){return !c.del}).map(function(c){return id+':'+c.i});st.ab=id;st.sel=[];st.canc=st.csel[0]||null;syncPanel()}
function overrideOthers(B){
  if(!B||st.bodies.indexOf(B)<0)return;build();
  var set={},changed=false;B.circles.forEach(function(c){if(!c.del)set[Math.round(c.time)]=1});
  st.bodies.slice().forEach(function(O){if(O===B)return;
    O.circles.forEach(function(c){if(c.del)return;var t=Math.round(c.time);if(set[t]||set[t-1]||set[t+1]){O.del[c.i]=1;delete O.ncf[c.i];changed=true}});
    if(!O.circles.some(function(c){return !c.del&&!O.del[c.i]}))dropBody(O)});
  if(changed){st.key='';build();st.csel=st.csel.filter(function(k){var q=parseKey(k);if(q.o)return true;var c=circleOf(k);return !!c&&!c.del})}}
/* geometry: a path is a chain of arcs; each arc leaves its start along the previous tangent (smooth bend), a corner node restarts straight */
function cumOf(pl){var c=[0],i;for(i=1;i<pl.length;i++)c.push(c[i-1]+Math.hypot(pl[i].x-pl[i-1].x,pl[i].y-pl[i-1].y));return c}
function arcPath(nodes,C,tan0,style){style=style||'arc';
  var pl=[{x:nodes[0].x,y:nodes[0].y}],tan=tan0||null,all=nodes.concat([{x:C.x,y:C.y}]),i,j;
  for(i=0;i<all.length-1;i++){
    var A=all[i],B=all[i+1];if(i>0&&A.corner)tan=null;
    var vx=B.x-A.x,vy=B.y-A.y,len=Math.hypot(vx,vy);if(len<1e-6)continue;
    if(style==='bez'&&tan){
      var ux=vx/len,uy=vy/len,q1={x:A.x+tan.x*len/3,y:A.y+tan.y*len/3},q2={x:B.x-ux*len/3,y:B.y-uy*len/3},nb=Math.max(8,Math.ceil(len/4)),t,mt;
      for(j=1;j<=nb;j++){t=j/nb;mt=1-t;pl.push({x:mt*mt*mt*A.x+3*mt*mt*t*q1.x+3*mt*t*t*q2.x+t*t*t*B.x,y:mt*mt*mt*A.y+3*mt*mt*t*q1.y+3*mt*t*t*q2.y+t*t*t*B.y})}
      pl[pl.length-1]={x:B.x,y:B.y};tan={x:ux,y:uy};continue}
    var k=tan?(-tan.y*vx+tan.x*vy):0;
    if(style==='line'||!tan||Math.abs(k)<1e-3*len){pl.push({x:B.x,y:B.y});tan={x:vx/len,y:vy/len};continue}
    var rad=len*len/(2*k),r=Math.abs(rad),cx=A.x-tan.y*rad,cy=A.y+tan.x*rad,sg=rad>0?1:-1,
        a0=Math.atan2(A.y-cy,A.x-cx),aB=Math.atan2(B.y-cy,B.x-cx),T=2*Math.PI,sw=(((aB-a0)*sg)%T+T)%T;
    if(sw>T*.8){pl.push({x:B.x,y:B.y});tan={x:vx/len,y:vy/len};continue}
    var steps=Math.max(2,Math.ceil(sw*r/3));
    for(j=1;j<=steps;j++){var an=a0+sg*sw*j/steps;pl.push({x:cx+r*Math.cos(an),y:cy+r*Math.sin(an)})}
    pl[pl.length-1]={x:B.x,y:B.y};
    var ux=(B.x-cx)/r,uy=(B.y-cy)/r;tan={x:sg*-uy,y:sg*ux}}
  return pl}
function atD(pl,cum,d){var j=1;while(j<cum.length-1&&cum[j]<d)j++;var seg=cum[j]-cum[j-1]||1,f=cl((d-cum[j-1])/seg,0,1);return{x:pl[j-1].x+(pl[j].x-pl[j-1].x)*f,y:pl[j-1].y+(pl[j].y-pl[j-1].y)*f}}
function resample(pl,n,bias,dd,fc,rc){
  if(pl.length<2||n<2)return [{x:pl[0].x,y:pl[0].y}];
  var cum=cumOf(pl),L=cum[cum.length-1],out=[],i,fr=dd?null:fracs(n,bias||0,fc||0,rc||0);
  for(i=0;i<n;i++){var d=dd?Math.min(L,i*dd):fr[i]*L;var p=atD(pl,cum,d);out.push({x:cl(p.x,0,W),y:cl(p.y,0,H)})}
  return out}
/* Spacing ramp: the gaps change evenly from the first to the last circle (like lowering DS by a fixed amount per circle),
   measured in a straight line like lazer's distance snap, on the same shape; first and last circle stay on the shape's ends.
   a > 0: later gaps larger (accel); a < 0: earlier gaps larger (deccel). Ratio last/first gap = (1+a)/(1-a). */
function chordWalk(pl,gaps){
  var cum=cumOf(pl),j=0,t0=0,prev={x:pl[0].x,y:pl[0].y},out=[{x:prev.x,y:prev.y}],sl=0,k;
  for(k=0;k<gaps.length;k++){var g=gaps[k],found=false;
    while(j<pl.length-1){var A=pl[j],B=pl[j+1],vx=B.x-A.x,vy=B.y-A.y,ux=A.x-prev.x,uy=A.y-prev.y,a=vx*vx+vy*vy;
      if(a<1e-12){j++;t0=0;continue}
      var b=2*(ux*vx+uy*vy),c=ux*ux+uy*uy-g*g,disc=b*b-4*a*c;
      if(disc>=0){var te=(-b+Math.sqrt(disc))/(2*a);if(te>=t0-1e-9&&te<=1){var q={x:A.x+vx*te,y:A.y+vy*te};out.push(q);prev=q;t0=Math.max(t0,te);sl=cum[j]+te*Math.sqrt(a);found=true;break}}
      j++;t0=0}
    if(!found){var e=pl[pl.length-1];out.push({x:e.x,y:e.y});prev=e;sl=cum[cum.length-1]}}
  return{pts:out,s:sl}}
function rampResample(pl,n,a,free,g0){
  if(pl.length<2||n<2)return [{x:pl[0].x,y:pl[0].y}];
  var L=cumOf(pl).pop(),m=n-1,t=pl[pl.length-1],q=pl[Math.max(0,pl.length-2)],tl=Math.hypot(t.x-q.x,t.y-q.y)||1,
      ex=pl.concat([{x:t.x+(t.x-q.x)/tl*L*3,y:t.y+(t.y-q.y)/tl*L*3}]),
      w=[],i;for(i=0;i<m;i++){var u=m>1?i/(m-1):.5;w.push(1+a*(2*u-1))}
  if(free&&g0>0){/* the average gap keeps its size and every gap follows a geometric accel/decel ramp: all circles after the first move, the run gets longer and the last circle moves along (past the old end along its tangent) */
    var kk=Math.atanh(Math.max(-.95,Math.min(.95,a))),rf=chordWalk(ex,w.map(function(x,i){var u=m>1?i/(m-1):.5;return g0*Math.exp(kk*(2*u-1))}));return rf.pts.map(function(p){return{x:cl(p.x,0,W),y:cl(p.y,0,H)}})}
  var lo=0,hi=3*L/m*2,res=null;
  for(i=0;i<50;i++){var c=(lo+hi)/2,W2=chordWalk(ex,w.map(function(x){return x*c}));if(W2.s>L)hi=c;else lo=c}
  res=chordWalk(ex,w.map(function(x){return x*lo}));var out=res.pts;out[out.length-1]={x:t.x,y:t.y};
  return out.map(function(p){return{x:cl(p.x,0,W),y:cl(p.y,0,H)}})}
/* constant gap steps: gap k = first gap + k*step (step given in SV: one SV is 100*sliderMultiplier px per beat, shared by the snap divisor) */
function stepResample(pl,n,g0,dpx){
  if(pl.length<2||n<2)return [{x:pl[0].x,y:pl[0].y}];
  var L=cumOf(pl).pop(),m=n-1,t=pl[pl.length-1],q=pl[Math.max(0,pl.length-2)],tl=Math.hypot(t.x-q.x,t.y-q.y)||1,
      ex=pl.concat([{x:t.x+(t.x-q.x)/tl*L*4,y:t.y+(t.y-q.y)/tl*L*4}]),gaps=[],i;
  for(i=0;i<m;i++)gaps.push(Math.max(2,g0+(i+1)*dpx));
  return chordWalk(ex,gaps).pts.map(function(p){return{x:cl(p.x,0,W),y:cl(p.y,0,H)}})}
/* same arithmetic gap steps, but the last circle stays where it is: the first gap is solved so the walk ends exactly at the end of the path */
function stepPinned(pl,n,dpx){
  if(pl.length<2||n<2)return [{x:pl[0].x,y:pl[0].y}];
  var L=cumOf(pl).pop(),m=n-1,t=pl[pl.length-1],q=pl[Math.max(0,pl.length-2)],tl=Math.hypot(t.x-q.x,t.y-q.y)||1,
      ex=pl.concat([{x:t.x+(t.x-q.x)/tl*L*4,y:t.y+(t.y-q.y)/tl*L*4}]);
  var walk=function(g0){var gaps=[],i;for(i=0;i<m;i++)gaps.push(Math.max(2,g0+i*dpx));return chordWalk(ex,gaps)};
  var lo=0,hi=Math.max(4,L/m*3+Math.abs(dpx)*m),k,r;
  for(k=0;k<40;k++){var mid=(lo+hi)/2;r=walk(mid);if(r.s<L)lo=mid;else hi=mid}
  r=walk((lo+hi)/2);var P=r.pts.map(function(p){return{x:cl(p.x,0,W),y:cl(p.y,0,H)}});P[P.length-1]={x:cl(t.x,0,W),y:cl(t.y,0,H)};return P}
/* stream spacing: the map's base velocity x the timing SV, unless overridden for streams only (never exported) */
function smStr(){return st.smS!=null?st.smS:((st.map&&st.map.sm)||1.4)}
function svStr(t){return st.svS!=null?st.svS:svAt(t)}
function strD(t,snap){return 100*smStr()*svStr(t)/snap}
function strInfo(){var el=$('strNow');if(el&&st.map)el.textContent=(st.smS!=null||st.svS!=null)?('Streams: '+smStr().toFixed(2)+' x '+(st.svS!=null?st.svS.toFixed(2):'SV')+(st.svS!=null?' = '+(smStr()*st.svS).toFixed(2)+'x':'')):'Streams follow the map'}
function stepPx(B){var sv=parseFloat($('biasStep').value);if(!isFinite(sv)||sv===0)return 0;return sv*100*smStr()/(B&&B.snap||+$('bsnap').value||4)}
function splinePl(P){
  var n=P.length,out=[],i,s;if(n<3)return P.map(function(p){return{x:p.x,y:p.y}});
  for(i=0;i<n-1;i++){var p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(n-1,i+2)];
    for(s=0;s<8;s++){var t=s/8,t2=t*t,t3=t2*t;
      out.push({x:.5*(2*p1.x+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
                y:.5*(2*p1.y+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3)})}}
  out.push({x:P[n-1].x,y:P[n-1].y});return out}
function bodyD(B){return strD(B.start,B.snap)}
function cntFor(L,dd,lin){return cl(lin?Math.floor(L/dd+1e-6)+1:Math.round(L/dd)+1,2,500)}
/* selected run of one stream (contiguous index range) */
function selRun(whole){
  build();var by={},ids;
  st.csel.forEach(function(k){var a=parseKey(k);if(a.o)return;(by[a.b]=by[a.b]||[]).push(a.i)});
  ids=Object.keys(by);if(ids.length>1)return null;
  var B,idx;
  if(!ids.length){if(!whole||!AB())return null;B=AB();idx=B.circles.filter(function(c){return !c.del}).map(function(c){return c.i})}
  else{B=bodyById(+ids[0]);if(!B)return null;idx=by[ids[0]].filter(function(i){return B.circles[i]&&!B.circles[i].del})}
  if(!idx.length)return null;
  var i0=Math.min.apply(0,idx),i1=Math.max.apply(0,idx);
  return{B:B,i0:i0,i1:i1,full:i0===0&&i1===B.pos.length-1}}
function setRun(R,np){
  var B=R.B,old=R.i1-R.i0+1,dl=np.length-old,nd={},nf={};
  B.pos.splice.apply(B.pos,[R.i0,old].concat(np));
  if(dl!==0){Object.keys(B.del).forEach(function(k){k=+k;if(k>R.i1)nd[k+dl]=1;else if(k<R.i0)nd[k]=1});B.del=nd;
    Object.keys(B.ncf).forEach(function(k){var v=B.ncf[k];k=+k;if(k>R.i1)nf[k+dl]=v;else if(k<=R.i1)nf[k]=v});B.ncf=nf;B.ticks=null}
  B.pb=(B.pb||[0]).filter(function(v){return v<=R.i0||v>R.i1}).map(function(v){return v>R.i1?v+dl:v});if(!B.pb.length||B.pb[0]!==0)B.pb.unshift(0);
  B.count=B.pos.length;st.key='';build();
  st.csel=[];for(var i=R.i0;i<R.i0+np.length;i++)st.csel.push(B.id+':'+i);st.ab=B.id;st.canc=st.csel[0];syncPanel()}
function applyBias(v,fc,rc){
  var R=selRun(true);if(!R||R.i1-R.i0<2)return;fc=fc||0;rc=rc||0;
  var sg=st.csel.join(',')+'|'+R.B.id;
  if(!st.sp||st.sp.sg!==sg){st.sp={sg:sg,B:R.B,i0:R.i0,i1:R.i1,orig:R.B.pos.slice(R.i0,R.i1+1).map(function(p){return{x:p.x,y:p.y}}),v:0,f:0,r:0}}
  var S=st.sp;S.v=v;S.f=fc;S.r=rc;
  var cp=S.orig.map(function(p){return{x:p.x,y:p.y}}),prev=v===0&&fc!==0;
  var stp=stepPx(R.B),g00=(function(){var t=0,j;for(j=1;j<S.orig.length;j++)t+=Math.hypot(S.orig[j].x-S.orig[j-1].x,S.orig[j].y-S.orig[j-1].y);return t/Math.max(1,S.orig.length-1)})(),np=(stp&&$('stepEnd')&&!$('stepEnd').checked)?stepPinned(splinePl(S.orig),S.orig.length,stp):stp?stepResample(splinePl(S.orig),S.orig.length,Math.hypot(S.orig[1].x-S.orig[0].x,S.orig[1].y-S.orig[0].y),stp):v===0?cp:rampResample(splinePl(S.orig),S.orig.length,v/100*.9,st.bfree,(function(){var t=0,j;for(j=1;j<S.orig.length;j++)t+=Math.hypot(S.orig[j].x-S.orig[j-1].x,S.orig[j].y-S.orig[j-1].y);return t/Math.max(1,S.orig.length-1)})());
  for(var i=0;i<np.length;i++)R.B.pos[S.i0+i]=np[i];

  var dm=0,og=function(P,j){return Math.max(.5,Math.hypot(P[Math.max(1,j)].x-P[Math.max(1,j)-1].x,P[Math.max(1,j)].y-P[Math.max(1,j)-1].y))};
  S.eff=np.map(function(q,j){var e=Math.abs(Math.log(og(np,j)/og(S.orig,j)));if(e>dm)dm=e;return e});
  S.eff=S.eff.map(function(e){return dm>.02?e/dm:0});
  st.key='';draw()}
function setRunCount(n){
  var R=selRun(true);if(!R)return;n=cl(Math.round(n)||2,2,500);
  var seg=R.B.pos.slice(R.i0,R.i1+1);if(seg.length<2||n===seg.length)return;
  if(R.B.ticks&&!R.full){toast('Count change needs a stream without custom timing');return}
  var np=resample(splinePl(seg),n,0);
  if(R.B.ticks&&R.full){R.B.pos=np;R.B.count=n;st.key='';return}
  setRun(R,np)}
function applyDS(){
  var R=selRun(false);if(!R||R.i1-R.i0<1)return;
  var cur=R.i1-R.i0+1;
  if(!st.dsr||st.dsr.B!==R.B||st.dsr.i0!==R.i0||st.dsr.n!==cur)st.dsr={B:R.B,i0:R.i0,orig:R.B.pos.slice(R.i0,R.i1+1).map(function(p){return{x:p.x,y:p.y}}),n:cur};
  var pl=splinePl(st.dsr.orig),L=cumOf(pl).pop(),dd=bodyD(R.B)*st.ds,n=cntFor(L,dd,true);
  if(R.B.ticks&&n!==cur)return;
  setRun(R,resample(pl,n,0,dd));st.dsr.n=n;checkpoint()}
/* creating: st.nd = {b,nodes,tan0,s0,sn0,d,ext,base,fixed,n,cnt,from,pm} */
function perfPl(A,B,C){
  var d=2*(A.x*(B.y-C.y)+B.x*(C.y-A.y)+C.x*(A.y-B.y)),line=[{x:A.x,y:A.y},{x:C.x,y:C.y}];
  if(Math.abs(d)<1e-3||Math.hypot(C.x-B.x,C.y-B.y)<2)return line;
  var a2=A.x*A.x+A.y*A.y,b2=B.x*B.x+B.y*B.y,c2=C.x*C.x+C.y*C.y,cx=(a2*(B.y-C.y)+b2*(C.y-A.y)+c2*(A.y-B.y))/d,cy=(a2*(C.x-B.x)+b2*(A.x-C.x)+c2*(B.x-A.x))/d,
      r=Math.hypot(A.x-cx,A.y-cy),tA=Math.atan2(A.y-cy,A.x-cx),tC=Math.atan2(C.y-cy,C.x-cx),
      dir=((B.x-A.x)*(C.y-B.y)-(B.y-A.y)*(C.x-B.x))>0?1:-1,T=2*Math.PI,sw=(((tC-tA)*dir)%T+T)%T;
  if(sw>T*.9||r>4000)return line;
  var n=Math.max(2,Math.ceil(sw*r/3)),pl=[],i;for(i=0;i<=n;i++){var a=tA+dir*sw*i/n;pl.push({x:cx+r*Math.cos(a),y:cy+r*Math.sin(a)})}
  pl[0]={x:A.x,y:A.y};pl[n]={x:C.x,y:C.y};return pl}
function ndApply(){
  var n=st.nd;if(!n||!n.b)return;var m=st.lm||n.pm,C={x:cl(m.x,0,W),y:cl(m.y,0,H)};
  var pl=(n.pa&&n.nodes.length===1)?perfPl(n.nodes[0],n.pa,C):arcPath(n.nodes,C,n.tan0,n.style),L=cumOf(pl).pop(),dd=n.d*st.ds,P,cnt;
  if(n.ext){
    cnt=n.fixed?n.n:(st.lin?Math.floor(L/dd+1e-6):Math.max(1,Math.round(L/dd)));cnt=cl(cnt,1,500);
    P=resample(pl,cnt+1,0,(st.lin&&!n.fixed)?dd:null);P.shift();n.b.pos=n.base.concat(P)}
  else{
    cnt=n.fixed?n.n:cntFor(L,dd,st.lin);cnt=cl(cnt,2,500);
    P=resample(pl,cnt,0,(st.lin&&!n.fixed)?dd:null);n.b.pos=P}
  n.cnt=cnt;n.b.count=n.b.pos.length;st.key='';if(st.ab===n.b.id)$('count').value=n.b.count}
function ndStart(n,m){
  var B=n.b;
  if(!B){B=newBody({ds:st.ds,start:n.s0,count:1,snap:n.sn0,lin:st.lin,nc:Math.round(+$('nc').value)||0});
    B.pos=[{x:n.nodes[0].x,y:n.nodes[0].y}];B.pb=[0];if(n.from)B.ncf[0]=n.from.nc;if(n.fromO)B.ncf[0]=!!n.fromO.nc;st.bodies.push(B);n.b=B}
  else if(n.ext){B.pb=(B.pb&&B.pb.length?B.pb:[0]).concat([n.base.length])}
  st.ab=B.id;st.csel=[];st.sel=[];st.key='';syncPanel()}
function ndNode(){
  var n=st.nd;if(!n||!n.b)return;var m=st.lm||n.pm,C={x:cl(m.x,0,W),y:cl(m.y,0,H)},last=n.nodes[n.nodes.length-1];
  if(n.nodes.length>1&&Math.hypot(C.x-last.x,C.y-last.y)<3){last.corner=true;ndApply();draw();return}
  n.nodes.push({x:C.x,y:C.y});ndApply();draw()}
cv.addEventListener('mousedown',function(e){if(e.button!==2||!st.map)return;
  if(st.slp){e.preventDefault();finishSlider();return}
  if(st.nd&&st.nd.b){e.preventDefault();var nR=st.nd;
    /* Shift-drag (arc style): a tap places one anchor and curves the stream as a perfect arc through start, anchor and cursor, like a slider; holding the button keeps the old behaviour (a bend node) */
    if(nR.style==='arc'&&nR.nodes.length===1&&st.lm){var m0=st.lm;nR.pa={x:cl(m0.x,0,W),y:cl(m0.y,0,H)};st.rcDown=true;clearTimeout(nR.rcT);
      nR.rcT=setTimeout(function(){if(st.nd===nR&&st.rcDown&&nR.pa){nR.pa=null;ndNode()}},230);ndApply();draw();return}
    ndNode();return}
  if(st.aimPrev&&e.shiftKey){var A0=aimBody();if(A0){e.preventDefault();st.aim={b:A0.B.id,ux:st.aimPrev.ux,uy:st.aimPrev.uy};toast('Stream direction set');draw();return}}
  if(st.tool==='select'){var hm=slHit(pos(e),false);if(hm&&hm.k==='pt'){e.preventDefault();openPtMenu(e,hm);return}}
  if(st.nd||st.dw||st.cd||st.pend)return;
  e.preventDefault();
  if(!st.csel.length){var c=topAt(pos(e));if(c)st.csel=[c.b+':'+c.i];else{var oi1=objAt(pos(e));if(oi1<0)return;st.csel=['o:'+oi1]}}
  if(delCircles())checkpoint();draw()});
function tangentOf(B){
  var cs=B.circles.filter(function(c){return !c.del}),n=cs.length;if(n<2)return null;
  var a=cs[n-2],b=cs[n-1],vx=b.x-a.x,vy=b.y-a.y,l=Math.hypot(vx,vy);if(l<1e-6)return null;
  var ang=Math.atan2(vy,vx);
  if(n>=3){var p=cs[n-3],ux=a.x-p.x,uy=a.y-p.y;if(Math.hypot(ux,uy)>1e-6){var da=ang-Math.atan2(uy,ux);while(da>Math.PI)da-=2*Math.PI;while(da<-Math.PI)da+=2*Math.PI;ang+=da/2}}
  return{x:Math.cos(ang),y:Math.sin(ang)}}
function isLastLive(B,i){var li=-1;B.circles.forEach(function(c){if(!c.del)li=c.i});return i===li}
/* freehand drawing: st.dw = {pts,b,run,orig,s0,sn0} */
function dwSample(P,N,speed){
  var pl=P.map(function(p){return{x:p.x,y:p.y}});
  if(speed&&P[P.length-1].t>0){
    var T=P[P.length-1].t,out=[],j,k=1;
    for(j=0;j<N;j++){var t=T*j/(N-1);while(k<P.length-1&&P[k].t<t)k++;var a=P[k-1],b=P[k],f=cl((t-a.t)/((b.t-a.t)||1),0,1);out.push({x:cl(a.x+(b.x-a.x)*f,0,W),y:cl(a.y+(b.y-a.y)*f,0,H)})}
    return out}
  return resample(pl,N,0)}
function dwApply(){
  var d=st.dw;if(!d||d.pts.length<2)return;
  var pl=d.pts,L=cumOf(pl).pop();if(L<6)return;
  if(d.run){
    var N=d.run.i1-d.run.i0+1,np=dwSample(pl,N,st.speed);
    for(var i=0;i<N;i++)d.run.B.pos[d.run.i0+i]=np[i];st.key='';return}
  var dd=d.d*st.ds,cnt=cntFor(L,dd,st.lin),P=dwSample(pl,cnt,st.speed);
  if(!d.b){var B=newBody({ds:st.ds,start:d.s0,count:1,snap:d.sn0,lin:st.lin,nc:Math.round(+$('nc').value)||0});B.pos=P;B.pb=[0];B.count=P.length;st.bodies.push(B);d.b=B;st.ab=B.id;st.csel=[];st.sel=[];syncPanel()}
  else{d.b.pos=P;d.b.count=P.length}
  st.key='';if(st.ab===d.b.id)$('count').value=d.b.count}
/* stacking, as in osu!: objects at the same place within Stack Leniency (x approach window) of each other are pushed up-left, newest on top */
function computeStacks(){
  var m=st.map,objs=m.objs,thr=st.pre*(m.stack==null?.7:m.stack),lo=st.ph-3000,hi=st.ph+st.pre+3000,it=[],i,j,sc=(1-.7*(m.cs-5)/5)/2;
  st.soff=-6.4*sc;
  for(i=lb(objs,lo-(m.maxDur||0));i<objs.length&&objs[i].time<=hi;i++){var o=objs[i],E=o.sl?o.sl.path[o.sl.path.length-1]:o;o.sh=0;it.push({r:o,x:o.x,y:o.y,ex:E.x,ey:E.y,t:o.time,e:o.end,sl:!!o.sl,h:0,k:it.length})}
  st.live.forEach(function(c){if(c.time<lo||c.time>hi)return;c.sh=0;it.push({r:c,x:c.x,y:c.y,ex:c.x,ey:c.y,t:c.time,e:c.time,sl:false,h:0,k:it.length})});
  it.sort(function(a,b){return a.t-b.t||a.k-b.k});
  var D=function(ax,ay,bx,by){return Math.hypot(ax-bx,ay-by)};
  for(i=it.length-1;i>0;i--){var n=i,I=it[i];if(I.h!==0)continue;
    if(!I.sl){while(--n>=0){var N=it[n];if(I.t-N.e>thr)break;
        if(N.sl&&D(N.ex,N.ey,I.x,I.y)<3){var off=I.h-N.h+1;for(j=n+1;j<=i;j++){var J=it[j];if(D(N.ex,N.ey,J.x,J.y)<3)J.h-=off}break}
        if(D(N.x,N.y,I.x,I.y)<3){N.h=I.h+1;I=N}}}
    else{while(--n>=0){var N2=it[n];if(I.t-N2.t>thr)break;if(D(N2.ex,N2.ey,I.x,I.y)<3){N2.h=I.h+1;I=N2}}}}
  it.forEach(function(q){q.r.sh=q.h})}
/* lazer (OsuHitObjectComposer.snapToVisibleBlueprints): the cursor snaps onto the position of any visible, unselected object when it is closer than 0.1 x OBJECT_RADIUS (64) = 6.4.
   The distance is measured to where the object is drawn, but the snapped position is its real (unstacked) one, so you can drag onto any item of a stack. */
var SNAP_R=6.4;
function nearSnap(x,y,exO,exC){var best=null,bd=SNAP_R,objs=st.map.objs,so=st.soff||0;
  function tryP(rx,ry,sh){var dx=rx+sh*so,dy=ry+sh*so,d=Math.hypot(dx-x,dy-y);if(d<bd){bd=d;best={x:rx,y:ry}}}
  for(var i=lb(objs,st.ph-GHOST-(st.map.maxDur||0));i<objs.length&&objs[i].time<=st.ph+st.pre;i++){var o=objs[i];if(!objVis(o)||(exO&&exO.indexOf(o)>=0))continue;
    tryP(o.x,o.y,o.sh||0);if(o.sl){var E=o.sl.path[o.sl.path.length-1];tryP(E.x,E.y,o.sh||0)}}
  st.live.forEach(function(c){if(c.del||(exC&&exC[c.b+':'+c.i])||!visC(c))return;tryP(c.x,c.y,c.sh||0)});
  return best}
function nearSnapO(od,dx,dy){var a=parseKey(od.key),o=st.map.objs[a.i],it=od.items.filter(function(q){return q.o===o})[0];if(!o||!it)return null;
  var sn=nearSnap(it.x+dx,it.y+dy,od.items.map(function(q){return q.o}),null);return sn?{x:sn.x-it.x,y:sn.y-it.y}:null}
function nearSnapC(d,dx,dy){var a=parseKey(d.key);if(a.o)return null;var it=d.items.filter(function(q){return q.B.id===a.b&&q.idx.indexOf(a.i)>=0})[0];if(!it)return null;
  var ex={};st.csel.forEach(function(k){ex[k]=1});var p=it.pos[a.i],sn=nearSnap(p.x+dx,p.y+dy,null,ex);return sn?{x:sn.x-p.x,y:sn.y-p.y}:null}
function distPath(path,m){var best=1e9,j;for(j=1;j<path.length;j++){var a=path[j-1],b=path[j],vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy||1,t=cl(((m.x-a.x)*vx+(m.y-a.y)*vy)/l2,0,1),d=Math.hypot(m.x-(a.x+vx*t),m.y-(a.y+vy*t));if(d<best)best=d}return best}
function objAt(m){var objs=st.map.objs,R0=st.radius,best=-1,bd=1e9,bsel=-1,bsd=1e9;
  for(var i=lb(objs,st.ph-GHOST-(st.map.maxDur||0));i<objs.length&&objs[i].time<=st.ph+st.pre;i++){var o=objs[i];if(st.ph>o.end+GHOST)continue;
    var so1=(o.sh||0)*(st.soff||0),mm={x:m.x-so1,y:m.y-so1},d=Math.hypot(o.x-mm.x,o.y-mm.y);if(d>R0){d=1e9;if(o.sl){var nd=distPath(o.sl.path,mm);if(nd<=R0*.8)d=R0+nd}}
    if(d<1e9&&d<bsd&&st.csel.indexOf('o:'+i)>=0){bsd=d;bsel=i}
    if(d<bd){bd=d;best=i}}
  return bsel>=0?bsel:best}
function objVis(o){return o.time-st.ph<=st.pre&&st.ph-o.end<=GHOST}
var SLTYPES=['linear','bezier','perfect','catmull'];
function slDistinct(pts){var n=0;pts.forEach(function(p,i){if(!i||p!==pts[i-1])n++});return n}
function slAuto(pts){if(pts.some(function(p,i){return i&&p===pts[i-1]}))return 'bezier';var n=slDistinct(pts);return n<=2?'linear':n===3?'perfect':'bezier'}
function slSnapLen(time,L0,slides){var tp=tpAt(time),vel=100*st.map.sm*svAt(time),step=tp.beat/(+$('snap').value),dur=L0/vel*tp.beat*slides,k=Math.max(1,Math.round(dur/step));return k*step/tp.beat*vel/slides}
function snapAng(a,q){var dx=q.x-a.x,dy=q.y-a.y,d=Math.hypot(dx,dy);if(d<2)return q;
  var tg=Math.round(Math.atan2(-dy,dx)*180/Math.PI),rad=tg*Math.PI/180,best=q,be=1e9,r;
  for(r=d-3;r<=d+3;r+=.25){var p={x:Math.round(a.x+r*Math.cos(rad)),y:Math.round(a.y-r*Math.sin(rad))},ang=Math.atan2(-(p.y-a.y),p.x-a.x)*180/Math.PI,er=Math.abs(((ang-tg+540)%360)-180)+Math.abs(Math.hypot(p.x-a.x,p.y-a.y)-d)*1e-3;if(er<be){be=er;best=p}}
  return best}
function degTxt(d){var q=Math.round(d/90),off=-(d-q*90),arr=['→','↑','←','↓'][((q%4)+4)%4],v=Math.round(off*10)/10;
  if(st.shift&&Math.abs(off-Math.round(off))<.3)v=Math.round(off);/* + = clockwise */
  return arr+' '+(v>0?'+':'')+(Number.isInteger(v)?v:v.toFixed(1))+'°'}
/* lazer: click + drag from the head draws the slider freehand; the stroke is fitted to a straight line, a perfect-curve arc or a smooth bezier */
function slBuild(withCursor){var S=st.slp,pts=S.pts.slice(),ty,mt=(st.slType&&st.slType!=='auto')?st.slType:null;
  if(withCursor&&st.lm){var last=pts[pts.length-1],q={x:Math.round(cl(st.lm.x,0,W)),y:Math.round(cl(st.lm.y,0,H))};
    if(st.shift&&(pts.length===1||mt==='linear'))q=snapAng(last,q);
    if(Math.hypot(q.x-last.x,q.y-last.y)>=9)pts.push(q)}
  ty=mt||slAuto(pts);
  if(slDistinct(pts)<2)return null;
  if(ty==='perfect'&&pts.length!==3)ty='bezier';
  var r0=slPath(ty,pts,0),L=slSnapLen(S.time,r0.len,1),r=slPath(ty,pts,L);
  return{pts:pts,type:ty,len:L,path:r.path,cum:r.cum}}
/* an object placed or moved onto the time of other objects replaces them (map objects and stream circles alike) */
function ovrObjs(list){var m=st.map,set={},keep=[],gone=0,ch=false;
  list.forEach(function(o){set[Math.round(o.time)]=1});
  var hit=function(t){t=Math.round(t);return !!(set[t]||set[t-1]||set[t+1])};
  m.objs.forEach(function(q){if(list.indexOf(q)>=0||!hit(q.time))keep.push(q);else gone++});
  if(gone)Array.prototype.splice.apply(m.objs,[0,m.objs.length].concat(keep));
  build();
  st.bodies.slice().forEach(function(O){
    O.circles.forEach(function(c){if(!c.del&&hit(c.time)){O.del[c.i]=1;delete O.ncf[c.i];ch=true}});
    if(!O.circles.some(function(c){return !c.del&&!O.del[c.i]}))dropBody(O)});
  if(ch){st.key='';build()}
  return gone>0||ch}
function reselObjs(refs){st.csel=st.csel.filter(function(k){if(k[0]==='o')return false;var c=circleOf(k);return !!c&&!c.del}).concat(refs.map(function(o){return 'o:'+st.map.objs.indexOf(o)}).filter(function(k){return k!=='o:-1'}))}
