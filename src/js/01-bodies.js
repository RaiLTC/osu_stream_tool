/* ---- bodies: every stream is its own body with its own anchors, timing and spacing ---- */
function fracs(n,bv,fc,rc){
  var out=[0],i,m=n-1,b=(bv<0?-1:1)*6*Math.pow(Math.abs(bv)/100,3);
  if(Math.abs(b)<1e-9||m<2){for(i=1;i<n;i++)out.push(i/(n-1));return out}
  var w=[],sum=0,t,f,mode=st.sm||'E';
  function ss(x){x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)}
  var k=1+(Math.abs(fc||0)/100)*Math.max(0,m-2)*(1-(rc||0)/100);
  for(i=0;i<m;i++){t=m>1?i/(m-1):0;
    if(mode==='B'){var e=Math.abs(fc||0)/100,pp=Math.exp(e*Math.log(6));f=(fc||0)>=0?Math.pow(t,pp):1-Math.pow(1-t,pp)}
    else if(mode==='E'){var e2=Math.abs(fc||0)/100,pp2=Math.exp(e2*Math.log(6)),sg=function(x){return 1/(1+Math.exp(-x))},cc=(fc||0)>=0?.5+.35*e2:.5-.35*e2,kk=7,s0=sg(-cc*kk),s1=sg((1-cc)*kk);f=(sg((t-cc)*kk)-s0)/(s1-s0)}
    else if(mode==='F'){var e3=Math.abs(fc||0)/100,pp3=Math.exp(e3*Math.log(6)),u=(fc||0)>=0?t:1-t,g3=.5*Math.pow(u,pp3)+.5*(1-Math.pow(1-u,1/pp3));f=(fc||0)>=0?g3:1-(.5*Math.pow(1-t,pp3)+.5*(1-Math.pow(t,1/pp3)))}
    else if(mode==='C'){var c=((fc||0)+100)/200,wd=.05+.95*(rc||0)/100;f=ss((t-(c-wd/2))/wd)}
    else if(mode==='D'){var N=Math.max(1,Math.round(1+Math.abs(fc||0)/100*(m-1)));f=(fc||0)>=0?ss((t*(m-1)-(m-1-N))/N):1-ss(t*(m-1)/N)}
    else f=(fc||0)<0?Math.min(1,t*k):Math.max(0,1-(1-t)*k);
    w.push(Math.exp(b*f));sum+=w[i]}
  var acc=0,mx=0;for(i=0;i<m;i++){acc+=w[i];out.push(acc/sum);if(w[i]>mx)mx=w[i]}out[n-1]=1;
  var sMax=sum/(mx*m),sc=sMax+(1-sMax)*Math.max(0,Math.min(1,st.pv||0));for(i=1;i<n;i++)out[i]*=sc
  return out}
function bk(u,bv){var b=(bv<0?-1:1)*6*Math.pow(Math.abs(bv)/100,3);return Math.abs(b)<1e-6?u:(Math.exp(b*u)-1)/(Math.exp(b)-1)}
function newBody(o){return{id:st.nid++,pos:o.pos||[],psig:null,pts:o.pts||[],start:o.start||0,count:o.count||16,snap:o.snap||4,bias:o.bias||0,nc:o.nc||0,lin:!!o.lin,ds:o.ds||1,ticks:o.ticks||null,del:{},ncf:o.ncf||{},circles:[],path:[],len:0,step:0,bpm:0}}
function bodyById(id){for(var i=0;i<st.bodies.length;i++)if(st.bodies[i].id===id)return st.bodies[i];return null}
function AB(){return st.ab==null?null:bodyById(st.ab)}
function parseKey(k){var p=String(k).split(':');return p[0]==='o'?{o:true,i:+p[1]}:{b:+p[0],i:+p[1]}}
function tickOf(B,i){var t=B.ticks;if(!t)return i;return i<t.length?t[i]:t[t.length-1]+(i-t.length+1)}
function setStart(t){$('start').value=fmt(t)}
function syncPanel(){var B=AB();if(!B)return;setStart(B.start);$('count').value=B.count;$('bias').value=B.bias;$('bfoc').value=0;$('brch').value=0;$('biasStep').value=0;$('stepSl').value=0;$('stepHint').textContent='Off';$('nc').value=B.nc;$('bsnap').value=B.snap}
function snapIx(B,ix){var q=B.pts[ix];return ix===0||ix===B.pts.length-1||(q&&q.pin!=null)}
function segBounds(B,sel){
  if(!sel.length)return null;var np=B.pts.length,mn=Math.min.apply(0,sel),mx=Math.max.apply(0,sel),lo=mn,hi=mx,i;
  if(mn===mx&&snapIx(B,mn)){hi=-1;for(i=mn+1;i<np;i++)if(snapIx(B,i)){hi=i;break}}
  else{if(!snapIx(B,lo)){for(i=mn-1;i>=0;i--)if(snapIx(B,i)){lo=i;break}}
       if(!snapIx(B,hi)){hi=-1;for(i=mx+1;i<np;i++)if(snapIx(B,i)){hi=i;break}}}
  return(hi>lo&&lo>=0)?{lo:lo,hi:hi}:null}
