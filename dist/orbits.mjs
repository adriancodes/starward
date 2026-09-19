// JPL approximate elements, table 1 (1800–2050), evaluated in Julian centuries from J2000.
// https://ssd.jpl.nasa.gov/planets/approx_pos.html
export const AU_KM = 149597870.7;
export const DAY = 86400000;
export const J2000 = Date.UTC(2000, 0, 1, 12);
export const MIN_TIME = Date.UTC(1800, 0, 1);
export const MAX_TIME = Date.UTC(2050, 11, 31, 23, 59, 59);
const rad = Math.PI / 180;
export const elements = {
 mercury:[[.38709927,.20563593,7.00497902,252.25032350,77.45779628,48.33076593],[.00000037,.00001906,-.00594749,149472.67411175,.16047689,-.12534081]],
 venus:[[.72333566,.00677672,3.39467605,181.97909950,131.60246718,76.67984255],[.00000390,-.00004107,-.00078890,58517.81538729,.00268329,-.27769418]],
 earth:[[1.00000261,.01671123,-.00001531,100.46457166,102.93768193,0],[.00000562,-.00004392,-.01294668,35999.37244981,.32327364,0]],
 mars:[[1.52371034,.09339410,1.84969142,-4.55343205,-23.94362959,49.55953891],[.00001847,.00007882,-.00813131,19140.30268499,.44441088,-.29257343]],
 jupiter:[[5.20288700,.04838624,1.30439695,34.39644051,14.72847983,100.47390909],[-.00011607,-.00013253,-.00183714,3034.74612775,.21252668,.20469106]],
 saturn:[[9.53667594,.05386179,2.48599187,49.95424423,92.59887831,113.66242448],[-.00125060,-.00050991,.00193609,1222.49362201,-.41897216,-.28867794]],
 uranus:[[19.18916464,.04725744,.77263783,313.23810451,170.95427630,74.01692503],[-.00196176,-.00004397,-.00242939,428.48202785,.40805281,.04240589]],
 neptune:[[30.06992276,.00859048,1.77004347,-55.12002969,44.96476227,131.78422574],[.00026291,.00005105,.00035372,218.45945325,-.32241464,-.00508664]]
};
export function eccentricAnomaly(mean,e) {
 let m = ((mean + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI;
 let E = m;
 for(let n=0;n<12;n++){const delta=(E-e*Math.sin(E)-m)/(1-e*Math.cos(E));E-=delta;if(Math.abs(delta)<1e-12)break;}
 return E;
}
function fromElements(a,e,i,node,peri,mean) {
 const E=eccentricAnomaly(mean,e), x=a*(Math.cos(E)-e), y=a*Math.sqrt(1-e*e)*Math.sin(E);
 const w=peri-node, cw=Math.cos(w),sw=Math.sin(w),cn=Math.cos(node),sn=Math.sin(node),ci=Math.cos(i),si=Math.sin(i);
 // Right-handed world: X = ecliptic X, Y = ecliptic north, Z = negative ecliptic Y.
 return [(cw*cn-sw*sn*ci)*x+(-sw*cn-cw*sn*ci)*y,sw*si*x+cw*si*y,-((cw*sn+sw*cn*ci)*x+(-sw*sn+cw*cn*ci)*y)];
}
export function positionAU(id,time,meanOverride) {
 if(id==='sun')return [0,0,0];
 if(!elements[id])throw new Error('Unknown planet');
 const T=(time-J2000)/DAY/36525,[base,rates]=elements[id];
 const [a,e,i,L,p,n]=base.map((v,k)=>v+rates[k]*T);
 return fromElements(a,e,i*rad,n*rad,p*rad,meanOverride??(L-p)*rad);
}
export function moonRelativeAU(time,meanOverride){
 const d=(time-J2000)/DAY+1.5;
 // Low-precision lunar ellipse with nodal/perigee precession; no solar perturbations.
 // https://stjarnhimlen.se/comp/ppcomp.html
 const node=(125.1228-.0529538083*d)*rad, w=(318.0634+.1643573223*d)*rad;
 return fromElements(384400/AU_KM,.0549,5.1454*rad,node,node+w,meanOverride??(115.3654+13.0649929509*d)*rad);
}
export function positionsAU(time){
 const out={sun:[0,0,0]};
 for(const id of Object.keys(elements))out[id]=positionAU(id,time);
 const moon=moonRelativeAU(time);
 out.earth=out.earth.map((v,i)=>v-moon[i]/82.30056);
 out.moon=out.earth.map((v,i)=>v+moon[i]);
 return out;
}
export const bodies = [
 {id:'sun',name:'Sun',category:'G-TYPE MAIN-SEQUENCE STAR',chapter:'00 / THE HEART OF OUR SYSTEM',radius:695700,period:0,rotation:609.12,tilt:7.25,size:6.5,color:0xffcf72,texture:'sun',distance:'—',description:'The star that makes it all possible. A sphere of glowing plasma holding our planetary family together.',detail:'The Sun holds about 99.8% of the solar system’s mass. Energy released by nuclear fusion in its core reaches Earth as the light and warmth that sustain life.',extra:'Equatorial rotation is about 25 days; its poles rotate more slowly.'},
 {id:'mercury',name:'Mercury',category:'TERRESTRIAL PLANET',chapter:'01 / THE TERRESTRIAL PLANETS',radius:2439.7,period:87.969,rotation:1407.6,tilt:.034,size:.72,color:0xaaa49c,texture:'mercury',description:'Small, swift, and scarred by impacts. Mercury races around the Sun in just 88 Earth days.',detail:'Mercury’s surface preserves billions of years of impacts. With almost no atmosphere to retain heat, the temperature changes dramatically between day and night.',extra:'A solar day on Mercury lasts about 176 Earth days.'},
 {id:'venus',name:'Venus',category:'TERRESTRIAL PLANET',chapter:'02 / THE TERRESTRIAL PLANETS',radius:6051.8,period:224.701,rotation:-5832.5,tilt:177.36,size:1.25,color:0xe6c28c,texture:'venus_atmosphere',description:'A brilliant world behind a veil of clouds. Our nearest planetary neighbor is also the hottest.',detail:'A dense carbon dioxide atmosphere traps heat beneath clouds of sulfuric acid. Venus rotates slowly in the opposite direction to most planets.',extra:'The cloud layer hides a rocky landscape of volcanoes and broad plains.'},
 {id:'earth',name:'Earth',category:'TERRESTRIAL PLANET',chapter:'03 / THE TERRESTRIAL PLANETS',radius:6371,period:365.256,rotation:23.934,tilt:23.44,size:1.4,color:0x6baadb,texture:'earth_daymap',description:'Our pale blue dot. An ocean world wrapped in a thin atmosphere, and the only home to life we know.',detail:'Liquid water covers about 71% of Earth’s surface. Its atmosphere and magnetic field help protect life, while the Moon shapes tides and helps stabilize Earth’s axial tilt.',extra:'The Moon is shown on a compressed orbit in the enhanced view. Switch to physical scale to appreciate the space between them.'},
 {id:'moon',name:'Moon',category:'NATURAL SATELLITE',chapter:'03.1 / OUR CELESTIAL COMPANION',radius:1737.4,period:27.322,rotation:655.728,tilt:6.68,size:.3818,color:0xaab0b5,texture:'moon',description:'Our constant companion. A cratered record of the past, turning one familiar face toward Earth.',detail:'The Moon rotates once per orbit, keeping nearly the same hemisphere facing Earth. Its dark plains are ancient lava flows; brighter highlands are older, heavily cratered terrain.',extra:'Its mean distance from Earth is 384,400 km. This model uses a precessing lunar ellipse, not a precision lunar ephemeris.'},
 {id:'mars',name:'Mars',category:'TERRESTRIAL PLANET',chapter:'04 / THE TERRESTRIAL PLANETS',radius:3389.5,period:686.980,rotation:24.623,tilt:25.19,size:1.02,color:0xd28a66,texture:'mars',description:'A world of rust-red deserts and ancient riverbeds. The next horizon for human exploration.',detail:'Mars has polar ice caps, giant volcanoes, and canyons that stretch for thousands of kilometers. Evidence of ancient water offers clues about a once very different climate.',extra:'A Martian day is only about 40 minutes longer than an Earth day.'},
 {id:'jupiter',name:'Jupiter',category:'GAS GIANT',chapter:'05 / THE OUTER PLANETS',radius:69911,period:4332.589,rotation:9.925,tilt:3.13,size:4.2,color:0xd7b99c,texture:'jupiter',description:'The giant of our solar system. A vast atmosphere of swirling clouds, powerful storms, and striped skies.',detail:'Jupiter’s colorful bands are clouds moving in opposite directions. Its Great Red Spot is an enormous storm that has persisted for centuries.',extra:'Jupiter rotates in just under ten hours, faster than any other planet.'},
 {id:'saturn',name:'Saturn',category:'GAS GIANT',chapter:'06 / THE OUTER PLANETS',radius:58232,period:10759.22,rotation:10.656,tilt:26.73,size:3.6,color:0xd9c79d,texture:'saturn',description:'A world encircled by ice. Saturn’s delicate rings are the solar system’s most recognizable silhouette.',detail:'Saturn’s rings contain countless particles of ice and rock, ranging from dust to mountain-sized chunks. The broad main rings are remarkably thin compared with their width.',extra:'The rings are shown with a radial texture, including the dark Cassini division.'},
 {id:'uranus',name:'Uranus',category:'ICE GIANT',chapter:'07 / THE OUTER PLANETS',radius:25362,period:30685.4,rotation:-17.24,tilt:97.77,size:2.4,color:0xa4dce2,texture:'uranus',description:'Quiet, blue-green, and tipped on its side. Uranus rolls through a long, cold orbit around the Sun.',detail:'Methane in Uranus’s atmosphere absorbs red light and gives the planet its blue-green appearance. Its extreme axial tilt creates seasons lasting decades.',extra:'The planet’s rotation axis lies almost in its orbital plane.'},
 {id:'neptune',name:'Neptune',category:'ICE GIANT',chapter:'08 / THE OUTER PLANETS',radius:24622,period:60189,rotation:16.11,tilt:28.32,size:2.3,color:0x628cdb,texture:'neptune',description:'A distant, windswept world. Neptune marks the outer edge of the eight-planet solar system.',detail:'Neptune’s cold atmosphere hosts powerful winds and changing dark storms. Sunlight takes more than four hours to reach this distant ice giant.',extra:'The texture’s blue color is enhanced; Neptune’s natural appearance is paler.'}
];
