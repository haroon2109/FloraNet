"use client";

import React from 'react';
import { ChevronRight, Wind } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';
import { conditionIconLight } from '@/components/weather/conditionIcon';

export default function HourlyForecast() {
  const { weather, status } = useLiveWeather();
  const hourly = weather?.hourly || [];

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Hourly Forecast</h3>
        <button 
          type="button"
          aria-label="Scroll right"
          className="w-8 h-8 rounded-full border border-[#E1E7E3] flex items-center justify-center text-[#52645D] hover:text-[#102A20] hover:bg-[#F5F9F6] transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {status === 'loading' && (
        <p className="py-8 text-center text-[13px] text-[#607469]">Fetching live hourly telemetry…</p>
      )}

      {status === 'unavailable' && (
        <p className="py-8 text-center text-[13px] text-[#607469]">
          Live hourly forecast unavailable — backend unreachable. No substitute rows are shown.
        </p>
      )}

      {status === 'live' && (
        <>
          {/* Horizontal Scrollable Hourly Cards Row */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2.5 overflow-x-auto hide-scrollbar">
            {hourly.map((hf, idx) => (
              <div 
                key={hf.time}
                className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                  idx === 0 
                    ? 'bg-[#EAF5EC] border-[#C4E7D0] shadow-xs' 
                    : 'bg-[#FAFCFA] border-[#F0F4F1] hover:border-[#E1E7E3]'
                }`}
              >
                <span className={`text-[12px] font-bold ${idx === 0 ? 'text-[#168A45]' : 'text-[#52645D]'}`}>
                  {hf.time}
                </span>

                <div className="my-2.5">
                  {conditionIconLight(hf.condition)}
                </div>

                <div className="text-[15px] font-bold text-[#102A20] mb-0.5">{hf.temp_c ?? '—'}°C</div>
                
                <span className="text-[11px] font-semibold text-[#52645D] leading-tight mb-2 truncate w-full">
                  {hf.condition}
                </span>

                <div className="flex items-center gap-1 text-[10px] font-medium text-[#168A45]">
                  <Wind size={11} strokeWidth={2} />
                  <span>{hf.wind_kmh != null ? `${hf.wind_kmh} km/h` : '—'}</span>
                </div>
              </div>
            ))}
          </div>

          {hourly.length === 0 && (
            <p className="py-6 text-center text-[12px] text-[#889B91]">No hourly values in the live feed yet.</p>
          )}
        </>
      )}

    </div>
  );
}