function curRch(B){return st.sp&&st.sp.B===B&&st.sp.sg===st.csel.join(',')+'|'+B.id?st.sp.r:0}
function curFoc(B){return st.sp&&st.sp.B===B&&st.sp.sg===st.csel.join(',')+'|'+B.id?st.sp.f:0}
function curBias(B){return st.sp&&st.sp.B===B&&st.sp.sg===st.csel.join(',')+'|'+B.id?st.sp.v:0}
function applyPanel(e){var B=AB();if(!B)return;var id=e&&e.target&&e.target.id;
  if(id==='count')setRunCount(+$('count').value);
  else if(id==='bias'||id==='bfoc'||id==='brch')applyBias(+$('bias').value,+$('bfoc').value,+$('brch').value);
  else if(id==='nc')B.nc=Math.max(0,Math.round(+$('nc').value)||0);
  else if(id==='bsnap')B.snap=+$('bsnap').value||4;
  st.key='';draw()}
function dropBody(B){st.bodies=st.bodies.filter(function(b){return b!==B});if(st.ab===B.id)st.ab=null;st.csel=st.csel.filter(function(k){return parseKey(k).b!==B.id});st.key=''}
function buildBody(B){
  var n=cl(Math.round(B.count)||1,1,500),tp=tpAt(B.start),step=tp.beat/B.snap,pw=Math.pow(2,B.bias/40),P=[],i,j=1;
  B.step=step;B.bpm=60000/tp.beat;B.path=pathOf(B.pts);B.len=0;B.circles=[];
  var path=B.path,cum=[0];
  for(i=1;i<path.length;i++)cum.push(cum[i-1]+Math.hypot(path[i].x-path[i-1].x,path[i].y-path[i-1].y));
  B.cum=cum;
  var L=cum[cum.length-1]||0;B.len=L;
  var dsv=0;if(B.lin&&st.map){dsv=strD(B.start,B.snap)*(B.ds||1);n=cl(Math.floor(L/dsv+1e-6)+1,1,500);B.count=n}
  if(n===1){if(B.pts.length)P.push({x:B.pts[0].x,y:B.pts[0].y})}
  else if(path.length>=2&&L>0){
    var anc=[{k:0,d:0,ix:0}],np=B.pts.length;
    B.pts.forEach(function(q,ix){
      if(q.pin==null||ix===0||ix===np-1||n<3)return;
      var k=cl(q.pin,1,n-2),bi=0,bd=1e18;
      for(var m=0;m<path.length;m++){var dd=(path[m].x-q.x)*(path[m].x-q.x)+(path[m].y-q.y)*(path[m].y-q.y);if(dd<bd){bd=dd;bi=m}}
      anc.push({k:k,d:cum[bi],ix:ix})});
    anc.push({k:n-1,d:L,ix:np-1});
    var good=[anc[0]];
    for(i=1;i<anc.length;i++){var last=good[good.length-1],a=anc[i];if(a.k>last.k&&(a.d>last.d||i===anc.length-1))good.push(a)}
    if(B.bias&&good.length>2)good=[good[0],good[good.length-1]];
    var s=0;
    for(i=0;i<n;i++){
      while(s<good.length-2&&i>good[s+1].k)s++;
      var A0=good[s],A1=good[s+1],u=cl((i-A0.k)/(A1.k-A0.k),0,1),sbv=null,fu=bk(u,B.bias),d=A0.d+(A1.d-A0.d)*fu;if(dsv)d=Math.min(L,i*dsv);
      while(j<cum.length-1&&cum[j]<d)j++;
      var seg=cum[j]-cum[j-1]||1,f=cl((d-cum[j-1])/seg,0,1);
      P.push({x:path[j-1].x+(path[j].x-path[j-1].x)*f,y:path[j-1].y+(path[j].y-path[j-1].y)*f,d:d})}
  }
  if(!dsv&&!B.bias)B.pts.forEach(function(q,ix){if(q.pin!=null&&ix>0&&ix<B.pts.length-1&&n>=3){var kk=cl(q.pin,1,n-2);if(P[kk]){P[kk].x=q.x;P[kk].y=q.y}}});
  mkCircles(B,P,step)
}
function mkCircles(B,P,step){
  var num=0,pend=false,i;B.circles=[];
  for(i=0;i<P.length;i++){
    var base=i===0||(B.nc>0&&i%B.nc===0),dl=!!B.del[i],isnc=false,force=B.ncf[i];
    if(dl){if(base)pend=true}else{isnc=force!==undefined?force:(base||pend);pend=false;num=isnc?1:num+1}
    B.circles.push({x:P[i].x,y:P[i].y,time:Math.round(B.start+tickOf(B,i)*step),nc:isnc,num:num,del:dl,b:B.id,i:i,d:P[i].d||0})}
}
/* circle positions (B.pos) are the truth; anchors (B.pts) only exist while a stream is selected */
function sigOf(B){return JSON.stringify([B.pts,B.count,B.bias,B.lin,B.snap,B.ds])}
function buildFromPos(B){
  var n=cl(Math.round(B.count)||1,1,500),tp=tpAt(B.start),step=tp.beat/B.snap,P=B.pos||[],i;
  B.step=step;B.bpm=60000/tp.beat;
  while(P.length<n){var l=P[P.length-1]||{x:W/2,y:H/2},l2=P.length>1?P[P.length-2]:null,dx=l2?l.x-l2.x:35,dy=l2?l.y-l2.y:0;P.push({x:cl(l.x+dx,0,W),y:cl(l.y+dy,0,H)})}
  P.length=n;B.pos=P;B.count=n;
  var cum=[0],path=[];
  for(i=0;i<n;i++){path.push({x:P[i].x,y:P[i].y});if(i)cum.push(cum[i-1]+Math.hypot(P[i].x-P[i-1].x,P[i].y-P[i-1].y))}
  B.path=path;B.cum=cum;B.len=cum[n-1]||0;
  mkCircles(B,P.map(function(q,k){return{x:q.x,y:q.y,d:cum[k]}}),step)}
