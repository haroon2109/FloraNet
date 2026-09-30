"use client";

import React from 'react';
import { CalendarDays, Droplet, Sprout, LayoutGrid, Activity } from 'lucide-react';
import { MetricItem } from '@/types/home';

export default function MetricCard({ title, value, subValue, status, statusType, iconType }: MetricItem) {
  
  const renderIcon = () => {
    switch (iconType) {
      case 'health':
        return (
          <div className="w-11 h-11 rounded-full bg-[#EEF7F0] flex items-center justify-center text-[#075C32] shrink-0 border border-[#D5E6D8]">
            <Activity size={20} strokeWidth={2.2} />
          </div>
        );
      case 'fields':
        return (
          <div className="w-11 h-11 rounded-xl bg-[#EEF7F0] flex items-center justify-center text-[#075C32] shrink-0 border border-[#D5E6D8]">
            <LayoutGrid size={20} strokeWidth={2} />
          </div>
        );
      case 'crops':
        return (
          <div className="w-11 h-11 rounded-full bg-[#EEF7F0] flex items-center justify-center text-[#075C32] shrink-0 border border-[#D5E6D8]">
            <Sprout size={20} strokeWidth={2.2} />
          </div>
        );
      case 'irrigation':
        return (
          <div className="w-11 h-11 rounded-full bg-[#EBF3FE] flex items-center justify-center text-[#1A73E8] shrink-0 border border-[#D0E2FB]">
            <Droplet size={20} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-4.5 shadow-[0_4px_20px_rgba(16,42,32,0.05)] border border-[#E1E8E2] flex items-center gap-3 hover:shadow-[0_6px_24px_rgba(16,42,32,0.08)] transition-all min-w-0">
      {renderIcon()}
      <div className="flex flex-col min-w-0 flex-1">
        <h4 className="text-[12.5px] font-semibold text-[#53645D] leading-tight mb-1">
          {title}
        </h4>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-[22px] sm:text-[24px] font-bold text-[#102A20] leading-none tracking-tight">
            {value}
          </span>
          {subValue && (
            <span className="text-[12px] font-medium text-[#6B7E74]">
              {subValue}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {iconType !== 'irrigation' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#168A45] shrink-0" />
              <span className="text-[11.5px] font-semibold text-[#075C32] truncate">{status}</span>
            </>
          ) : (
            <>
              <CalendarDays size={12} className="text-[#53645D] shrink-0" />
              <span className="text-[11.5px] font-semibold text-[#53645D] truncate">{status}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
