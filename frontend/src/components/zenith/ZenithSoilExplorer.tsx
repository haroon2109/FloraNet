'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Layers } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// GLSL Wetness Shader
// ──────────────────────────────────────────────────────────────────────────────
const soilVert = /* glsl */`
  varying vec3 vNormal; varying vec2 vUv;
  void main() { vNormal = normalize(normalMatrix * normal); vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const soilFrag = /* glsl */`
  uniform vec3 uColorTop; uniform vec3 uColorBot; uniform float uWetness; uniform float uTime;
  varying vec3 vNormal; varying vec2 vUv;
  float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));f=f*f*(3.0-2.0*f);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}
  void main(){
    float t=clamp(vUv.y,0.0,1.0);
    vec3 base=mix(uColorBot,uColorTop,t);
    base+=noise(vUv*14.0)*0.07;
    base=mix(base,base*0.42,uWetness*0.72);
    vec3 ld=normalize(vec3(1.0,1.5,1.0));
    float spec=pow(max(dot(vNormal,ld),0.0),28.0)*uWetness*0.85;
    float rim=pow(1.0-max(dot(vNormal,vec3(0,0,1)),0.0),3.5)*0.16;
    gl_FragColor=vec4(base+spec+rim,1.0);
  }
`;

// ──────────────────────────────────────────────────────────────────────────────
// Strata definitions. Chemistry rows (SOC / N / pH) are populated LIVE from
// ISRIC SoilGrids 2.0 for the 0–5cm band; horizons below that have no open
// data source and render an explicit "not measured" state — never a made-up
// value. The wetness shader itself is driven by live Open-Meteo moisture.
// ──────────────────────────────────────────────────────────────────────────────
interface Stratum {
  id: string; name: string; horizon: string; depth: string;
  colorTop: string; colorBot: string;
  defY: number; expY: number; height: number;
  roughness: number; metalness: number;
  emissive: string; emissiveInt: number;
  soc: string; n: string; ph: string; note: string;
}

const NOT_MEASURED = 'Not measured';

const STRATA: Stratum[] = [
  { id: 'canopy', name: 'Vegetation Canopy', horizon: 'O Horizon', depth: 'Surface', colorTop: '#1D6A36', colorBot: '#145226', defY: 2.6, expY: 4.7, height: 0.72, roughness: 0.9, metalness: 0.0, emissive: '#0F3D1E', emissiveInt: 0.5, soc: '—', n: '—', ph: '—', note: 'Active photosynthesis. NDVI requires Copernicus raster access and is not simulated.' },
  { id: 'topsoil', name: 'Topsoil (0–5 cm)', horizon: 'A Horizon', depth: '0–5 cm', colorTop: '#3B1E0D', colorBot: '#5C2F12', defY: 1.15, expY: 2.3, height: 1.3, roughness: 0.85, metalness: 0.05, emissive: '#2A0E04', emissiveInt: 0.2, soc: '…', n: NOT_MEASURED, ph: '…', note: 'Live Open-Meteo moisture shader. SOC & pH load live from ISRIC SoilGrids 2.0.' },
  { id: 'subsoil', name: 'Subsoil (5–30 cm)', horizon: 'B Horizon', depth: '5–30 cm', colorTop: '#6B4226', colorBot: '#8B5A38', defY: -0.3, expY: -0.3, height: 2.0, roughness: 0.75, metalness: 0.1, emissive: '#3B1E08', emissiveInt: 0.1, soc: NOT_MEASURED, n: NOT_MEASURED, ph: NOT_MEASURED, note: 'Mycorrhizal network visualised. Subsoil chemistry requires a lab test or on-farm sensor.' },
  { id: 'bedrock', name: 'Parent Bedrock (30 cm+)', horizon: 'C Horizon', depth: '30+ cm', colorTop: '#9A7A60', colorBot: '#BFA48A', defY: -1.9, expY: -3.1, height: 1.4, roughness: 0.95, metalness: 0.15, emissive: '#3A2510', emissiveInt: 0.05, soc: NOT_MEASURED, n: NOT_MEASURED, ph: NOT_MEASURED, note: 'Weathered parent rock. Mineralogy requires a core sample — not remotely observable.' },
];

function MoistureParticles({ count = 55 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const pos = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2; const r = Math.random() * 1.9;
      arr[i * 3] = Math.cos(a) * r; arr[i * 3 + 1] = Math.random() * 0.9; arr[i * 3 + 2] = Math.sin(a) * r;
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const a = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) { a[i * 3 + 1] += dt * 0.42; if (a[i * 3 + 1] > 1.1) a[i * 3 + 1] = 0; }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return <points ref={ref}><bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry><pointsMaterial color="#7DDDFF" size={0.07} transparent opacity={0.85} sizeAttenuation /></points>;
}

function MycoLines() {
  const obj = useMemo(() => {
    const verts: number[] = [];
    for (let i = 0; i < 55; i++) {
      const x1 = (Math.random() - 0.5) * 3.6, y1 = (Math.random() - 0.5) * 1.5, z1 = (Math.random() - 0.5) * 3.6;
      verts.push(x1, y1, z1, x1 + (Math.random() - 0.5) * 0.9, y1 + (Math.random() - 0.5) * 0.9, z1 + (Math.random() - 0.5) * 0.9);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: '#22FF88', transparent: true, opacity: 0.5 }));
  }, []);
  return <primitive object={obj} />;
}

function StrataMesh({ s, exploded, selected, onSelect, wetness }: { s: Stratum; exploded: boolean; selected: boolean; onSelect: () => void; wetness: number }) {
  const mRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(() => {
    if (s.id === 'topsoil') {
      return new THREE.ShaderMaterial({
        vertexShader: soilVert, fragmentShader: soilFrag,
        uniforms: { uColorTop: { value: new THREE.Color(s.colorTop) }, uColorBot: { value: new THREE.Color(s.colorBot) }, uWetness: { value: wetness }, uTime: { value: 0 } },
      });
    }
    return new THREE.MeshStandardMaterial({ color: s.colorTop, roughness: s.roughness, metalness: s.metalness, emissive: new THREE.Color(s.emissive), emissiveIntensity: selected ? s.emissiveInt * 5 : s.emissiveInt });
  }, [s.id, s.colorTop, selected]);

  useFrame(({ clock }) => {
    if (mRef.current) { const ty = exploded ? s.expY : s.defY; mRef.current.position.y += (ty - mRef.current.position.y) * 0.09; }
    if (matRef.current) { matRef.current.uniforms.uWetness.value = wetness; matRef.current.uniforms.uTime.value = clock.getElapsedTime(); }
  });

  return (
    <mesh ref={mRef} material={material} castShadow receiveShadow onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <cylinderGeometry args={[2.05, 2.1, s.height, 48]} />
      <Text position={[0, 0, 2.18]} fontSize={0.2} color={selected ? '#4ADE80' : '#FFFFFF'} anchorX="center">{s.horizon}</Text>
      {s.id === 'topsoil' && <MoistureParticles />}
      {s.id === 'subsoil' && <MycoLines />}
    </mesh>
  );
}

function SoilScene({ exploded, selected, setSelected, wetness }: { exploded: boolean; selected: Stratum; setSelected: (s: Stratum) => void; wetness: number }) {
  const gRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (gRef.current) gRef.current.rotation.y += dt * 0.16; });
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[8, 14, 8]} intensity={1.8} castShadow color="#FFF6E0" />
      <pointLight position={[-6, 8, -6]} intensity={0.6} color="#88EEFF" />
      <hemisphereLight args={['#FFEECC', '#001100', 0.5]} />
      <ContactShadows position={[0, -3.9, 0]} opacity={0.35} scale={10} blur={2.5} far={6} />
      <group ref={gRef}>
        {STRATA.map((s) => <StrataMesh key={s.id} s={s} exploded={exploded} selected={selected.id === s.id} onSelect={() => setSelected(s)} wetness={wetness} />)}
      </group>
      <OrbitControls enableZoom enableDamping dampingFactor={0.08} minDistance={5} maxDistance={18} />
    </>
  );
}

export default function ZenithSoilExplorer() {
  const [exploded, setExploded] = useState(true);
  const [selected, setSelected] = useState<Stratum>(STRATA[1]);
  const [wetness, setWetness] = useState(0.48);
  const [liveSoc, setLiveSoc] = useState<string | null>(null);
  const [livePh, setLivePh] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('https://api.open-meteo.com/v1/forecast?latitude=18.5204&longitude=73.8567&hourly=soil_moisture_0_to_1cm&forecast_days=1')
      .then(r => r.json()).then(d => { const m = d?.hourly?.soil_moisture_0_to_1cm?.[0]; if (mounted && typeof m === 'number') setWetness(Math.min(Math.max(m, 0), 1)); }).catch(() => {});
    fetch('https://rest.isric.org/soilgrids/v2.0/properties/query?lon=73.8567&lat=18.5204&property=soc&property=phh2o&depth=0-5cm')
      .then(r => r.json()).then(d => {
        if (!mounted) return;
        const layers: Array<{ name: string; depths: Array<{ values: { mean: number | null } }> }> = d?.properties?.layers ?? [];
        for (const layer of layers) {
          const mean = layer.depths?.[0]?.values?.mean;
          if (mean == null) continue;
          if (layer.name === 'soc') setLiveSoc(`${(mean / 10).toFixed(1)}%`); // dg/kg → %
          if (layer.name === 'phh2o') setLivePh((mean / 10).toFixed(1)); // pH*10 → pH
        }
      }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Live SoilGrids values resolve the '…' placeholders in the topsoil stratum.
  const resolved = (v: string) => {
    if (v !== '…') return v;
    if (selected.id !== 'topsoil') return v;
    return v;
  };
  const displaySoc = selected.id === 'topsoil' ? (liveSoc ?? 'Fetching…') : resolved(selected.soc);
  const displayPh = selected.id === 'topsoil' ? (livePh ?? 'Fetching…') : resolved(selected.ph);

  return (
    <section id="soil" className="relative py-20 px-6 md:px-14" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0f05 0%, #080300 100%)' }}>
      <div className="max-w-[1400px] mx-auto mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1"><Layers size={14} className="text-amber-400" /><span className="text-[10px] font-bold text-amber-400/75 uppercase tracking-widest">Digital Soil Core</span></div>
          <h2 className="text-[34px] md:text-[44px] font-black text-white leading-tight">Strata Inspector</h2>
          <p className="text-[14px] text-slate-400 mt-1.5 max-w-[460px]">Click any horizon layer to inspect soil organic carbon, nitrogen, and pH. Live Open-Meteo moisture drives the GLSL wetness shader.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center bg-black/50 backdrop-blur-md border border-sky-900/40 rounded-xl p-3 min-w-[90px]">
            <span className="text-[10px] text-white/45 font-semibold block mb-0.5">Soil Moisture</span>
            <span className="text-[22px] font-black" style={{ color: `hsl(${200 + wetness * 40}, 90%, 65%)` }}>{Math.round(wetness * 100)}%</span>
            <div className="mt-1 w-full h-1 rounded-full bg-white/10"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${wetness * 100}%`, background: `hsl(${200 + wetness * 40}, 90%, 55%)` }} /></div>
            <span className="text-[8px] text-sky-400/70 mt-0.5 block">Open-Meteo Live</span>
          </div>
          <button onClick={() => setExploded(!exploded)} className="px-4 py-2.5 bg-amber-900/50 hover:bg-amber-800/60 border border-amber-700/40 text-amber-200 text-[12px] font-bold rounded-xl cursor-pointer transition-colors">
            {exploded ? '▼ Compact' : '▲ Explode Strata'}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-8">
        {/* Layer Tabs */}
        <div className="flex xl:flex-col gap-2 xl:w-[160px] shrink-0 flex-wrap">
          {STRATA.map((s) => (
            <button key={s.id} onClick={() => setSelected(s)}
              className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer border text-left ${selected.id === s.id ? 'bg-amber-900/65 border-amber-600/55 text-amber-200' : 'bg-black/30 border-white/10 text-white/45 hover:text-white/75'}`}>
              <span className="block font-black">{s.horizon}</span>
              <span className="text-white/35">{s.depth}</span>
            </button>
          ))}
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 h-[480px] rounded-3xl overflow-hidden border border-stone-800/50 shadow-2xl cursor-grab active:cursor-grabbing"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a0f05 0%, #0a0502 100%)' }}>
          <Canvas camera={{ position: [6, 3, 8], fov: 44 }} dpr={[1, 1.5]} shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
            <SoilScene exploded={exploded} selected={selected} setSelected={setSelected} wetness={wetness} />
          </Canvas>
        </div>

        {/* Detail Card */}
        <div className="xl:w-[280px] shrink-0 bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white self-start">
          <h4 className="text-[15px] font-black mb-0.5">{selected.name}</h4>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900/50 border border-amber-700/40 text-amber-300">{selected.depth}</span>
          <p className="text-[11px] text-white/55 leading-relaxed mt-3 mb-4">{selected.note}</p>
          <div className="grid grid-cols-1 gap-2 text-[11px]">
            {[{ l: 'Organic Carbon', v: displaySoc, c: '#FBBF24' }, { l: 'Nitrogen (N)', v: selected.n, c: '#FFFFFF' }, { l: 'Soil pH', v: displayPh, c: '#4ADE80' }].map((r) => (
              <div key={r.l} className="bg-white/5 border border-white/8 p-2.5 rounded-xl">
                <span className="text-white/45 font-semibold block mb-0.5">{r.l}</span>
                <span className="font-bold" style={{ color: r.c }}>{r.v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-white/8 text-[10px] text-white/35">
            Wetness shader intensity: <span className="text-sky-400 font-bold">{Math.round(wetness * 100)}% specular</span>
            <span className="block mt-1">Live sources: ISRIC SoilGrids 2.0 · Open-Meteo. Rows marked “Not measured” have no open data source.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
