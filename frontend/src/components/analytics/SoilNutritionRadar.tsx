"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Sparkles, Satellite } from 'lucide-react';
import { fetchLiveSoil } from '@/services/farmApi';

export interface SoilAxis {
  label: string;
  key: string;
  currentValue: string;
  idealValue: string;
  score: number; // 0 to 100
  idealScore: number; // usually 90-100
  status: 'Optimal' | 'Mild Deficit' | 'Sufficient';
  recommendation: string;
}

const EMPTY_AXES: SoilAxis[] = [];

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/** Build the 6 radar axes from LIVE SoilGrids + Open-Meteo values. */
function buildAxes(live: {
  soilgrids?: {
    ph?: number;
    nitrogen_percent?: number;
    soc_percent?: number;
    clay_g_kg?: number;
    sand_g_kg?: number;
    data_gap?: boolean;
    texture_class?: string;
  };
  layers?: Record<string, { moisture_pct?: number }>;
}): SoilAxis[] {
  const sg = live?.soilgrids || {};
  const layers = live?.layers || {};
  const axes: SoilAxis[] = [];
  const gap: string = sg.data_gap ? ' (SoilGrids gap at this cell)' : '';

  // pH (real: SoilGrids phh2o)
  const ph = sg.ph as number | undefined;
  axes.push({
    label: 'Soil pH',
    key: 'ph',
    currentValue: ph != null ? `${ph} pH` : `No data${gap || ''}`,
    idealValue: '6.0 - 7.5 pH',
    score: ph != null ? clamp(100 - Math.abs(ph - 6.75) * 33) : 0,
    idealScore: 95,
    status: ph != null ? (Math.abs(ph - 6.75) <= 0.75 ? 'Optimal' : 'Mild Deficit') : 'Mild Deficit',
    recommendation: ph != null
      ? (Math.abs(ph - 6.75) <= 0.75
        ? 'Soil reaction is near neutral — good microbial nutrient assimilation (ISRIC SoilGrids).'
        : ph < 6.0 ? 'Acidic soil: consider lime per local ICAR/Embrapa/ARC guidance (SoilGrids pH).' : 'Alkaline soil: gypsum/organic matter can help (SoilGrids pH).')
      : 'SoilGrids has no pH value for this cell — no substitute value is shown.',
  });

  // Nitrogen (real: SoilGrids nitrogen, cg/kg → %)
  const n = sg.nitrogen_percent as number | undefined;
  axes.push({
    label: 'Nitrogen (N)',
    key: 'n',
    currentValue: n != null ? `${n}% (0-5cm)` : `No data${gap || ''}`,
    idealValue: '0.15 - 0.25%',
    score: n != null ? clamp((n / 0.2) * 100) : 0,
    idealScore: 90,
    status: n != null ? (n >= 0.15 ? 'Sufficient' : 'Mild Deficit') : 'Mild Deficit',
    recommendation: n != null
      ? (n >= 0.15 ? 'Total N is within the typical fertile topsoil band (ISRIC SoilGrids).' : 'Below typical fertile band — legume cover crops can help (SoilGrids N).')
      : 'SoilGrids has no N value for this cell — no substitute value is shown.',
  });

  // SOC (real: SoilGrids soc, dg/kg → %)
  const soc = sg.soc_percent as number | undefined;
  axes.push({
    label: 'Organic Carbon',
    key: 'soc',
    currentValue: soc != null ? `${soc}% (0-5cm)` : `No data${gap || ''}`,
    idealValue: '≥ 2.0%',
    score: soc != null ? clamp((soc / 2) * 100) : 0,
    idealScore: 100,
    status: soc != null ? (soc >= 1.5 ? 'Sufficient' : 'Mild Deficit') : 'Mild Deficit',
    recommendation: soc != null
      ? (soc >= 1.5 ? 'Healthy topsoil SOC (ISRIC SoilGrids) — maintain residue retention.' : 'Low SOC: compost / cover cropping recommended (SoilGrids SOC).')
      : 'SoilGrids has no SOC value for this cell — no substitute value is shown.',
  });

  // Moisture (real: Open-Meteo 0-1cm)
  const moist = layers['0_1cm']?.moisture_pct as number | undefined;
  axes.push({
    label: 'Moisture (VWC)',
    key: 'vwc',
    currentValue: moist != null ? `${moist}%` : 'No data',
    idealValue: '25 - 45%',
    score: moist != null ? clamp(100 - Math.abs(moist - 35) * 2.5) : 0,
    idealScore: 95,
    status: moist != null ? (moist >= 25 && moist <= 45 ? 'Optimal' : 'Mild Deficit') : 'Mild Deficit',
    recommendation: moist != null
      ? (moist >= 25 && moist <= 45 ? 'Root-zone moisture within the transpiration envelope (Open-Meteo live).' : moist < 25 ? 'Below envelope — irrigation likely needed (Open-Meteo live).' : 'Above envelope — pause irrigation (Open-Meteo live).')
      : 'Open-Meteo moisture unavailable — no substitute value is shown.',
  });

  // Clay (real: SoilGrids clay g/kg → %)
  const clay = sg.clay_g_kg as number | undefined;
  axes.push({
    label: 'Clay Content',
    key: 'clay',
    currentValue: clay != null ? `${(clay / 10).toFixed(1)}%` : `No data${gap || ''}`,
    idealValue: '20 - 45%',
    score: clay != null ? clamp(100 - Math.abs(clay / 10 - 32) * 2) : 0,
    idealScore: 90,
    status: clay != null ? 'Sufficient' : 'Mild Deficit',
    recommendation: clay != null
      ? `Texture driven by real SoilGrids particle-size data (${sg.texture_class ?? 'classified'}).`
      : 'SoilGrids has no clay value for this cell — no substitute value is shown.',
  });

  // Sand (real: SoilGrids sand g/kg → %)
  const sand = sg.sand_g_kg as number | undefined;
  axes.push({
    label: 'Sand Content',
    key: 'sand',
    currentValue: sand != null ? `${(sand / 10).toFixed(1)}%` : `No data${gap || ''}`,
    idealValue: '30 - 60%',
    score: sand != null ? clamp(100 - Math.abs(sand / 10 - 45) * 1.5) : 0,
    idealScore: 90,
    status: sand != null ? 'Sufficient' : 'Mild Deficit',
    recommendation: sand != null
      ? `Sandy fraction from ISRIC SoilGrids — drainage implications per ${sg.texture_class ?? 'texture class'}.`
      : 'SoilGrids has no sand value for this cell — no substitute value is shown.',
  });

  return axes;
}

