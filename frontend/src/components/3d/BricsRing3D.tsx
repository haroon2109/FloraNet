'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Text, Float, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Wheat, TreePine, Tractor, ShieldCheck, Globe2 } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Nation Data
// ──────────────────────────────────────────────────────────────────────────────
interface BricsNation {
  name: string;
  flag: string;
  soil: string;
  hub: string;
  crop: string;
  color: string;
  emissive: string;
  angle: number;
}

const BRICS: BricsNation[] = [
  {
    name: 'India',      flag: '🇮🇳',
    soil: 'Alluvial & Black Cotton',
    hub: 'ICAR Smart Network',
    crop: 'Rice, Wheat & Maize',
    color: '#FF9800', emissive: '#F44336',
    angle: 0,
  },
  {
    name: 'Brazil',     flag: '🇧🇷',
    soil: 'Cerrado Latosol',
    hub: 'Embrapa Direct Planting',
    crop: 'Soybean & Corn',
    color: '#4CAF50', emissive: '#009688',
    angle: (2 * Math.PI) / 5,
  },
  {
    name: 'South Africa', flag: '🇿🇦',
    soil: 'Highveld Semi-Arid',
    hub: 'ARC Outbreak Warning',
    crop: 'Maize & Sorghum',
    color: '#2196F3', emissive: '#03A9F4',
    angle: (4 * Math.PI) / 5,
  },
  {
    name: 'China',      flag: '🇨🇳',
    soil: 'Red & Loess Soil',
    hub: 'Smart Irrigation Cloud',
    crop: 'Rice & Vegetables',
    color: '#F44336', emissive: '#FF5722',
    angle: (6 * Math.PI) / 5,
  },
  {
    name: 'Russia',     flag: '🇷🇺',
    soil: 'Chernozem Black Earth',
    hub: 'Grain Resilience Core',
    crop: 'Wheat & Barley',
    color: '#9C27B0', emissive: '#673AB7',
    angle: (8 * Math.PI) / 5,
  },
];

const RING_RADIUS = 3.2;

