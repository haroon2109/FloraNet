import React from 'react';

const tabs = [
  'Overview',
  'Soil & Water',
  'Crop Health',
  'Weather Impact',
  'NDVI Map',
  'Irrigation',
  'Alerts & Logs'
];

export default function FieldTabs() {
  return (
    <div className="px-8 w-full max-w-[1600px] mx-auto mb-6">
      <div className="flex items-center gap-8 border-b border-[#E2E9E5] overflow-x-auto scrollbar-hide">
        {tabs.map((tab: any, idx: any) => (
          <button
            key={idx}
            className={`pb-3 text-[14px] font-semibold whitespace-nowrap transition-colors relative focus:outline-none ${
              idx === 0 
                ? 'text-[#087A45]' 
                : 'text-[#647474] hover:text-[#102A2A]'
            }`}
          >
            {tab}
            {idx === 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#087A45]"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
