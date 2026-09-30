'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Html, Float, OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

interface BricsNation {
  name: string; flag: string; soil: string; hub: string; crop: string;
  color: string; emissive: string; angle: number;
}

const BRICS: BricsNation[] = [
  { name: 'India', flag: '🇮🇳', soil: 'Alluvial & Black Cotton', hub: 'ICAR Smart Network', crop: 'Rice, Wheat & Maize', color: '#FF9800', emissive: '#F44336', angle: 0 },
  { name: 'Brazil', flag: '🇧🇷', soil: 'Cerrado Latosol', hub: 'Embrapa Direct Planting', crop: 'Soybean & Corn', color: '#4CAF50', emissive: '#009688', angle: (2 * Math.PI) / 5 },
  { name: 'South Africa', flag: '🇿🇦', soil: 'Highveld Semi-Arid', hub: 'ARC Outbreak Warning', crop: 'Maize & Sorghum', color: '#2196F3', emissive: '#03A9F4', angle: (4 * Math.PI) / 5 },
  { name: 'China', flag: '🇨🇳', soil: 'Red & Loess Soil', hub: 'Smart Irrigation Cloud', crop: 'Rice & Vegetables', color: '#F44336', emissive: '#FF5722', angle: (6 * Math.PI) / 5 },
  { name: 'Russia', flag: '🇷🇺', soil: 'Chernozem Black Earth', hub: 'Grain Resilience Core', crop: 'Wheat & Barley', color: '#9C27B0', emissive: '#673AB7', angle: (8 * Math.PI) / 5 },
];
const R = 3.2;

function CentralGlobe() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.4;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.7 + 0.3 * Math.sin(clock.getElapsedTime() * 2);
    }
  });
  return (
    <Float speed={1.2} floatIntensity={0.4}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.48, 32, 32]} />
        <meshStandardMaterial color="#10b981" emissive="#059669" emissiveIntensity={0.7} roughness={0.15} metalness={0.7} transparent opacity={0.9} />
      </mesh>
      <mesh><sphereGeometry args={[0.52, 16, 8]} /><meshBasicMaterial color="#4ade80" wireframe transparent opacity={0.2} /></mesh>
      <mesh position={[0, -0.06, 0]}><cylinderGeometry args={[1.15, 1.3, 0.22, 48]} /><meshStandardMaterial color="#064e3b" emissive="#059669" emissiveIntensity={0.5} metalness={0.4} roughness={0.3} /></mesh>
    </Float>
  );
}

function Pedestal({ n, active, onSelect }: { n: BricsNation; active: boolean; onSelect: () => void }) {
  const gRef = useRef<THREE.Group>(null);
  const [hov, setHov] = useState(false);
  const x = Math.sin(n.angle) * R;
  const z = Math.cos(n.angle) * R;

  useFrame((_, dt) => {
    if (gRef.current) {
      const ty = active ? 0.38 : hov ? 0.18 : 0;
      gRef.current.position.y += (ty - gRef.current.position.y) * 0.12;
    }
  });

  return (
    <group ref={gRef} position={[x, 0, z]}>
      {/* Base */}
      <mesh position={[0, -0.13, 0]}><cylinderGeometry args={[0.85, 0.95, 0.14, 32]} />
        <meshStandardMaterial color={active ? n.color : '#1e293b'} emissive={active ? n.emissive : '#0f172a'} emissiveIntensity={active ? 0.55 : 0} metalness={0.5} roughness={0.3} /></mesh>
      {/* Column */}
      <mesh onClick={onSelect} onPointerOver={() => setHov(true)} onPointerOut={() => setHov(false)}>
        <cylinderGeometry args={[0.62, 0.72, 0.45, 32]} />
        <meshStandardMaterial color={hov || active ? n.color : '#334155'} emissive={active ? n.emissive : '#000'} emissiveIntensity={active ? 0.45 : 0} metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Jewel */}
      <Float speed={2.5} floatIntensity={0.28}>
        <mesh position={[0, 0.46, 0]}>
          <octahedronGeometry args={[0.27, 0]} />
          <meshStandardMaterial color={n.color} emissive={n.color} emissiveIntensity={active ? 3.5 : 1.2} metalness={0.8} roughness={0.04} transparent opacity={0.92} />
        </mesh>
      </Float>
      {/* Label */}
      <Html position={[0, 0.98, 0]} center distanceFactor={8}>
        <div onClick={onSelect} className={`cursor-pointer select-none px-3 py-1.5 rounded-xl border text-[11px] font-bold shadow-lg backdrop-blur-md whitespace-nowrap transition-all ${active ? 'text-white border-white/25 shadow-emerald-500/25 shadow-lg scale-110' : hov ? 'bg-slate-800/90 text-white border-slate-600 scale-105' : 'bg-slate-900/80 text-slate-300 border-slate-700/40'}`}
          style={active ? { backgroundColor: `${n.color}28`, borderColor: `${n.color}50` } : {}}>
          {n.flag} {n.name}
        </div>
      </Html>
    </group>
  );
}

