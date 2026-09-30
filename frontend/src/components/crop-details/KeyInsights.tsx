"use client";

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Droplets, Bug, Sun } from 'lucide-react';
import { cropDetailsPageData } from '@/data/cropDetailsData';

export default function KeyInsights() {
  const { keyInsights } = cropDetailsPageData;

  const renderIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return (
          <div className="w-7 h-7 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center shrink-0 border border-[#C4E7D0] mt-0.5">
            <CheckCircle2 size={15} strokeWidth={2.2} />
          </div>
        );
      case 1:
        return (
          <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB] mt-0.5">
            <Droplets size={15} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 2:
        return (
          <div className="w-7 h-7 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2] mt-0.5">
            <Bug size={15} strokeWidth={2.2} />
          </div>
        );
      case 3:
        return (
          <div className="w-7 h-7 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2] mt-0.5">
            <Sun size={15} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A2A]">Key Insights</h3>
      </div>

      {/* List */}
      <div className="space-y-3 mb-4">
        {keyInsights.map((text, idx) => (
          <div key={text} className="flex items-start gap-3">
            {renderIcon(idx)}
            <p className="text-[12px] font-semibold text-[#102A2A] leading-relaxed flex-1">
              {text}
            </p>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <Link 
        href="/recommendations" 
        className="w-full py-2 bg-white border border-[#E1E8E4] hover:bg-[#F5F9F6] text-[12px] font-bold text-[#087A45] rounded-xl transition-colors shadow-xs inline-flex items-center justify-center gap-1"
      >
        View all insights <span className="text-[13px]">→</span>
      </Link>

    </div>
  );
}
