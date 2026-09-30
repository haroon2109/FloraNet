"use client";

import React from 'react';
import { Sunrise, Sunset, Compass, Moon } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';

export default function EnvironmentWidgets() {
  const { weather, status } = useLiveWeather();

  const fmtLocalTime = (iso?: string | null) => {
    if (!iso) return '—';
    // Open-Meteo returns "2026-09-26T06:12" local — show just the time part.
    const t = iso.split('T')[1];
    return t ? t.slice(0, 5) : iso;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      
      {/* Widget 1: Sunrise & Sunset */}
      <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col justify-between">
        <h4 className="text-[13px] font-bold text-[#102A20] mb-2">Sunrise &amp; Sunset</h4>
        
        <div className="flex items-center justify-around py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center border border-[#FCE8B2] shrink-0">
              <Sunrise size={18} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#52645D] block">Sunrise</span>
              <span className="text-[14px] font-bold text-[#102A20]">
                {status === 'live' ? fmtLocalTime(weather?.sunrise) : '—'}
              </span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-[#E1E7E3]" />

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center border border-[#FCE8B2] shrink-0">
              <Sunset size={18} strokeWidth={2.2} />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-[#52645D] block">Sunset</span>
              <span className="text-[14px] font-bold text-[#102A20]">
                {status === 'live' ? fmtLocalTime(weather?.sunset) : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Widget 2: Wind Direction */}
      <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex items-center justify-between">
        <div>
          <h4 className="text-[13px] font-bold text-[#102A20] mb-1">Wind Direction</h4>
          <div className="text-[15px] font-bold text-[#102A20]">
            {status === 'live' ? (weather?.wind_direction ?? '—') : '—'}
          </div>
          <div className="text-[12px] font-medium text-[#52645D]">
            {status === 'live' && weather?.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : '—'}
          </div>
        </div>

        {/* Circular Compass Visual */}
        <div className="relative w-12 h-12 rounded-full border-2 border-[#E1E7E3] bg-[#F9FBF9] flex items-center justify-center shrink-0">
          <Compass size={22} className="text-[#168A45] transform -rotate-45" strokeWidth={2} />
          <span className="absolute top-0.5 text-[9px] font-bold text-[#52645D]">N</span>
        </div>
      </div>

      {/* Widget 3: Moon Phase */}
      <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#102A20] text-[#FDE047] flex items-center justify-center shrink-0 border border-[#2F5441]">
          <Moon size={20} strokeWidth={2.2} fill="#FDE047" fillOpacity={0.2} />
        </div>
        
        <div>
          <h4 className="text-[13px] font-bold text-[#102A20] mb-0.5">Moon Phase</h4>
          <div className="text-[13px] font-bold text-[#168A45]">
            {status === 'live' ? (weather?.moon_phase?.name ?? '—') : '—'}
          </div>
          <div className="text-[11px] font-medium text-[#52645D]">
            {status === 'live' && weather?.moon_phase ? `${weather.moon_phase.illumination_pct}% Illuminated` : '—'}
          </div>
        </div>
      </div>

    </div>
  );
}
