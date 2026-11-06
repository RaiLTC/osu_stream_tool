/* ---- Ctrl+Shift+S: Scale by (osu! stable), on top of the rotation snapshot ---- */
var SCL=null;
function openScale(){if(!st.map)return;if(!rotBegin()){toast('Select objects to scale first');return}
  var R=ROT,bx0=1e9,bx1=-1e9,by0=1e9,by1=-1e9,pt=function(x,y){bx0=Math.min(bx0,x);bx1=Math.max(bx1,x);by0=Math.min(by0,y);by1=Math.max(by1,y)};
  R.its.forEach(function(it){pt(it.x,it.y);it.u.forEach(function(q,i){pt(it.ux[i],it.uy[i])});it.l0=it.o.sl?it.o.sl.len:0});R.cs.forEach(function(c){pt(c.x,c.y)});
  SCL={R:R,sel:{x:(bx0+bx1)/2,y:(by0+by1)/2}};
  var org='play';try{org=localStorage.getItem('sm_scorigin')||'play'}catch(_){}if(org==='sel'&&!R.can)org='play';
  $('scF').value=1;$('scNum').value='1.000';$('scX').checked=true;$('scY').checked=true;$('scSel').disabled=!R.can;$('scSelL').style.opacity=R.can?1:.5;
  $('scPlay').checked=org!=='sel';$('scSel').checked=org==='sel';var d=$('scdlg');d.returnValue='';d.showModal();$('scNum').focus();$('scNum').select()}
function scaleApply(){var Q=SCL;if(!Q)return;var R=Q.R,f=cl(+$('scNum').value||1,.05,10),fx=$('scX').checked?f:1,fy=$('scY').checked?f:1,o0=$('scSel').checked?Q.sel:{x:W/2,y:H/2};
  var sp=function(x,y){return{x:o0.x+(x-o0.x)*fx,y:o0.y+(y-o0.y)*fy}},fl=Math.sqrt(fx*fy);
  R.its.forEach(function(it){var o=it.o,p=sp(it.x,it.y);o.x=p.x;o.y=p.y;o.mod=true;
    it.u.forEach(function(q,i){var r=sp(it.ux[i],it.uy[i]);q.x=r.x;q.y=r.y});
    if(o.sl){o.sl.len=it.l0*fl;var rr=slPath(o.sl.type,o.sl.pts,o.sl.len);o.sl.path=rr.path;o.sl.cum=rr.cum}});
  R.cs.forEach(function(c){var r=sp(c.x,c.y);c.p.x=cl(r.x,0,W);c.p.y=cl(r.y,0,H)});
  st.key='';draw()}
function scaleEnd(ok){var Q=SCL;SCL=null;if(!Q)return;
  if(ok){ROT=Q.R;rotCommit()}
  else{var its=Q.R.its;ROT=Q.R;rotCancel();its.forEach(function(it){if(it.o.sl){it.o.sl.len=it.l0;var rr=slPath(it.o.sl.type,it.o.sl.pts,it.o.sl.len);it.o.sl.path=rr.path;it.o.sl.cum=rr.cum}});st.key='';draw()}}
$('scF').addEventListener('input',function(){$('scNum').value=(+$('scF').value).toFixed(3);scaleApply()});
$('scNum').addEventListener('input',function(){$('scF').value=cl(+$('scNum').value||1,.1,3);scaleApply()});
$('scNum').addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();$('scdlg').close('ok')}});
['scPlay','scSel','scX','scY'].forEach(function(id){$(id).addEventListener('change',function(){if(id==='scPlay'||id==='scSel'){try{localStorage.setItem('sm_scorigin',$('scSel').checked?'sel':'play')}catch(_){}}scaleApply()})});
$('scOk').addEventListener('click',function(){$('scdlg').close('ok')});
$('scNo').addEventListener('click',function(){$('scdlg').close('cancel')});
$('scdlg').addEventListener('close',function(){if($('scdlg').returnValue==='ok'){scaleApply();scaleEnd(true)}else scaleEnd(false)});
