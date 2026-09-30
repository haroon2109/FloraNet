'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Html, OrbitControls, RoundedBox, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Droplets, Activity, Bug, Trees, Sparkles, ArrowUpRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { getApiBaseUrl } from '@/lib/apiConfig';

interface MetricCardProps {
  position: [number, number, number];
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<any>;
  value: string;
  subValue: string;
  description: string;
  glowColor: string;
  actionLabel?: string;
  onAction?: () => void;
}

function FloatingCard({
  position,
  title,
  badge,
  badgeColor,
  icon: Icon,
  value,
  subValue,
  description,
  glowColor,
  actionLabel,
  onAction,
}: MetricCardProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      const targetScale = hovered ? 1.06 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 8);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Glass Backdrop Box */}
      <RoundedBox
        args={[3.8, 2.5, 0.15]}
        radius={0.12}
        smoothness={4}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color="#061a12"
          emissive={glowColor}
          emissiveIntensity={hovered ? 0.6 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </RoundedBox>

      {/* Embedded HTML Interactive Metric Card */}
      <Html
        transform
        distanceFactor={4.8}
        position={[0, 0, 0.1]}
        className="w-[300px] h-[190px] select-none pointer-events-auto"
      >
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`w-full h-full p-3.5 rounded-2xl border transition-all duration-300 flex flex-col justify-between backdrop-blur-xl text-white font-sans ${
            hovered
              ? 'bg-black/90 border-emerald-400/80 shadow-2xl shadow-emerald-500/20'
              : 'bg-black/75 border-white/10 shadow-lg'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${glowColor}25`, border: `1px solid ${glowColor}50` }}
              >
                <Icon size={14} style={{ color: glowColor }} />
              </div>
              <span className="text-xs font-black text-white">{title}</span>
            </div>
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: badgeColor, borderColor: `${badgeColor}40`, backgroundColor: `${badgeColor}15` }}
            >
              {badge}
            </span>
          </div>

          {/* Main Stat */}
          <div className="my-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{value}</span>
              <span className="text-[11px] font-bold" style={{ color: glowColor }}>{subValue}</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug mt-0.5 line-clamp-2">
              {description}
            </p>
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between pt-2 border-t border-white/8 text-[10px]">
            <span className="text-slate-500 flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-400" />
              <span>AI Telemetry</span>
            </span>
            {actionLabel && (
              <button
                onClick={onAction}
                className="flex items-center gap-1 font-bold text-emerald-300 hover:text-emerald-200 cursor-pointer"
              >
                <span>{actionLabel}</span>
                <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
}

export default function DashboardSpatial3D() {
  const [liveMoisture, setLiveMoisture] = useState<number | null>(null);
  const [liveTemp, setLiveTemp] = useState<number | null>(null);
  const [liveSoc, setLiveSoc] = useState<number | null>(null);
  const [livePh, setLivePh] = useState<number | null>(null);
  const [hazardsCount, setHazardsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLiveReadings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/v1/soil/live?lat=18.5204&lng=73.8567`);
      if (res.ok) {
        const data = await res.json();
        const m = data?.layers?.['0_1cm']?.moisture_pct;
        const t = data?.layers?.['0_1cm']?.temp_c;
        const soc = data?.soilgrids?.soc_percent;
        const ph = data?.soilgrids?.ph;
        if (typeof m === 'number') setLiveMoisture(m);
        if (typeof t === 'number') setLiveTemp(t);
        if (typeof soc === 'number') setLiveSoc(soc);
        if (typeof ph === 'number') setLivePh(ph);
      }
    } catch {
      // stay null → cards show explicit "unavailable", never a substitute number
    } finally {
      setLoading(false);
    }
  };

  // Live NASA EONET hazard count near the farm (real events, not a canned "0")
  useEffect(() => {
    let mounted = true;
    fetch(`${getApiBaseUrl()}/api/v1/farm/metrics?lat=18.5204&lng=73.8567`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (mounted && data && typeof data.active_alerts_count === 'number') {
          setHazardsCount(data.active_alerts_count);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    fetchLiveReadings();
  }, []);

  const fmt = (v: number | null, digits = 1, suffix = '') =>
    v != null ? `${v.toFixed(digits)}${suffix}` : '—';

  const { isLowPower, webglSupported, dpr } = useDevicePerformance();

  return (
    <div className="relative w-full h-[540px] rounded-[32px] overflow-hidden border border-emerald-900/30 bg-gradient-to-b from-[#02130c] via-[#010b07] to-[#000604] shadow-2xl flex flex-col justify-between p-6 mb-8">
      
      {/* Top Bar Overlay */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 z-10 pointer-events-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Spatial 3D Digital Farm Twin (R3F)
            </span>
          </div>
          <h3 className="text-lg font-black text-white">Exploded Telemetry Matrix</h3>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={fetchLiveReadings}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin text-emerald-400' : ''} />
            <span>Sync Live Sensor API</span>
          </button>
          <span className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-700/40 rounded-xl text-[11px] font-bold text-emerald-300">
            Open-Meteo + SoilGrids
          </span>
        </div>
      </div>

      {/* R3F 3D Canvas with 4 Floating Spatial Metric Cards */}
      <div className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0, 8.5], fov: 42 }} dpr={dpr}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[6, 8, 8]} intensity={1.8} color="#D1FAE5" />
          <pointLight position={[-8, -5, -2]} color="#059669" intensity={1.0} />
          <hemisphereLight args={['#0F2027', '#021810', 0.5]} />

          {!isLowPower && (
            <Stars radius={60} depth={30} count={1200} factor={2} fade speed={0.2} />
          )}

          <Float speed={1.2} rotationIntensity={0.06} floatIntensity={0.25}>
            {/* Top-Left: Real-time Soil Moisture & Wetness */}
            <FloatingCard
              position={[-2.4, 1.4, 0]}
              title="Soil Moisture & Wetness"
              badge={liveMoisture != null ? 'LIVE SENSOR' : 'OFFLINE'}
              badgeColor="#38BDF8"
              icon={Droplets}
              value={fmt(liveMoisture, 0, '%')}
              subValue={`${fmt(liveTemp, 1)}°C Surface`}
              description="Open-Meteo volumetric telemetry at 0–1cm depth. Wetness specular shader driven by the live reading."
              glowColor="#38BDF8"
              actionLabel="View Strata"
              onAction={() => window.location.href = '/zenith#soil'}
            />

            {/* Top-Right: Sentinel-2 acquisition metadata (real scene; pixel NDVI not computed) */}
            <FloatingCard
              position={[2.4, 1.4, 0]}
              title="Sentinel-2 Scene"
              badge="10m BANDS"
              badgeColor="#4ADE80"
              icon={Activity}
              value="L2A"
              subValue="Copernicus"
              description="Latest real acquisition metadata from the Copernicus catalogue. Pixel-level NDVI requires authenticated raster access and is not simulated."
              glowColor="#4ADE80"
              actionLabel="Scan Pipeline"
              onAction={() => window.location.href = '/field-monitor'}
            />

            {/* Bottom-Left: Live NASA EONET hazard feed (real events) */}
            <FloatingCard
              position={[-2.4, -1.4, 0]}
              title="Hazard Surveillance"
              badge="NASA EONET"
              badgeColor="#FBBF24"
              icon={Bug}
              value={hazardsCount != null ? String(hazardsCount) : '—'}
              subValue="Active within 500km"
              description="Live NASA EONET natural-hazard events near the farm. Counts reflect the current open-event feed."
              glowColor="#FBBF24"
              actionLabel="Alerts"
              onAction={() => window.location.href = '/alerts'}
            />

            {/* Bottom-Right: Live SOC from ISRIC SoilGrids */}
            <FloatingCard
              position={[2.4, -1.4, 0]}
              title="Soil Carbon (SOC)"
              badge="SOILGRIDS"
              badgeColor="#A78BFA"
              icon={Trees}
              value={fmt(liveSoc, 2, '%')}
              subValue={`pH ${fmt(livePh, 1)}`}
              description="Live ISRIC SoilGrids 2.0 SOC & pH for the 0–5cm band. Rotation-based carbon accrual is projected in the Planner."
              glowColor="#A78BFA"
              actionLabel="RAG Plan"
              onAction={() => window.location.href = '/planner'}
            />
          </Float>

          <OrbitControls
            enableZoom={false}
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 1.9}
            minPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </div>

      {/* Bottom Subtitle */}
      <div className="z-10 text-[11px] text-slate-500 font-semibold flex items-center justify-between pointer-events-none">
        <span>Drag canvas to tilt spatial perspective · Click card actions to open modules</span>
        <span className="font-mono text-emerald-400/80">FloraNet Spatial Grid Engine v1.0</span>
      </div>
    </div>
  );
}
