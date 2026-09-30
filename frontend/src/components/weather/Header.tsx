"use client";

import React from 'react';
import { Search, Bell, User, CalendarDays, CloudSun } from 'lucide-react';
import { useUILocale } from '@/lib/useUILocale';

export default function Header() {
  // Date badge follows the profile language chosen on the landing page.
  const locale = useUILocale();
  return (
    <header className="flex justify-between items-start mb-6 relative z-10">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-[#102A20] mb-1.5">
          Weather
          <CloudSun size={24} className="text-[#168A45]" strokeWidth={2.5} />
        </h1>
        <p className="text-[13px] font-medium text-[#52645D]">
          Real-time weather insights for better farm decisions.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white border border-[#E1E7E3] px-3 py-2 rounded-lg shadow-[0_2px_8px_rgba(20,60,40,0.02)]">
          <CalendarDays size={16} className="text-[#52645D]" />
          <span className="text-[13px] font-semibold text-[#102A20]">
            {new Date().toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white border border-[#E1E7E3] flex items-center justify-center text-[#102A20] shadow-[0_2px_8px_rgba(20,60,40,0.02)]" aria-label="Search">
            <Search size={18} />
          </button>
          
          <button className="w-10 h-10 rounded-full bg-white border border-[#E1E7E3] flex items-center justify-center text-[#102A20] relative shadow-[0_2px_8px_rgba(20,60,40,0.02)]" aria-label="Notifications">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 bg-[#168A45] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
          </button>
          
          <button className="w-10 h-10 rounded-full bg-white border border-[#E1E7E3] flex items-center justify-center text-[#102A20] shadow-[0_2px_8px_rgba(20,60,40,0.02)]" aria-label="Account">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
