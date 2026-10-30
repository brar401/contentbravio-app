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

function createArtworkGeometry(data, opts) {
  const all = {gold: [], burgundy: []};
  for (const entry of data.shapes) {
    // The large gold oval is a true smooth curve, so simplify its pixel
    // staircase more strongly than the fine serifs or slender gold divider.
    const xs = entry.outer.map(p => p[0]), ys = entry.outer.map(p => p[1]);
    const isOval = entry.c === 'gold' && Math.max(...ys) - Math.min(...ys) > 200;
    const tolerance = opts.smoothness * (isOval ? 1.8 : entry.c === 'gold' ? .15 : .48);
    const outer = simplifyContour(entry.outer, tolerance);
    const shape = new THREE.Shape(toVector(outer, data.width, data.height));
    for (const hole of entry.holes) {
      shape.holes.push(new THREE.Path(toVector(simplifyContour(hole, tolerance), data.width, data.height)));
    }
    all[entry.c].push(shape);
  }
  const depth = Math.max(.03, opts.depth);
  const edge = Math.min(depth, Math.max(.006, opts.edgeDepth));
  // The sides have a controllable flat centre band and curved shoulders that
  // taper towards the original front/back contour; never a flat sprite edge.
  const shoulderDepth = Math.max(.0005, (depth - edge) / 2);
  const bevel = Math.max(.0005, opts.roundness * (1 - .8 * opts.edgeSharpness));
  const result = {};
  for (const [name, shapes] of Object.entries(all)) {
    if (!shapes.length) continue;
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: edge,
      steps: 1,
      bevelEnabled: true,
      bevelSegments: Math.max(2, Math.round(3 + opts.smoothness * 14)),
      bevelThickness: shoulderDepth,
      bevelSize: bevel,
      curveSegments: 12,
    });
    // Three places beveled caps at -shoulderDepth and depth+shoulderDepth.
    // Centre the complete solid about z=0 to retain predictable rotation.
    g.translate(0, 0, -(edge / 2));
    softenSideNormals(g, opts.smoothness);
    result[name] = g;
  }
  return result;
}

