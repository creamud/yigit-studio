export const MAP_BOUNDS={minX:-85,maxX:630,minZ:-460,maxZ:515};
export function closestRoadPose(samples,x,z,lane=2.35){
 let best=null,bestDistance=Infinity;
 for(let i=0;i<samples.length;i++){
  const a=samples[i],b=samples[(i+1)%samples.length],dx=b.x-a.x,dz=b.z-a.z,len2=dx*dx+dz*dz;
  if(len2<1e-8)continue;const t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/len2));
  const px=a.x+t*dx,pz=a.z+t*dz,dist=(x-px)**2+(z-pz)**2;
  if(dist<bestDistance){bestDistance=dist;const len=Math.sqrt(len2),tx=dx/len,tz=dz/len;best={x:px-tz*lane,z:pz+tx*lane,heading:Math.atan2(-tx,-tz),segment:i,distance:Math.sqrt(dist)};}
 }return best;
}
export function mapPoint(x,z,w=800,h=600){const b=MAP_BOUNDS;return {x:28+(x-b.minX)/(b.maxX-b.minX)*(w-56),y:55+(z-b.minZ)/(b.maxZ-b.minZ)*(h-90)};}
export function drawWorldMap(ctx,area,{samples,cities,position,heading=0,destination=null,parked=false}){
 const {x=0,y=0,w=800,h=600}=area;ctx.save();ctx.translate(x,y);ctx.scale(w/800,h/600);
 ctx.fillStyle='#f2f2f4';ctx.fillRect(0,0,800,600);
 ctx.fillStyle='#e7e8eb';for(let i=0;i<20;i++){ctx.beginPath();ctx.ellipse(90+(i*119)%690,85+(i*81)%510,49,33,.2,0,Math.PI*2);ctx.fill();}
 const coast=mapPoint(-34,0).x;ctx.fillStyle='#dce2e8';ctx.fillRect(0,0,coast,600);
 const path=()=>{ctx.beginPath();samples.forEach((p,i)=>{const q=mapPoint(p.x,p.z);i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);});ctx.closePath();};
 path();ctx.lineWidth=14;ctx.strokeStyle='#fff';ctx.stroke();path();ctx.lineWidth=3;ctx.strokeStyle='#a1a1a6';ctx.stroke();
 if(destination){const target=cities.find(c=>c.name===destination);if(target){const pose=closestRoadPose(samples,position.x,position.z,0);let start=pose.segment,end=target.index;ctx.beginPath();let n=0;for(let i=start;n<samples.length;i=(i+1)%samples.length,n++){const q=mapPoint(samples[i].x,samples[i].z);n?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);if(i===end)break;}ctx.strokeStyle='#4488c5';ctx.lineWidth=6;ctx.stroke();}}
 const markers=[];for(const city of cities){const p=mapPoint(city.x,city.z);ctx.fillStyle=city.name===destination?'#48484a':'#fff';ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8e8e93';ctx.lineWidth=2;ctx.stroke();ctx.font='600 21px -apple-system, BlinkMacSystemFont, "Helvetica Neue", "General Sans", sans-serif';ctx.textAlign='center';const tw=ctx.measureText(city.name).width;ctx.fillStyle='#ffffffed';ctx.beginPath();ctx.roundRect(p.x-tw/2-11,p.y-42,tw+22,28,6);ctx.fill();ctx.fillStyle='#48484a';ctx.fillText(city.name,p.x,p.y-21);markers.push({name:city.name,x:x+p.x*w/800,y:y+p.y*h/600});}
 const pos=mapPoint(position.x,position.z);ctx.save();ctx.translate(pos.x,pos.y);ctx.rotate(-heading);ctx.fillStyle='#4488c5';ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(-9,10);ctx.lineTo(0,6);ctx.lineTo(9,10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
 ctx.textAlign='left';ctx.fillStyle='#ffffffed';ctx.beginPath();ctx.roundRect(23,15,270,38,8);ctx.fill();ctx.fillStyle='#86868b';ctx.font='18px -apple-system, BlinkMacSystemFont, "Helvetica Neue", "General Sans", sans-serif';ctx.fillText(destination?'⌖  '+destination:'⌕   Navigasyon',39,40);
 ctx.font='14px -apple-system, BlinkMacSystemFont, "Helvetica Neue", "General Sans", sans-serif';ctx.fillStyle='#8e8e93';ctx.fillText(parked?'Otopark':'Sahil yolu',25,581);ctx.restore();return markers;
}
