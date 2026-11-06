/* ---- lazer-style path math ---- */
function bez(P){var n=P.length,m=Math.max(16,n*20),out=[];
  for(var i=0;i<=m;i++){var t=i/m,a=P.map(function(p){return{x:p.x,y:p.y}});
    for(var k=1;k<n;k++)for(var j=0;j<n-k;j++)a[j]={x:a[j].x*(1-t)+a[j+1].x*t,y:a[j].y*(1-t)+a[j+1].y*t};
    out.push(a[0])}
  return out}
function cat(P){var out=[];
  for(var i=0;i<P.length-1;i++){var a=P[Math.max(i-1,0)],b=P[i],c=P[i+1],d=P[Math.min(i+2,P.length-1)];
    for(var k=0;k<24;k++){var t=k/24,t2=t*t,t3=t2*t;
      out.push({x:.5*((2*b.x)+(-a.x+c.x)*t+(2*a.x-5*b.x+4*c.x-d.x)*t2+(-a.x+3*b.x-3*c.x+d.x)*t3),y:.5*((2*b.y)+(-a.y+c.y)*t+(2*a.y-5*b.y+4*c.y-d.y)*t2+(-a.y+3*b.y-3*c.y+d.y)*t3)})}}
  out.push(P[P.length-1]);return out}
function arc(s){var a=s[0],b=s[1],c=s[2],d=2*(a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y));
  if(Math.abs(d)<1e-6)return[a,b,c];
  var A=a.x*a.x+a.y*a.y,B=b.x*b.x+b.y*b.y,C=c.x*c.x+c.y*c.y,
      ux=(A*(b.y-c.y)+B*(c.y-a.y)+C*(a.y-b.y))/d,uy=(A*(c.x-b.x)+B*(a.x-c.x)+C*(b.x-a.x))/d,r=Math.hypot(a.x-ux,a.y-uy),
      t0=Math.atan2(a.y-uy,a.x-ux),t1=Math.atan2(b.y-uy,b.x-ux),t2=Math.atan2(c.y-uy,c.x-ux),T=2*Math.PI,
      n=function(x){return((x%T)+T)%T},d1=n(t1-t0),d2=n(t2-t0),sw=d1<d2?d2:d2-T,N=cl(Math.ceil(Math.abs(sw)*r/3),8,300),out=[];
  for(var i=0;i<=N;i++){var t=t0+sw*i/N;out.push({x:ux+r*Math.cos(t),y:uy+r*Math.sin(t)})}
  return out}
function segPts(ty,s){
  if(ty==='linear')return s.slice();
  if(ty==='catmull')return cat(s.filter(function(p,i){return !i||p!==s[i-1]}));
  if(ty==='perfect'&&s.length===3)return arc(s);
  var pieces=[],cur=[s[0]],out=[];
  for(var k=1;k<s.length;k++){if(s[k]===s[k-1]){pieces.push(cur);cur=[s[k]]}else cur.push(s[k])}
  pieces.push(cur);
  pieces.forEach(function(pc,idx){var b=pc.length<2?pc:bez(pc);if(idx)b=b.slice(1);out=out.concat(b)});
  return out}
function pathOf(P){
  var out=[],n=P.length,i=0;
  if(n<2)return P.map(function(p){return{x:p.x,y:p.y}});
  while(i<n-1){
    var j=i+1;while(j<n-1&&!P[j].type)j++;
    var seg=[];for(var k=i;k<=j;k++){seg.push(P[k]);if(P[k].corner&&k>i&&k<j)seg.push(P[k])}
    var pts=segPts(P[i].type||'bezier',seg);
    if(out.length)pts.shift();
    out=out.concat(pts);i=j;
  }
  return out}
function straight(a,b){
  var P=(AB()||{pts:[]}).pts;if(b!==a+1)return false;
  var k=a;while(k>0&&!P[k].type)k--;
  var ty=P[k].type||'bezier';if(ty==='linear')return true;
  var j=k+1;while(j<P.length-1&&!P[j].type)j++;
  if(j-k+1===2)return true;
  return ty==='bezier'&&(a===k||!!P[a].corner)&&(b===j||!!P[b].corner)}
