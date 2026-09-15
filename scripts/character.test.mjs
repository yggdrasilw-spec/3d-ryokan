import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../app/vendor/three.module.js';
import {GLTFLoader} from '../app/vendor/GLTFLoader.js';
import {createCharacter,solveLimb} from '../app/character-rig.mjs';
import {graspProfile,graspPose} from '../app/grasp.mjs';
import {items} from '../app/units.mjs';
const v=(...a)=>new T.Vector3(...a);
async function loadRig(){
 // Load the actual exported mesh and skin weights in Node, omitting only browser textures.
 const b=await readFile(new URL('../app/models/child-makehuman.glb',import.meta.url));
 const len=b.readUInt32LE(12),json=JSON.parse(b.subarray(20,20+len).toString());
 for(const mat of json.materials||[]) {delete mat.normalTexture;delete mat.occlusionTexture;delete mat.emissiveTexture;if(mat.pbrMetallicRoughness){delete mat.pbrMetallicRoughness.baseColorTexture;delete mat.pbrMetallicRoughness.metallicRoughnessTexture;}}
 delete json.images;delete json.textures;
 let txt=Buffer.from(JSON.stringify(json));txt=Buffer.concat([txt,Buffer.alloc((4-txt.length%4)%4,32)]);
 const bin=b.subarray(20+len),out=Buffer.alloc(20+txt.length+bin.length);b.copy(out,0,0,12);out.writeUInt32LE(out.length,8);out.writeUInt32LE(txt.length,12);out.writeUInt32LE(0x4e4f534a,16);txt.copy(out,20);bin.copy(out,20+txt.length);
 const gltf=await new GLTFLoader().parseAsync(out.buffer.slice(out.byteOffset,out.byteOffset+out.byteLength),'');
 return createCharacter(new T.Scene(),gltf);
}
test('unreachable wrist is clamped without stretching either bone',()=>{
 for(const target of [v(0,0,0),v(0,-2,0),v(0,0,2),v(.02,-.3,.2)]){
  const p=solveLimb(v(),target,v(-.4,-.85,-.32),.178,.180);
  assert.ok(Math.abs(p.elbow.length()-.178)<1e-9);
  assert.ok(Math.abs(p.elbow.distanceTo(p.wrist)-.180)<1e-9);
  assert.ok(p.wrist.length()<=.354001);
 }
});
test('actual MakeHuman rig: wrists follow targets, bone lengths stay fixed across facing directions',async()=>{
 const kid=await loadRig();
 for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){
  kid.root.position.set(.2,0,.3);kid.root.rotation.y=yaw;
  for(let i=0;i<=60;i++){
   const p=i/60,right=v(-.19,.70,.06).lerp(v(-.214,.7375,.197),p),left=v(.19,.70,.06);
   kid.pose({right,left,rightGrip:p*.85,palms:{r:{long:v(0,-1,.12).lerp(v(0,0,1),p).normalize(),normal:v(1,0,0)}}});
   for(const [side,a] of Object.entries(kid.arms)){
    const wp=b=>kid.root.worldToLocal(b.getWorldPosition(v()));
    assert.ok(Math.abs(wp(a.upper).distanceTo(wp(a.lower))-a.length1)<1e-5);
    assert.ok(Math.abs(wp(a.lower).distanceTo(wp(a.hand))-a.length2)<1e-5);
    assert.ok(wp(a.hand).distanceTo(side==='r'?right:left)<1e-5,`${yaw}/${i}/${side}`);
    assert.ok(kid.diagnostics[side].elbow[1]<kid.diagnostics[side].shoulder[1]);
    assert.ok(kid.diagnostics[side].elbow[2]<kid.diagnostics[side].wrist[2]);
    const change=a.lowerRest.clone().invert().multiply(a.lower.quaternion);
    const axis=v(change.x,change.y,change.z);
    if(axis.length()>1e-5)assert.ok(Math.abs(axis.normalize().dot(a.hingeAxis))>.999,'Elbow must flex on its hinge, without sideways twist');
   }
  }
 }
});
test('sitting lowers hips without changing pelvis sideways position',async()=>{
 const kid=await loadRig();kid.pose({right:v(-.19,.70,.06),left:v(.19,.70,.06)});
 const before=kid.bones.pelvis.getWorldPosition(v());
 kid.pose({right:v(-.19,.70,.06),left:v(.19,.70,.06),sit:1});
 const after=kid.bones.pelvis.getWorldPosition(v());
 assert.ok(Math.abs(before.y-after.y-.42)<1e-5);assert.ok(Math.abs(before.x-after.x)<1e-5);assert.ok(Math.abs(before.z-after.z)<1e-5);
});
test('every catalog grasp is within reach at contact, lift and presentation',async()=>{
 const kid=await loadRig();
 for(const [id,d] of Object.entries(items)){
  const {large}=graspProfile(d,id),contact=v(large?0:-.17,.701,.185),present=v(large?0:-.09,.81,.27);
  for(let i=0;i<=30;i++){
   const p=i/30,position=contact.clone().lerp(present,p);
   kid.pose(graspPose(d,id,position,1,1));
   for(const side of ['r','l'])assert.equal(kid.diagnostics[side].limited,false,`${id} ${side} ${p} cannot reach`);
  }
 }
});
