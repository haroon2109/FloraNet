"use client";

import React from 'react';
import Link from 'next/link';
import { useLiveWeather } from '@/hooks/useLiveWeather';

export default function PastSummary() {
  const { weather, status } = useLiveWeather();
  const past7Days = weather?.past7_days || [];

  const fmtDate = (iso: string) => iso;
  const fmtTemp = (v: number | null) => (v != null ? `${v}°C` : '—');
  const fmtRain = (v: number | null) => (v != null ? `${v} mm` : '—');

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <h3 className="text-[15px] font-bold text-[#102A20] mb-3 px-0.5">Past 7 Days Summary</h3>

      {/* Table */}
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-left text-[12px] border-collapse">
          <thead>
            <tr className="border-b border-[#E1E7E3] text-[#52645D] font-bold uppercase tracking-wider text-[10px]">
              <th className="py-1.5 px-2">Date</th>
              <th className="py-1.5 px-2">Max Temp</th>
              <th className="py-1.5 px-2">Min Temp</th>
              <th className="py-1.5 px-2 text-right">Rainfall</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1]">
            {status === 'loading' && (
              <tr><td colSpan={4} className="py-6 text-center text-[#607469]">Fetching observed history…</td></tr>
            )}
            {status === 'unavailable' && (
              <tr><td colSpan={4} className="py-6 text-center text-[#607469]">Live history unavailable — backend unreachable.</td></tr>
            )}
            {status === 'live' && past7Days.length === 0 && (
              <tr><td colSpan={4} className="py-6 text-center text-[#607469]">No observed daily data in the live feed yet.</td></tr>
            )}
            {status === 'live' && past7Days.map((row) => (
              <tr key={row.date} className="hover:bg-[#F9FBF9]">
                <td className="py-2 px-2 font-semibold text-[#102A20]">{fmtDate(row.date)}</td>
                <td className="py-2 px-2 font-medium text-[#102A20]">{fmtTemp(row.max_temp_c)}</td>
                <td className="py-2 px-2 text-[#52645D]">{fmtTemp(row.min_temp_c)}</td>
                <td className="py-2 px-2 text-right font-medium text-[#168A45]">{fmtRain(row.rainfall_mm)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Link */}
      <Link 
        href="/weather/history"
        className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
      >
        View detailed history 
        <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
      </Link>

    </div>
  );
}
