import React from 'react';
// Local MIT-style adaptations of Magic UI's Border Beam / Particles / Shiny effects.
// Public references: https://magicui.design/docs/components/border-beam
// No proprietary Magic UI Pro source is used.
export function BorderBeam({duration=8,thickness=2,color='#dfbb7e'}){
 return <span aria-hidden="true" className="magic-beam" style={{'--beam-speed':`${duration}s`,'--beam-thickness':`${thickness}px`,'--beam-color':color}}/>;
}
export function MagicParticles({count=36,speed=1}){
 return <div aria-hidden="true" className="magic-particle-field">{Array.from({length:count},(_,i)=>{
 const r=((i*7919)%997)/997, x=((i*1049)%991)/991;
 return <span key={i} className="magic-particle" style={{left:`${x*100}%`,top:`${r*100}%`,'--p-size':`${i%7===0?3:1.5}px`,'--p-delay':`${((i*53)%110)/10*-1}s`,'--p-speed':`${(4+i%7)/Math.max(speed,.1)}s`}}/>;
 })}</div>;
}
