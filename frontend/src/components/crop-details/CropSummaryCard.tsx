"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Sparkles, Edit3 } from 'lucide-react';
import { useFarm } from '@/context/farmContext';

export default function CropSummaryCard() {
  const { userProfile, liveMetrics } = useFarm();
  const locationDisplay = userProfile.farmLocation || `${userProfile.farmName}, ${userProfile.country}`;

  // Crop identity comes from the farmer's own registration — no fabricated
  // sowing dates, varieties or health scores. Rows without registered data
  // render an explicit "not recorded" state.
  const cropName = userProfile.primaryCrop || 'Not set';
  const notRecorded = 'Not recorded';

  return (
    <div className="px-8 mb-6">
      <div className="bg-white border border-[#E1E8E4] rounded-2xl p-6 shadow-[0_2px_14px_rgba(20,60,40,0.04)] flex flex-col xl:flex-row gap-6 items-stretch">
        
        {/* Left Section: Crop Photo + Crop Metadata */}
        <div className="flex-1 flex flex-col md:flex-row gap-5 min-w-0 pr-0 xl:pr-6 xl:border-r border-[#F0F4F1]">
          
          {/* Maize Image */}
          <div className="relative w-full md:w-[150px] h-[150px] rounded-xl overflow-hidden shrink-0 border border-[#E1E8E4] shadow-xs">
            <Image 
              src="/images/home/field_1_maize.jpg"
              alt={cropName}
              fill
              className="object-cover"
              sizes="150px"
            />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-[24px] font-bold text-[#102A2A]">{cropName}</h2>
                <span className="px-2.5 py-0.5 bg-[#EAF6EE] text-[#087A45] border border-[#C4E7D0] rounded-full text-[11px] font-bold">
                  Registered Crop
                </span>
              </div>

              <div className="text-[13px] font-bold text-[#52645D] mb-1">
                {userProfile.farmName}
              </div>

              <div className="flex items-center gap-1.5 text-[12px] text-[#617174]">
                <MapPin size={14} className="text-[#889B91]" />
                <span>{locationDisplay}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F0F4F1] grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <span className="text-[10px] font-bold text-[#889B91] uppercase tracking-wider block">Land Holding</span>
                <span className="text-[13px] font-bold text-[#102A2A]">{userProfile.totalLandSize}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#889B91] uppercase tracking-wider block">Sowing Date</span>
                <span className="text-[13px] font-bold text-[#102A2A]">{notRecorded}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#889B91] uppercase tracking-wider block">Current Stage</span>
                <span className="text-[13px] font-bold text-[#102A2A]">{notRecorded}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#889B91] uppercase tracking-wider block">Crop Variety</span>
                <span className="text-[13px] font-bold text-[#102A2A]">{notRecorded}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="flex items-start">
            <button 
              type="button" 
              className="px-3 py-1.5 bg-[#F5F9F6] border border-[#E1E8E4] hover:bg-[#EAF6EE] text-[12px] font-bold text-[#102A2A] rounded-xl transition-colors shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Edit3 size={13} className="text-[#52645D]" />
              Edit Crop
            </button>
          </div>

        </div>

        {/* Middle Section: Live Soil Health (from backend /farm/metrics) */}
        <div className="w-full xl:w-[220px] shrink-0 flex flex-col items-center justify-center p-3 bg-[#FAFCFA] border border-[#F0F4F1] rounded-xl xl:border-r border-r-[#F0F4F1]">
          <span className="text-[12px] font-bold text-[#52645D] mb-2">Live Soil Health Score</span>
          
          {liveMetrics?.overall_health_score != null ? (
            <>
              <div className="relative w-20 h-20 rounded-full border-4 border-[#087A45] flex flex-col items-center justify-center bg-white shadow-xs mb-2">
                <span className="text-[22px] font-bold text-[#102A2A] leading-none">{Math.round(liveMetrics.overall_health_score)}</span>
                <span className="text-[9px] text-[#889B91] font-bold">/100</span>
              </div>
              <span className="text-[11px] font-semibold text-[#087A45] mt-0.5">SoilGrids SOC/pH + Open-Meteo</span>
            </>
          ) : (
            <div className="w-20 h-20 rounded-full border-4 border-[#E1E8E4] flex flex-col items-center justify-center bg-white shadow-xs mb-2">
              <span className="text-[18px] font-bold text-[#889B91] leading-none">—</span>
              <span className="text-[8px] text-[#889B91] font-bold">/100</span>
            </div>
          )}
        </div>

        {/* Right Section: AI Summary Box */}
        <div className="w-full xl:w-[280px] shrink-0 p-4 bg-[#F8FAF8] border border-[#E1E8E4] rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-[#087A45]">
              <Sparkles size={16} strokeWidth={2.2} />
              <h4 className="text-[13px] font-bold">AI Agronomist</h4>
            </div>

            <p className="text-[12px] text-[#52645D] leading-relaxed mb-4">
              Ask the live RAG engine for crop-specific guidance grounded in verified ICAR, Embrapa, ARC,
              CAAS and VNIIEA agronomy corpora. Answers are generated on demand — never pre-canned.
            </p>
          </div>

          <Link
            href="/ai-assistant"
            className="w-full py-2 bg-white border border-[#087A45] hover:bg-[#EAF6EE] text-[#087A45] rounded-xl text-[12px] font-bold text-center transition-colors shadow-xs inline-flex items-center justify-center gap-1"
          >
            Ask FloraNet AI <span className="text-[13px]">→</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
