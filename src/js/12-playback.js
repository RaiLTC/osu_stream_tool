/* ---- playback ---- */
function reseek(){if(!st.playing)return;st.ph0=st.ph;st.t0=performance.now();st.aT=null;var a=st.audio;if(a){if(st.ph>=0){try{a.currentTime=st.ph/1000}catch(e){}}else a.pause()}}
function stopPlay(){if(!st.playing)return;st.playing=false;if(st.audio)st.audio.pause();$('play').setAttribute('aria-pressed','false')}
function play(){
  if(!st.map)return;
  if(st.playing){stopPlay();draw();return}
  st.sa=null;st.playing=true;st.t0=performance.now();st.ph0=st.ph;
  st.aT=null;$('play').setAttribute('aria-pressed','true');draw();
}
$('play').onclick=play;
/* changing the stream velocity with a stream selected re-spaces that stream live (scaled about its first selected circle); without a selection it only sets what new streams use */
function svLive(dBefore){var R=selRun(true);if(!R||R.i1-R.i0<1){st.ssc=null;return false}
  var sg=st.csel.join(',')+'|'+R.B.id;
  if(!st.ssc||st.ssc.sg!==sg){st.ssc={sg:sg,B:R.B,i0:R.i0,i1:R.i1,orig:R.B.pos.slice(R.i0,R.i1+1).map(function(p){return{x:p.x,y:p.y}}),d0:dBefore}}
  var S=st.ssc,ag=0,k;for(k=1;k<S.orig.length;k++)ag+=Math.hypot(S.orig[k].x-S.orig[k-1].x,S.orig[k].y-S.orig[k-1].y);ag/=(S.orig.length-1);var f=ag>.01?strD(R.B.start,R.B.snap)*st.ds/ag:1,o=S.orig[0];if(!isFinite(f)||f<=0)return false;
  S.orig.forEach(function(p,i){R.B.pos[S.i0+i]={x:cl(o.x+(p.x-o.x)*f,0,W),y:cl(o.y+(p.y-o.y)*f,0,H)}});
  st.sp=null;st.key='';return true}
['smS','svS'].forEach(function(id){$(id).addEventListener('input',function(){var B0=AB(),dB=B0?strD(B0.start,B0.snap):1,v=parseFloat($(id).value),ok=isFinite(v)&&v>0;if(id==='smS')st.smS=ok?cl(v,.4,3.6):null;else st.svS=ok?cl(v,.1,10):null;strInfo();st.dsr=null;st.svDid=svLive(dB)||st.svDid;draw()});
  $(id).addEventListener('change',function(){if(st.svDid){st.svDid=false;st.ssc=null;checkpoint()}})});
