import React,{useState} from 'react';
import {Tilt} from '../vendor/UnlumenTilt';

// Unlumen UI's original MIT Tilt primitive (vendored) provides spring-based
// motion. Our cursor-tracked spotlight and image presentation are custom.
export function UnlumenStage({variant,opts,paused}){
 const [pos,setPos]=useState([50,50]);
 function move(e){const r=e.currentTarget.getBoundingClientRect();setPos([100*(e.clientX-r.left)/r.width,100*(e.clientY-r.top)/r.height])}
 const skin=opts.style==='Spotlight'?'museum':opts.style==='Prism'?'prism':'quiet';
 return <div className={`unlumen-stage ${skin}`} onPointerMove={move} onPointerLeave={()=>setPos([50,50])} style={{'--spot-x':`${pos[0]}%`,'--spot-y':`${pos[1]}%`,'--spot':opts.spot,'--shine':opts.shine,'--unlumen-radius':`${opts.cardRadius}px`,'--reveal':opts.reveal,'--parallax-x':`${(pos[0]-50)/50*opts.parallax}px`,'--parallax-y':`${(pos[1]-50)/50*opts.parallax}px`}}>
   <div className="unlumen-ambient"/>
   <div className="unlumen-floating-orb" style={{transform:`translate(${(pos[0]-50)*.3}px,${(pos[1]-50)*.3}px)`,opacity:opts.reveal*.38}}/>
   <div className="unlumen-rails"><span>BRAND STUDY / 03</span><span>INTERACTIVE LIGHT</span></div>
   <Tilt className="unlumen-card" rotationFactor={opts.tilt} springOptions={{stiffness:opts.stiffness,damping:opts.damping}}>
     <div className="unlumen-card-inner" style={{background:opts.style==='Prism'?'rgba(30,31,47,.69)':'rgba(26,20,25,.76)'}}>
       <div className="unlumen-gloss" style={{opacity:opts.shine}}/>
       <img className="unlumen-logo" src={`./logos/${variant}.png`} alt="Original McIver College logo" style={{opacity:opts.opacity,filter:opts.style==='Prism'?'drop-shadow(0 0 23px rgba(170,159,255,.35))':''}}/>
       <div className="unlumen-corner tl"/><div className="unlumen-corner tr"/><div className="unlumen-corner bl"/><div className="unlumen-corner br"/>
       <div className="unlumen-card-caption">McIVER COLLEGE <span>EST. PERTH, WA</span></div>
     </div>
   </Tilt>
   <div className="unlumen-bottom">SPRING PHYSICS <span/> DIRECTIONAL SPOTLIGHT <span/> CURSOR RESPONSIVE</div>
   <div className="stage-hint">MOVE POINTER TO TILT <span>•</span> SPRING MOTION</div>
 </div>;
}
