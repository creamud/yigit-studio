import assert from 'node:assert/strict';
import {blendRenderPose} from '../dist/render-motion.js';
const before={x:0,y:.02,z:0,heading:0,pitch:0,roll:0,steer:0,steeringWheel:0,wheelTravel:0};
const after={x:1,y:.04,z:-2,heading:.1,pitch:.01,roll:-.02,steer:.3,steeringWheel:1,wheelTravel:2};
const half=blendRenderPose(before,after,.5);assert.equal(half.x,.5);assert.equal(half.z,-1);assert.equal(half.wheelTravel,1);assert.equal(half.steeringWheel,.5);
assert.deepEqual(blendRenderPose(null,after,.5),after);assert.deepEqual(blendRenderPose(before,after,1),after);
const reset={...after,x:100};assert.deepEqual(blendRenderPose(before,reset,.2),reset);
// Uniform movement remains uniform even when display frames fall between physics ticks.
const dt=1/120,v=20;for(const fps of [30,60,90,144]){let last=null;for(let i=2;i<fps;i++){const time=i/fps,tick=Math.floor(time/dt),alpha=(time-tick*dt)/dt;const p=blendRenderPose({...before,x:(tick-1)*dt*v},{...before,x:tick*dt*v},alpha);if(last!==null)assert(Math.abs(p.x-last-v/fps)<1e-9);last=p.x;}}
console.log('Render motion: interpolated position, steering, wheel travel, reset handling and uniform movement at 30–144 fps passed.');