export default function SoilNutritionRadar({
  cropName = 'Maize (benchmark coordinates)',
}: {
  cropName?: string;
}) {
  // Math coordinates for 6-axis hexagonal radar (center 150, 150, radius 105)
  const cx = 160;
  const cy = 150;
  const maxR = 100;
  const numAxes = 6;

  const getPoint = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 / numAxes) * index - Math.PI / 2;
    const r = maxR * (valueRatio / 100);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Live data state
  const [axes, setAxes] = useState<SoilAxis[]>(EMPTY_AXES);
  const [status, setStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');

  useEffect(() => {
    let mounted = true;
    fetchLiveSoil(18.5204, 73.8567).then((live) => {
      if (!mounted) return;
      if (live && (live.layers || live.soilgrids)) {
        const built = buildAxes(live);
        setAxes(built);
        setStatus(built.some((a) => !a.currentValue.startsWith('No data')) ? 'live' : 'unavailable');
      } else {
        setStatus('unavailable');
      }
    });
    return () => { mounted = false; };
  }, []);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selectedAxis = useMemo(
    () => axes.find((a) => a.key === selectedKey) || axes[1] || axes[0] || null,
    [axes, selectedKey]
  );
  const setSelectedAxis = (axis: SoilAxis) => setSelectedKey(axis.key);

  if (status === 'loading') {
    return (
      <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-10 text-center mb-6">
        <Satellite size={26} className="mx-auto text-[#075C32] mb-2" />
        <p className="text-[13px] font-bold text-[#102A20]">Fetching live ISRIC SoilGrids + Open-Meteo values…</p>
      </div>
    );
  }

  if (status === 'unavailable' || axes.length === 0) {
    return (
      <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-10 text-center mb-6">
        <AlertCircle size={26} className="mx-auto text-amber-500 mb-2" />
        <p className="text-[13px] font-bold text-[#102A20]">Live soil data unavailable</p>
        <p className="text-[12px] text-[#607469] mt-1">
          Backend /api/v1/soil/live unreachable. No synthetic soil values are shown.
        </p>
      </div>
    );
  }

  // Generate polygon points (from LIVE axes)
  const currentPoints = axes.map((axis, i) => getPoint(i, axis.score));
  const idealPoints = axes.map((axis, i) => getPoint(i, axis.idealScore));

  const currentPolygonStr = currentPoints.map((p) => `${p.x},${p.y}`).join(' ');
  const idealPolygonStr = idealPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [25, 50, 75, 100];

  return (
    <div className="w-full bg-white border border-[#E1E8E4] rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#F0F4F1]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#075C32]" />
            <h3 className="text-[16.5px] font-bold text-[#102A20]">
              6-Axis Soil Nutrition Radar Matrix
            </h3>
          </div>
          <p className="text-[12px] text-[#55695F] mt-0.5">
            Real-time soil chemistry envelope vs ideal agronomic target for {cropName}
          </p>
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center gap-3 bg-[#F6FAF7] px-3 py-1.5 rounded-xl border border-[#DCE8DF] text-[11.5px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#075C32] border border-white" />
            <span className="text-[#102A20]">Current Field Level</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#CDE5D5] border border-[#168A45]" />
            <span className="text-[#55695F]">Ideal Target Envelope</span>
          </div>
        </div>
      </div>

      {/* Grid: Left SVG Radar (6 cols) & Right Telemetry Inspector (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* SVG Radar Chart */}
        <div className="lg:col-span-6 relative flex items-center justify-center bg-[#FAFCFA] rounded-xl border border-[#E8EFEA] p-2">
          <svg viewBox="0 0 320 300" className="w-full max-w-[340px] h-auto overflow-visible">
            
            {/* Concentric Hexagonal Grids */}
            {gridLevels.map((lvl) => {
              const pts = Array.from({ length: 6 }).map((_, i) => getPoint(i, lvl));
              const ptsStr = pts.map((p) => `${p.x},${p.y}`).join(' ');
              return (
                <polygon
                  key={lvl}
                  points={ptsStr}
                  fill="none"
                  stroke="#D8E5DC"
                  strokeWidth="1"
                  strokeDasharray={lvl === 100 ? 'none' : '3,3'}
                />
              );
            })}

            {/* 6 Radiating Axis Lines */}
            {Array.from({ length: 6 }).map((_, i) => {
              const p = getPoint(i, 100);
              return (
                <line
                  key={i}
                  x1={cx}
                  y1={cy}
                  x2={p.x}
                  y2={p.y}
                  stroke="#D0DFD5"
                  strokeWidth="1"
                />
              );
            })}

            {/* Ideal Target Polygon (Dashed Green) */}
            <polygon
              points={idealPolygonStr}
              fill="#168A45"
              fillOpacity="0.08"
              stroke="#168A45"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />

            {/* Current Field Level Polygon (FloraNet Deep Emerald) */}
            <polygon
              points={currentPolygonStr}
              fill="#075C32"
              fillOpacity="0.25"
              stroke="#075C32"
              strokeWidth="2.5"
            />

            {/* Active Data Point Nodes on Vertices */}
            {axes.map((axis, i) => {
              const pt = currentPoints[i];
              const isSelected = selectedAxis.key === axis.key;

              return (
                <g key={axis.key} onClick={() => setSelectedAxis(axis)} className="cursor-pointer group">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isSelected ? 6.5 : 4.5}
                    fill={isSelected ? '#075C32' : '#168A45'}
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="transition-all group-hover:scale-125"
                  />
                </g>
              );
            })}

            {/* Axis Label Tags positioned around perimeter */}
            {axes.map((axis, i) => {
              const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
              const r = maxR + 24;
              const lx = cx + r * Math.cos(angle);
              const ly = cy + r * Math.sin(angle);
              const isSelected = selectedAxis.key === axis.key;

              return (
                <text
                  key={axis.key}
                  x={lx}
                  y={ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  onClick={() => setSelectedAxis(axis)}
                  className={`text-[10.5px] font-bold cursor-pointer transition-all ${
                    isSelected
                      ? 'fill-[#075C32] font-extrabold text-[11.5px]'
                      : 'fill-[#506359] hover:fill-[#102A20]'
                  }`}
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Right Inspector & Soil Prescription Panel */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          
          {/* Selected Axis Detail Box */}
          <div className="bg-[#F8FAF8] border border-[#DDE8E0] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6A7E74]">
                Parameter In Focus
              </span>
              <span
                className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                  selectedAxis.status === 'Optimal'
                    ? 'bg-[#EAF6EE] text-[#075C32]'
                    : 'bg-[#FEF9C3] text-[#854D0E]'
                }`}
              >
                {selectedAxis.status}
              </span>
            </div>

            <h4 className="text-[18px] font-extrabold text-[#102A20] mb-1">
              {selectedAxis.label}
            </h4>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="bg-white p-2.5 rounded-lg border border-[#E3ECE6]">
                <span className="text-[10.5px] text-[#6A7E74] block">Tested Level</span>
                <span className="text-[15px] font-bold text-[#075C32]">
                  {selectedAxis.currentValue}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-[#E3ECE6]">
                <span className="text-[10.5px] text-[#6A7E74] block">Ideal Envelope</span>
                <span className="text-[15px] font-bold text-[#102A20]">
                  {selectedAxis.idealValue}
                </span>
              </div>
            </div>

            {/* Prescriptive Advisory */}
            <div className="bg-white border border-[#D5E5DA] rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#075C32] mb-1">
                <Sparkles size={13} />
                <span>Agronomic Action</span>
              </div>
              <p className="text-[12px] text-[#4A5E53] leading-relaxed">
                {selectedAxis.recommendation}
              </p>
            </div>
          </div>

          {/* Quick 6-Parameter Summary Strip */}
          <div className="grid grid-cols-3 gap-2">
            {axes.map((axis) => {
              const isSel = selectedAxis.key === axis.key;
              return (
                <button
                  key={axis.key}
                  type="button"
                  onClick={() => setSelectedAxis(axis)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isSel
                      ? 'bg-[#075C32] text-white border-[#075C32] shadow-xs'
                      : 'bg-white text-[#4A5E53] border-[#E1E8E4] hover:bg-[#F6FAF7]'
                  }`}
                >
                  <span className={`text-[10px] block font-bold truncate ${isSel ? 'text-white/80' : 'text-[#7C8E84]'}`}>
                    {axis.label}
                  </span>
                  <span className="text-[12px] font-extrabold leading-tight">
                    {axis.currentValue}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
