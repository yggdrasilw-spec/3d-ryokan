import * as T from '../vendor/three.module.js';
const v=()=>new T.Vector3();
// Model-specific skin checks: pulp (not finger side), and thumb/index contact.
export function writingContact(kid,{tip,axis}){
 kid.root.updateMatrixWorld(true);const mesh=kid.root.getObjectByName('Human');mesh.skeleton.update();
 const g=mesh.geometry,vertices=[],names=[],faces={};
 for(let i=0;i<g.attributes.position.count;i++){
  vertices[i]=mesh.getVertexPosition(i,v()).applyMatrix4(mesh.matrixWorld);let max=0;
  for(let k=0;k<4;k++){const w=g.attributes.skinWeight.getComponent(i,k);if(w>max){max=w;names[i]=mesh.skeleton.bones[g.attributes.skinIndex.getComponent(i,k)].name;}}
 }
 for(let i=0;i<g.index.count;i+=3){const ids=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)];(faces[names[ids[0]]]??=[]).push(ids);}
 const line=new T.Line3(tip.clone().addScaledVector(axis,-.014),tip.clone().addScaledVector(axis,-.18)),upper=new T.Vector3(0,1,0).addScaledVector(axis,-axis.y).normalize();
 const pulp=vertices[1734].clone().lerp(vertices[1864],.5),pulpRadial=pulp.clone().sub(line.closestPointToPoint(pulp,true,v()));
 const pulpGap=pulpRadial.length()-.0035,pulpUpperDot=pulpRadial.clone().normalize().dot(upper),pulpVertices=2;
 const pulpNormal=new T.Vector3(0,0,1).applyQuaternion(kid.bones.index_03_r.getWorldQuaternion(new T.Quaternion())),pulpFacingDot=-pulpNormal.dot(pulpRadial.normalize());
 const index=[...(faces.index_02_r||[]),...(faces.index_03_r||[])],thumb=faces.thumb_03_r||[],tri=new T.Triangle(),near=v(),hit=v();
 let fingerGap=Infinity,crossings=0;
 for(const [first,second]of [[index,thumb],[thumb,index]])for(const a of first)for(const b of second){
  tri.set(...b.map(i=>vertices[i]));
  for(let e=0;e<3;e++){
   const start=vertices[a[e]],end=vertices[a[(e+1)%3]],length=start.distanceTo(end),ray=new T.Ray(start,end.clone().sub(start).normalize());
   fingerGap=Math.min(fingerGap,tri.closestPointToPoint(start,near).distanceTo(start));
   if(ray.intersectTriangle(...b.map(i=>vertices[i]),false,hit)&&start.distanceTo(hit)<length-1e-8)crossings++;
  }
 }
 const point=name=>kid.bones[name].getWorldPosition(v()),across=point('index_01_r').sub(point('pinky_01_r')).normalize();
 const thumbBase=point('thumb_01_r'),thumbMCP=point('thumb_02_r'),thumbIP=point('thumb_03_r'),thumbTip=kid.bones.thumb_03_r.localToWorld(new T.Vector3(0,.016,0));
 const thumbOpening=thumbMCP.clone().sub(thumbBase).dot(across),thumbReturn=thumbTip.clone().sub(thumbIP).dot(across);
 const indexTip=kid.bones.index_03_r.localToWorld(new T.Vector3(0,.016,0)),indexCenterOffset=indexTip.sub(tip).dot(axis.clone().cross(upper).normalize());
 return {pulpVertices,pulpGap,pulpUpperDot,pulpFacingDot,fingerGap,crossings,thumbOpening,thumbReturn,indexCenterOffset};
}
