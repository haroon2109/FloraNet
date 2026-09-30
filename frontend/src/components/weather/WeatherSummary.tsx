"use client";

import React from 'react';
import { Thermometer, CloudRain, Wind, Droplets } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';

export default function WeatherSummary() {
  const { weather, status } = useLiveWeather();
  const past = weather?.past7_days || [];

  // Averages computed from the real observed past-7-day series only.
  const temps = past.flatMap((d) => [d.max_temp_c, d.min_temp_c]).filter((v): v is number => v != null);
  const rain = past.map((d) => d.rainfall_mm).filter((v): v is number => v != null);
  const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : null;
  const totalRain = rain.length > 0 ? rain.reduce((a, b) => a + b, 0) : null;
  const avgWind = weather?.wind_speed_kmh ?? null;
  const humidity = weather?.humidity ?? null;

  const fmt = (v: number | null, digits = 1, unit = '') =>
    v != null ? `${v.toFixed(digits)}${unit}` : '—';

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col justify-between h-full min-h-[300px]">
      
      {/* Header */}
      <h3 className="text-[16px] font-bold text-[#102A20] mb-3 shrink-0">Weather Summary</h3>

      {status === 'loading' && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">Fetching live summary…</p>
      )}

      {status === 'unavailable' && (
        <p className="flex-1 flex items-center justify-center text-[13px] text-[#607469]">
          Live summary unavailable — backend unreachable. No substitute figures are shown.
        </p>
      )}

      {status === 'live' && (
        <>
          {/* 2x2 Grid with Dividers */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            
            {/* Metric 1: Temperature */}
            <div className="p-3 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
                  <Thermometer size={17} strokeWidth={2.2} />
                </div>
                <h4 className="text-[12px] font-semibold text-[#52645D]">Temperature (Avg.)</h4>
              </div>
              <div>
                <div className="text-[22px] font-bold text-[#102A20] leading-none mb-1">{fmt(avgTemp, 1, '°C')}</div>
                <span className="text-[11px] font-semibold text-[#889B91]">Observed past 7 days</span>
              </div>
            </div>

            {/* Metric 2: Rainfall */}
            <div className="p-3 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
                  <CloudRain size={17} strokeWidth={2.2} />
                </div>
                <h4 className="text-[12px] font-semibold text-[#52645D]">Rainfall</h4>
              </div>
              <div>
                <div className="text-[22px] font-bold text-[#102A20] leading-none mb-1">{fmt(totalRain, 1, ' mm')}</div>
                <span className="text-[11px] font-semibold text-[#889B91]">Observed past 7 days</span>
              </div>
            </div>

            {/* Metric 3: Wind Speed */}
            <div className="p-3 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
                  <Wind size={17} strokeWidth={2.2} />
                </div>
                <h4 className="text-[12px] font-semibold text-[#52645D]">Wind Speed (Now)</h4>
              </div>
              <div>
                <div className="text-[22px] font-bold text-[#102A20] leading-none mb-1">{fmt(avgWind, 0, ' km/h')}</div>
                <span className="text-[11px] font-semibold text-[#889B91]">Live current reading</span>
              </div>
            </div>

            {/* Metric 4: Relative Humidity */}
            <div className="p-3 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
                  <Droplets size={17} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
                </div>
                <h4 className="text-[12px] font-semibold text-[#52645D]">Relative Humidity (Now)</h4>
              </div>
              <div>
                <div className="text-[22px] font-bold text-[#102A20] leading-none mb-1">{fmt(humidity, 0, '%')}</div>
                <span className="text-[11px] font-semibold text-[#889B91]">Live current reading</span>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
