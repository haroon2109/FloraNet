"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Scan, Upload, Sparkles as SparklesIcon, ShieldCheck } from 'lucide-react';
import { useLeafDiagnosis, LiveHotspot } from '@/hooks/useLeafDiagnosis';

// ──────────────────────────────────────────────────────────────────────────────
// Holographic Plant GLSL Vertex Sway + Scan Line Shader
// ──────────────────────────────────────────────────────────────────────────────
const holoVertGLSL = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Gentle vertex sway for wind simulation
    vec3 pos = position;
    float sway = sin(uTime * 1.8 + pos.y * 2.5) * 0.04 * pos.y;
    pos.x += sway;

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const holoFragGLSL = /* glsl */ `
  uniform float uTime;
  uniform vec3  uColor;
  uniform float uSeverity; // 0=healthy, 1=critical
  varying vec2  vUv;
  varying vec3  vNormal;
  varying vec3  vWorldPos;

  void main() {
    // Holographic scan line effect
    float scanLine = fract(vWorldPos.y * 6.0 - uTime * 1.2);
    float scan = smoothstep(0.0, 0.06, scanLine) * smoothstep(0.12, 0.06, scanLine);

    // Fresnel rim glow
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 2.5);

    // Holographic base with slight wireframe look
    float edge = fract(vUv.x * 8.0);
    edge = smoothstep(0.0, 0.04, edge) * smoothstep(0.08, 0.04, edge);
    edge += fract(vUv.y * 14.0);
    edge = clamp(edge, 0.0, 1.0) * 0.25;

    vec3 color = uColor * (0.4 + rim * 1.8 + scan * 0.9 + edge);
    
    // Severity pulse: red tint on critical
    vec3 danger = vec3(1.0, 0.12, 0.08);
    color = mix(color, danger, uSeverity * 0.55 * (0.5 + 0.5 * sin(uTime * 5.0)));

    float alpha = 0.55 + rim * 0.35 + scan * 0.25;
    gl_FragColor = vec4(color, alpha);
  }
`;

// ──────────────────────────────────────────────────────────────────────────────
// Hotspot pins — geometry-anchored markers. Positions below are 3D scene
// anchors, NOT data: every rendered pin comes from useLeafDiagnosis (live
// live AI result). Pins, labels, severity and confidence all derive from the
// live diagnosis result.
export interface Hotspot {
  id: string;
  site: string;
  disease: string;
  severity: 'Healthy' | 'Warning' | 'Critical';
  confidence: number;
  treatment: string;
  pos: [number, number, number];
  color: string;
  severityNum: number;
}

// Deterministic 3D anchor for live pins (scene layout only — never data).
const PIN_ANCHOR: { pos: [number, number, number]; color: string; severityNum: number } = {
  pos: [0, 4.2, 0.3], color: '#FBBF24', severityNum: 0.5,
};

function toHotspotPins(live: LiveHotspot[]): Hotspot[] {
  return live.map((h) => ({ ...h, pos: PIN_ANCHOR.pos, color: PIN_ANCHOR.color, severityNum: PIN_ANCHOR.severityNum }));
}

