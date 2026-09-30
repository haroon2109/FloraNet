'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Scan, Upload, ShieldCheck, Sparkles as SparklesIcon } from 'lucide-react';
import { useLeafDiagnosis, LiveHotspot } from '@/hooks/useLeafDiagnosis';

// ──────────────────────────────────────────────────────────────────────────────
// GLSL Holographic Shader: vertex sway + scan lines
// ──────────────────────────────────────────────────────────────────────────────
const holoVert = /* glsl */`
  uniform float uTime; varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos;
  void main(){
    vUv=uv; vNormal=normalize(normalMatrix*normal);
    vec3 pos=position;
    pos.x+=sin(uTime*1.8+pos.y*2.5)*0.04*pos.y;
    vWorldPos=(modelMatrix*vec4(pos,1.0)).xyz;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.0);
  }
`;
const holoFrag = /* glsl */`
  uniform float uTime; uniform vec3 uColor; uniform float uSeverity;
  varying vec2 vUv; varying vec3 vNormal; varying vec3 vWorldPos;
  void main(){
    float scan=smoothstep(0.0,0.06,fract(vWorldPos.y*6.0-uTime*1.2))*smoothstep(0.12,0.06,fract(vWorldPos.y*6.0-uTime*1.2));
    vec3 viewDir=normalize(cameraPosition-vWorldPos);
    float rim=pow(1.0-max(dot(vNormal,viewDir),0.0),2.5);
    float edge=clamp(fract(vUv.x*8.0)*0.22+fract(vUv.y*14.0)*0.22,0.0,1.0);
    vec3 color=uColor*(0.38+rim*1.85+scan*0.9+edge);
    color=mix(color,vec3(1.0,0.12,0.08),uSeverity*0.52*(0.5+0.5*sin(uTime*5.0)));
    gl_FragColor=vec4(color,0.52+rim*0.36+scan*0.25);
  }
`;

interface Hotspot { id: string; site: string; disease: string; severity: 'Healthy'|'Warning'|'Critical'; confidence: number; treatment: string; pos: [number,number,number]; color: string; sevNum: number; }

// Single 3D anchor for live pins (scene layout only — never data).
const PIN_ANCHOR: { pos: [number,number,number]; color: string; sevNum: number } = {
  pos: [0, 4.3, 0.3], color: '#FBBF24', sevNum: 0.5,
};

function toHotspotPins(live: LiveHotspot[]): Hotspot[] {
  return live.map((h) => ({ ...h, pos: PIN_ANCHOR.pos, color: PIN_ANCHOR.color, sevNum: PIN_ANCHOR.sevNum }));
}
type Crop = 'Maize'|'Soybean'|'Sorghum';
const CROPS: Record<Crop,{leafCount:number;color:string}> = { Maize:{leafCount:6,color:'#00FFCC'}, Soybean:{leafCount:9,color:'#22DDFF'}, Sorghum:{leafCount:5,color:'#88FFAA'} };

function HotspotPin({ h, active, onSelect }: { h: Hotspot; active: boolean; onSelect: () => void }) {
  const mRef = useRef<THREE.Mesh>(null), rRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mRef.current) { const s = (active?1.35:1.0)+(active?0.4:0.14)*Math.sin(t*(active?6:3.5)); mRef.current.scale.setScalar(s); }
    if (rRef.current) {
      const rs = 1.0+0.5*Math.abs(Math.sin(t*2.5)); rRef.current.scale.set(rs,rs,rs);
      (rRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6-0.3*Math.abs(Math.sin(t*2.5));
    }
  });
  return (
    <group position={h.pos}>
      <mesh ref={mRef} onClick={(e)=>{e.stopPropagation();onSelect();}}>
        <sphereGeometry args={[0.22,20,20]} />
        <meshStandardMaterial color={h.color} emissive={h.color} emissiveIntensity={active?3.5:1.4} roughness={0.1} metalness={0.7} transparent opacity={0.95} />
      </mesh>
      <mesh ref={rRef} rotation={[Math.PI/2,0,0]}>
        <ringGeometry args={[0.28,0.38,28]} />
        <meshBasicMaterial color={h.color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PlantBody({ crop, selH }: { crop: Crop; selH: Hotspot | null }) {
  const cfg = CROPS[crop];
  const sevNum = selH ? selH.sevNum : 0;
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:holoVert, fragmentShader:holoFrag, transparent:true, side:THREE.DoubleSide, depthWrite:false,
    uniforms:{ uTime:{value:0}, uColor:{value:new THREE.Color(cfg.color)}, uSeverity:{value:sevNum} }
  }), [cfg.color]);
  useFrame(({clock})=>{ mat.uniforms.uTime.value=clock.getElapsedTime(); mat.uniforms.uSeverity.value=selH ? selH.sevNum : 0; mat.uniforms.uColor.value.set(cfg.color); });
  return (
    <>
      <mesh material={mat} castShadow><cylinderGeometry args={[0.18,0.3,9,14,8]} /></mesh>
      {Array.from({length:cfg.leafCount}).map((_,i)=>{
        const a=(i*Math.PI*2)/cfg.leafCount;
        return <mesh key={i} material={mat} position={[Math.cos(a)*1.65,(i-cfg.leafCount/2)*1.05,Math.sin(a)*1.65]} rotation={[0,a,Math.PI/3.5]}><coneGeometry args={[1.1,3.9,6,4]} /></mesh>;
      })}
    </>
  );
}

