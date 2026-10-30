import React, {useState} from 'react';
import {ArrowRight,ArrowUpRight,Check,ChevronLeft,ChevronRight,Heart,Layers,MousePointer2,Play,Plus,Search,ShoppingBag,Sparkles,Star,Users,Wallet, Zap} from 'lucide-react';
import {Tilt} from '../vendor/UnlumenTilt';
import {BorderBeam,MagicParticles} from '../vendor/MagicEffects';

function DemoLabel({children}){return <span className="web-demo-label">{children}</span>}
function DemoHint({children}){return <p className="web-demo-hint">{children}</p>}

export function LiquidWebsite({config,paused}){
 const [brand,setBrand]=useState('AURA'),[layout,setLayout]=useState('Immersive'),[ripple,setRipple]=useState(0),[selected,setSelected]=useState(1),[email,setEmail]=useState(''),[subscribed,setSubscribed]=useState(false);
 const swatches=['#d9ac62','#7a99ff','#db80b6','#71d0ae'];
 const [accent,setAccent]=useState(swatches[0]);
 return <div className={`site-showcase liquid-website ${paused?'animations-paused':''}`} style={{'--site-accent':accent,'--site-flow':`${9/Math.max(.15,config.speed)}s`,'--site-distortion':config.distort,'--site-ambient':config.ambientFlow}}>
   <div className="site-editor-bar"><div><DemoLabel>DEMO WEBSITE 01 / IMMERSIVE PRODUCT LAUNCH</DemoLabel><h4>Liquid interfaces that feel alive.</h4></div><div className="site-local-tools"><span>Theme</span>{swatches.map(c=><button key={c} style={{'--swatch':c}} className={`site-swatch ${accent===c?'active':''}`} title={`Select ${c}`} onClick={()=>setAccent(c)}/>)}</div></div>
   <div className={`liquid-landing ${layout==='Editorial'?'is-editorial':''}`}>
     <nav className="liquid-site-nav"><button onClick={()=>setBrand(brand==='AURA'?'FLUX':'AURA')}>{brand}<span>®</span></button><span>WORK &nbsp; / &nbsp; EXPERIENCE &nbsp; / &nbsp; ABOUT</span><button onClick={()=>setRipple(n=>n+1)} className="liquid-nav-cta">GET STARTED <ArrowUpRight size={14}/></button></nav>
     <div className="liquid-site-hero"><div className="liquid-hero-copy"><DemoLabel>THE FUTURE FEELS DIFFERENT</DemoLabel><h2>Make every<br/><i>interaction</i><br/>unforgettable.</h2><p>An immersive demonstration of animated liquid surfaces, responsive buttons, glossy cards and elegant content structure.</p><button className="liquid-main-cta" onClick={()=>setRipple(n=>n+1)}>Explore experience <ArrowUpRight size={17}/><span key={ripple} className="liquid-click-ripple"/></button></div>
     <div className="liquid-hero-art"><div className="liquid-blob blob-a"/><div className="liquid-blob blob-b"/><div className="liquid-core"><span>LIQUID<br/>MOTION</span><small>MOVE TO FEEL THE FLOW</small></div><div className="liquid-orbit-stamp">CREATIVE / EXPERIMENTAL / INTERACTIVE</div></div></div>
     <div className="liquid-features"><button onClick={()=>setSelected(0)} className={selected===0?'selected':''}><span>01</span><strong>Flowing materials</strong><small>Glassy refraction and highlights</small><ArrowUpRight size={16}/></button><button onClick={()=>setSelected(1)} className={selected===1?'selected':''}><span>02</span><strong>Reactive surfaces</strong><small>Motion that follows intent</small><ArrowUpRight size={16}/></button><button onClick={()=>setSelected(2)} className={selected===2?'selected':''}><span>03</span><strong>Editorial UI</strong><small>Atmospheric layouts and detail</small><ArrowUpRight size={16}/></button></div>
    </div>
   <div className="site-mini-config"><label>LAYOUT STYLE <select value={layout} onChange={e=>setLayout(e.target.value)}><option>Immersive</option><option>Editorial</option></select></label><div><span>SELECTED FEATURE</span><b>{['Flowing materials','Reactive surfaces','Editorial UI'][selected]}</b></div><form onSubmit={e=>{e.preventDefault();if(email.includes('@'))setSubscribed(true)}}><label htmlFor="liquid-email">Try a newsletter form</label><input id="liquid-email" type="email" required placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/><button type="submit">{subscribed?'Subscribed ✓':'Subscribe'}</button></form></div>
   <DemoHint>Original sample landing page with custom shader-inspired and CSS liquid interactions. Global Flow speed, distortion, shine and tint controls adjust the laboratory treatment.</DemoHint>
  </div>;
}

