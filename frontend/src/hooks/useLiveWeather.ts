"use client";

import { useEffect, useState } from 'react';
import { fetchWeatherTelemetry } from '@/services/farmApi';
import { useFarm } from '@/context/farmContext';

export interface LiveWeatherData {
  observed_at?: string;
  current_temp?: number;
  feels_like?: number;
  condition?: string;
  humidity?: number;
  wind_speed_kmh?: number;
  wind_direction?: string;
  precipitation_mm?: number;
  soil_moisture_pct?: number;
  soil_temp_c?: number | null;
  uv_index_max?: number | null;
  uv_label?: string;
  sunrise?: string | null;
  sunset?: string | null;
  moon_phase?: { name: string; illumination_pct: number; age_days: number };
  forecast?: Array<{
    day: string;
    date: string;
    high: number | null;
    low: number | null;
    condition: string;
    rain_pct: number | null;
    precipitation_mm: number | null;
  }>;
  hourly?: Array<{
    time: string;
    temp_c: number | null;
    condition: string;
    wind_kmh: number | null;
    rain_pct: number | null;
  }>;
  temp_trend?: Array<{ date: string; max_temp: number | null; min_temp: number | null }>;
  rain_trend?: Array<{ date: string; rainfall: number | null }>;
  past7_days?: Array<{
    date: string;
    max_temp_c: number | null;
    min_temp_c: number | null;
    rainfall_mm: number | null;
  }>;
  alerts?: Array<{
    id: string;
    title: string;
    description: string;
    badge_text: string;
    badge_type: 'high' | 'medium' | 'low';
    time: string;
  }>;
  recommendations?: Array<{
    id: string;
    title: string;
    description: string;
    badge_text: string;
    badge_type: 'high' | 'medium' | 'low';
    icon_type: 'leaf' | 'shield' | 'rain';
  }>;
  source?: string;
}

export type LiveWeatherStatus = 'loading' | 'live' | 'unavailable';

/**
 * Live Open-Meteo telemetry via the backend. On failure the hook reports
 * `unavailable` — callers must render that state rather than substitute
 * fabricated readings.
 */
export function useLiveWeather(): {
  weather: LiveWeatherData | null;
  status: LiveWeatherStatus;
} {
  const { userProfile } = useFarm();
  const [weather, setWeather] = useState<LiveWeatherData | null>(null);
  const [status, setStatus] = useState<LiveWeatherStatus>('loading');

  useEffect(() => {
    let mounted = true;
    const coords = userProfile.defaultCoordinates;
    fetchWeatherTelemetry(coords?.lat, coords?.lng).then((data) => {
      if (!mounted) return;
      if (data && data.current_temp != null) {
        setWeather(data as LiveWeatherData);
        setStatus('live');
      } else {
        setStatus('unavailable');
      }
    });
    return () => { mounted = false; };
  }, [userProfile.defaultCoordinates]);

  return { weather, status };
}
