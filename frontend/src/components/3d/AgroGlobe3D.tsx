"use client";

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Globe, Radio } from 'lucide-react';

interface AgroVectorHub {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  pestRisk: string;
  tradeVolume: string;
  crop: string;
  colorHex: number;
  colorStr: string;
}

const agroVectorHubs: AgroVectorHub[] = [
  {
    id: 'india-deccan',
    name: 'Deccan Agro Corridor',
    country: 'India (Deccan)',
    lat: 18.5204,
    lng: 73.8567,
    pestRisk: 'Low — Fall Armyworm Monitored',
    tradeVolume: '$4.2B Annual Grain Trade',
    crop: 'Maize & Sugarcane',
    colorHex: 0x4ADE80,
    colorStr: '#4ADE80',
  },
  {
    id: 'brazil-cerrado',
    name: 'Cerrado Agro Corridor',
    country: 'Brazil (Cerrado)',
    lat: -12.6819,
    lng: -56.9211,
    pestRisk: 'Moderate — Rust Spore Surveillance',
    tradeVolume: '$8.6B Export Volume',
    crop: 'Soybean & Corn',
    colorHex: 0xFBBF24,
    colorStr: '#FBBF24',
  },
  {
    id: 'zaf-highveld',
    name: 'Highveld Agro Corridor',
    country: 'South Africa (Highveld)',
    lat: -28.4541,
    lng: 26.7968,
    pestRisk: 'Low — Locust Vector Tracked',
    tradeVolume: '$2.8B Regional Trade',
    crop: 'Maize & Sorghum',
    colorHex: 0x38BDF8,
    colorStr: '#38BDF8',
  },
];

// Lat/Lng → 3D sphere Vector3
function latLng(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Procedural Earth Shader — GLSL continents from layered fbm noise
// ──────────────────────────────────────────────────────────────────────────────
const earthVertGLSL = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragGLSL = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Classic hash + FBM noise for procedural continents
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 5; i++) {
      v += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    // Lat/Lng from UV
    vec2 coord = vUv * vec2(6.28, 3.14);
    float landMask = fbm(coord * 1.5 + vec2(uTime * 0.002, 0.0));
    
    // Deep ocean vs land colour
    vec3 oceanDeep   = vec3(0.02, 0.07, 0.18);
    vec3 oceanShelf  = vec3(0.04, 0.16, 0.30);
    vec3 landGreen   = vec3(0.12, 0.36, 0.16);
    vec3 landDesert  = vec3(0.52, 0.40, 0.22);
    vec3 snowCap     = vec3(0.90, 0.93, 0.95);

    vec3 landColor = mix(landGreen, landDesert, smoothstep(0.42, 0.62, landMask));
    // poles → snow
    float lat = abs(vUv.y - 0.5) * 2.0;
    landColor = mix(landColor, snowCap, smoothstep(0.78, 0.92, lat));

    vec3 baseColor = mix(oceanDeep, landColor, smoothstep(0.40, 0.56, landMask));
    baseColor = mix(baseColor, oceanShelf, (1.0 - smoothstep(0.40, 0.56, landMask)) * smoothstep(0.33, 0.40, landMask));

    // Rim / atmosphere glow
    float rim = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.5);
    vec3 atmosphere = vec3(0.18, 0.52, 1.0) * rim * 1.4;

    // Specular highlight (sun from top-right)
    vec3 lightDir = normalize(vec3(1.0, 1.2, 0.8));
    float spec = pow(max(dot(vNormal, lightDir), 0.0), 32.0) * 0.5;

    gl_FragColor = vec4(baseColor + atmosphere + spec, 1.0);
  }
