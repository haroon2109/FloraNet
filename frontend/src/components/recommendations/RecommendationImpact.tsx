"use client";

import React from 'react';
import { Droplets, Leaf, IndianRupee, ShieldCheck, ChevronDown } from 'lucide-react';
import { recommendationsPageData } from '@/data/recommendationsData';
import { ImpactMetric } from '@/types/recommendations';

export default function RecommendationImpact() {
  const { impactMetrics } = recommendationsPageData;

  const renderIcon = (type: ImpactMetric['iconType']) => {
    switch (type) {
      case 'droplet':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center mx-auto mb-1.5 border border-[#D0E2FB]">
            <Droplets size={16} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 'leaf':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center mx-auto mb-1.5 border border-[#C4E7D0]">
            <Leaf size={16} strokeWidth={2.2} />
          </div>
        );
      case 'rupee':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center mx-auto mb-1.5 border border-[#FCE8B2]">
            <IndianRupee size={16} strokeWidth={2.2} />
          </div>
        );
      case 'shield':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center mx-auto mb-1.5 border border-[#C4E7D0]">
            <ShieldCheck size={16} strokeWidth={2.2} />
          </div>
        );
    }
  };

  return (
    <div className="bg-white border border-[#E2E9E5] rounded-2xl p-4 shadow-[0_4px_18px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A2A]">Recommendation Impact</h3>
        <div className="flex items-center gap-1 text-[12px] font-semibold text-[#647474] border border-[#E2E9E5] px-2.5 py-1 rounded-xl cursor-pointer hover:bg-[#F5F9F6] transition-colors">
          <span>This Week</span>
          <ChevronDown size={13} />
        </div>
      </div>

      {/* 4 Equal Columns */}
      <div className="grid grid-cols-4 gap-1 text-center divide-x divide-[#F0F4F1]">
        {impactMetrics.map((item) => (
          <div key={item.id} className="px-1">
            {renderIcon(item.iconType)}
            <span className="text-[10px] font-bold text-[#647474] block mb-0.5">{item.title}</span>
            <div className="text-[13px] font-bold text-[#102A2A] leading-tight mb-0.5">{item.value}</div>
            <span className="text-[10px] font-semibold text-[#087A45] block">{item.change}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