const PRODUCTS=[{name:'Studio No. 01',type:'ESSENTIAL OBJECTS',price:'$180',tone:'#baa8a0'},{name:'Form No. 02',type:'ART DIRECTION',price:'$260',tone:'#a6b7bd'},{name:'Motion No. 03',type:'NEW COLLECTION',price:'$320',tone:'#b8ad92'}];
export function UnlumenWebsite({config}){
 const [category,setCategory]=useState('All'),[faves,setFaves]=useState([]),[selected,setSelected]=useState(0),[cart,setCart]=useState(0),[menu,setMenu]=useState(false);
 const categories=['All','Objects','Spaces','Stories'];
 return <div className="site-showcase unlumen-website">
   <div className="site-editor-bar"><div><DemoLabel>DEMO WEBSITE 02 / LUXURY EDITORIAL STORE</DemoLabel><h4>Every interaction is considered.</h4></div><div className="site-local-tools"><span>TILT {config.tilt}°</span><span>SPRING {config.stiffness}</span></div></div>
   <div className="unlumen-web-stage">
    <nav className="unlumen-site-nav"><div className="editorial-wordmark">MONOFORM<span>°</span></div><div className="editorial-nav-links"><button onClick={()=>setMenu(v=>!v)}>COLLECTIONS</button><button onClick={()=>setCategory('Stories')}>JOURNAL</button><button onClick={()=>setCategory('Spaces')}>ABOUT</button></div><button onClick={()=>setCart(n=>n+1)} title="Example basket interaction"><ShoppingBag size={17}/> BAG ({cart})</button></nav>
    {menu&&<div className="editorial-menu-pop"><button onClick={()=>{setCategory('Objects');setMenu(false)}}>Objects / 01 <ArrowUpRight size={14}/></button><button onClick={()=>{setCategory('Spaces');setMenu(false)}}>Spaces / 02 <ArrowUpRight size={14}/></button><button onClick={()=>{setCategory('Stories');setMenu(false)}}>Stories / 03 <ArrowUpRight size={14}/></button></div>}
    <div className="unlumen-hero"><div><DemoLabel>THE 2026 COLLECTION</DemoLabel><h2>Objects of<br/><i>intention.</i></h2><p>Thoughtful objects for spaces worth remembering. Move over the cards to explore real spring movement.</p></div><div className="unlumen-side-detail"><span>01 — 03</span><div className="unlumen-orb"/><small>DESIGNED FOR THE IN-BETWEEN</small></div></div>
    <div className="editorial-filter-bar"><div>{categories.map(x=><button key={x} className={x===category?'selected':''} onClick={()=>setCategory(x)}>{x}</button>)}</div><span>CURATED SELECTION / {category.toUpperCase()}</span></div>
    <div className="editorial-product-grid">{PRODUCTS.map((prod,i)=><Tilt key={prod.name} rotationFactor={config.tilt} springOptions={{stiffness:config.stiffness,damping:config.damping}}>
      <article className={`editorial-product ${selected===i?'is-selected':''}`} style={{'--product-tone':prod.tone,'--card-radius':`${config.cardRadius}px`}}>
       <div className="editorial-product-art"><div className={`editorial-shape editorial-shape-${i}`}/><button aria-label={`Favorite ${prod.name}`} className={faves.includes(i)?'favorited':''} onClick={()=>setFaves(v=>v.includes(i)?v.filter(j=>j!==i):[...v,i])}><Heart size={15} fill={faves.includes(i)?'currentColor':'none'}/></button></div>
       <div className="editorial-product-meta"><span>0{i+1} / {prod.type}</span><h4>{prod.name}</h4><div><small>{prod.price}</small><button onClick={()=>{setSelected(i);setCart(n=>n+1)}}>ADD TO BAG <Plus size={14}/></button></div></div>
      </article></Tilt>)}</div>
    <div className="editorial-news"><span>INTERACTIVE BY DESIGN</span><strong>A more expressive experience.</strong><p>Card tilt, hover reveals, responsive typography, dropdown navigation and actionable product states.</p><button onClick={()=>setSelected(i=>(i+1)%3)}>DISCOVER MORE <ArrowUpRight size={14}/></button></div>
   </div><DemoHint>Uses the public Unlumen Tilt primitive with custom storefront components. All navigation, favorites and bag counters are functional local demonstrations, not connected to a store.</DemoHint>
  </div>;
}

