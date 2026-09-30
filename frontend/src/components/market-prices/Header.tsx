"use client";

import React from 'react';
import { useUILocale } from '@/lib/useUILocale';
import { TrendingUp, Calendar, Search, Bell, User } from 'lucide-react';

export default function Header() {
  // Date badge follows the profile language chosen on the landing page.
  const locale = useUILocale();
  return (
    <div className="flex items-center justify-between mb-6 pt-2 z-30 relative">
      <div>
        <h1 className="text-[32px] sm:text-[36px] font-bold text-[#102A20] tracking-tight flex items-center gap-2.5">
          Market Prices
          <TrendingUp className="text-[#168A45]" size={28} strokeWidth={2.2} />
        </h1>
        <p className="text-[14px] sm:text-[15px] font-medium text-[#52645D] mt-0.5">
          Track real-time market prices and trends for better selling decisions.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Selector Badge Button */}
        <button 
          type="button"
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E1E7E3] rounded-xl text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors"
        >
          <Calendar size={16} className="text-[#52645D]" strokeWidth={1.8} />
          <span>{new Date().toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </button>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            aria-label="Search" 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A20] hover:text-[#168A45] hover:bg-white/80 transition-colors"
          >
            <Search size={20} strokeWidth={1.8} />
          </button>

          <button 
            type="button"
            aria-label="Notifications" 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A20] hover:text-[#168A45] hover:bg-white/80 transition-colors relative"
          >
            <Bell size={20} strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-[17px] h-[17px] bg-[#168A45] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#F7F9F7]">
              3
            </span>
          </button>

          <button 
            type="button"
            aria-label="User Account" 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A20] hover:text-[#168A45] hover:bg-white/80 transition-colors"
          >
            <User size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