function editing(B){
  if(!B)return false;if(st.drag&&st.drag.b===B)return true;
  var live=0,pf=B.id+':',sel=0,i;B.circles.forEach(function(c){if(!c.del)live++});
  for(i=0;i<st.csel.length;i++)if(st.csel[i].indexOf(pf)===0)sel++;
  if(st.fx&&st.fx.b===B.id){
    var fl=0,fs=0,bad=false,rv=!!st.fx.rev,inF=function(i){return rv?i<st.fx.c:i>=st.fx.c};B.circles.forEach(function(c){if(!c.del&&inF(c.i))fl++});
    st.csel.forEach(function(k){if(k.indexOf(pf)===0){if(inF(+k.slice(pf.length)))fs++;else bad=true}});
    if(!bad&&fl>0&&fs>=fl)return true;st.fx=null}
  return live>0&&sel>=live}
function fxLo(B){return st.fx&&st.fx.b===B.id&&!st.fx.rev?st.fx.a:0}
function fxHi(B){return st.fx&&st.fx.b===B.id&&st.fx.rev?st.fx.a:1e9}
function focusTail(B){if(!B||!st.fx||st.fx.b!==B.id)return false;build();var pf=B.id+':';st.csel=st.csel.filter(function(k){return k.indexOf(pf)!==0});B.circles.forEach(function(c){if(!c.del&&(st.fx.rev?c.i<st.fx.c:c.i>=st.fx.c))st.csel.push(pf+c.i)});return true}
function reselectBody(B){if(!B)return;build();var pf=B.id+':';st.csel=st.csel.filter(function(k){return k.indexOf(pf)!==0});B.circles.forEach(function(c){if(!c.del)st.csel.push(B.id+':'+c.i)})}
function actBody(B){if(B.id===st.ab)return true;var a=st.csel,pf=B.id+':';for(var i=0;i<a.length;i++)if(a[i].indexOf(pf)===0)return true;return false}
function ensurePts(B){if(B.pts&&B.pts.length)return;if(!B.pos||!B.pos.length)return;fitPoints(B,B.pos);B.psig=sigOf(B)}
function linSnap(B){
  if(B.lin&&B.pts.length>=2&&B.circles.length>=2){var np=B.pts.length,k0=np-2;while(k0>0&&!B.pts[k0].type)k0--;
    var lc=B.circles[B.circles.length-1],q=B.pts[np-1];
    if(B.pts[k0].type==='linear'&&Math.hypot(q.x-lc.x,q.y-lc.y)>.5){q.x=lc.x;q.y=lc.y;buildBody(B)}}}
