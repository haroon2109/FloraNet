"use client";

import React from 'react';
import Link from 'next/link';
import { Sprout, Leaf, Wheat } from 'lucide-react';
import { dashboardData } from '@/data/dashboardData';
import { CropGrowthItem } from '@/types/dashboard';

export default function CropOverview() {
  const { cropGrowth } = dashboardData;

  const renderCropIcon = (type: CropGrowthItem['iconType']) => {
    switch (type) {
      case 'maize':
        return (
          <div className="w-10 h-10 rounded-full bg-[#EEF7F0] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Sprout size={20} strokeWidth={2.2} />
          </div>
        );
      case 'wheat':
        return (
          <div className="w-10 h-10 rounded-full bg-[#FEF7E0] text-[#B45309] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <Wheat size={20} strokeWidth={2.2} />
          </div>
        );
      case 'vegetables':
        return (
          <div className="w-10 h-10 rounded-full bg-[#EEF7F0] text-[#168A45] flex items-center justify-center shrink-0 border border-[#D5E6D8]">
            <Leaf size={20} strokeWidth={2.2} />
          </div>
        );
    }
  };

  const getBadgeStyle = (status: CropGrowthItem['status']) => {
    switch (status) {
      case 'Healthy':
        return 'bg-[#EAF5EC] text-[#168A45] border-[#C4E7D0]';
      case 'Watch':
        return 'bg-[#FEF7E0] text-[#B45309] border-[#FCE8B2]';
      case 'Needs Attention':
        return 'bg-[#FCE8E6] text-[#E84A3C] border-[#FAD2CF]';
    }
  };

  const getProgressColor = (status: CropGrowthItem['status']) => {
    switch (status) {
      case 'Healthy':
        return 'bg-[#168A45]';
      case 'Watch':
        return 'bg-[#F5A900]';
      case 'Needs Attention':
        return 'bg-[#E84A3C]';
    }
  };

  return (
    <div className="bg-white border border-[#E1E7E3] rounded-2xl p-5 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col h-[280px]">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#102A20]">Crop Growth Overview</h3>
        <Link 
          href="/crops" 
          className="text-[13px] font-semibold text-[#168A45] hover:text-[#075C32] transition-colors inline-flex items-center gap-1 group"
        >
          View all crops 
          <span className="text-[14px] group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* Crop Rows */}
      <div className="flex-1 flex flex-col justify-around">
        {cropGrowth.map((crop) => (
          <div key={crop.id} className="flex items-center gap-3.5">
            {renderCropIcon(crop.iconType)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[14px] font-bold text-[#102A20]">{crop.name}</h4>
                <span className="text-[12px] font-medium text-[#52645D]">{crop.fieldInfo}</span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2.5 bg-[#F0F5F1] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(crop.status)}`}
                  style={{ width: `${crop.progress}%` }}
                />
              </div>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide shrink-0 ${getBadgeStyle(crop.status)}`}>
              {crop.status}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
