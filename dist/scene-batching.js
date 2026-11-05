import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/utils/BufferGeometryUtils.js';
// Static scenery only: keep animated car parts, glass, terrain and ceiling independent.
export function batchScenery(root,exclude=new Set()){
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map();
 root.traverse(o=>{if(!o.isMesh||exclude.has(o)||Array.isArray(o.material)||o.material.transparent)return;
  if(!['BoxGeometry','ConeGeometry','CylinderGeometry','DodecahedronGeometry'].includes(o.geometry.type))return;
  const m=o.material,key=[m.type,m.color?.getHex(),m.roughness,m.metalness,m.emissive?.getHex(),m.emissiveIntensity,m.map?.uuid,m.side,o.castShadow,o.receiveShadow,!!o.geometry.index,Object.keys(o.geometry.attributes).sort().join(',')].join('|');
  if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
 });
 let removed=0,batches=0;for(const objects of groups.values()){if(objects.length<3)continue;const geometries=objects.map(o=>o.geometry.clone().applyMatrix4(new T.Matrix4().multiplyMatrices(inverse,o.matrixWorld)));const geo=mergeGeometries(geometries,false);if(!geo){geometries.forEach(g=>g.dispose());continue;}geo.computeBoundingSphere();const first=objects[0],mesh=new T.Mesh(geo,first.material);mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.name='static-scenery';for(const o of objects)o.removeFromParent();root.add(mesh);geometries.forEach(g=>g.dispose());removed+=objects.length;batches++;}
 return {removed,batches};
}
