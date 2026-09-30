"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudFog, CloudSnow } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { fetchWeatherTelemetry } from '@/services/farmApi';

interface LiveForecastDay {
  day: string;
  date: string;
  high: number | null;
  low: number | null;
  condition: string;
  rain_pct: number | null;
  precipitation_mm: number | null;
}

interface LiveWeather {
  observed_at?: string;
  current_temp?: number;
  feels_like?: number;
  condition?: string;
  humidity?: number;
  wind_speed_kmh?: number;
  precipitation_mm?: number;
  soil_moisture_pct?: number;
  soil_temp_c?: number | null;
  forecast?: LiveForecastDay[];
  source?: string;
}

const conditionIcon = (condition?: string, size = 18) => {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder')) return <CloudLightning size={size} className="text-[#93C5FD]" strokeWidth={2} />;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return <CloudRain size={size} className="text-[#93C5FD]" strokeWidth={2} />;
  if (c.includes('snow') || c.includes('sleet')) return <CloudSnow size={size} className="text-white/80" strokeWidth={2} />;
  if (c.includes('fog') || c.includes('overcast')) return <CloudFog size={size} className="text-white/70" strokeWidth={2} />;
  if (c.includes('cloud')) return <Cloud size={size} className="text-white/80" strokeWidth={2} />;
  if (c.includes('clear') || c.includes('sun')) return <Sun size={size} className="text-[#FDE047]" strokeWidth={2} />;
  return <CloudSun size={size} className="text-[#FDE047]" strokeWidth={2} />;
};

export default function WeatherCard() {
  const { userProfile } = useFarm();
  const [viewMode, setViewMode] = useState<'7day'>('7day');
  const [live, setLive] = useState<LiveWeather | null>(null);
  const [status, setStatus] = useState<'loading' | 'live' | 'unavailable'>('loading');

  useEffect(() => {
    let mounted = true;
    const coords = userProfile.defaultCoordinates;
    fetchWeatherTelemetry(coords?.lat, coords?.lng).then((data) => {
      if (!mounted) return;
      if (data && data.current_temp != null) {
        setLive(data);
        setStatus('live');
      } else {
        setStatus('unavailable');
      }
    });
    return () => { mounted = false; };
  }, [userProfile.defaultCoordinates]);

  const displayLocation = `${userProfile.countryFlag} ${userProfile.farmLocation}`;

  return (
    <div className="bg-[#054826] rounded-[22px] p-5 sm:p-6 text-white shadow-[0_6px_25px_rgba(7,92,50,0.15)] relative overflow-hidden border border-emerald-700/50">

      {/* Location Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 text-emerald-100">
          <MapPin size={15} strokeWidth={2.2} className="text-emerald-300 shrink-0" />
          <span className="text-[13.5px] font-bold tracking-wide truncate max-w-[220px]">
            {displayLocation}
          </span>
        </div>

        <div className="flex items-center bg-black/25 p-0.5 rounded-lg border border-white/10 text-[11px] font-bold">
          <span className="px-2 py-0.5 rounded-md bg-[#0E6C38] text-white shadow-xs">7-Day</span>
        </div>
      </div>

      {status === 'loading' && (
        <div className="py-10 flex items-center justify-center gap-3 text-emerald-200 text-[13px]">
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-200" />
          Fetching live Open-Meteo telemetry…
        </div>
      )}

      {status === 'unavailable' && (
        <div className="py-10 text-center">
          <CloudSun size={30} className="mx-auto text-emerald-300/70 mb-2" />
          <p className="text-[13px] font-bold text-emerald-100">Live weather unavailable</p>
          <p className="text-[11.5px] text-emerald-300/80 mt-1">
            Backend /api/v1/farm/weather-telemetry unreachable. No substitute readings are shown.
          </p>
        </div>
      )}

      {status === 'live' && live && (
        <>
          {/* Main Temperature & Telemetry Row */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2.5">
                {conditionIcon(live.condition, 42)}
                <div className="flex items-baseline">
                  <span className="text-[40px] sm:text-[44px] font-black leading-none tracking-tight text-white">{live.current_temp}</span>
                  <span className="text-[22px] font-bold ml-0.5 text-emerald-200">°C</span>
                </div>
              </div>

              <div className="mt-2.5">
                <p className="text-[15px] font-bold text-white leading-snug">{live.condition}</p>
                <p className="text-[11.5px] font-medium text-emerald-200 mt-0.5">
                  Open-Meteo live · observed {live.observed_at}
                </p>
              </div>
            </div>

            {/* Side Details Grid */}
            <div className="flex flex-col gap-1.5 text-[12px] pt-1 shrink-0">
              <div className="flex justify-between w-[125px] border-b border-white/20 pb-0.5">
                <span className="text-emerald-200">Feels Like</span>
                <span className="font-bold text-white">{live.feels_like ?? '—'}°C</span>
              </div>
              <div className="flex justify-between w-[125px] border-b border-white/20 pb-0.5">
                <span className="text-emerald-200">Humidity</span>
                <span className="font-bold text-white">{live.humidity ?? '—'}%</span>
              </div>
              <div className="flex justify-between w-[125px] border-b border-white/20 pb-0.5">
                <span className="text-emerald-200">Wind</span>
                <span className="font-bold text-white">{live.wind_speed_kmh != null ? `${live.wind_speed_kmh} km/h` : '—'}</span>
              </div>
              <div className="flex justify-between w-[125px] pb-0.5">
                <span className="text-emerald-200">Soil Moisture</span>
                <span className="font-bold text-amber-300">{live.soil_moisture_pct != null ? `${live.soil_moisture_pct}%` : '—'}</span>
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="border-t border-white/20 pt-3.5 mb-3">
            <div className="flex justify-between items-center px-0.5">
              {(live.forecast || []).slice(0, 7).map((fc) => (
                <div key={fc.date} className="flex flex-col items-center gap-1">
                  <span className="text-[11px] font-bold text-emerald-200">{fc.day}</span>
                  <div className="my-0.5">{conditionIcon(fc.condition)}</div>
                  <span className="text-[11.5px] font-bold text-white">
                    {fc.high ?? '—'}°<span className="text-emerald-300 font-semibold">/{fc.low ?? '—'}°</span>
                  </span>
                  <span className="text-[9.5px] font-mono text-amber-300">{fc.rain_pct != null ? `${fc.rain_pct}%` : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* View Full Forecast Action */}
      <Link
        href="/weather"
        className="text-[12.5px] font-bold text-emerald-200 hover:text-white transition-colors inline-flex items-center gap-1.5 group"
      >
        <span>Open Doppler radar & synoptic charts</span>
        <span className="text-[13px] text-emerald-300 group-hover:translate-x-1 transition-transform">→</span>
      </Link>

    </div>
  );
}
