"use client";

import React from 'react';
import Link from 'next/link';
import { Leaf, Droplet, Shield } from 'lucide-react';
import { dashboardData } from '@/data/dashboardData';
import { DashboardRecommendation } from '@/types/dashboard';

export default function RecommendationsPanel() {
  const { recommendations } = dashboardData;

  const renderIcon = (type: DashboardRecommendation['iconType']) => {
    switch (type) {
      case 'leaf':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Leaf size={17} strokeWidth={2.2} />
          </div>
        );
      case 'water':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Droplet size={17} strokeWidth={2.2} fill="#1A73E8" className="fill-[#1A73E8]/20" />
          </div>
        );
      case 'shield':
        return (
          <div className="w-9 h-9 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Shield size={17} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const getBadgeStyle = (badgeType: DashboardRecommendation['badgeType']) => {
    switch (badgeType) {
      case 'high':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#D5E6D8]';
      case 'recommended':
        return 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]';
      case 'preventive':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#D5E6D8]';
    }
  };

  return (
    <div className="mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">Top Recommendations</h3>
        <Link 
          href="/recommendations" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Recommendations List Container */}
      <div className="bg-white rounded-2xl border border-[#E1E8E2] shadow-[0_2px_12px_rgba(20,60,40,0.04)] p-4 space-y-3.5">
        {recommendations.map((rec, idx) => (
          <div 
            key={rec.id} 
            className={`flex items-start gap-3 ${idx !== recommendations.length - 1 ? 'border-b border-[#F0F4F1] pb-3.5' : ''}`}
          >
            {renderIcon(rec.iconType)}
            
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-[#102A20] leading-snug mb-0.5">
                {rec.title}
              </h4>
              <p className="text-[12px] text-[#52645D] leading-relaxed mb-2">
                {rec.description}
              </p>
              
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide ${getBadgeStyle(rec.badgeType)}`}>
                {rec.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
