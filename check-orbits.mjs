import assert from 'node:assert/strict';
import { eccentricAnomaly, positionAU, positionsAU, moonRelativeAU, bodies, elements, AU_KM, DAY, J2000, MIN_TIME, MAX_TIME } from './dist/orbits.mjs';
for (const e of [0,.0167,.0549,.2056,.7]) for(const m of [-15,-Math.PI,-.1,0,.1,Math.PI,15]) {const E=eccentricAnomaly(m,e);assert.ok(Math.abs(Math.sin(E-e*Math.sin(E)-m))<1e-10,'Kepler residual');}
for(const date of [MIN_TIME,J2000,Date.UTC(2026,8,19),MAX_TIME]) {
 const positions=positionsAU(date);
 for(const [id,v] of Object.entries(positions))assert.ok(v.every(Number.isFinite),id+' finite');
 for(const id of Object.keys(elements)) {const peri=Math.hypot(...positionAU(id,date,0)),aph=Math.hypot(...positionAU(id,date,Math.PI));assert.ok(aph>peri&&peri>0,id+' ellipse');}
 const lunarKm=Math.hypot(...moonRelativeAU(date))*AU_KM;assert.ok(lunarKm>360000&&lunarKm<407000,'Lunar distance');
 const bary=positions.earth.map((v,i)=>v+(positions.moon[i]-v)/82.30056);const expected=positionAU('earth',date);assert.ok(Math.hypot(...bary.map((v,i)=>v-expected[i]))<1e-12,'Earth–Moon barycenter');
}
const earth=positionAU('earth',J2000);assert.ok(Math.abs(earth[0]+.177171)<.0001&&Math.abs(earth[2]+.967214)<.0001,'J2000 Earth orientation');
const repeat=positionAU('earth',J2000+365.256*DAY);assert.ok(Math.hypot(...repeat.map((v,i)=>v-earth[i]))<.001,'Earth orbital period');
assert.equal(bodies.length,10);assert.equal(new Set(bodies.map(b=>b.id)).size,10);
console.log('Passed: Kepler equation, orbital geometry, J2000 position, periods, lunar distances, barycenter, and body catalog.');

const { galacticMotion, SUN_RADIUS, GALACTIC_YEAR, BULK_SPEED } = await import('./dist/galactic-motion.mjs');
for(const years of [-500e6,-230e6,-1e6,0,1e6,230e6,500e6]){
 const p=galacticMotion(years);
 assert.ok(p.center.every(Number.isFinite)&&p.sun.every(Number.isFinite),'Finite cosmic positions');
 assert.ok(Math.abs(Math.hypot(p.sun[0]-p.center[0],p.sun[2]-p.center[2])-SUN_RADIUS)<1e-10,'Solar orbit follows moving galaxy');
 assert.ok(Math.abs(Math.hypot(...p.center)*1000-p.distanceLy)<1e-7,'Travel distance matches galaxy position');
 assert.deepEqual(galacticMotion(years,false).center,[0,0,0],'Galactocentric reference frame');
}
const start=galacticMotion(0),lap=galacticMotion(GALACTIC_YEAR),half=galacticMotion(GALACTIC_YEAR/2);
assert.ok(Math.abs(lap.relativeSun[0]-start.relativeSun[0])<1e-10&&Math.abs(lap.relativeSun[2])<1e-10,'Complete galactic orbit');
assert.ok(Math.abs(half.relativeSun[0]+SUN_RADIUS)<1e-10,'Half galactic orbit');
const forward=galacticMotion(1e6),reverse=galacticMotion(-1e6);
assert.ok(forward.center.every((v,i)=>Math.abs(v+reverse.center[i])<1e-12),'Reversible bulk motion');
assert.ok(Math.abs(forward.distanceLy-BULK_SPEED/299792.458*1e6)<1e-8,'km/s to light-year conversion');
assert.throws(()=>galacticMotion(NaN),'Invalid galactic time is rejected');
console.log('Passed: nested solar/galaxy motion, orbital closure, drift distance, reversal, reference frames, and invalid input.');
