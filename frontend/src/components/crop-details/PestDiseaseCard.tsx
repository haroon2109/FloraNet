"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Bug } from 'lucide-react';
import { cropDetailsPageData } from '@/data/cropDetailsData';

export default function PestDiseaseCard() {
  const { pestRisk, pestRiskDetail } = cropDetailsPageData;

  return (
    <div className="bg-white border border-[#E1E8E4] rounded-2xl p-4 shadow-[0_2px_12px_rgba(20,60,40,0.04)] flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <h3 className="text-[15px] font-bold text-[#102A2A]">Pests & Diseases</h3>
          <Link 
            href="/crops" 
            className="text-[12px] font-semibold text-[#087A45] hover:text-[#075B3A] transition-colors inline-flex items-center gap-1 group shrink-0"
          >
            View all 
            <span className="text-[13px] group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* Main Status */}
        <div className="p-3 rounded-xl bg-[#FAFCFA] border border-[#F0F4F1] flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#EAF6EE] text-[#087A45] flex items-center justify-center shrink-0 border border-[#C4E7D0]">
            <ShieldCheck size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#087A45] leading-tight">{pestRisk}</h4>
            <p className="text-[11px] text-[#617174] font-medium mt-0.5">{pestRiskDetail}</p>
          </div>
        </div>

        {/* Target Insect Row: Fall Armyworm */}
        <div className="p-2.5 rounded-xl border border-[#F0F4F1] bg-[#FAFCFA] flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#FEF7E0] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FCE8B2]">
            <Bug size={16} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h5 className="text-[12px] font-bold text-[#102A2A] leading-tight">Fall Armyworm</h5>
              <span className="px-1.5 py-0.2 bg-[#EEF7F0] text-[#087A45] border border-[#D5E6D8] rounded-full text-[9px] font-bold">
                Low Risk
              </span>
            </div>
            <p className="text-[10px] text-[#889B91] font-medium mt-0.5">Monitor in next 7 days</p>
          </div>
        </div>
      </div>

      {/* Button */}
      <button 
        type="button"
        className="w-full py-2 bg-white border border-[#087A45] hover:bg-[#EAF6EE] text-[#087A45] rounded-xl text-[12px] font-bold text-center transition-colors shadow-xs inline-flex items-center justify-center gap-1 cursor-pointer"
      >
        Check with Crop Doctor <span className="text-[13px]">→</span>
      </button>

    </div>
  );
}
