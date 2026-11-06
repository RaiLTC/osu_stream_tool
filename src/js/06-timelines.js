/* ---- timelines: top = circles + snap (like osu! stable), bottom = whole song, timing, SV, bookmarks ---- */
function tx(t){return (t-st.tv0)*st.tz}
function ta(x){return x/st.tz+st.tv0}
function fit(c){
  var dpr=window.devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;
  if(c.width!==Math.round(w*dpr)||c.height!==Math.round(h*dpr)){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr)}
  var g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,w,h);return{g:g,w:w,h:h}}
var MID=50,TB=82,SVY=104,TRc=32,DCOL={2:'#e8485a',3:'#b05cf0',4:'#4aa3ff',6:'#b05cf0',8:'#f0c030',12:'#b05cf0',16:'#f0c030'};
function tFlag(g,x,y,s){g.beginPath();g.moveTo(x,y+s);g.lineTo(x,y-s);g.lineTo(x+s*.95,y-s*.5);g.lineTo(x,y);g.strokeStyle='#f0a030';g.fillStyle='#f0a030';g.lineWidth=1.5;g.stroke();g.fill()}
function tlCircle(g,x,num,c,fill,tc,sel,nc){
  if(sel){g.beginPath();g.arc(x,MID,TRc+4,0,6.283);g.strokeStyle=col['--text'];g.lineWidth=2;g.stroke()}
  g.beginPath();g.arc(x,MID,TRc,0,6.283);g.fillStyle=fill;g.fill();g.lineWidth=2;g.strokeStyle=c;g.stroke();
  if(TRc>=9){g.fillStyle=tc;g.font='600 '+(TRc>=12?12:10)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(num),x,MID+1)}
  }
/* timeline objects that were created or edited use the skin, like on the playfield; untouched originals stay flat grey */
var TLG=false;/* original, untouched map objects are drawn as wireframe ghosts, like in the play field */
function tlBodyC(g,x,r,cc){var hc=SK.img.hc;
  if(TLG){g.beginPath();g.arc(x,MID,r,0,6.283);g.fillStyle='#000';g.fill();g.lineWidth=2.5;g.strokeStyle='rgba(205,205,215,.8)';g.stroke();return}
  if(skOK(hc)){var k=1.09,t=tint(hc,cc),f=sprF(hc,r*k);g.drawImage(t,x-t.width*f/2,MID-t.height*f/2,t.width*f,t.height*f);/* the sprite has a transparent margin: scale so the visible circle has radius r */
    var ov=SK.img.ov;if(skOK(ov)){var f2=sprF(ov,r*k);g.drawImage(ov,x-ov.naturalWidth*f2/2,MID-ov.naturalHeight*f2/2,ov.naturalWidth*f2,ov.naturalHeight*f2)}return}
  g.beginPath();g.arc(x,MID,r,0,6.283);g.fillStyle=cc;g.fill();g.lineWidth=3;g.strokeStyle='#fff';g.stroke()}
function tlSkin(g,x,num,cc,sel){
  tlBodyC(g,x,TRc,cc);
  if(sel){var a0=g.globalAlpha;g.globalAlpha=a0;g.beginPath();g.arc(x,MID,TRc+1,0,6.283);g.strokeStyle='#ff9a1a';g.lineWidth=4;g.stroke()}
  if(num!=null){g.font='700 '+Math.round(TRc*.8)+'px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';if(TLG){g.fillStyle='rgba(205,205,215,.75)';g.fillText(String(num),x,MID+1);return}g.lineWidth=3;g.strokeStyle='rgba(0,0,0,.4)';g.strokeText(String(num),x,MID+1);g.fillStyle='#fff';g.fillText(String(num),x,MID+1)}}
function tlSlider(g,o,x0,x1,cc,sel){
  var a0=g.globalAlpha,hh=TRc*1.9,bw=Math.max(1,x1-x0);
  /* a capsule no taller than the circles, so its ends vanish behind them */
  g.lineCap='round';
  if(TLG){g.globalAlpha=a0;g.strokeStyle='rgba(205,205,215,.8)';g.lineWidth=hh;g.beginPath();g.moveTo(x0,MID);g.lineTo(x1,MID);g.stroke();g.strokeStyle='#000';g.lineWidth=hh-5;g.beginPath();g.moveTo(x0,MID);g.lineTo(x1,MID);g.stroke()}
  else{g.globalAlpha=a0*.95;g.strokeStyle=shade(cc,.7);g.lineWidth=hh;g.beginPath();g.moveTo(x0,MID);g.lineTo(x1,MID);g.stroke()}
  if(sel){g.globalAlpha=a0;g.strokeStyle='#ff9a1a';g.lineWidth=hh+4;g.beginPath();g.moveTo(x0,MID);g.lineTo(x1,MID);g.stroke();g.strokeStyle=shade(cc,.7);g.lineWidth=hh;g.beginPath();g.moveTo(x0,MID);g.lineTo(x1,MID);g.stroke()}
  g.lineCap='butt';
  g.globalAlpha=a0;
  var n=o.sl.slides;for(var k=n;k>=1;k--){var xr=x0+(x1-x0)*k/n;tlBodyC(g,xr,k<n?TRc*.92:TRc,cc)}}
