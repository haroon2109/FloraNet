"use client";

import React from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useFarm } from '@/context/farmContext';

interface FilterBarProps {
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  selectedCrop?: string;
  onCropChange?: (val: string) => void;
  selectedField?: string;
  onFieldChange?: (val: string) => void;
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
  selectedSeason?: string;
  onSeasonChange?: (val: string) => void;
}

export default function FilterBar({
  searchTerm = '',
  onSearchChange,
  selectedCrop = 'All Crops',
  onCropChange,
  selectedField = 'All Fields',
  onFieldChange,
  selectedStatus = 'All Status',
  onStatusChange,
  selectedSeason = 'All Seasons',
  onSeasonChange,
}: FilterBarProps) {
  const { fields } = useFarm();
  return (
    <div className="flex flex-wrap items-center gap-3 mb-5">
      
      {/* Dropdown 1: All Crops */}
      <div className="relative">
        <select 
          value={selectedCrop}
          onChange={(e) => onCropChange?.(e.target.value)}
          className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
        >
          <option>All Crops</option>
          <option>Maize</option>
          <option>Wheat</option>
          <option>Vegetables</option>
          <option>Pulses</option>
          <option>Cotton</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
      </div>

      {/* Dropdown 2: All Fields */}
      <div className="relative">
        <select 
          value={selectedField}
          onChange={(e) => onFieldChange?.(e.target.value)}
          className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
        >
          <option>All Fields</option>
          {fields.length === 0 && (
            <option disabled>No fields registered yet — register a farm to see your fields here</option>
          )}
          {fields.map((f) => (
            <option key={f.id} value={f.name}>{f.name}</option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
      </div>

      {/* Dropdown 3: All Status */}
      <div className="relative">
        <select 
          value={selectedStatus}
          onChange={(e) => onStatusChange?.(e.target.value)}
          className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
        >
          <option>All Status</option>
          <option>Healthy</option>
          <option>Watch</option>
          <option>Needs Attention</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
      </div>

      {/* Dropdown 4: All Seasons */}
      <div className="relative">
        <select 
          value={selectedSeason}
          onChange={(e) => onSeasonChange?.(e.target.value)}
          className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-2 pr-9 text-[13px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
        >
          <option>All Seasons</option>
          <option>Kharif 2024</option>
          <option>Rabi 2024</option>
          <option>Zaid 2024</option>
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
      </div>

      {/* Search Input Field */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52645D]" />
        <input 
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search crops..."
          className="w-full bg-white border border-[#E1E7E3] rounded-xl pl-9 pr-4 py-2 text-[13px] font-medium text-[#102A20] placeholder-[#889B91] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
        />
      </div>

    </div>
  );
}
