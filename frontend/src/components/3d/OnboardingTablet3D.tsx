'use client';

import React, { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, RoundedBox, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Sprout, MapPin, CheckCircle2, ChevronRight, Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

interface FarmProfile {
  country: string;
  region: string;
  soilType: string;
  acres: number;
  crops: string[];
}

const REGIONS = [
  { country: 'India 🇮🇳', region: 'Deccan Plateau', soil: 'Black Cotton (Vertisol)', defaultAcres: 5, crops: ['Maize', 'Sugarcane', 'Chickpea'] },
  { country: 'Brazil 🇧🇷', region: 'Mato Grosso', soil: 'Cerrado Latosol (Oxisol)', defaultAcres: 120, crops: ['Soybean', 'Corn', 'Brachiaria'] },
  { country: 'South Africa 🇿🇦', region: 'Free State', soil: 'Highveld Sandy Loam', defaultAcres: 45, crops: ['Maize', 'Sorghum', 'Sunflower'] },
  { country: 'China 🇨🇳', region: 'Loess Plateau', soil: 'Loessial & Paddy', defaultAcres: 8, crops: ['Rice', 'Winter Wheat', 'Soybean'] },
  { country: 'Russia 🇷🇺', region: 'Krasnodar', soil: 'Chernozem Black Earth', defaultAcres: 200, crops: ['Wheat', 'Sunflower', 'Barley'] },
];

function TabletMesh({ children }: { children: React.ReactNode }) {
  const tabletRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (tabletRef.current) {
      tabletRef.current.rotation.y = Math.sin(Date.now() * 0.0005) * 0.08;
    }
  });

  return (
    <group ref={tabletRef}>
      {/* Tablet Outer Metallic Chassis */}
      <RoundedBox args={[7.2, 5.0, 0.28]} radius={0.2} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.2} />
      </RoundedBox>

      {/* Screen Bezel Accent Ring */}
      <RoundedBox args={[6.85, 4.65, 0.02]} radius={0.12} smoothness={2} position={[0, 0, 0.15]}>
        <meshStandardMaterial color="#064e3b" emissive="#059669" emissiveIntensity={0.3} roughness={0.4} />
      </RoundedBox>

      {/* Front Camera Dot */}
      <mesh position={[0, 2.38, 0.16]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color="#020617" />
      </mesh>

      {/* Glass Screen with UI Overlay */}
      <mesh position={[0, 0, 0.16]}>
        <planeGeometry args={[6.7, 4.5]} />
        <meshStandardMaterial color="#020d08" roughness={0.1} metalness={0.5} transparent opacity={0.95} />
      </mesh>

      {/* Embedded HTML Interactive Screen */}
      <Html
        transform
        distanceFactor={4.2}
        position={[0, 0, 0.18]}
        className="w-[580px] h-[390px] select-none pointer-events-auto"
      >
        <div className="w-full h-full p-4 bg-gradient-to-b from-[#021810]/95 via-[#030f0a]/98 to-[#010805]/98 rounded-2xl border border-emerald-500/20 shadow-2xl flex flex-col justify-between text-white font-sans backdrop-blur-xl">
          {children}
        </div>
      </Html>
    </group>
  );
}

