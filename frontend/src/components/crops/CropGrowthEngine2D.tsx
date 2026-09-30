"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Info, Droplets, Sun, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export type CropArchetype = 'maize' | 'wheat' | 'pulses' | 'tomato' | 'root';

export interface StageData {
  index: number;
  name: string;
  shortName: string;
  das: number; // Days after sowing
  heightCm: number;
  rootDepthCm: number;
  waterDemand: 'Low' | 'Moderate' | 'High' | 'Critical' | 'Minimal';
  nitrogenDemand: 'Low' | 'Medium' | 'High' | 'Peak' | 'Maintenance';
  description: string;
  advisory: string;
}

const STAGES: StageData[] = [
  {
    index: 0,
    name: 'Sowing & Imbibition',
    shortName: 'Sowing',
    das: 0,
    heightCm: 0,
    rootDepthCm: 3,
    waterDemand: 'Moderate',
    nitrogenDemand: 'Low',
    description: 'Seed placed in moist seedbed; absorbs water and initiates metabolic germination.',
    advisory: 'Ensure optimal seed-to-soil contact and maintain 40-50% field soil moisture.',
  },
  {
    index: 1,
    name: 'Germination & Sprout',
    shortName: 'Sprout',
    das: 7,
    heightCm: 4,
    rootDepthCm: 8,
    waterDemand: 'Moderate',
    nitrogenDemand: 'Low',
    description: 'Radicle pierces seed coat; first pale coleoptile shoot breaks through soil surface.',
    advisory: 'Scout for seedling damping-off and monitor early crusting or soil compaction.',
  },
  {
    index: 2,
    name: 'Seedling Emergence',
    shortName: 'Seedling',
    das: 18,
    heightCm: 14,
    rootDepthCm: 20,
    waterDemand: 'Moderate',
    nitrogenDemand: 'Medium',
    description: 'First true leaves unfurl; photosynthetic machinery activates as primary root branches.',
    advisory: 'Apply starter phosphatic fertilizer to accelerate rapid secondary root branching.',
  },
  {
    index: 3,
    name: 'V6 Rapid Vegetative',
    shortName: 'Vegetative',
    das: 45,
    heightCm: 65,
    rootDepthCm: 55,
    waterDemand: 'High',
    nitrogenDemand: 'Peak',
    description: 'Peak vegetative expansion; thick nodal stems, full leaf canopy, and vigorous root anchorage.',
    advisory: 'Apply primary Nitrogen (Urea 46:0:0) top dressing before canopy closure.',
  },
  {
    index: 4,
    name: 'Flowering & Tasseling',
    shortName: 'Flowering',
    das: 72,
    heightCm: 140,
    rootDepthCm: 85,
    waterDemand: 'Critical',
    nitrogenDemand: 'High',
    description: 'Reproductive tassels and floral silks emerge; pollination begins under warm sunlight.',
    advisory: 'Zero drought tolerance window: ensure 15mm irrigation to avoid poor pollination.',
  },
  {
    index: 5,
    name: 'Grain / Fruit Filling',
    shortName: 'Maturing',
    das: 95,
    heightCm: 155,
    rootDepthCm: 105,
    waterDemand: 'High',
    nitrogenDemand: 'Medium',
    description: 'Nutrients translocate into swelling kernels and fruits; dry matter accumulation peaks.',
    advisory: 'Monitor for late-season ear rot, aphids, and maintain steady furrow soil moisture.',
  },
  {
    index: 6,
    name: 'Harvest Maturity',
    shortName: 'Harvest',
    das: 120,
    heightCm: 160,
    rootDepthCm: 110,
    waterDemand: 'Minimal',
    nitrogenDemand: 'Low',
    description: 'Black layer formation; grains reach ideal 14-16% harvest moisture ready for combine.',
    advisory: 'Schedule combine harvester and prepare clean dry storage silos.',
  },
];

