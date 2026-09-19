// 1 scene unit = 1,000 light-years. Simplified circular solar orbit and linear bulk motion.
// Local Group CMB dipole: PDG 2023, Cosmic Microwave Background, section 29.2.
export const SUN_RADIUS = 26.7;
export const GALACTIC_YEAR = 230e6;
export const BULK_SPEED = 620;
export const COSMIC_LIMIT = 500e6;
export const cosmicSpeeds = [10000,100000,1000000,2000000,5000000];
const l=271.9*Math.PI/180,b=29.6*Math.PI/180;
// Scene X points outwards through today's Sun; Y is Galactic north.
export const driftDirection=[-Math.cos(b)*Math.cos(l),Math.sin(b),Math.cos(b)*Math.sin(l)];
export function galacticMotion(years,drifting=true){
 if(!Number.isFinite(years))throw new Error('Galactic time must be finite');
 const angle=years/GALACTIC_YEAR*2*Math.PI;
 const center=driftDirection.map(v=>drifting?v*BULK_SPEED/299792.458*years/1000:0);
 const relativeSun=[SUN_RADIUS*Math.cos(angle),.02,SUN_RADIUS*Math.sin(angle)];
 return {center,relativeSun,sun:center.map((v,i)=>v+relativeSun[i]),distanceLy:Math.abs(years)*BULK_SPEED/299792.458};
}
