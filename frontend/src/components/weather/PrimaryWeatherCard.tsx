"use client";

import React from 'react';
import Link from 'next/link';
import { MapPin, Compass, Droplets, SunMedium, CloudSun } from 'lucide-react';
import { useLiveWeather } from '@/hooks/useLiveWeather';
import { conditionIcon } from '@/components/weather/conditionIcon';

export default function PrimaryWeatherCard() {
  const { weather, status } = useLiveWeather();
  const forecast = weather?.forecast || [];

  return (
    <div className="bg-[#075C32] rounded-[20px] p-5 text-white shadow-[0_6px_25px_rgba(7,92,50,0.15)] flex flex-col justify-between h-full min-h-[300px] relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 opacity-90 text-[13px] font-semibold">
          <MapPin size={15} className="text-white shrink-0" />
          <span>Farm Location</span>
        </div>
        {status === 'live' && weather?.observed_at && (
          <span className="text-[11px] opacity-75 font-medium">Observed {weather.observed_at.slice(11, 16)}</span>
        )}
      </div>

      {status === 'loading' && (
        <div className="py-16 flex items-center justify-center gap-3 text-emerald-100 text-[13px]">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-200" />
          Fetching live Open-Meteo telemetry…
        </div>
      )}

      {status === 'unavailable' && (
        <div className="py-16 text-center">
          <CloudSun size={30} className="mx-auto text-emerald-300/70 mb-2" />
          <p className="text-[13px] font-bold text-emerald-100">Live weather unavailable</p>
          <p className="text-[11.5px] text-emerald-300/80 mt-1">
            Backend /api/v1/farm/weather-telemetry unreachable. No substitute readings are shown.
          </p>
        </div>
      )}

      {status === 'live' && weather && (
        <>
          {/* Main Temperature & Right Metrics */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {conditionIcon(weather.condition, 46)}
                <div className="flex items-baseline">
                  <span className="text-[44px] sm:text-[48px] font-bold leading-none tracking-tight">{weather.current_temp}</span>
                  <span className="text-[24px] font-medium ml-0.5">°C</span>
                </div>
              </div>
              
              <div className="mt-2.5">
                <p className="text-[16px] font-bold leading-snug">{weather.condition}</p>
                <p className="text-[12px] opacity-80 mt-0.5">Feels like {weather.feels_like ?? '—'}°C</p>
              </div>
            </div>

            {/* Right Metrics Grid */}
            <div className="flex flex-col gap-2 text-[12px] opacity-90 pt-1 shrink-0">
              <div className="flex justify-between items-center w-[130px] border-b border-white/15 pb-1">
                <span className="flex items-center gap-1.5 opacity-80">
                  <Droplets size={13} className="text-[#93C5FD]" />
                  Humidity
                </span>
                <span className="font-bold">{weather.humidity ?? '—'}%</span>
              </div>

              <div className="flex justify-between items-center w-[130px] border-b border-white/15 pb-1">
                <span className="flex items-center gap-1.5 opacity-80">
                  <Compass size={13} className="text-white" />
                  Wind
                </span>
                <span className="font-bold">{weather.wind_speed_kmh != null ? `${weather.wind_speed_kmh} km/h` : '—'}</span>
              </div>

              <div className="flex justify-between items-center w-[130px] border-b border-white/15 pb-1">
                <span className="flex items-center gap-1.5 opacity-80">
                  <CloudRainFallback />
                  Rain Chance
                </span>
                <span className="font-bold">
                  {forecast[0]?.rain_pct != null ? `${forecast[0].rain_pct}%` : '—'}
                </span>
              </div>

              <div className="flex justify-between items-center w-[130px] pb-0.5">
                <span className="flex items-center gap-1.5 opacity-80">
                  <SunMedium size={13} className="text-[#FDE047]" />
                  UV Index
                </span>
                <span className="font-bold">{weather.uv_label ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast Row */}
          <div className="flex justify-between items-center my-3 px-1 border-t border-white/15 pt-3.5">
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

      {/* Bottom Link Action */}
      <Link 
        href="/weather/forecast" 
        className="text-[12px] font-semibold text-white/95 hover:text-white transition-colors inline-flex items-center gap-1 pt-1 group"
      >
        View full forecast 
        <span className="text-[13px] group-hover:translate-x-1 transition-transform">→</span>
      </Link>

    </div>
  );
}

function CloudRainFallback() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M16 14v6" />
      <path d="M8 14v6" />
      <path d="M12 16v6" />
    </svg>
  );
}
