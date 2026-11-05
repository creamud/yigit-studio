const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const damp=(v,t,rate,dt)=>t+(v-t)*Math.exp(-rate*dt);
export function drivingKey(e){return ({KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyR:'r',ArrowUp:'arrowup',ArrowDown:'arrowdown',ArrowLeft:'arrowleft',ArrowRight:'arrowright',Space:' '})[e.code]||String(e.key||'').toLowerCase();}
export function steeringInput(keys){return Number(!!(keys.a||keys.arrowleft))-Number(!!(keys.d||keys.arrowright));}
// Keyboard steering with grip-limited cornering, rolling resistance and weight transfer.
export class VehicleDynamics{
 constructor(){this.reset();}
 reset(){Object.assign(this,{speed:0,lateralSpeed:0,yawRate:0,steer:0,steeringWheel:0,throttle:0,brake:0,ax:0,ay:0,roll:0,pitch:0,travel:0,slip:0});}
 step(dt,input,{grip=1,grade=0,grounded=true}={}){
  const v=Math.abs(this.speed),turn=clamp(input.steer||0,-1,1);
  const maxYaw=.78/(1+v*.026);
  const maxSteer=Math.min(.58,Math.atan(2.875*maxYaw/Math.max(v,1)));
  this.steer=damp(this.steer,turn*maxSteer,turn?9:10,dt);
  this.steeringWheel=damp(this.steeringWheel,this.steer*12.5,16,dt);
  if(input.enabled===false){this.speed*=Math.exp(-dt*5);this.yawRate*=Math.exp(-dt*5);this.ax=0;return this;}
  const forward=!!input.throttle,backward=!!input.brake;
  const command=Number(forward)-Number(backward);
  const opposing=command!==0&&this.speed*command<0;
  this.throttle=damp(this.throttle,command!==0&&!opposing?1:0,8,dt);
  this.brake=damp(this.brake,input.handbrake||opposing||forward&&backward?1:0,12,dt);
  let acceleration;
  if(input.handbrake||forward&&backward)acceleration=-Math.sign(this.speed)*11;
  else if(opposing)acceleration=command*9;
  else if(command>0)acceleration=5.6/(1+v*.016);
  else if(command<0)acceleration=-3.5;
  else acceleration=-Math.sign(this.speed)*(1.15+v*.018);
  acceleration-=(1-grip)*(Math.sign(this.speed)*1.5+this.speed*.24);
  acceleration-=9.81*Math.sin(grade);
  if(!grounded)acceleration=-Math.sign(this.speed)*.05;
  const before=this.speed;
  this.speed+=acceleration*dt;
  if(before*this.speed<0&&(opposing||command===0||input.handbrake))this.speed=0;
  if(command===0&&Math.abs(grade)<.05&&Math.abs(this.speed)<.025)this.speed=0;
  this.speed=clamp(this.speed,-7.5,42);
  const idealYaw=this.speed/2.875*Math.tan(this.steer),gripLimit=9.81*grip/Math.max(v,2);
  const targetYaw=clamp(idealYaw,-gripLimit,gripLimit);
  this.yawRate=damp(this.yawRate,grounded?targetYaw:this.yawRate,grounded?9*grip:0,dt);
  this.ax=damp(this.ax,acceleration,9,dt);this.ay=this.yawRate*this.speed;
  const slide=-(idealYaw-targetYaw)*this.speed*.18;
  this.lateralSpeed=damp(this.lateralSpeed,slide,grounded?5*grip:.1,dt);this.roll=damp(this.roll,-this.ay*.003,7,dt);this.pitch=damp(this.pitch,this.ax*.003,7,dt);this.slip=Math.abs(this.lateralSpeed);
  this.travel+=this.speed*dt;return this;
 }
}
