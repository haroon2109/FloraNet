"use client";

import React from 'react';
import Link from 'next/link';
import { Sprout, Leaf, Wheat } from 'lucide-react';
import { reportsPageData } from '@/data/reportsData';
import { FieldPerformanceItem } from '@/types/reports';

// Custom Crop SVG Icons
const MaizeIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-[#FEF9E7] border border-[#FCE8B2] flex items-center justify-center shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C8 6 6 12 8 18C10 22 14 22 16 18C18 12 16 6 12 2Z" fill="#F5A900" />
      <path d="M12 2C14 6 15 12 13 18" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </div>
);

const WheatIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-[#FEF7E0] border border-[#FCE8B2] flex items-center justify-center shrink-0">
    <Wheat size={16} className="text-[#D97706]" strokeWidth={2} />
  </div>
);

const VegIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-[#EEF7F0] border border-[#D5E6D8] flex items-center justify-center shrink-0">
    <Leaf size={16} className="text-[#168A45]" strokeWidth={2} />
  </div>
);

const PulseIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-[#FDF2F2] border border-[#FAD2CF] flex items-center justify-center shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="4" fill="#E84A3C" opacity="0.8" />
      <circle cx="15" cy="13" r="4" fill="#D97706" opacity="0.8" />
    </svg>
  </div>
);

const CottonIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-[#F8FAF8] border border-[#E1E8E2] flex items-center justify-center shrink-0">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="11" r="5" fill="#F0F4F1" stroke="#52645D" strokeWidth="1.5" />
    </svg>
  </div>
);

const SoybeanIcon = () => (
  <div className="w-7 h-7 rounded-lg bg-[#F5F9F6] border border-[#E1E7E3] flex items-center justify-center shrink-0">
    <Sprout size={16} className="text-[#52645D]" strokeWidth={2} />
  </div>
);

export default function FieldPerformanceSummary() {
  const { fieldPerformance } = reportsPageData;

  const renderCropIcon = (type: FieldPerformanceItem['cropType']) => {
    switch (type) {
      case 'maize': return <MaizeIcon />;
      case 'wheat': return <WheatIcon />;
      case 'vegetables': return <VegIcon />;
      case 'pulses': return <PulseIcon />;
      case 'cotton': return <CottonIcon />;
      case 'soybean': return <SoybeanIcon />;
    }
  };

  const getStatusBadgeStyle = (status: FieldPerformanceItem['status']) => {
    switch (status) {
      case 'Excellent':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]';
      case 'Good':
        return 'bg-[#EEF7F0] text-[#168A45] border-[#D5E6D8]';
      case 'Average':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[320px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <h3 className="text-[16px] font-bold text-[#102A20]">Field Performance Summary</h3>
        <Link 
          href="/reports/field-performance" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View full report 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1 hide-scrollbar">
        <table className="w-full text-left border-collapse text-[12px] min-w-[500px]">
          <thead>
            <tr className="border-b border-[#E1E8E2] bg-[#F9FBF9] text-[#52645D] font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Field</th>
              <th className="py-2.5 px-3">Crops</th>
              <th className="py-2.5 px-3">Area (Acres)</th>
              <th className="py-2.5 px-3">Yield (Kgs)</th>
              <th className="py-2.5 px-3">Yield/acre</th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1]">
            {fieldPerformance.map((fp) => (
              <tr key={fp.id} className="hover:bg-[#F8FAF8] transition-colors">
                <td className="py-2 px-3 font-bold text-[#102A20]">{fp.field}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    {renderCropIcon(fp.cropType)}
                    <span className="font-semibold text-[#102A20]">{fp.crop}</span>
                  </div>
                </td>
                <td className="py-2 px-3 font-medium text-[#52645D]">{fp.area}</td>
                <td className="py-2 px-3 font-bold text-[#102A20]">{fp.yieldKgs.toLocaleString()}</td>
                <td className="py-2 px-3 font-medium text-[#52645D]">{fp.yieldPerAcre}</td>
                <td className="py-2 px-3 text-right">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadgeStyle(fp.status)}`}>
                    {fp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
