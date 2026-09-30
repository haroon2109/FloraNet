"use client";

import React from 'react';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  selectedCommodity?: string;
  onCommodityChange?: (val: string) => void;
  selectedMarket?: string;
  onMarketChange?: (val: string) => void;
  selectedGrade?: string;
  onGradeChange?: (val: string) => void;
  selectedTimeframe?: string;
  onTimeframeChange?: (val: string) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export default function FilterBar({
  selectedCommodity = 'All Commodities',
  onCommodityChange,
  selectedMarket = 'All Markets',
  onMarketChange,
  selectedGrade = 'All Grades',
  onGradeChange,
  selectedTimeframe = 'All Timeframes',
  onTimeframeChange,
  searchTerm = '',
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-3 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6 flex flex-wrap items-center justify-between gap-3">
      
      {/* Left Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Dropdown 1: All Commodities */}
        <div className="relative">
          <select 
            value={selectedCommodity}
            onChange={(e) => onCommodityChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Commodities</option>
            <option>Maize</option>
            <option>Wheat</option>
            <option>Rice</option>
            <option>Cotton</option>
            <option>Pulses (Tur)</option>
            <option>Soybean</option>
            <option>Groundnut</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        {/* Dropdown 2: All Markets */}
        <div className="relative">
          <select 
            value={selectedMarket}
            onChange={(e) => onMarketChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Markets</option>
            <option>Pune APMC</option>
            <option>Mumbai APMC</option>
            <option>Nashik APMC</option>
            <option>Nagpur APMC</option>
            <option>Aurangabad APMC</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        {/* Dropdown 3: All Grades */}
        <div className="relative">
          <select 
            value={selectedGrade}
            onChange={(e) => onGradeChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Grades</option>
            <option>Grade A</option>
            <option>Hybrid</option>
            <option>Lokwan</option>
            <option>Pusa Basmati</option>
            <option>Shankar-6</option>
            <option>Desi</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        {/* Dropdown 4: All Timeframes */}
        <div className="relative">
          <select 
            value={selectedTimeframe}
            onChange={(e) => onTimeframeChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Timeframes</option>
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Season</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

      </div>

      {/* Right Controls: Search Input & Filter Button */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Search Input */}
        <div className="relative w-[180px] sm:w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52645D]" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search commodities..."
            className="w-full bg-white border border-[#E1E7E3] rounded-xl pl-8 pr-3 py-2 text-[12px] font-medium text-[#102A20] placeholder-[#889B91] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
          />
        </div>

        {/* Filter Button */}
        <button 
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E1E7E3] rounded-xl text-[12px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors"
        >
          <SlidersHorizontal size={14} className="text-[#52645D]" strokeWidth={2} />
          <span>Filter</span>
        </button>

      </div>

    </div>
  );
}
