"use client";

import React, { useEffect, useState } from 'react';
import { Sprout, Droplets, Thermometer } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { fetchFarmMetrics } from '@/services/farmApi';

interface FarmMetrics {
  soil_moisture_pct?: number | null;
  soil_temp_c?: number | null;
  ambient_temp_c?: number | null;
  soil?: { soc_percent?: number | null };
}

/**
 * Crop field metrics — LIVE backend readings only (Open-Meteo soil
 * moisture/temperature + SoilGrids). Plant height / LAI require in-field
 * sensors or imagery analysis and render an honest "needs sensor" state
 * rather than a made-up number.
 */
export default function CropMetrics() {
  const { userProfile, liveMetrics } = useFarm();
  const [metrics, setMetrics] = useState<FarmMetrics | null>(liveMetrics ?? null);

  useEffect(() => {
    if (metrics) return; // reuse context data when present
    let mounted = true;
    const coords = userProfile.defaultCoordinates;
    fetchFarmMetrics(coords?.lat, coords?.lng).then((data) => {
      if (mounted && data) setMetrics(data as FarmMetrics);
    });
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile.defaultCoordinates]);

  const moisture = typeof metrics?.soil_moisture_pct === 'number' ? metrics.soil_moisture_pct : null;
  const soilTemp = typeof metrics?.soil_temp_c === 'number' ? metrics.soil_temp_c : null;
  const ambient = typeof metrics?.ambient_temp_c === 'number' ? metrics.ambient_temp_c : null;
  const soc = typeof metrics?.soil?.soc_percent === 'number' ? metrics.soil.soc_percent : null;

  const fmt = (v: number | null, digits = 1, suffix = '') =>
    v != null ? `${v.toFixed(digits)}${suffix}` : '—';

  const needsSensor = (label: string) => (
    <div className="p-4 bg-white border border-[#E1E8E4] rounded-2xl shadow-[0_2px_10px_rgba(20,60,40,0.03)] flex items-center justify-between">
      <div>
        <span className="text-[11px] font-bold text-[#889B91] uppercase tracking-wider block mb-1">{label}</span>
        <div className="text-[16px] font-bold text-[#889B91] leading-tight mb-1">Needs sensor</div>
        <span className="text-[11px] font-semibold text-[#889B91]">Not remotely observable</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-[#F0F4F1] text-[#889B91] flex items-center justify-center shrink-0 border border-[#E1E8E4]">
        <Sprout size={18} strokeWidth={2.2} />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      
      {/* Metric 1: Plant Height — needs in-field measurement */}
      {needsSensor('Plant Height')}

      {/* Metric 2: Leaf Area Index — needs imagery analysis */}
      {needsSensor('Leaf Area Index')}

      {/* Metric 3: Soil Moisture (live) */}
      <div className="p-4 bg-white border border-[#E1E8E4] rounded-2xl shadow-[0_2px_10px_rgba(20,60,40,0.03)] flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#889B91] uppercase tracking-wider block mb-1">Soil Moisture</span>
          <div className="text-[20px] font-bold text-[#102A2A] leading-tight mb-1">{fmt(moisture, 1, '%')}</div>
          <span className="text-[11px] font-semibold text-[#087A45]">Open-Meteo 0–1cm</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
          <Droplets size={18} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
        </div>
      </div>

      {/* Metric 4: Soil Temperature (live) */}
      <div className="p-4 bg-white border border-[#E1E8E4] rounded-2xl shadow-[0_2px_10px_rgba(20,60,40,0.03)] flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-[#889B91] uppercase tracking-wider block mb-1">Soil Temp</span>
          <div className="text-[20px] font-bold text-[#102A2A] leading-tight mb-1">{fmt(soilTemp, 1, '°C')}</div>
          <span className="text-[11px] font-semibold text-[#087A45]">Air {fmt(ambient, 0, '°C')} · SOC {fmt(soc, 1, '%')}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
          <Thermometer size={18} strokeWidth={2.2} />
        </div>
      </div>

    </div>
  );
}
