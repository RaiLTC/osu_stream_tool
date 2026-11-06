/* ---- import ---- */
function loadAudio(f){
  stopPlay();if(st.audio){st.audio.pause();URL.revokeObjectURL(st.audio.src)}
  var a=new Audio(URL.createObjectURL(f));a.preservesPitch=true;a.playbackRate=+$('rate').value;a.onended=function(){draw()};a.volume=cl(+$('vol').value/100,0,1);
  st.audio=a;st.audioFile=f;st.wave=null;$('mAud').textContent=f.name;
  f.arrayBuffer().then(function(b){var AC=window.AudioContext||window.webkitAudioContext;return new AC().decodeAudioData(b)}).then(function(buf){
    var d=buf.getChannelData(0),bs=Math.max(1,Math.round(buf.sampleRate*.01)),n=Math.floor(d.length/bs),p=new Float32Array(n);
    for(var i=0;i<n;i++){var mx=0;for(var j=i*bs,e=j+bs;j<e;j++){var v=Math.abs(d[j]);if(v>mx)mx=v}p[i]=mx}
    st.wave=p;draw();
  }).catch(function(){});
}
/* a perfect curve that is longer than its 3 points keeps following the same circle (up to one full turn) */
function arcLen(s,len){var c=circ3(s[0],s[1],s[2]);if(!c)return null;
  var T=2*Math.PI,a=s[0],t0=Math.atan2(a.y-c.y,a.x-c.x),t1=Math.atan2(s[1].y-c.y,s[1].x-c.x),t2=Math.atan2(s[2].y-c.y,s[2].x-c.x),n=function(x){return((x%T)+T)%T},
      d1=n(t1-t0),d2=n(t2-t0),sw=d1<d2?d2:d2-T;
  if(len<=Math.abs(sw)*c.r+.01)return null;
  var sw2=(sw<0?-1:1)*Math.min(len/c.r,T),N=cl(Math.ceil(Math.abs(sw2)*c.r/3),8,400),out=[];
  for(var i=0;i<=N;i++){var t=t0+sw2*i/N;out.push({x:c.x+c.r*Math.cos(t),y:c.y+c.r*Math.sin(t)})}
  return out}
/* segments of a slider, as lazer: the first one has the slider's type, every anchor with its own .type starts a new one (a duplicate "red" anchor never does) */
function slRanges(tn,pts){var n=pts.length,r=[],i=0;
  while(i<n-1){var j=i+1;while(j<n-1&&!(pts[j]!==pts[j-1]&&pts[j].type))j++;r.push({a:i,b:j,ty:i===0?tn:(pts[i].type||'bezier')});i=j}
  return r}
function plLen(a){var d=0,i;for(i=1;i<a.length;i++)d+=Math.hypot(a[i].x-a[i-1].x,a[i].y-a[i-1].y);return d}
function slRaw(tn,pts,len){
  if(pts.length<2)return[pts[0]];
  var rg=slRanges(tn,pts),raw=[];
  rg.forEach(function(r,k){var sub=pts.slice(r.a,r.b+1),pp=null;
    if(r.ty==='perfect'&&sub.length===3&&len&&k===rg.length-1)pp=arcLen(sub,len-plLen(raw));
    var seg=pp||segPts(r.ty,sub);raw=raw.concat(k?seg.slice(1):seg)});
  return raw}
function slPath(tn,pts,len){
  var raw=slRaw(tn,pts,len),path=[raw[0]],cum=[0];
  for(var k=1;k<raw.length;k++){
    var a=path[path.length-1],b=raw[k],d=Math.hypot(b.x-a.x,b.y-a.y),tot=cum[cum.length-1];
    if(d===0)continue;
    if(len&&tot+d>=len){var f=(len-tot)/d;path.push({x:a.x+(b.x-a.x)*f,y:a.y+(b.y-a.y)*f});cum.push(len);break}
    path.push(b);cum.push(tot+d)}
  if(len&&path.length>1&&cum[cum.length-1]<len-.5){
    var a2=path[path.length-2],b2=path[path.length-1],dd=cum[cum.length-1]-cum[cum.length-2]||1,r=len-cum[cum.length-1];
    path.push({x:b2.x+(b2.x-a2.x)/dd*r,y:b2.y+(b2.y-a2.y)/dd*r});cum.push(len)}
  return{path:path,cum:cum,len:len||cum[cum.length-1]}}
