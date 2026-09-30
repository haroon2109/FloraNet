"use client";

import React, { useState } from 'react';

const tabs = [
  'Overview',
  'Growth Timeline',
  'Soil & Water',
  'Nutrition',
  'Pests & Diseases',
  'Weather Impact',
  'Yield Prediction',
  'Recommendations',
];

export default function CropTabs() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="px-8 mb-6 border-b border-[#E1E8E4]">
      <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[14px] font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
                isActive ? 'text-[#087A45]' : 'text-[#617174] hover:text-[#102A2A]'
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
    </div>
  );
}
