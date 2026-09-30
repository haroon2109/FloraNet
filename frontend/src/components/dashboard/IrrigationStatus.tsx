"use client";

import React from 'react';
import Link from 'next/link';
import { dashboardData } from '@/data/dashboardData';

export default function IrrigationStatus() {
  const { irrigationStatus } = dashboardData;

  const circumference = 2 * Math.PI * 42; // r = 42
  const strokeDashoffset = circumference - (irrigationStatus.efficiencyPercentage / 100) * circumference;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[280px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Irrigation Status</h3>
        <Link 
          href="/field-monitor" 
          className="text-[13px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[14px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Main Gauge + Legend Container */}
      <div className="flex-1 flex items-center justify-between">
        
        {/* SVG Circular Progress Gauge */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#F0F5F1"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Active Ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#168A45"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[26px] font-bold text-[#102A20] leading-none">
              {irrigationStatus.efficiencyPercentage}%
            </span>
            <span className="text-[12px] font-medium text-[#52645D] mt-0.5">
              {irrigationStatus.statusText}
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 pl-6 flex flex-col gap-3.5 justify-center">
          {irrigationStatus.categories.map((cat) => (
            <div key={cat.label} className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                <span className="font-semibold text-[#102A20]">{cat.label}</span>
              </div>
              <span className="font-medium text-[#52645D]">{cat.count} fields</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
