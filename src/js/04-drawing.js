/* ---- playfield drawing ---- */
var col={};
function X(v){return (v+M)*S}
function Y(v){return (v+M)*S}
function loadColors(){var s=getComputedStyle(document.documentElement);['--accent','--mute','--text','--panel','--play','--grid','--line','--field'].forEach(function(n){col[n]=s.getPropertyValue(n).trim()})}
if(window.matchMedia)matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){loadColors();draw()});
function lb(a,t){var lo=0,hi=a.length;while(lo<hi){var m=(lo+hi)>>1;if(a[m].time<t)lo=m+1;else hi=m}return lo}
function ring(x,y,R,c,lw,al){ctx.globalAlpha=al;ctx.beginPath();ctx.arc(X(x),Y(y),R,0,6.283);ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.stroke()}
function draw(){if(!st.q){st.q=true;requestAnimationFrame(render)}}
/* after placing a stream the playhead moves to its last circle, ready for the next one */
function phToEnd(B){var t=-1;B.circles.forEach(function(c){if(!c.del&&c.time>t)t=c.time});if(t>=0){st.ph=t;center();reseek()}}
function center(){var w=tt.clientWidth||800;st.tv0=st.ph-w*.5/st.tz}
function flag(cx,cy,sz,c){ctx.beginPath();ctx.moveTo(cx,cy+sz);ctx.lineTo(cx,cy-sz);ctx.lineTo(cx+sz*.95,cy-sz*.5);ctx.lineTo(cx,cy);ctx.strokeStyle=c;ctx.fillStyle=c;ctx.lineWidth=2;ctx.stroke();ctx.fill()}
function lbl(t,x,y,sz){ctx.font='700 '+sz+'px system-ui,sans-serif';ctx.lineWidth=3;ctx.strokeStyle=col['--panel'];ctx.strokeText(t,x,y);ctx.fillStyle=col['--text'];ctx.fillText(t,x,y)}
function shade(h,f){var n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;
  if(f<1){r*=f;g*=f;b*=f}else{var t=f-1;r+=(255-r)*t;g+=(255-g)*t;b+=(255-b)*t}
  return 'rgb('+Math.round(r)+','+Math.round(g)+','+Math.round(b)+')'}
