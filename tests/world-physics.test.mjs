import assert from 'node:assert/strict';
import {VehicleDynamics} from '../dist/driving.js';
import {DrivingWorld} from '../dist/world-physics.js';
const input={enabled:true,throttle:true,steer:0};
function world(colliders=[],heightAt=()=>0,roadDistance=()=>0){return new DrivingWorld({heightAt,roadDistance,colliders});}
function run(fps,colliders=[]){const d=new VehicleDynamics(),w=world(colliders),p={x:0,z:10,heading:0};let accumulator=0;for(let i=0;i<fps*4;i++){accumulator+=1/fps;while(accumulator>=1/120-1e-10){d.step(1/120,input);w.step(1/120,p,d);accumulator-=1/120;}}return {d,w,p};}
// A fast head-on approach must stop at a tree rather than tunnel through it.
const tree=run(60,[{type:'circle',x:0,z:0,radius:.25}]);assert(tree.p.z>2.5,JSON.stringify(tree.p));assert(Math.abs(tree.d.speed)<1);
const building=run(60,[{type:'box',x:0,z:0,hx:4,hz:4}]);assert(building.p.z>6.3);assert(Math.abs(building.d.speed)<1);
const left=run(30),right=run(144);assert(Math.abs(left.p.z-right.p.z)<1e-8);assert(Math.abs(left.w.y-right.w.y)<1e-8);
// No continuous shaking at rest; suspension settles to the ground and stays there.
const rest=world(),p={x:0,z:0,heading:0},d=new VehicleDynamics();for(let i=0;i<1200;i++)rest.step(1/120,p,d);const settled=rest.y;for(let i=0;i<120;i++)rest.step(1/120,p,d);assert(Math.abs(rest.y-settled)<1e-8);assert(Math.abs(rest.roll)<1e-8);
// Both wheel axes affect body attitude, not only the centre's height.
const slope=world([], (x,z)=>x*.2-z*.25,()=>20);const contact=slope.contact({x:0,z:0,heading:0});assert(contact.pitch>.2);assert(contact.roll>.15);
const paved=new VehicleDynamics(),grass=new VehicleDynamics();for(let i=0;i<1200;i++){paved.step(1/120,{...input,steer:.65},{grip:1});grass.step(1/120,{...input,steer:.65},{grip:.46});}assert(grass.speed<paved.speed);assert(grass.slip>0);
const steep=world([],x=>x,()=>20);d.speed=15;steep.step(1/120,{x:0,z:0,heading:0},d);assert(steep.flipped);steep.reset();assert(!steep.flipped);assert.equal(steep.roll,0);
// An obstacle approached at an angle leaves tangential travel for a glancing impact.
const glancing=world([{type:'circle',x:.8,z:0,radius:.3}]),gd=new VehicleDynamics(),gp={x:0,z:2.5,heading:0};gd.speed=15;glancing.step(1/120,gp,gd);assert(glancing.impact>0);assert(gp.z>2.3);assert(Number.isFinite(gd.yawRate));
console.log('World physics: tree/building contacts, fixed-step agreement, resting stability, wheel slopes, grip, rollover/reset and glancing collision passed.');