function PlantScene({ crop, pins, selH, setSelH }: { crop: Crop; pins: Hotspot[]; selH: Hotspot | null; setSelH:(h:Hotspot)=>void }) {
  const gRef = useRef<THREE.Group>(null);
  useFrame((_,dt)=>{ if(gRef.current) gRef.current.rotation.y+=dt*0.2; });
  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight position={[0,10,0]} intensity={1.3} color="#00FFFF" />
      <pointLight position={[8,-4,8]} intensity={0.5} color="#0044FF" />
      <pointLight position={[-8,4,-8]} intensity={0.4} color="#00FF88" />
      <pointLight position={[0,0,4]} intensity={0.8} color="#00FFCC" distance={12} />
      <Stars radius={60} depth={40} count={2000} factor={3} saturation={0.6} fade speed={0.3} />
      <Sparkles count={30} scale={[14,14,14]} size={1.2} speed={0.15} color="#00FFCC" opacity={0.3} />
      <mesh position={[0,-4,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[18,18,20,20]} />
        <meshBasicMaterial color="#00FFCC" wireframe transparent opacity={0.06} />
      </mesh>
      <group ref={gRef}>
        <PlantBody crop={crop} selH={selH} />
        {pins.map(h=><HotspotPin key={h.id} h={h} active={selH?.id===h.id} onSelect={()=>setSelH(h)} />)}
      </group>
      <OrbitControls enableZoom enableDamping dampingFactor={0.08} minDistance={7} maxDistance={22} />
    </>
  );
}

