// Render between completed 120 Hz physics poses, independent of the display rate.
export function blendRenderPose(previous,current,alpha){
 if(!previous||Math.hypot(current.x-previous.x,current.y-previous.y,current.z-previous.z)>30)return {...current};
 const t=Math.max(0,Math.min(1,alpha)),result={};
 for(const key of Object.keys(current))result[key]=previous[key]+(current[key]-previous[key])*t;
 return result;
}
