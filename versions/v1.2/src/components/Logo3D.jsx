import React, {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';
import {Canvas, useFrame, useLoader} from '@react-three/fiber';

// McIver letterforms and the oval are traced from the supplied source art.
// The trace is NOT replaced with new typography. Only the 3D side geometry changes.
const DIMENSION = 3.7;
const ART_WIDTH = DIMENSION;
const deg = a => ((a * 180 / Math.PI) % 360 + 360) % 360;

function toVector(points, width, height) {
  return points.map(([x, y]) => new THREE.Vector2(
    (x / width - .5) * DIMENSION,
    (.5 - y / height) * DIMENSION * height / width,
  ));
}

// Douglas–Peucker only removes near-collinear pixel staircase points; it does
// not manufacture replacement contours or alter the original PNG.
function simplifyContour(points, tolerance) {
  if (tolerance <= 0 || points.length < 5) return points;
  const first = points[0];
  const farthest = points.reduce((best, p, i) => {
    const d = (p[0] - first[0]) ** 2 + (p[1] - first[1]) ** 2;
    return d > best.distance ? {distance: d, i} : best;
  }, {distance: -1, i: 0}).i;
  const chain = [...points.slice(farthest), ...points.slice(0, farthest + 1)];
  const sq = tolerance * tolerance;
  function recurse(start, end, out) {
    let far = -1, index = -1;
    const a = chain[start], b = chain[end];
    const dx = b[0] - a[0], dy = b[1] - a[1], lengthSq = dx * dx + dy * dy;
    for (let i = start + 1; i < end; i++) {
      const p = chain[i];
      const t = lengthSq > 1e-10 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lengthSq)) : 0;
      const x = a[0] + t * dx, y = a[1] + t * dy;
      const d = (p[0] - x) ** 2 + (p[1] - y) ** 2;
      if (d > far) {far = d; index = i;}
    }
    if (far > sq && index > start && index < end) {
      recurse(start, index, out);
      recurse(index, end, out);
    } else out.push(chain[start]);
  }
  const res = [];
  recurse(0, chain.length - 1, res);
  // Preserve real serif corners and tiny punctuation / tagline contours.
  return res.length >= 3 ? res : points;
}

// THREE.ExtrudeGeometry deliberately generates flat per-triangle side normals.
// That creates visible strips under metallic light, even on curved contours.
// Blend adjacent side normals at the same physical vertices while leaving the
// front and back cap normals untouched (so lettering stays crisp and planar).
function softenSideNormals(geometry, amount) {
  if (amount <= 0) return geometry;
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const groups = geometry.groups.filter(g => g.materialIndex === 1);
  const accum = new Map();
  const precision = 100000;
  const keyAt = i => [0, 1, 2].map(k => Math.round(position.getComponent(i, k) * precision)).join(':');
  for (const {start, count} of groups) {
    for (let i = start; i < start + count; i++) {
      const key = keyAt(i);
      const old = accum.get(key) || {sum: new THREE.Vector3(), indices: []};
      old.sum.add(new THREE.Vector3(normal.getX(i), normal.getY(i), normal.getZ(i)));
      old.indices.push(i);
      accum.set(key, old);
    }
  }
  for (const {sum, indices} of accum.values()) {
    if (sum.lengthSq() < 1e-9) continue;
    sum.normalize();
    for (const i of indices) {
      const original = new THREE.Vector3(normal.getX(i), normal.getY(i), normal.getZ(i));
      // Normal blending rather than boundary movement keeps silhouette sharp.
      original.lerp(sum, amount).normalize();
      normal.setXYZ(i, original.x, original.y, original.z);
    }
  }
  normal.needsUpdate = true;
  return geometry;
}