$('bsv').addEventListener('change',function(){if(!st.map)return;var v=+$('bsv').value;if(!isFinite(v)||v<=0){$('bsv').value=st.map.sm;return}v=cl(Math.round(v*100)/100,.4,3.6);$('bsv').value=v;if(v===st.map.sm)return;st.map.sm=v;recSliders();st.key='';st.clk='';st.sp=null;st.dsr=null;checkpoint();draw()});
(function(){var v=30;try{var sv=localStorage.getItem('sm_vol');if(sv!==null&&isFinite(+sv))v=cl(+sv,0,100)}catch(e){}$('vol').value=v;$('volv').textContent=v+'%'})();
$('vol').addEventListener('input',function(){var v=+$('vol').value;$('volv').textContent=v+'%';if(st.audio)st.audio.volume=cl(v/100,0,1);try{localStorage.setItem('sm_vol',v)}catch(e){}});
$('rate').onchange=function(){var r=+$('rate').value;if(st.audio)st.audio.playbackRate=r;if(st.playing){st.ph0=st.ph;st.t0=performance.now()}};$('clear').onclick=function(){targets().forEach(dropBody);st.csel=[];st.sel=[];checkpoint();draw()};
var TOOLS=['select','circle','slider','stream','delete'];
document.addEventListener('keydown',function(e){
  var tg=e.target,tag=tg.tagName;
  var kz=e.key.toLowerCase(),isUR=(e.ctrlKey||e.metaKey)&&(kz==='z'||kz==='y');
  if(document.getElementById('rotdlg').open||document.getElementById('scdlg').open||tag==='TEXTAREA'||(tag==='INPUT'&&tg.type!=='range'&&tg.type!=='checkbox'&&!(isUR&&tg.type==='number')))return;
  if(isUR&&tag==='INPUT')tg.blur();
  if(!st.map)return;
  var k=e.key.toLowerCase(),ctrl=e.ctrlKey||e.metaKey;
  if(k==='escape'&&st.aim){st.aim=null;draw();return}
  if(k==='escape'&&st.rd){rotCancel();st.rd=null;draw();return}
  if(ctrl&&e.shiftKey&&k==='r'){e.preventDefault();openRot();return}
  if(ctrl&&e.shiftKey&&k==='s'){e.preventDefault();openScale();return}
  if(ctrl&&(e.key===','||e.key==='.')){e.preventDefault();if(rotBegin()){rotUpdate(e.key==='.'?90:-90,null);rotCommit()}return}
  if(ctrl&&e.shiftKey&&k==='f'){e.preventDefault();convertToStream();return}
  if(ctrl&&k==='z'){e.preventDefault();if(e.shiftKey)redo();else undo();return}
  if(ctrl&&k==='y'){e.preventDefault();redo();return}
  if(ctrl&&k==='a'){e.preventDefault();st.csel=st.live.map(function(c){return c.b+':'+c.i});draw();return}
  if(ctrl&&k==='c'){e.preventDefault();copySel();return}
  if(ctrl&&k==='x'){e.preventDefault();if(copySel()){delCircles();checkpoint();draw()}return}
  if(ctrl&&k==='v'){e.preventDefault();pasteSel();return}
  if(ctrl)return;
  if(k==='escape'&&st.slp){st.slp=null;draw();return}
  if(st.slp&&k==='tab'){e.preventDefault();cycleSlType(e.shiftKey?-1:1);return}
  if(!st.slp&&k==='tab'&&selSliders().length){e.preventDefault();cycleSelSlType(e.shiftKey?-1:1);return}
  if(!st.slp&&e.altKey&&/^Digit[1-4]$/.test(e.code)&&selSliders().length){e.preventDefault();var ss0=selSliders(),tt0=SLTYPES[+e.code.slice(5)-1];ss0.forEach(function(o){slSetType(o,tt0)});return}
  if(st.slp&&e.altKey&&/^Digit[1-4]$/.test(e.code)){e.preventDefault();setSlType(SLTYPES[+e.code.slice(5)-1]);return}
  if(/^[1-9]$/.test(k)){if(TOOLS[+k-1])setTool(TOOLS[+k-1]);return}
  if(k==='b')setTool('bend');else if(k==='v')setTool('select');else if(k==='d')setTool('delete');
  else if(k==='a')setVis((st.vis+1)%3);
  else if(k==='q')toggleNC();
  else if(k==='l')setLin(!st.lin);else if(k==='p')setTool('draw');else if(k==='e'){st.speed=!st.speed;$('spdBtn').setAttribute('aria-pressed',!!st.speed);toast('Draw spacing: '+(st.speed?'by speed (slow = tight)':'even'));draw()}
  else if(k==='m')mirrorKey();else if(k==='enter'&&st.mir)mirrorApply();else if(k==='h')flip('x');else if(k==='j')flip('y');else if(k==='r')reverse();
  else if(k==='g'){st.gv=!st.gv;draw()}
  else if(k===' '){e.preventDefault();play()}
  else if(k==='escape'&&st.mir){st.mir=null;draw()}
  else if(k==='escape'){st.sel=[];st.csel=[];st.psel=null;st.ab=null;menu.style.display='none';svm.style.display='none';st.svSel=null;draw()}
  else if(k==='delete'||k==='backspace'){e.preventDefault();if(st.po&&st.po.sl&&selSliders().indexOf(st.po)>=0&&pselOf(st.po).length){slDelPts(st.po);return}if(delCircles()){checkpoint();draw();return}}
});
document.querySelector('aside').addEventListener('change',function(e){var t=e.target;if(t.id==='stepSl'||t.id==='bias'||t.id==='bfoc'||t.id==='brch'||t.id==='pvt')checkpointSlider();else checkpoint();if(t.tagName==='SELECT'||t.type==='range'||t.type==='number')t.blur()});
function stepHintUpd(){var B=AB(),px=stepPx(B),sv=parseFloat($('biasStep').value);$('stepHint').textContent=px?('Each gap '+(sv>0?'+':'')+sv+' SV ('+(px>0?'+':'')+px.toFixed(1)+' px) from the one before'):'Off'}
$('biasStep').addEventListener('input',function(){var v=parseFloat($('biasStep').value);$('stepSl').value=isFinite(v)?Math.round(v*1000):0;stepHintUpd();applyBias(0,0,0)});
$('stepEnd').addEventListener('change',function(){applyBias(0,0,0);checkpoint()});
$('stepSl').addEventListener('input',function(){var v=+$('stepSl').value;if(st.shift)v=Math.round(v/10)*10;$('stepSl').value=v;$('biasStep').value=v?(v/1000).toFixed(3).replace(/0+$/,'').replace(/\.$/,''):'0';stepHintUpd();applyBias(0,0,0)});
$('biasFree').addEventListener('change',function(){st.bfree=$('biasFree').checked;var bv0=+$('bias').value;if(bv0!==0)applyBias(bv0,+$('bfoc').value,+$('brch').value)});
['count','bias','bfoc','brch','nc','bsnap'].forEach(function(id){$(id).addEventListener('input',applyPanel)});
$('pvt').addEventListener('input',function(){st.pv=+$('pvt').value/100;$('pvtHint').textContent=st.pv===0?'Last circle moves freely':st.pv>=1?'Last circle stays put':Math.round(st.pv*100)+'% of the length is kept';if(st.sp&&st.sp.v!==0)applyBias(+$('bias').value,+$('bfoc').value,+$('brch').value)});
$('snap').addEventListener('input',function(){draw()});
$('start').addEventListener('change',function(){var t=Math.max(0,parseT($('start').value)),B=AB();if(B)B.start=t;setStart(t);draw()});
function lines(){build();return st.live.map(function(c){return Math.round(c.x)+','+Math.round(c.y)+','+c.time+','+(c.nc?5:1)+',0,0:0:0:0:'}).join('\n')}
function svLines(){return st.map.all.filter(function(p){return !p.uninh&&(p.u||p.sv!==p.sv0)}).map(function(p){var a=(p.raw||[]).slice();a[0]=String(p.t);a[1]=String(+(-100/p.sv).toPrecision(15));while(a.length<8)a.push(['','','4','1','0','100','0','0'][a.length]);a[6]='0';return a.join(',')})}
function textOut(){var t=lines(),sv=svLines(),o='';
  if(st.map){var ol=st.map.objs.filter(function(q){return q.user||q.mod}).map(objLine);if(ol.length)t=ol.join('\n')+(t?'\n'+t:'')}
  if(sv.length)o+='// New / changed inherited timing points: add these to [TimingPoints]\n'+sv.join('\n')+'\n\n// Hit objects: add these to [HitObjects]\n';
  return o+(t||(sv.length?'':'Draw a stream first.'))}