export default function CropGrowthEngine2D({
  cropName = 'Maize',
  initialStageIndex = 3,
}: {
  cropName?: string;
  initialStageIndex?: number;
}) {
  const [currentStage, setCurrentStage] = useState<number>(initialStageIndex);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [archetype, setArchetype] = useState<CropArchetype>('maize');

  // Auto playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStage((prev) => (prev >= STAGES.length - 1 ? 0 : prev + 1));
      }, 1600);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const stage = STAGES[currentStage];
  const progressRatio = currentStage / (STAGES.length - 1);

  // SVG Drawing calculations based on stage
  const stemHeight = 15 + progressRatio * 135; // 15px -> 150px
  const rootDepth = 10 + progressRatio * 75; // 10px -> 85px
  const leafScale = 0.2 + progressRatio * 0.85;

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Top Header & Archetype Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#F0F4F1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#168A45] animate-pulse" />
            <h3 className="text-[16px] font-bold text-[#102A20]">
              2.5D Procedural Crop Growth Simulator
            </h3>
          </div>
          <p className="text-[12px] text-[#55695F] mt-0.5">
            Real-time vegetative canopy & underground sub-surface root dynamics
          </p>
        </div>

        {/* Archetype Buttons */}
        <div className="flex items-center gap-1.5 bg-[#F5F8F6] p-1 rounded-xl border border-[#E2EBE5]">
          {(['maize', 'wheat', 'pulses', 'tomato', 'root'] as CropArchetype[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setArchetype(type)}
              className={`px-2.5 py-1 text-[11.5px] font-bold rounded-lg transition-all capitalize ${
                archetype === type
                  ? 'bg-[#075C32] text-white shadow-xs'
                  : 'text-[#50645B] hover:text-[#102A20] hover:bg-white/60'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main 2.5D Interactive Canvas */}
      <div className="relative w-full h-[290px] sm:h-[310px] rounded-xl overflow-hidden border border-[#DCE8DF] bg-gradient-to-b from-[#EDF6F0] via-[#F4FAF6] to-[#E3EDE6] shadow-inner mb-4">
        
        {/* SVG Drawing Canvas */}
        <svg
          viewBox="0 0 500 300"
          className="w-full h-full preserve-3d"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <defs>
            {/* Sunlight & Sky Gradients */}
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D9EFE2" />
              <stop offset="60%" stopColor="#EDF7F1" />
              <stop offset="100%" stopColor="#F9FCFA" />
            </linearGradient>

            {/* Stratified Underground Soil Gradients */}
            <linearGradient id="topSoil" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5A3D28" />
              <stop offset="35%" stopColor="#48301E" />
              <stop offset="70%" stopColor="#3A2516" />
              <stop offset="100%" stopColor="#2C1B0F" />
            </linearGradient>

            {/* Plant Stem & Leaf Gradients */}
            <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#127038" />
              <stop offset="45%" stopColor="#22A456" />
              <stop offset="100%" stopColor="#0F5A2D" />
            </linearGradient>

            <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2FC46B" />
              <stop offset="60%" stopColor="#158F47" />
              <stop offset="100%" stopColor="#0B5C2B" />
            </linearGradient>

            {/* Grain / Fruit Golden Gradient */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFDE59" />
              <stop offset="60%" stopColor="#E5A912" />
              <stop offset="100%" stopColor="#B37C05" />
            </linearGradient>

            <linearGradient id="rootGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8DEC8" />
              <stop offset="50%" stopColor="#C9BBA2" />
              <stop offset="100%" stopColor="#A8977B" />
            </linearGradient>

            {/* Soft Shadow Filter */}
            <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Above Ground Sky Area */}
          <rect x="0" y="0" width="500" height="175" fill="url(#skyGrad)" />

          {/* Ambient Sunlight & Clouds */}
          <circle cx="420" cy="45" r="30" fill="#FFF4CC" opacity="0.75" />
          <circle cx="420" cy="45" r="18" fill="#FFE58F" opacity="0.9" />

          {/* Ambient Sky Cloud */}
          <g opacity="0.65" transform="translate(60, 30)">
            <path
              d="M 10 20 Q 20 5 35 15 Q 50 0 65 15 Q 80 10 85 25 L 5 25 Z"
              fill="#FFFFFF"
            />
          </g>

          {/* Horizon Ground Line */}
          <path
            d="M 0 175 Q 120 173 250 175 T 500 174"
            stroke="#4D784E"
            strokeWidth="3"
            fill="none"
          />
          <rect x="0" y="174" width="500" height="3" fill="#6A976B" opacity="0.7" />

          {/* Underground Soil Stratum */}
          <rect x="0" y="175" width="500" height="125" fill="url(#topSoil)" />

          {/* Soil Geological Texture Dots */}
          <g fill="#FFFFFF" opacity="0.08">
            <circle cx="45" cy="205" r="2.5" />
            <circle cx="120" cy="235" r="1.5" />
            <circle cx="180" cy="265" r="3" />
            <circle cx="310" cy="215" r="2" />
            <circle cx="390" cy="250" r="2.5" />
            <circle cx="450" cy="220" r="1.5" />
            <circle cx="230" cy="280" r="2" />
          </g>

          {/* Soil Depth Measurement Grid Indicator */}
          <g opacity="0.35" stroke="#FFFFFF" strokeDasharray="3,3" strokeWidth="0.8">
            <line x1="20" y1="210" x2="480" y2="210" />
            <line x1="20" y1="250" x2="480" y2="250" />
          </g>
          <text x="30" y="206" fill="#D2C3B0" fontSize="9" fontWeight="600" opacity="0.7">
            -25 cm (Active Root Zone)
          </text>
          <text x="30" y="246" fill="#D2C3B0" fontSize="9" fontWeight="600" opacity="0.7">
            -75 cm (Subsoil Water Reserve)
          </text>

          {/* Ground Plane Shadow */}
          <ellipse cx="250" cy="175" rx={35 + progressRatio * 45} ry="5" fill="#1C3823" opacity="0.35" />

          {/* ======================================================== */}
          {/* UNDERGROUND: 2.5D Procedural Root Network               */}
          {/* ======================================================== */}
          <g id="rootSystem" filter="url(#dropShadow)">
            {currentStage === 0 && (
              /* Seed in ground */
              <g transform="translate(250, 185)">
                <ellipse cx="0" cy="0" rx="6" ry="4" fill="#C49A45" stroke="#7A5617" strokeWidth="1" />
                <path d="M 0 3 Q 1 9 4 14" stroke="url(#rootGrad)" strokeWidth="1.6" fill="none" strokeLinecap="round" />
              </g>
            )}

            {currentStage >= 1 && (
              <g>
                {/* Primary Tap Root */}
                <path
                  d={`M 250 175 Q ${248 + Math.sin(currentStage) * 4} ${175 + rootDepth * 0.5} 250 ${175 + rootDepth}`}
                  stroke="url(#rootGrad)"
                  strokeWidth={2 + progressRatio * 2.8}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Secondary Branching Roots Left & Right */}
                <path
                  d={`M 250 ${185 + rootDepth * 0.2} Q 230 ${195 + rootDepth * 0.3} ${220 - progressRatio * 35} ${205 + rootDepth * 0.4}`}
                  stroke="url(#rootGrad)"
                  strokeWidth={1.4 + progressRatio * 1.5}
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d={`M 250 ${188 + rootDepth * 0.25} Q 270 ${198 + rootDepth * 0.35} ${280 + progressRatio * 38} ${210 + rootDepth * 0.45}`}
                  stroke="url(#rootGrad)"
                  strokeWidth={1.4 + progressRatio * 1.5}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Tertiary Deep Anchorage Roots */}
                {currentStage >= 3 && (
                  <>
                    <path
                      d={`M 250 ${195 + rootDepth * 0.45} Q 235 ${210 + rootDepth * 0.6} ${230 - progressRatio * 25} ${215 + rootDepth * 0.85}`}
                      stroke="url(#rootGrad)"
                      strokeWidth={1.2 + progressRatio * 1}
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M 250 ${198 + rootDepth * 0.5} Q 268 ${212 + rootDepth * 0.65} ${272 + progressRatio * 28} ${218 + rootDepth * 0.9}`}
                      stroke="url(#rootGrad)"
                      strokeWidth={1.2 + progressRatio * 1}
                      fill="none"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Root Cap Pulse Glow */}
                <circle
                  cx="250"
                  cy={175 + rootDepth}
                  r="3.5"
                  fill="#78E69E"
                  opacity="0.85"
                  className="animate-ping"
                />
              </g>
            )}
          </g>

          {/* ======================================================== */}
          {/* ABOVE GROUND: 2.5D Procedural Foliage & Canopy          */}
          {/* ======================================================== */}
          <g id="canopySystem" filter="url(#dropShadow)">
            
            {/* Stage 1: Emergence sprout */}
            {currentStage === 1 && (
              <g transform="translate(250, 175)">
                <path d="M 0 0 Q -2 -10 0 -18" stroke="url(#stemGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
                <ellipse cx="-4" cy="-18" rx="6" ry="3" fill="url(#leafGrad)" transform="rotate(-30 -4 -18)" />
                <ellipse cx="4" cy="-20" rx="5" ry="2.5" fill="url(#leafGrad)" transform="rotate(30 4 -20)" />
              </g>
            )}

            {/* Stage 2 to 6: Growing Stem & Canopy */}
            {currentStage >= 2 && (
              <g transform="translate(250, 175)">
                
                {/* Main Stem */}
                <path
                  d={`M 0 0 Q ${Math.sin(currentStage) * 3} ${-stemHeight * 0.5} 0 ${-stemHeight}`}
                  stroke="url(#stemGrad)"
                  strokeWidth={3 + progressRatio * 4.5}
                  fill="none"
                  strokeLinecap="round"
                />

                {/* Alternating Foliage Leaves */}
                {/* Tier 1 Leaves */}
                <g transform={`translate(0, ${-stemHeight * 0.3}) scale(${leafScale})`}>
                  <path d="M 0 0 C -25 -10 -50 5 -75 25 C -50 35 -20 20 0 0" fill="url(#leafGrad)" />
                  <path d="M 0 0 C 25 -10 50 5 75 25 C 50 35 20 20 0 0" fill="url(#leafGrad)" />
                </g>

                {/* Tier 2 Leaves */}
                {currentStage >= 3 && (
                  <g transform={`translate(0, ${-stemHeight * 0.55}) scale(${leafScale * 0.95})`}>
                    <path d="M 0 0 C -30 -20 -60 -10 -85 10 C -55 25 -20 15 0 0" fill="url(#leafGrad)" />
                    <path d="M 0 0 C 30 -20 60 -10 85 10 C 55 25 20 15 0 0" fill="url(#leafGrad)" />
                  </g>
                )}

                {/* Tier 3 Upper Canopy Leaves */}
                {currentStage >= 4 && (
                  <g transform={`translate(0, ${-stemHeight * 0.8}) scale(${leafScale * 0.8})`}>
                    <path d="M 0 0 C -25 -30 -50 -25 -65 -5 C -45 10 -15 5 0 0" fill="url(#leafGrad)" />
                    <path d="M 0 0 C 25 -30 50 -25 65 -5 C 45 10 15 5 0 0" fill="url(#leafGrad)" />
                  </g>
                )}

                {/* Reproductive Flowers & Golden Tassels / Fruits */}
                {currentStage === 4 && (
                  /* Flowering Stage Tassel */
                  <g transform={`translate(0, ${-stemHeight})`}>
                    <path d="M 0 0 L -8 -16 M 0 0 L 0 -20 M 0 0 L 8 -16" stroke="url(#goldGrad)" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="0" cy="-22" r="3" fill="#FFE58F" />
                  </g>
                )}

                {/* Stage 5 & 6: Mature Golden Cobs / Ear Heads */}
                {currentStage >= 5 && (
                  <g transform={`translate(0, ${-stemHeight * 0.65})`}>
                    {/* Golden Ear / Cob Right */}
                    <g transform="translate(6, 0) rotate(25)">
                      <rect x="0" y="-18" width="10" height="24" rx="5" fill="url(#goldGrad)" />
                      <path d="M -2 -5 Q 6 12 12 -2" stroke="#168A45" strokeWidth="2" fill="none" />
                      {/* Silk threads */}
                      <path d="M 5 -18 Q 8 -26 12 -28 M 7 -18 Q 12 -24 16 -25" stroke="#D97706" strokeWidth="1" />
                    </g>

                    {/* Golden Ear Left (for full maturity stage 6) */}
                    {currentStage === 6 && (
                      <g transform="translate(-6, -10) rotate(-25)">
                        <rect x="-10" y="-18" width="10" height="24" rx="5" fill="url(#goldGrad)" />
                        <path d="M 2 -5 Q -6 12 -12 -2" stroke="#168A45" strokeWidth="2" fill="none" />
                      </g>
                    )}

                    {/* Top Tassel Mature */}
                    <g transform={`translate(0, ${-stemHeight * 0.35})`}>
                      <path d="M 0 0 L -10 -18 M 0 0 L 0 -22 M 0 0 L 10 -18" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  </g>
                )}

              </g>
            )}

          </g>

          {/* On-Canvas Telemetry HUD Overlays */}
          <g transform="translate(360, 20)">
            <rect x="0" y="0" width="125" height="52" rx="8" fill="#FFFFFF" fillOpacity="0.9" stroke="#CCE3D3" strokeWidth="1" />
            <text x="10" y="18" fill="#102A20" fontSize="10" fontWeight="700">
              Canopy Height
            </text>
            <text x="10" y="34" fill="#075C32" fontSize="14" fontWeight="800">
              {stage.heightCm} cm
            </text>
            <text x="10" y="45" fill="#667C70" fontSize="8" fontWeight="500">
              DAS: Day {stage.das}
            </text>
          </g>

          <g transform="translate(360, 225)">
            <rect x="0" y="0" width="125" height="52" rx="8" fill="#2C1B0F" fillOpacity="0.8" stroke="#856346" strokeWidth="1" />
            <text x="10" y="18" fill="#E8DEC8" fontSize="10" fontWeight="700">
              Root Penetration
            </text>
            <text x="10" y="34" fill="#78E69E" fontSize="14" fontWeight="800">
              {stage.rootDepthCm} cm
            </text>
            <text x="10" y="45" fill="#D2C3B0" fontSize="8" fontWeight="500">
              Moisture: {stage.waterDemand}
            </text>
          </g>

        </svg>

        {/* Floating Play / Pause Controls */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-[#CCE3D3] text-[#075C32] hover:bg-[#EEF7F0] font-bold text-[12px] shadow-sm transition-all"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-[#075C32]" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsPlaying(false);
              setCurrentStage(0);
            }}
            className="p-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-[#CCE3D3] text-[#55695F] hover:text-[#102A20] hover:bg-[#EEF7F0] shadow-sm transition-all"
            title="Reset to Sowing"
          >
            <RotateCcw size={14} />
          </button>
        </div>

      </div>

      {/* 7-Stage Interactive Scrubber Slider */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] font-bold text-[#102A20]">
            Stage {stage.index + 1} of 7: <span className="text-[#075C32]">{stage.name}</span>
          </span>
          <span className="text-[11.5px] font-semibold text-[#55695F] bg-[#EEF7F0] text-[#075C32] px-2 py-0.5 rounded-md">
            Day {stage.das} After Sowing
          </span>
        </div>

        {/* Step Buttons Row */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {STAGES.map((s, idx) => {
            const isActive = currentStage === idx;
            const isPassed = currentStage >= idx;

            return (
              <button
                key={s.shortName}
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStage(idx);
                }}
                className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#075C32] text-white border-[#075C32] shadow-sm scale-105'
                    : isPassed
                    ? 'bg-[#EEF7F0] text-[#075C32] border-[#C2DEC8] hover:bg-[#E2F2E5]'
                    : 'bg-white text-[#7A8F85] border-[#E1E8E4] hover:bg-[#F7FAF8]'
                }`}
              >
                <span className="text-[10px] sm:text-[11px] font-bold leading-tight truncate w-full text-center">
                  {s.shortName}
                </span>
                <span className={`text-[9px] mt-0.5 ${isActive ? 'text-white/80' : 'text-[#8A9C93]'}`}>
                  D{s.das}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Physiological Telemetry & Agronomic Action Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-[#F0F4F1]">
        
        {/* Card 1: Agronomic Description */}
        <div className="bg-[#FAFCFA] border border-[#E8EFEA] rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#102A20] mb-1">
              <Info size={14} className="text-[#075C32]" />
              <span>Morphological State</span>
            </div>
            <p className="text-[12px] text-[#4F6258] leading-relaxed">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Card 2: Nutrients & Water Dynamics */}
        <div className="bg-[#FAFCFA] border border-[#E8EFEA] rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#102A20] mb-1.5">
              <Droplets size={14} className="text-[#087A45]" />
              <span>Resource Demand</span>
            </div>
            <div className="space-y-1 text-[11.5px]">
              <div className="flex justify-between">
                <span className="text-[#607469]">Water Need:</span>
                <span className="font-bold text-[#075C32]">{stage.waterDemand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#607469]">Nitrogen (N):</span>
                <span className="font-bold text-[#102A20]">{stage.nitrogenDemand}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Prescriptive Agronomy Advisory */}
        <div className="bg-[#F3F9F4] border border-[#CDE5D4] rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#075C32] mb-1">
              <ShieldCheck size={14} className="text-[#075C32]" />
              <span>Prescriptive Action</span>
            </div>
            <p className="text-[12px] font-medium text-[#1E4D30] leading-snug">
              {stage.advisory}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
