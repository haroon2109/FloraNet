"use client";

import React from 'react';
import { Bell, Calendar, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useUILocale } from '@/lib/useUILocale';

export default function Header() {
  // Date badge follows the profile language chosen on the landing page.
  const locale = useUILocale();
  const todayFormatted = new Date().toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pt-1">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#E84A3C] animate-pulse" />
          <span className="text-[11px] font-bold text-[#E84A3C] uppercase tracking-wider">
            Live Telemetry Alarms
          </span>
        </div>
        <h1 className="text-[28px] sm:text-[32px] font-black text-[#102A20] tracking-tight flex items-center gap-2.5">
          Active Crop & Soil Alerts
        </h1>
        <p className="text-[13.5px] font-medium text-[#52645D]">
          Real-time agro-climatic threshold breaches requiring prompt field intervention.
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Date Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E1E7E3] rounded-xl text-[12.5px] font-bold text-[#102A20] shadow-xs">
          <Calendar size={15} className="text-[#075C32]" strokeWidth={2} />
          <span>{todayFormatted}</span>
        </div>

        {/* Ask AI Action */}
        <Link
          href="/ai-assistant?query=Help%20me%20resolve%20my%20critical%20crop%20alerts"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#075C32] hover:bg-[#054324] text-white text-[12.5px] font-bold rounded-xl transition-all shadow-xs"
        >
          <Sparkles size={14} className="text-emerald-300" />
          <span>AI Triage</span>
        </Link>
      </div>
    </div>
  );
}
