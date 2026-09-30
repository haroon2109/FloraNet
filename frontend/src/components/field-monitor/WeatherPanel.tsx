"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, CloudSun, Compass, Droplets } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';
import { conditionIcon } from '@/components/weather/conditionIcon';

export default function WeatherPanel() {
  const { weather, status } = useLiveWeather();
  const forecast = weather?.forecast || [];

  return (
    <div className="bg-[#075C32] rounded-[20px] p-5 text-white shadow-[0_6px_25px_rgba(7,92,50,0.15)] mb-5 relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-white tracking-tight">Weather Overview</h3>
        <div className="flex items-center gap-1 opacity-90 text-[12px] font-medium">
          <MapPin size={14} className="text-white shrink-0" />
          <span>Farm Location</span>
        </div>
      </div>

      {status === 'loading' && (
        <div className="py-14 flex items-center justify-center gap-3 text-emerald-100 text-[13px]">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-200" />
          Fetching live Open-Meteo telemetry…
        </div>
      )}

      {status === 'unavailable' && (
        <div className="py-14 text-center">
          <CloudSun size={28} className="mx-auto text-emerald-300/70 mb-2" />
          <p className="text-[13px] font-bold text-emerald-100">Live weather unavailable</p>
          <p className="text-[11.5px] text-emerald-300/80 mt-1">
            Backend /api/v1/farm/weather-telemetry unreachable. No substitute readings are shown.
          </p>
        </div>
      )}

      {status === 'live' && weather && (
        <>
          {/* Main Temperature Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                {conditionIcon(weather.condition, 42)}
                <div className="flex items-baseline">
                  <span className="text-[40px] font-bold leading-none tracking-tight">{weather.current_temp}</span>
                  <span className="text-[22px] font-medium ml-0.5">°C</span>
                </div>
              </div>
              
              <div className="mt-2.5">
                <p className="text-[15px] font-semibold leading-snug">{weather.condition}</p>
                <p className="text-[12px] opacity-80 mt-0.5">Feels like {weather.feels_like ?? '—'}°C</p>
              </div>
            </div>

            {/* Side Metrics */}
            <div className="flex flex-col gap-1.5 text-[12px] opacity-90 pt-1 shrink-0">
              <div className="flex justify-between w-[110px] border-b border-white/10 pb-1">
                <span className="opacity-80">Humidity</span>
                <span className="font-semibold">{weather.humidity ?? '—'}%</span>
              </div>
              <div className="flex justify-between w-[110px] border-b border-white/10 pb-1">
                <span className="opacity-80">Wind</span>
                <span className="font-semibold">{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : '—'}</span>
              </div>
              <div className="flex justify-between w-[110px] pb-1">
                <span className="opacity-80">Rain Chance</span>
                <span className="font-semibold">
                  {forecast[0]?.rain_pct != null ? `${forecast[0].rain_pct}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Row */}
          <div className="flex justify-between items-center my-4 px-0.5 border-t border-white/15 pt-4">
            {forecast.slice(0, 7).map((fc) => (
              <div key={fc.date} className="flex flex-col items-center gap-1">
                <span className="text-[12px] font-medium opacity-85">{fc.day}</span>
                <div className="my-0.5">
                  {conditionIcon(fc.condition)}
                </div>
                <span className="text-[11px] font-semibold">
                  {fc.high ?? '—'}°<span className="opacity-70 font-normal">/{fc.low ?? '—'}°</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Full Forecast Action */}
      <Link 
        href="/weather" 
        className="text-[12px] font-semibold text-white/95 hover:text-white transition-colors inline-flex items-center gap-1 pt-1 group"
      >
        View full forecast 
        <span className="text-[13px] group-hover:translate-x-1 transition-transform">→</span>
      </Link>

    </div>
  );
}
