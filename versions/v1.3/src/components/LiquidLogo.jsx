import React,{useEffect,useRef} from 'react';

// A custom WebGL port of the liquid-metal/edge-flow technique popularised by
// collidingScopes/liquid-logo (MIT). This is NOT an npm package from that project.
const VERT=`attribute vec2 p; varying vec2 uv; void main(){uv=p*0.5+0.5;gl_Position=vec4(p,0.,1.);}`;
const FRAG=`
precision highp float;
varying vec2 uv;
uniform sampler2D logo;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
uniform float motion;
uniform float liquid;
uniform float distort;
uniform float shine;
uniform float opacity;
uniform float original;
uniform float waveScale;
uniform float mouseResponse;
uniform float metalContrast;
uniform vec3 tint;
float wave(vec2 p,float t){
 return sin(p.x*29.0 + sin(p.y*17.0+t)*3.0+t*1.8)*0.47+
        sin(p.y*37.0 - p.x*11.0 + t*1.4)*0.28+
        cos((p.x+p.y)*22.0-t*1.1)*0.25;
}
void main(){
 vec2 v=uv;
 float t=time*motion;
 vec2 toMouse=uv-mouse;
 float nearby=exp(-dot(toMouse,toMouse)*15.0)*mouseResponse;
 float current=wave((uv-.5)*max(.3,waveScale)*vec2(1.0,1.1)+.5,t);
 vec2 flow=vec2(sin(uv.y*19.0+t*1.2),cos(uv.x*23.0-t*1.1));
 vec2 offset=(flow+vec2(current,-current*0.5))*(distort*.019)*(0.65+nearby);
 vec4 c=texture2D(logo,clamp(v+offset,0.0,1.0));
 float a=c.a*opacity;
 if(a<0.006)discard;
 float e=1.0/resolution.x;
 float n=length(vec2(texture2D(logo,clamp(v+offset+vec2(e,0.),0.,1.)).a-texture2D(logo,clamp(v+offset-vec2(e,0.),0.,1.)).a,
                  texture2D(logo,clamp(v+offset+vec2(0.,e),0.,1.)).a-texture2D(logo,clamp(v+offset-vec2(0.,e),0.,1.)).a));
 float rim=clamp(n*2.2,0.,1.);
 float crest=pow(max(0.0,sin(v.x*22.0+current*3.0+t*1.0)),15.0);
 float ribbon=pow(max(0.0,1.0-abs(sin(v.y*14.0+v.x*5.0+t*0.7+current*.4))),10.0);
 float reflection=pow(clamp(crest*0.9+ribbon*0.7+rim*0.6,0.,1.),1.0/max(0.25,metalContrast));
 vec3 chrome=mix(vec3(.12,.085,.095),vec3(.96,.89,.65),clamp(.26+reflection*1.15,0.,1.));
 chrome=mix(chrome, tint, 0.38);
 vec3 base=mix(chrome, c.rgb, original);
 vec3 metal=mix(base,chrome,liquid*.85);
 metal+=reflection*shine*vec3(.5,.43,.33);
 metal+=rim*.16*shine*vec3(1.,.74,.42);
 gl_FragColor=vec4(clamp(metal,0.,1.),a);
}`;
function shader(gl,type,source){let s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
export function LiquidLogo({variant,opts,paused}){
 const el=useRef(null),state=useRef({opts,paused});state.current={opts,paused};
 useEffect(()=>{
  const canvas=el.current;if(!canvas)return;
  let cancelled=false,raf=0,observer=null;
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false});
  if(!gl){canvas.dataset.error='WebGL is unavailable';return;}
  let prog,buffer,tex,vs,fs;
  try{
   vs=shader(gl,gl.VERTEX_SHADER,VERT);fs=shader(gl,gl.FRAGMENT_SHADER,FRAG);
   prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
   if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));
   gl.useProgram(prog);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
   gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const ap=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);
   tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
   gl.uniform1i(gl.getUniformLocation(prog,'logo'),0);
  }catch(e){canvas.dataset.error=e.message;return;}
  const image=new Image();image.onload=()=>{
    if(cancelled)return;
    gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    let started=performance.now(),playTime=0,last=performance.now();
    const unif={};for(let key of ['resolution','mouse','time','motion','liquid','distort','shine','opacity','original','tint','waveScale','mouseResponse','metalContrast'])unif[key]=gl.getUniformLocation(prog,key);
    const draw=now=>{
      if(cancelled)return;
      const pixelRatio=Math.min(window.devicePixelRatio||1,1.6);
      let w=Math.max(1,Math.round(canvas.clientWidth*pixelRatio));let h=Math.max(1,Math.round(canvas.clientHeight*pixelRatio));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h)}
      const {opts,paused}=state.current;
      if(!paused)playTime+=(now-last)*.001;last=now;
      gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform2f(unif.resolution,image.width,image.height);
      gl.uniform2f(unif.mouse,pointer.current[0],pointer.current[1]);
      gl.uniform1f(unif.time,playTime);
      gl.uniform1f(unif.motion,opts.speed);
      gl.uniform1f(unif.liquid,opts.liquid);
      gl.uniform1f(unif.distort,opts.distort);
      gl.uniform1f(unif.shine,opts.shine);
      gl.uniform1f(unif.opacity,opts.opacity);
      gl.uniform1f(unif.original,opts.original?1:0);
      gl.uniform1f(unif.waveScale,opts.waveScale ?? 1);
      gl.uniform1f(unif.mouseResponse,opts.mouseResponse ?? 1);
      gl.uniform1f(unif.metalContrast,opts.metalContrast ?? 1);
      const hex=opts.tint.replace('#','');const n=parseInt(hex,16)||0;
      gl.uniform3f(unif.tint,((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255);
      gl.drawArrays(gl.TRIANGLES,0,6);
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
  };
  image.src=`./logos/${variant}.png`;
  return()=>{cancelled=true;cancelAnimationFrame(raf);observer?.disconnect();if(gl){if(tex)gl.deleteTexture(tex);if(buffer)gl.deleteBuffer(buffer);if(prog)gl.deleteProgram(prog);if(vs)gl.deleteShader(vs);if(fs)gl.deleteShader(fs)}};
 },[variant]);
 const pointer=useRef([.5,.5]);
 return <div className="liquid-stage" onPointerMove={e=>{const r=e.currentTarget.getBoundingClientRect();pointer.current=[(e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height]}} onPointerLeave={()=>pointer.current=[.5,.5]}>
   <div className="liquid-orbits" style={{opacity:opts.ambientFlow,filter:`hue-rotate(${opts.mode==='Mercury'?120:opts.mode==='Rose gold'?-20:0}deg)`}}/>
   <div className="liquid-field liquid-field-a" style={{opacity:opts.ambientFlow,animationDuration:`${18/Math.max(.1,opts.speed)}s`}}/>
   <div className="liquid-field liquid-field-b" style={{opacity:opts.ambientFlow*.55,animationDuration:`${24/Math.max(.1,opts.speed)}s`}}/>
   <canvas ref={el} className="liquid-art" style={{aspectRatio:variant==='with'?'1024 / 753':'1463 / 1075'}} role="img" aria-label="Animated liquid metal treatment of the McIver College logo"/>
   <div className="stage-hint">LIVE GPU SHADER <span>•</span> MOVE POINTER TO DISTURB FLOW</div>
 </div>;
}
