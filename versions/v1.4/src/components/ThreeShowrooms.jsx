import React, {Component, Suspense, useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {Canvas} from '@react-three/fiber';
import {OrbitControls, TrackballControls, RoundedBox, useGLTF} from '@react-three/drei';
import {ArrowUpRight, Box, Building2, CarFront, Footprints, Lightbulb, Rotate3D, RotateCcw} from 'lucide-react';

// Public assets are optional, never necessary for the offline baseline.
// Khronos glTF-Sample-Assets: ToyCar CC0; CarConcept CC BY 4.0;
// MaterialsVariantsShoe Shopify CC BY 4.0. Model trademarks remain theirs.
const RAW='https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/';
const LIBRARY={
 toy: {label:'Toy Car',url:`${RAW}ToyCar/glTF-Binary/ToyCar.glb`,credit:'Guido Odendahl & Eric Chadwick · CC0',source:'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ToyCar'},
 concept: {label:'Car Concept',url:`${RAW}CarConcept/glTF-Binary/CarConcept.glb`,credit:'Khronos contributors · CC BY 4.0',source:'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/CarConcept'},
 shoe: {label:'Materials Variants Shoe',url:`${RAW}MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb`,credit:'Shopify · CC BY 4.0',source:'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe'},
};
function Paint({color,metalness=.75,roughness=.23,...p}) {return <meshPhysicalMaterial color={color} metalness={metalness} roughness={roughness} clearcoat={.95} clearcoatRoughness={.08} {...p}/>}
function Box3D({pos=[0,0,0],size=[1,1,1],color='#fff',round=.08,metal=.6,rough=.28}){
 return <RoundedBox position={pos} args={size} radius={round} smoothness={5} castShadow receiveShadow><Paint color={color} metalness={metal} roughness={rough}/></RoundedBox>;
}
function Wheel({x,z,design='spoke',tire='#141416'}){
 return <group position={[x,.42,z]} rotation={[Math.PI/2,0,0]}>
  <mesh castShadow><cylinderGeometry args={[.39,.39,.25,32]}/><meshStandardMaterial color={tire} roughness={.95}/></mesh>
  {[-.13,.13].map((side)=><group position={[0,side,0]} key={side}>
    <mesh><cylinderGeometry args={[.27,.27,.02,32]}/><meshPhysicalMaterial color={design==='sport'?'#191e2a':'#d2ccbd'} metalness={.95} roughness={.19}/></mesh>
    {Array.from({length:design==='sport'?7:5},(_,i)=><mesh key={i} rotation={[0,i*Math.PI/(design==='sport'?7:5),0]} position={[0,0,0]}><boxGeometry args={[.055,.06,.45]}/><meshStandardMaterial color="#6e7080" metalness={.85} roughness={.22}/></mesh>)}
  </group>)}
 </group>;
}
function BuiltInCar({kind='toy',paint='#a91637',wheel='spoke',glass='#a6e0e5'}){
 const concept=kind==='concept';
 return <group rotation={[0,-.65,0]} position={[0,-.13,0]}>
  <Box3D pos={[0,.77,0]} size={[3.35, .48, 1.52]} color={paint} round={.19}/>
  <Box3D pos={[0,1.13,0]} size={[concept?1.92:2.08,.54,1.31]} color={paint} round={.2}/>
  <Box3D pos={[0,1.2,.665]} size={[1.86,.38,.03]} color={glass} round={.04} metal={.12} rough={.05}/>
  <Box3D pos={[0,1.2,-.665]} size={[1.86,.38,.03]} color={glass} round={.04} metal={.12} rough={.05}/>
  <Box3D pos={[1.65,.69,0]} size={[.23,.19,1.46]} color="#14131b" round={.05} metal={.05}/>
  <Box3D pos={[-1.65,.69,0]} size={[.16,.14,1.46]} color="#14131b" round={.04} metal={.05}/>
  {[-1.1,1.11].flatMap(x=>[-.79,.79].map(z=><Wheel key={`${x}-${z}`} x={x} z={z} design={wheel}/>))}
  {[-.56,.56].map(z=><group key={z}><mesh position={[1.7,.9,z]} rotation={[0,Math.PI/2,0]}><boxGeometry args={[.17,.18,.04]}/><meshBasicMaterial color="#fce7bb"/></mesh><mesh position={[-1.71,.83,z]} rotation={[0,Math.PI/2,0]}><boxGeometry args={[.17,.14,.04]}/><meshBasicMaterial color="#fa414e"/></mesh></group>)}
  {concept&&<Box3D pos={[-1.6,1.07,0]} size={[.13,.08,1.32]} color="#22222c" rough={.17}/>}
 </group>;
}
function BuiltInShoe({color='#bfa9eb',sole='#e9e5de',laces='#e9e5de',material='Suede'}){
 const rough=material==='Leather'?.16:material==='Mesh'?.85:.69;
 return <group rotation={[0,-.55,0]} position={[0,.12,0]}>
  <Box3D pos={[0,.32,0]} size={[2.9,.42,1.16]} color={sole} round={.19} metal={.05} rough={.85}/>
  <Box3D pos={[-.18,.65,0]} size={[2.32,.56,1.07]} color={color} round={.25} metal={.06} rough={rough}/>
  <Box3D pos={[-.8,.96,0]} size={[.58,.52,.94]} color={color} round={.2} metal={.06} rough={rough}/>
  <Box3D pos={[1.15,.55,0]} size={[.65,.29,1.02]} color={color} round={.2} metal={.06} rough={rough}/>
  {Array.from({length:5},(_,i)=><mesh key={i} position={[.7-i*.27, .97-(i*.022),0]} rotation={[0,0,-.06]}><cylinderGeometry args={[.017,.017,.87,10]}/><meshStandardMaterial color={laces} roughness={.9}/></mesh>)}
  {[-.53,.53].map(z=><mesh key={z} position={[.2,.42,z]}><boxGeometry args={[1.7,.08,.02]}/><meshStandardMaterial color="#838b9e" roughness={.8}/></mesh>)}
 </group>;
}
function PublicAsset({item,paint}) {
 const gltf=useGLTF(LIBRARY[item].url);
 const clone=useMemo(()=>{
  const scene=gltf.scene.clone(true);
  const box=new THREE.Box3().setFromObject(scene);
  const size=box.getSize(new THREE.Vector3());
  const center=box.getCenter(new THREE.Vector3());
  const scalar=(item==='shoe'?3.1:3.7)/Math.max(size.x,size.y,size.z,.00001);
  scene.position.set(-center.x*scalar,-box.min.y*scalar,-center.z*scalar);
  scene.scale.multiplyScalar(scalar);
  scene.traverse(child=>{
   if(!child.isMesh) return;
   child.castShadow=true;
   child.receiveShadow=true;
   const base=Array.isArray(child.material)?child.material:[child.material];
   const originallyArray=Array.isArray(child.material);
   child.material=base.map(m=>{
    if(!m)return m;
    const c=m.clone();
    // Conservative selective recolouring: modify broad paint-like surfaces;
    // original glass, tyres, labels and textures remain untouched.
    const match=/body|paint|carpaint|exterior|metallic|car_body/i.test([child.name,m.name].join(' '));
    if(match&&c.color){c.color=new THREE.Color(paint); if('metalness' in c)c.metalness=.55;}
    return c;
   });
   if(!originallyArray)child.material=child.material[0];
  });
  return scene;
 },[gltf.scene,item,paint]);
 useEffect(()=>()=>clone.traverse(n=>{if(n.isMesh){const list=Array.isArray(n.material)?n.material:[n.material];list.forEach(m=>m?.dispose?.())}}),[clone]);
 return <primitive object={clone} rotation={[0,-.58,0]}/>;
}
class ModelErrorBoundary extends Component {
 constructor(props){super(props);this.state={error:false};}
 static getDerivedStateFromError(){return {error:true};}
 componentDidCatch(error){console.warn('Online public glTF failed, showing offline fallback:',error);}
 render(){return this.state.error?this.props.fallback:this.props.children;}
}
function Building({level=0, walls=true, light='Daylight', finishes='#c6b493', showFurniture=true}){
 const neutral=light==='Evening'?'#ecc395':'#e6e2d8';
 return <group rotation={[0,-.45,0]} position={[0,-.5,0]}>
   {[0,1].map(n=><group key={n} visible={level===2||level===n} position={[0,n*1.25,0]}>
     <Box3D pos={[0,0,0]} size={[3.6,.16,2.65]} color={finishes} round={.02} rough={.7} metal={.04}/>
     {walls&&<>
      <Box3D pos={[-1.82,.62,0]} size={[.14,1.28,2.65]} color={neutral} rough={.95} metal={.01} round={.01}/>
      <Box3D pos={[0,.62,-1.34]} size={[3.6,1.28,.14]} color={neutral} rough={.95} metal={.01} round={.01}/>
      <Box3D pos={[.35,.61,.18]} size={[.09,1.24,1.16]} color={neutral} rough={.9} metal={.01} round={.01}/>
     </>}
     {showFurniture&&n===0&&<>
       <Box3D pos={[-.78,.25,.44]} size={[1.22,.32,.62]} color="#715c69" round={.13} rough={.8} metal={.05}/>
       <Box3D pos={[-.9,.65,.71]} size={[1.06,.56,.17]} color="#715c69" round={.08} rough={.83} metal={.02}/>
       <Box3D pos={[.62,.27,.48]} size={[.77,.13,.74]} color="#af9176" round={.05} metal={.15} rough={.55}/>
       <Box3D pos={[1.15,.48,-.63]} size={[1,.08,.41]} color="#b59b77" round={.03} metal={.1} rough={.55}/>
     </>}
     {showFurniture&&n===1&&<>
       <Box3D pos={[-.5,.19,.22]} size={[1.58,.28,1.12]} color="#e1d5b9" round={.08} metal={.02} rough={.9}/>
       <Box3D pos={[1.04,.49,-.48]} size={[.82,.99,.52]} color="#9e7c64" round={.06} rough={.5}/>
       <Box3D pos={[-.5,.35,1]} size={[1.45,.1,.15]} color="#bc9679" round={.03} rough={.5}/>
     </>}
   </group>)}
   {level===2&&<Box3D pos={[0,2.55,0]} size={[3.67,.09,2.7]} color={finishes} round={.015} rough={.6} metal={.03}/>}
 </group>
}
function Scene({demo,item,paint,wheel,glass,sole,laces,material,level,walls,lighting,finishes,furniture,remote,lightPower,freeOrbit}){
 const fallback=demo==='cars'?<BuiltInCar kind={item} paint={paint} wheel={wheel} glass={glass}/>:<BuiltInShoe color={paint} sole={sole} laces={laces} material={material}/>;
 return <Canvas key={`${demo}-${freeOrbit}`} camera={{position:[4.7,3.2,5.8],fov:38,near:.1,far:100}} shadows gl={{alpha:true,antialias:true}} dpr={[1,1.65]}>
  <ambientLight intensity={.55*lightPower}/><hemisphereLight args={['#d5e9ff','#403545',.6*lightPower]}/>
  <directionalLight position={[5,8,5]} color={lighting==='Warm'?'#ffcca4':'#ffffff'} intensity={2.6*lightPower} castShadow shadow-mapSize={[1024,1024]}/>
  <directionalLight position={[-4,3,-5]} color="#a5a3f3" intensity={.75*lightPower}/>
  <group position={[0,demo==='building'?.35:-.05,0]}>
    {demo==='building'?<Building level={level} walls={walls} light={lighting} finishes={finishes} showFurniture={furniture}/>:
     remote ? <ModelErrorBoundary key={item} fallback={fallback}><Suspense fallback={fallback}><PublicAsset item={demo==='cars'?item:'shoe'} paint={paint}/></Suspense></ModelErrorBoundary>:fallback}
  </group>
  <mesh position={[0,-.66,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[200,200]}/><meshStandardMaterial color="#171720" roughness={.86}/></mesh>
  {freeOrbit?<TrackballControls noPan rotateSpeed={3.8} zoomSpeed={1.1} staticMoving dynamicDampingFactor={.16}/>:<OrbitControls enablePan={false} minDistance={2.6} maxDistance={12} maxPolarAngle={Math.PI*.95}/>} 
 </Canvas>;
}
function Control({label,desc,children}){return <div className="showroom-control"><div className="showroom-control-label"><strong>{label}</strong><span title={desc} aria-label={desc} tabIndex={0}>ⓘ</span></div>{children}</div>}
function Choices({values,value,set}){return <div className="showroom-choices">{values.map(x=>{const v=typeof x==='object'?x.value:x;return <button key={String(v)} className={value===v?'is-on':''} onClick={()=>set(v)}>{typeof x==='object'?x.label:x}</button>})}</div>}
export function ThreeShowrooms({config}){
 const [demo,setDemo]=useState('cars'),[car,setCar]=useState('toy'),[paint,setPaint]=useState('#ad193a');
 const [wheel,setWheel]=useState('spoke'),[glass,setGlass]=useState('#a6dbe8');
 const [sole,setSole]=useState('#f2e9dc'),[laces,setLaces]=useState('#f2e9dc'),[fabric,setFabric]=useState('Suede');
 const [level,setLevel]=useState(2),[walls,setWalls]=useState(true),[furniture,setFurniture]=useState(true),[finishes,setFinishes]=useState('#b69f83');
 const [remote,setRemote]=useState(false),[lighting,setLighting]=useState('Daylight'),[power,setPower]=useState(1),[freeOrbit,setFreeOrbit]=useState(true),[cameraKey,setCameraKey]=useState(0);
 const carMode=demo==='cars',shoeMode=demo==='fashion',buildingMode=demo==='building';
 const item=carMode?car:'shoe';
 return <div className="showroom-section">
  <div className="showroom-top"><div><span className="demo-eyebrow">THREE INTERACTIVE SHOWROOMS</span><h4>Discover what 3D can do for a real website.</h4><p>Pick a product, rotate it—including upside down—then customize it. These are real, interactive WebGL scenes.</p></div><span className="showroom-current"><Rotate3D size={15}/> LIVE 3D</span></div>
  <div className="showroom-tabs" role="tablist" aria-label="Three-dimensional demonstrations">
   {[["cars","Car showroom",CarFront],["fashion","Sneaker studio",Footprints],["building","Interior explorer",Building2]].map(([id,label,I])=><button type="button" role="tab" aria-selected={demo===id} className={demo===id?'is-selected':''} key={id} onClick={()=>{setDemo(id);setRemote(false)}}><I size={16}/>{label}</button>)}
  </div>
  <div className="showroom-interface">
   <div className="showroom-visual"><div className="showroom-visual-head"><span>{carMode?(car==='toy'?'01 / TOY CAR':'02 / CONCEPT CAR'):shoeMode?'03 / MATERIAL STUDIO':'04 / ARCHITECTURE'}</span><span>DRAG TO ORBIT · SCROLL TO ZOOM</span></div>
    <Scene key={cameraKey} {...{demo,item,paint,wheel,glass,sole,laces,material:fabric,level,walls,lighting,finishes,furniture,remote,lightPower:power,freeOrbit}}/>
    <div className="showroom-visual-foot"><span>{remote?'PUBLIC glTF REQUESTED · BUILT-IN FALLBACK DURING LOAD':buildingMode?'ORIGINAL PROCEDURAL INTERIOR':'BUILT-IN 3D PREVIEW · WORKS OFFLINE'}</span><button onClick={()=>setCameraKey(n=>n+1)} title="Reset camera"><RotateCcw size={15}/> Reset view</button></div>
   </div>
   <aside className="showroom-options">
    <div className="showroom-options-heading"><span>CONFIGURATOR</span><h4>{carMode?'Personalize a car':shoeMode?'Design a sneaker':'Explore the floor plan'}</h4></div>
    {carMode&&<><Control label="Choose a car" desc="Swap between two distinctly shaped vehicles."><Choices values={[{label:'Toy Car',value:'toy'},{label:'Concept Car',value:'concept'}]} value={car} set={setCar}/></Control><Control label="Wheel design" desc="Change wheel spokes in the built-in procedural model."><Choices values={['spoke','sport']} value={wheel} set={setWheel}/></Control><Control label="Glass tint" desc="Change the vehicle window tint in the built-in model."><input type="color" value={glass} onChange={e=>setGlass(e.target.value)} aria-label="Car glass tint"/></Control></>}
    {shoeMode&&<><Control label="Upper material" desc="Preview suede, mesh and leather styling on the built-in 3D shoe."><Choices values={['Suede','Leather','Mesh']} value={fabric} set={setFabric}/></Control><Control label="Sole colour" desc="Choose the sole material colour."><input type="color" value={sole} onChange={e=>setSole(e.target.value)}/></Control><Control label="Lace colour" desc="Change the visible lace colour."><input type="color" value={laces} onChange={e=>setLaces(e.target.value)}/></Control></>}
    {buildingMode&&<><Control label="Floor selection" desc="Reveal the ground floor, upper floor or full two-storey scene."><Choices values={[{value:0,label:'Ground'},{value:1,label:'Upper'},{value:2,label:'Both'}]} value={level} set={setLevel}/></Control><label className="showroom-check"><input type="checkbox" checked={walls} onChange={e=>setWalls(e.target.checked)}/> Show walls</label><label className="showroom-check"><input type="checkbox" checked={furniture} onChange={e=>setFurniture(e.target.checked)}/> Show furniture</label><Control label="Building finish" desc="Change floor and roof colour."><input type="color" value={finishes} onChange={e=>setFinishes(e.target.value)}/></Control></>}
    {!buildingMode&&<Control label={shoeMode?'Fabric colour':'Body paint'} desc="Set colour on the built-in model; online glTF models retain branded textures except selectable paint surfaces."><div className="paint-swatches">{['#ad193a','#d2a969','#e4e6eb','#252a39','#469a96','#7462ab'].map(c=><button key={c} aria-label={`Paint ${c}`} aria-pressed={paint===c} className={paint===c?'active':''} style={{background:c}} onClick={()=>setPaint(c)}/>)}<input type="color" value={paint} onChange={e=>setPaint(e.target.value)} title="Custom paint colour"/></div></Control>}
    {!buildingMode&&<Control label="3D asset source" desc="Built-in models run offline. Public assets load directly from Khronos GitHub; large files need an internet connection."><Choices values={[{value:false,label:'Instant / built-in'},{value:true,label:'Public glTF model'}]} value={remote} set={setRemote}/></Control>}
    <Control label="Studio lighting" desc="Choose the temperature of the showroom light."><Choices values={['Daylight','Warm']} value={lighting} set={setLighting}/></Control>
    <Control label="Light power" desc="Brightness of the overhead showroom lights."><input type="range" min=".3" max="2.5" step=".1" value={power} onChange={e=>setPower(+e.target.value)}/><small>{power.toFixed(1)}×</small></Control>
    <Control label="3D navigation" desc="Free rotation allows the product to roll upside down. Orbit mode keeps the vertical direction fixed."><Choices values={[{value:true,label:'Free 360°'},{value:false,label:'Keep upright'}]} value={freeOrbit} set={setFreeOrbit}/></Control>
    <div className="showroom-credit">{buildingMode?'Interior is constructed with original Three.js geometry; no external building download.':<><a href={LIBRARY[item].source} target="_blank" rel="noreferrer">Source &amp; licence <ArrowUpRight size={12}/></a><span>{LIBRARY[item].credit}</span></>}</div>
   </aside>
  </div>
  <div className="showroom-takeaways"><div><CarFront size={19}/><strong>Product configurator</strong><p>Useful for vehicles, furniture and consumer products.</p></div><div><Box size={19}/><strong>Material playground</strong><p>Customers can personalize colours, textures and finishes.</p></div><div><Building2 size={19}/><strong>Spatial exploration</strong><p>Rotate buildings, inspect floors and reveal details.</p></div></div>
 </div>;
}