export function MagicWebsite({config,paused}){
 const [plan,setPlan]=useState('Pro'),[period,setPeriod]=useState('Monthly'),[workflows,setWorkflows]=useState(3256),[started,setStarted]=useState(false),[focus,setFocus]=useState(0);
 const [hovered,setHovered]=useState(null);
 const widgets=[{name:'Real-time intelligence',icon:Zap,detail:'Beautiful dashboards, without the noise.',n:'01'},{name:'Creative automation',icon:Sparkles,detail:'Design faster with delightful motion.',n:'02'},{name:'Connected workflows',icon:Layers,detail:'Everything coordinated in one place.',n:'03'},{name:'Global collaboration',icon:Users,detail:'Give your team a better canvas.',n:'04'}];
 return <div className={`site-showcase magic-website ${paused?'animations-paused':''}`} style={{'--magic-site-accent':config.color,'--magic-site-duration':`${Math.max(.8,config.shimmerSpeed)}s`}}>
   <div className="site-editor-bar"><div><DemoLabel>DEMO WEBSITE 03 / ANIMATED SaaS LANDING PAGE</DemoLabel><h4>A launch page that moves with you.</h4></div><span className="magic-editor-live"><span className="magic-live-dot"/> ANIMATION SYSTEM ACTIVE</span></div>
   <div className="magic-site-stage"><MagicParticles count={Math.round(config.particles*.95)} speed={config.speed}/>
    <nav className="magic-site-nav"><div className="magic-site-brand"><Sparkles size={18}/> NOVA<span>FLOW</span></div><span>Product &nbsp; Solutions &nbsp; Pricing</span><button onClick={()=>setStarted(s=>!s)}> {started?'Your trial is active':'Get started'} <ArrowUpRight size={14}/></button></nav>
    <div className="magic-site-hero"><div className="magic-announcement"><Sparkles size={13}/> INTRODUCING THE NEXT GENERATION <ArrowUpRight size={13}/></div><h2>Work at the<br/><span>speed of possibility.</span></h2><p>Beautifully connected tools, live data and seamless automation. Experience scroll-free animated hero sections, beams and interactive components.</p><div className="magic-hero-buttons"><button onClick={()=>setStarted(true)}><BorderBeam color={config.color} duration={Math.max(2,7/config.speed)} thickness={config.beamWidth}/> {started?'Trial ready':'Start a free trial'} <ArrowRight size={15}/></button><button onClick={()=>setFocus(x=>(x+1)%4)}><Play size={14}/> Explore features</button></div></div>
    <div className="magic-metrics"><div><strong>99.9%</strong><span>UPTIME</span></div><div><strong>{(workflows/1000).toFixed(1)}k</strong><span>AUTOMATIONS</span></div><div><strong>24/7</strong><span>SUPPORT</span></div></div>
    <div className="magic-bento-grid">{widgets.map((w,i)=>{const I=w.icon;return <button key={w.n} onClick={()=>{setFocus(i);setWorkflows(n=>n+25)}} className={`magic-bento-card ${i===focus?'is-active':''}`} onMouseEnter={()=>setHovered(i)} onMouseLeave={()=>setHovered(null)}>
      {(i===focus||hovered===i)&&<BorderBeam color={config.color} duration={Math.max(2,8/config.speed)} thickness={config.beamWidth}/>}
      <div><I size={22}/><span>{w.n}</span></div><strong>{w.name}</strong><small>{w.detail}</small><ArrowUpRight size={16} className="magic-bento-arrow"/></button>})}</div>
    <div className="magic-site-pricing"><div><DemoLabel>TRANSPARENT PRICING</DemoLabel><h3>Scale at your pace.</h3><p>A sample interactive pricing widget.</p></div><div className="pricing-widget"><div className="pricing-switch">{['Monthly','Annual'].map(p=><button className={period===p?'selected':''} onClick={()=>setPeriod(p)} key={p}>{p}</button>)}</div><div className="pricing-plans">{['Starter','Pro','Scale'].map((p,i)=><button key={p} className={plan===p?'chosen':''} onClick={()=>setPlan(p)}><span>{p}</span><strong>${[0,29,79][i]*(period==='Annual'?.8:1)===0?'0':Math.round([0,29,79][i]*(period==='Annual'?.8:1))}</strong><small>/MONTH</small></button>)}</div></div></div>
   </div><DemoHint>Magic UI-inspired local border beams, animated bento sections, statistics and pricing controls. The buttons operate as demonstration states; they do not charge or subscribe anyone.</DemoHint>
  </div>;
}
