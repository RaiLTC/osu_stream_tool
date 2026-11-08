/* ---- skins (default = osu!lazer legacy sprites; imported .osk overrides per sprite) ---- */
var LAZER_COLS=['#f17400','#00f135','#0052f1','#f10000','#e8eb00','#5c00f1'],SKID=0,TINTC={},OFS=null;
var SKINS={};
function skImg(src,d){var im=new Image();im.__d=d||2;im.onload=function(){draw()};im.src=src;return im}
var LEGI={};Object.keys(LEG).forEach(function(k){LEGI[k]=skImg(LEG[k],2)});
var SK={name:'default',img:LEGI,cols:null,overlap:-2,sliderBorder:null,sliderTrack:null};SKINS['default']=SK;
function skOK(im){return !!(im&&im.complete&&im.naturalWidth>0)}
function tint(im,c){var k=(im.__id||(im.__id=++SKID))+c,t=TINTC[k];if(t)return t;
  t=document.createElement('canvas');t.width=im.naturalWidth;t.height=im.naturalHeight;var g=t.getContext('2d');g.drawImage(im,0,0);
  g.globalCompositeOperation='multiply';g.fillStyle=c;g.fillRect(0,0,t.width,t.height);g.globalCompositeOperation='destination-in';g.drawImage(im,0,0);TINTC[k]=t;return t}
function sprF(im,R){return 2*R/128/(im.__d||2)}
function putSpr(im,cx,cy,f,al,rot){if(!skOK(im))return false;var w=im.naturalWidth,h=im.naturalHeight;ctx.globalAlpha=al;
  if(rot){ctx.save();ctx.translate(cx,cy);ctx.rotate(rot);ctx.drawImage(im,-w*f/2,-h*f/2,w*f,h*f);ctx.restore()}else ctx.drawImage(im,cx-w*f/2,cy-h*f/2,w*f,h*f);return true}
function skCols(){var m=st.map;return(m&&m.colors&&m.colors.length)?m.colors:((SK.cols&&SK.cols.length)?SK.cols:LAZER_COLS)}
function comboI(i){var a=skCols();return a[(i||0)%a.length]}
function skBody(x,y,R,cc,sa,past,gh){var cx=X(x),cy=Y(y),hc=SK.img.hc;
  if(skOK(hc)){var t=tint(hc,past?'#a9a9b8':cc),f=sprF(hc,R);ctx.globalAlpha=sa;ctx.drawImage(t,cx-t.width*f/2,cy-t.height*f/2,t.width*f,t.height*f);
    putSpr(SK.img.ov,cx,cy,f,sa);
    if(gh){ctx.globalAlpha=sa;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.lineWidth=3.5;ctx.strokeStyle='#e8485a';ctx.stroke()}return}
  ctx.globalAlpha=sa;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);
  if(past)ctx.fillStyle='#e6e6ec';else{var gr=ctx.createRadialGradient(cx,cy-R*.25,R*.1,cx,cy,R);gr.addColorStop(0,shade(cc,1.22));gr.addColorStop(.7,cc);gr.addColorStop(1,shade(cc,.8));ctx.fillStyle=gr}
  ctx.fill();ctx.lineWidth=3.5;ctx.strokeStyle=gh?'#e8485a':(past?'#b4b4c2':'#fff');ctx.stroke()}
function skNum(x,y,R,num,sa,past){var cx=X(x),cy=Y(y),ds=String(num).split(''),ims=ds.map(function(d){return SK.img['n'+d]});
  if(ims.every(skOK)){var u=2*R/128,fs=ims.map(function(im){return sprF(im,R)*.8}),adv=ims.map(function(im,i){return im.naturalWidth*fs[i]-SK.overlap*u*.8}),tot=adv.reduce(function(a,b){return a+b},0)+SK.overlap*u*.8,px=cx-tot/2;
    ims.forEach(function(im,i){var t=past?tint(im,'#5e5e70'):im,w=im.naturalWidth*fs[i],h=im.naturalHeight*fs[i];ctx.globalAlpha=sa;ctx.drawImage(t,px,cy-h/2,w,h);px+=adv[i]});return}
  ctx.globalAlpha=sa;ctx.font='600 '+Math.max(10,R*.6)+'px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  if(!past){ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineJoin='round';ctx.strokeText(String(num),cx,cy+1)}
  ctx.fillStyle=past?'#5e5e70':'#fff';ctx.fillText(String(num),cx,cy+1)}
function skApproach(x,y,R,k,cc,al){var ap=SK.img.ap;if(skOK(ap)){var t=tint(ap,cc),f=sprF(ap,R)*k;ctx.globalAlpha=al;ctx.drawImage(t,X(x)-t.width*f/2,Y(y)-t.height*f/2,t.width*f,t.height*f);return}
  ring(x,y,R*k,cc,4.5,al)}
function skSlider(path,R,sa,cc){if(path.length<2)return;
  if(!OFS)OFS=document.createElement('canvas');if(OFS.width!==cv.width||OFS.height!==cv.height){OFS.width=cv.width;OFS.height=cv.height}
  var g=OFS.getContext('2d');g.clearRect(0,0,OFS.width,OFS.height);g.lineCap='round';g.lineJoin='round';
  var ps=[[1.72,SK.sliderBorder||cc],[1.38,SK.sliderTrack||shade(cc,.2)]];/* lazer Argon: path radius 55/64 of the circle, border = combo colour, body = combo darkened */
  ps.forEach(function(q){g.beginPath();path.forEach(function(pt,i){i?g.lineTo(X(pt.x),Y(pt.y)):g.moveTo(X(pt.x),Y(pt.y))});g.lineWidth=R*q[0];g.strokeStyle=q[1];g.stroke()});
  ctx.globalAlpha=sa;ctx.drawImage(OFS,0,0)}
function skRev(o,R,cc,sa){var sl=o.sl,P=sl.path,e=P[P.length-1],q=P[Math.max(0,P.length-4)],a=Math.atan2(q.y-e.y,q.x-e.x);
  skBody(e.x,e.y,R,cc,sa,false,false);var ra=SK.img.ra;if(!putSpr(ra,X(e.x),Y(e.y),sprF(ra,R)*.7,sa,a)){ctx.globalAlpha=sa;ctx.fillStyle='#fff';ctx.font='700 '+R+'px system-ui';ctx.fillText('>',X(e.x),Y(e.y))}}
