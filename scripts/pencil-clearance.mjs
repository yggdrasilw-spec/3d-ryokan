import * as T from '../vendor/three.module.js';
const v=()=>new T.Vector3();
// Exact distance from a finite axis segment to each deformed skin triangle.
// A circular envelope conservatively contains the hexagonal pencil barrel.
export function pencilClearance(kid,{tip,axis}){
 kid.root.updateMatrixWorld(true);
 const triangle=new T.Triangle(),hit=v(),onRay=v(),onEdge=v(),nearest=v();
 function distance(a,b,c,start,end,ray,length){
  triangle.set(a,b,c);
  if(ray.intersectTriangle(a,b,c,false,hit)&&hit.distanceTo(start)<=length)return 0;
  let result=Math.min(triangle.closestPointToPoint(start,nearest).distanceTo(start),triangle.closestPointToPoint(end,nearest).distanceTo(end));
  for(const [p,q] of [[a,b],[b,c],[c,a]]){
   const squared=ray.distanceSqToSegment(p,q,onRay,onEdge);
   if(onRay.distanceTo(start)<=length)result=Math.min(result,Math.sqrt(Math.max(0,squared)));
  }
  return result;
 }
 const sections=[[-.180,-.014,.0035],[-.014,-.003,.0035],[-.003,0,.0008]].map(([back,front,radius])=>{
  const start=tip.clone().addScaledVector(axis,front),end=tip.clone().addScaledVector(axis,back);
  return {start,end,ray:new T.Ray(start,end.clone().sub(start).normalize()),length:start.distanceTo(end),radius};
 });
 const clearances={},barrelContacts={},barrelJointContacts={};let triangles=0;
 kid.root.traverse(mesh=>{
  if(!mesh.isSkinnedMesh)return;
  mesh.skeleton.update();const g=mesh.geometry,vertices=[];
  for(let i=0;i<g.attributes.position.count;i++)vertices.push(mesh.getVertexPosition(i,v()).applyMatrix4(mesh.matrixWorld));
  for(let i=0;i<g.index.count;i+=3){
   const ids=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)],points=ids.map(j=>vertices[j]);triangles++;
   let name=mesh.name,joint=mesh.name,max=0;
   if(name==='Human')for(let j=0;j<4;j++){
    const weight=g.attributes.skinWeight.getComponent(ids[0],j);
    if(weight>max){max=weight;joint=mesh.skeleton.bones[g.attributes.skinIndex.getComponent(ids[0],j)].name;name=joint.replace(/_0[123]/,'');}
   }
   for(let j=0;j<sections.length;j++){
    const s=sections[j],gap=distance(...points,s.start,s.end,s.ray,s.length)-s.radius;
    clearances[name]=Math.min(clearances[name]??Infinity,gap);
    if(j===0){barrelContacts[name]=Math.min(barrelContacts[name]??Infinity,gap);barrelJointContacts[joint]=Math.min(barrelJointContacts[joint]??Infinity,gap);}
   }
  }
 });
 return {triangles,clearances,barrelContacts,barrelJointContacts,minimum:Math.min(...Object.values(clearances))};
}
