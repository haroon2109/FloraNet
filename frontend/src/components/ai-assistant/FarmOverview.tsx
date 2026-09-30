"use client";

import React from 'react';
import Link from 'next/link';
import { Droplets, Sprout, IndianRupee } from 'lucide-react';
import { aiAssistantPageData } from '@/data/aiAssistantData';

export default function FarmOverview() {
  const { farmOverview } = aiAssistantPageData;

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Farm Overview for This Week</h3>
        <Link 
          href="/analytics" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View full analytics 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {farmOverview.map((item) => (
          <div 
            key={item.id}
            className="p-4 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex items-center justify-between hover:border-[#E1E7E3] transition-colors"
          >
            <div>
              <span className="text-[12px] font-semibold text-[#52645D] block mb-1">{item.title}</span>
              <div className="text-[20px] font-bold text-[#102A20] leading-tight mb-1">
                {item.value}
              </div>
              <div className="text-[11px] font-semibold text-[#168A45]">
                {item.changeText}
              </div>
            </div>

            {/* Custom Visual Metric Icon */}
            {item.type === 'health' ? (
              <div className="relative w-12 h-12 rounded-full border-4 border-[#168A45] flex items-center justify-center text-[13px] font-bold text-[#102A20] shrink-0 bg-white">
                {item.value}
              </div>
            ) : item.type === 'water' ? (
              <div className="w-10 h-10 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
                <Droplets size={18} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
              </div>
            ) : item.type === 'yield' ? (
              <div className="w-10 h-10 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
                <Sprout size={18} strokeWidth={2.2} />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
                <IndianRupee size={18} strokeWidth={2.2} />
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}
