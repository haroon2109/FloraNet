'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html, ContactShadows, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Sprout, Brain, CloudRain, ShieldAlert, Leaf, Wind } from 'lucide-react';

// ──────────────────────────────────────────────────────────────────────────────
// Hotspot HTML Pin anchored in 3D world space
// ──────────────────────────────────────────────────────────────────────────────
function HotspotPin({
  position,
  icon: Icon,
  label,
  color,
}: {
  position: [number, number, number];
  icon: React.ComponentType<any>;
  label: string;
  color: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Glowing sphere node */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.0 : 0.8}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>

      {/* Thin pillar connecting pin to terrain */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.5, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>

      {/* HTML tooltip label */}
      <Html distanceFactor={10} position={[0, 0.42, 0]} center>
        <div
          className={`pointer-events-none whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg border backdrop-blur-md transition-all duration-200 ${
            hovered
              ? 'bg-emerald-800 text-emerald-100 border-emerald-400 scale-110'
              : 'bg-white/90 text-slate-800 border-emerald-300/50'
          }`}
        >
          <Icon className="w-3 h-3" style={{ color }} />
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Wind Turbine (Stylized Procedural)
// ──────────────────────────────────────────────────────────────────────────────
function WindTurbine({ position }: { position: [number, number, number] }) {
  const bladeRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (bladeRef.current) bladeRef.current.rotation.z += dt * 1.4;
  });

  return (
    <group position={position}>
      {/* Tower */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.06, 0.8, 8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.6} />
      </mesh>
      {/* Rotating Blades */}
      <group ref={bladeRef} position={[0, 0.4, 0.01]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[0, 0.2, 0]}
            rotation={[0, 0, (i * Math.PI * 2) / 3]}
          >
            <boxGeometry args={[0.04, 0.38, 0.02]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Stylized Silo
// ──────────────────────────────────────────────────────────────────────────────
function Silo({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.18, 0.18, 0.7, 16]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <coneGeometry args={[0.2, 0.22, 16]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Miniature Crop Field Rows (instanced)
// ──────────────────────────────────────────────────────────────────────────────
function CropRows() {
  const positions: [number, number, number][] = [
    [-1.3, 0.55, 0.2], [-0.85, 0.55, 0.2], [-0.4, 0.55, 0.2], [0.05, 0.55, 0.2],
    [-1.3, 0.55, 0.8], [-0.85, 0.55, 0.8], [-0.4, 0.55, 0.8], [0.05, 0.55, 0.8],
  ];

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, 1.4]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#15803d' : '#16a34a'} roughness={0.7} />
        </mesh>
      ))}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Floating Island Terrain
// ──────────────────────────────────────────────────────────────────────────────
function IslandTerrain() {
  return (
    <group position={[0, -0.5, 0]}>
      {/* Grass top */}
      <RoundedBox args={[4.4, 0.5, 4.4]} radius={0.18} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#22c55e" roughness={0.65} />
      </RoundedBox>

      {/* Dry edge — lighter grass fringe */}
      <RoundedBox args={[4.6, 0.15, 4.6]} radius={0.14} position={[0, 0.06, 0]}>
        <meshStandardMaterial color="#4ade80" roughness={0.75} />
      </RoundedBox>

      {/* Rich dark humus strata */}
      <RoundedBox args={[4.2, 0.85, 4.2]} radius={0.12} position={[0, -0.43, 0]}>
        <meshStandardMaterial color="#431407" roughness={0.92} />
      </RoundedBox>

      {/* Bedrock base */}
      <RoundedBox args={[4.0, 0.45, 4.0]} radius={0.1} position={[0, -1.0, 0]}>
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.1} />
      </RoundedBox>

      {/* Crop rows */}
      <CropRows />

      {/* Structures */}
      <WindTurbine position={[1.5, 0.58, -1.2]} />
      <WindTurbine position={[1.2, 0.58, -0.5]} />
      <Silo position={[-1.5, 0.85, -1.0]} />
      <Silo position={[-1.1, 0.85, -1.0]} />

      {/* Small farmhouse block */}
      <mesh position={[1.4, 0.8, 0.8]}>
        <boxGeometry args={[0.5, 0.4, 0.5]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.5} />
      </mesh>
      <mesh position={[1.4, 1.12, 0.8]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.38, 0.24, 4]} />
        <meshStandardMaterial color="#b45309" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main FarmHero3D Component
// ──────────────────────────────────────────────────────────────────────────────
export default function FarmHero3D() {
  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-sky-100/60 to-emerald-50/40 border border-emerald-100 shadow-2xl">
      {/* Background sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #BAE6FD 0%, #D1FAE5 55%, #ECFDF5 100%)',
        }}
      />

      {/* Corner Label */}
      <div className="absolute top-4 left-5 z-10 flex flex-col gap-0.5">
        <span className="text-[10px] font-bold text-emerald-700/80 uppercase tracking-widest">
          FloraNet 3D Farm Diorama
        </span>
        <span className="text-[12px] font-semibold text-slate-600">
          Drag to rotate · Hover pins for insights
        </span>
      </div>

      <Canvas
        camera={{ position: [5, 4, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 8]} intensity={2.2} castShadow />
        <pointLight position={[-8, 5, -5]} color="#34d399" intensity={0.6} />
        <hemisphereLight args={['#BAE6FD', '#D1FAE5', 0.6]} />

        <Float speed={1.6} rotationIntensity={0.1} floatIntensity={0.25}>
          <IslandTerrain />

          {/* Diagnostic Hotspot Pins */}
          <HotspotPin position={[-1.2, 0.95, -1.0]} icon={Sprout} label="Smart Crop Zone" color="#10b981" />
          <HotspotPin position={[0.0, 1.5, 0.0]} icon={Brain} label="AI Insights" color="#3b82f6" />
          <HotspotPin position={[1.35, 1.0, -0.7]} icon={Wind} label="Live Wind Telemetry" color="#06b6d4" />
          <HotspotPin position={[0.8, 0.9, 1.3]} icon={ShieldAlert} label="Pest Risk Scouting" color="#f59e0b" />
          <HotspotPin position={[-1.4, 1.0, 0.8]} icon={CloudRain} label="Rain Forecast Feed" color="#818cf8" />
          <HotspotPin position={[-0.2, 0.9, -1.5]} icon={Leaf} label="Sentinel-2 NDVI Scan" color="#4ade80" />
        </Float>

        <ContactShadows
          position={[0, -2.0, 0]}
          opacity={0.35}
          scale={12}
          blur={2.5}
          far={5}
        />

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.7}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 5}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
}