function syncBody(B){B.pts=[];B.psig=null;buildFromPos(B)}
function bkey(){return st.mapId+'|'+st.ab+'|'+st.csel.length+'|'+st.bodies.map(function(B){var h=B.pts&&B.pts.length;return JSON.stringify([B.pts,h?0:B.pos,B.psig,B.start,B.count,B.snap,B.bias,B.nc,B.ticks,B.del,B.ncf,B.lin,B.ds,actBody(B)])}).join('#')}
function build(){
  var key=bkey();
  if(key===st.key)return;
  st.all=[];
  st.bodies.forEach(function(B){syncBody(B);B.circles.forEach(function(c){st.all.push(c)})});
  st.live=st.all.filter(function(c){return !c.del}).sort(function(a,b){return a.time-b.time||a.b-b.b||a.i-b.i});
  st.key=bkey();if(st.map)renumber();
}
/* turn circle positions back into anchors (used when circles are split off a body) */
function rdp(P,tol){
  var keep=[0,P.length-1];
  (function rec(a,b){
    if(b<=a+1)return;
    var A=P[a],Bp=P[b],dx=Bp.x-A.x,dy=Bp.y-A.y,len=Math.hypot(dx,dy)||1,md=-1,mi=-1;
    for(var i=a+1;i<b;i++){var d=Math.abs((P[i].x-A.x)*dy-(P[i].y-A.y)*dx)/len;if(d>md){md=d;mi=i}}
    if(md>tol){keep.push(mi);rec(a,mi);rec(mi,b)}
  })(0,P.length-1);
  return keep.sort(function(a,b){return a-b})}
function fitRuns(pos,sh,thr){sh=sh||0;thr=thr||.1;
  var n=pos.length;
  function dseg(p,a,b){var vx=b.x-a.x,vy=b.y-a.y,l=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,((p.x-a.x)*vx+(p.y-a.y)*vy)/l));return Math.hypot(p.x-(a.x+vx*t),p.y-(a.y+vy*t))}
  function lineOK(a,b){for(var k=a+1;k<b;k++)if(dseg(pos[k],pos[a],pos[b])>.7)return false;return true}
  function arcOK(a,b){var m=Math.round((a+b)/2),O=circP(pos[a],pos[m],pos[b]);if(!O||O.r>3000)return false;
    for(var k=a;k<=b;k++)if(Math.abs(Math.hypot(pos[k].x-O.x,pos[k].y-O.y)-O.r)>1)return false;return true}
  var gp=[],g;for(g=0;g<n-1;g++)gp.push(Math.hypot(pos[g+1].x-pos[g].x,pos[g+1].y-pos[g].y));
  var brk={};for(g=1;g<gp.length;g++)if(Math.abs(gp[g]-gp[g-1])/Math.max(gp[g],gp[g-1],1)>thr)brk[g]=1;
  var runs=[],i=0,j,ja,jl;
  while(i<n-1){
    jl=i+1;while(jl+1<n&&!brk[jl]&&lineOK(i,jl+1))jl++;
    ja=i+1;for(j=i+2;j<n;j++){if(arcOK(i,j))ja=j;else break;if(brk[j])break}
    runs.push(ja>jl&&ja>=i+2?{a:i,b:ja,arc:true}:{a:i,b:jl,arc:false});
    i=runs[runs.length-1].b}
  var pts=[];
  runs.forEach(function(rn){
    var o={x:pos[rn.a].x,y:pos[rn.a].y,type:rn.arc?'perfect':'linear'};if(rn.a>0)o.pin=rn.a;pts.push(o);
    if(rn.arc){var m=Math.max(rn.a+1,Math.min(rn.b-1,Math.round((rn.a+rn.b)/2)+sh));pts.push({x:pos[m].x,y:pos[m].y,pin:m})}});
  pts.push({x:pos[n-1].x,y:pos[n-1].y});
  return pts}
