"use client";

import React from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, CloudFog, CloudSnow } from 'lucide-react';

/**
 * Shared live-weather icon mapping. Condition strings come straight from the
 * backend's WMO-code decoding (Open-Meteo) — e.g. "Clear Sky", "Heavy Rain".
 */
export function conditionIcon(condition: string | undefined, size = 18) {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder')) return <CloudLightning size={size} className="text-[#93C5FD]" strokeWidth={2} />;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return <CloudRain size={size} className="text-[#93C5FD]" strokeWidth={2} />;
  if (c.includes('snow') || c.includes('sleet')) return <CloudSnow size={size} className="text-white/80" strokeWidth={2} />;
  if (c.includes('fog') || c.includes('overcast') || c.includes('rime')) return <CloudFog size={size} className="text-white/70" strokeWidth={2} />;
  if (c.includes('cloud')) return <Cloud size={size} className="text-white/80" strokeWidth={2} />;
  if (c.includes('clear') || c.includes('sun')) return <Sun size={size} className="text-[#FDE047]" strokeWidth={2} />;
  return <CloudSun size={size} className="text-[#FDE047]" strokeWidth={2} />;
}

/** Variant for light backgrounds (white cards) instead of the dark green hero. */
export function conditionIconLight(condition: string | undefined, size = 24) {
  const c = (condition || '').toLowerCase();
  if (c.includes('thunder')) return <CloudLightning size={size} className="text-[#1A73E8]" strokeWidth={2} />;
  if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) return <CloudRain size={size} className="text-[#1A73E8]" strokeWidth={2} />;
  if (c.includes('snow') || c.includes('sleet')) return <CloudSnow size={size} className="text-[#889B91]" strokeWidth={2} />;
  if (c.includes('fog') || c.includes('overcast') || c.includes('rime')) return <CloudFog size={size} className="text-[#889B91]" strokeWidth={2} />;
  if (c.includes('cloud')) return <Cloud size={size} className="text-[#889B91]" strokeWidth={2} />;
  if (c.includes('clear') || c.includes('sun')) return <Sun size={size} className="text-[#F5A900]" strokeWidth={2} />;
  return <CloudSun size={size} className="text-[#F5A900]" strokeWidth={2} />;
}
