"use client";

import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';

interface EmptyFilterStateProps {
  title?: string;
  description?: string;
  onReset?: () => void;
  resetLabel?: string;
}

export default function EmptyFilterState({
  title = "No matching records found",
  description = "We couldn't find any results matching your search or active filters. Try adjusting your query or resetting all criteria.",
  onReset,
  resetLabel = "Clear All Filters",
}: EmptyFilterStateProps) {
  return (
    <div className="bg-white rounded-3xl border border-[#E1E8E2] p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-2xs my-6">
      {/* Icon with soft emerald halo */}
      <div className="w-16 h-16 rounded-3xl bg-[#F0F7F2] border border-[#D5E8DA] flex items-center justify-center text-[#168A45] mb-4 shadow-xs">
        <SearchX size={28} strokeWidth={2} />
      </div>

      <h3 className="text-[17px] font-bold text-[#102A20] mb-1.5">
        {title}
      </h3>

      <p className="text-[13px] text-[#607469] leading-relaxed mb-6 max-w-sm">
        {description}
      </p>

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#075C32] hover:bg-[#054324] text-white text-[13px] font-bold rounded-xl shadow-xs transition-all hover:scale-105 cursor-pointer"
        >
          <RotateCcw size={15} />
          <span>{resetLabel}</span>
        </button>
      )}
    </div>
  );
}
