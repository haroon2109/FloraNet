import React from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function FilterBar() {
  return (
    <div className="bg-white border border-[#E1E7E3] rounded-xl p-2 shadow-[0_2px_12px_rgba(20,60,40,0.04)] mb-6 mx-6 relative z-10 flex items-center justify-between flex-wrap gap-4">
      
      {/* Dropdowns */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <button className="flex items-center justify-between gap-4 bg-white border border-[#E1E7E3] px-3 py-2 rounded-lg text-[13px] font-medium text-[#102A20] hover:bg-[#F5F9F6] transition-colors shadow-sm shrink-0">
          All Recommendations <ChevronDown size={14} className="text-[#52645D]" />
        </button>
        <button className="flex items-center justify-between gap-4 bg-white border border-[#E1E7E3] px-3 py-2 rounded-lg text-[13px] font-medium text-[#102A20] hover:bg-[#F5F9F6] transition-colors shadow-sm shrink-0">
          All Fields <ChevronDown size={14} className="text-[#52645D]" />
        </button>
        <button className="flex items-center justify-between gap-4 bg-white border border-[#E1E7E3] px-3 py-2 rounded-lg text-[13px] font-medium text-[#102A20] hover:bg-[#F5F9F6] transition-colors shadow-sm shrink-0">
          All Crops <ChevronDown size={14} className="text-[#52645D]" />
        </button>
        <button className="flex items-center justify-between gap-4 bg-white border border-[#E1E7E3] px-3 py-2 rounded-lg text-[13px] font-medium text-[#102A20] hover:bg-[#F5F9F6] transition-colors shadow-sm shrink-0">
          All Categories <ChevronDown size={14} className="text-[#52645D]" />
        </button>
        <button className="flex items-center justify-between gap-4 bg-white border border-[#E1E7E3] px-3 py-2 rounded-lg text-[13px] font-medium text-[#102A20] hover:bg-[#F5F9F6] transition-colors shadow-sm shrink-0">
          All Priority <ChevronDown size={14} className="text-[#52645D]" />
        </button>
      </div>

      {/* Right Action */}
      <button className="flex items-center gap-2 bg-white border border-[#E1E7E3] px-4 py-2 rounded-lg text-[13px] font-medium text-[#102A20] shadow-sm hover:bg-[#F5F9F6] transition-colors shrink-0 ml-auto">
        <SlidersHorizontal size={14} /> Filter
      </button>

    </div>
  );
}