// An oval signboard is a physical, closed, smoothly shaded volume. Unlike a
// single polygon it can be thin at its perimeter and fuller in the centre.
function createSignboardGeometry(width, height, centre, rim, fullness) {
  const rx = width * .484, ry = height * .462;
  const steps = 24, sides = 192;
  const verts = [], uvs = [], tris = [];
  // Front is gently convex, but the rear stays planar for clean printing.
  // This is a proper thick-centre / thin-edge rotating shop sign profile.
  function surfaceZ(r, face) {
    if (face === 1) return -centre / 2;
    const blend = Math.pow(Math.max(0, 1 - r * r), 1 + (1 - fullness) * 1.5);
    return -centre / 2 + rim + (centre - rim) * blend;
  }
  for (let face = 0; face < 2; face++) {
    for (let j = 0; j <= steps; j++) {
      const r = j / steps;
      for (let k = 0; k <= sides; k++) {
        const t = k / sides * Math.PI * 2;
        verts.push(rx * r * Math.cos(t), ry * r * Math.sin(t), surfaceZ(r, face));
        uvs.push(.5 + .5 * r * Math.cos(t), .5 + .5 * r * Math.sin(t));
      }
    }
  }
  const row = sides + 1, perFace = (steps + 1) * row;
  for (let f = 0; f < 2; f++) for (let j = 0; j < steps; j++) for (let k = 0; k < sides; k++) {
    const a = f * perFace + j * row + k, b = a + 1, c = a + row, d = c + 1;
    if (f === 0) tris.push(a, c, b, b, c, d);
    else tris.push(a, b, c, b, d, c);
  }
  // Connect the last rings: no open edge, no zero-thickness visual trick.
  for (let k = 0; k < sides; k++) {
    const a = steps * row + k, b = a + 1, c = perFace + a, d = c + 1;
    tris.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(tris);
  geometry.computeVertexNormals();
  return geometry;
}

function ExtrudedArtwork({variant, opts, angles, revision, paused, onTurn}) {
  const [data, setData] = useState(null);
  const group = useRef();
  const texture = useLoader(THREE.TextureLoader, `./logos/${variant}.png`);
  useEffect(() => {
    let active = true;
    setData(null);
    fetch(`./geometry/${variant}.json`).then(r => {
      if (!r.ok) throw new Error(`Geometry returned ${r.status}`);
      return r.json();
    }).then(d => {if (active) setData(d);}).catch(console.error);
    return () => {active = false;};
  }, [variant]);
  useEffect(() => {texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 8; texture.needsUpdate = true;}, [texture]);
  const geo = useMemo(() => data ? createArtworkGeometry(data, opts) : null,
    [data, opts.depth, opts.edgeDepth, opts.roundness, opts.edgeSharpness, opts.smoothness]);
  useEffect(() => () => {if (geo) Object.values(geo).forEach(g => g.dispose());}, [geo]);

  const aspect = data ? data.height / data.width : (variant === 'with' ? 603 / 820 : 625 / 850);
  const artHeight = ART_WIDTH * aspect;
  const backShield = opts.backing;
  const plateCentre = Math.max(opts.plateEdge + .001, opts.plateCentre);
  const board = useMemo(() => backShield ? createSignboardGeometry(ART_WIDTH, artHeight, plateCentre, opts.plateEdge, opts.fullness) : null,
    [backShield, artHeight, plateCentre, opts.plateEdge, opts.fullness]);
  useEffect(() => () => board?.dispose(), [board]);

  const colors = {gold: opts.original ? '#ac9a70' : opts.gold, burgundy: opts.original ? '#850b29' : opts.burgundy};
  // The original logo texture is only a decal on the back. It has its own
  // correctly oriented surface, not a translucent layer over the front.
  const frontMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    map: texture, transparent: true, alphaTest: .12, depthWrite: true, toneMapped: false, side: THREE.FrontSide, opacity:opts.opacity,
  }), [texture, opts.opacity]);
  const backMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    map: texture, transparent: true, alphaTest: .12, depthWrite: true, toneMapped: false, side: THREE.FrontSide, opacity:opts.opacity,
  }), [texture, opts.opacity]);
  useEffect(() => () => {frontMaterial.dispose();backMaterial.dispose();}, [frontMaterial, backMaterial]);

  useFrame((_state, delta) => {
    if (!group.current) return;
    if (!paused && opts.autoRotate && opts.speed > 0) onTurn(delta * opts.speed * .33);
    const x = opts.free || !opts.keepUpright ? angles.x : 0;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, angles.y, 10, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, x, 10, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, opts.free ? angles.z : 0, 10, delta);
  });

  // The back of the sign is positioned behind the *entire* extruded front.
  // The opaque sign core blocks front-face relief at 175–180 degrees. It also
  // prevents reversed shadow lettering bleeding through the transparent gaps.
  const frontBaseZ = backShield ? plateCentre / 2 + .007 : 0;
  const rearZ = -plateCentre / 2 - .008;
  const plateColor = opts.backColor || '#21151d';
  return <group ref={group} key={`${variant}-${revision}`}>
    {board && <mesh geometry={board} receiveShadow castShadow renderOrder={0}>
      <meshPhysicalMaterial color={plateColor} metalness={.35} roughness={.44} side={THREE.FrontSide}/>
    </mesh>}
    {geo && <group position={[0, 0, frontBaseZ]}>
      {Object.entries(geo).map(([name, g]) => {
        const color = colors[name];
        const face = opts.material === 'Glass'
          ? {color, metalness:.1, roughness:.08, transmission:.27, ior:1.43, thickness: Math.max(.05, opts.depth), opacity:1}
          : opts.material === 'Holographic'
            ? {color:name === 'gold' ? '#b3d8ee' : '#d2a6cd', metalness:.75, roughness:.14, clearcoat:1}
            : {color, metalness: opts.material === 'Metal' ? .89 : .28, roughness:opts.material === 'Metal' ? .16 : .52, clearcoat:.7};
        const sideColor = name === 'gold' ? '#81663e' : '#5b0b21';
        return <mesh key={name} geometry={g} castShadow receiveShadow>
          <meshPhysicalMaterial attach="material-0" {...face} side={THREE.FrontSide} opacity={opts.opacity} transparent={opts.opacity<1}/>
          <meshPhysicalMaterial attach="material-1" {...face} color={sideColor} metalness={opts.material === 'Satin' ? .18 : .67} roughness={opts.sidePolish} opacity={opts.opacity} transparent={opts.opacity<1} side={THREE.FrontSide}/>
        </mesh>;
      })}
    </group>}
    {/* Preserve the precise supplied raster outlines/colours on the front cap.
        The side walls remain genuinely extruded and physically shaded. */}
    {geo && opts.original && <mesh position={[0,0,frontBaseZ + opts.depth / 2 + .003]} material={frontMaterial} renderOrder={2}>
      <planeGeometry args={[ART_WIDTH, artHeight]}/>
    </mesh>}
    {opts.keepReadable && backShield && <group rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, -rearZ]} material={backMaterial} renderOrder={2}>
        <planeGeometry args={[ART_WIDTH, artHeight]}/>
      </mesh>
    </group>}
    {opts.keepReadable && !backShield && <group rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0, opts.depth / 2 + .025]} material={backMaterial}>
        <planeGeometry args={[ART_WIDTH, artHeight]}/>
      </mesh>
    </group>}
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