// ──────────────────────────────────────────────────────────────────────────────
// Pulsing Hotspot Sphere
// ──────────────────────────────────────────────────────────────────────────────
function HotspotSphere({ h, isSelected, onSelect }: { h: Hotspot; isSelected: boolean; onSelect: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      const base = isSelected ? 1.35 : 1.0;
      const pulse = base + (isSelected ? 0.4 : 0.15) * Math.sin(t * (isSelected ? 6 : 3.5));
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef.current) {
      const ringScale = 1.0 + 0.5 * Math.abs(Math.sin(t * 2.5));
      ringRef.current.scale.set(ringScale, ringScale, ringScale);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.6 - 0.3 * Math.abs(Math.sin(t * 2.5));
    }
  });

  return (
    <group position={h.pos}>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshStandardMaterial
          color={h.color} emissive={h.color}
          emissiveIntensity={isSelected ? 3.5 : 1.4}
          roughness={0.1} metalness={0.7}
          transparent opacity={0.95}
        />
      </mesh>
      {/* Expanding ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.28, 0.38, 28]} />
        <meshBasicMaterial color={h.color} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Holographic Plant Body (Maize/Soybean/Sorghum)
// ──────────────────────────────────────────────────────────────────────────────
type CropType = 'Maize' | 'Soybean' | 'Sorghum';
const CROP_CFG: Record<CropType, { leafCount: number; color: string }> = {
  Maize:   { leafCount: 6, color: '#00FFCC' },
  Soybean: { leafCount: 9, color: '#22DDFF' },
  Sorghum: { leafCount: 5, color: '#88FFAA' },
};

function PlantBody({ crop, selectedHotspot }: { crop: CropType; selectedHotspot: Hotspot | null }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const cfg = CROP_CFG[crop];
  const sevNum = selectedHotspot ? selectedHotspot.severityNum : 0;

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: holoVertGLSL,
        fragmentShader: holoFragGLSL,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(cfg.color) },
          uSeverity: { value: sevNum },
        },
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    [cfg.color]
  );

  useFrame(({ clock }) => {
    if (material.uniforms) {
      material.uniforms.uTime.value = clock.getElapsedTime();
      material.uniforms.uSeverity.value = selectedHotspot ? selectedHotspot.severityNum : 0;
      material.uniforms.uColor.value.set(cfg.color);
    }
  });

  return (
    <>
      {/* Main Stem */}
      <mesh material={material} castShadow>
        <cylinderGeometry args={[0.18, 0.3, 9, 14, 8]} />
      </mesh>

      {/* Radiating Leaves */}
      {Array.from({ length: cfg.leafCount }).map((_, i) => {
        const angle = (i * Math.PI * 2) / cfg.leafCount;
        return (
          <mesh
            key={i}
            material={material}
            position={[Math.cos(angle) * 1.6, (i - cfg.leafCount / 2) * 1.05, Math.sin(angle) * 1.6]}
            rotation={[0, angle, Math.PI / 3.5]}
          >
            <coneGeometry args={[1.1, 3.8, 6, 4]} />
          </mesh>
        );
      })}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// R3F Scene
// ──────────────────────────────────────────────────────────────────────────────
function PlantScene({
  crop,
  pins,
  selectedHotspot,
  setSelectedHotspot,
}: {
  crop: CropType;
  pins: Hotspot[];
  selectedHotspot: Hotspot | null;
  setSelectedHotspot: (h: Hotspot) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.22;
  });

  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[0, 10, 0]} intensity={1.2} color="#00FFFF" />
      <pointLight position={[8, -4, 8]} intensity={0.5} color="#0044FF" />
      <pointLight position={[-8, 4, -8]} intensity={0.4} color="#00FF88" />

      {/* Deep space background */}
      <Stars radius={60} depth={40} count={2000} factor={3} saturation={0.6} fade speed={0.3} />
      <Sparkles count={30} scale={[14, 14, 14]} size={1.2} speed={0.15} color="#00FFCC" opacity={0.3} />

      {/* Holographic grid floor */}
      <mesh position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 16, 18, 18]} />
        <meshBasicMaterial color="#00FFCC" wireframe transparent opacity={0.07} />
      </mesh>

      <group ref={groupRef}>
        <PlantBody crop={crop} selectedHotspot={selectedHotspot} />
        {pins.map((h) => (
          <HotspotSphere
            key={h.id}
            h={h}
            isSelected={selectedHotspot?.id === h.id}
            onSelect={() => setSelectedHotspot(h)}
          />
        ))}
      </group>

      {/* Extra cyan point fill to simulate bloom glow */}
      <pointLight position={[0, 0, 4]} intensity={0.8} color="#00FFCC" distance={12} />

      <OrbitControls enableZoom enableDamping dampingFactor={0.08} minDistance={7} maxDistance={20} />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Export