function gapBreaks(pos){
  var n=pos.length,g=[],out=[],i;for(i=0;i<n-1;i++)g.push(Math.hypot(pos[i+1].x-pos[i].x,pos[i+1].y-pos[i].y));
  for(i=1;i<g.length;i++){var m=Math.max(g[i],g[i-1],1);if(Math.abs(g[i]-g[i-1])/m>.1)out.push(i)}
  return out}
function uni(a,b){var m={};a.concat(b).forEach(function(v){m[v]=1});return Object.keys(m).map(Number).sort(function(x,y){return x-y})}
function fitPoints(B,pos){
  var n=pos.length,j,c,br=gapBreaks(pos);
  if(n===1){B.pts=[{x:pos[0].x,y:pos[0].y,type:'bezier'}];B.bias=0;return}
  var cands=[[.6,'linear'],[0,'runs',0],[0,'runs',-1],[0,'runs',1],[0,'runs',-2],[0,'runs',2],[0,'runs',0,.03],[0,'runs',-1,.03],[0,'runs',1,.03],[0,'perfect'],[4,'catmull'],[2,'catmull'],[.6,'pinned']];
  var tols=[1.2,2.6],ti;
  for(ti=0;ti<2;ti++)for(c=0;c<cands.length;c++){
    var ty=cands[c][1],pin=ty==='pinned',pts;
    if(ty==='runs'){pts=n>=4?fitRuns(pos,cands[c][2],cands[c][3]):null;if(!pts)continue}
    else{var ix=ty==='perfect'?(n>=3?[0,Math.round((n-1)/2),n-1]:[0,n-1]):(ty==='linear'?rdp(pos,cands[c][0]):uni(rdp(pos,cands[c][0]),br));
      pts=ix.map(function(k,q){var o={x:pos[k].x,y:pos[k].y};if(q===0)o.type=pin?'linear':ty;else if(q<ix.length-1&&n>=3)o.pin=k;return o})}
    if(pts.length<2||(ty==='linear'&&pts.length>2))continue;
    var tmp={id:-1,pts:pts,start:B.start,count:n,snap:B.snap,bias:0,nc:0,ticks:null,del:{},ncf:{},circles:[]};
    buildBody(tmp);
    var ok=tmp.circles.length===n;
    for(j=0;ok&&j<n;j++)if(Math.hypot(tmp.circles[j].x-pos[j].x,tmp.circles[j].y-pos[j].y)>tols[ti])ok=false;
    if(ok){B.pts=pts;B.bias=0;return}
  }
  B.pts=pos.map(function(p,k){var o={x:p.x,y:p.y};if(k===0)o.type='linear';else if(k<n-1)o.pin=k;return o});B.bias=0}
