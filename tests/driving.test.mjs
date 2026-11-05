import assert from 'node:assert/strict';
import {VehicleDynamics,drivingKey,steeringInput} from '../dist/driving.js';
import {closestRoadPose,mapPoint,MAP_BOUNDS} from '../dist/navigation.js';
assert.equal(drivingKey({code:'KeyD',key:'в'}),'d');assert.equal(steeringInput({d:true}),-1);assert.equal(steeringInput({a:true}),1);assert.equal(steeringInput({a:true,d:true}),0);
function run(turn){const d=new VehicleDynamics();let x=0,z=0,yaw=0;for(let i=0;i<360;i++){d.step(1/120,{enabled:true,throttle:true,steer:turn});yaw+=d.yawRate/120;x-=Math.sin(yaw)*d.speed/120;z-=Math.cos(yaw)*d.speed/120;assert(Number.isFinite(d.roll));assert(Math.abs(d.roll)<.2);assert(Math.abs(d.pitch)<.2);}return {d,x,z,yaw};}
const left=run(1),right=run(-1);assert(left.x<0);assert(right.x>0);assert(Math.abs(left.x+right.x)<1e-8);assert(Math.abs(left.yaw+right.yaw)<1e-8);assert(right.d.steeringWheel<0);assert(left.d.steeringWheel>0);
const reverse=new VehicleDynamics();for(let i=0;i<360;i++)reverse.step(1/120,{enabled:true,brake:true});assert(reverse.speed< -5);for(let i=0;i<400;i++)reverse.step(1/120,{enabled:true,throttle:true});assert(reverse.speed>1);
const stop=new VehicleDynamics();stop.speed=25;for(let i=0;i<360;i++)stop.step(1/120,{enabled:true,handbrake:true});assert.equal(stop.speed,0);
function simulate(fps){const d=new VehicleDynamics();let acc=0;for(let i=0;i<fps*8;i++){acc+=1/fps;while(acc>=1/120-1e-10){d.step(1/120,{enabled:true,throttle:true,steer:.4});acc-=1/120;}}return d;}
assert(Math.abs(simulate(30).speed-simulate(144).speed)<1e-8);
const disabled=new VehicleDynamics();disabled.step(1/120,{enabled:false,throttle:true});assert.equal(disabled.speed,0);
const samples=[{x:0,z:0},{x:0,z:-100},{x:100,z:-100},{x:100,z:0}];const recovered=closestRoadPose(samples,5,-30);assert(Math.abs(recovered.x-2.35)<1e-10);assert(Math.abs(recovered.z+30)<1e-10);assert(Math.abs(recovered.heading)<1e-10);
const p=mapPoint(MAP_BOUNDS.minX,MAP_BOUNDS.minZ);assert.equal(p.x,28);assert.equal(p.y,55);
console.log(JSON.stringify({left:{x:left.x,yaw:left.yaw},right:{x:right.x,yaw:right.yaw},boundedWeightTransfer:true,gearlessReverse:true,frameRatesAgree:true,recovery:recovered}));