export default function ZenithDiagnostics() {
  const [crop, setCrop] = useState<Crop>('Maize');
  // No pre-selected hotspot: pins render ONLY from a live AI diagnosis.
  const [selH, setSelH] = useState<Hotspot | null>(null);
  const { hotspots, diagnose, isScanning, error, reset } = useLeafDiagnosis();
  const pins = toHotspotPins(hotspots);
  const [uploadImg, setUploadImg] = useState<string|null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if(!f) return;
    setUploadImg(URL.createObjectURL(f));
    reset();
    setSelH(null);
    const live = await diagnose(f);
    const mapped = toHotspotPins(live);
    if (mapped.length > 0) setSelH(mapped[0]);
  };

  const sev = selH ? selH.severity : null;

  return (
    <section id="plant" className="relative py-20 px-6 md:px-14" style={{ background: 'radial-gradient(ellipse at 50% 20%, #00110D 0%, #010608 100%)' }}>
      <div className="max-w-[1400px] mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><Scan size={14} className="text-cyan-400 animate-pulse" /><span className="text-[10px] font-bold text-cyan-400/75 uppercase tracking-widest">Holographic Plant Twin</span></div>
          <h2 className="text-[34px] md:text-[44px] font-black text-white leading-tight">AI Pathology<br /><span className="text-cyan-400">Diagnostic View</span></h2>
          <p className="text-[14px] text-slate-400 mt-1.5 max-w-[480px]">Upload a leaf photo for AI diagnosis. Pulsing hotspots pin pathogen severity on the live 3D holographic plant twin.</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
          {(['Maize','Soybean','Sorghum'] as Crop[]).map(c=>(
            <button key={c} onClick={()=>setCrop(c)} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${crop===c?'bg-cyan-700/80 text-cyan-100':'text-white/45 hover:text-white/80'}`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-8 items-stretch">
        {/* AI Side Panel */}
        <div className="xl:w-[260px] shrink-0 flex flex-col gap-4">
          <div className="bg-black/65 backdrop-blur-xl border border-cyan-900/45 rounded-2xl p-4 text-white flex-1">
            <div className="flex items-center gap-2 mb-3"><SparklesIcon size={14} className="text-cyan-400" /><span className="text-[12px] font-bold text-cyan-300">AI Leaf Scanner</span></div>
            <p className="text-[10px] text-white/50 leading-relaxed mb-3">Upload an infected leaf to pin AI hotspots onto the 3D twin with severity scores.</p>
            <label className="flex flex-col items-center p-4 border-2 border-dashed border-cyan-800/55 hover:border-cyan-500 rounded-xl cursor-pointer bg-white/4 hover:bg-white/8 transition-all text-center">
              <Upload size={16} className="text-cyan-400 mb-1.5" />
              <span className="text-[10px] font-bold text-white">{isScanning?'Analysing…':'Upload Leaf Photo'}</span>
              <span className="text-[8px] text-white/40 mt-0.5">PNG / JPG up to 10 MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
            {error && (
              <div className="mt-3 p-2.5 bg-red-950/60 border border-red-800/60 rounded-xl text-[10px] text-red-200">{error}</div>
            )}
            {uploadImg && (
              <div className="mt-3 flex items-center gap-2 p-2 bg-white/8 rounded-xl border border-white/10">
                <img src={uploadImg} alt="leaf" className="w-10 h-10 rounded-lg object-cover" />
                <div><span className="text-[10px] font-bold text-emerald-400 block">Uploaded ✓</span><span className="text-[8px] text-white/50">{isScanning ? 'AI analysing…' : 'Sent for live diagnosis'}</span></div>
              </div>
            )}
          </div>

          {/* Hotspot list — live diagnosis pins only */}
          <div className="flex flex-col gap-2">
            {pins.length === 0 && (
              <p className="text-[10px] text-white/40 p-3 border border-white/10 rounded-xl">No hotspots yet — upload a leaf photo for a live AI diagnosis.</p>
            )}
            {pins.map(h=>(
              <button key={h.id} onClick={()=>setSelH(h)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer text-white ${selH?.id===h.id?'bg-black/60 border-white/20':'bg-black/30 border-white/8 hover:border-white/20'}`}
                style={selH?.id===h.id?{borderColor:`${h.color}55`}:{}}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:h.color}} />
                  <span className="text-[10px] font-bold" style={{color:h.color}}>{h.site}</span>
                </div>
                <span className="text-[9px] text-white/50 leading-snug line-clamp-1">{h.disease}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 h-[520px] rounded-3xl overflow-hidden border border-cyan-900/30 shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ background: 'radial-gradient(ellipse at 50% 20%, #00110D 0%, #010608 100%)' }}>
          <Canvas camera={{ position:[0,1,14], fov:42 }} dpr={[1,1.5]} gl={{ antialias:true, toneMapping:THREE.ACESFilmicToneMapping, toneMappingExposure:1.4 }}>
            <PlantScene crop={crop} pins={pins} selH={selH} setSelH={setSelH} />
          </Canvas>
        </div>

        {/* Diagnosis Card — live result only */}
        <div className="xl:w-[280px] shrink-0 bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white self-start">
          {!selH ? (
            <p className="text-[10px] text-white/50 leading-relaxed">
              {isScanning
                ? 'The AI is analysing your leaf photo — the diagnosis card will appear here.'
                : error
                  ? error
                  : 'Upload a leaf photo to run a live AI diagnosis. No pre-loaded diagnosis — this card appears only from the live result.'}
            </p>
          ) : (
          <>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor:selH.color}} />
            <h4 className="text-[13px] font-black leading-tight">{selH.disease}</h4>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border" style={{color:selH.color,borderColor:`${selH.color}50`,backgroundColor:`${selH.color}18`}}>{selH.site}</span>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${sev==='Healthy'?'bg-emerald-900/55 text-emerald-300 border-emerald-700/45':sev==='Warning'?'bg-amber-900/55 text-amber-300 border-amber-700/45':'bg-red-900/55 text-red-300 border-red-700/45'}`}>{sev}</span>
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border border-white/10 text-white/55">{selH.confidence}% AI</span>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white/5 border border-white/8 rounded-xl mb-3">
            <ShieldCheck size={13} className="text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-white/80">{selH.treatment}</p>
          </div>
          {/* Confidence bar */}
          <div className="mt-auto">
            <div className="flex justify-between text-[9px] text-white/40 mb-1"><span>AI Confidence</span><span>{selH.confidence}%</span></div>
            <div className="w-full h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full transition-all duration-700" style={{width:`${selH.confidence}%`,backgroundColor:selH.color}} /></div>
          </div>
          </>
          )}
        </div>
      </div>
    </section>
  );
}
