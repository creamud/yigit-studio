// Fixed-step terrain contact and impulse response. Units: metres, seconds, radians.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const damp=(v,t,r,dt)=>t+(v-t)*Math.exp(-r*dt);
export class DrivingWorld {
 constructor({heightAt,roadDistance,colliders=[]}){this.heightAt=heightAt;this.roadDistance=roadDistance;this.colliders=colliders;this.reset();}
 reset(y=.02){Object.assign(this,{y,vy:0,pitch:0,roll:0,grade:0,crossSlope:0,flipped:false,rollVelocity:0,impact:0,roughness:0,grounded:true});}
 surface(x,z){const distance=this.roadDistance(x,z);if(distance<5.7)return .02+.0012*Math.sin(x*3.1)*Math.sin(z*2.9);const blend=clamp((distance-5.7)/3,0,1);return .02+blend*(this.heightAt(x,z)+.025*Math.sin(x*3.2)*Math.sin(z*2.1));}
 contact(pose){const {x,z,heading}=pose,c=Math.cos(heading),s=Math.sin(heading);const point=(lx,lz)=>this.surface(x+c*lx+s*lz,z-s*lx+c*lz);const fl=point(-.81,-1.4375),fr=point(.81,-1.4375),rl=point(-.81,1.4375),rr=point(.81,1.4375);return {height:(fl+fr+rl+rr)/4,pitch:Math.atan2((fl+fr-rl-rr)/2,2.875),roll:Math.atan2((fr+rr-fl-rl)/2,1.62)};}
 resolve(pose,d,obstacle){
  const c=Math.cos(pose.heading),s=Math.sin(pose.heading),dx=obstacle.x-pose.x,dz=obstacle.z-pose.z;
  let nx,nz,depth,armX,armZ;
  if(obstacle.type==='box'){
   const axes=[[c,-s],[s,c],[1,0],[0,1]];depth=Infinity;
   for(const [ax,az]of axes){const ra=.96*Math.abs(ax*c-az*s)+2.34*Math.abs(ax*s+az*c),rb=obstacle.hx*Math.abs(ax)+obstacle.hz*Math.abs(az),projection=dx*ax+dz*az,overlap=ra+rb-Math.abs(projection);if(overlap<=0)return 0;if(overlap<depth){depth=overlap;const sign=projection>0?-1:1;nx=ax*sign;nz=az*sign;}}
   armX=clamp(c*dx-s*dz,-.96,.96);armZ=clamp(s*dx+c*dz,-2.34,2.34);
  }else{
   const lx=c*dx-s*dz,lz=s*dx+c*dz,qx=clamp(lx,-.96,.96),qz=clamp(lz,-2.34,2.34),ex=qx-lx,ez=qz-lz,len=Math.hypot(ex,ez),radius=obstacle.radius;
   if(len>=radius)return 0;let ax,az;
   if(len>1e-8){ax=ex/len;az=ez/len;depth=radius-len;}else if(.96-Math.abs(lx)<2.34-Math.abs(lz)){ax=lx>0?-1:1;az=0;depth=radius+.96-Math.abs(lx);}else{ax=0;az=lz>0?-1:1;depth=radius+2.34-Math.abs(lz);}
   nx=c*ax+s*az;nz=-s*ax+c*az;armX=qx;armZ=qz;
  }
  pose.x+=nx*(depth+.001);pose.z+=nz*(depth+.001);
  const fx=-s,fz=-c,lx=-c,lz=s;let vx=fx*d.speed+lx*d.lateralSpeed,vz=fz*d.speed+lz*d.lateralSpeed;const vn=vx*nx+vz*nz;
  if(vn>=0)return 0;const impact=-vn,impulse=-(1.08)*vn;vx+=impulse*nx;vz+=impulse*nz;
  const tangentX=-nz,tangentZ=nx,vt=vx*tangentX+vz*tangentZ,friction=clamp(vt,-impact*.55,impact*.55);vx-=friction*tangentX;vz-=friction*tangentZ;
  d.speed=vx*fx+vz*fz;d.lateralSpeed=vx*lx+vz*lz;const normalX=c*nx-s*nz,normalZ=s*nx+c*nz;d.yawRate+=clamp((armZ*normalX-armX*normalZ)*impulse*.055,-1.3,1.3);
  if(impact>17&&Math.abs(armX)>.7&&Math.abs(armZ)<1.8&&!this.flipped){this.flipped=true;this.rollVelocity=Math.sign(armX)*2.6;}
  return impact;
 }
 step(dt,pose,d){
  this.impact*=Math.exp(-dt*8);const beforeSpeed=d.speed,s=Math.sin(pose.heading),c=Math.cos(pose.heading);
  pose.heading+=d.yawRate*dt;
  pose.x+=(-s*d.speed-c*d.lateralSpeed)*dt;pose.z+=(-c*d.speed+s*d.lateralSpeed)*dt;
  // Substeps are capped at 1/120 s; 42 m/s travels at most .35 m per contact test.
  for(let pass=0;pass<2;pass++)for(const o of this.colliders){const reach=(o.radius||Math.hypot(o.hx,o.hz))+3;if(Math.abs(o.x-pose.x)>reach||Math.abs(o.z-pose.z)>reach)continue;if(o.bottom!==undefined&&this.y+1.4<o.bottom||o.top!==undefined&&this.y>o.top)continue;this.impact=Math.max(this.impact,this.resolve(pose,d,o));}
  const ground=this.contact(pose);this.grade=ground.pitch;this.crossSlope=ground.roll;this.roughness=clamp((this.roadDistance(pose.x,pose.z)-5.7)/4,0,1);
  const spring=Math.max(0,110*(ground.height+.0892-this.y)-16*this.vy);this.vy+=(spring-9.81)*dt;this.y+=this.vy*dt;
  if(this.y<ground.height-.07){this.impact=Math.max(this.impact,Math.abs(this.vy)*1.5);this.y=ground.height-.07;this.vy=Math.max(0,-this.vy*.12);}
  this.grounded=this.y-ground.height<.19;
  if(!this.flipped&&((Math.abs(ground.roll)>.64&&Math.abs(beforeSpeed)>9)||(this.roughness>.6&&Math.abs(d.ay)>13&&Math.abs(beforeSpeed)>14))){this.flipped=true;this.rollVelocity=Math.sign(ground.roll||-d.ay)*2.5;}
  if(this.flipped){const direction=Math.sign(this.rollVelocity)||Math.sign(this.roll)||1,target=direction*Math.PI;this.roll=damp(this.roll,target,2.2,dt);this.pitch=damp(this.pitch,ground.pitch*.4,4,dt);d.speed*=Math.exp(-dt*3);d.lateralSpeed*=Math.exp(-dt*3);d.yawRate*=Math.exp(-dt*4);const underside=.64*Math.max(0,Math.cos(this.roll))+.8*Math.max(0,-Math.cos(this.roll))+.96*Math.abs(Math.sin(this.roll));this.y=ground.height+Math.max(0,underside-.64)+.02;this.vy=0;}
  else{this.pitch=damp(this.pitch,ground.pitch+clamp(d.ax*.003,-.028,.028),7,dt);this.roll=damp(this.roll,ground.roll+clamp(-d.ay*.003,-.04,.04),7,dt);}
  return pose;
 }
}
