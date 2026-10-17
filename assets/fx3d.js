/* WDCM NEXT: real-time 3D gold District sculpture (three.js) */
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const host=document.querySelector('.newsroom-stats');
function boot(host){
  if(!host||host.__3d)return;host.__3d=1;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wrap=document.createElement('div');wrap.className='dc3d';host.appendChild(wrap);
  const R=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.82;R.outputColorSpace=THREE.SRGBColorSpace;wrap.appendChild(R.domElement);
  const S=new THREE.Scene(),C=new THREE.PerspectiveCamera(32,1,.1,50);C.position.set(0,0,8.6);
  const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(new RoomEnvironment(),.04).texture;
  /* the District: real boundary, centered */
  const P=[[68.2,182.2],[236.1,10],[531.8,300.2],[244.1,590],[244.1,361.6]],cx=300,cy=300,k=1/150;
  const sh=new THREE.Shape();P.forEach(([x,y],i)=>{const X=(x-cx)*k,Y=-(y-cy)*k;i?sh.lineTo(X,Y):sh.moveTo(X,Y)});sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:.22,bevelEnabled:true,bevelThickness:.05,bevelSize:.045,bevelSegments:6,curveSegments:1});geo.center();
  const navy=new THREE.MeshPhysicalMaterial({color:0x0c1630,metalness:.2,roughness:.5,clearcoat:.8,clearcoatRoughness:.25,envMapIntensity:.18});
  const gold=new THREE.MeshPhysicalMaterial({color:0xd7b56a,metalness:1,roughness:.24,clearcoat:.5,envMapIntensity:1.1});
  const slab=new THREE.Mesh(geo,[navy,gold]);
  const g=new THREE.Group();g.add(slab);
  /* raised gold inlay and glowing Capitol on both faces */
  const inP=P.map(([x,y])=>new THREE.Vector3((x-cx)*k*.86,-(y-cy)*k*.86,0));const curve=new THREE.CatmullRomCurve3(inP,true,'catmullrom',0);
  const inGeo=new THREE.TubeGeometry(curve,200,.018,8,true);
  const capPos=new THREE.Vector2((310.9-cx)*k,-(309-cy)*k);
  /* recentre like geo.center(): shape bbox centre */
  geo.computeBoundingBox();
  const sx=P.map(p=>(p[0]-cx)*k),sy=P.map(p=>-(p[1]-cy)*k),ox=(Math.min(...sx)+Math.max(...sx))/2,oy=(Math.min(...sy)+Math.max(...sy))/2;
  const halos=[],caps=[];
  [1,-1].forEach(side=>{const z=side*.175;
    const tube=new THREE.Mesh(inGeo,gold);tube.position.set(-ox*.86,-oy*.86,z);g.add(tube);
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.07,32,16),new THREE.MeshStandardMaterial({color:0xfff1c8,emissive:0xe9c46a,emissiveIntensity:2.6}));cap.position.set(capPos.x-ox,capPos.y-oy,z+side*.02);g.add(cap);caps.push(cap);
    const halo=new THREE.Mesh(new THREE.RingGeometry(.1,.125,48),new THREE.MeshBasicMaterial({color:0xe9d6a0,transparent:true,opacity:.8,side:THREE.DoubleSide}));halo.position.copy(cap.position);g.add(halo);halos.push(halo)});
  const halo={scale:{set:(a,b,c)=>halos.forEach(h=>h.scale.set(a,b,c))},material:{set opacity(v){halos.forEach(h=>h.material.opacity=v)}}};
  const pl=new THREE.PointLight(0xffd88a,1.4,2.2);pl.position.set(capPos.x-ox,capPos.y-oy,.8);g.add(pl);
  const key=new THREE.DirectionalLight(0xfff0d0,2.2);key.position.set(3,4,5);S.add(key);
  const rim=new THREE.DirectionalLight(0x6f8fd8,1.4);rim.position.set(-4,-2,-3);S.add(rim);
  g.rotation.set(-.35,.5,.1);g.scale.setScalar(1.08);S.add(g);
  /* dust of gold particles orbiting */
  const N=260,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const a=Math.random()*Math.PI*2,r=1.6+Math.random()*1.4;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=(Math.random()-.5)*2.4;pos[i*3+2]=Math.sin(a)*r*.6}
  const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const dust=new THREE.Points(pg,new THREE.PointsMaterial({color:0xe9d6a0,size:.018,transparent:true,opacity:.75,depthWrite:false}));S.add(dust);
  function size(){const w=wrap.clientWidth,h=wrap.clientHeight;R.setSize(w,h,false);C.aspect=w/h;C.updateProjectionMatrix()}
  size();addEventListener('resize',size);
  let mx=0,my=0,tx=0,ty=0,spin=0,vis=false,t0=performance.now();
  addEventListener('mousemove',e=>{tx=(e.clientX/innerWidth-.5);ty=(e.clientY/innerHeight-.5)});
  let drag=null;wrap.addEventListener('pointerdown',e=>{drag={x:e.clientX,s:spin};wrap.setPointerCapture(e.pointerId)});
  wrap.addEventListener('pointermove',e=>{if(drag)spin=drag.s+(e.clientX-drag.x)*.01});wrap.addEventListener('pointerup',()=>drag=null);
  addEventListener('scroll',()=>{const r=host.getBoundingClientRect();spin+=0;host.__p=1-(r.top+r.height)/(innerHeight+r.height)},{passive:true});
  new IntersectionObserver(es=>es.forEach(e=>vis=e.isIntersecting),{rootMargin:'100px'}).observe(wrap);
  (function loop(now){requestAnimationFrame(loop);if(!vis)return;const t=(now-t0)/1000;
    mx+=(tx-mx)*.06;my+=(ty-my)*.06;const p=host.__p||0;
    g.rotation.y=.5+spin+(reduce?0:t*.18)+p*2.2+mx*.6;g.rotation.x=-.35+my*.4+Math.sin(t*.6)*.04;g.position.y=Math.sin(t*.9)*.05;
    const s=1+((t*.8)%1)*1.8;halo.scale.set(s,s,s);halo.material.opacity=.8*(1-((t*.8)%1));
    dust.rotation.y=t*.05;pl.intensity=1.2+Math.sin(t*3)*.4;R.render(S,C)})(t0);
}
if(host)boot(host);else new MutationObserver((m,o)=>{const h=document.querySelector('.newsroom-stats');if(h){o.disconnect();boot(h)}}).observe(document.body,{childList:true,subtree:true});
