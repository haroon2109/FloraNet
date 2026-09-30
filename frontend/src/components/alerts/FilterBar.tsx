"use client";

import React from 'react';
import { ChevronDown, Search, SlidersHorizontal } from 'lucide-react';
import { useFarm } from '@/context/farmContext';

interface FilterBarProps {
  activeFilter?: string;
  onFilterChange?: (val: string) => void;
  selectedField?: string;
  onFieldChange?: (val: string) => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export default function FilterBar({
  activeFilter = 'All Alerts',
  onFilterChange,
  selectedField = 'All Fields',
  onFieldChange,
  searchTerm = '',
  onSearchChange,
}: FilterBarProps) {
  const { fields, alerts } = useFarm();

  // Badge counts are computed from the LIVE alert feed — never hardcoded.
  // Zero alerts render a plain pill with no count badge.
  const countBySeverity = (severity: string) =>
    alerts.filter((a) => (a.severity || '').toLowerCase() === severity.toLowerCase()).length;

  const filterPills = [
    { label: 'All Alerts', count: null as number | null, badgeBg: '', badgeText: '' },
    { label: 'Critical', count: countBySeverity('Critical'), badgeBg: 'bg-[#E84A3C]', badgeText: 'text-white' },
    { label: 'Warning', count: countBySeverity('Warning'), badgeBg: 'bg-[#F5A900]', badgeText: 'text-white' },
    { label: 'Info', count: countBySeverity('Info'), badgeBg: 'bg-[#1A73E8]', badgeText: 'text-white' },
    { label: 'Normal', count: 0, badgeBg: 'bg-[#168A45]', badgeText: 'text-white' },
  ];

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-3 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6 flex flex-wrap items-center justify-between gap-4">
      
      {/* Left Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
        {filterPills.map((pill) => {
          const isActive = activeFilter === pill.label;
          return (
            <button
              key={pill.label}
              type="button"
              onClick={() => onFilterChange?.(pill.label)}
              className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all shrink-0 border ${
                isActive
                  ? 'bg-[#EAF5EC] border-[#168A45] text-[#168A45] shadow-xs'
                  : 'bg-white border-[#E1E7E3] text-[#52645D] hover:bg-[#F5F9F6] hover:text-[#102A20]'
              }`}
            >
              <span>{pill.label}</span>
              {pill.count !== null && (
                <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${pill.badgeBg} ${pill.badgeText}`}>
                  {pill.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Field Dropdown, Search Input, Filter Button */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Field Dropdown */}
        <div className="relative">
          <select 
            value={selectedField}
            onChange={(e) => onFieldChange?.(e.target.value)}
            className="appearance-none bg-white border border-[#E1E7E3] rounded-xl px-3.5 py-1.5 pr-8 text-[12px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors cursor-pointer focus:outline-none"
          >
            <option>All Fields</option>
            {fields.length === 0 && (
              <option disabled>No fields registered yet — register a farm to see your fields here</option>
            )}
            {fields.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#52645D] pointer-events-none" />
        </div>

        {/* Search Input */}
        <div className="relative w-[180px] sm:w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52645D]" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search alerts..."
            className="w-full bg-white border border-[#E1E7E3] rounded-xl pl-8 pr-3 py-1.5 text-[12px] font-medium text-[#102A20] placeholder-[#889B91] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#168A45]/20"
          />
        </div>

        {/* Filter Button */}
        <button 
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E1E7E3] rounded-xl text-[12px] font-semibold text-[#102A20] shadow-xs hover:bg-[#F5F9F6] transition-colors"
        >
          <SlidersHorizontal size={14} className="text-[#52645D]" strokeWidth={2} />
          <span>Filter</span>
        </button>

      </div>

    </div>
  );
}
