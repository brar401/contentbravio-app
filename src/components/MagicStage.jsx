import React from 'react';
import {BorderBeam,MagicParticles} from '../vendor/MagicEffects';
export function MagicStage({variant,opts,paused}){
 return <div className={`magic-stage ${paused?'animations-paused':''} magic-${opts.mode.toLowerCase()}`} style={{'--glow':opts.glow,'--magic-color':opts.color,'--magic-speed':`${8/opts.speed}s`}}>
  <div className="magic-grid"/>
  <MagicParticles count={opts.particles} speed={opts.speed}/>
  <div className="magic-aura"/>
  <div className="magic-frame">
    <BorderBeam duration={Math.max(1,8/opts.speed)} color={opts.color} thickness={3}/>
    <span className="magic-top-label">MCIVER / SIGNATURE STUDY</span>
    <div className="magic-brand-wrap"><img className="magic-logo" src={`./logos/${variant}.png`} alt="Original McIver College logo" style={{opacity:opts.opacity}}/>
      <div className="magic-sheen" style={{maskImage:`url(/logos/${variant}.png)`,WebkitMaskImage:`url(/logos/${variant}.png)`}}/>
    </div>
    <div className="magic-bottom-label"><span>REVEAL THE EXCEPTIONAL</span><span>◈ 004</span></div>
  </div>
  <div className="stage-hint">BORDER BEAM <span>•</span> PARTICLES <span>•</span> SHIMMER REVEAL</div>
 </div>;
}
