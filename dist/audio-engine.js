export class VehicleAudio{
 constructor(levels){this.levels=levels;this.ctx=null;}
 async unlock(){
  if(this.ctx){if(this.ctx.state==='suspended')await this.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  this.ctx=new C();const c=this.ctx;
  this.vehicle=c.createGain();this.vehicle.gain.value=this.levels.vehicle/100;this.vehicle.connect(c.destination);
  this.ui=c.createGain();this.ui.gain.value=this.levels.buttons/100;this.ui.connect(c.destination);
  this.motorGain=c.createGain();this.motorGain.gain.value=0;this.motorGain.connect(this.vehicle);
  this.motor1=c.createOscillator();this.motor1.type='sine';this.motor1.frequency.value=120;this.motor1.connect(this.motorGain);this.motor1.start();
  this.motor2=c.createOscillator();this.motor2.type='sine';this.motor2.frequency.value=240;const overtone=c.createGain();overtone.gain.value=.2;this.motor2.connect(overtone).connect(this.motorGain);this.motor2.start();
  const noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=noise.getChannelData(0);let low=0;
  for(let i=0;i<d.length;i++){low=low*.98+(Math.random()*2-1)*.02;d[i]=low*3;}
  this.road=c.createBufferSource();this.road.buffer=noise;this.road.loop=true;
  this.roadFilter=c.createBiquadFilter();this.roadFilter.type='lowpass';this.roadFilter.frequency.value=350;
  this.roadGain=c.createGain();this.roadGain.gain.value=0;this.road.connect(this.roadFilter).connect(this.roadGain).connect(this.vehicle);this.road.start();
  this.wind=c.createBufferSource();this.wind.buffer=noise;this.wind.loop=true;this.wind.playbackRate.value=1.7;
  this.windFilter=c.createBiquadFilter();this.windFilter.type='highpass';this.windFilter.frequency.value=450;
  this.windGain=c.createGain();this.windGain.gain.value=0;this.wind.connect(this.windFilter).connect(this.windGain).connect(this.vehicle);this.wind.start();
  await c.resume();
 }
 setLevels(levels){this.levels=levels;if(!this.ctx)return;this.vehicle.gain.setTargetAtTime(levels.vehicle/100,this.ctx.currentTime,.05);this.ui.gain.setTargetAtTime(levels.buttons/100,this.ctx.currentTime,.03);}
 tone(freq,duration,gain,target,start=0){if(!this.ctx)return;const c=this.ctx,o=c.createOscillator(),g=c.createGain(),t=c.currentTime+start;o.type='sine';o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(freq*.78,t+duration);g.gain.setValueAtTime(.00001,t);g.gain.exponentialRampToValueAtTime(gain,t+.005);g.gain.exponentialRampToValueAtTime(.00001,t+duration);o.connect(g).connect(target);o.start(t);o.stop(t+duration+.02);}
 click(){this.tone(1050,.035,.045,this.ui);}
 chime(){this.tone(660,.14,.055,this.ui);this.tone(880,.19,.045,this.ui,.11);}
 horn(){if(!this.ctx)return;this.tone(349,.45,.1,this.vehicle);this.tone(440,.45,.09,this.vehicle);}
 impact(strength){if(!this.ctx||this.ctx.currentTime-(this.lastImpact||0)<.18)return;this.lastImpact=this.ctx.currentTime;this.tone(55,.17,Math.min(.19,strength*.009),this.vehicle);}
 update(dynamics,active,inside){if(!this.ctx)return;const t=this.ctx.currentTime,v=Math.abs(dynamics.speed),audible=active&&document.hasFocus()&&!document.hidden,atten=inside?.6:1;this.motor1.frequency.setTargetAtTime(90+v*10,t,.09);this.motor2.frequency.setTargetAtTime(180+v*20,t,.09);this.motorGain.gain.setTargetAtTime(audible?Math.min(.028,(.002+v*.0004))*(.3+dynamics.throttle)*atten:0,t,.12);this.roadFilter.frequency.setTargetAtTime(250+v*24+(dynamics.slip||0)*70,t,.2);this.roadGain.gain.setTargetAtTime(audible?Math.min(.22,v*.005)*atten:0,t,.15);this.windGain.gain.setTargetAtTime(audible?Math.min(.13,v*v*.000045)*atten:0,t,.2);}
}
