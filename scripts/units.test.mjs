import test from 'node:test';
import assert from 'node:assert/strict';
import {calibrationFrustum,waterDepth,tub,items} from '../app/units.mjs';
test('200 liters occupies 25cm depth in the modeled bathtub',()=>{assert.equal(waterDepth(200),.25);assert.ok(Math.abs(tub.innerLength*tub.innerWidth*tub.innerHeight*1000-360)<1e-9);assert.equal(waterDepth(0),0);});
test('orthographic physical scale survives viewport changes',()=>{for(const [w,h]of [[390,500],[1200,700],[1800,1000]])for(const ppm of [2,3.78,6]){const f=calibrationFrustum(w,h,ppm);const rulerPixels=items.ruler.height/(f.top-f.bottom)*h;assert.ok(Math.abs(rulerPixels-300*ppm)<1e-8);const cmPixels=.01/(f.right-f.left)*w;assert.ok(Math.abs(cmPixels-10*ppm)<1e-8);}});
test('calibration refuses zero or invalid scale',()=>{assert.throws(()=>calibrationFrustum(100,100,0));assert.throws(()=>calibrationFrustum(0,100,4));});
test('reference water limits remain within tub wall height',()=>{assert.equal(waterDepth(1000),.25);assert.ok(waterDepth(200,15)<tub.innerHeight);});

