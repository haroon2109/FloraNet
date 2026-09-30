"use client";

import React from 'react';
import Link from 'next/link';
import { Leaf, Shield, CloudRain } from 'lucide-react';
import { alertsPageData } from '@/data/alertsData';
import { AIAlertRecommendation } from '@/types/alerts';

export default function AIRecommendations() {
  const { recommendations } = alertsPageData;

  const renderIcon = (type: AIAlertRecommendation['iconType']) => {
    switch (type) {
      case 'leaf':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Leaf size={16} strokeWidth={2.2} />
          </div>
        );
      case 'shield':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <Shield size={16} strokeWidth={2.2} />
          </div>
        );
      case 'rain':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <CloudRain size={16} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const getBadgeStyle = (badgeType: AIAlertRecommendation['badgeType']) => {
    switch (badgeType) {
      case 'high':
        return 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]';
      case 'medium':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
      case 'low':
        return 'bg-[#EBF3FE] text-[#1A73E8] border-[#D0E2FB]';
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">AI Alert Recommendations</h3>
        <Link 
          href="/recommendations" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div 
            key={rec.id}
            className={`flex items-start gap-3 ${idx !== recommendations.length - 1 ? 'border-b border-[#F0F4F1] pb-3' : ''}`}
          >
            {renderIcon(rec.iconType)}

            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-bold text-[#102A20] leading-snug mb-0.5">
                {rec.title}
              </h4>
              <p className="text-[12px] text-[#52645D] leading-relaxed mb-2">
                {rec.description}
              </p>

              <span className={`inline-block px-2.5 py-0.2 rounded-full text-[10px] font-bold border tracking-wide ${getBadgeStyle(rec.badgeType)}`}>
                {rec.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
