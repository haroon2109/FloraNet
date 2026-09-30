"use client";

import React from 'react';
import Link from 'next/link';
import { Leaf, Droplets, ChartNoAxesColumn, Bug } from 'lucide-react';
import { aiAssistantPageData } from '@/data/aiAssistantData';
import { AIInsightItem } from '@/types/ai';

export default function AIInsights() {
  const { insights } = aiAssistantPageData;

  const renderIcon = (type: AIInsightItem['iconType']) => {
    switch (type) {
      case 'leaf':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
            <Leaf size={16} strokeWidth={2.2} />
          </div>
        );
      case 'droplet':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB]">
            <Droplets size={16} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 'chart':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <ChartNoAxesColumn size={16} strokeWidth={2.2} />
          </div>
        );
      case 'bug':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EAF5EC] text-[#168A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
            <Bug size={16} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const getBadgeStyle = (type: AIInsightItem['badgeType']) => {
    switch (type) {
      case 'high':
        return 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]';
      case 'medium':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
      case 'positive':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]';
      case 'low':
        return 'bg-[#EEF7F0] text-[#168A45] border-[#D5E6D8]';
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A20]">AI Insights for Your Farm</h3>
        <Link 
          href="/recommendations" 
          className="text-[12px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View all 
          <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* List */}
      <div className="space-y-3">
        {insights.map((item, idx) => (
          <div 
            key={item.id}
            className={`flex items-start gap-3 ${idx !== insights.length - 1 ? 'border-b border-[#F0F4F1] pb-3' : ''}`}
          >
            {renderIcon(item.iconType)}

            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-[#102A20] leading-snug mb-1.5">
                {item.text}
              </p>

              <span className={`inline-block px-2.5 py-0.2 rounded-full text-[10px] font-bold border tracking-wide ${getBadgeStyle(item.badgeType)}`}>
                {item.badgeText}
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