function playhead(g,h){
  var px=Math.round(tx(st.ph))+.5;g.strokeStyle='#fff';g.lineWidth=1.5;g.beginPath();g.moveTo(px,0);g.lineTo(px,h);g.stroke()}
function msg(g,w,h,t){g.fillStyle=col['--mute'];g.font='12px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(t,w/2,h/2)}
function drawTop(){
  var f=fit(tt),g=f.g,w=f.w,h=f.h,acc=col['--accent'],mute='#9a9aa8',txt='#fff',panel=col['--panel'];
  g.fillStyle='#000';g.fillRect(0,0,w,h);
  if(!st.map){msg(g,w,h,'Snap timeline appears after you import a map');return}
  var snap=+$('snap').value,t1=ta(w);
  TRc=32;
  var drawTicks=function(){g.fillStyle='#4a4a55';g.globalAlpha=1;g.fillRect(0,TB,w,1);st.map.tps.forEach(function(tp,i){
    var end=i+1<st.map.tps.length?st.map.tps[i+1].t:1e12,s=tp.beat/snap,per=snap;
    if(s*st.tz<4){s=tp.beat;per=1}
    if(s*st.tz<4)return;
    for(var k=Math.max(0,Math.ceil((st.tv0-tp.t)/s));;k++){
      var t=tp.t+k*s;if(t>=end||t>t1)break;
      var r=k%per,x=Math.round(tx(t))+.5,c,len;
      if(!r){c='#e6e6c8';len=16}else{var dv=per/gcd(r,per);c=DCOL[dv]||mute;len=dv===2?11:7}
      g.strokeStyle=c;g.globalAlpha=1;g.lineWidth=1;g.beginPath();g.moveTo(x,TB);g.lineTo(x,TB-len);g.stroke()}});g.globalAlpha=1};
  g.globalAlpha=1;
  if(st.rng){var ra=tx(Math.min(st.rng.a,st.rng.b)),rb=tx(Math.max(st.rng.a,st.rng.b));
    g.fillStyle=acc;g.globalAlpha=.28;g.fillRect(ra,4,Math.max(2,rb-ra),h-8);g.globalAlpha=1;
    var sp=(tpAt(st.rng.a).beat/snap),nn=Math.round(Math.abs(st.rng.b-st.rng.a)/sp)+1;
    g.fillStyle=txt;g.font='600 12px system-ui,sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText(nn+' circles',ra+4,8)}
  var objs=st.map.objs,sel={};st.csel.forEach(function(k){sel[k]=1});
  g.lineCap='round';
  /* like osu!stable: every object wears its skin, earlier objects sit on top, a slider is a translucent bar that ends in a circle */
  var i0=lb(objs,ta(-40)-(st.map.maxDur||0)),i1=i0;while(i1<objs.length&&objs[i1].time<=ta(w+40))i1++;
  for(var i=i1-1;i>=i0;i--){var o=objs[i],x0=tx(o.time),cc=comboI(o.ci);TLG=!o.mod&&!o.user;
    if(o.sl){var x1=tx(o.end);if(x1<-40){TLG=false;continue}tlSlider(g,o,x0,x1,cc,sel['o:'+i])}
    if(x0<-40){TLG=false;continue}
    tlSkin(g,x0,o.num,cc,sel['o:'+i])}
  TLG=false;
  g.lineCap='butt';
  if(!st.playing&&st.lm&&(st.tool==='circle'||st.tool==='slider')){
    var pt0=snapT(st.ph),pv=prevCombo(pt0),pci=0,pnum=1;
    if(pv){pci=pv.ci||0;pnum=pv.num+1}if(st.pnc||!pv){pci=pv?pci+1:0;pnum=1}
    var ccP=comboI(pci),pb=st.slp?slBuild(true):null;
    g.globalAlpha=.7;
    if(st.slp&&pb){var ts=st.slp.time,tpp=tpAt(ts),dur=pb.len/(100*st.map.sm*svAt(ts))*tpp.beat,px0=tx(ts),px1=tx(ts+dur);
      tlSlider(g,{sl:{slides:1}},px0,px1,ccP,false);tlSkin(g,px0,pnum,ccP,false);
      g.globalAlpha=1;g.fillStyle=txt;g.font='600 11px system-ui,sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText(pb.type+' \u00b7 '+Math.round(dur)+' ms',px0-TRc,MID+TRc+6)}
    else if(!st.slp&&st.tool==='circle')tlSkin(g,tx(pt0),pnum,ccP,false);
    g.globalAlpha=1}
  st.live.slice().reverse().forEach(function(c){var x=tx(c.time);if(x<-40||x>w+40)return;var gh=ghostC(c);if(gh)g.globalAlpha=.35;tlSkin(g,x,c.num,comboOf(c),sel[c.b+':'+c.i]);if(gh){g.beginPath();g.arc(x,MID,TRc,0,6.283);g.strokeStyle='#e8485a';g.lineWidth=2;g.stroke()}g.globalAlpha=1});
  drawTicks();
  /* arrow when the active stream is out of view */
  var A=AB(),lv=A?A.circles.filter(function(c){return !c.del}):[];
  if(lv.length){var xa=tx(lv[0].time),xb=tx(lv[lv.length-1].time);g.fillStyle=acc;g.font='600 12px system-ui,sans-serif';g.textBaseline='middle';
    if(xb<0){g.textAlign='left';g.fillText('◀ stream at '+fmt(lv[0].time)+' (G)',8,TB-14)}
    else if(xa>w){g.textAlign='right';g.fillText('stream at '+fmt(lv[0].time)+' (G) ▶',w-8,TB-14)}}
  g.fillStyle=mute;g.font='600 12px system-ui,sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText('1/'+snap,8,8);
  if(st.tm==='tsel'&&st.tsel&&st.tsel.moved){var rx=Math.min(st.tsel.x0,st.tsel.x1),rw=Math.abs(st.tsel.x1-st.tsel.x0);g.globalAlpha=.14;g.fillStyle=acc;g.fillRect(rx,2,rw,TB-2);g.globalAlpha=.7;g.strokeStyle=acc;g.lineWidth=1;g.strokeRect(rx+.5,2.5,rw,TB-3);g.globalAlpha=1}
  var ml=st.map.all,ly=SVY;
  g.textBaseline='middle';g.font='10px system-ui,sans-serif';g.textAlign='left';g.fillStyle=mute;g.globalAlpha=.8;g.fillText('SV (Ctrl+click to add)',8,ly);g.globalAlpha=1;
  ml.forEach(function(q,i){var x=tx(q.t);if(x<-20||x>w+20)return;
    if(q.uninh){g.fillStyle='#e8485a';g.fillRect(Math.round(x)-1,ly-6,2,12);return}
    var sl=st.svSel===q;g.beginPath();g.moveTo(x,ly-6);g.lineTo(x+5,ly);g.lineTo(x,ly+6);g.lineTo(x-5,ly);g.closePath();g.fillStyle=sl?acc:'#3fbf6a';g.fill();
    if(q.u||q.sv!==q.sv0){g.strokeStyle=txt;g.lineWidth=1;g.stroke()}
    var nx=i+1<ml.length?tx(ml[i+1].t):1e9;if(nx-x>46){g.fillStyle=sl?acc:'#3fbf6a';g.textAlign='left';g.fillText(q.sv.toFixed(2)+'x',x+8,ly)}});
  playhead(g,h);
}

function songDur(){
  var m=st.map,d=0;
  if(m.objs.length)d=m.objs[m.objs.length-1].end;
  if(m.all.length)d=Math.max(d,m.all[m.all.length-1].t);
  d+=2000;
  if(st.audio&&isFinite(st.audio.duration))d=Math.max(d,st.audio.duration*1000);
  if(st.wave)d=Math.max(d,st.wave.length*10);
  return d}
function drawBottom(){
  var f=fit(tl),g=f.g,w=f.w,h=f.h,acc=col['--accent'],mute=col['--mute'],txt=col['--text'],line=col['--line'];
  if(!st.map){msg(g,w,h,'Timeline appears after you import a map');return}
  var m=st.map,all=m.all,WT=90,dur=songDur(),k=(w-2)/dur,BX=function(t){return t*k};
  st.bk=k;st.dur=dur;
  /* waveform: whole song, peaks cached per width */
  if(st.wave){
    if(!st.wpk||st.wpkW!==w||st.wpkD!==dur||st.wpkS!==st.wave){
      var pk=new Float32Array(Math.ceil(w));
      for(var x=0;x<pk.length;x++){var a=Math.floor(x/k/10),b=Math.max(a,Math.floor((x+1)/k/10)),mx=0;
        for(var i=a;i<=b&&i<st.wave.length;i++)if(st.wave[i]>mx)mx=st.wave[i];pk[x]=mx}
      st.wpk=pk;st.wpkW=w;st.wpkD=dur;st.wpkS=st.wave}
    var cy=(WT+h)/2,half=(h-WT)/2-2;g.fillStyle=mute;g.globalAlpha=.35;
    for(var x2=0;x2<st.wpk.length;x2++){var hh=Math.min(1,st.wpk[x2]*1.2)*half;g.fillRect(x2,cy-hh,1,hh*2)}
    g.globalAlpha=1}
  /* ruler */
  var iv=[1000,2000,5000,10000,15000,30000,60000,120000,300000,600000],step=600000;
  for(var q=0;q<iv.length;q++)if(iv[q]*k>=96){step=iv[q];break}
  g.textAlign='left';g.textBaseline='top';g.font='11px ui-monospace,Consolas,monospace';g.fillStyle=mute;g.strokeStyle=line;g.lineWidth=1;
  for(var t=0;t<=dur;t+=step){var x3=Math.round(BX(t))+.5;g.beginPath();g.moveTo(x3,0);g.lineTo(x3,14);g.stroke();g.fillText(fmt(t),x3+3,2)}
  /* SV graph (inherited points; red lines reset to 1.0x) */
  var svY=function(v){return 86-cl((Math.log(v)/Math.LN2+2)/4,0,1)*32};
  g.strokeStyle=line;g.beginPath();g.moveTo(0,svY(1)+.5);g.lineTo(w,svY(1)+.5);g.stroke();
  var cur=1;g.strokeStyle='#3fbf6a';g.lineWidth=1.5;g.beginPath();g.moveTo(0,svY(cur));
  for(var j=0;j<all.length;j++){var xx=BX(all[j].t);g.lineTo(xx,svY(cur));cur=all[j].sv;g.lineTo(xx,svY(cur))}
  g.lineTo(w,svY(cur));g.stroke();
  /* timing points and kiai */
  for(var p2=0;p2<all.length;p2++){
    var p=all[p2],x=BX(p.t),nx=p2+1<all.length?BX(all[p2+1].t):BX(dur);
    if(p.kiai){g.fillStyle='#f0a030';g.fillRect(x,17,Math.max(1,nx-x),3)}
    var c=p.uninh?'#e8485a':'#3fbf6a';g.strokeStyle=c;g.lineWidth=p.uninh?2:1;g.beginPath();g.moveTo(Math.round(x)+.5,20);g.lineTo(Math.round(x)+.5,p.uninh?48:36);g.stroke();
    if(nx-x>56){g.fillStyle=c;g.font='10px system-ui,sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText(p.uninh?(60000/p.beat).toFixed(1)+' BPM':p.sv.toFixed(2)+'x',x+4,24)}
  }
  /* bookmarks */
  g.fillStyle='#4aa3ff';g.strokeStyle='#4aa3ff';g.lineWidth=1;
  m.bm.forEach(function(t){var x=BX(t);g.beginPath();g.moveTo(Math.round(x)+.5,16);g.lineTo(Math.round(x)+.5,h);g.stroke();g.fillRect(Math.round(x),16,8,8)});
  /* objects and stream */
  g.fillStyle=mute;g.globalAlpha=.7;
  for(var oi=0;oi<m.objs.length;oi++)g.fillRect(Math.round(BX(m.objs[oi].time)),h-14,1,6);
  g.globalAlpha=1;g.fillStyle=acc;
  st.live.forEach(function(c){g.fillRect(Math.round(BX(c.time)),h-8,2,6)});
  g.fillStyle=mute;g.font='10px system-ui,sans-serif';g.textAlign='left';g.textBaseline='top';g.fillText('timing',4,32);g.fillText('SV',4,56);
  /* window of the top timeline */
  /* playhead */
  var px=Math.round(BX(st.ph))+.5;g.strokeStyle=txt;g.fillStyle=txt;g.lineWidth=1.5;
  g.beginPath();g.moveTo(px,0);g.lineTo(px,h);g.stroke();
  g.beginPath();g.moveTo(px-5,0);g.lineTo(px+5,0);g.lineTo(px,7);g.fill();
}function tlXY(c,e){var r=c.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
function seekTarget(dir,from){
  var tp=tpAt(from),s=tp.beat/(+$('snap').value),k=(from-tp.t)/s,nk=dir>0?Math.floor(k+1e-6)+1:Math.ceil(k-1e-6)-1;
  return Math.max(0,tp.t+nk*s)}
function seekAnim(){var a=st.sa;if(!a)return;var u=Math.min(1,(performance.now()-a.t0)/300),e=1-Math.pow(1-u,5);st.ph=a.from+(a.to-a.from)*e;center();draw();if(u<1)requestAnimationFrame(seekAnim);else st.sa=null}
function seek(dir){
  var from=st.sa?st.sa.to:st.ph,to=seekTarget(dir,from);
  if(Math.abs(to-st.ph)>5000||st.playing){st.sa=null;st.ph=to;center();draw();return}
  var run=!!st.sa;st.sa={from:st.ph,to:to,t0:performance.now()};if(!run)requestAnimationFrame(seekAnim)}
function seekFree(dir){st.sa=null;st.ph=cl(st.ph+dir*500,0,st.dur||1e9);center();draw()}
function seekClass(dir){
  st.sa=null;var tp=tpAt(st.ph),sn=+$('snap').value,s=tp.beat/sn,k=Math.round((st.ph-tp.t)/s);
  var cls=function(q){var r=((q%sn)+sn)%sn;return sn/gcd(r,sn)},c0=cls(k),q=k;
  for(var i=0;i<=sn;i++){q+=dir;if(cls(q)===c0)break}
  st.ph=Math.max(0,tp.t+q*s);center();draw()}
var wacc={t:0,s:0,j:0,nd:0,ds:0,fx:0},SNAPS=[1,2,3,4,6,8,12,16];
function wsteps(d,k){
  if(Math.abs(d)>=40){wacc[k]=0;return d>0?1:-1}
  wacc[k]+=d;if(Math.abs(wacc[k])>=100){var s=wacc[k]>0?1:-1;wacc[k]=0;return s}return 0}
/* timeline zoom, like lazer: 1.0x = 6 s visible, range 0.6x (10 s) to 12x (0.5 s), eased over 200 ms (OutQuint) */
var ZV_MIN=500,ZV_MAX=10000,ZV_DEF=6000;
function tzDef(){return(tt.clientWidth||800)/ZV_DEF}
function zoomUi(){var z=(st.tzT||st.tz)/tzDef();$('tzv').textContent=(z<10?z.toFixed(2):z.toFixed(1)).replace(/(\.\d)0$/,'$1')+'x'}
function zoomTo(t,now){var w=tt.clientWidth||800,lo=w/ZV_MAX,hi=w/ZV_MIN;st.tzT=cl(t,lo,hi);zoomUi();
  if(now){st.tz=st.tzT;st.tzA=null;center();draw();return}
  st.tzA={t0:performance.now(),from:st.tz};if(!st.tzRun){st.tzRun=true;requestAnimationFrame(zoomTick)}}
function zoomTick(){var A=st.tzA;if(!A){st.tzRun=false;return}var k=Math.min(1,(performance.now()-A.t0)/200),e=1-Math.pow(1-k,5);
  st.tz=A.from+(st.tzT-A.from)*e;center();draw();if(k<1)requestAnimationFrame(zoomTick);else{st.tzA=null;st.tzRun=false}}
function onWheel(e){
  if(!st.map)return;e.preventDefault();
  var d=e.deltaY||e.deltaX;if(!d)return;
  if(e.deltaMode===1)d*=33;else if(e.deltaMode===2)d*=400;
  if(st.bd){st.bd.hw=cl(st.bd.hw*Math.pow(1.0015,-d),st.bd.L*.08,st.bd.L*3);toast('Bend width '+Math.round(st.bd.hw/st.bd.L*100)+'%');bendApply(st.bd.m);return}
  if(!e.altKey&&st.nd&&st.nd.b){var nc2=wsteps(d,'nd');if(nc2){var nn=st.nd;nn.n=cl((nn.fixed?nn.n:nn.cnt)-nc2,nn.ext?1:2,500);nn.fixed=true;nn.show=true;ndApply();draw()}return}
  if(e.altKey){
    if(e.currentTarget===tt){zoomTo((st.tzT||st.tz)*Math.pow(1.25,-cl(d,-150,150)/100));return}
    var sd=wsteps(d,'ds');if(sd){st.ds=cl(Math.round((st.ds-sd*.05)*100)/100,.05,10);
      if(st.nd&&st.nd.b)ndApply();else if(!st.nd&&!st.dw)applyDS();draw()}
    return}
  if(e.ctrlKey||e.metaKey){var ns=wsteps(d,'s');if(ns){var ix=cl(SNAPS.indexOf(+$('snap').value)-ns,0,SNAPS.length-1);$('snap').value=SNAPS[ix];checkpoint();draw()}return}
  if(e.shiftKey){var nj=wsteps(d,'j');if(nj){seekClass(nj);reseek()}return}
  var n=wsteps(d,'t');if(n){if(st.playing){seekFree(n);reseek()}else seek(n)}}/* ---- circle selection, top timeline interaction ---- */
function svHit(p){var best=null,bd=1e9;st.map.all.forEach(function(q){if(q.uninh)return;var dx=Math.abs(tx(q.t)-p.x);if(dx<=8&&Math.abs(p.y-SVY)<=10&&dx<bd){bd=dx;best=q}});return best}
var svm=$('svmenu'),svr=$('svRange'),svn=$('svNum');
function openSv(e,q){st.svSel=q;$('svT').textContent=fmt(q.t);$('svInh').textContent=svBefore(q).toFixed(2)+'x';svn.value=q.sv.toFixed(2);svr.value=q.sv;
  $('svDel').textContent=q.u?'Delete point':'Reset to original';
  svm.style.left=Math.max(8,Math.min(e.clientX+10,innerWidth-250))+'px';svm.style.top=Math.min(e.clientY+22,innerHeight-230)+'px';svm.style.display='block'}
function setSv(v){var q=st.svSel;if(!q)return;v=cl(+(+v).toFixed(2),.01,10);q.sv=v;q.beat=-100/v;if(q.raw)q.raw[1]=String(q.beat);svr.value=v;if(document.activeElement!==svn)svn.value=v.toFixed(2);recSliders();draw()}
svr.addEventListener('input',function(){var stp=st.ctrl?.01:.05,v=Math.round(+svr.value/stp)*stp;setSv(v)});
var svb=null;
function svVal(e,ctrl){var rc=svr.getBoundingClientRect(),mn=+svr.min,mx=+svr.max,pad=8,w=Math.max(1,rc.width-pad*2);
  if(!ctrl)return mn+cl((e.clientX-rc.left-pad)/w,0,1)*(mx-mn);
  return svb.v+(e.clientX-svb.x)/w*(mx-mn)*.05}
svr.addEventListener('pointerdown',function(e){if(e.button!==0)return;e.preventDefault();svr.focus();svr.setPointerCapture(e.pointerId);var c=e.ctrlKey||e.metaKey;st.ctrl=c;svb={x:e.clientX,v:+svr.value,c:c};
  if(!c){var v=Math.round(svVal(e,false)/.05)*.05;setSv(v);svb.v=v}});
svr.addEventListener('pointermove',function(e){if(!svb)return;var c=e.ctrlKey||e.metaKey;st.ctrl=c;
  if(c!==svb.c){svb={x:e.clientX,v:+svr.value,c:c}}
  var stp=c?.01:.05,v=Math.round(svVal(e,c)/stp)*stp;setSv(cl(v,+svr.min,+svr.max))});
svr.addEventListener('pointerup',function(){if(svb){svb=null;checkpoint()}});
svn.addEventListener('input',function(){if(svn.value!=='')setSv(svn.value)});
svn.addEventListener('change',function(){setSv(svn.value||1);svn.value=st.svSel?st.svSel.sv.toFixed(2):'';checkpoint()});
svr.addEventListener('change',function(){checkpoint()});
$('svOk').onclick=function(){svm.style.display='none';st.svSel=null;checkpoint();draw()};
$('svDel').onclick=function(){var q=st.svSel;if(q){if(q.u)st.map.all=st.map.all.filter(function(z){return z!==q});else setSv(q.sv0)}svm.style.display='none';st.svSel=null;recSliders();checkpoint();draw()};
window.addEventListener('keydown',function(e){st.ctrl=e.ctrlKey||e.metaKey;st.shift=e.shiftKey;if(st.map&&st.tool==='add'&&e.key==='Shift'){aimUpdate();draw()}},true);window.addEventListener('keyup',function(e){st.ctrl=e.ctrlKey||e.metaKey;st.shift=e.shiftKey;if(st.map&&st.tool==='add'&&e.key==='Shift'){aimUpdate();draw()}},true);
document.addEventListener('pointerdown',function(e){if(!svm.contains(e.target)&&svm.style.display==='block'){svm.style.display='none';st.svSel=null;draw()}},true);
function tlHit(p){
  var best=null,bd=1e9,i,L=st.live;
  for(i=0;i<L.length;i++){var c=L[i],dx=Math.abs(tx(c.time)-p.x);if(dx<=TRc&&Math.abs(p.y-MID)<=TRc&&dx<bd){bd=dx;best=c.b+':'+c.i}}
  if(best)return best;
  var objs=st.map.objs,hiT=ta(p.x+TRc+2);
  for(i=lb(objs,ta(p.x-TRc-2));i<objs.length&&objs[i].time<=hiT;i++)if(Math.abs(tx(objs[i].time)-p.x)<=TRc&&Math.abs(p.y-MID)<=TRc)return 'o:'+i;
  /* a slider is also grabbed by its bar */
  if(Math.abs(p.y-MID)<=TRc){var bk=null;for(i=lb(objs,ta(p.x-TRc-2)-(st.map.maxDur||0));i<objs.length&&objs[i].time<=hiT;i++){var ob=objs[i];if(ob.sl&&tx(ob.end)+TRc>=p.x&&tx(ob.time)-TRc<=p.x)bk='o:'+i}if(bk)return bk}
  return null}
function tlTail(k,x){var o=st.map.objs[parseKey(k).i];return !!(o&&o.sl&&Math.abs(tx(o.end)-x)<=TRc*1.3&&x-tx(o.time)>TRc)}
function pickKey(k,e){
  var ctrl=e.ctrlKey||e.metaKey,sh=e.shiftKey,a=parseKey(k),ix;
  if(sh&&!ctrl){
    var c0=st.canc?parseKey(st.canc):null;
    if(c0&&!!c0.o===!!a.o&&st.canc!==k){
      var r=[],i;
      if(a.o){var lo=Math.min(c0.i,a.i),hi2=Math.max(c0.i,a.i);for(i=lo;i<=hi2;i++)r.push('o:'+i)}
      else{var L=st.live,i1=-1,i2=-1;for(i=0;i<L.length;i++){var kk=L[i].b+':'+L[i].i;if(kk===st.canc)i1=i;if(kk===k)i2=i}
        if(i1<0||i2<0)r=[k];else for(i=Math.min(i1,i2);i<=Math.max(i1,i2);i++)r.push(L[i].b+':'+L[i].i)}
      st.csel=r}
    else{st.csel=[k];st.canc=k}
  }else if(ctrl){ix=st.csel.indexOf(k);if(ix>=0)st.csel.splice(ix,1);else st.csel.push(k);st.canc=k}
  else{if(st.csel.indexOf(k)<0)st.csel=[k];st.canc=k}
  if(!a.o){st.ab=a.b;st.sel=[];syncPanel()}
}
function comboSel(k){var q=circleOf(k);if(!q||q.ci==null)return;var r=[],bs={};
  st.map.objs.forEach(function(o,i){if(o.ci===q.ci)r.push('o:'+i)});
  st.live.forEach(function(c){if(c.ci===q.ci){r.push(c.b+':'+c.i);bs[c.b]=1}});
  st.csel=r;st.canc=k;var il=Object.keys(bs);if(il.length===1&&!r.some(function(x){return x[0]==='o'})){st.ab=+il[0];st.sel=[];syncPanel()}else{st.ab=null}}
function regTan(t,x,y){var pv=null;st.map.objs.forEach(function(o){if(o.time<t&&(!pv||o.time>pv.time))pv=o});
  (st.live||[]).forEach(function(c){if(c.time<t&&(!pv||c.time>pv.time))pv=c});
  if(!pv)return null;var dx=x-pv.x,dy=y-pv.y,d=Math.hypot(dx,dy);return d>4?{x:dx/d,y:dy/d}:null}
function modStyle(ctrl,sh){return ctrl&&sh?'bez':(ctrl?'line':(sh?'arc':undefined))}
function isLastOf(k){var a=parseKey(k);if(a.o)return false;var B=bodyById(a.b);if(!B)return false;var li=-1;B.circles.forEach(function(c){if(!c.del)li=c.i});return a.i===li}
function countForTick(B,target){
  if(!B.ticks)return target+1;
  var t=B.ticks,c=0;while(c<t.length&&t[c]<=target)c++;
  if(target>t[t.length-1])c=t.length+(target-t[t.length-1]);
  return c}
function makeStream(a,b){
  if(b<a){var t=a;a=b;b=t}
  var sn=+$('snap').value,s=tpAt(a).beat/sn,n=Math.min(500,Math.round((b-a)/s)+1);
  if(n<2)return;
  var len=Math.min(400,(n-1)*st.radius*1.8),y=H/2+((st.bodies.length%5)-2)*55,
      B=newBody({start:a,count:n,snap:sn,bias:+$('bias').value,nc:+$('nc').value||0});
  B.pos=[];for(var q=0;q<n;q++)B.pos.push({x:W/2-len/2+len*q/Math.max(1,n-1),y:y});
  st.bodies.push(B);st.ab=B.id;st.csel=[];st.sel=[];st.key='';syncPanel()}
tt.addEventListener('pointerdown',function(e){
  if(!st.map||e.button!==0)return;
  var p=tlXY(tt,e),t=ta(p.x),ctrl=e.ctrlKey||e.metaKey;stopPlay();
  if(p.y>=TB+8){
    var sh0=svHit(p);
    if(sh0){openSv(e,sh0);st.tm='svpend';st.px=p.x;tt.setPointerCapture(e.pointerId);draw();return}
    if(ctrl&&!e.shiftKey){var nt=Math.max(0,snapT(t)),ex=null;st.map.all.forEach(function(q){if(!q.uninh&&q.t===nt)ex=q});
      var np=ex||newSvPoint(nt,svAt(nt));recSliders();openSv(e,np);tt.setPointerCapture(e.pointerId);checkpoint();draw();return}
  }
  if(ctrl&&e.shiftKey){st.tm='range';var a=snapT(t);st.rng={a:a,b:a}}
  else{
    var k=tlHit(p);
    if(!k){st.tm='tsel';st.tsel={x0:p.x,x1:p.x,base:(ctrl||e.shiftKey)?st.csel.slice():[],moved:false};if(!e.shiftKey&&!ctrl){st.csel=[];st.sel=[];st.ab=null}}
    else if(e.shiftKey&&!ctrl&&!isLastOf(k)&&!(k[0]==='o'&&tlTail(k,p.x))){comboSel(k);st.tm='csel'}
    else if(e.shiftKey&&!ctrl&&isLastOf(k)){st.tm='pres';st.px=p.x;st.pk=k}
    else if(k[0]==='o'&&!e.shiftKey&&!ctrl&&tlTail(k,p.x)){st.tm='slrep';st.slt=st.map.objs[parseKey(k).i];st.csel=[k];st.canc=k;st.ab=null;st.sel=[]}
    else if(k[0]==='o'&&e.shiftKey&&!ctrl&&tlTail(k,p.x)){st.tm='sltail';st.slt=st.map.objs[parseKey(k).i];st.csel=[k];st.canc=k;st.ab=null;st.sel=[]}
    else if(k[0]==='o'){
      var had0=st.csel.indexOf(k)>=0&&st.csel.length>1&&!e.shiftKey&&!ctrl;
      pickKey(k,e);if(!e.shiftKey&&!ctrl){st.tm='pend';st.px=p.x;st.t0=t;st.pk=k;st.single=had0}}
    else{
      var cc=circleOf(k);
      if(ctrl||e.shiftKey){if(cc)selClick(cc,ctrl,e.shiftKey)}
      else{var had=st.csel.indexOf(k)>=0&&st.csel.length>1;if(st.csel.indexOf(k)<0&&cc)selClick(cc,false,false);
        st.tm='pend';st.px=p.x;st.t0=t;st.pk=k;st.single=had}}}
  tt.setPointerCapture(e.pointerId);draw();
});
tt.addEventListener('pointermove',function(e){
  if(!st.tm)return;var p=tlXY(tt,e),t=ta(p.x);
  if(st.tm==='svpend'&&Math.abs(p.x-st.px)>4&&st.svSel&&st.svSel.u)st.tm='svmove';
  if(st.tm==='svmove'&&st.svSel){st.svSel.t=Math.max(0,snapT(t));st.svSel.raw[0]=String(st.svSel.t);st.map.all.sort(function(a,b){return a.t-b.t});recSliders();$('svT').textContent=fmt(st.svSel.t)}
  if(st.tm==='tsel'&&st.tsel){st.tsel.x1=p.x;if(Math.abs(p.x-st.tsel.x0)>3)st.tsel.moved=true;
    if(st.tsel.moved){var lo0=Math.min(st.tsel.x0,p.x)-TRc,hi0=Math.max(st.tsel.x0,p.x)+TRc,sl=st.tsel.base.slice();
      st.live.forEach(function(c){var xx=tx(c.time),kk=c.b+':'+c.i;if(xx>=lo0&&xx<=hi0&&sl.indexOf(kk)<0)sl.push(kk)});
      var oo=st.map.objs;for(var oi2=lb(oo,ta(lo0));oi2<oo.length&&oo[oi2].time<=ta(hi0);oi2++){var ko='o:'+oi2;if(sl.indexOf(ko)<0)sl.push(ko)}
      st.csel=sl}}
  if(st.tm==='slrep'&&st.slt){var sr=st.slt,sq=sr.sl,tpr=tpAt(sr.time),velr=100*st.map.sm*svAt(sr.time),spn=sq.len/velr*tpr.beat,nr=cl(Math.round((t-sr.time)/spn),1,100);
    if(nr!==sq.slides){sq.slides=nr;slRepath(sr,true);$('mObjs').textContent=st.map.objs.length}}
  if(st.tm==='sltail'&&st.slt){var so=st.slt,ss=so.sl,tp=tpAt(so.time),vel=100*st.map.sm*svAt(so.time);
    ss.len=slSnapLen(so.time,Math.max(4,(snapT(t)-so.time)/tp.beat*vel/ss.slides),ss.slides);slRepath(so,true);$('mObjs').textContent=st.map.objs.length}
  if(st.tm==='range')st.rng.b=snapT(t);
  if(st.tm==='pres'&&Math.abs(p.x-st.px)>3)st.tm='resize';
  if(st.tm==='resize'){
    var a=parseKey(st.pk),B=bodyById(a.b);
    if(B){var nc=cl(countForTick(B,Math.round((t-B.start)/B.step)),2,500);
      st.rs={b:B.id,nc:nc};
      if(nc>B.count){B.count=nc;if(st.ab===B.id)$('count').value=nc}}}
  if(st.tm==='pend'&&Math.abs(p.x-st.px)>4){
    build();var okeys=st.csel.filter(function(k){return k[0]==='o'}),orefs=okeys.map(function(k){return st.map.objs[parseKey(k).i]}).filter(Boolean);
    var bs=splitSelection();st.csel=st.csel.concat(okeys);
    st.td={t0:st.t0,items:bs.map(function(B){return{B:B,s0:B.start}}),os:orefs.map(function(o){return{o:o,s0:o.time}})};st.tm='move'}
  if(st.tm==='move'&&st.td&&(st.td.items.length||st.td.os.length)){
    var d=st.td,r0=d.items.length?d.items[0].s0:d.os[0].s0,mn=1e18;
    d.items.forEach(function(x){mn=Math.min(mn,x.s0)});d.os.forEach(function(x){mn=Math.min(mn,x.s0)});
    var sh=Math.max(snapT(r0+(t-d.t0))-r0,-mn);
    d.items.forEach(function(x){x.B.start=x.s0+sh});
    if(d.os.length){d.os.forEach(function(x){x.o.time=x.s0+sh;x.o.mod=true});objsChanged();reselObjs(d.os.map(function(x){return x.o}))}
    if(AB())setStart(AB().start)}
  draw();
});
tt.addEventListener('pointerup',function(){
  if(st.tm==='tsel'&&st.tsel){if(st.tsel.moved){var ids={};st.csel.forEach(function(k){var q=parseKey(k);if(!q.o)ids[q.b]=1});var il=Object.keys(ids);if(il.length===1){st.ab=+il[0];st.sel=[];syncPanel()}}st.tsel=null}
  if(st.rs){var RB=bodyById(st.rs.b),rn=st.rs.nc;st.rs=null;if(RB&&rn>=RB.count)overrideOthers(RB);if(RB&&rn<RB.count){build();RB.count=rn;if(st.ab===RB.id)$('count').value=rn;overrideOthers(RB);st.csel=st.csel.filter(function(k){var q=parseKey(k);return q.o||q.b!==RB.id||q.i<rn})}}
  if(st.tm==='range'&&st.rng)makeStream(st.rng.a,st.rng.b);
  else if(st.tm==='pres'){comboSel(st.pk)}
  else if(st.tm==='pend'&&st.single){st.csel=[st.pk];var pq=parseKey(st.pk);if(!pq.o){st.ab=pq.b;st.canc=st.pk;syncPanel()}}
  if(st.tm==='move'&&st.td){st.td.items.forEach(function(it){overrideOthers(it.B)});
    if(st.td.os.length){var mo=st.td.os.map(function(x){return x.o});if(ovrObjs(mo))objsChanged();reselObjs(mo)}}
  st.rng=null;st.tm=null;st.td=null;checkpoint();draw();
});

function seekX(e){st.sa=null;var x=tlXY(tl,e).x;st.ph=cl(x/(st.bk||1),0,st.dur||1e9);center();reseek()}
tl.addEventListener('pointerdown',function(e){
  e.preventDefault();
  if(!st.map||e.button!==0)return;
  st.tm='scrub';seekX(e);tl.setPointerCapture(e.pointerId);draw();
});
tl.addEventListener('pointermove',function(e){if(st.tm!=='scrub')return;seekX(e);draw()});
tl.addEventListener('pointerup',function(){st.tm=null;draw()});
[tt,cv].forEach(function(c){c.addEventListener('wheel',onWheel,{passive:false})});
tl.addEventListener('wheel',function(e){e.preventDefault()},{passive:false});
['gesturestart','gesturechange','gestureend','dblclick'].forEach(function(n){tl.addEventListener(n,function(e){e.preventDefault()})});
tl.addEventListener('touchstart',function(e){e.preventDefault()},{passive:false});
tl.addEventListener('touchmove',function(e){e.preventDefault()},{passive:false});function pos(e){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*(W+2*M)-M,y:(e.clientY-r.top)/r.height*(H+2*M)-M}}
