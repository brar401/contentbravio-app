import React, {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';
import {Environment, ContactShadows} from '@react-three/drei';

// Every silhouette below was traced from the supplied McIver images, never typeset.
// Each piece has actual front/back caps AND side-wall geometry.
const DIMENSION = 3.7;
function meshShape(points,width,height){
  return points.map(([x,y])=>new THREE.Vector2((x/width-0.5)*DIMENSION,(0.5-y/height)*DIMENSION*height/width));
}
function ExtrudedArtwork({variant,opts,angles,revision,paused,onTurn}){
  const [data,setData]=useState(null);
  const group=useRef();
  const pointer=useRef(null);
  const texture=useLoader(THREE.TextureLoader,`./logos/${variant}.png`);
  const depth=opts.depth;
  useEffect(()=>{let active=true;fetch(`./geometry/${variant}.json`).then(r=>r.json()).then(d=>{if(active)setData(d)}).catch(console.error);return()=>{active=false}},[variant]);
  useEffect(()=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.needsUpdate=true;},[texture]);
  const geo=useMemo(()=>{
    if(!data)return null;
    const all={gold:[],burgundy:[]};
    for(const entry of data.shapes){
      const s=new THREE.Shape(meshShape(entry.outer,data.width,data.height));
      for(const hole of entry.holes){const p=new THREE.Path(meshShape(hole,data.width,data.height));s.holes.push(p)}
      all[entry.c].push(s);
    }
    const geometries={};
    for(const [color,shapes] of Object.entries(all)){
      if(!shapes.length)continue;
      geometries[color]=new THREE.ExtrudeGeometry(shapes,{depth,bevelEnabled:opts.material!=='Glass',bevelSegments:2,steps:1,bevelThickness:Math.min(depth*0.08,0.015),bevelSize:0.009,curveSegments:2});
      geometries[color].translate(0,0,-depth/2);
    }
    return geometries;
  },[data,depth,opts.material]);
  useEffect(()=>()=>{if(geo)Object.values(geo).forEach(g=>g.dispose());},[geo]);
  const frontMat=useMemo(()=>new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.FrontSide,depthWrite:false,toneMapped:false,opacity:opts.opacity}),[texture,opts.opacity]);
  useEffect(()=>()=>frontMat.dispose(),[frontMat]);
  const clean=useMemo(()=>{
    const original=opts.original;
    return {gold:original?'#ac9a70':opts.gold,burgundy:original?'#850b29':opts.burgundy};
  },[opts.original,opts.gold,opts.burgundy]);
  useFrame((_state,delta)=>{
    if(!group.current)return;
    if(!paused&&opts.autoRotate&&opts.speed>0)onTurn(delta*opts.speed*0.33);
    const targetY=angles.y;
    const targetX=(opts.free||!opts.keepUpright)?angles.x:0;
    const targetZ=opts.free?angles.z:0;
    group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,targetY,10,delta);
    group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,targetX,10,delta);
    group.current.rotation.z=THREE.MathUtils.damp(group.current.rotation.z,targetZ,10,delta);
  });
  const opacity=opts.opacity;
  return <group ref={group} rotation={[0,0,0]} key={`${variant}-${revision}`}>
    {geo && Object.entries(geo).map(([name,g])=>{
      const tint=clean[name];
      const mt=opts.material==='Glass'
        ? {color:tint,roughness:0.05,metalness:0,transmission:0.72,thickness:Math.max(depth,0.1),ior:1.45,transparent:true,opacity:opacity}
        : opts.material==='Holographic'
          ? {color:name==='gold'?'#a6d9ff':'#cdb2fd',metalness:0.55,roughness:0.12,clearcoat:1,clearcoatRoughness:0.03,transparent:opacity<1,opacity}
          : {color:tint,metalness:opts.material==='Metal'?0.89:0.35,roughness:opts.material==='Metal'?0.17:0.48,clearcoat:0.7,transparent:opacity<1,opacity};
      return <mesh key={name} geometry={g} castShadow receiveShadow><meshPhysicalMaterial attach="material-0" {...mt}/><meshPhysicalMaterial attach="material-1" {...mt} color={name==='gold'?'#76603d':name==='burgundy'?'#590d27':tint} metalness={0.75} roughness={0.28}/></mesh>;
    })}
    {/* Independent front and rear imprints: rear text reads normally from the back. */}
    {(opts.original || opts.keepReadable) && <>
      {opts.original && <mesh position={[0,0,depth/2+0.018]} material={frontMat}><planeGeometry args={[DIMENSION,DIMENSION*(variant==='with'?753/1024:1075/1463)]}/></mesh>}
      {opts.keepReadable && <group rotation={[0,Math.PI,0]}><mesh position={[0,0,depth/2+0.018]} material={frontMat}><planeGeometry args={[DIMENSION,DIMENSION*(variant==='with'?753/1024:1075/1463)]}/></mesh></group>}
    </>}
  </group>;
}
function StudioScene({variant,opts,angles,revision,paused,onTurn}){
  return <>
    <color attach="background" args={['#171219']}/>
    <ambientLight intensity={0.63*opts.light}/>
    <hemisphereLight args={['#d4c3e3','#301323',1.1*opts.light]}/>
    <directionalLight position={[-5,5,6]} intensity={2.7*opts.light} color="#ffe2b3" castShadow/>
    <pointLight position={[5,0,1]} intensity={38*opts.light} color="#cd85d4" distance={14}/>
    <pointLight position={[-3,-3,-4]} intensity={16*opts.light} color="#ead6b0" distance={15}/>
    <Suspense fallback={null}><ExtrudedArtwork {...{variant,opts,angles,revision,paused,onTurn}}/></Suspense>
    <mesh position={[0,-2.0,-1.5]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#171219" roughness={0.62} /></mesh>
  </>;
}
export function Logo3D({variant,opts,rotation,setRotation,revision,paused,setPaused}){
  const down=useRef(null);
  function move(e){
    if(!down.current)return;
    const dx=e.clientX-down.current.x,dy=e.clientY-down.current.y;
    down.current={x:e.clientX,y:e.clientY};
    // Horizontal drag rotates about the vertical axis. Keep Upright locks roll/pitch.
    setRotation(r=>({y:r.y+dx*0.010,x:(opts.free||!opts.keepUpright)?r.x+dy*0.009:0,z:opts.free&&e.shiftKey?r.z+dx*0.005:r.z}));
  }
  return <div className="three-canvas"
    onPointerDown={e=>{down.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}}
    onPointerMove={move}
    onPointerUp={e=>{down.current=null;try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}}}
    onPointerCancel={()=>down.current=null}>
    <Canvas camera={{position:[0,0,5.75],fov:40,near:0.1,far:100}} shadows dpr={[1,1.8]} gl={{alpha:false,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'}}>
      <StudioScene {...{variant,opts,angles:rotation,revision,paused,onTurn:(d)=>setRotation(r=>({...r,y:r.y+d}))}}/>
    </Canvas>
    <div className="stage-hint">DRAG TO ORBIT <span>•</span> REAL EXTRUDED GEOMETRY</div>
    <div className="stage-degrees">{((rotation.y*180/Math.PI)%360+360)%360|0}° <small>Y AXIS</small></div>
  </div>;
}
