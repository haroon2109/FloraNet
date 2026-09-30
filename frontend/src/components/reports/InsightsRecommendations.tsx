"use client";

import React from 'react';
import { TrendingUp, Droplets, IndianRupee, Leaf } from 'lucide-react';
import { reportsPageData } from '@/data/reportsData';
import { ReportInsight } from '@/types/reports';

export default function InsightsRecommendations() {
  const { insights } = reportsPageData;

  const renderIcon = (type: ReportInsight['iconType']) => {
    switch (type) {
      case 'trend':
        return <TrendingUp size={18} strokeWidth={2.2} />;
      case 'droplet':
        return <Droplets size={18} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />;
      case 'rupee':
        return <IndianRupee size={18} strokeWidth={2.2} />;
      case 'leaf':
        return <Leaf size={18} strokeWidth={2.2} />;
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6">
      
      {/* Header */}
      <h3 className="text-[16px] font-bold text-[#102A20] mb-3.5">Insights & Recommendations</h3>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {insights.map((item) => (
          <div 
            key={item.id}
            className="p-3.5 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl flex items-center gap-3 hover:border-[#E1E7E3] transition-colors"
          >
            <div className={`w-9 h-9 rounded-full ${item.iconBg} ${item.iconColor} flex items-center justify-center shrink-0`}>
              {renderIcon(item.iconType)}
            </div>

            <p className="text-[12px] font-semibold text-[#102A20] leading-snug">
              {item.text}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