function skBall(o,R,cc){var pp=(st.ph-o.time)/o.dur*o.sl.slides,pass=Math.floor(pp),ff=pp-pass;if(pass%2)ff=1-ff;var bp=sliderPos(o.sl,ff*o.sl.len),f=sprF(SK.img.fc||{},R);
  if(skOK(SK.img.fc)){putSpr(SK.img.fc,X(bp.x),Y(bp.y),sprF(SK.img.fc,R),.55)}else ring(bp.x,bp.y,R*1.8,'#fff',2,.6);
  if(!putSpr(SK.img.sb,X(bp.x),Y(bp.y),sprF(SK.img.sb,R),1))ring(bp.x,bp.y,R*.5,cc,3,.9)}
function skNeed(){return 0}
function parseIni(t){var sec='',o={};t.split(/\r?\n/).forEach(function(l){l=l.replace(/\/\/.*$/,'').trim();var h=l.match(/^\[(.+)\]$/);if(h){sec=h[1];return}var kv=l.match(/^([\w\-]+)\s*:\s*(.*)$/);if(kv)o[sec+'/'+kv[1].toLowerCase()]=kv[2].trim()});return o}
function rgbHex(v){var a=String(v).split(',').map(function(n){return cl(Math.round(+n),0,255)});if(a.length<3||a.some(isNaN))return null;return '#'+a.slice(0,3).map(function(n){return(n<16?'0':'')+n.toString(16)}).join('')}
function loadSkin(f){
  if(!window.JSZip){toast('Skin reader unavailable');return}
  JSZip.loadAsync(f).then(function(zip){
    var names={};Object.keys(zip.files).forEach(function(n){if(!zip.files[n].dir)names[n.toLowerCase().replace(/^.*\//,'')]=zip.files[n]});
    var ini=names['skin.ini']?names['skin.ini'].async('string'):Promise.resolve('');
    return ini.then(function(txt){
      var c=parseIni(txt),sk={name:f.name.replace(/\.(osk|zip)$/i,''),img:Object.assign({},LEGI),cols:[],overlap:c['Fonts/hitcircleoverlap']!=null?+c['Fonts/hitcircleoverlap']:-2,sliderBorder:null,sliderTrack:null},pre=(c['Fonts/hitcircleprefix']||'default').toLowerCase().replace(/^.*[\\\/]/,''),jobs=[];
      for(var i=1;i<=8;i++){var h=c['Colours/combo'+i];if(h){var x=rgbHex(h);if(x)sk.cols.push(x)}}
      if(!sk.cols.length)sk.cols=null;
      if(c['Colours/sliderborder'])sk.sliderBorder=rgbHex(c['Colours/sliderborder']);
      if(c['Colours/slidertrackoverride'])sk.sliderTrack=rgbHex(c['Colours/slidertrackoverride']);
      function pick(key,base){var e2=names[base+'@2x.png'],e1=names[base+'.png'],e=e2||e1;if(!e)return;
        jobs.push(e.async('blob').then(function(b){return new Promise(function(res){var im=new Image();im.__d=e2?2:1;im.onload=function(){sk.img[key]=im;res()};im.onerror=function(){res()};im.src=URL.createObjectURL(b)})}))}
      var fpN=[],fk;for(fk=0;names['followpoint-'+fk+'.png']||names['followpoint-'+fk+'@2x.png'];fk++)fpN.push('followpoint-'+fk);
      if(!fpN.length&&(names['followpoint.png']||names['followpoint@2x.png']))fpN.push('followpoint');
      if(fpN.length){sk.fp=[];sk.fpRate=+c['General/animationframerate']||0;fpN.forEach(function(b,k){var e2=names[b+'@2x.png'],e=e2||names[b+'.png'];
        jobs.push(e.async('blob').then(function(bl){return new Promise(function(res){var im=new Image();im.__d=e2?2:1;im.onload=function(){sk.fp[k]=im;res()};im.onerror=function(){res()};im.src=URL.createObjectURL(bl)})}))})}
      pick('hc','hitcircle');pick('ov','hitcircleoverlay');pick('ap','approachcircle');pick('sb','sliderb0');pick('fc','sliderfollowcircle');pick('ra','reversearrow');
      for(var d=0;d<10;d++)pick('n'+d,pre+'-'+d);
      return Promise.all(jobs).then(function(){
        var o=document.createElement('option');o.value='skin:'+sk.name;o.textContent=sk.name;$('skinSel').appendChild(o);SKINS[o.value]=sk;$('skinSel').value=o.value;applySkin(o.value);toast('Skin: '+sk.name)})})
  }).catch(function(){toast('Could not read that skin')})}
/* ---- follow points, ported from lazer (FollowPointConnection / FollowPointRenderer): between each object's end and the next object (same combo),
   a point every 32 px starting 48 px out; each fades in over 400 ms sliding in from 10 % behind, and fades out when the hit object reaches that point ---- */
function fpDraw(px,py,rot,sc,al,tOff){
  ctx.save();ctx.translate(X(px),Y(py));ctx.rotate(rot);ctx.globalAlpha=al;
  var fr=SK.fp;
  if(fr&&fr.length){var n=fr.length,fl=SK.fpRate>0?1000/SK.fpRate:1000/n,im=fr[n>1?Math.floor(Math.max(0,tOff)/fl)%n:0];
    if(skOK(im)){var f=sc*S/(im.__d||1);ctx.drawImage(im,-im.naturalWidth*f/2,-im.naturalHeight*f/2,im.naturalWidth*f,im.naturalHeight*f);ctx.restore();return}}
  /* default (lazer Argon): two chevrons, additive, pink to red */
  var u=sc*S,g=ctx.createLinearGradient(0,-4*u,0,4*u);g.addColorStop(0,'#FC618F');g.addColorStop(1,'#BB1A41');
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle=g;ctx.lineWidth=1.7*u;ctx.lineCap='round';ctx.lineJoin='round';
  [[-2,.25],[2,1]].forEach(function(c){ctx.globalAlpha=al*c[1];ctx.beginPath();ctx.moveTo((c[0]-1.5)*u,-3*u);ctx.lineTo((c[0]+1.5)*u,0);ctx.lineTo((c[0]-1.5)*u,3*u);ctx.stroke()});
  ctx.restore()}
function drawFollowPoints(){
  if(!$('fpOn').checked)return;
  var t=st.ph,objs=st.map.objs,L=st.live,items=[],lo=t-5000-(st.map.maxDur||0),hi=t+3000,i,so=st.soff||0;
  for(i=0;i<L.length;i++){var c=L[i];if(c.time>=lo&&c.time<=hi){var cs=(c.sh||0)*so;items.push({t:c.time,te:c.time,x:c.x+cs,y:c.y+cs,ex:c.x+cs,ey:c.y+cs,nc:c.nc})}}
  objs.forEach(function(o){if(o.time<lo||o.time>hi)return;var s0=(o.sh||0)*so,ex=o.x,ey=o.y;
    if(o.sl&&(o.sl.slides||1)%2===1){var P=o.sl.path,e=P[P.length-1];ex=e.x;ey=e.y}
    items.push({t:o.time,te:o.end,x:o.x+s0,y:o.y+s0,ex:ex+s0,ey:ey+s0,nc:o.nc})});
  items.sort(function(a,b){return a.t-b.t});
  var Sc=st.radius/64,pre=800*Math.min(1,st.pre/450),k,d;
  for(k=0;k+1<items.length;k++){var s=items[k],e=items[k+1];if(e.nc)continue;
    var dx=e.x-s.ex,dy=e.y-s.ey,dist=Math.floor(Math.hypot(dx,dy)),rot=Math.atan2(dy,dx),dur=e.t-s.te;
    for(d=48;d<dist-32;d+=32){var fr=d/dist,fo=s.te+fr*dur,fi=fo-pre;if(t<fi||t>fo+400)continue;
      var tin=cl((t-fi)/400,0,1),ez=1-(1-tin)*(1-tin),al=t>fo?1-cl((t-fo)/400,0,1):tin;
      fpDraw(s.ex+(fr-.1+.1*ez)*dx,s.ey+(fr-.1+.1*ez)*dy,rot,Sc*(1.5-.5*ez),al,t-fi)}}
  ctx.globalAlpha=1}
function applySkin(v){SK=SKINS[v]||SKINS['default'];TINTC={};st.key='';draw()}
function comboOf(c){return comboI(c.ci)}
function ghostC(c){return !!(st.rs&&st.rs.b===c.b&&c.i>=st.rs.nc)}
/* lazer: TimeFadeIn = 400 * min(1, preempt / 450); after the hit time the circle lingers GHOST ms while fading out */
function fadeA(dt){var fi=400*Math.min(1,st.pre/450);return dt>0?cl((st.pre-dt)/fi,0,1):cl(1+dt/GHOST,0,1)}
function svAt(t){var sv=1,a=st.map.all;for(var i=0;i<a.length&&a[i].t<=t;i++)sv=a[i].sv;return sv}
function svBefore(p){var sv=1,a=st.map.all;for(var i=0;i<a.length;i++){if(a[i]===p||a[i].t>=p.t)break;sv=a[i].sv}return sv}
function recSliders(){var m=st.map;m.maxDur=0;m.objs.forEach(function(o){if(!o.sl){o.end=o.time;return}var tp=m.tps[0];m.tps.forEach(function(q){if(q.t<=o.time)tp=q});var sv=svAt(o.time);o.dur=o.sl.len/(100*m.sm*sv)*tp.beat*o.sl.slides;o.end=o.time+o.dur;if(o.dur>m.maxDur)m.maxDur=o.dur})}
function svList(){return st.map.all.filter(function(p){return p.u||p.sv!==p.sv0}).map(function(p){return{t:p.t,sv:p.sv,u:!!p.u}})}
function newSvPoint(t,sv){var m=st.map,prev=null;m.all.forEach(function(q){if(q.t<=t)prev=q});var rw=prev&&prev.raw||[]
  var p={t:t,uninh:false,beat:-100/sv,sv:sv,sv0:sv,kiai:!!(prev&&prev.kiai),u:true,raw:[String(t),String(-100/sv),rw[2]||'4',rw[3]||'1',rw[4]||'0',rw[5]||'100','0',rw[7]||'0']};
  m.all.push(p);m.all.sort(function(a,b){return a.t-b.t});return p}
function applySv(list){var m=st.map;m.all=m.all.filter(function(p){return !p.u});m.all.forEach(function(p){p.sv=p.sv0;p.beat=p.uninh?p.beat:-100/p.sv});
  list.forEach(function(x){if(x.u){var q=newSvPoint(x.t,x.sv);q.sv0=x.sv}else m.all.forEach(function(p){if(!p.uninh&&p.t===x.t){p.sv=x.sv;p.beat=-100/x.sv}})});
  m.all.sort(function(a,b){return a.t-b.t});st.svSel=null;recSliders()}
function spLive(){return st.sp&&st.sp.eff&&(st.sp.v||st.sp.f)&&st.sp.sg===st.csel.join(',')+'|'+st.sp.B.id?st.sp:null}
function pathOn(id){var sp0=spLive();if(sp0&&sp0.B.id===id)return true;if(st.dw&&st.dw.b&&st.dw.b.id===id)return true;if(st.nd&&st.nd.b&&st.nd.show&&st.nd.b.id===id)return true;if(st.drag&&st.drag.started&&st.drag.show&&st.drag.b.id===id)return true;return gvOn(id)}
/* G (pattern view) is the only thing that forces circles fully visible; while a stream is being made or reshaped its faded circles just get the outline */
function gvOn(id){if(!st.gv)return false;var B=bodyById(id);return !!B&&actBody(B)}
function mkNew(q){var n=st.nd;if(n&&n.b&&q.b===n.b.id&&(!n.ext||q.i>=n.base.length))return true;var D=st.dw;if(D&&D.b&&q.b===D.b.id)return true;var sp=spLive();if(sp&&q.b===sp.B.id&&q.i>=sp.i0&&q.i<=sp.i1)return true;return false}
function freshSel(c){var k=c.b+':'+c.i;return !!(st.fresh&&st.fresh.k[k]&&st.csel.indexOf(k)>=0&&st.csel.every(function(q){return st.fresh.k[q]}))}
function visC(c){var dt=c.time-st.ph;if(gvOn(c.b)||freshSel(c)||mkNew(c))return true;if(st.vis===2)return fadeA(dt)>.25;return st.showAll||(dt>=-GHOST&&dt<=st.pre)}
function anchorD(B,ix){var q=B.pts[ix],path=B.path,cum=B.cum;if(!q||!cum||!path.length)return 0;var bi=0,bd=1e18;for(var m=0;m<path.length;m++){var dd=(path[m].x-q.x)*(path[m].x-q.x)+(path[m].y-q.y)*(path[m].y-q.y);if(dd<bd){bd=dd;bi=m}}return cum[bi]}
function alphaAtD(B,dd){if(st.vis===1||pathOn(B.id))return 1;var C=B.circles;if(!C.length)return 1;if(C.length<2)return fadeA(C[0].time-st.ph);var ci=0;while(ci<C.length-2&&C[ci+1].d<dd)ci++;var c0=C[ci],c1=C[ci+1],u=cl((dd-c0.d)/((c1.d-c0.d)||1),0,1);return fadeA(c0.time-st.ph)*(1-u)+fadeA(c1.time-st.ph)*u}
function trimPlan(B,rn){var c=B.circles[rn-1];if(!c||rn>=B.count||B.pts.length<2)return null;var keep=[];for(var ix=0;ix<B.pts.length;ix++)if(ix===0||anchorD(B,ix)<=c.d-2)keep.push(ix);return{c:c,keep:keep}}
function findMerge(b,idx,tgt){if(!b||(idx!==0&&idx!==b.pts.length-1))return null;var q=tgt||b.pts[idx];
  for(var k=0;k<st.bodies.length;k++){var Y2=st.bodies[k];if(Y2===b)continue;var lv=Y2.circles.filter(function(c){return !c.del});if(!lv.length)continue;
    var ends=lv.length>1?[[lv[0],0],[lv[lv.length-1],1]]:[[lv[0],0]];
    for(var e2=0;e2<ends.length;e2++){var t=ends[e2][0];if(Math.hypot(t.x-q.x,t.y-q.y)<12)return{Y:Y2,j:ends[e2][1],x:t.x,y:t.y}}}
  return null}
function mergeBodies(X,xi,Yb,ylast){
  var xl=xi===X.pts.length-1,yf=!ylast,A,Bq;build();
  if(xl&&yf){A=X;Bq=Yb}else if(!xl&&!yf){A=Yb;Bq=X}else if(xl&&!yf){reverseBody(Yb);A=X;Bq=Yb}else{reverseBody(X);A=X;Bq=Yb}
  build();
  var nA=A.count,sA=A.step||(tpAt(A.start).beat/A.snap),off=Math.round((Bq.start-A.start)/sA),ticks=[],i;
  for(i=0;i<nA;i++)ticks.push(tickOf(A,i));
  var offB=Math.max(off,ticks[nA-1]+1);
  for(i=1;i<Bq.count;i++)ticks.push(offB+tickOf(Bq,i));
  Object.keys(Bq.del).forEach(function(k){if(+k>=1)A.del[+k+nA-1]=Bq.del[k]});Object.keys(Bq.ncf).forEach(function(k){if(+k>=1)A.ncf[+k+nA-1]=Bq.ncf[k]});
  A.pos=A.pos.slice(0,nA).concat(Bq.pos.slice(1).map(function(q){return{x:q.x,y:q.y}}));A.pts=[];A.psig=null;
  A.count=nA+Bq.count-1;A.ticks=ticks;A.lin=false;
  dropBody(Bq);st.ab=A.id;st.sel=[];st.csel=[];st.fx=null;st.key='';syncPanel()}
function drawPaths(){
  var mute=col['--mute'];
  st.bodies.forEach(function(B){
    var P=B.path;if(P.length<2)return;
    ctx.setLineDash([6,6]);ctx.lineWidth=2;ctx.strokeStyle=mute;
    var cm=B.cum,base=B.id===st.ab?.7:.45;
    for(var j=1;j<P.length;j++){
      var ca=cm?alphaAtD(B,(cm[j-1]+cm[j])/2):1,al=base*ca;if(B.id===st.ab)al=Math.max(al,.1);
      if(al<.015)continue;
      ctx.globalAlpha=al;ctx.lineDashOffset=cm?-cm[j-1]*S:0;
      ctx.beginPath();ctx.moveTo(X(P[j-1].x),Y(P[j-1].y));ctx.lineTo(X(P[j].x),Y(P[j].y));ctx.stroke()}
    ctx.lineDashOffset=0});
  ctx.setLineDash([]);ctx.globalAlpha=1}

/* selection outline of a slider's whole body (the normal-circle ring, run along the path): two offset lines plus rings at the ends */
function slSelOutline(o,R,al){var p=o.sl.path,n=p.length,off=R+6,OL=slSelOutline.cv||(slSelOutline.cv=document.createElement('canvas'));if(n<2)return;
  /* one outline around the whole body: stroke the path wide, then cut the inside out, so a slider that bends over itself shows no inner lines */
  if(OL.width!==cv.width||OL.height!==cv.height){OL.width=cv.width;OL.height=cv.height}
  var g=OL.getContext('2d');g.clearRect(0,0,OL.width,OL.height);g.lineCap='round';g.lineJoin='round';
  var tr=function(){g.beginPath();p.forEach(function(q,i){i?g.lineTo(X(q.x),Y(q.y)):g.moveTo(X(q.x),Y(q.y))})};
  tr();g.lineWidth=2*off+3;g.strokeStyle=col['--text'];g.stroke();
  g.globalCompositeOperation='destination-out';tr();g.lineWidth=2*off-3;g.stroke();g.globalCompositeOperation='source-over';
  ctx.setLineDash([]);ctx.globalAlpha=al;ctx.drawImage(OL,0,0);ctx.globalAlpha=1}
/* how opaque a circle / map object is drawn right now (1 = fully visible) */
function circFade(q){var dt=q.time-st.ph,sa=st.vis===1?(dt<0?fadeA(dt):1):fadeA(dt);if(gvOn(q.b))sa=Math.max(sa,.75);return sa}
function objFade(o){var od=o.time-st.ph,age=st.ph-o.end;return od>0?fadeA(od):(age>0?fadeA(-age):1)}
function sliderPos(sl,d){
  var c=sl.cum,lo=1,hi=c.length-1;if(c.length<2)return sl.path[0];
  while(lo<hi){var m=(lo+hi)>>1;if(c[m]<d)lo=m+1;else hi=m}
  var a=sl.path[lo-1],b=sl.path[lo],seg=c[lo]-c[lo-1]||1,f=cl((d-c[lo-1])/seg,0,1);
  return{x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f}}
function drawSlider(o,R,al){
  var p=o.sl.path;if(p.length<2)return;
  ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(X(p[0].x),Y(p[0].y));
  for(var i=1;i<p.length;i++)ctx.lineTo(X(p[i].x),Y(p[i].y));
  ctx.globalAlpha=al;ctx.strokeStyle=col['--mute'];ctx.lineWidth=2*R;ctx.stroke();
  ctx.strokeStyle=col['--play'];ctx.lineWidth=Math.max(2,2*R-6);ctx.stroke();
  ctx.lineCap='butt';
  var t=p[p.length-1];ring(t.x,t.y,R*.5,col['--mute'],2,al);
  if(o.sl.slides>1){ctx.globalAlpha=al;ctx.fillStyle=col['--mute'];ctx.font='600 '+Math.max(10,R*.5)+'px system-ui,sans-serif';ctx.fillText('x'+o.sl.slides,X(t.x),Y(t.y)+1)}
}

function drawAnchors(){
  st.arcHits=[];
  var A=AB(),acc=col['--accent'],txt=col['--text'],play=col['--play'];if(A&&!editing(A))A=null;var lo=A?fxLo(A):0,hi=A?fxHi(A):1e9;
  ctx.textAlign='left';ctx.textBaseline='middle';
  st.bodies.forEach(function(B){
    if(B===A||!B.pts.length)return;
    var ends=B.pts.length>1?[0,B.pts.length-1]:[0];
    ends.forEach(function(ix,k){var q=B.pts[ix],fa=alphaAtD(B,anchorD(B,ix));if(fa<.04)return;
      ctx.globalAlpha=.85*fa;ctx.beginPath();ctx.rect(X(q.x)-5,Y(q.y)-5,10,10);ctx.fillStyle=k?txt:'#3fbf6a';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=acc;ctx.stroke();ctx.globalAlpha=fa;
      lbl(B.pts.length===1?'free':(k?'end':'start'),X(q.x)+9,Y(q.y)-10,11);ctx.globalAlpha=1})});
  if(!A)return;
  var P=A.pts,AD=P.map(function(q,ix){return alphaAtD(A,anchorD(A,ix))}),ghA=null;
  if(st.rs&&st.rs.b===A.id){var tp0=trimPlan(A,st.rs.nc);if(tp0){ghA={};P.forEach(function(q,ix){if(tp0.keep.indexOf(ix)<0)ghA[ix]=1})}}
  for(var i=lo;i<P.length-1&&i<hi;i++){
    var dx=P[i+1].x-P[i].x,dy=P[i+1].y-P[i].y,len=Math.hypot(dx,dy);
    if(len<40)continue;
    var mx=X((P[i].x+P[i+1].x)/2),my=Y((P[i].y+P[i+1].y)/2),an=Math.atan2(dy,dx);
    ctx.save();ctx.translate(mx,my);ctx.rotate(an);ctx.globalAlpha=.85*Math.max(.15,Math.min(AD[i],AD[i+1]));ctx.fillStyle=acc;ctx.beginPath();ctx.moveTo(7,0);ctx.lineTo(-5,-5);ctx.lineTo(-5,5);ctx.closePath();ctx.fill();ctx.restore();ctx.globalAlpha=1}
  P.forEach(function(q,i){
    if(i<lo||i>hi)return;
    var red=i>0&&(q.type||q.corner),sel=st.sel.indexOf(i)>=0,first=i===0,last=i===P.length-1&&P.length>1;
    ctx.globalAlpha=(sel?1:Math.max(.18,AD[i]))*(ghA&&ghA[i]?.4:1);
    ctx.beginPath();ctx.rect(X(q.x)-6,Y(q.y)-6,12,12);
    ctx.fillStyle=sel?acc:(first?'#3fbf6a':(last?txt:(red?'#e8485a':play)));ctx.fill();ctx.lineWidth=2;ctx.strokeStyle=(ghA&&ghA[i])?'#e8485a':((red&&!first)?'#e8485a':acc);ctx.stroke();
    if(q.pin!=null&&i>0&&i<P.length-1){ctx.beginPath();ctx.arc(X(q.x),Y(q.y),11,0,6.283);ctx.strokeStyle=txt;ctx.lineWidth=2;ctx.stroke();lbl('#'+(q.pin+1),X(q.x)-8,Y(q.y)+22,12)}
    if(q.type){ctx.textAlign='center';lbl({linear:'L',perfect:'P',bezier:'B',catmull:'C'}[q.type],X(q.x)-4,Y(q.y)-19,13);ctx.textAlign='left'}
    lbl(String(i+1),X(q.x)+10,Y(q.y)-11,13);ctx.globalAlpha=1});
  if(st.mh){var mt=st.mh;ctx.beginPath();ctx.arc(X(mt.x),Y(mt.y),16,0,6.283);ctx.strokeStyle=acc;ctx.lineWidth=3;ctx.stroke()}
  for(var i0=lo;i0<P.length-2&&i0<hi;i0++){
    if((P[i0].type||(i0===0?'bezier':''))!=='perfect')continue;
    var j0=i0+1;while(j0<P.length-1&&!P[j0].type)j0++;
    if(j0-i0!==2)continue;
    var a0=P[i0],b0=P[i0+1],c0=P[j0],dd=2*(a0.x*(b0.y-c0.y)+b0.x*(c0.y-a0.y)+c0.x*(a0.y-b0.y));
    if(Math.abs(dd)<1e-6)continue;
    var a2=a0.x*a0.x+a0.y*a0.y,b2=b0.x*b0.x+b0.y*b0.y,c2=c0.x*c0.x+c0.y*c0.y,
        ux=(a2*(b0.y-c0.y)+b2*(c0.y-a0.y)+c2*(a0.y-b0.y))/dd,uy=(a2*(c0.x-b0.x)+b2*(a0.x-c0.x)+c2*(b0.x-a0.x))/dd,
        ta0=Math.atan2(a0.y-uy,a0.x-ux),tb0=Math.atan2(b0.y-uy,b0.x-ux),tc0=Math.atan2(c0.y-uy,c0.x-ux),
        df=function(x,y,dr){return(((y-x)*dr)%6.283185307+6.283185307)%6.283185307},
        dr=df(ta0,tb0,1)<df(ta0,tc0,1)?1:-1,sw=df(ta0,tc0,dr)*180/Math.PI;
    if(!(AD[i0+1]>.3||st.sel.some(function(ix){return ix>=i0&&ix<=j0})))continue;
    ctx.textAlign='left';ctx.font='700 12px system-ui,sans-serif';
    var at0=X(b0.x)+10,at1=Y(b0.y)+30,atx='arc '+sw.toFixed(1)+'°',atw=ctx.measureText(atx).width;
    ctx.globalAlpha=.92;ctx.fillStyle=col['--panel'];ctx.fillRect(at0-5,at1-10,atw+10,20);ctx.globalAlpha=1;ctx.strokeStyle=acc;ctx.lineWidth=1.5;ctx.strokeRect(at0-5,at1-10,atw+10,20);
    lbl(atx,at0,at1,12);
    st.arcHits.push({x0:(at0-5)/S-M,y0:(at1-10)/S-M,x1:(at0+atw+5)/S-M,y1:(at1+10)/S-M,i0:i0,j0:j0,sw:sw})}
  if(st.sel.length===2){
    var s=st.sel.slice().sort(function(m,n){return m-n}),p1=P[s[0]],p2=P[s[1]];
    if(p1&&p2&&straight(s[0],s[1])){
      var deg=(Math.atan2(-(p2.y-p1.y),p2.x-p1.x)*180/Math.PI+360)%360,gx=X((p1.x+p2.x)/2),gy=Y((p1.y+p2.y)/2),lab=deg.toFixed(1)+'°';
      ctx.font='600 15px system-ui,sans-serif';var tw=ctx.measureText(lab).width+14;
      ctx.fillStyle=acc;ctx.fillRect(gx-tw/2,gy-12,tw,24);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(lab,gx,gy+1)}}
  ctx.textAlign='center'}
function render(){
  st.q=false;build();
  var AB0=AB();if(AB0){if(document.activeElement!==$('bias')){var cb0=curBias(AB0);if(+$('bias').value!==cb0)$('bias').value=cb0}if(document.activeElement!==$('bfoc')){var cf0=curFoc(AB0);if(+$('bfoc').value!==cf0)$('bfoc').value=cf0}if(document.activeElement!==$('brch')){var cr0=curRch(AB0);if(+$('brch').value!==cr0)$('brch').value=cr0}if(document.activeElement!==$('count')){var rr0=selRun(true),cv0=rr0?rr0.i1-rr0.i0+1:AB0.count;if(+$('count').value!==cv0)$('count').value=cv0}}
  var w=cv.width,h=cv.height,now=performance.now();
  ctx.clearRect(0,0,w,h);ctx.globalAlpha=1;
  var acc=col['--accent'],mute=col['--mute'],txt=col['--text'],panel=col['--panel'];
  ctx.strokeStyle=col['--grid'];ctx.lineWidth=1;ctx.beginPath();
  for(var gx=-64;gx<=W+M;gx+=64){ctx.moveTo(X(gx),0);ctx.lineTo(X(gx),h)}
  for(var gy=-64;gy<=H+M;gy+=64){ctx.moveTo(0,Y(gy));ctx.lineTo(w,Y(gy))}
  ctx.stroke();
  ctx.strokeStyle=mute;ctx.globalAlpha=.55;ctx.lineWidth=2;ctx.strokeRect(X(0),Y(0),W*S,H*S);ctx.globalAlpha=1;
  ctx.textAlign='center';ctx.textBaseline='middle';
  if(!st.map){
    ctx.fillStyle=txt;ctx.font='600 30px system-ui,sans-serif';ctx.fillText('Import a .osz file to start',w/2,h/2-18);
    ctx.fillStyle=mute;ctx.font='20px system-ui,sans-serif';ctx.fillText('Open the beatmap you want to add the stream to.',w/2,h/2+22);
    drawTop();drawBottom();return}
  var a=st.audio;
  if(st.playing){
    var r=+$('rate').value;
    if(a&&!a.paused){
      var ct=a.currentTime;if(ct!==st.aT){st.aT=ct;st.aP=now}
      var np=st.aT*1000+(now-st.aP)*r;if(np<st.ph&&st.ph-np<60)np=st.ph;st.ph=np;
    }else{st.ph=st.ph0+(now-st.t0)*r;if(a&&st.ph>=0){a.currentTime=st.ph/1000;a.playbackRate=r;st.aT=null;a.play()}}
    if(a&&a.ended)stopPlay();
    center();
  }
  var clk=fmt(st.ph);if(clk!==st.clk){st.clk=clk;$('clock').textContent=clk;if(st.map){var sv0=svAt(st.ph),vn=st.map.sm*sv0;$('svNow').textContent=vn.toFixed(2)+'x';$('svNow').title='Base '+st.map.sm.toFixed(2)+' x SV '+sv0.toFixed(2)}}
  var bpmT=(60000/tpAt(st.ph).beat).toFixed(2)+' BPM';if(bpmT!==st.cb){st.cb=bpmT;$('cbpm').textContent=bpmT}
  var R=st.radius*S,pre=st.pre,pl=st.playing,objs=st.map.objs,vis=[];
  for(var oi=lb(objs,st.ph-GHOST-(st.map.maxDur||0));oi<objs.length&&objs[oi].time<=st.ph+pre;oi++)if(st.ph<=objs[oi].end+GHOST)vis.push(oi);
  computeStacks();drawFollowPoints();
  for(var vi=vis.length-1;vi>=0;vi--){var so0=(objs[vis[vi]].sh||0)*st.soff*S;ctx.save();ctx.translate(so0,so0);(function(vi){
    var o=objs[vis[vi]],od=o.time-st.ph,age=st.ph-o.end,fo=od>0?fadeA(od):1,al=age>0?.6*(1-age/GHOST):.6*fo,osel=st.csel.indexOf('o:'+vis[vi])>=0;
    if(o.mod||o.user){var ccO=comboI(o.ci),oage=st.ph-o.end,saO=od>0?fadeA(od):(oage>0?fadeA(-oage):1),pastO=oage>0&&!osel;
      if(saO>.01){
        if(o.sl&&osel)slSelOutline(o,R,.95); /* behind the body, so the body hides any outline that falls inside it */
        if(o.sl){skSlider(o.sl.path,R,saO,ccO);var tl2=o.sl.path[o.sl.path.length-1];if(o.sl.slides>1)skRev(o,R,ccO,saO);else ring(tl2.x,tl2.y,R*.45,'#fff',2,saO*.6)}
        skBody(o.x,o.y,R,ccO,saO,pastO,false);if(osel)ring(o.x,o.y,R+6,txt,3,.95);
        skNum(o.x,o.y,R,o.num,saO,pastO);
        if(od>0&&od<=pre)skApproach(o.x,o.y,R,1+3*od/pre,ccO,.9*saO);
        if(o.sl&&st.ph>=o.time&&st.ph<=o.end)skBall(o,R,ccO)}
      else if(osel){ring(o.x,o.y,R+6,txt,3,.9);if(o.sl)slSelOutline(o,R,.9)}
      return}
    if(al<=0)return;
    if(o.sl)drawSlider(o,R,al*.8);
    ring(o.x,o.y,R,osel?acc:mute,osel?4:3,osel?fo:al);
    ctx.globalAlpha=al;ctx.fillStyle=mute;ctx.font='600 '+Math.max(10,R*.6)+'px system-ui,sans-serif';ctx.fillText(String(o.num),X(o.x),Y(o.y)+1);
    if(od>0)ring(o.x,o.y,R*(1+3*od/pre),mute,3.5,.5*fo);
    if(o.sl&&st.ph>=o.time&&st.ph<=o.end){
      var pp=(st.ph-o.time)/o.dur*o.sl.slides,pass=Math.floor(pp),ff=pp-pass;if(pass%2)ff=1-ff;
      var bp=sliderPos(o.sl,ff*o.sl.len);ring(bp.x,bp.y,R*1.8,mute,2,.6);ring(bp.x,bp.y,R*.5,acc,3,.9)}})(vi);ctx.restore()}
  ctx.globalAlpha=1;
  if(st.vis!==2)drawPaths();
  /* stream circles: earliest on top, same order the hit test uses */
  var L=st.live,sel={},SPL=spLive(),fr=st.fresh&&st.csel.length&&st.csel.every(function(k){return st.fresh.k[k]})?st.fresh.k:null,en=st.nd&&st.nd.ext&&st.nd.b?st.nd:null;st.csel.forEach(function(k){sel[k]=1});
  for(var i=L.length-1;i>=0;i--){var sq0=(L[i].sh||0)*st.soff*S;ctx.save();ctx.translate(sq0,sq0);(function(i){
    var q=L[i],dt=q.time-st.ph,sa=1;
    var gvc=gvOn(q.b),key=q.b+':'+q.i,isNew=(fr&&fr[key]&&sel[key])||mkNew(q);if(!st.showAll&&!gvc&&(dt<-GHOST||dt>pre)){if(isNew){ring(q.x,q.y,R+6,txt,3,1);if(isLastLive(bodyById(q.b),q.i)){ctx.setLineDash([6,4]);ring(q.x,q.y,R+13,acc,3,1);ctx.setLineDash([])}}return}
    if(st.vis===1)sa=dt<0?fadeA(dt):1;else sa=fadeA(dt);if(gvc)sa=Math.max(sa,.75);
    if(sa<=.01){if(sel[key]||isNew){ring(q.x,q.y,R+6,txt,3,.9);if(isNew&&isLastLive(bodyById(q.b),q.i)){ctx.setLineDash([6,4]);ring(q.x,q.y,R+13,acc,3,1);ctx.setLineDash([])}}return}
    var past=dt<0&&!sel[key],pr=R;
    var gh=ghostC(q);if(gh)sa*=.35;
    var cc=comboOf(q);skBody(q.x,q.y,pr,cc,sa,past,gh);
    if(sel[key]||isNew)ring(q.x,q.y,R+6,txt,3,.95);
    if(isNew&&isLastLive(bodyById(q.b),q.i)){ctx.setLineDash([6,4]);ring(q.x,q.y,R+13,acc,3,1);ctx.setLineDash([])}
    if(SPL&&q.b===SPL.B.id&&q.i>=SPL.i0&&q.i<=SPL.i1){var ef=SPL.eff[q.i-SPL.i0]||0,hc='hsl('+Math.round(120*(1-ef))+',80%,45%)';
      ctx.globalAlpha=Math.max(sa,.7)*.4;ctx.beginPath();ctx.arc(X(q.x),Y(q.y),pr,0,6.283);ctx.fillStyle=hc;ctx.fill();ring(q.x,q.y,R+3,hc,5,Math.max(sa,.8))}
    skNum(q.x,q.y,pr,q.num,sa,past);
    if(dt>0&&dt<=pre)skApproach(q.x,q.y,R,1+3*dt/pre,cc,.9*sa)})(i);ctx.restore()}
  ctx.globalAlpha=1;
  if(!pl&&st.lm&&(st.tool==='circle'||st.tool==='slider')){
    var st0=snapT(st.ph),pv=prevCombo(st0),pci=0,pnum=1;
    if(pv){pci=pv.ci||0;pnum=pv.num+1}if(st.pnc||!pv){pci=pv?pci+1:0;pnum=1}var ccP=comboI(pci);
    if(st.slp){var bP=slBuild(true);
      if(bP){skSlider(bP.path,R,.7,ccP);ctx.globalAlpha=1}
      var h0=st.slp.pts[0];skBody(h0.x,h0.y,R,ccP,.8,false,false);skNum(h0.x,h0.y,R,pnum,.9,false);
      st.slp.pts.forEach(function(q,i){var dup=i>0&&q===st.slp.pts[i-1];ctx.globalAlpha=1;ctx.fillStyle=dup?'#e8485a':'#fff';ctx.strokeStyle=acc;ctx.lineWidth=2;ctx.beginPath();ctx.rect(X(q.x)-5,Y(q.y)-5,10,10);ctx.fill();ctx.stroke()});
      if(bP){ctx.globalAlpha=.9;ctx.fillStyle=txt;ctx.font='600 15px system-ui,sans-serif';ctx.textAlign='left';ctx.fillText(bP.type,X(h0.x)+R+8,Y(h0.y)-R);slLabels(bP.type,bP.pts,bP.path,bP.len)}}
    else{var mx=cl(st.lm.x,0,W),my=cl(st.lm.y,0,H),hs=st.lastAlt?null:nearSnap(mx,my,null,null);if(hs){mx=hs.x;my=hs.y}skBody(mx,my,R,ccP,.55,false,false);skNum(mx,my,R,pnum,.7,false)}
    ctx.globalAlpha=1}
  (function(){var SL=shapeLine();if(!SL)return;
    function line(pl,lw,al,dash){ctx.setLineDash(dash||[]);ctx.globalAlpha=al;ctx.strokeStyle=acc;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.beginPath();pl.forEach(function(q,i){i?ctx.lineTo(X(q.x),Y(q.y)):ctx.moveTo(X(q.x),Y(q.y))});ctx.stroke();ctx.setLineDash([])}
    if(st.bd){line(st.bd.pl,2,.5,[6,5])}
    line(SL.pl,4,.95);
    var hp=null;
    if(st.bd){var gp=null;var s0=st.bd.ug,c0=SL.cum;for(var j=1;j<c0.length;j++)if(c0[j]>=s0){gp=SL.pl[j];break}hp=gp||SL.pl[SL.pl.length-1]}
    else if(st.lm){var h=nearOnLine(SL.pl,SL.cum,st.lm);if(h.d<=10){for(var j2=1;j2<SL.cum.length;j2++)if(SL.cum[j2]>=h.s){hp=SL.pl[j2];break}}}
    if(hp){ctx.globalAlpha=1;ctx.beginPath();ctx.arc(X(hp.x),Y(hp.y),9,0,6.283);ctx.fillStyle='#fff';ctx.fill();ctx.lineWidth=3.5;ctx.strokeStyle=acc;ctx.stroke()}
    ctx.globalAlpha=1})();
  if(st.vis===2)drawPaths();
  if(st.toast){ctx.globalAlpha=.95;ctx.fillStyle=txt;ctx.font='600 20px system-ui,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(st.toast,w-14,24);ctx.textAlign='left'}
  ctx.globalAlpha=.75;ctx.fillStyle=mute;ctx.font='600 18px system-ui,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(['View: normal','View: all circles','View: fade + line on top'][st.vis]+(st.gv?' + pattern':'')+'   ·   DS '+st.ds.toFixed(2)+'x',14,24);ctx.globalAlpha=1;
  if(!pl){
    drawAnchors();drawSlPts();drawRotBox();drawAim();drawMir();
    if(st.box){var b=st.box;ctx.setLineDash([5,4]);ctx.strokeStyle=acc;ctx.lineWidth=1.5;ctx.strokeRect(X(b.x0),Y(b.y0),(b.x1-b.x0)*S,(b.y1-b.y0)*S);ctx.setLineDash([])}
    info()}
  drawTop();drawBottom();
  if(st.playing)draw();
}
function circleOf(k){var a=parseKey(k);if(a.o)return st.map&&st.map.objs[a.i];var B=bodyById(a.b);return B&&B.circles[a.i]}
function info(){
  var A=AB(),cs=A?A.circles.filter(function(q){return !q.del}):[],i;
  $('iBpm').textContent=A&&A.bpm?A.bpm.toFixed(2):'-';
  $('iPts').textContent=A?A.pts.length:0;
  $('iLen').textContent=A?Math.round(A.len||0)+' px':'0 px';
  if(cs.length>1){
    var sp=[];for(i=1;i<cs.length;i++)sp.push(Math.hypot(cs[i].x-cs[i-1].x,cs[i].y-cs[i-1].y));
    var sum=sp.reduce(function(a,b){return a+b},0);
    $('iAvg').textContent=(sum/sp.length).toFixed(1)+' px';
    $('iMM').textContent=Math.min.apply(0,sp).toFixed(1)+' / '+Math.max.apply(0,sp).toFixed(1);
    $('iDur').textContent=fmt(cs[0].time)+' to '+fmt(cs[cs.length-1].time);
  }else{$('iAvg').textContent=$('iMM').textContent=$('iDur').textContent='-'}
  var s=st.sel,P=A?A.pts:[];
  $('iSel').textContent=s.length===1&&P[s[0]]?'#'+(s[0]+1)+' at '+Math.round(P[s[0]].x)+', '+Math.round(P[s[0]].y):s.length?s.length+' anchors':'-';
  if(s.length===2&&P[s[0]]&&P[s[1]]){
    var o=s.slice().sort(function(m,n){return m-n}),p1=P[o[0]],p2=P[o[1]],deg=(Math.atan2(-(p2.y-p1.y),p2.x-p1.x)*180/Math.PI+360)%360;
    $('iAng').textContent=deg.toFixed(2)+'° '+(straight(o[0],o[1])?'straight':'chord')+', '+Math.hypot(p2.x-p1.x,p2.y-p1.y).toFixed(1)+' px';
  }else $('iAng').textContent='-';
  var ck=st.csel;
  if(!ck.length)$('iCir').textContent='-';
  else if(ck.length===1){var oo=circleOf(ck[0]);$('iCir').textContent=oo?'#'+oo.num+' '+fmt(oo.time):'-'}
  else $('iCir').textContent=ck.length+' selected';
  var live=ck.map(circleOf).filter(function(c){return c&&c.b!=null&&!c.del});
  $('ncBtn').setAttribute('aria-pressed',live.length>0&&live.every(function(c){return c.nc}));
  var bv=+$('bias').value,fv=+$('bfoc').value,br=Math.exp(6*Math.pow(Math.abs(bv)/100,3));var ra=bv/100*.9,rr=(1+Math.abs(ra))/(1-Math.abs(ra));$('biasHint').textContent=bv===0?'Original spacing':(bv<0?'Deccel':'Accel')+': the gaps change evenly along the shape, last gap about \u00d7'+(rr<10?rr.toFixed(1):Math.round(rr))+(bv<0?' smaller':' larger')+' than the first';var rv=+$('brch').value;$('rchHint').textContent=rv===0?'Tight (only the nearest gaps)':rv>=100?'Across the whole run':'Spreads over about '+rv+'% more of the run';$('focHint').textContent=fv===0?'Gradual change over the whole run':fv<0?'Change shifted toward the start ('+(-fv)+'%)':'Change shifted toward the end ('+fv+'%)';
}
