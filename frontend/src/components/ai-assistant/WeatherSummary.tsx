"use client";

import React from 'react';
import Link from 'next/link';
import { CloudSun } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';
import { conditionIconLight } from '@/components/weather/conditionIcon';

export default function WeatherSummary() {
  const { weather, status } = useLiveWeather();
  const forecast = weather?.forecast || [];

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Weather Summary</h3>
        <Link 
          href="/weather" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View full forecast 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {status === 'loading' && (
        <p className="py-8 text-center text-[13px] text-[#607469]">Fetching live weather…</p>
      )}

      {status === 'unavailable' && (
        <p className="py-8 text-center text-[13px] text-[#607469]">
          Live weather unavailable — backend unreachable. No substitute readings are shown.
        </p>
      )}

      {status === 'live' && weather && (
        <>
          {/* Main Weather Metric */}
          <div className="flex items-center justify-between py-1 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
                {conditionIconLight(weather.condition, 22)}
              </div>
              <div>
                <div className="text-[24px] font-bold text-[#102A20] leading-none">
                  {weather.current_temp ?? '—'}°C
                </div>
                <div className="text-[12px] font-semibold text-[#52645D] mt-0.5">
                  {weather.condition}
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] font-medium text-[#52645D] space-y-0.5">
              <div className="font-bold text-[#102A20]">Farm Location</div>
              <div>Humidity: <span className="font-semibold text-[#102A20]">{weather.humidity ?? '—'}%</span></div>
              <div>Wind: <span className="font-semibold text-[#102A20]">{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : '—'}</span></div>
            </div>
          </div>

          {/* 7-Day Forecast Row */}
          <div className="grid grid-cols-5 gap-1 pt-3 border-t border-[#F0F4F1] text-center">
            {forecast.slice(0, 5).map((item) => (
              <div key={item.date} className="p-1 rounded-lg hover:bg-[#F9FBF9] transition-colors">
                <span className="text-[10px] font-bold text-[#52645D] block mb-1">{item.day}</span>
                <div className="flex justify-center mb-1">
                  {conditionIconLight(item.condition, 14)}
                </div>
                <div className="text-[10px] font-bold text-[#102A20]">{item.high ?? '—'}°</div>
                <div className="text-[9px] font-medium text-[#889B91]">{item.low ?? '—'}°</div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