// One shape per face, not two simultaneous see-through layers. When the viewer
// passes the side of the model, only the outward-facing 3D artwork is rendered.
// This is intentional view-dependent occlusion: a fully open lattice cannot
// physically prevent the mirrored rear contours showing through its holes.
function createArtworkGeometry(data, opts) {
  const all={gold:[],burgundy:[]};
  for(const entry of data.shapes){
    const ys=entry.outer.map(p=>p[1]);
    const isOval=entry.c==='gold' && Math.max(...ys)-Math.min(...ys)>200;
    const tolerance=opts.smoothness*(isOval?1.65:entry.c==='gold'?.16:.36);
    const shape=new THREE.Shape(toVector(simplifyContour(entry.outer,tolerance),data.width,data.height));
    for(const hole of entry.holes) shape.holes.push(new THREE.Path(toVector(simplifyContour(hole,tolerance),data.width,data.height)));
    all[entry.c].push(shape);
  }
  const centre=Math.max(.06,opts.depth);
  const edge=Math.min(centre,Math.max(.004,opts.edgeDepth));
  const bevelSize=Math.min(.05,Math.max(.0005,opts.roundness*(1-.78*opts.edgeSharpness)));
  const bevelThickness=Math.min(centre*.16,Math.max(.001,bevelSize*.7));
  const ratio=data.height/data.width;
  const out={};
  for(const [name,shapes] of Object.entries(all)){
    if(!shapes.length)continue;
    const g=new THREE.ExtrudeGeometry(shapes,{
      depth:centre-2*bevelThickness, steps:1, bevelEnabled:true,
      bevelSegments:Math.round(3+opts.smoothness*12),
      bevelThickness, bevelSize, curveSegments:14,
    });
    g.translate(0,0,-centre/2+bevelThickness);
    const pos=g.getAttribute('position');
    const uv=g.getAttribute('uv');
    const xExtent=DIMENSION*.5;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i);
      // Centre thick; both left & right extremes approach edge thickness.
      // Different from bevel width: this changes the entire Z cross-section.
      const normalized=Math.min(1,Math.abs(x)/xExtent);
      const envelope=Math.pow(Math.max(0,Math.cos(normalized*Math.PI/2)),Math.max(.25,opts.taperPower||1.5));
      const localThickness=edge+(centre-edge)*envelope;
      pos.setZ(i,pos.getZ(i)*localThickness/centre);
      // Texture the actual 3D caps, not a floating planar PNG sprite.
      uv.setXY(i,x/DIMENSION+.5,y/(DIMENSION*ratio)+.5);
    }
    pos.needsUpdate=true;uv.needsUpdate=true;
    g.computeVertexNormals();
    softenSideNormals(g,opts.smoothness);
    g.computeBoundingSphere();
    out[name]=g;
  }
  return out;
}

function ExtrudedArtwork({variant, opts, angles, revision, paused, onTurn}) {
  const [data,setData]=useState(null);
  const group=useRef();
  const frontRef=useRef();
  const rearRef=useRef();
  const texture=useLoader(THREE.TextureLoader,`./logos/${variant}.png`);
  useEffect(()=>{
    let active=true;setData(null);
    fetch(`./geometry/${variant}.json`).then(r=>{if(!r.ok)throw Error(`Geometry ${r.status}`);return r.json()})
      .then(d=>{if(active)setData(d)}).catch(console.error);
    return ()=>{active=false};
  },[variant]);
  useEffect(()=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;texture.needsUpdate=true},[texture]);
  const geo=useMemo(()=>data?createArtworkGeometry(data,opts):null,
    [data,opts.depth,opts.edgeDepth,opts.taperPower,opts.roundness,opts.edgeSharpness,opts.smoothness]);
  useEffect(()=>()=>{if(geo)Object.values(geo).forEach(g=>g.dispose())},[geo]);
  const colors={gold:opts.original?'#ac9a70':opts.gold,burgundy:opts.original?'#850b29':opts.burgundy};
  useFrame((_state,delta)=>{
    if(!group.current)return;
    if(!paused&&opts.autoRotate&&opts.speed>0)onTurn(delta*opts.speed*.33);
    const x=opts.free||!opts.keepUpright?angles.x:0;
    group.current.rotation.y=THREE.MathUtils.damp(group.current.rotation.y,angles.y,12,delta);
    group.current.rotation.x=THREE.MathUtils.damp(group.current.rotation.x,x,12,delta);
    group.current.rotation.z=THREE.MathUtils.damp(group.current.rotation.z,opts.free?angles.z:0,12,delta);
    // Cull using the ACTUAL animated quaternion, not the slider's target angle.
    // This avoids a flash of backward text while the rotation is damping.
    const towardCamera=new THREE.Vector3(0,0,1).applyQuaternion(group.current.quaternion).z>=0;
    if(frontRef.current)frontRef.current.visible=!opts.keepReadable||towardCamera;
    if(rearRef.current)rearRef.current.visible=!!opts.keepReadable&&!towardCamera;
  });
  function renderFace(rear=false){
    return <group rotation={rear?[0,Math.PI,0]:[0,0,0]}>
      {geo&&Object.entries(geo).map(([name,g])=>{
        const base=colors[name];
        const finish=opts.material==='Glass'
          ?{color:base,metalness:.12,roughness:.06,transmission:.26,ior:1.46,thickness:Math.max(.08,opts.depth),clearcoat:1}
          :opts.material==='Holographic'
          ?{color:name==='gold'?'#c3bbfa':'#d69bc6',metalness:.72,roughness:.13,clearcoat:1}
          :{color:base,metalness:opts.material==='Metal'?.86:.2,roughness:opts.material==='Metal'?.22:.53,clearcoat:.7};
        return <mesh geometry={g} key={name} castShadow receiveShadow>
          {opts.original
            ? <meshBasicMaterial attach="material-0" map={texture} color="white" transparent alphaTest={.18} side={THREE.FrontSide} opacity={opts.opacity} depthWrite />
            : <meshPhysicalMaterial attach="material-0" {...finish} opacity={opts.opacity} transparent={opts.opacity<1} side={THREE.FrontSide}/>}
          <meshPhysicalMaterial attach="material-1" {...finish}
            color={opts.original?(name==='gold'?'#8a6d41':'#730d29'):base}
            metalness={opts.material==='Satin'?.18:.68} roughness={opts.sidePolish}
            opacity={opts.opacity} transparent={opts.opacity<1} side={THREE.FrontSide}/>
        </mesh>;
      })}
    </group>;
  }
  return <group ref={group} key={`${variant}-${revision}`}>
    <group ref={frontRef}>{renderFace(false)}</group>
    {/* The rear carries fully extruded, correctly orientated geometry, not a
        flattened reversed PNG. No central plate or opaque background. */}
    <group ref={rearRef} visible={false}>{renderFace(true)}</group>
  </group>;
}