function mkSlider(h,x,y){
  var TY={B:'bezier',L:'linear',P:'perfect',C:'catmull'},cs=h[5].split('|'),tn=TY[cs[0]]||'bezier',head={x:x,y:y},pts=[head],prev=head,pend=null;
  for(var i=1;i<cs.length;i++){
    if(/^[A-Za-z]$/.test(cs[i])){pend=TY[cs[i]]||'bezier';continue} /* lazer writes a type letter in front of the anchor that starts a new segment */
    var xy=cs[i].split(':'),nx=+xy[0],ny=+xy[1];
    if(nx===prev.x&&ny===prev.y)pts.push(prev);else{prev={x:nx,y:ny};if(pend&&i<cs.length-1)prev.type=pend;pts.push(prev)}pend=null}
  var r=slPath(tn,pts,+h[7]||0);
  return{type:tn,pts:pts,path:r.path,cum:r.cum,len:r.len,slides:Math.max(1,+h[6]||1)}}
function cpt(o){return{oid:o.oid==null?null:o.oid,x:o.x,y:o.y,time:o.time,nc:!!o.nc,raw:o.raw||null,hs:o.hs,skip:o.skip||0,mod:!!o.mod,user:!!o.user,tail:o.tail||null,ts:o.tailSlides||0,
  sl:o.sl?{type:o.sl.type,pts:o.sl.pts.map(function(p,i){return i&&p.type&&p!==o.sl.pts[i-1]?[p.x,p.y,p.type]:[p.x,p.y]}),len:o.sl.len,slides:o.sl.slides}:null}}
function xpt(c){var o={oid:c.oid,x:c.x,y:c.y,time:c.time,nc:c.nc,raw:c.raw,hs:c.hs,skip:c.skip,mod:c.mod,user:c.user,tail:c.tail,tailSlides:c.ts,num:1,end:c.time};
  if(c.sl){var pts=[],prev=null;c.sl.pts.forEach(function(q,i){if(i&&prev&&q[0]===prev.x&&q[1]===prev.y)pts.push(prev);else{prev={x:q[0],y:q[1]};if(i&&q[2])prev.type=q[2];pts.push(prev)}});
    var r=slPath(c.sl.type,pts,c.sl.len);o.sl={type:c.sl.type,pts:pts,path:r.path,cum:r.cum,len:r.len,slides:c.sl.slides}}
  return o}
function sortObjs(){st.map.objs.sort(function(a,b){return a.time-b.time})}
/* combo numbers and colours run over the whole map: placed objects and stream circles in one time-ordered sequence */
function renumber(){var m=st.map;if(!m)return;var L=[];
  m.objs.forEach(function(o){L.push({t:o.time,s:0,x:o})});(st.live||[]).forEach(function(c){L.push({t:c.time,s:1,x:c})});
  L.sort(function(a,b){return a.t-b.t||a.s-b.s});
  var sp=m.spin||[],si=0,num=0,first=true,ci=0;
  L.forEach(function(q){var o=q.x,reset=first,sk=q.s?0:((o.skip>>4)&7);
    while(si<sp.length&&sp[si].time<=o.time){reset=true;si++}
    if(o.nc)reset=true;if(first)ci=sk;else if(reset)ci+=1+sk;first=false;num=reset?1:num+1;o.num=num;o.ci=ci})}
function prevCombo(t){var pv=null,i;for(i=0;i<st.map.objs.length&&st.map.objs[i].time<=t;i++)pv=st.map.objs[i];
  (st.live||[]).forEach(function(c){if(c.time<=t&&(!pv||c.time>=pv.time))pv=c});return pv}