export default function OnboardingTablet3D({ onComplete }: { onComplete?: (profile: FarmProfile) => void }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [acres, setAcres] = useState(selectedRegion.defaultAcres);
  const [selectedCrops, setSelectedCrops] = useState<string[]>(selectedRegion.crops);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRegionSelect = (r: typeof REGIONS[0]) => {
    setSelectedRegion(r);
    setAcres(r.defaultAcres);
    setSelectedCrops(r.crops);
  };

  const toggleCrop = (c: string) => {
    setSelectedCrops(prev => 
      prev.includes(c) ? (prev.length > 1 ? prev.filter(x => x !== c) : prev) : [...prev, c]
    );
  };

  const handleFinish = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setStep(4);
      if (onComplete) {
        onComplete({
          country: selectedRegion.country,
          region: selectedRegion.region,
          soilType: selectedRegion.soil,
          acres,
          crops: selectedCrops
        });
      }
    }, 1200);
  };

  return (
    <div className="relative w-full h-[620px] rounded-[32px] overflow-hidden border border-emerald-900/40 shadow-2xl bg-gradient-to-b from-[#01140d] via-[#020b08] to-[#010604] flex flex-col items-center justify-between">
      
      {/* Top Banner Header */}
      <div className="w-full px-6 pt-5 pb-2 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Sprout size={16} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">3D Farm Digital Twin Onboarding</h3>
            <p className="text-[10px] text-emerald-400/80 font-mono">Step {step} of 4 · Interactive WebGL Form Factor</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-black/40 px-3 py-1 rounded-full border border-white/10 text-[11px] font-bold text-slate-300">
          <Sparkles size={12} className="text-emerald-400" />
          <span>Live Telemetry Sync</span>
        </div>
      </div>

      {/* 3D Canvas Rig */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }} dpr={[1, 2]}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 8, 6]} intensity={2.0} color="#E6FFF2" />
          <pointLight position={[-6, -4, -2]} color="#059669" intensity={1.2} />
          <hemisphereLight args={['#0F2027', '#021810', 0.6]} />

          <Stars radius={50} depth={20} count={1200} factor={2} fade speed={0.4} />

          <Float speed={1.4} rotationIntensity={0.08} floatIntensity={0.2}>
            <TabletMesh>
              {/* Step 1: Regional Agro-Hub */}
              {step === 1 && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <MapPin size={14} />
                        <span>Select Agricultural Corridor</span>
                      </div>
                      <span className="text-[10px] text-slate-400">BRICS Network</span>
                    </div>

                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                      Choose your farm location to calibrate local soil databases, satellite orbits, and climate models:
                    </p>

                    <div className="grid grid-cols-1 gap-1.5">
                      {REGIONS.map((r) => (
                        <button
                          key={r.region}
                          onClick={() => handleRegionSelect(r)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left border text-[11px] font-semibold transition-all cursor-pointer ${
                            selectedRegion.region === r.region
                              ? 'bg-emerald-600/30 border-emerald-400 text-white shadow-md shadow-emerald-950'
                              : 'bg-white/5 border-white/8 text-slate-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{r.country.split(' ')[1]}</span>
                            <div>
                              <span className="font-bold text-white block leading-none">{r.region}</span>
                              <span className="text-[9px] text-slate-400">{r.soil}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className={selectedRegion.region === r.region ? 'text-emerald-400' : 'text-slate-600'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <span className="text-[10px] text-slate-400">Selected: {selectedRegion.country}</span>
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-1 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-900/50"
                    >
                      Next: Soil Strata <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Soil Strata & Farm Scale */}
              {step === 2 && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Layers size={14} />
                        <span>Soil Strata & Land Scale</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{selectedRegion.region}</span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl mb-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-white mb-1">
                        <span className="text-slate-300">Soil Classification:</span>
                        <span className="text-emerald-400">{selectedRegion.soil}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Calibrated with ICAR & Embrapa open soil profile maps. Baseline Organic Carbon (SOC): 0.6% – 2.8%.
                      </p>
                    </div>

                    <div className="space-y-1.5 mb-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-200">Cultivated Area:</span>
                        <span className="text-emerald-400 font-mono text-sm">{acres} Acres ({Math.round(acres * 0.404686)} ha)</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="500"
                        value={acres}
                        onChange={(e) => setAcres(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-emerald-950/40 p-2 rounded-xl border border-emerald-500/20">
                      <div>
                        <span className="text-slate-400 block">Est. 3-Year SOC Gain:</span>
                        <span className="font-bold text-emerald-300 text-xs">+0.45% SOC</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Carbon Sequestration:</span>
                        <span className="font-bold text-emerald-300 text-xs">{(acres * 1.2).toFixed(1)} t CO₂e / yr</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      onClick={() => setStep(1)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex items-center gap-1 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-900/50"
                    >
                      Next: Crops <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Crop Selection */}
              {step === 3 && (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Sprout size={14} />
                        <span>Select Primary Crops</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{acres} Acres</span>
                    </div>

                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                      Toggle active cultivars to configure AI pathology monitoring and satellite NDVI thresholds:
                    </p>

                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {['Maize', 'Soybean', 'Wheat', 'Sorghum', 'Rice', 'Sunflower', 'Chickpea', 'Cotton'].map((crop) => {
                        const isSel = selectedCrops.includes(crop);
                        return (
                          <button
                            key={crop}
                            onClick={() => toggleCrop(crop)}
                            className={`p-2 rounded-xl text-left border text-[11px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                              isSel
                                ? 'bg-emerald-600/30 border-emerald-400 text-white'
                                : 'bg-white/5 border-white/8 text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>{crop}</span>
                            {isSel && <CheckCircle2 size={13} className="text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <button
                      onClick={() => setStep(2)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleFinish}
                      disabled={isSyncing}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg transition-colors cursor-pointer shadow-lg shadow-emerald-900/50"
                    >
                      {isSyncing ? 'Generating 3D Digital Twin…' : 'Generate Digital Twin ✨'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Digital Twin Activated */}
              {step === 4 && (
                <div className="flex flex-col h-full justify-between items-center text-center py-2">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center mb-2 animate-bounce">
                      <ShieldCheck size={26} className="text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-black text-white">Digital Twin Initialized!</h4>
                    <p className="text-[10px] text-slate-300 max-w-[340px] mt-1 leading-normal">
                      Your farm in <strong className="text-emerald-400">{selectedRegion.region}, {selectedRegion.country}</strong> is now live on the BRICS agricultural network.
                    </p>
                  </div>

                  <div className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-left grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Cultivated Land:</span>
                      <span className="font-bold text-white text-xs">{acres} Acres</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Active Cultivars:</span>
                      <span className="font-bold text-emerald-400 text-xs">{selectedCrops.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Soil Type:</span>
                      <span className="font-bold text-white text-xs">{selectedRegion.soil.split('(')[0]}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">AI Pathology Engine:</span>
                      <span className="font-bold text-emerald-400 text-xs">Local AI Model</span>
                    </div>
                  </div>

                  <a
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950"
                  >
                    Open 3D Farm Dashboard <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </TabletMesh>
          </Float>

          <OrbitControls enableZoom={false} enableDamping dampingFactor={0.08} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 2.5} />
        </Canvas>
      </div>

      {/* Bottom Hint */}
      <div className="z-10 pb-4 text-[11px] text-slate-500 font-semibold flex items-center gap-2 pointer-events-none">
        <span>💡 Rotate tablet slightly by dragging in 3D space · Click buttons on screen to proceed</span>
      </div>
    </div>
  );
}
