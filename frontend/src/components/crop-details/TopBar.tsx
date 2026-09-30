"use client";

import React from 'react';
import Link from 'next/link';
import { Sprout, Calendar, Search, Bell, User, ChevronRight } from 'lucide-react';
import { useFarm } from '@/context/farmContext';
import { useUILocale } from '@/lib/useUILocale';

export default function TopBar() {
  const { userProfile, fields, alerts } = useFarm();
  // Date badge follows the profile language chosen on the landing page.
  const locale = useUILocale();
  // Show the primary crop and first registered field from the live farm
  // profile — never a fabricated "Field 1" placeholder when nothing exists.
  const crop = userProfile.primaryCrop || 'Maize';
  const firstField = fields.length > 0 ? fields[0].name : 'No field registered';
  // Real alert count from the live alert feed; no badge when zero.
  const liveAlertCount = alerts.length;
  return (
    <div className="flex items-center justify-between mb-6 pt-2 z-30 relative px-8">
      <div>
        <h1 className="text-[32px] sm:text-[36px] font-bold text-[#102A2A] tracking-tight flex items-center gap-2.5">
          Crop Details
          <Sprout className="text-[#087A45]" size={28} strokeWidth={2.2} />
        </h1>
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-[13px] font-semibold text-[#617174] mt-1">
          <Link href="/crops" className="hover:text-[#087A45] transition-colors">Crops</Link>
          <ChevronRight size={14} className="text-[#889B91]" />
          <span className="text-[#102A2A]">{crop}</span>
          <ChevronRight size={14} className="text-[#889B91]" />
          <span className="text-[#087A45] font-bold">{firstField}</span>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* Date Selector Badge Button */}
        <button 
          type="button"
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E1E8E4] rounded-xl text-[13px] font-semibold text-[#102A2A] shadow-xs hover:bg-[#F5F9F6] transition-colors"
        >
          <Calendar size={16} className="text-[#617174]" strokeWidth={1.8} />
          <span>{new Date().toLocaleDateString(locale, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </button>

        {/* Action Icons */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            aria-label="Search" 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A2A] hover:text-[#087A45] hover:bg-white/80 transition-colors"
          >
            <Search size={20} strokeWidth={1.8} />
          </button>

          <button 
            type="button"
            aria-label="Notifications" 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A2A] hover:text-[#087A45] hover:bg-white/80 transition-colors relative"
          >
            <Bell size={20} strokeWidth={1.8} />
            {/* Badge only renders when real alerts exist in the live feed. */}
            {liveAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-[17px] h-[17px] bg-[#087A45] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#F7FAF8]">
                {liveAlertCount}
              </span>
            )}
          </button>

          <button 
            type="button"
            aria-label="User Account" 
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#102A2A] hover:text-[#087A45] hover:bg-white/80 transition-colors"
          >
            <User size={20} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}