function objsChanged(){var m=st.map;sortObjs();recSliders();renumber();$('mObjs').textContent=m.objs.length;st.key='';st.fresh=null}
function objsCap(){var m=st.map;if(!m||!m.base)return null;var pres={},u=[],g=[];
  m.objs.forEach(function(o){if(o.oid!=null)pres[o.oid]=1;if(o.mod||o.user)u.push(cpt(o))});
  Object.keys(m.base).forEach(function(k){if(!pres[k])g.push(+k)});return{u:u,g:g}}
function restoreObjs(ob){var m=st.map;if(!m||!m.base||!ob)return;
  var gone={},ed={},arr=[];ob.g.forEach(function(i){gone[i]=1});ob.u.forEach(function(c){if(c.oid!=null)ed[c.oid]=1});
  Object.keys(m.base).forEach(function(k){k=+k;if(!gone[k]&&!ed[k])arr.push(xpt(m.base[k]))});
  ob.u.forEach(function(c){arr.push(xpt(c))});m.objs=arr;objsChanged()}
function objLine(o){var x=Math.round(o.x),y=Math.round(o.y),ty=(o.sl?2:1)|(o.nc?4:0)|(o.skip||0),hs=o.hs==null?'0':o.hs,t=Math.round(o.time);
  if(!o.sl)return [x,y,t,ty,hs,o.tail||'0:0:0:0:'].join(',');
  var sl=o.sl,LT={bezier:'B',linear:'L',perfect:'P',catmull:'C'},rg=slRanges(sl.type,sl.pts),tyc=sl.type,i,cur;
  if(tyc==='perfect'&&rg[0]&&rg[0].b-rg[0].a+1!==3)tyc='bezier';cur=tyc;
  var cp=[LT[tyc]||'B'],bd={};rg.forEach(function(r){if(r.a>0)bd[r.a]=r.ty==='perfect'&&r.b-r.a+1!==3?'bezier':r.ty});
  for(i=1;i<sl.pts.length;i++){var ps=Math.round(sl.pts[i].x)+':'+Math.round(sl.pts[i].y),tt=bd[i];
    if(tt){/* new segment: an explicit letter, or (same plain type) the usual duplicated anchor */
      if(tt!==cur||tt==='perfect'||tt==='catmull'){cp.push(LT[tt]||'B');cp.push(ps)}else if(tt==='bezier'){cp.push(ps);cp.push(ps)}else cp.push(ps);cur=tt}
    else cp.push(ps)}
  var n=sl.slides,tail=o.tail;
  if(!tail||o.tailSlides!==n){var es=[],ez=[];for(i=0;i<=n;i++){es.push(hs);ez.push('0:0')}tail=es.join('|')+','+ez.join('|')+',0:0:0:0:'}
  return [x,y,t,ty,hs,cp.join('|'),n,+(+sl.len).toFixed(6),tail].join(',')}
