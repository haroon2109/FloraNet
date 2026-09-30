"use client";

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const tabs = [
  'All Recommendations',
  'Irrigation',
  'Fertilizer',
  'Crop Care',
  'Pest & Disease',
  'Soil Health',
  'Harvest & Yield',
];

interface RecommendationTabsProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function RecommendationTabs({ activeTab = 'All Recommendations', onTabChange }: RecommendationTabsProps) {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-[#E2E9E5] pb-2">
      
      {/* Tabs Row */}
      <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar flex-1 w-full sm:w-auto">
        {tabs.map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              className={`pb-2.5 text-[14px] font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                isActive ? 'text-[#087A45]' : 'text-[#647474] hover:text-[#102A2A]'
              }`}
            >
              {tab}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#087A45] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Sort By Dropdown */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E2E9E5] rounded-xl text-[12px] font-bold text-[#102A2A] shadow-xs shrink-0 cursor-pointer hover:bg-[#F5F9F6] transition-colors">
        <span className="text-[#647474] font-medium">Sort by:</span>
        <span className="text-[#102A2A]">Priority</span>
        <ChevronDown size={14} className="text-[#647474]" />
      </div>

    </div>
  );
}
