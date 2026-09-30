'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, Stars, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Brain, CloudRain, Sprout, ShieldAlert, Wind, Leaf, ArrowRight, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

// ──────────────────────────────────────────────────────────────────────────────
// Wind Turbine
// ──────────────────────────────────────────────────────────────────────────────
function WindTurbine({ pos }: { pos: [number, number, number] }) {
  const bladeRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (bladeRef.current) bladeRef.current.rotation.z += dt * 1.5; });
  return (
    <group position={pos}>
      <mesh><cylinderGeometry args={[0.04, 0.07, 0.9, 8]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
      <group ref={bladeRef} position={[0, 0.44, 0.01]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 0.22, 0]} rotation={[0, 0, (i * Math.PI * 2) / 3]}>
            <boxGeometry args={[0.04, 0.42, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Hotspot HTML Pin
// ──────────────────────────────────────────────────────────────────────────────
function Pin({ pos, icon: Icon, label, color }: { pos: [number, number, number]; icon: any; label: string; color: string }) {
  const [hov, setHov] = useState(false);
  return (
    <group position={pos}>
      <mesh onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hov ? 2.5 : 1.0} roughness={0.1} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.018, 0.018, 0.44, 6]} /><meshBasicMaterial color={color} transparent opacity={0.4} /></mesh>
      <Html distanceFactor={10} position={[0, 0.4, 0]} center>
        <div className={`pointer-events-none whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg border backdrop-blur-md transition-all duration-200 ${hov ? 'bg-emerald-900 text-emerald-100 border-emerald-400 scale-110' : 'bg-white/95 text-slate-800 border-emerald-300/50'}`}>
          <Icon className="w-3 h-3" style={{ color }} /><span>{label}</span>
        </div>
      </Html>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Farm Diorama 3D Scene
// ──────────────────────────────────────────────────────────────────────────────
function FarmScene() {
  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[10, 14, 8]} intensity={2.2} castShadow />
      <pointLight position={[-8, 5, -5]} color="#34d399" intensity={0.7} />
      <hemisphereLight args={['#BAE6FD', '#D1FAE5', 0.7]} />
      <Stars radius={60} depth={30} count={800} factor={2.5} saturation={0.1} fade speed={0.2} />

      <Float speed={1.5} rotationIntensity={0.08} floatIntensity={0.22}>
        {/* Grass top */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <boxGeometry args={[5, 0.4, 5]} />
          <meshStandardMaterial color="#22c55e" roughness={0.7} />
        </mesh>
        {/* Soil layer */}
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[4.8, 0.7, 4.8]} />
          <meshStandardMaterial color="#431407" roughness={0.92} />
        </mesh>
        {/* Bedrock */}
        <mesh position={[0, -1.05, 0]}>
          <boxGeometry args={[4.5, 0.35, 4.5]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Crop rows */}
        {[-1.4, -0.7, 0.0, 0.7].map((x, i) => (
          <mesh key={i} position={[x, 0.28, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.28, 2.8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#16a34a'} />
          </mesh>
        ))}
        {/* Farmhouse */}
        <mesh position={[1.6, 0.45, 0.9]} castShadow>
          <boxGeometry args={[0.55, 0.42, 0.55]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
        <mesh position={[1.6, 0.76, 0.9]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.42, 0.28, 4]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
        {/* Silos */}
        <mesh position={[-1.6, 0.5, -1.1]}><cylinderGeometry args={[0.18, 0.18, 0.72, 16]} /><meshStandardMaterial color="#e2e8f0" metalness={0.3} /></mesh>
        <mesh position={[-1.6, 0.94, -1.1]}><coneGeometry args={[0.2, 0.24, 16]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
        <mesh position={[-1.15, 0.5, -1.1]}><cylinderGeometry args={[0.18, 0.18, 0.72, 16]} /><meshStandardMaterial color="#e2e8f0" metalness={0.3} /></mesh>
        <mesh position={[-1.15, 0.94, -1.1]}><coneGeometry args={[0.2, 0.24, 16]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
        {/* Wind Turbines */}
        <WindTurbine pos={[1.65, 0.25, -1.15]} />
        <WindTurbine pos={[1.15, 0.25, -0.6]} />
        {/* Hotspot Pins */}
        <Pin pos={[-1.1, 0.75, -0.9]} icon={Sprout} label="Smart Crop Zone" color="#10b981" />
        <Pin pos={[0, 1.4, 0]} icon={Brain} label="AI Active" color="#3b82f6" />
        <Pin pos={[1.5, 0.72, -0.7]} icon={Wind} label="Live Wind Telemetry" color="#06b6d4" />
        <Pin pos={[0.9, 0.65, 1.4]} icon={ShieldAlert} label="Pest Risk Scouting" color="#f59e0b" />
        <Pin pos={[-1.3, 0.72, 0.9]} icon={CloudRain} label="Rain Forecast Feed" color="#818cf8" />
        <Pin pos={[-0.2, 0.65, -1.6]} icon={Leaf} label="Sentinel-2 NDVI Scan" color="#4ade80" />
      </Float>

      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.6} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 5} enableDamping dampingFactor={0.08} />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ZenithHero
// ──────────────────────────────────────────────────────────────────────────────
export default function ZenithHero() {
  return (
    <section className="relative w-full min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% -10%, #052916 0%, #010805 60%)' }}>
      
      {/* Nav Bar */}
      <nav className="flex items-center justify-between px-6 md:px-14 py-5 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="font-black text-[18px] text-white tracking-tight">FloraNet</span>
          <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest ml-1.5 border border-emerald-700/50 px-1.5 py-0.5 rounded-md">Zenith</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[13px] font-semibold text-slate-400">
          <a href="/home" className="hover:text-white transition-colors">Dashboard</a>
          <a href="/field" className="hover:text-white transition-colors">Field Monitor</a>
          <a href="/zenith#soil" className="hover:text-white transition-colors">Soil Core</a>
          <a href="/zenith#plant" className="hover:text-white transition-colors">Plant Twin</a>
        </div>
        <a href="/home" className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[12px] font-bold rounded-xl transition-colors">
          Open Dashboard <ArrowRight size={13} />
        </a>
      </nav>

      {/* Hero Content + 3D Canvas */}
      <div className="flex flex-col lg:flex-row items-center justify-between flex-1 px-6 md:px-14 gap-8 pt-4 pb-12">
        
        {/* Left Text Column */}
        <div className="lg:w-[45%] z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-950/60 border border-emerald-700/40 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-300 tracking-widest uppercase">
              Live · Open-Meteo + Local AI
            </span>
          </div>

          <h1 className="text-[42px] md:text-[58px] font-black text-white leading-[1.04] mb-5">
            The Future of<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #4ade80 0%, #22d3ee 60%, #818cf8 100%)' }}>
              Agricultural AI
            </span><br />
            in 3D
          </h1>

          <p className="text-[15px] text-slate-400 leading-relaxed mb-7 max-w-[480px]">
            FloraNet Zenith transforms your farm into an interactive 3D digital twin — real-time soil diagnostics, holographic plant pathology, and BRICS transboundary agro-intelligence, all in one platform.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <a href="/home" className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white text-[14px] font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/40">
              Launch Dashboard <ArrowRight size={15} />
            </a>
            <a href="#soil" className="flex items-center gap-2 px-6 py-3 bg-white/8 hover:bg-white/12 border border-white/10 text-white text-[14px] font-bold rounded-2xl transition-all">
              Explore Soil Core <ChevronRight size={15} />
            </a>
          </div>

          {/* Live stats row */}
          <div className="flex items-center gap-5 mt-8 pt-6 border-t border-white/8">
            {[
              { val: '2.4M', label: 'Acres Monitored' },
              { val: '94%', label: 'Soil Model Accuracy' },
              { val: '48hr', label: 'Pest Early Warning' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[22px] font-black text-white">{s.val}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 3D Canvas */}
        <div className="lg:w-[52%] w-full h-[440px] lg:h-[540px] rounded-3xl overflow-hidden border border-white/8 shadow-2xl relative" style={{ background: 'linear-gradient(135deg, #BAE6FD22 0%, #D1FAE522 100%)' }}>
          <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">3D Farm Diorama · Drag to rotate</span>
          </div>
          <Canvas camera={{ position: [5, 4, 6.5], fov: 44 }} dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
            <FarmScene />
          </Canvas>
        </div>
      </div>
    </section>
  );
}