function StudioScene({variant, opts, angles, revision, paused, onTurn}) {
  return <>
    <color attach="background" args={['#171219']}/>
    <ambientLight intensity={.63 * opts.light}/>
    <hemisphereLight args={['#d4c3e3', '#301323', 1.1 * opts.light]}/>
    <directionalLight position={[-5, 5, 6]} intensity={2.7 * opts.light} color="#ffe2b3" castShadow/>
    <pointLight position={[5, 0, 1]} intensity={38 * opts.light} color="#cd85d4" distance={14}/>
    <pointLight position={[-3, -3, -4]} intensity={16 * opts.light} color="#ead6b0" distance={15}/>
    <Suspense fallback={null}><ExtrudedArtwork {...{variant, opts, angles, revision, paused, onTurn}}/></Suspense>
    <mesh position={[0,-2.0,-1.5]} rotation={[-Math.PI/2,0,0]} receiveShadow>
      <planeGeometry args={[200,200]}/><meshStandardMaterial color="#171219" roughness={.62}/>
    </mesh>
  </>;
}

export function Logo3D({variant, opts, rotation, setRotation, revision, paused, setPaused}) {
  const down = useRef(null);
  function move(e) {
    if (!down.current) return;
    const dx = e.clientX - down.current.x, dy = e.clientY - down.current.y;
    down.current = {x: e.clientX, y: e.clientY};
    setRotation(r => ({
      y: r.y + dx * .010,
      x: opts.free || !opts.keepUpright ? r.x + dy * .009 : 0,
      z: opts.free && e.shiftKey ? r.z + dx * .005 : r.z,
    }));
  }
  return <div className="three-canvas"
    onPointerDown={e => {down.current = {x:e.clientX, y:e.clientY}; e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={move}
    onPointerUp={e => {down.current = null; try {e.currentTarget.releasePointerCapture(e.pointerId);} catch {}}}
    onPointerCancel={() => down.current = null}>
    <Canvas camera={{position:[0,0,5.75], fov:40, near:.1, far:100}}
      shadows dpr={[1,1.8]} gl={{alpha:false, antialias:true, preserveDrawingBuffer:true, powerPreference:'high-performance'}}>
      <StudioScene {...{variant, opts, angles:rotation, revision, paused, onTurn:d => setRotation(r=>({...r, y:r.y+d}))}}/>
    </Canvas>
    <div className="stage-hint">DRAG TO ORBIT <span>•</span> SMOOTH REAL-WORLD MATERIALS</div>
    <div className="stage-degrees">{Math.round(deg(rotation.y))}° <small>Y AXIS</small></div>
  </div>;
}
