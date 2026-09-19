import * as THREE from 'three';
import { galacticMotion, SUN_RADIUS, driftDirection } from './galactic-motion.mjs';

// Statistical barred-spiral visualization, not a survey of individual Milky Way stars.
export function createGalaxy(){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x03060c);
 const galaxy=new THREE.Group();scene.add(galaxy);
 let seed=2019;const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
 const normal=()=>Math.sqrt(-2*Math.log(Math.max(rand(),1e-8)))*Math.cos(2*Math.PI*rand());
 const positions=[],colors=[],sizes=[],periods=[];
 const count=85000;
 for(let i=0;i<count;i++){
  let x,y,z,r;
  if(i<19000){r=Math.abs(normal())*4.2;const a=rand()*Math.PI*2;x=Math.cos(a)*r*1.6;z=Math.sin(a)*r*.63;y=normal()*Math.exp(-r/6)*1.7;}
  else {r=4+Math.pow(rand(),.72)*46;const arm=i%4;let a=arm*Math.PI/2+Math.log(r/5)*3.4+normal()*(i%5===0?.65:.10+.15*r/50);x=r*Math.cos(a);z=r*Math.sin(a);y=normal()*(.25+.009*r);}
  positions.push(x,y,z);r=Math.hypot(x,z);const warm=Math.max(0,1-r/22),bright=.32+rand()*.9;
  colors.push(bright*(.55+warm*.45),bright*(.65+warm*.10),bright*(1-warm*.53));
  sizes.push(.6+Math.pow(rand(),7)*2.4);periods.push(Math.max(22,230*r/SUN_RADIUS));
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('pointSize',new THREE.Float32BufferAttribute(sizes,1));geometry.setAttribute('period',new THREE.Float32BufferAttribute(periods,1));
 const material=new THREE.ShaderMaterial({uniforms:{years:{value:0},pixelRatio:{value:Math.min(devicePixelRatio,2)}},vertexShader:`attribute vec3 color; attribute float pointSize; attribute float period; uniform float years; uniform float pixelRatio; varying vec3 vColor;
 void main(){float angle=years/1000000.0/period*6.2831853;float c=cos(angle),s=sin(angle);vec3 p=vec3(position.x*c-position.z*s,position.y,position.x*s+position.z*c);vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(pointSize*pixelRatio*210.0/max(-mv.z,1.0),.7,9.0);vColor=color;}`,
 fragmentShader:`varying vec3 vColor;void main(){float r=length(gl_PointCoord-.5)*2.0;if(r>1.0)discard;float glow=pow(1.0-r,2.1);gl_FragColor=vec4(vColor,glow*.70);}`,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
 galaxy.add(new THREE.Points(geometry,material));
 // Unresolved stellar light supplies the broad disc and central bulge, with soft point kernels.
 const hazePositions=[],hazeColors=[],hazeSizes=[],hazePeriods=[];
 for(let i=0;i<10000;i++){const r=Math.pow(rand(),1.3)*45,angle=(i%4)*Math.PI/2+Math.log(Math.max(r,4)/5)*3.4+normal()*.2;hazePositions.push(Math.cos(angle)*r,normal()*.25,Math.sin(angle)*r);const core=Math.exp(-r/10);hazeColors.push(.1+core*.65,.16+core*.34,.3+core*.1);hazeSizes.push(6+rand()*9);hazePeriods.push(Math.max(22,230*r/SUN_RADIUS));}
 const hazeGeometry=new THREE.BufferGeometry();hazeGeometry.setAttribute('position',new THREE.Float32BufferAttribute(hazePositions,3));hazeGeometry.setAttribute('color',new THREE.Float32BufferAttribute(hazeColors,3));hazeGeometry.setAttribute('pointSize',new THREE.Float32BufferAttribute(hazeSizes,1));hazeGeometry.setAttribute('period',new THREE.Float32BufferAttribute(hazePeriods,1));
 const hazeMaterial=material.clone();hazeMaterial.uniforms=material.uniforms;hazeMaterial.vertexShader=hazeMaterial.vertexShader.replace(',.7,9.0)',',2.0,28.0)');hazeMaterial.fragmentShader=hazeMaterial.fragmentShader.replace('glow*.70','glow*.035');galaxy.add(new THREE.Points(hazeGeometry,hazeMaterial));
 const orbit=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({length:256},(_,i)=>new THREE.Vector3(Math.cos(i/256*Math.PI*2)*SUN_RADIUS,.07,Math.sin(i/256*Math.PI*2)*SUN_RADIUS))),new THREE.LineBasicMaterial({color:0xa8e8c5,transparent:true,opacity:.45}));galaxy.add(orbit);
 const sun=new THREE.Group();galaxy.add(sun);sun.add(new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),new THREE.MeshBasicMaterial({color:0xd9ffe8})));
 const ring=new THREE.Mesh(new THREE.RingGeometry(.48,.53,48),new THREE.MeshBasicMaterial({color:0xb5e7ce,side:THREE.DoubleSide,transparent:true,opacity:.8}));sun.add(ring);
 const centerDot=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),new THREE.MeshBasicMaterial({color:0xffd292}));galaxy.add(centerDot);
 const track=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xdeb780,transparent:true,opacity:.55}));scene.add(track);
 const sunTrack=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x94c9d5,transparent:true,opacity:.36}));scene.add(sunTrack);
 const direction=new THREE.Vector3(...driftDirection);const arrow=new THREE.ArrowHelper(direction,new THREE.Vector3(),22,0xd7ba85,2.1,.8);scene.add(arrow);
 const origin=new THREE.Mesh(new THREE.SphereGeometry(.45,12,8),new THREE.MeshBasicMaterial({color:0xe0c7a4}));scene.add(origin);
 const grid=new THREE.GridHelper(1600,80,0x314256,0x182636);grid.position.y=-12;grid.material.transparent=true;grid.material.opacity=.2;scene.add(grid);
 const backdropPositions=[];for(let i=0;i<4000;i++)backdropPositions.push((rand()-.5)*2500,(rand()-.5)*1800,(rand()-.5)*2500);
 const backdropGeometry=new THREE.BufferGeometry();backdropGeometry.setAttribute('position',new THREE.Float32BufferAttribute(backdropPositions,3));const backdrop=new THREE.Points(backdropGeometry,new THREE.PointsMaterial({color:0x657a99,size:1,sizeAttenuation:false,transparent:true,opacity:.5}));scene.add(backdrop);
 const trailsCount=240,trackPoints=new Float32Array((trailsCount+1)*3),sunPoints=new Float32Array((trailsCount+1)*3);track.geometry.setAttribute('position',new THREE.BufferAttribute(trackPoints,3));sunTrack.geometry.setAttribute('position',new THREE.BufferAttribute(sunPoints,3));
 let current=galacticMotion(0),lastYears=NaN,lastMode=null;
 function update(years,cosmic,paths,stars){
  current=galacticMotion(years,cosmic);galaxy.position.fromArray(current.center);sun.position.fromArray(current.relativeSun);material.uniforms.years.value=years;orbit.visible=paths;track.visible=sunTrack.visible=cosmic&&paths;arrow.visible=origin.visible=cosmic;grid.visible=cosmic;backdrop.visible=stars;arrow.position.copy(galaxy.position);
  if(years!==lastYears||cosmic!==lastMode){for(let i=0;i<=trailsCount;i++){const p=galacticMotion(years*i/trailsCount,cosmic);trackPoints.set(p.center,i*3);sunPoints.set(p.sun,i*3);}for(const line of [track,sunTrack]){line.geometry.attributes.position.needsUpdate=true;line.geometry.computeBoundingSphere();}lastYears=years;lastMode=cosmic;}
 }
 function target(frame){return new THREE.Vector3(...(frame==='sun'?current.sun:frame==='fixed'?[0,0,0]:current.center));}
 function labels(camera,width,height,visible){
  ring.quaternion.copy(camera.quaternion);
  const points=[['cosmic-sun-label',current.sun],['cosmic-center-label',current.center],['cosmic-origin-label',[0,0,0]]];
  for(const [id,pos] of points){const label=document.getElementById(id);const v=new THREE.Vector3(...pos).project(camera);const x=(v.x*.5+.5)*width,y=(-v.y*.5+.5)*height;
   const show=visible&&v.z>-1&&v.z<1&&y>100&&y<height-245&&x>(width>900?320:10)&&x<width-60&&(id!=='cosmic-origin-label'||lastMode&&Math.abs(lastYears)>6e6);
   label.style.opacity=show?'1':'0';label.style.left=x+'px';label.style.top=(y+18)+'px';
  }
 }
 return {scene,update,target,labels,get motion(){return current;}};
}