function syncExpName(){var on=$('expNew').checked,el=$('expName');el.style.display=on?'block':'none';if(on&&!el.value)el.value=newVersion()}
$('expNew').addEventListener('change',function(){syncExpName();if($('expNew').checked){$('expName').focus();$('expName').select()}});
function newVersion(){var v=(st.map&&st.map.ver)||(st.osz&&st.osz.ds[st.dIdx]&&st.osz.ds[st.dIdx].name)||'';return (v||'Diff')+' (streams)'}
function buildOsu(text,keep,ver,keepId){
  var L=text.split(/\r?\n/),head=[],secs=[],cur=null,i,m;
  L.forEach(function(l){var h=l.match(/^\[(.+)\]\s*$/);if(h){cur={name:h[1],lines:[]};secs.push(cur)}else if(cur)cur.lines.push(l);else head.push(l)});
  var sv=svLines(),changed={};sv.forEach(function(l){changed[+l.split(',')[0]]=1});
  var ts=lines(),streamL=ts?ts.split('\n'):[];
  function sec(n){for(var k=0;k<secs.length;k++)if(secs[k].name===n)return secs[k];return null}
  var df=sec('Difficulty');if(df&&st.map){var hs=false;df.lines=df.lines.map(function(l){if(/^SliderMultiplier\s*:/.test(l)){hs=true;return 'SliderMultiplier:'+st.map.sm}return l});if(!hs)df.lines.push('SliderMultiplier:'+st.map.sm)}
  var gn=sec('General');if(gn&&st.map){var hk=false;gn.lines=gn.lines.map(function(l){if(/^StackLeniency\s*:/.test(l)){hk=true;return 'StackLeniency: '+st.map.stack}return l});if(!hk)gn.lines.push('StackLeniency: '+st.map.stack)}
  var md=sec('Metadata');if(md){var hv=false;md.lines=md.lines.map(function(l){if(/^Version\s*:/.test(l)){hv=true;return 'Version:'+ver}if(/^BeatmapID\s*:/.test(l))return keepId?l:'BeatmapID:0';return l});if(!hv)md.lines.unshift('Version:'+ver)}
  var tp=sec('TimingPoints');
  if(!tp){tp={name:'TimingPoints',lines:[]};secs.push(tp)}
  var tl=[];tp.lines.forEach(function(l){if(!l.trim()||/^\/\//.test(l))return;var a=l.split(','),t=+a[0],inh=a[6]!==undefined&&a[6].trim()==='0';if(inh&&changed[t])return;tl.push({t:t,u:inh?1:0,l:l})});
  sv.forEach(function(l){tl.push({t:+l.split(',')[0],u:1,l:l})});
  tl.sort(function(x,y){return x.t-y.t||x.u-y.u});
  tp.lines=tl.map(function(x){return x.l}).concat(['']);
  var ho=sec('HitObjects');
  if(!ho){ho={name:'HitObjects',lines:[]};secs.push(ho)}
  var hl=[];
  if(keep&&st.map)(st.map.spin||[]).forEach(function(sp){hl.push({t:sp.time,l:sp.raw})});
  if(st.map)st.map.objs.forEach(function(o){if(!keep&&!o.user)return;hl.push({t:o.time,l:(o.raw&&!o.mod)?o.raw:objLine(o)})});
  streamL.forEach(function(l){hl.push({t:+l.split(',')[2],l:l})});
  hl.sort(function(x,y){return x.t-y.t});
  ho.lines=hl.map(function(x){return x.l}).concat(['']);
  var out=head.slice();secs.forEach(function(s2){out.push('['+s2.name+']');Array.prototype.push.apply(out,s2.lines)});
  return out.join('\r\n')}
function saveFile(blob,name,tries){
  function fallback(){var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()}
  if(!(window.claude&&window.claude.use)){fallback();return Promise.resolve()}
  return window.claude.use('downloads').then(function(d){
    if(!d){fallback();return}
    return d.save({filename:name,data:blob}).catch(function(err){
      if(err&&err.code==='rejected_extension'&&!/\.zip$/i.test(name)){var zn=/\.osz$/i.test(name)?name.replace(/\.osz$/i,'.zip'):name+'.zip';
        if(st.zipOk)return d.save({filename:zn,data:blob});
        return new Promise(function(res,rej){var a=$('zipAsk');$('zipTxt').textContent='This viewer will not save '+(/\.osz$/i.test(name)?'.osz':'.osu')+' files. Save it as "'+zn+'" instead? It is the same file: '+(/\.osz$/i.test(name)?'rename the extension to .osz':'remove the ".zip"')+' afterwards.';a.style.display='block';if(!$('dlg').open)$('dlg').showModal();
          $('zipYes').onclick=function(){a.style.display='none';st.zipOk=true;d.save({filename:zn,data:blob}).then(res,rej)};
          $('zipNo').onclick=function(){a.style.display='none';rej({code:'declined',message:'Export cancelled'})}})}
      throw err})})}
function safeName(n){return String(n).replace(/[\\/:*?"<>|]/g,'')}
/* the untouched map exactly as it was imported */
function origFile(){
  if(st.osz&&st.osz.buf)return{name:st.osz.name,key:st.osz.name+':'+st.osz.buf.byteLength,blob:new Blob([st.osz.buf],{type:'application/octet-stream'})};
  var cur=st.cur||{text:'',fname:'map.osu'};return{name:cur.fname,key:cur.fname+':'+cur.text.length,blob:new Blob([cur.text],{type:'text/plain'})}}
function editedOsz(){
  if(!window.JSZip)return Promise.reject(new Error('The .osz writer needs JSZip, which could not load (it needs internet access to cdnjs).'));
  build();
  var asNew=$('expNew').checked,cur=st.cur||{text:'',fname:'map.osu'},
    ver=asNew?(String($('expName').value||'').replace(/[\[\]\r\n]/g,'').trim()||newVersion()):((st.map&&st.map.ver)||(st.osz&&st.osz.ds[st.dIdx]&&st.osz.ds[st.dIdx].name)||'Diff'),
    txt=buildOsu(cur.text,true,ver,!asNew),fname=cur.fname;
  if(asNew){fname=cur.fname.replace(/\[[^\]]*\]\.osu$/i,'['+safeName(ver)+'].osu');if(fname===cur.fname)fname=cur.fname.replace(/\.osu$/i,' ['+safeName(ver)+'].osu')}
  var zp=st.osz&&st.osz.buf?JSZip.loadAsync(st.osz.buf):Promise.resolve((function(){var z=new JSZip();if(st.audioFile)z.file(st.audioFile.name,st.audioFile);return z})());
  return zp.then(function(z){z.file(fname,txt);return z.generateAsync({type:'blob',compression:'DEFLATE'})}).then(function(blob){
    return{blob:blob,name:((st.osz&&st.osz.name)||fname).replace(/\.(osz|osu|zip)$/i,'')+' (edited).osz'}})}
/* the original is saved FIRST; if that is cancelled or fails nothing else is written */
function doExport(backup){
  if(!st.map||st.exporting)return Promise.resolve();
  st.exporting=true;var bt=[$('exMap'),$('exBoth')];bt.forEach(function(b){b.disabled=true});$('expInfo').textContent='Building…';
  var p=Promise.resolve(),o=origFile(),did=false;
  if(backup){var bn=o.name.replace(/\.(osz|osu|zip)$/i,'')+' (original backup)'+(/\.osu$/i.test(o.name)?'.osu':'.osz');
    p=saveFile(o.blob,bn).then(function(){st.backedKey=o.key;did=true;return new Promise(function(r){setTimeout(r,500)})})}
  return p.then(editedOsz).then(function(r){return saveFile(r.blob,r.name).then(function(){
      var m='Saved '+(did?'the original backup and ':'')+r.name;$('expInfo').textContent=m;toast(did?'Saved map + original backup':'Saved map')})})
    .catch(function(err){$('expInfo').textContent=(err&&err.code==='declined')?(did?'Backup saved; map not saved.':'Cancelled. Nothing was saved.'):'Could not save: '+((err&&err.message)||err)})
    .then(function(){st.exporting=false;bt.forEach(function(b){b.disabled=false})})}
/* Ctrl+S: the first save of a loaded map also writes the original backup */
function quickSave(){if(!st.map)return;var o=origFile();doExport(st.backedKey!==o.key)}
$('export').onclick=function(){$('out').value=textOut();$('expInfo').textContent='';$('exMap').disabled=$('exBoth').disabled=false;if(!$('expNew').checked)$('expName').value='';syncExpName();$('dlg').showModal()};
window.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&e.key.toLowerCase()==='s'){e.preventDefault();if(st.map&&!$('dlg').open)quickSave()}},true);
