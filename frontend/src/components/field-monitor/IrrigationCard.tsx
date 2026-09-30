"use client";

import React from 'react';
import { Droplets, ArrowRight, CloudSun } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';

/**
 * Irrigation status derived from the REAL top-soil moisture reading
 * (Open-Meteo via backend). No hardcoded schedule or percentages —
 * when telemetry is unreachable the card says so instead of guessing.
 */
export default function IrrigationCard() {
  const { weather, status } = useLiveWeather();
  const moisture = weather?.soil_moisture_pct ?? null;

  // Deterministic agronomic thresholds applied to the live reading.
  const efficiencyPct =
    moisture == null ? null : moisture < 15 ? 25 : moisture < 25 ? 55 : moisture < 35 ? 75 : 90;
  const efficiencyLabel =
    moisture == null ? null : moisture < 15 ? 'Critical' : moisture < 25 ? 'Low' : moisture < 35 ? 'Good' : 'Optimal';
  const waterRequiredMm =
    moisture == null ? null : Math.max(0, Math.round((35 - moisture) * 0.8));

  return (
    <div className="bg-white border border-[#E2E9E5] rounded-[20px] p-6 shadow-[0_4px_18px_rgba(20,60,40,0.04)] h-full flex flex-col">
      <h2 className="text-[15px] font-semibold text-[#102A2A] mb-5">Irrigation Status</h2>

      {status === 'loading' && (
        <p className="py-10 text-center text-[13px] text-[#647474]">Fetching live soil moisture…</p>
      )}

      {status === 'unavailable' && (
        <div className="py-10 text-center flex-1 flex flex-col items-center justify-center">
          <CloudSun size={28} className="mx-auto text-[#889B91] mb-2" />
          <p className="text-[13px] font-bold text-[#102A2A]">Live telemetry unavailable</p>
          <p className="text-[11.5px] text-[#647474] mt-1">
            Backend soil-moisture feed unreachable — no substitute schedule is shown.
          </p>
        </div>
      )}

      {status === 'live' && moisture != null && (
        <>
          <div className="flex items-center gap-6 flex-1">
            
            {/* Half Circle Gauge */}
            <div className="relative w-[120px] h-[60px] mx-auto overflow-hidden">
              <svg className="absolute w-[120px] h-[120px]" viewBox="0 0 100 100">
                {/* Background Arch */}
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2E9E5" strokeWidth="12" strokeLinecap="round" />
                {/* Value Arch */}
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#087A45" strokeWidth="12" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={`${125.6 - (125.6 * (efficiencyPct ?? 0) / 100)}`} />
              </svg>
              <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end h-full">
                <Droplets size={24} className="text-[#087A45] mb-1" />
                <span className="text-[24px] font-bold text-[#102A2A] leading-none mb-2 absolute -bottom-6">{efficiencyPct}%</span>
              </div>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#647474] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#E2E9E5]"></div>Soil Moisture (Live)</span>
                <span className="text-[13px] font-semibold text-[#102A2A]">{moisture}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#647474] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#4D9DE0]"></div>Water Required</span>
                <span className="text-[13px] font-semibold text-[#102A2A]">{waterRequiredMm} mm</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-[#647474] flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#087A45]"></div>Reading Source</span>
                <span className="text-[13px] font-semibold text-[#102A2A]">Open-Meteo live</span>
              </div>
            </div>

          </div>

          <div className="text-center mt-6 mb-4">
            <span className="text-[11px] text-[#647474]">Irrigation Efficiency</span>
            <div className="text-[13px] font-bold text-[#087A45] mt-1">{efficiencyLabel}</div>
          </div>
        </>
      )}

      <button className="mt-auto w-full py-2 bg-white border border-[#087A45]/30 rounded-lg text-[13px] font-semibold text-[#087A45] hover:bg-[#EAF6EE] transition-colors flex items-center justify-center gap-2">
        Irrigation Schedule <ArrowRight size={14} />
      </button>
    </div>
  );
}