function parseOsu(text,name){
  var sec='',m={stack:.7,title:'',artist:'',ver:'',cs:5,ar:5,od:5,audio:'',sm:1.4,tps:[],all:[],bm:[],objs:[],spin:[]},num=0,reset=true;
  text.split(/\r?\n/).forEach(function(l){
    var s=l.match(/^\[(.+)\]$/);if(s){sec=s[1];return}
    var kv=l.match(/^(\w+)\s*:\s*(.*)$/);
    if(sec==='General'&&kv&&kv[1]==='AudioFilename')m.audio=kv[2].trim();
    if(sec==='General'&&kv&&kv[1]==='StackLeniency'&&isFinite(+kv[2]))m.stack=cl(+kv[2],0,1);
    if(sec==='Metadata'&&kv){if(kv[1]==='Title')m.title=kv[2];if(kv[1]==='Artist')m.artist=kv[2];if(kv[1]==='Version')m.ver=kv[2]}
    if(sec==='Difficulty'&&kv){if(kv[1]==='CircleSize')m.cs=+kv[2];if(kv[1]==='ApproachRate')m.ar=+kv[2];if(kv[1]==='OverallDifficulty')m.od=+kv[2];if(kv[1]==='SliderMultiplier')m.sm=+kv[2]}
    if(sec==='Colours'&&kv){var cmk=kv[1].match(/^Combo(\d+)$/);if(cmk){var hx=rgbHex(kv[2]);if(hx){(m.colors=m.colors||[])[+cmk[1]-1]=hx}}}
    if(sec==='Editor'&&kv&&kv[1]==='Bookmarks')m.bm=kv[2].split(',').map(Number).filter(function(n){return isFinite(n)&&kv[2].trim()!==''});
    if(sec==='TimingPoints'&&l.trim()){var a=l.split(','),u=a[6]===undefined||a[6].trim()==='1',bl=+a[1];
      if(u&&bl>0)m.tps.push({t:+a[0],beat:bl});
      m.all.push({t:+a[0],uninh:u&&bl>0,beat:bl,sv:u?1:cl(-100/bl,.1,10),kiai:!!((+a[7]||0)&1),raw:a})}
    if(sec==='HitObjects'&&l.trim()){var h=l.split(','),ty=+h[3];
      if(ty&8){reset=true;m.spin.push({time:+h[2],raw:l});return}
      if(ty&4||reset){num=1;reset=false}else num++;
      var o={x:+h[0],y:+h[1],time:+h[2],num:num,end:+h[2],oid:m.objs.length,raw:l,nc:!!(ty&4),hs:h[4]==null?'0':h[4],skip:ty&~15,tail:null,mod:false,user:false};
      if((ty&2)&&h[5]){o.sl=mkSlider(h,o.x,o.y);o.tail=h.slice(8).join(',');o.tailSlides=o.sl.slides}else o.tail=h.slice(5).join(',');
      m.objs.push(o)}
  });
  if(m.colors)m.colors=m.colors.filter(Boolean);
  if(!m.tps.length||!m.objs.length){alert('That file has no timing point or no hit objects, so it can\'t be used. Pick a different difficulty.');return false}
  m.tps.sort(function(a,b){return a.t-b.t});m.all.sort(function(a,b){return a.t-b.t});m.all.forEach(function(q){q.sv0=q.sv});m.objs.sort(function(a,b){return a.time-b.time});m.spin.sort(function(a,b){return a.time-b.time});m.base={};m.objs.forEach(function(o){m.base[o.oid]=cpt(o)});m.maxDur=0;
  m.objs.forEach(function(o){if(!o.sl)return;var tp=m.tps[0];m.tps.forEach(function(q){if(q.t<=o.time)tp=q});var sv=1;for(var z=0;z<m.all.length&&m.all[z].t<=o.time;z++)sv=m.all[z].sv;o.dur=o.sl.len/(100*m.sm*sv)*tp.beat*o.sl.slides;o.end=o.time+o.dur;if(o.dur>m.maxDur)m.maxDur=o.dur});
  st.map=m;renumber();st.radius=54.4-4.48*m.cs;st.pre=m.ar<5?1800-120*m.ar:1200-150*(m.ar-5);st.sel=[];st.csel=[];stopPlay();
  $('mName').textContent=m.artist+' - '+m.title;
  $('mStats').textContent=m.cs+' / '+m.ar+' / '+m.od;m.sm0=m.sm;st.smS=null;st.svS=null;$('smS').value='';$('svS').value='';strInfo();$('stk').value=Math.round(m.stack*10);$('stkV').textContent=Math.round(m.stack*10);$('bsv').value=m.sm;$('mObjs').textContent=m.objs.length;
  $('mTp').textContent=m.tps.length+(m.tps.length>1?' (BPM changes)':'');
  if(!st.audio)$('mAud').textContent=m.audio?'Load '+m.audio:'none';
  var s0=snapT(m.objs[0].time);st.ph=Math.max(0,s0-400);setStart(s0);st.tz=tzDef();st.tzT=st.tz;zoomUi();st.mapId=(st.mapId||0)+1;center();
  st.bodies=[];st.ab=null;st.nid=1;st.key='';st.canc=null;HIST=[];META=[];hi=-1;checkpoint();
  lock();draw();return true;
}
function useDiff(i){
  var d=st.osz.ds[i];
  if(st.map&&st.dIdx!=null&&st.bodies.length)st.stash[st.dIdx]=cap();
  if(!parseOsu(d.text,d.name))return false;
  st.cur={text:d.text,fname:d.fname};st.dIdx=i;$('diff').value=i;
  if(st.stash[i]){restore(st.stash[i]);HIST=[];META=[];hi=-1;checkpoint()}
  var an=st.map.audio;
  if(an&&an!==st.audioName){
    var key=Object.keys(st.osz.zip.files).filter(function(n){return n.toLowerCase()===an.toLowerCase()})[0];
    if(key)st.osz.zip.files[key].async('blob').then(function(b){var ext=an.split('.').pop().toLowerCase();loadAudio(new File([b],an,{type:{mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav'}[ext]||''}));st.audioName=an});
    else $('mAud').textContent='Missing '+an;
  }
  return true;
}
/* sess: undefined = restore saved progress for this exact file if there is any, null = open it fresh, object = restore that session */
function loadOsz(f,sess){
  if(!window.JSZip){alert('The .osz reader could not load (it needs internet access to cdnjs). Try again, or import the .osu and audio files separately.');return}
  var buf=null,sv=null;return f.arrayBuffer().then(function(b){buf=b;return Promise.all([JSZip.loadAsync(b),sess!==undefined?sess:lsSession(f.name+':'+b.byteLength)])}).then(function(r){var zip=r[0];sv=r[1];
    var names=Object.keys(zip.files).filter(function(n){return /\.osu$/i.test(n)});
    if(!names.length){alert('No difficulties found in that .osz.');return}
    return Promise.all(names.map(function(n){return zip.files[n].async('string')})).then(function(texts){
      var ds=texts.map(function(t,i){var v=t.match(/^Version:(.*)$/m);return{text:t,name:v?v[1].trim():names[i],fname:names[i]}});
      st.osz={zip:zip,ds:ds,buf:buf,name:f.name};st.audioName=null;st.stash=(sv&&sv.stash)||{};st.dIdx=null;
      var sel=$('diff');sel.innerHTML='';
      ds.forEach(function(d,i){var o=document.createElement('option');o.value=i;o.textContent=d.name;sel.appendChild(o)});
      useDiff(sv&&sv.dIdx!=null&&ds[sv.dIdx]?sv.dIdx:0);
      if(sv&&sv.stash){if(sv.ph!=null){st.ph=sv.ph;center()}draw();toast('Restored your saved progress')}
      autoSaveSoon();
    });
  }).catch(function(){alert('Could not read that .osz file.')});
}
$('diff').onchange=function(){
  var i=+$('diff').value;
  if(!useDiff(i))$('diff').value=st.dIdx;
};
$('import').onclick=function(){$('file').click()};
$('tzo').onclick=function(){zoomTo((st.tzT||st.tz)/1.25)};$('tzi').onclick=function(){zoomTo((st.tzT||st.tz)*1.25)};$('tzv').onclick=function(){zoomTo(tzDef())};
$('skinBtn').onclick=function(){$('skinFile').click()};
$('skinFile').onchange=function(e){Array.prototype.forEach.call(e.target.files||[],function(f){loadSkin(f)});e.target.value=''};
$('skinSel').onchange=function(){applySkin($('skinSel').value)};
$('file').onchange=function(e){
  var fs=Array.prototype.slice.call(e.target.files);e.target.value='';
  var oszf=fs.filter(function(f){return /\.osz$/i.test(f.name)})[0];
  if(oszf){loadOsz(oszf);return}
  var osu=fs.filter(function(f){return /\.osu$/i.test(f.name)})[0],au=fs.filter(function(f){return !/\.osu$/i.test(f.name)})[0];
  if(osu)osu.text().then(function(t){openOsuText(t,osu.name,au)});
  else if(au&&st.map)loadAudio(au);
};$('close').onclick=function(){$('dlg').close()};
$('copy').onclick=function(){$('out').select();try{navigator.clipboard.writeText($('out').value)}catch(e){document.execCommand('copy')}$('copy').textContent='Copied';setTimeout(function(){$('copy').textContent='Copy'},1200)};
$('exMap').onclick=function(){doExport(false)};$('exBoth').onclick=function(){doExport(true)};
window.addEventListener('resize',function(){draw()});
loadColors();lock();draw();
