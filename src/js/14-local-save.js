/* ---- local library: every imported map is kept in this browser (IndexedDB) together with an autosave of your edits ----
   stores: 'maps' = {id,name,kind,savedAt,objs,sess}  (small, listed in the Recent dialog)
           'files' = id -> original .osz bytes, or {text,audio,aname} for a loose .osu
   id = "<file name>:<size>", the same key export uses to recognise the original map */
var LS={db:null,timer:0,have:{},warned:false,max:12};
function lsOpen(){return new Promise(function(res){try{
  var r=indexedDB.open('streammaker',1);
  r.onupgradeneeded=function(){var d=r.result;d.createObjectStore('maps',{keyPath:'id'});d.createObjectStore('files')};
  r.onsuccess=function(){res(r.result)};r.onerror=r.onblocked=function(){res(null)}}catch(e){res(null)}})}
function lsDb(){return LS.db||(LS.db=lsOpen())}
function lsReq(stores,mode,fn){return lsDb().then(function(db){return new Promise(function(res,rej){
  if(!db)return rej(new Error('no storage'));
  var tx=db.transaction(stores,mode),out=fn(tx);tx.oncomplete=function(){res(out&&out.result!==undefined?out.result:out)};tx.onerror=tx.onabort=function(){rej(tx.error||new Error('storage error'))}})})}
function lsId(){if(!st.map)return null;if(st.osz&&st.osz.buf)return st.osz.name+':'+st.osz.buf.byteLength;return st.cur?st.cur.fname+':'+st.cur.text.length:null}
function lsSessNow(){
  if(st.osz&&st.dIdx!=null){var sh=Object.assign({},st.stash);sh[st.dIdx]=cap();return{dIdx:st.dIdx,stash:sh,ph:st.ph}}
  return{dIdx:null,cur:cap(),ph:st.ph}}
function lsInd(t){var e=$('saveInd');if(e)e.textContent=t}
function lsSaveNow(){
  clearTimeout(LS.timer);LS.timer=0;var id=lsId();if(!id)return Promise.resolve();
  var osz=!!(st.osz&&st.osz.buf),rec={id:id,name:osz?st.osz.name:st.cur.fname,kind:osz?'osz':'osu',savedAt:Date.now(),objs:st.map.objs.length,sess:lsSessNow(),
      title:(st.map.artist?st.map.artist+' - ':'')+(st.map.title||''),diff:osz&&st.osz.ds[st.dIdx]?st.osz.ds[st.dIdx].name:(st.map.ver||'')};
  var needFile=!LS.have[id],fileVal=null;
  if(needFile)fileVal=osz?st.osz.buf:{text:st.cur.text,audio:st.audioFile||null,aname:st.audioFile?st.audioFile.name:''};
  return lsReq(['maps','files'],'readwrite',function(tx){tx.objectStore('maps').put(rec);if(needFile)tx.objectStore('files').put(fileVal,id)})
   .then(function(){LS.have[id]=1;var d=new Date();lsInd('Saved locally '+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2));lsPrune()})
   .catch(function(){lsInd('Local save unavailable');if(!LS.warned){LS.warned=true;try{toast('Could not save locally (storage blocked or full)')}catch(_){}}})}