`;

// Pulsing animated arc
function VectorArc({
  start,
  end,
  color,
}: {
  start: AgroVectorHub;
  end: AgroVectorHub;
  color: number;
}) {
  const lineRef = useRef<THREE.Line>(null);

  const lineObj = useMemo(() => {
    const v1 = latLng(start.lat, start.lng, 3.05);
    const v2 = latLng(end.lat, end.lng, 3.05);
    const mid = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(5.2);
    const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
    const points = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.0 });
    const line = new THREE.Line(geo, mat);
    return line;
  }, [start, end, color]);

  useFrame(({ clock }) => {
    if (lineRef.current) {
      const mat = lineRef.current.material as THREE.LineBasicMaterial;
      mat.opacity = 0.55 + Math.sin(clock.getElapsedTime() * 2.2) * 0.3;
    }
  });

  return <primitive ref={lineRef} object={lineObj} />;
}

// Pulsing hotspot pin with glow ring
function HotspotPin({
  hub,
  isSelected,
  onSelect,
}: {
  hub: AgroVectorHub;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pos = latLng(hub.lat, hub.lng, 3.14);

  useFrame(({ clock }) => {
    if (ringRef.current) {
      const s = 1.0 + (isSelected ? 0.6 : 0.2) * Math.sin(clock.getElapsedTime() * 3.5);
      ringRef.current.scale.set(s, s, s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.55 + Math.sin(clock.getElapsedTime() * 3.5) * 0.3;
    }
  });

  return (
    <group position={pos}>
      {/* Core sphere */}
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <sphereGeometry args={[isSelected ? 0.18 : 0.13, 16, 16]} />
        <meshStandardMaterial
          color={hub.colorStr}
          emissive={hub.colorStr}
          emissiveIntensity={isSelected ? 2.5 : 1.0}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Pulsing ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshBasicMaterial color={hub.colorStr} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      <Text position={[0, 0.42, 0]} fontSize={0.19} color={hub.colorStr} anchorX="center">
        {hub.country.split(' ')[0]}
      </Text>
    </group>
  );
}

// Main R3F Scene
function GlobeScene({
  selectedHub,
  setSelectedHub,
}: {
  selectedHub: AgroVectorHub;
  setSelectedHub: (h: AgroVectorHub) => void;
}) {
  const globeRef = useRef<THREE.Group>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.10;
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  const earthMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: earthVertGLSL,
        fragmentShader: earthFragGLSL,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[8, 12, 8]} intensity={2.0} color="#FFF8E7" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#1A4AFF" />

      {/* Deep space stars */}
      <Stars radius={80} depth={60} count={3000} factor={4} saturation={0.3} fade speed={0.4} />

      {/* Sparkle particles drifting in space */}
      <Sparkles count={60} scale={[18, 18, 18]} size={1.5} speed={0.2} color="#4ADE80" opacity={0.4} />

      <group ref={globeRef}>
        {/* Photorealistic Procedural Earth */}
        <mesh material={earthMaterial}>
          <sphereGeometry args={[3, 96, 96]} />
        </mesh>

        {/* Thin atmosphere shell */}
        <mesh>
          <sphereGeometry args={[3.06, 64, 64]} />
          <meshPhongMaterial
            color="#4466FF"
            transparent
            opacity={0.08}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Glow atmosphere halo */}
        <mesh>
          <sphereGeometry args={[3.18, 64, 64]} />
          <meshBasicMaterial color="#2266FF" transparent opacity={0.04} side={THREE.BackSide} />
        </mesh>

        {/* Geo grid latitude/longitude lines */}
        <mesh>
          <sphereGeometry args={[3.04, 36, 18]} />
          <meshBasicMaterial color="#22AA66" wireframe transparent opacity={0.06} />
        </mesh>

        {/* Trade / Pest Vector Arcs */}
        <VectorArc start={agroVectorHubs[0]} end={agroVectorHubs[1]} color={0x38BDF8} />
        <VectorArc start={agroVectorHubs[0]} end={agroVectorHubs[2]} color={0x4ADE80} />
        <VectorArc start={agroVectorHubs[1]} end={agroVectorHubs[2]} color={0xFBBF24} />

        {/* Agro-Hub Pins */}
        {agroVectorHubs.map((hub) => (
          <HotspotPin
            key={hub.id}
            hub={hub}
            isSelected={selectedHub.id === hub.id}
            onSelect={() => setSelectedHub(hub)}
          />
        ))}
      </group>

      {/* Hemisphere fill for warm/cool atmosphere split */}
      <hemisphereLight args={['#88CCFF', '#003311', 0.6]} />

      <OrbitControls
        enableZoom
        minDistance={6}
        maxDistance={16}
        autoRotate={false}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

export default function AgroGlobe3D() {
  const [selectedHub, setSelectedHub] = useState<AgroVectorHub>(agroVectorHubs[0]);

  return (
    <div className="relative w-full h-[520px] bg-[#020C0E] rounded-[28px] border border-emerald-900/40 overflow-hidden shadow-2xl p-6 flex flex-col justify-between mb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-700/40 backdrop-blur-md">
          <Globe size={15} className="text-emerald-400 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-300 tracking-widest uppercase">
            BRICS Agro-Earth Globe · Live Vector Intelligence
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-sky-300 bg-black/50 px-3 py-1 rounded-full border border-sky-900/40">
          <Radio size={13} className="text-sky-400" />
          <span>Deccan ↔ Cerrado ↔ Highveld · Scroll to zoom</span>
        </div>
      </div>

      {/* R3F Canvas */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        >
          <GlobeScene selectedHub={selectedHub} setSelectedHub={setSelectedHub} />
        </Canvas>
      </div>

      {/* Hub selector tabs */}
      <div className="z-10 flex gap-2 mb-2 pointer-events-auto">
        {agroVectorHubs.map((hub) => (
          <button
            key={hub.id}
            onClick={() => setSelectedHub(hub)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
              selectedHub.id === hub.id
                ? 'border-emerald-500 text-emerald-300 bg-emerald-950/60'
                : 'border-white/10 text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
            style={{ borderColor: selectedHub.id === hub.id ? hub.colorStr : undefined }}
          >
            {hub.country.split('(')[0].trim()}
          </button>
        ))}
      </div>

      {/* Glassmorphism Diagnostic Card */}
      <div className="z-10 bg-black/70 backdrop-blur-xl border border-white/10 p-4 rounded-2xl text-white shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: selectedHub.colorStr }}
            />
            <h4 className="text-[15px] font-bold text-white">{selectedHub.name}</h4>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full border"
              style={{ color: selectedHub.colorStr, borderColor: `${selectedHub.colorStr}55`, backgroundColor: `${selectedHub.colorStr}15` }}>
              {selectedHub.country}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
            AI Vector Analysis
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-[11px] border-t border-white/8 pt-2">
          <div className="bg-white/5 border border-white/8 p-2 rounded-xl">
            <span className="text-white/50 font-semibold block mb-0.5">Crop Profile</span>
            <span className="font-bold text-white">{selectedHub.crop}</span>
          </div>
          <div className="bg-white/5 border border-white/8 p-2 rounded-xl">
            <span className="text-white/50 font-semibold block mb-0.5">Pest Vector Risk</span>
            <span className="font-bold" style={{ color: selectedHub.colorStr }}>{selectedHub.pestRisk}</span>
          </div>
          <div className="bg-white/5 border border-white/8 p-2 rounded-xl">
            <span className="text-white/50 font-semibold block mb-0.5">Trade Volume</span>
            <span className="font-bold text-white">{selectedHub.tradeVolume}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
