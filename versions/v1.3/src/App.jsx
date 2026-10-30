import React,{useState,useEffect,useRef} from 'react';
import {ArrowDownRight,ArrowUpRight,Box,Check,ChevronDown,ChevronRight,Download,Expand,Layers3,MousePointer2,Pause,Play,RotateCcw,Settings2,SlidersHorizontal,Sparkles,SplitSquareHorizontal,Volume2,WandSparkles,Eye,Palette,Lightbulb,SunMoon} from 'lucide-react';
import {Logo3D} from './components/Logo3D';
import {LiquidLogo} from './components/LiquidLogo';
import {UnlumenStage} from './components/UnlumenStage';
import {MagicStage} from './components/MagicStage';
import {ExperienceShowcase} from './components/ExperienceShowcase';

const LIBRARIES=[
 {id:'three',number:'01',name:'React Three Fiber',title:'Sculpted in light.',description:'A free-floating, fully extruded dual-face emblem with a rugby-ball depth profile, smooth sidewalls and a full 360° orbit. No solid signboard.',type:'REAL 3D GEOMETRY',tone:'Golden sculptural depth',link:'https://r3f.docs.pmnd.rs/'},
 {id:'liquid',number:'02',name:'Liquid Logo',title:'A living surface.',description:'Liquid-metal GLSL, interactive ripples and flowing interface treatments — from original logo contours to buttons and atmospheric UI.',type:'CUSTOM WEBGL ADAPTATION',tone:'Dynamic metallic flow',link:'https://github.com/collidingScopes/liquid-logo'},
 {id:'unlumen',number:'03',name:'Unlumen UI',title:'An art of restraint.',description:'Spring-animated cards, pointer-aware light, magnetic micro-interactions and editorial motion across the entire interface.',type:'SPRING TILT ADAPTATION',tone:'Editorial interactive motion',link:'https://ui.unlumen.com/components/tilt-card'},
 {id:'magic',number:'04',name:'Magic UI',title:'Designed to dazzle.',description:'Animated border beams, particles, shimmer, kinetic interface elements and orbiting motion — a full web component showcase.',type:'ANIMATED EFFECT ADAPTATION',tone:'Particle-driven spectacle',link:'https://magicui.design/docs/components'}
];
const INIT={
 three:{material:'Metal',depth:.34,edgeDepth:.025,taperPower:1.5,roundness:.012,edgeSharpness:.22,smoothness:.98,sidePolish:.25,light:1.12,speed:1,original:true,keepUpright:true,keepReadable:true,free:false,autoRotate:true,opacity:1,gold:'#ab9671',burgundy:'#890a29'},
 liquid:{mode:'Molten gold',speed:1,liquid:.83,distort:.17,shine:.8,opacity:1,original:false,tint:'#d9ac62',waveScale:1,mouseResponse:1.1,metalContrast:1.05,ambientFlow:.75},
 unlumen:{style:'Spotlight',tilt:15,stiffness:165,damping:18,spot:0.88,shine:0.53,opacity:1,parallax:12,cardRadius:20,reveal:1},
 magic:{mode:'Radiant',speed:1.0,glow:.78,particles:44,opacity:1,color:'#f4c479',beamWidth:3,shimmerSpeed:2.4,gridDensity:1,orbital:1,twinkle:1}
};
// Studio settings are independent of material/effect settings and are preserved
// when switching library tabs. They affect the real R3F lights as well as CSS stages.
const STUDIO_INIT={background:'#171219',gradient:true,lighting:'Gallery',key:1,fill:.7,rim:.8,keyColor:'#ffe0b5',rimColor:'#c996ea',azimuth:-35,showFloor:false};
const BACKDROPS=[
 {name:'Midnight',color:'#171219'}, {name:'Onyx',color:'#090a11'},
 {name:'Ocean',color:'#14243b'}, {name:'Burgundy',color:'#461b31'},
 {name:'Forest',color:'#1b3833'}, {name:'Ivory',color:'#e9e5dc'}
];
const LIGHT_SCENES={
 Gallery:{key:1,fill:.7,rim:.8,keyColor:'#ffe0b5',rimColor:'#c996ea',azimuth:-35},
 Softbox:{key:.85,fill:1.35,rim:.35,keyColor:'#ffffff',rimColor:'#ffffff',azimuth:0},
 Dramatic:{key:1.65,fill:.18,rim:1.45,keyColor:'#ffd6a1',rimColor:'#f1a1c4',azimuth:45},
 Neon:{key:.8,fill:.4,rim:2,keyColor:'#8fd8ff',rimColor:'#ef85fa',azimuth:-60},
 Daylight:{key:1.2,fill:1.15,rim:.5,keyColor:'#fff4de',rimColor:'#ccddfa',azimuth:20}
};
const PRESETS={three:['Metal','Glass','Holographic','Satin'],liquid:['Molten gold','Mercury','Rose gold'],unlumen:['Spotlight','Prism','Minimal'],magic:['Radiant','Celestial','Minimal']};
const EXPLAIN={
 'Creative direction':'Choose a material or effect preset. Each preset changes the finish, not the original logo artwork.',
 'Metal':'A reflective metallic surface with highlights that move when the logo rotates.',
 'Glass':'A partly glass-like material; the actual logo shapes and their depth remain 3D.',
 'Holographic':'A colour-shifting, iridescent material inspired by holographic surfaces.',
 'Satin':'A softer, less reflective surface, like brushed or painted metal.',
 'Molten gold':'Gold-coloured reflections that flow across the transparent logo.',
 'Mercury':'A cooler, chrome-like liquid metal colour scheme.',
 'Rose gold':'Warm rose-coloured reflections with a softer metallic effect.',
 'Spotlight':'A light follows your pointer as the logo gently tilts.',
 'Prism':'A light-catching, iridescent presentation with a subtle colour tint.',
 'Minimal':'A calmer presentation with fewer dramatic effects.',
 'Radiant':'Bright shimmering borders and glowing particles around the logo.',
 'Celestial':'A cool-toned, star-like particle and light treatment.',
 'Extrusion depth':'Maximum front-to-back thickness at the CENTRE of the oval. The tapered edges can be much thinner.',
 'Edge thickness':'The physical front-to-back thickness at the far LEFT and RIGHT ends of the whole oval. Make this small while increasing Extrusion depth for a rugby-ball-shaped side profile.',
 'Rounded edge width':'How far the rounded shoulder extends outward from the original contour. Increase for softer curved sides; reduce to keep letter corners sharper.',
 'Edge sharpness':'Makes curved shoulders crisper without removing the three-dimensional thickness. Increase for a firmer, less rounded outline.',
 'Surface smoothness':'Reduces the thin striped/faceted lines on 3D side walls by blending adjacent side normals. Higher = smoother reflections while the flat lettering faces stay crisp.',
 'Side polish':'Controls how glossy the vertical sides look. Lower = mirror-sharp reflections, higher = soft and matte.',
 'Studio light':'Brightness of the lights shining on the 3D logo and its curved metal sides.',
 'Opacity':'How solid or transparent the selected effect appears. 100% is fully visible.',
 'Logo opacity':'How visible the logo is within the surrounding motion effect.',
 'Taper shape':'Controls how quickly the 3D thickness reduces as you move from the middle to the left or right ends. High values make a fuller rugby-ball profile.',
 'Inspection angle':'Choose an exact horizontal rotation angle. Use 175° to test the rear lettering and 90° to inspect the tapered edge.',
 'Preserve original colours':'Uses the logo’s original burgundy and gold colours on the raised 3D forms.',
 'Gold material':'Choose the gold colour used on the 3D oval and divider when original colours are off.',
 'Burgundy material':'Choose the colour used for the lettering when original colours are off.',
 'Keep Upright':'Keeps the logo vertical during horizontal 360° rotation. You can still see the front, sides and back.',
 'Keep Text Readable':'Uses separate fully extruded artwork for each face and shows only the face turned towards the viewer. No backing plate or mirrored text bleed-through.',
 'Free Rotation Mode':'Allows vertical tilt and roll as well as horizontal rotation. Turn off Keep Upright to use it.',
 'Auto-rotate':'Rotates the 3D logo continuously without dragging it.',
 'Rotation speed':'How quickly the logo turns automatically. Zero stops automatic movement, while dragging still works.',
 'Reset view':'Returns the 3D camera-facing orientation to zero degrees.',
 'Pause':'Stops automatic movement without changing your selected settings.',
 'Liquid strength':'How strongly the simulated liquid-metal reflections change the original logo colours.',
 'Fluid distortion':'How much the flowing liquid visually bends the logo edges. Use a low value to keep the letters more readable.',
 'Reflective shine':'Brightness and strength of the moving light streaks across the liquid effect.',
 'Flow speed':'How fast the liquid waves and metal highlights travel. 0 means frozen; 2× means twice the normal speed.',
 'Original colour emphasis':'Keeps more of the original burgundy and gold visible instead of changing them into chrome or gold liquid.',
 'Liquid tint':'Choose the main colour mixed into the liquid-metal reflections.',
 'Spring tilt':'How many degrees the logo presentation tilts when you move the pointer.',
 'Spring stiffness':'How quickly and firmly the tilted presentation follows your pointer and returns to rest.',
 'Spotlight power':'Brightness of the light that follows the cursor.',
 'Surface shine':'Strength of the glossy highlight sweeping over the Unlumen presentation.',
 'Border beam speed':'How quickly the bright animated line moves around the showcase border.',
 'Particle count':'Number of small moving points of light around the logo.',
 'Glow intensity':'Brightness of the soft halo surrounding the logo and frame.',
 'Beam colour':'Colour of the animated light travelling around the border.',
 'Wave scale':'Adjusts the size and number of flowing metallic waves in the liquid shader.',
 'Cursor ripple':'How much your pointer disturbs the fluid surface.',
 'Metal contrast':'Difference between the darkest liquid folds and bright reflective highlights.',
 'Ambient flow':'How prominently the liquid effect spreads into surrounding interface backgrounds.',
 'Spring damping':'How quickly a tilted card stops wobbling and settles after pointer movement.',
 'Parallax distance':'How far the decorative frame and logo move relative to the pointer.',
 'Card corner radius':'Roundness of the interactive presentation card corners.',
 'Reveal intensity':'Strength of the reveal and surface movement on hover.',
 'Beam width':'Thickness of the light beam that travels around the Magic UI showcase card.',
 'Shimmer speed':'Speed of the reflective light streak passing across the logo and showcase buttons.',
 'Grid density':'Size and repetition of the animated background grid.',
 'Orbit speed':'Speed of the small orbiting design elements in the Magic UI example.',
 'Twinkle intensity':'Strength of animation used by ambient moving particles.',
 'Reset all settings':'Restores this library’s controls to their initial values.',
 'Export all settings':'Downloads your current choices for all four sections as a JSON file.',
 'Studio background':'Changes the colour behind the logo in every library section. It does not alter either logo.',
 'Gradient background':'Adds a soft studio-light gradient instead of one flat backdrop colour.',
 'Key light':'Brightness of the main lamp shining on the front and side of the 3D logo.',
 'Fill light':'Soft light that reduces deep shadows so the lettering stays visible.',
 'Rim light':'Back/side lighting that makes the gold rim and extruded edges stand out.',
 'Light direction':'Moves the main light around the model without rotating the logo.',
 'Key light colour':'Colour or warmth of the main studio light. White looks clean; gold looks warmer.',
 'Rim light colour':'Colour of the secondary light accent that highlights the back and edges.',
 'Show studio floor':'Optional horizontal floor under the 3D model that can catch shadows.',
 'Studio environment':'Your background and lighting presets apply across all four experiences. You can mix a background and light setup, then fine-tune each lamp.',
 'Original logo integrity':'Both original PNG files are stored unchanged. The lab uses separate transparent copies and geometry derived from them; no control overwrites the originals.',
};
function Help({name,description}){
 const [open,setOpen]=useState(false);
 const message=description||EXPLAIN[name]||`Information about ${name}.`;
 return <span className="control-help" onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}}>
  <button type="button" className="help-eye" aria-label={`What does ${name} mean?`} aria-expanded={open} title={message} onClick={e=>{e.preventDefault();e.stopPropagation();setOpen(x=>!x)}}><Eye size={13}/></button>
  <span className={`help-bubble ${open?'is-open':''}`} role="tooltip">{message}</span>
 </span>;
}
function GroupTitle({number,name,description}){return <div className="control-group-title">{number} &nbsp; {name} <Help name={name} description={description}/></div>}
const pick=(id,v)=> id==='three'?({material:v}): id==='liquid'? ({mode:v, ...(v==='Mercury'?{tint:'#cbd5ee',liquid:1,distort:.3}:v==='Rose gold'?{tint:'#e8a8a4',liquid:.63,distort:.14}:{tint:'#d9ac62',liquid:.83,distort:.17})}) : id==='unlumen'?({style:v}):({mode:v,color:v==='Celestial'?'#b4a8ff':v==='Minimal'?'#d3c2a8':'#f4c479'});
function Segment({items,value,onChange}){return <div className="segment">{items.map(it=><button type="button" key={it.value} aria-pressed={value===it.value} className={value===it.value?'active':''} onClick={()=>onChange(it.value)}>{it.label}</button>)}</div>}
function Range({title,value,set,min,max,step=.01,unit='',digits=2}){
 const id=React.useId();
 return <div className="range-field"><div className="range-head"><span className="range-label"><label htmlFor={id}>{title}</label><Help name={title}/></span><output htmlFor={id}>{Number(value).toFixed(digits)}{unit}</output></div><input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/></div>
}
function Switch({title,value,set,desc}){
 const id=React.useId();
 return <div className="switch-field"><div className="switch-description"><span className="range-label"><label htmlFor={id}>{title}</label><Help name={title}/></span>{desc&&<small>{desc}</small>}</div><input id={id} type="checkbox" checked={!!value} onChange={e=>set(e.target.checked)}/><label htmlFor={id} className={`switch-track ${value?'checked':''}`} aria-label={title}><span/></label></div>
}
function ColorInput({title,value,set}){
 const id=React.useId();
 return <div className="color-field"><span className="range-label"><label htmlFor={id}>{title}</label><Help name={title}/></span><span className="color-well"><input id={id} type="color" value={value} onChange={e=>set(e.target.value)}/>{value.toUpperCase()}</span></div>
}
function StudioPanel({studio,changeStudio,resetStudio,selected}){
 return <section className="studio-panel" aria-label="Studio environment controls">
  <div className="studio-panel-header"><div><span className="eyebrow">GLOBAL STUDIO</span><h3><SunMoon size={19}/> Atmosphere &amp; lights <Help name="Studio environment"/></h3></div><button type="button" className="studio-reset" onClick={resetStudio} title="Reset studio environment"><RotateCcw size={14}/></button></div>
  <div className="studio-panel-intro">Keep your preview in view. Scroll this settings column independently.</div>
  <div className="studio-field-title">Backdrop presets</div>
  <div className="studio-swatch-row">{BACKDROPS.map(p=><button type="button" key={p.name} className={`studio-swatch ${studio.background.toLowerCase()===p.color?'selected':''}`} onClick={()=>changeStudio('background',p.color)} title={`${p.name} studio background`} aria-label={`Use ${p.name} background`} aria-pressed={studio.background.toLowerCase()===p.color} style={{'--swatch':p.color}}><span/></button>)}</div>
  <ColorInput title="Studio background" value={studio.background} set={v=>changeStudio('background',v)}/>
  <Switch title="Gradient background" value={studio.gradient} set={v=>changeStudio('gradient',v)}/>
  <div className="studio-field-title">Lighting presets</div>
  <div className="studio-light-pills">{Object.keys(LIGHT_SCENES).map(name=><button key={name} className={studio.lighting===name?'active':''} onClick={()=>changeStudio('__lighting__',name)} type="button">{name}</button>)}</div>
  <Range title="Key light" value={studio.key} set={v=>changeStudio('key',v)} min={0} max={2.5} step={.05} unit="×"/>
  <Range title="Fill light" value={studio.fill} set={v=>changeStudio('fill',v)} min={0} max={2.5} step={.05} unit="×"/>
  <Range title="Rim light" value={studio.rim} set={v=>changeStudio('rim',v)} min={0} max={2.5} step={.05} unit="×"/>
  <Range title="Light direction" value={studio.azimuth} set={v=>changeStudio('azimuth',v)} min={-180} max={180} step={5} digits={0} unit="°"/>
  <ColorInput title="Key light colour" value={studio.keyColor} set={v=>changeStudio('keyColor',v)}/>
  <ColorInput title="Rim light colour" value={studio.rimColor} set={v=>changeStudio('rimColor',v)}/>
  {selected==='three'&&<Switch title="Show studio floor" value={studio.showFloor} set={v=>changeStudio('showFloor',v)} desc="Optional ground plane under the 3D model"/>}
  {selected!=='three'&&<div className="studio-non3d-note">On this tab, the backdrop and lighting colours affect the surrounding interface. Physical lamp intensities are demonstrated in React Three Fiber.</div>}
 </section>
}
function ConfigPanel({id,config,change,onReset,rotation,setRotation,paused,setPaused,revision,setRevision}){
 const set=(key)=>(val)=>change(key,val);
 return <div className="controls">
  <div className="controls-title"><div><span className="eyebrow">THE CONTROLS</span><h3>Fine-tune the effect.</h3></div><span className="icon-with-help"><button className="icon-button" title="Reset all settings" onClick={onReset}><RotateCcw size={16}/></button><Help name="Reset all settings"/></span></div>
  <div className="control-group"><GroupTitle number="01" name="Creative direction"/><div className="preset-tiles">{PRESETS[id].map(p=><div key={p} className="preset-tile"><button className={(config.material||config.mode||config.style)===p?'selected':''} onClick={()=>change('__preset__',p)}>{p}</button><Help name={p}/></div>)}</div></div>
  {id==='three'&&<>
   <div className="control-group"><GroupTitle number="02" name="Physical material" description="Adjust real three-dimensional letter thickness, surface curvature and the finish of the sides."/>
    <Range title="Extrusion depth" value={config.depth} set={set('depth')} min={.045} max={.7} step={.005} unit=" u" digits={3}/>
    <Range title="Edge thickness" value={Math.min(config.depth,config.edgeDepth)} set={set('edgeDepth')} min={.004} max={config.depth} step={.002} unit=" u" digits={3}/>
    <Range title="Taper shape" value={config.taperPower} set={set('taperPower')} min={.3} max={4} step={.05}/>
    <Range title="Rounded edge width" value={config.roundness} set={set('roundness')} min={.001} max={.05} step={.001} unit=" u" digits={3}/>
    <Range title="Edge sharpness" value={config.edgeSharpness} set={set('edgeSharpness')} min={0} max={1} step={.05}/>
    <Range title="Surface smoothness" value={config.smoothness} set={set('smoothness')} min={0} max={1} step={.05}/>
    <Range title="Side polish" value={config.sidePolish} set={set('sidePolish')} min={.04} max={.95} step={.01}/>
    <p className="control-notice">OPEN-CREST / DUAL 3D FACES: no solid board. The visible front or rear 3D artwork switches when the camera crosses 90° or 270°, preventing mirrored lettering showing through the hollow centre.</p>
    <Range title="Studio light" value={config.light} set={set('light')} min={.2} max={2.6}/>
    <Range title="Opacity" value={config.opacity} set={set('opacity')} min={.25} max={1}/>
    <Switch title="Preserve original colours" value={config.original} set={set('original')} desc="Exact original artwork is printed on the faces"/>
    {!config.original&&<><ColorInput title="Gold material" value={config.gold} set={set('gold')}/><ColorInput title="Burgundy material" value={config.burgundy} set={set('burgundy')}/></>}
   </div>
   <div className="control-group"><GroupTitle number="03" name="360° inspection" description="Spin the physical model, lock it upright, inspect its clean rear face, or rotate freely."/>
    <Switch title="Keep Upright" value={config.keepUpright} set={v=>{set('keepUpright')(v);if(v)change('free',false);if(v)setRotation(r=>({...r,x:0,z:0}))}} desc="Horizontal orbit stays vertically upright"/>
    <Switch title="Keep Text Readable" value={config.keepReadable} set={set('keepReadable')} desc="Real extruded letters on both viewing faces"/>
    <Switch title="Free Rotation Mode" value={config.free} set={v=>{set('free')(v);if(v)change('keepUpright',false)}} desc="Drag in both axes; Shift + drag to roll"/>
    <Switch title="Auto-rotate" value={config.autoRotate} set={set('autoRotate')}/>
    <Range title="Rotation speed" value={config.speed} set={set('speed')} min={0} max={3} step={.05} unit="×"/>
    <Range title="Inspection angle" value={Math.round((((rotation.y*180/Math.PI)%360)+360)%360)} set={deg=>{setPaused(true);setRotation(r=>({...r,y:deg*Math.PI/180}))}} min={0} max={360} step={1} digits={0} unit="°"/>
    <div className="inspection-picks">{[0,90,175,180,270].map(deg=><button key={deg} onClick={()=>{setPaused(true);setRotation(r=>({...r,y:deg*Math.PI/180}))}} title={`Inspect model at ${deg} degrees`}>{deg}°</button>)}</div>
    <div className="rotation-actions"><span className="action-with-help"><button className="action-outline" onClick={()=>setPaused(v=>!v)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?'Resume':'Pause'}</button><Help name="Pause"/></span><span className="action-with-help"><button className="action-outline" onClick={()=>{setRevision(r=>r+1);setRotation({x:0,y:0,z:0})}}><RotateCcw size={14}/> Reset view</button><Help name="Reset view"/></span></div>
   </div>
  </>}
  {id==='liquid'&&<div className="control-group"><GroupTitle number="02" name="Liquid parameters" description="Change the liquid-like reflections, how strongly they bend and how fast they flow."/>
   <Range title="Liquid strength" value={config.liquid} set={set('liquid')} min={0} max={1}/><Range title="Fluid distortion" value={config.distort} set={set('distort')} min={0} max={2}/><Range title="Reflective shine" value={config.shine} set={set('shine')} min={0} max={2}/><Range title="Flow speed" value={config.speed} set={set('speed')} min={0} max={3} step={.05} unit="×"/><Range title="Opacity" value={config.opacity} set={set('opacity')} min={.3} max={1}/>
   <Range title="Wave scale" value={config.waveScale} set={set('waveScale')} min={.35} max={3}/><Range title="Cursor ripple" value={config.mouseResponse} set={set('mouseResponse')} min={0} max={3}/><Range title="Metal contrast" value={config.metalContrast} set={set('metalContrast')} min={.25} max={2.5}/><Range title="Ambient flow" value={config.ambientFlow} set={set('ambientFlow')} min={0} max={2}/>
   <Switch title="Original colour emphasis" value={config.original} set={set('original')} desc="Preserve burgundy and gold instead of chrome"/><ColorInput title="Liquid tint" value={config.tint} set={set('tint')}/><div className="action-with-help"><button className="action-outline full" onClick={()=>setPaused(v=>!v)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?'Resume flow':'Pause flow'}</button><Help name="Pause" description="Freezes or resumes the movement of the liquid-metal shader without resetting your settings."/></div>
  </div>}
  {id==='unlumen'&&<div className="control-group"><GroupTitle number="02" name="Responsive movement" description="Customize how the display tilts when you move your mouse and how light follows the pointer."/>
   <Range title="Spring damping" value={config.damping} set={set('damping')} min={5} max={55} step={1} digits={0}/><Range title="Parallax distance" value={config.parallax} set={set('parallax')} min={0} max={40} step={1} digits={0} unit=" px"/><Range title="Card corner radius" value={config.cardRadius} set={set('cardRadius')} min={0} max={42} step={1} digits={0} unit=" px"/><Range title="Reveal intensity" value={config.reveal} set={set('reveal')} min={0} max={2}/><Range title="Spring tilt" value={config.tilt} set={set('tilt')} min={0} max={32} step={1} digits={0} unit="°"/><Range title="Spring stiffness" value={config.stiffness} set={set('stiffness')} min={50} max={400} step={5} digits={0}/><Range title="Spotlight power" value={config.spot} set={set('spot')} min={0} max={1.5}/><Range title="Surface shine" value={config.shine} set={set('shine')} min={0} max={1.5}/><Range title="Opacity" value={config.opacity} set={set('opacity')} min={.2} max={1}/>
  </div>}
  {id==='magic'&&<div className="control-group"><GroupTitle number="02" name="Motion design" description="Customize the speed, brightness, particles and moving line animations."/>
   <Range title="Beam width" value={config.beamWidth} set={set('beamWidth')} min={1} max={10} step={.5} unit=" px" digits={1}/><Range title="Shimmer speed" value={config.shimmerSpeed} set={set('shimmerSpeed')} min={.5} max={8} unit=" s"/><Range title="Grid density" value={config.gridDensity} set={set('gridDensity')} min={.5} max={3}/><Range title="Orbit speed" value={config.orbital} set={set('orbital')} min={0} max={3}/><Range title="Twinkle intensity" value={config.twinkle} set={set('twinkle')} min={0} max={3}/><Range title="Border beam speed" value={config.speed} set={set('speed')} min={.15} max={3} step={.05} unit="×"/><Range title="Particle count" value={config.particles} set={set('particles')} min={0} max={100} step={1} digits={0}/><Range title="Glow intensity" value={config.glow} set={set('glow')} min={0} max={2}/><Range title="Logo opacity" value={config.opacity} set={set('opacity')} min={.2} max={1}/><ColorInput title="Beam colour" value={config.color} set={set('color')}/><div className="action-with-help"><button className="action-outline full" onClick={()=>setPaused(v=>!v)}>{paused?<Play size={14}/>:<Pause size={14}/>} {paused?'Resume animation':'Pause animation'}</button><Help name="Pause" description="Freezes or resumes the Magic UI border and particle animations without losing your settings."/></div>
  </div>}
  <div className="controls-footer">CUSTOM SETTINGS <span>LOCAL TO THIS LIBRARY</span></div>
 </div>
}
function Preview({id,variant,config,rotation,setRotation,paused,setPaused,revision,studio}){
 if(id==='three')return <Logo3D {...{variant,opts:config,rotation,setRotation,paused,setPaused,revision,studio}}/>;
 if(id==='liquid')return <LiquidLogo {...{variant,opts:config,paused}}/>;
 if(id==='unlumen')return <UnlumenStage key={config.stiffness} {...{variant,opts:config,paused}}/>;
 return <MagicStage {...{variant,opts:config,paused}}/>;
}
export default function App(){
 const [selected,setSelected]=useState('three'),[mode,setMode]=useState('without'),[sideBySide,setSideBySide]=useState(true),[studio,setStudio]=useState(STUDIO_INIT),[configs,setConfigs]=useState(INIT),[rotation,setRotation]=useState({x:0,y:0,z:0}),[paused,setPaused]=useState(false),[revision,setRevision]=useState(0);
 const stageRef=useRef(null);const library=LIBRARIES.find(l=>l.id===selected);const config=configs[selected];
 useEffect(()=>{document.title=`${library.name} | McIver College Logo Experience Lab`},[library]);
 function change(key,value){setConfigs(prev=>({...prev,[selected]:key==='__preset__'? {...prev[selected],...pick(selected,value)}:{...prev[selected],[key]:value}}))}
 function changeStudio(key,value){setStudio(prev=>key==='__lighting__'?{...prev,...LIGHT_SCENES[value],lighting:value}:{...prev,[key]:value, ...(key==='key'||key==='fill'||key==='rim'||key==='azimuth'||key==='keyColor'||key==='rimColor'?{lighting:'Custom'}:{})})}
 function resetStudio(){setStudio({...STUDIO_INIT})}
 function reset(){setConfigs(prev=>({...prev,[selected]:{...INIT[selected]}}));setRotation({x:0,y:0,z:0});setRevision(n=>n+1);setPaused(false)}
 function exportSettings(){const payload={app:'McIver College Logo Experience Lab',logos:mode,view:sideBySide?'side-by-side':'stacked',section:selected,settings:configs,studio,rotation};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='mciver-logo-lab-settings.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}
 function fullScreen(){const el=stageRef.current;if(!el)return;if(document.fullscreenElement)document.exitFullscreen();else el.requestFullscreen?.()}
 const versions=mode==='both'?['without','with']:[mode];
 return <div className={`app-shell theme-${selected}`}>
   <header className="topbar"><a className="wordmark" href="#top"><span className="mini-symbol">M<span>.</span></span><span><strong>MCIVER COLLEGE</strong><small>CREATIVE TECHNOLOGY STUDIO</small></span></a><nav className="top-nav"><a href="#workspace">THE STUDIO</a><a href="#library-collection">THE COLLECTION</a><a href="#about">THE PROCESS</a></nav><a className="top-cta" href="https://mcivercollege.edu.au" target="_blank" rel="noreferrer">COLLEGE WEBSITE <ArrowUpRight size={13}/></a></header>
   <main id="top">
     <section className="intro"><div className="intro-kicker"><span className="pulse-dot"/> BRAND EXPERIMENTATION / 2026 <span className="intro-separator"/> FOUR DISTINCT CREATIVE SYSTEMS</div><div className="intro-grid"><div><h1>A familiar identity.<br/><em>An extraordinary presence.</em></h1><p>Four visual disciplines. Two original McIver logos. An open playground for material, light, motion and interaction.</p></div><div className="intro-aside"><div className="four-num">04<span>EXPERIENCES</span></div><div className="intro-line"/><p>EXPLORE EVERY DIMENSION<br/>OF YOUR IDENTITY.</p></div></div></section>
     <section id="workspace" className="workspace-area"><div className="identity-toolbar"><div className="toolbar-head"><span className="mini-label">THE IDENTITY</span><span className="toolbar-label">Choose what to explore</span></div><div className="toolbar-selections"><Segment items={[{value:'without',label:'Without tagline'},{value:'with',label:'With tagline'},{value:'both',label:'Both logos'}]} value={mode} onChange={setMode}/>{mode==='both'&&<button className={`compare-toggle ${sideBySide?'chosen':''}`} onClick={()=>setSideBySide(s=>!s)}><SplitSquareHorizontal size={16}/>{sideBySide?'Side by side':'Stacked view'}</button>}</div><span className="toolbar-note"><span className="green-dot"/> ORIGINAL ASSETS LOADED</span></div>
     <div className="workspace-grid"><aside className="library-menu"><div className="menu-caption">THE LABORATORY <span>01 — 04</span></div>{LIBRARIES.map(item=><button key={item.id} className={`library-nav-item ${selected===item.id?'active':''}`} onClick={()=>{setSelected(item.id);setPaused(false)}}><span className="nav-number">{item.number}</span><span className="nav-content"><strong>{item.name}</strong><small>{item.tone}</small></span><ArrowUpRight size={16}/></button>)}<div className="menu-footer"><span className="menu-glow"/>PERFORMANCE FIRST.<br/>DESIGN WITHOUT COMPROMISE.<span>ALL EXPERIMENTS RUN IN YOUR BROWSER.</span></div></aside>
     <div className="experience-main"><div className="experience-header"><div><div className="numbered-label"><span className="active-line"/> EXPERIENCE {library.number} / 04 <span className="slash">/</span> {library.type}</div><h2>{library.title}</h2><p>{library.description}</p></div><a className="library-source" href={library.link} target="_blank" rel="noreferrer" title="View official library source">SOURCE <ArrowUpRight size={16}/></a></div>
     <div className="effect-bar"><span>SELECT A TREATMENT</span><div className="effect-pills">{PRESETS[selected].map(x=><button className={(config.material||config.mode||config.style)===x?'current':''} key={x} onClick={()=>change('__preset__',x)}>{x}</button>)}</div></div>
     <div className="stage-shell" ref={stageRef} style={{'--studio-bg':studio.background,'--studio-backdrop':studio.gradient?`radial-gradient(ellipse at 35% 25%, color-mix(in srgb, ${studio.background}, ${studio.keyColor} 23%), ${studio.background} 73%)`:studio.background,'--studio-key-color':studio.keyColor,'--studio-rim-color':studio.rimColor,'--studio-glow':Math.max(0.02,studio.key)}}><div className="stage-topline"><div className="live-label"><span className="green-dot"/> LIVE VISUAL PREVIEW</div><div className="stage-top-actions"><span>{mode==='without'?'VERSION A':mode==='with'?'VERSION B':'DUAL COMPARISON'}</span><button title="Cycle studio background" aria-label="Cycle studio background" onClick={()=>{const i=BACKDROPS.findIndex(p=>p.color===studio.background);changeStudio('background',BACKDROPS[(i+1)%BACKDROPS.length].color)}}><Palette size={15}/></button><button title="Expand preview" onClick={fullScreen}><Expand size={15}/></button></div></div>
     <div className={`stage-content ${versions.length===2?(sideBySide?'dual':'stacked'):''}`}>{versions.map(variant=><div className="single-stage" key={`${selected}-${variant}`}><Preview {...{id:selected,variant,config:selected==='three'&&mode==='both'&&variant==='with'?{...config,autoRotate:false}:config,rotation,setRotation,paused,setPaused,revision,studio}}/><div className="variant-label"><span className="variant-index">{variant==='without'?'A':'B'}</span>{variant==='without'?'WITHOUT TAGLINE':'WITH TAGLINE'}</div></div>)}</div>
     <div className="stage-footer"><span><MousePointer2 size={14}/> {selected==='three'?'DRAG TO ROTATE · SHIFT + DRAG FOR ROLL':selected==='unlumen'?'MOVE YOUR MOUSE TO TILT':'MOVE YOUR MOUSE TO INTERACT'}</span><span className="integrity-note">ORIGINAL LOGOS: <strong>UNCHANGED</strong> <Help name="Original logo integrity"/></span></div></div>
     <ExperienceShowcase id={selected} config={config} variant={mode==='with'?'with':'without'} paused={paused}/>
     <div className="insight-row"><div><span className="insight-icon">✳</span><span><strong>UNTOUCHED ORIGINALS</strong><small>Original logo files are included separately.</small></span></div><div><span className="insight-icon">◉</span><span><strong>TRANSPARENT NEGATIVE SPACE</strong><small>White backgrounds removed on derived assets only.</small></span></div><div><span className="insight-icon">⌘</span><span><strong>INDEPENDENT SYSTEMS</strong><small>Each library has its own settings.</small></span></div></div>
     </div>
     <aside className="settings-sidebar" aria-label="Scrollable controls"><StudioPanel {...{studio,changeStudio,resetStudio,selected}}/><ConfigPanel id={selected} {...{config,change,onReset:reset,rotation,setRotation,paused,setPaused,revision,setRevision}}/><div className="export-wrap"><button className="export-button" onClick={exportSettings}><Download size={17}/> EXPORT ALL SETTINGS <ArrowUpRight size={14}/></button><Help name="Export all settings"/></div><div className="settings-footnote">Transparent PNGs were derived from your original logo images. The archived originals are never modified.</div></aside>
     </div>
     </section>
     <section id="library-collection" className="collection"><div className="section-top"><span className="eyebrow">THE FOUR DISCIPLINES</span><div><h2>Distinct by design.</h2><p>Choose an experience to open it in the live studio and explore its controls.</p></div></div><div className="collection-grid">{LIBRARIES.map(item=><button key={item.id} className={`collection-card collection-${item.id}`} onClick={()=>{setSelected(item.id);document.getElementById('workspace')?.scrollIntoView({behavior:'smooth'})}}><span className="collection-num">{item.number} / 04</span><div className="collection-art"><img src="./logos/without.png" alt="McIver logo preview"/></div><div className="collection-info"><span>{item.type}</span><h3>{item.name}</h3><p>{item.tone}</p></div><ArrowUpRight className="collection-arrow" size={20}/></button>)}</div></section>
     <section id="about" className="about"><div className="about-left"><span className="eyebrow">BEHIND THE CRAFT</span><h2>Same identity.<br/><em>New perspective.</em></h2></div><div className="about-right"><p>The artwork is derived from the two supplied logo versions. No font recreation, invented lettering or replacement crest. R3F uses genuine extruded contours and visibility-controlled front/rear geometry with no backing. Its width-dependent depth creates a tapered, rugby-ball-like cross-section. The other sections showcase techniques on both the logo and surrounding UI.</p><p><strong>Implementation note:</strong> Liquid Logo is a standalone open-source project, not a React component package. Its section is a clearly labelled custom WebGL adaptation. Unlumen UI uses its MIT-licensed public Tilt primitive with a custom spotlight gallery. Magic UI effects are locally implemented adaptations of documented public components; no Pro components are copied.</p><div className="source-links"><a href="https://github.com/pmndrs/react-three-fiber" target="_blank" rel="noreferrer">REACT THREE FIBER <ArrowUpRight size={13}/></a><a href="https://github.com/collidingScopes/liquid-logo" target="_blank" rel="noreferrer">LIQUID LOGO <ArrowUpRight size={13}/></a><a href="https://ui.unlumen.com" target="_blank" rel="noreferrer">UNLUMEN UI <ArrowUpRight size={13}/></a><a href="https://magicui.design" target="_blank" rel="noreferrer">MAGIC UI <ArrowUpRight size={13}/></a></div></div></section>
   </main><footer className="footer"><span>MCIVER COLLEGE <i>✦</i> LOGO EXPERIENCE LAB</span><span>ORIGINAL IDENTITY, NEW POSSIBILITIES. &nbsp; © 2026</span></footer>
 </div>;
}