// ──────────────────────────────────────────────────────────────────────────────
// Monument Pedestal for each nation
// ──────────────────────────────────────────────────────────────────────────────
function MonumentPedestal({
  nation,
  isActive,
  onSelect,
}: {
  nation: BricsNation;
  isActive: boolean;
  onSelect: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const x = Math.sin(nation.angle) * RING_RADIUS;
  const z = Math.cos(nation.angle) * RING_RADIUS;

  useFrame((_, dt) => {
    if (groupRef.current) {
      const targetY = isActive ? 0.35 : hovered ? 0.18 : 0;
      groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* Base disk */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.82, 0.92, 0.14, 32]} />
        <meshStandardMaterial
          color={isActive ? nation.color : '#1e293b'}
          emissive={isActive ? nation.emissive : '#0f172a'}
          emissiveIntensity={isActive ? 0.6 : 0.0}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Main pedestal cylinder */}
      <mesh
        onClick={onSelect}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.62, 0.72, 0.45, 32]} />
        <meshStandardMaterial
          color={hovered || isActive ? nation.color : '#334155'}
          emissive={isActive ? nation.emissive : '#000000'}
          emissiveIntensity={isActive ? 0.5 : 0}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>

      {/* Glowing top jewel */}
      <Float speed={2.5} floatIntensity={0.3}>
        <mesh position={[0, 0.45, 0]}>
          <octahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color={nation.color}
            emissive={nation.color}
            emissiveIntensity={isActive ? 3.0 : 1.0}
            metalness={0.8}
            roughness={0.05}
            transparent
            opacity={0.9}
          />
        </mesh>
      </Float>

      {/* HTML Label Overlay */}
      <Html position={[0, 0.95, 0]} center distanceFactor={8}>
        <div
          onClick={onSelect}
          className={`cursor-pointer select-none transition-all duration-200 text-center ${
            isActive ? 'scale-110' : 'scale-100'
          }`}
        >
          <div
            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold shadow-lg backdrop-blur-md whitespace-nowrap ${
              isActive
                ? 'bg-slate-900 text-white border-white/30 shadow-[0_0_16px_2px] shadow-emerald-500/30'
                : hovered
                ? 'bg-slate-800/90 text-white border-slate-600'
                : 'bg-slate-900/80 text-slate-300 border-slate-700/50'
            }`}
          >
            <span className="mr-1 text-sm">{nation.flag}</span>
            {nation.name}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Central Connector Hub
// ──────────────────────────────────────────────────────────────────────────────
function CentralHub() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.5 + 0.35 * Math.sin(clock.getElapsedTime() * 2.0);
    }
  });

  return (
    <group>
      {/* Hub disc */}
      <mesh ref={meshRef} position={[0, -0.05, 0]}>
        <cylinderGeometry args={[1.1, 1.25, 0.22, 48]} />
        <meshStandardMaterial
          color="#064e3b"
          emissive="#059669"
          emissiveIntensity={0.6}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Central FloraNet globe sphere */}
      <Float speed={1.2} floatIntensity={0.4} rotationIntensity={0.2}>
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={1.2}
            roughness={0.15}
            metalness={0.7}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Geo grid rings around globe */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.46, 16, 8]} />
          <meshBasicMaterial color="#4ade80" wireframe transparent opacity={0.22} />
        </mesh>
      </Float>

      {/* Connector spokes to each nation */}
      {BRICS.map((n) => {
        const x = Math.sin(n.angle) * RING_RADIUS;
        const z = Math.cos(n.angle) * RING_RADIUS;
        const len = RING_RADIUS - 1.25;
        const midX = Math.sin(n.angle) * (RING_RADIUS / 2);
        const midZ = Math.cos(n.angle) * (RING_RADIUS / 2);
        return (
          <mesh
            key={n.name}
            position={[midX, -0.05, midZ]}
            rotation={[0, -n.angle, 0]}
          >
            <boxGeometry args={[len, 0.04, 0.04]} />
            <meshBasicMaterial color={n.color} transparent opacity={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BricsRing3D Scene
// ──────────────────────────────────────────────────────────────────────────────
function BricsScene({
  activeNation,
  setActiveNation,
}: {
  activeNation: BricsNation;
  setActiveNation: (n: BricsNation) => void;
}) {
  const ringRef = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useFrame((_, delta) => {
    if (ringRef.current && autoRotate) {
      ringRef.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 12, 8]} intensity={1.8} color="#FFF8E7" />
      <pointLight position={[0, 4, 0]} color="#10b981" intensity={1.0} distance={8} />
      <hemisphereLight args={['#0F2027', '#064e3b', 0.5]} />

      {/* Ground plane grid */}
      <mesh position={[0, -0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24, 20, 20]} />
        <meshBasicMaterial color="#064e3b" wireframe transparent opacity={0.12} />
      </mesh>

      <group ref={ringRef} onClick={() => setAutoRotate(false)}>
        <CentralHub />
        {BRICS.map((nation) => (
          <MonumentPedestal
            key={nation.name}
            nation={nation}
            isActive={activeNation.name === nation.name}
            onSelect={() => { setActiveNation(nation); setAutoRotate(false); }}
          />
        ))}
      </group>

      <OrbitControls
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 5}
      />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Export
// ──────────────────────────────────────────────────────────────────────────────
export default function BricsRing3D({ onSelectNation }: { onSelectNation?: (nationName: string) => void } = {}) {
  const [activeNation, setActiveNation] = useState<BricsNation>(BRICS[0]);

  const handleSelect = (n: BricsNation) => {
    setActiveNation(n);
    if (onSelectNation) onSelectNation(n.name);
  };

  return (
    <div className="relative w-full rounded-[28px] overflow-hidden border border-slate-800/60 shadow-2xl"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d2414 0%, #060e0a 100%)' }}>

      {/* Header */}
      <div className="px-6 pt-5 pb-2 z-10">
        <div className="flex items-center gap-2 mb-1">
          <Globe2 size={15} className="text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400/80 uppercase tracking-widest">
            Multi-Polar Agro Intelligence Hub
          </span>
        </div>
        <h3 className="text-[18px] font-black text-white leading-tight">
          BRICS Interactive Country Ring
        </h3>
        <p className="text-[12px] text-slate-400 mt-0.5">
          Click a nation pedestal to sync soil telemetry · Drag to orbit
        </p>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-[380px]">
        <Canvas
          camera={{ position: [0, 4.5, 7.5], fov: 44 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <BricsScene activeNation={activeNation} setActiveNation={handleSelect} />
        </Canvas>
      </div>

      {/* Nation Detail Glassmorphism Card */}
      <div className="mx-6 mb-6 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{activeNation.flag}</span>
          <div>
            <h4 className="text-[16px] font-black text-white leading-tight">{activeNation.name}</h4>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: activeNation.color, borderColor: `${activeNation.color}55`, backgroundColor: `${activeNation.color}18` }}
            >
              {activeNation.hub}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div className="bg-white/5 border border-white/8 p-2.5 rounded-xl">
            <span className="text-white/50 font-semibold block mb-0.5">Soil Profile</span>
            <span className="font-bold text-white">{activeNation.soil}</span>
          </div>
          <div className="bg-white/5 border border-white/8 p-2.5 rounded-xl">
            <span className="text-white/50 font-semibold block mb-0.5">Key Crops</span>
            <span className="font-bold text-white">{activeNation.crop}</span>
          </div>
          <div className="bg-white/5 border border-white/8 p-2.5 rounded-xl">
            <span className="text-white/50 font-semibold block mb-0.5">AgriNet Hub</span>
            <span className="font-bold" style={{ color: activeNation.color }}>{activeNation.hub}</span>
          </div>
        </div>
      </div>

      {/* Nation Selector Tabs */}
      <div className="flex items-center justify-center gap-2 px-6 pb-5">
        {BRICS.map((n) => (
          <button
            key={n.name}
            onClick={() => handleSelect(n)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              activeNation.name === n.name
                ? 'text-white border-white/20'
                : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80'
            }`}
            style={activeNation.name === n.name ? { backgroundColor: `${n.color}33`, borderColor: `${n.color}60` } : {}}
          >
            <span>{n.flag}</span>
            <span>{n.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
