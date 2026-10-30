import React,{useRef,useState} from 'react';
import * as THREE from 'three';
import {Canvas,useFrame} from '@react-three/fiber';
import {ArrowUpRight,Box,Layers,MousePointer2,Sparkles,Activity,Orbit,MoveUpRight,MousePointerClick} from 'lucide-react';
import {Tilt} from '../vendor/UnlumenTilt';
import {BorderBeam,MagicParticles} from '../vendor/MagicEffects';

// Independent interactive components to demonstrate each technology beyond a logo.
function ProductMesh({finish='gold',spin=true}){
 const ref=useRef(null);
 useFrame((_state,delta)=>{if(ref.current&&spin)ref.current.rotation.y+=delta*.38});
 return <group ref={ref} rotation={[.25,-.45,.14]}>
  <mesh castShadow><torusKnotGeometry args={[.78,.25,180,32,2,3]}/>
   <meshPhysicalMaterial color={finish==='gold'?'#c9a878':finish==='chrome'?'#c3d2e6':'#ac6c90'} metalness={finish==='glass'?.1:.93} roughness={finish==='glass'?.04:.19} transmission={finish==='glass'?.68:0} thickness={.5} clearcoat={1}/>
  </mesh>
 </group>
}
function ThreeDemo({config,paused}){
 const [finish,setFinish]=useState('gold');
 return <div className="mini-demo three-mini">
  <div className="mini-copy"><span>01 / PRODUCT VIEWER</span><strong>Physical 3D in real websites</strong><p>Real geometry, material presets and dynamic lighting. Try changing the finish.</p></div>
  <div className="product-canvas"><Canvas camera={{position:[0,0,3.3],fov:44}} dpr={[1,1.5]} gl={{alpha:true,antialias:true}}>
    <ambientLight intensity={1.1}/><directionalLight position={[4,5,5]} intensity={3.5}/><pointLight position={[-3,-2,0]} intensity={16} color="#ffbbce"/>
    <ProductMesh finish={finish} spin={!paused}/>
  </Canvas></div>
  <div className="mini-actions">{['gold','chrome','glass'].map(x=><button aria-pressed={finish===x} className={finish===x?'mini-active':''} key={x} onClick={()=>setFinish(x)}>{x}</button>)}</div>
 </div>
}
function LiquidDemo({config,paused}){
 const [ripple,setRipple]=useState(0),[tab,setTab]=useState('Fluid CTA');
 return <div className="mini-demo liquid-mini" style={{'--flow-glow':config.tint,'--flow-period':`${11/Math.max(.15,config.speed)}s`,'--liquid-ambient':config.ambientFlow}}>
  <div className="mini-copy"><span>02 / INTERFACE EXPERIMENTS</span><strong>Liquid beyond logos</strong><p>Fluid interface backgrounds, reflective call-to-action buttons and motion-aware glass surfaces.</p></div>
  <div className="liquid-demo-tabs">{['Fluid CTA','Glass tile'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</div>
  {tab==='Fluid CTA'?<button className={`fluid-callout ${paused?'animations-paused':''}`} onClick={()=>setRipple(r=>r+1)}><span className="fluid-callout-text">Explore the collection <ArrowUpRight size={16}/></span><span key={ripple} className="fluid-ripple"/></button>:
   <div className="liquid-glass-tile"><span>REFRACTION / DEPTH</span><strong>Frosted surface</strong><small>Move the pointer. Change tint and liquid speed.</small></div>}
  <small className="mini-foot">CUSTOM CSS &amp; SHADER-INSPIRED UI · not bundled Liquid Logo components</small>
 </div>
}
function UnlumenDemo({config}){
 const [chosen,setChosen]=useState('Branding');
 return <div className="mini-demo unlumen-mini">
  <div className="mini-copy"><span>03 / INTERACTIVE CARDS</span><strong>Motion design for product UI</strong><p>Spring-driven tilt cards, responsive choice states and subtle editorial reveals.</p></div>
  <div className="unlumen-card-row">{['Branding','Websites','Campaigns'].map((item,i)=><Tilt key={item} className="mini-tilt-holder" rotationFactor={config.tilt*.6} springOptions={{stiffness:config.stiffness,damping:config.damping}}>
    <button onClick={()=>setChosen(item)} className={`mini-tilt-card ${chosen===item?'chosen':''}`} style={{borderRadius:Math.max(4,config.cardRadius*.6)}}>
      <span>0{i+1} <ArrowUpRight size={13}/></span><strong>{item}</strong><small>{item===chosen?'SELECTED • LIVE':'HOVER TO EXPLORE'}</small>
    </button>
   </Tilt>)}</div>
  <small className="mini-foot">USES UNLUMEN UI TILT PRIMITIVE · SELECTION REACT STATE</small>
 </div>
}
function MagicDemo({config,paused}){
 const [active,setActive]=useState(false),[messages,setMessages]=useState(0);
 return <div className={`mini-demo magic-mini ${paused?'animations-paused':''}`} style={{'--magic-color':config.color,'--magic-speed':`${7/Math.max(.2,config.speed)}s`,'--shimmer-speed':`${config.shimmerSpeed}s`}}>
   <div className="mini-copy"><span>04 / DELIGHTFUL MICRO-INTERACTIONS</span><strong>Polish the entire interface</strong><p>Border beams, counters, particle backgrounds and animated buttons work beyond the crest.</p></div>
   <div className="magic-mini-interaction">
     <MagicParticles count={Math.round(config.particles*.6)} speed={config.speed}/>
     <button className="magic-demo-button" aria-pressed={active} onClick={()=>{setActive(!active);setMessages(m=>m+1)}}>
       <BorderBeam duration={7/Math.max(.2,config.speed)} thickness={config.beamWidth} color={config.color}/>
       <Sparkles size={17}/>{active?'Effect activated':'Activate a magic button'}<ArrowUpRight size={15}/>
     </button>
     <div className="magic-counter"><strong>{String(messages).padStart(2,'0')}</strong><small>INTERACTIONS RECORDED</small></div>
   </div>
   <small className="mini-foot">LOCAL MAGIC UI-STYLE BEAM &amp; PARTICLE ADAPTATIONS</small>
 </div>
}
const showcaseInfo={
 three:{title:'Beyond the crest: interactive 3D',subtitle:'Product viewers, spatial interfaces, virtual showrooms and genuine geometry.'},
 liquid:{title:'Beyond the crest: fluid interfaces',subtitle:'Animated buttons, shimmering glass and shader-style backgrounds.'},
 unlumen:{title:'Beyond the crest: tactile UI',subtitle:'Tilt cards, hover behaviour, motion systems and subtle interaction design.'},
 magic:{title:'Beyond the crest: animated components',subtitle:'Beams, particle fields, dynamic buttons and compelling micro-interactions.'},
};
export function ExperienceShowcase({id,config,paused}){
 const info=showcaseInfo[id];
 return <section className={`experience-showcase experience-showcase-${id}`} aria-label={`${id} interface showcase`}>
  <div className="showcase-header"><span className="eyebrow">GO BEYOND THE LOGO <span className="showcase-dot"/></span><h3>{info.title}</h3><p>{info.subtitle}</p></div>
  {id==='three'?<ThreeDemo config={config} paused={paused}/>:id==='liquid'?<LiquidDemo config={config} paused={paused}/>:id==='unlumen'?<UnlumenDemo config={config}/>:<MagicDemo config={config} paused={paused}/>}
 </section>
}
