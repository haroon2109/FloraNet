"use client";

import React from 'react';
import { Droplets, Package, Bug, Sun, Info, ArrowRight, Eye } from 'lucide-react';
import { RecommendationItem } from '@/types/recommendations';
import { useFarm } from '@/context/farmContext';

interface RecommendationCardProps {
  recommendation: RecommendationItem;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const { priority, priorityText, title, description, iconType, field, meta1Label, meta1Value, meta2Label, meta2Value } = recommendation;
  const { focusFieldByName } = useFarm();

  const handleViewField = () => {
    focusFieldByName(field);
  };

  const renderIllustration = () => {
    switch (iconType) {
      case 'droplet':
        return (
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#EBF3FE] text-[#1A73E8] flex items-center justify-center shrink-0 border border-[#D0E2FB] shadow-xs">
            <Droplets size={34} strokeWidth={2.2} fill="#1A73E8" fillOpacity={0.2} />
          </div>
        );
      case 'urea':
        return (
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center shrink-0 border border-[#C4E7D0] shadow-xs">
            <Package size={34} strokeWidth={2.2} />
          </div>
        );
      case 'bug':
        return (
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2] shadow-xs">
            <Bug size={34} strokeWidth={2.2} />
          </div>
        );
      case 'sun':
        return (
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2] shadow-xs">
            <Sun size={34} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const getPriorityBadgeStyle = () => {
    switch (priority) {
      case 'high':
        return 'bg-[#FCE8E6] text-[#E84C3D] border-[#FAD2CF]';
      case 'medium':
        return 'bg-[#FEF7E0] text-[#D97706] border-[#FCE8B2]';
      case 'low':
        return 'bg-[#EAF6EE] text-[#087A45] border-[#C4E7D0]';
    }
  };

  return (
    <div className="bg-white border border-[#E2E9E5] rounded-2xl p-5 shadow-[0_4px_18px_rgba(20,60,40,0.04)] hover:shadow-[0_6px_22px_rgba(20,60,40,0.06)] transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        
        {/* Left Circular Illustration */}
        {renderIllustration()}

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* Top Row: Badge & Why This Link */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide ${getPriorityBadgeStyle()}`}>
              {priorityText}
            </span>

            <button 
              type="button" 
              className="text-[12px] font-semibold text-[#647474] hover:text-[#087A45] transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Why this?</span>
              <Info size={13} />
            </button>
          </div>

          {/* Title & Description */}
          <h3 className="text-[16px] font-bold text-[#102A2A] leading-tight mb-1">
            {title}
          </h3>
          <p className="text-[13px] text-[#647474] leading-relaxed mb-3">
            {description}
          </p>

          {/* Metadata Row */}
          <div className="pt-2.5 border-t border-[#F0F4F1] flex flex-wrap items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-[10px] font-bold text-[#889B91] uppercase tracking-wider block">Field</span>
                <span className="text-[13px] font-bold text-[#102A2A]">{field}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#889B91] uppercase tracking-wider block">{meta1Label}</span>
                <span className="text-[13px] font-bold text-[#102A2A]">{meta1Value}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#889B91] uppercase tracking-wider block">{meta2Label}</span>
                <span className="text-[13px] font-bold text-[#102A2A]">{meta2Value}</span>
              </div>
            </div>

            {/* Spatial 3D View Field Focus Button */}
            <button
              type="button"
              onClick={handleViewField}
              className="px-4 py-1.5 bg-white border border-[#087A45] hover:bg-[#EAF6EE] text-[12px] font-bold text-[#087A45] rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Eye size={14} />
              <span>View Field →</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
