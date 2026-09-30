"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { recommendationsPageData } from '@/data/recommendationsData';

export default function AISummary() {
  const { aiSummary } = recommendationsPageData;

  return (
    <div className="bg-white border border-[#E2E9E5] rounded-2xl p-4 shadow-[0_4px_18px_rgba(20,60,40,0.04)] mb-5">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <h3 className="text-[15px] font-bold text-[#102A2A]">AI Summary</h3>
        <Link 
          href="/reports" 
          className="text-[12px] font-semibold text-[#087A45] hover:text-[#075B3A] transition-colors inline-flex items-center gap-1 group shrink-0"
        >
          View full report 
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Pale Green Inner Box */}
      <div className="p-4 bg-[#EAF6EE] border border-[#C4E7D0] rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white text-[#087A45] flex items-center justify-center shrink-0 shadow-xs border border-[#C4E7D0] mt-0.5">
          <Sparkles size={16} strokeWidth={2.2} />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-bold text-[#087A45] leading-tight mb-1">
            {aiSummary.title}
          </h4>
          <p className="text-[12px] text-[#102A2A] leading-relaxed font-medium">
            {aiSummary.description}
          </p>
        </div>
      </div>

    </div>
  );
}