function detach(B,idx){
  var cs=idx.map(function(i){return B.circles[i]}),n=cs.length,t0=tickOf(B,idx[0]);
  var ticks=idx.map(function(i){return tickOf(B,i)-t0}),consec=ticks.every(function(t,j){return t===j});
  var NB=newBody({start:cs[0].time,count:n,snap:B.snap,ticks:consec?null:ticks});
  cs.forEach(function(c,j){NB.ncf[j]=c.nc});
  NB.pos=cs.map(function(c){return{x:c.x,y:c.y}});NB.pts=[];
  var gone={};idx.forEach(function(i){gone[i]=1});
  var rem=B.circles.filter(function(c){return !c.del&&!gone[c.i]}),first=-1,last=-1;
  B.circles.forEach(function(c){if(!c.del){if(first<0)first=c.i;last=c.i}});
  var touch=!!(gone[first]||gone[last]||B.pts.some(function(q,ix){return q.pin!=null&&ix>0&&ix<B.pts.length-1&&gone[cl(q.pin,1,Math.max(1,B.count-2))]}));
  if(!rem.length)dropBody(B);
  else if(touch){
    var r0=tickOf(B,rem[0].i),rt=rem.map(function(c){return tickOf(B,c.i)-r0}),rc=rt.every(function(t,j){return t===j}),nf={};
    rem.forEach(function(c,j){nf[j]=c.nc});
    B.start=rem[0].time;B.count=rem.length;B.ticks=rc?null:rt;B.del={};B.ncf=nf;B.nc=0;B.pb=null;
    B.pos=rem.map(function(c){return{x:c.x,y:c.y}});B.pts=[];B.psig=null;
  }else idx.forEach(function(i){B.del[i]=1;delete B.ncf[i]});
  st.bodies.push(NB);return NB}
/* selected circles: whole bodies stay as they are, partial selections become their own body */
function splitSelection(){
  var by={},out=[],sel=[];
  st.csel.forEach(function(k){var a=parseKey(k);if(a.o)return;(by[a.b]=by[a.b]||[]).push(a.i)});
  Object.keys(by).forEach(function(id){
    var B=bodyById(+id);if(!B)return;
    var idx=by[id].filter(function(i,p,arr){return arr.indexOf(i)===p&&B.circles[i]&&!B.circles[i].del}).sort(function(a,b){return a-b});
    if(!idx.length)return;
    var live=B.circles.filter(function(c){return !c.del}).length;
    if(idx.length>=live){out.push(B);idx.forEach(function(i){sel.push(B.id+':'+i)});return}
    var NB=detach(B,idx);out.push(NB);for(var j=0;j<NB.count;j++)sel.push(NB.id+':'+j)});
  st.csel=sel;if(out.length)st.ab=out[out.length-1].id;st.sel=[];st.key='';syncPanel();return out}
function delCircles(){
  var by={},any=false;
  st.csel.forEach(function(k){var a=parseKey(k);if(a.o)return;(by[a.b]=by[a.b]||[]).push(a.i)});
  Object.keys(by).forEach(function(id){
    var B=bodyById(+id);if(!B)return;
    by[id].forEach(function(i){if(B.circles[i]&&!B.circles[i].del){B.del[i]=1;delete B.ncf[i];any=true}});
    if(!B.circles.some(function(c){return !c.del&&!B.del[c.i]}))dropBody(B)});
  var os=[];st.csel.forEach(function(k){var a=parseKey(k);if(a.o)os.push(a.i)});
  if(os.length){os.sort(function(a,b){return b-a});os.forEach(function(i){if(st.map.objs[i]){st.map.objs.splice(i,1);any=true}});objsChanged()}
  st.csel=[];st.key='';return any}
function toggleNC(){
  var cs=[];st.csel.forEach(function(k){var a=parseKey(k);if(a.o)return;var B=bodyById(a.b);if(B&&B.circles[a.i]&&!B.circles[a.i].del)cs.push([B,a.i])});
  var os=[];st.csel.forEach(function(k){var a=parseKey(k);if(a.o&&st.map.objs[a.i])os.push(st.map.objs[a.i])});
  if(!cs.length&&!os.length)return;
  if(cs.length){var all=cs.every(function(p){return p[0].circles[p[1]].nc});cs.forEach(function(p){p[0].ncf[p[1]]=!all})}
  if(os.length){var all2=os.every(function(o){return o.nc});os.forEach(function(o){o.nc=!all2;o.mod=true});renumber()}
  checkpoint();draw()}
