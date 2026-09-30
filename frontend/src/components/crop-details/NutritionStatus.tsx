"use client";

import React from 'react';
import Link from 'next/link';
import { useFarm } from '@/context/farmContext';

/**
 * Soil Nutrition Status — computed from the LIVE backend /farm/metrics feed
 * (ISRIC SoilGrids SOC & pH + Open-Meteo soil moisture). Rows that would
 * require a laboratory soil test (N-P-K availability) are shown as "lab test
 * required" rather than guessed from an arbitrary scale.
 */
export default function NutritionStatus() {
  const { liveMetrics } = useFarm();

  const soc = typeof liveMetrics?.soil?.soc_percent === 'number' ? liveMetrics.soil.soc_percent : null;
  const ph = typeof liveMetrics?.soil?.ph === 'number' ? liveMetrics.soil.ph : null;
  const moisture = typeof liveMetrics?.soil_moisture_pct === 'number' ? liveMetrics.soil_moisture_pct : null;

  type Row = { nutrient: string; status: string; level: 'optimal' | 'adequate' | 'low' | 'unknown'; width: string };

  const rows: Row[] = [];

  if (soc != null) {
    // General agronomy bands: SOC below ~1% is depleted for most croplands.
    const level = soc >= 2 ? 'optimal' : soc >= 1 ? 'adequate' : 'low';
    const width = Math.max(8, Math.min(100, (soc / 4) * 100));
    rows.push({ nutrient: 'Soil Organic Carbon', status: `${soc}% SOC`, level, width: `${width.toFixed(0)}%` });
  } else {
    rows.push({ nutrient: 'Soil Organic Carbon', status: 'No live reading', level: 'unknown', width: '0%' });
  }

  if (ph != null) {
    const optimal = ph >= 5.5 && ph <= 8.0;
    const width = Math.max(8, Math.min(100, ((ph - 3.5) / 5) * 100));
    rows.push({
      nutrient: 'Soil pH',
      status: optimal ? `pH ${ph} · optimal band` : `pH ${ph} · outside band`,
      level: optimal ? 'optimal' : 'low',
      width: `${width.toFixed(0)}%`,
    });
  } else {
    rows.push({ nutrient: 'Soil pH', status: 'No live reading', level: 'unknown', width: '0%' });
  }

  if (moisture != null) {
    const level = moisture >= 20 && moisture <= 55 ? 'optimal' : moisture < 20 ? 'low' : 'adequate';
    rows.push({ nutrient: 'Topsoil Moisture', status: `${moisture}% VWC`, level, width: `${Math.min(100, moisture)}%` });
  } else {
    rows.push({ nutrient: 'Topsoil Moisture', status: 'No live reading', level: 'unknown', width: '0%' });
  }

  rows.push({ nutrient: 'N-P-K Availability', status: 'Lab test required', level: 'unknown', width: '0%' });

  const barColor = (level: Row['level']) => {
    switch (level) {
      case 'optimal':
        return 'bg-[#087A45]';
      case 'adequate':
        return 'bg-[#168A45]';
      case 'low':
        return 'bg-[#D97706]';
      default:
        return 'bg-[#C8D5CC]';
    }
  };

  const statusColor = (level: Row['level']) =>
    level === 'low' ? 'text-[#D97706]' : level === 'unknown' ? 'text-[#889B91]' : 'text-[#087A45]';

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A2A]">Nutrition Status</h3>
        <Link
          href="/reports"
          className="text-[12px] font-semibold text-[#087A45] hover:text-[#075B3A] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View full report
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Progress Rows */}
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.nutrient}>
            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
              <span className="text-[#102A2A]">{row.nutrient}</span>
              <span className={statusColor(row.level)}>{row.status}</span>
            </div>
            <div className="w-full bg-[#EEF2EF] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor(row.level)}`}
                style={{ width: row.width }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[#889B91] font-medium mt-3 leading-relaxed">
        Live values: ISRIC SoilGrids 2.0 + Open-Meteo via the FloraNet backend. N-P-K rows need a soil
        laboratory assay and are never estimated.
      </p>

    </div>
  );
}