// ──────────────────────────────────────────────────────────────────────────────
export default function HolographicPlantTwin3D() {
  const [crop, setCrop] = useState<CropType>('Maize');
  // No hotspot is pre-selected: pins render ONLY from a live AI diagnosis
  // returned by useLeafDiagnosis (upload → POST /api/v1/doctor/diagnose).
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const { hotspots, diagnose, isScanning, error, reset } = useLeafDiagnosis();
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const pins = toHotspotPins(hotspots);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImg(URL.createObjectURL(file));
    reset();
    setSelectedHotspot(null);
    const pins = await diagnose(file);
    const mapped = toHotspotPins(pins);
    if (mapped.length > 0) setSelectedHotspot(mapped[0]);
  };

  const sev = selectedHotspot ? selectedHotspot.severity : null;

  return (
    <div className="relative w-full h-[560px] rounded-[28px] overflow-hidden shadow-2xl flex flex-col justify-between mb-8 border border-cyan-900/30"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #00110D 0%, #010608 100%)' }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10 p-6">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-700/40 backdrop-blur-md">
          <Scan size={14} className="text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold text-cyan-300 tracking-widest uppercase">
            3D Holographic Plant Digital Twin
          </span>
        </div>

        {/* Crop Selector */}
        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          {(['Maize', 'Soybean', 'Sorghum'] as CropType[]).map((c) => (
            <button
              key={c}
              onClick={() => setCrop(c)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                crop === c ? 'bg-cyan-700/80 text-cyan-100' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* AI Scanner Side Panel */}
      <div className="absolute top-16 right-6 z-10 w-[220px] bg-black/70 backdrop-blur-xl border border-cyan-900/50 rounded-2xl p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <SparklesIcon size={14} className="text-cyan-400" />
          <span className="text-[12px] font-bold text-cyan-300">AI Leaf Scanner</span>
        </div>
        <p className="text-[10px] text-white/55 leading-relaxed mb-3">
          Upload an infected leaf photo to pin AI diagnostic hotspots on the 3D plant twin.
        </p>
        <label className="flex flex-col items-center p-3 border-2 border-dashed border-cyan-800/60 hover:border-cyan-500 rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center">
          <Upload size={16} className="text-cyan-400 mb-1" />
          <span className="text-[10px] font-bold text-white">
            {isScanning ? 'AI Analysing…' : 'Upload Leaf Photo'}
          </span>
          <span className="text-[8px] text-white/40">PNG / JPG up to 10 MB</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
        {error && (
          <div className="mt-2 p-2 bg-red-950/60 border border-red-800/60 rounded-xl text-[10px] text-red-200">
            {error}
          </div>
        )}
        {uploadedImg && (
          <div className="mt-2 flex items-center gap-2 p-1.5 bg-white/8 rounded-xl border border-white/10">
            <img src={uploadedImg} alt="Leaf" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <span className="text-[10px] font-bold text-emerald-400 block">Uploaded</span>
              <span className="text-[8px] text-white/60">{isScanning ? 'AI analysing…' : 'Sent for live diagnosis'}</span>
            </div>
          </div>
        )}
      </div>

      {/* R3F Canvas */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 1, 14], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
        >
          <PlantScene crop={crop} pins={pins} selectedHotspot={selectedHotspot} setSelectedHotspot={setSelectedHotspot} />
        </Canvas>
      </div>

      {/* Bottom AI Diagnosis Glassmorphism Card — live pins only */}
      <div className="z-10 bg-black/80 backdrop-blur-xl border border-white/10 p-4 mx-6 mb-6 rounded-2xl shadow-2xl text-white">
        {!selectedHotspot ? (
          <p className="text-[11px] text-white/60">
            {isScanning
              ? 'The AI is analysing your leaf photo — hotspot pins will appear here.'
              : error
                ? error
                : 'Upload a leaf photo to run a live AI diagnosis. No pre-loaded hotspots — pins appear only from the live result.'}
          </p>
        ) : (
        <>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-[14px] font-bold text-white leading-tight">
              {selectedHotspot.disease}
            </h4>
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-full border"
              style={{ color: selectedHotspot.color, borderColor: `${selectedHotspot.color}55`, backgroundColor: `${selectedHotspot.color}18` }}>
              {selectedHotspot.site}
            </span>
            <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
              sev === 'Healthy' ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50'
              : sev === 'Warning' ? 'bg-amber-900/60 text-amber-300 border-amber-700/50'
              : 'bg-red-900/60 text-red-300 border-red-700/50'
            }`}>
              {sev} · {selectedHotspot.confidence}% AI
            </span>
          </div>
        </div>
        <div className="flex items-start gap-2 pt-2 border-t border-white/8 text-[11px]">
          <ShieldCheck size={14} className="text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-cyan-400 font-bold">Treatment: </span>
            <span className="text-white/80">{selectedHotspot.treatment}</span>
            </div>
          </div>
        </>
        )}
      </div>

    </div>
  );
}