function CorridorScene({ active, setActive }: { active: BricsNation; setActive: (n: BricsNation) => void }) {
  const ringRef = useRef<THREE.Group>(null);
  const [ar, setAr] = useState(true);
  useFrame((_, dt) => { if (ringRef.current && ar) ringRef.current.rotation.y += dt * 0.15; });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 12, 8]} intensity={1.8} color="#FFF8E7" />
      <pointLight position={[0, 4, 0]} color="#10b981" intensity={1.1} distance={9} />
      <hemisphereLight args={['#0F2027', '#064e3b', 0.5]} />
      <Stars radius={55} depth={30} count={1200} factor={3} saturation={0.4} fade speed={0.3} />
      {/* Grid floor */}
      <mesh position={[0, -0.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24, 22, 22]} />
        <meshBasicMaterial color="#064e3b" wireframe transparent opacity={0.1} />
      </mesh>
      <group ref={ringRef} onClick={() => setAr(false)}>
        <CentralGlobe />
        {/* Spokes */}
        {BRICS.map((n) => {
          const midX = Math.sin(n.angle) * (R / 2);
          const midZ = Math.cos(n.angle) * (R / 2);
          const len = R - 1.3;
          return (
            <mesh key={n.name} position={[midX, -0.05, midZ]} rotation={[0, -n.angle, 0]}>
              <boxGeometry args={[len, 0.04, 0.04]} />
              <meshBasicMaterial color={n.color} transparent opacity={0.28} />
            </mesh>
          );
        })}
        {BRICS.map((n) => <Pedestal key={n.name} n={n} active={active.name === n.name} onSelect={() => { setActive(n); setAr(false); }} />)}
      </group>
      <OrbitControls enableZoom={false} enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 5.5} />
    </>
  );
}

export default function ZenithCorridors() {
  const [active, setActive] = useState<BricsNation>(BRICS[0]);

  return (
    <section id="corridors" className="relative py-20 px-6 md:px-14" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d1f14 0%, #010805 100%)' }}>
      {/* Section Header */}
      <div className="max-w-[1400px] mx-auto mb-8">
        <span className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">BRICS Agro Intelligence</span>
        <h2 className="text-[34px] md:text-[44px] font-black text-white leading-tight mt-1">
          Multi-Polar Agricultural<br /><span className="text-emerald-400">Corridor Network</span>
        </h2>
        <p className="text-[14px] text-slate-400 mt-2 max-w-[540px]">
          Click any nation to sync real-time soil, pest vector, and trade intelligence. Drag to orbit.
        </p>
      </div>

      <div className="max-w-[1400px] mx-auto flex flex-col xl:flex-row gap-8 items-start">
        {/* 3D Ring Canvas */}
        <div className="flex-1 h-[440px] rounded-3xl overflow-hidden border border-slate-800/60 shadow-2xl">
          <Canvas camera={{ position: [0, 4.5, 7.5], fov: 44 }} dpr={[1, 1.5]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
            <CorridorScene active={active} setActive={setActive} />
          </Canvas>
        </div>

        {/* Detail Panel */}
        <div className="xl:w-[360px] shrink-0 flex flex-col gap-4">
          {/* Active Nation Card */}
          <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{active.flag}</span>
              <div>
                <h3 className="text-[18px] font-black">{active.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color: active.color, borderColor: `${active.color}50`, backgroundColor: `${active.color}18` }}>{active.hub}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 text-[11px]">
              {[{ l: 'Soil Profile', v: active.soil }, { l: 'Key Crops', v: active.crop }, { l: 'AgriNet Hub', v: active.hub }].map((r) => (
                <div key={r.l} className="bg-white/5 border border-white/8 p-3 rounded-xl">
                  <span className="text-white/45 font-semibold block mb-0.5">{r.l}</span>
                  <span className="font-bold text-white">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Nation Selector */}
          <div className="grid grid-cols-3 sm:grid-cols-5 xl:grid-cols-3 gap-2">
            {BRICS.map((n) => (
              <button key={n.name} onClick={() => setActive(n)}
                className={`px-2 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${active.name === n.name ? 'text-white border-white/20' : 'bg-white/5 border-white/10 text-white/45 hover:text-white/80'}`}
                style={active.name === n.name ? { backgroundColor: `${n.color}28`, borderColor: `${n.color}55` } : {}}>
                <span className="text-lg">{n.flag}</span>
                <span>{n.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