function autoSaveSoon(){if(!st.map)return;clearTimeout(LS.timer);LS.timer=setTimeout(lsSaveNow,1200)}
function lsList(){return lsReq('maps','readonly',function(tx){return tx.objectStore('maps').getAll()}).then(function(a){return(a||[]).sort(function(x,y){return y.savedAt-x.savedAt})}).catch(function(){return[]})}
function lsPrune(){lsList().then(function(a){a.slice(LS.max).forEach(function(r){lsDelete(r.id)})})}
function lsDelete(id){delete LS.have[id];return lsReq(['maps','files'],'readwrite',function(tx){tx.objectStore('maps').delete(id);tx.objectStore('files').delete(id)}).catch(function(){})}
function lsSession(id){return lsReq('maps','readonly',function(tx){return tx.objectStore('maps').get(id)}).then(function(r){return r?r.sess:null}).catch(function(){return null})}
function lsFile(id){return lsReq('files','readonly',function(tx){return tx.objectStore('files').get(id)})}
/* open a loose .osu (text), optionally with audio and a saved session */
function openOsuText(t,fname,au,sess){
  var id=fname+':'+t.length,go=function(sv){
    if(!parseOsu(t,fname))return;st.osz=null;st.cur={text:t,fname:fname};LS.have[id]=LS.have[id]||0;
    if(sv&&sv.cur){restore(sv.cur);HIST=[];META=[];hi=-1;checkpoint();if(sv.ph!=null){st.ph=sv.ph;center()}draw();toast('Restored your saved progress')}
    if(au&&st.map)loadAudio(au);autoSaveSoon()};
  if(sess===undefined)lsSession(id).then(go);else go(sess)}
function lsAgo(t){var s=Math.max(0,(Date.now()-t)/1000);if(s<60)return'just now';if(s<3600)return Math.round(s/60)+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';return Math.round(s/86400)+' d ago'}
function lsOpenEntry(r,fresh){
  lsFile(r.id).then(function(f){
    if(!f){toast('That map is no longer stored');return}
    var sess=fresh?null:r.sess;$('recdlg').close();
    if(r.kind==='osz')loadOsz(new File([f],r.name),sess);
    else openOsuText(f.text,r.name,f.audio?new File([f.audio],f.aname||'audio.mp3',{type:f.audio.type}):null,sess)})}
function lsRender(){
  var box=$('recList');box.textContent='Loading...';
  lsList().then(function(a){
    box.textContent='';
    if(!a.length){var e=document.createElement('div');e.className='hint';e.textContent='Nothing saved yet. Maps you import are kept here automatically, together with your edits.';box.appendChild(e);return}
    a.forEach(function(r){
      var row=document.createElement('div');row.className='recrow';
      var info=document.createElement('div');info.className='recinfo';
      var n=document.createElement('b');n.textContent=(r.title?r.title+' ':'')+(r.diff?'['+r.diff+']':'')||r.name;if(!n.textContent.trim())n.textContent=r.name;
      var m=document.createElement('span');m.textContent=r.name+' · '+r.objs+' objects · saved '+lsAgo(r.savedAt);
      info.appendChild(n);info.appendChild(m);
      var ob=document.createElement('button');ob.className='btn primary';ob.textContent='Open';ob.onclick=function(){lsOpenEntry(r,false)};
      var fb=document.createElement('button');fb.className='btn';fb.textContent='Fresh';fb.title='Open the original map and discard your saved edits';
      fb.onclick=function(){if(fb.dataset.sure){lsOpenEntry(r,true);return}fb.dataset.sure=1;fb.textContent='Sure?';setTimeout(function(){delete fb.dataset.sure;fb.textContent='Fresh'},3000)};
      var db=document.createElement('button');db.className='btn';db.textContent='×';db.title='Remove from this browser';db.setAttribute('aria-label','Remove '+r.name);
      db.onclick=function(){if(db.dataset.sure){lsDelete(r.id).then(lsRender);return}db.dataset.sure=1;db.textContent='Sure?';setTimeout(function(){delete db.dataset.sure;db.textContent='×'},3000)};
      row.appendChild(info);row.appendChild(ob);row.appendChild(fb);row.appendChild(db);box.appendChild(row)})})}
$('recent').onclick=function(){lsRender();$('recdlg').showModal()};
$('recClose').onclick=function(){$('recdlg').close()};
function lsCount(){lsList().then(function(a){$('recent').textContent=a.length?'Recent ('+a.length+')':'Recent'})}
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&LS.timer)lsSaveNow()});
window.addEventListener('pagehide',function(){if(LS.timer)lsSaveNow()});
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(_){}
lsCount();
