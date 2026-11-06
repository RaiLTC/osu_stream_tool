var GHOST=700,W=512,H=384,S=2,M=64,$=function(i){return document.getElementById(i)};
var cv=$('cv'),ctx=cv.getContext('2d'),tl=$('tl'),tt=$('tt');
var st={bodies:[],ab:null,nid:1,stash:{},canc:null,csel:[],sel:[],rng:null,tool:'select',drag:null,cd:null,td:null,box:null,lin:true,ds:1,svSel:null,nd:null,showAll:false,vis:0,playing:false,t0:0,ph0:0,ph:0,all:[],live:[],map:null,tv0:0,tz:.12,tm:null,radius:36,pre:1200,audio:null,wave:null,mapId:0,key:''};
var cl=function(v,a,b){return Math.max(a,Math.min(b,v))};

function css(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}
function fmt(t){t=Math.round(t);var s=t<0?'-':'';t=Math.abs(t);return s+String(Math.floor(t/60000)).padStart(2,'0')+':'+String(Math.floor(t%60000/1000)).padStart(2,'0')+':'+String(t%1000).padStart(3,'0')}
function parseT(s){s=String(s).trim();var m=s.match(/^(\d+):(\d{1,2})(?::(\d{1,3}))?$/);if(m)return +m[1]*60000+ +m[2]*1000+ +(m[3]||0);return Math.round(+s)||0}
function gcd(a,b){return b?gcd(b,a%b):a}
function tpAt(t){var r=st.map.tps[0];st.map.tps.forEach(function(p){if(p.t<=t)r=p});return r}
function snapT(t){var tp=tpAt(t),s=tp.beat/(+$('snap').value);return Math.round(tp.t+Math.round((t-tp.t)/s)*s)}
function lock(){
  var on=!!st.map;
  document.querySelectorAll('.tool,#export,#audioBtn,#rate,aside input,aside select').forEach(function(e){e.disabled=!on});
  $('import').classList.toggle('primary',!on);$('export').classList.toggle('primary',on);
}
function fixB(B){if(B.pts.length&&!B.pts[0].type)B.pts[0].type='bezier'}
