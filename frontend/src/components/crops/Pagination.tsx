"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useFarm } from '@/context/farmContext';

export default function Pagination() {
  const { fields } = useFarm();

  return (
    <div className="flex items-center justify-between px-2 pt-1 pb-4">
      <span className="text-[12px] font-medium text-[#52645D]">
        {fields.length > 0
          ? `Showing 1 to ${fields.length} of ${fields.length} crops`
          : 'No crops registered yet'}
      </span>

      <div className="flex items-center gap-1.5">
        {fields.length > 0 && (
          <button 
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-[#168A45] text-white text-[12px] font-bold shadow-xs"
          >
            1
          </button>
        )}
        <button 
          type="button"
          aria-label="Next page"
          disabled={fields.length === 0}
          className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-[#E1E7E3] text-[#52645D] text-[12px] font-semibold hover:bg-[#F5F9F6] transition-colors disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
